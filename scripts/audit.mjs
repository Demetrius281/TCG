// Full audit: every page x every screen x every width x every state x every browser x every rule.  npm run audit
//   npm run audit              full audit, writes qa/audit/report.md, matrix.csv, results.json; exit 1 on any violation or coverage gap
//   npm run audit -- --prove   breaks each rule on purpose (last screen, last section, a middle section of every page) and shows it caught
// Env: AUDIT_BROWSERS=chromium,webkit (default both) · PW_CHANNEL=chrome uses the installed Chrome for chromium · AUDIT_QUICK=1 skips the 320-1600 sweep.
// Every expected value comes from qa/rules/rules.json; CLAUDE.md and tokens.css must agree with it (checked first).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium, webkit } from 'playwright';
import { measure, recount, mutate } from '../qa/rules/audit-dom.mjs';
import { measureE, runMotion, E_RULES } from '../qa/rules/audit-e.mjs';

const ROOT = process.cwd();
// AUDIT_DIST: audit another build (e.g. an older commit built elsewhere) with the same checks
const DIST = process.env.AUDIT_DIST ? path.resolve(process.env.AUDIT_DIST) : path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'qa/audit');
const R = JSON.parse(fs.readFileSync(path.join(ROOT, 'qa/rules/rules.json'), 'utf8'));
// E1-E6 (TASK 8) are added after the existing rules; they are measured by qa/rules/audit-e.mjs
const RULES = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'X', 'D', ...E_RULES];
const args = new Set(process.argv.slice(2));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

// ---------- 1. rules.json must agree with CLAUDE.md and tokens.css
function getPath(o, p) { return p.split('.').reduce((a, k) => a?.[k], o); }
function verifyRules() {
  const problems = [];
  const md = fs.readFileSync(path.join(ROOT, 'CLAUDE.md'), 'utf8');
  for (const { path: p, pattern } of R.sync.claudeMd) {
    const m = md.match(new RegExp(pattern));
    const v = getPath(R, p);
    if (!m) problems.push(`CLAUDE.md has no match for "${pattern}" (rules.json ${p} = ${v})`);
    else if (Number(m[1]) !== v) problems.push(`${p}: CLAUDE.md says ${m[1]}, rules.json says ${v}`);
  }
  if (!/A2\. \/platform only/.test(md)) problems.push('CLAUDE.md lacks variation A2');
  const css = fs.readFileSync(path.join(ROOT, 'src/styles/tokens.css'), 'utf8');
  const tok = (name) => { const m = css.match(new RegExp(`${name.replace(/[-]/g, '\\-')}:\\s*([^;]+);`)); return m ? m[1].trim() : null; };
  const rem = (s) => parseFloat(s) * 16;
  const clampAt = (s, w) => { const m = s.match(/clamp\(([\d.]+)rem,\s*([\d.]+)rem\s*\+\s*([\d.]+)vw,\s*([\d.]+)rem\)/); if (!m) return null; const [mn, a, b, mx] = m.slice(1).map(Number); return Math.min(mx * 16, Math.max(mn * 16, a * 16 + (b * w) / 100)); };
  for (const { token, path: p } of R.sync.tokens) {
    const s = tok(token); const spec = getPath(R, p);
    if (!s) { problems.push(`tokens.css has no ${token}`); continue; }
    for (const [w, key] of [[R.fluid.from, 'mobile'], [R.fluid.to, 'desktop']]) {
      const got = clampAt(s, w);
      if (got === null || Math.abs(got - spec[key]) > 0.05) problems.push(`${token} at ${w}px = ${got?.toFixed(2)}, rules.json ${p}.${key} = ${spec[key]}`);
    }
  }
  for (const { token, path: p } of R.sync.tokenPx) {
    const s = tok(token); const v = getPath(R, p);
    if (!s) { problems.push(`tokens.css has no ${token}`); continue; }
    if (Math.abs(rem(s) - v) > 0.05) problems.push(`${token} = ${rem(s)}px, rules.json ${p} = ${v}`);
  }
  const base = fs.readFileSync(path.join(ROOT, 'src/styles/base.css'), 'utf8');
  for (const [name, role] of Object.entries(R.roles)) {
    const cls = name === 'page-title' ? '\\.t-page-title, h1' : name === 'section-title' ? '\\.t-section-title, h2' : name === 'card-title' ? '\\.t-card-title, h3, h4' : `\\.t-${name}`;
    const m = base.match(new RegExp(`${cls}[^{]*\\{[^}]*font-weight:\\s*(\\d+|var\\(--[\\w-]+\\))`));
    if (!m) { problems.push(`base.css has no weight for role ${name}`); continue; }
    // the weight is a number or a token (var(--fw-medium)) defined in tokens.css
    const tokenCss = fs.readFileSync(path.join(ROOT, 'src/styles/tokens.css'), 'utf8');
    const resolved = m[1].startsWith('var(') ? Number((tokenCss.match(new RegExp(`${m[1].slice(4, -1)}\\s*:\\s*(\\d+)`)) ?? [])[1]) : Number(m[1]);
    if (resolved !== role.weight) problems.push(`role ${name}: base.css weight ${m[1]} = ${resolved}, rules.json ${role.weight}`);
  }
  return problems;
}

// ---------- 2. pages and server
function walk(d, out = []) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); e.isDirectory() ? walk(p, out) : out.push(p); } return out; }
function discover() {
  const files = walk(DIST).filter((f) => f.endsWith('.html')).map((f) => path.relative(DIST, f).split(path.sep).join('/'));
  const fragments = files.filter((f) => f.startsWith('illustrations/'));
  const pages = files.filter((f) => !fragments.includes(f)).map((f) => ({ file: f, route: '/' + f.replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '') })).map((p) => ({ ...p, route: p.route === '/' + '' ? '/' : p.route || '/' }));
  for (const p of pages) if (p.route === '') p.route = '/';
  const missing = [];
  if (!pages.some((p) => p.route === '/404')) missing.push('/404 (no 404.html in dist)');
  if (!pages.some((p) => p.route === '/styleguide')) missing.push('/styleguide');
  return { pages: pages.sort((a, b) => a.route.localeCompare(b.route)), fragments, missing };
}
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.txt': 'text/plain', '.json': 'application/json' };
function serve() {
  const s = http.createServer((req, res) => {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let f = path.join(DIST, p === '/' ? 'index.html' : p);
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = f.replace(/\/$/, '') + '.html';
    if (!fs.existsSync(f)) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] ?? 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise((r) => s.listen(0, () => r(s)));
}

const MEASURE = measure.toString(); const RECOUNT = recount.toString(); const MUTATE = mutate.toString();
const MEASURE_E = measureE.toString();
// E checks run on the same page in the same state; their violations and per-screen counts are merged into the result
const mergeE = (res, e) => {
  res.violations.push(...e.violations);
  for (const s of res.screens) { const es = e.screens.find((x) => x.index === s.index && x.name === s.name); for (const r of E_RULES) s.counts[r] = es ? es.counts[r] : { c: 0, v: 0 }; }
  res.counts.checkedPerRule = res.counts.checkedPerRule || {};
  for (const r of E_RULES) res.counts.checkedPerRule[r] = (res.counts.checkedPerRule[r] || 0) + e.checked[r];
  return res;
};
const runMeasureOnly = (page, ctx) => page.evaluate(`(${MEASURE})(${JSON.stringify(R)}, ${JSON.stringify(ctx)})`);
const runMeasure = async (page, ctx) => {
  const res = await runMeasureOnly(page, ctx);
  if (ctx.only && !ctx.only.some((r) => r.startsWith('E'))) return res;
  return mergeE(res, await page.evaluate(`(${MEASURE_E})(${JSON.stringify(R)}, ${JSON.stringify(ctx)})`));
};
const runRecount = (page) => page.evaluate(`(${RECOUNT})(${JSON.stringify(R)})`);

async function launch(name) {
  if (name === 'webkit') return webkit.launch();
  return chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
}

async function load(browser, base, route, vw, record) {
  const ctx = await browser.newContext({ viewport: { width: vw, height: 900 }, reducedMotion: 'reduce' });
  await ctx.route('**/*', (r) => (r.request().url().startsWith(base) ? r.continue() : r.abort()));
  const page = await ctx.newPage();
  page.on('request', (r) => { if (new URL(r.url()).pathname.startsWith('/illustrations/')) record.illustrationRequests.push(new URL(r.url()).pathname); });
  await page.goto(base + route, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(vw >= 768 ? 900 : 500);
  await page.evaluate(() => window.scrollTo(0, 0));
  return { ctx, page };
}

const FORCE = () => {
  // Simulates :hover / :focus on every element at once by duplicating every hover/focus rule under .__force.
  const add = [];
  const walkRules = (rules, parent) => {
    for (const r of rules) {
      if (r instanceof CSSStyleRule) {
        if (/:hover|:focus-visible|:focus-within|:focus\b/.test(r.selectorText)) add.push([parent, r.selectorText.replace(/:hover|:focus-visible|:focus-within|:focus\b/g, '.__force') + '{' + r.style.cssText.replace(/(^|;|\s)(transform|translate|rotate|scale)\s*:[^;]*;?/g, '$1') + '}']);
      } else if (r.cssRules) walkRules(r.cssRules, r);
    }
  };
  for (const sheet of document.styleSheets) { let rules; try { rules = sheet.cssRules; } catch { continue; } walkRules(rules, sheet); }
  for (const [parent, text] of add) { try { parent.insertRule(text, parent.cssRules.length); } catch { /* skip unsupported */ } }
  document.querySelectorAll('body *').forEach((e) => e.classList.add('__force'));
  return add.length;
};

// ---------- 3. one (browser, page, width): all states
async function runStates(browser, bname, base, pageInfo, vw, sink) {
  const rec = { illustrationRequests: [] };
  const evalState = async (page, state, extra = {}) => {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(120);
    const res = await runMeasure(page, { vw, state, path: pageInfo.route });
    const rc = await runRecount(page);
    sink.push({ browser: bname, page: pageInfo.route, width: vw, state, sweep: false, res, rc, ...extra });
  };
  const fresh = async () => load(browser, base, pageInfo.route, vw, rec);

  let { ctx, page } = await fresh();
  await evalState(page, 'default');
  await ctx.close();

  ({ ctx, page } = await fresh());
  const forced = await page.evaluate(`(${FORCE.toString()})()`);
  await page.waitForTimeout(250);
  await evalState(page, 'hover+focus', { note: `${forced} hover/focus rules duplicated` });
  await ctx.close();

  ({ ctx, page } = await fresh());
  const nd = await page.evaluate(() => { const d = [...document.querySelectorAll('details')]; d.forEach((x) => (x.open = true)); return d.length; });
  await page.waitForTimeout(150);
  await evalState(page, 'details-open', { note: `${nd} details opened` });
  await ctx.close();

  // header menus
  ({ ctx, page } = await fresh());
  if (vw >= R.breakpoints.desktop) {
    const n = await page.locator('header.header [data-dropdown] > button').count();
    for (let i = 0; i < n; i++) {
      const b = page.locator('header.header [data-dropdown] > button').nth(i);
      const name = (await b.textContent()).trim();
      await b.click({ force: true });
      await page.waitForTimeout(250);
      await evalState(page, `menu:${name}`);
    }
  } else {
    const tg = page.locator('header.header [data-menu-toggle]');
    if (await tg.count()) {
      await tg.click({ force: true });
      await page.waitForTimeout(350);
      await evalState(page, 'mobile-menu');
      const subs = page.locator('[data-mobile-menu] button[aria-controls]');
      for (let i = 0; i < (await subs.count()); i++) await subs.nth(i).click({ force: true });
      await page.waitForTimeout(250);
      await evalState(page, 'mobile-menu+submenus');
    }
  }
  await ctx.close();

  // forms
  if (pageInfo.route === '/platform' || pageInfo.route === '/styleguide') {
    ({ ctx, page } = await fresh());
    if (await page.locator('#ei-form').count()) {
      await page.locator('#ei-form button[type=submit]').click({ force: true });
      await page.waitForTimeout(300);
      await evalState(page, 'inquiry-error');
    }
    await ctx.close();
  }
  if (pageInfo.route === '/due-diligence' || pageInfo.route === '/styleguide') {
    ({ ctx, page } = await fresh());
    if (await page.locator('#pc-form').count()) {
      const visibleStep = () => page.evaluate(() => [...document.querySelectorAll('#pc-form [data-step]')].find((s) => !s.hidden)?.dataset.step ?? null);
      const forceStep = (n) => page.evaluate((n) => document.querySelectorAll('#pc-form [data-step]').forEach((s) => { s.hidden = s.dataset.step !== String(n); }), n);
      const stepNote = (n, got) => (String(got) === String(n) ? undefined : `step ${n} not reachable by automation: forced visible`);
      await evalState(page, 'order-step1');
      await page.locator('#pc-form [data-step="1"] [data-next]').click({ force: true });
      await page.waitForTimeout(250);
      await evalState(page, 'order-step1-error');
      for (const n of [2, 3, 4]) {
        const cur = await visibleStep();
        const prev = n - 1;
        if (String(cur) !== String(n)) {
          // fill the current step generically and go next
          for (const r of await page.locator(`#pc-form [data-step="${prev}"] input[type=radio]`).all()) { try { await r.check({ force: true }); } catch { /* ignore */ } break; }
          for (const i of await page.locator(`#pc-form [data-step="${prev}"] input[type=text], #pc-form [data-step="${prev}"] textarea`).all()) { try { await i.fill('Test 1', { timeout: 500 }); } catch { /* hidden */ } }
          if (n === 4) { const skip = page.locator('#pc-skip-docs'); if (await skip.count()) await skip.click({ force: true }); }
          else await page.locator(`#pc-form [data-step="${prev}"] [data-next]`).click({ force: true });
          await page.waitForTimeout(300);
        }
        let got = await visibleStep();
        const note = stepNote(n, got);
        if (note) { await forceStep(n); await page.waitForTimeout(100); }
        await evalState(page, `order-step${n}${note ? '(forced)' : ''}`, note ? { note } : {});
        if (n === 4) { await page.locator('#pc-pay').click({ force: true }); await page.waitForTimeout(300); await evalState(page, 'order-step4-error'); }
      }
      await page.evaluate(() => { document.querySelector('#pc-form')?.setAttribute('hidden', ''); document.querySelector('#pc-done')?.removeAttribute('hidden'); });
      await evalState(page, 'order-done(forced)', { note: 'confirmation needs a real submission: forced visible' });
    }
    await ctx.close();
  }
  if (vw < R.firstScreen.illustrationShownFrom && rec.illustrationRequests.length) {
    sink.push({ browser: bname, page: pageInfo.route, width: vw, state: 'requests', sweep: false, res: { screens: [], violations: [{ rule: 'R2', screen: '(network)', screenIndex: -1, kind: 'network', element: [...new Set(rec.illustrationRequests)].join(','), measured: 'illustration requested', required: 'illustrations never loaded below ' + R.firstScreen.illustrationShownFrom }], counts: { checkedPerRule: {} } }, rc: null });
  }
}

async function runSweep(browser, bname, base, pageInfo, sink) {
  const rec = { illustrationRequests: [] };
  const { ctx, page } = await load(browser, base, pageInfo.route, R.widths.sweep.to, rec);
  for (let w = R.widths.sweep.from; w <= R.widths.sweep.to; w += R.widths.sweep.step) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(220);
    const res = await runMeasure(page, { vw: w, state: 'default', path: pageInfo.route, sweep: true });
    sink.push({ browser: bname, page: pageInfo.route, width: w, state: 'sweep', sweep: true, res, rc: null });
  }
  await ctx.close();
}

// ---------- 4. aggregate + report
function aggregate(results, discovered) {
  const matrix = new Map(); // page|screenIndex|screen|width|state -> counts
  const vio = new Map(); // unique violation key -> {..., widths, states, browsers}
  const perRule = Object.fromEntries(RULES.map((r) => [r, 0]));
  const gaps = [];
  const recountRows = [];
  for (const r of results) {
    if (r.sweep) {
      for (const [k, v] of Object.entries(r.res.counts.checkedPerRule)) perRule[k] += v;
    } else for (const [k, v] of Object.entries(r.res.counts.checkedPerRule || {})) perRule[k] += v;
    if (!r.sweep) {
      for (const s of r.res.screens) {
        const key = `${r.page}|${s.index}|${s.name}|${r.width}|${r.state}`;
        const row = matrix.get(key) ?? { page: r.page, screen: s.name, kind: s.kind, index: s.index, width: r.width, state: r.state, appl: {}, cells: Object.fromEntries(RULES.map((x) => [x, { c: 0, v: 0 }])) };
        for (const x of RULES) { row.cells[x].c += s.counts[x].c; row.cells[x].v += s.counts[x].v; }
        for (const [k, n] of Object.entries(s.appl || {})) row.appl[k] = (row.appl[k] || 0) + n;
        matrix.set(key, row);
      }
    }
    for (const v of r.res.violations) {
      const k = `${r.page}|${v.screen}|${v.element}|${v.rule}|${v.measured}|${v.required}`;
      const e = vio.get(k) ?? { page: r.page, screen: v.screen, screenIndex: v.screenIndex, element: v.element, rule: v.rule, measured: v.measured, required: v.required, widths: new Set(), states: new Set(), browsers: new Set() };
      e.widths.add(r.width); e.states.add(r.state); e.browsers.add(r.browser);
      vio.set(k, e);
    }
    if (r.rc && !r.sweep) {
      const m = r.res.counts;
      const rowRec = { page: r.page, width: r.width, state: r.state, browser: r.browser, screensMeasured: m.screens, screensRecount: r.rc.screens, textMeasured: m.textNodes, textRecount: r.rc.textNodes, excluded: r.rc.excludedTextNodes };
      recountRows.push(rowRec);
      const A = r.rc.applicable;
      for (const [name, a, b] of [['R7 grids', m.grids, A.R7], ['R8 buttons', m.btns, A.R8], ['R9 list items', m.lis, A.R9li], ['R9 lists', m.uls, A.R9list], ['R6 headings', m.h12, A.R6]]) if (a !== b) gaps.push(`${name}: ${r.page} ${r.width} ${r.state} ${r.browser}: audit checked ${a}, recount found ${b}`);
      if (m.screens !== r.rc.screens) gaps.push(`screens: ${r.page} ${r.width} ${r.state} ${r.browser}: audit visited ${m.screens}, recount found ${r.rc.screens}`);
      if (m.textNodes !== r.rc.textNodes) gaps.push(`text nodes: ${r.page} ${r.width} ${r.state} ${r.browser}: audit checked ${m.textNodes} (+${r.rc.excludedTextNodes} excluded), recount found ${r.rc.textNodes}`);
    }
  }
  return { matrix, vio, perRule, gaps, recountRows };
}

function writeReport({ results, discovered, agg, problems, startedAt, browsers }) {
  fs.mkdirSync(OUT, { recursive: true });
  const rows = [...agg.matrix.values()].sort((a, b) => a.page.localeCompare(b.page) || a.index - b.index || a.width - b.width || a.state.localeCompare(b.state));
  // coverage gaps: a cell with 0 checked where the screen has the elements of that rule
  const gapCells = [];
  const needs = { R1: 'blk', R3: 'text', R6: 'width', R7: 'grid', R8: 'btn', R9: 'li' };
  for (const row of rows) {
    for (const [x, k] of Object.entries(needs)) {
      if (row.cells[x].c === 0 && (row.appl[k] || 0) > 0) gapCells.push(`${row.page} | ${row.screen} | ${row.width} | ${row.state} | ${x}`);
    }
    if (row.kind === 'section' && row.cells.R5.c === 0 && (row.appl.text || 0) > 0) gapCells.push(`${row.page} | ${row.screen} | ${row.width} | ${row.state} | R5`);
  }
  const violations = [...agg.vio.values()];
  const sumPerRule = agg.perRule;
  const pagesN = discovered.pages.length;
  const screensSet = new Set(rows.filter((r) => r.state === 'default' && r.width === R.widths.full[0]).map((r) => `${r.page}|${r.index}`));
  const statesSet = new Set(rows.map((r) => r.state.replace(/^menu:.*/, 'menu:*')));
  const gaps = [...agg.gaps, ...gapCells.map((g) => `empty cell: ${g}`), ...discovered.missing.map((m) => `page missing: ${m}`)];
  const sweepN = Math.floor((R.widths.sweep.to - R.widths.sweep.from) / R.widths.sweep.step) + 1;
  const totalText = agg.recountRows.reduce((n, r) => n + r.textRecount, 0);
  const totalMeasured = agg.recountRows.reduce((n, r) => n + r.textMeasured, 0);
  const totalExcl = agg.recountRows.reduce((n, r) => n + r.excluded, 0);
  const totalScrM = agg.recountRows.reduce((n, r) => n + r.screensMeasured, 0);
  const totalScrR = agg.recountRows.reduce((n, r) => n + r.screensRecount, 0);
  const coverageLine = `COVERAGE: ${pagesN} pages x ${screensSet.size} screens (header, sections, footer) x ${R.widths.full.length} full widths (${R.widths.full.join('/')}) + ${sweepN} sweep widths (${R.widths.sweep.from}-${R.widths.sweep.to} step ${R.widths.sweep.step}) x ${statesSet.size} state kinds x ${browsers.length} browsers (${browsers.join(', ')}); ` +
    `elements checked per rule: ${RULES.map((r) => `${r}=${sumPerRule[r]}`).join(' ')}; ` +
    `recount: screens ${totalScrM}=${totalScrR} ${totalScrM === totalScrR ? 'MATCH' : 'MISMATCH'}, visible text nodes ${totalMeasured}+${totalExcl} excluded=${totalMeasured + totalExcl} vs ${totalText + totalExcl} ${totalMeasured === totalText ? 'MATCH' : 'MISMATCH'}; ` +
    `violations (unique): ${violations.length}; coverage gaps: ${gaps.length}`;

  // matrix csv
  const csv = ['page,screen,width,state,' + RULES.map((x) => `${x}_checked,${x}_violations`).join(',')];
  for (const r of rows) csv.push([r.page, JSON.stringify(r.screen), r.width, r.state, ...RULES.flatMap((x) => [r.cells[x].c, r.cells[x].v])].join(','));
  fs.writeFileSync(path.join(OUT, 'matrix.csv'), csv.join('\n') + '\n');
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify({ coverageLine, violations: violations.map((v) => ({ ...v, widths: [...v.widths], states: [...v.states], browsers: [...v.browsers] })), gaps, recount: agg.recountRows, notes: results.filter((r) => r.note).map((r) => ({ page: r.page, width: r.width, state: r.state, browser: r.browser, note: r.note })) }, null, 1));

  const md = [];
  md.push('# Audit report', '', `Generated ${new Date().toISOString()} · run time ${Math.round((Date.now() - startedAt) / 60000)} min · built site from dist`, '');
  md.push('## a) COVERAGE', '', '```', coverageLine, '```', '');
  md.push(`Pages found automatically in dist: ${discovered.pages.map((p) => p.route).join(', ')}.`);
  md.push(`Not pages (excluded, listed for approval): ${discovered.fragments.map((f) => 'dist/' + f).join(', ')} are illustration fragments loaded into hero illustration hosts, not documents.`);
  if (discovered.missing.length) md.push(`Missing: ${discovered.missing.join('; ')}.`);
  md.push(`Excluded content: \`${R.exclusions.selector}\` — ${R.exclusions.note}`, `Second exclusion, for approval: ${R.exclusions.r1Note}`, '');
  md.push('Rules/CLAUDE.md/tokens.css sync: ' + (problems.length ? 'FAILED' : 'OK'), '');
  if (problems.length) md.push(...problems.map((p) => `- ${p}`), '');
  md.push('Elements checked per rule (sum over every page, width, state and browser, sweep included):', '');
  md.push('| ' + RULES.join(' | ') + ' |', '|' + RULES.map(() => '---').join('|') + '|', '| ' + RULES.map((r) => sumPerRule[r]).join(' | ') + ' |', '');
  md.push('Recount (independent traversal) per run is in results.json (`recount`); totals above. Coverage gaps:', '');
  md.push(gaps.length ? gaps.map((g) => `- ${g}`).join('\n') : '- none', '');
  const notes = results.filter((r) => r.note && !/hover\/focus|details opened/.test(r.note));
  if (notes.length) { md.push('State notes (steps that automation could not reach and were forced visible):', '', ...[...new Set(notes.map((n) => `- ${n.page} @${n.width} ${n.browser} ${n.state}: ${n.note}`))].slice(0, 40), ''); }

  md.push('## c) Violations', '', `${violations.length} unique violations (same page, screen, element, rule, measured and required value merged; the widths, states and browsers where each occurs are listed). Raw data: qa/audit/results.json.`, '');
  const byRule = {};
  for (const v of violations) byRule[v.rule] = (byRule[v.rule] || 0) + 1;
  md.push('Per rule: ' + RULES.map((r) => `${r}=${byRule[r] || 0}`).join(' · '), '');
  const byPage = new Map();
  for (const v of violations) { if (!byPage.has(v.page)) byPage.set(v.page, new Map()); const m = byPage.get(v.page); if (!m.has(v.screen)) m.set(v.screen, []); m.get(v.screen).push(v); }
  const compact = (set) => { const a = [...set].sort((x, y) => (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y)))); return a.length > 8 ? `${a.slice(0, 8).join(',')}… (${a.length})` : a.join(','); };
  for (const [pg, scr] of [...byPage.entries()].sort()) {
    md.push(`### ${pg}`, '');
    for (const [s, list] of scr) {
      md.push(`**Screen: ${s}** (${list.length})`, '', '| rule | element | measured | required | widths | states | browsers |', '|---|---|---|---|---|---|---|');
      for (const v of list.sort((a, b) => a.rule.localeCompare(b.rule))) md.push(`| ${v.rule} | ${v.element.replace(/\|/g, '/')} | ${v.measured.replace(/\|/g, '/')} | ${v.required.replace(/\|/g, '/')} | ${compact(v.widths)} | ${compact(v.states)} | ${[...v.browsers].join(',')} |`);
      md.push('');
    }
  }
  md.push('## b) Coverage matrix', '', 'One row per page x screen x width x state; each cell is `elements checked / violations` summed over browsers; `-` = rule has nothing to check on that screen. Also in qa/audit/matrix.csv.', '');
  md.push('<details><summary>Matrix (' + rows.length + ' rows)</summary>', '', '| page | screen | width | state | ' + RULES.join(' | ') + ' |', '|---|---|---|---|' + RULES.map(() => '---').join('|') + '|');
  for (const r of rows) md.push(`| ${r.page} | ${r.screen.replace(/\|/g, '/')} | ${r.width} | ${r.state} | ${RULES.map((x) => (r.cells[x].c === 0 ? '-' : `${r.cells[x].c}/${r.cells[x].v}`)).join(' | ')} |`);
  md.push('', '</details>', '');
  // d) proof: written by `npm run audit -- --prove`; embedded when present
  const proofFile = path.join(OUT, 'proof.md');
  if (fs.existsSync(proofFile)) md.push('', '## d) Proof', '', fs.readFileSync(proofFile, 'utf8').replace(/^# .*\n/, '').trim(), '');
  fs.writeFileSync(path.join(OUT, 'report.md'), md.join('\n'));
  return { coverageLine, violations, gaps };
}

// ---------- 5. proof mode
async function prove(base, discovered) {
  const browser = await launch('chromium');
  const rows = [];
  for (const p of discovered.pages) {
    for (const rule of [...RULES.filter((r) => r !== 'D' && !E_RULES.includes(r)), 'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9']) {
      for (const kind of ['last', 'last-section', 'middle']) {
        if (kind === 'last-section' && false) continue;
        const rec = { illustrationRequests: [] };
        const { ctx, page } = await load(browser, base, p.route, 1280, rec);
        const info = await page.evaluate(`(${MUTATE})(${JSON.stringify(rule)}, ${JSON.stringify(kind)}, 'info')`);
        await page.evaluate(`(${MUTATE})(${JSON.stringify(rule)}, ${JSON.stringify(kind)})`);
        await page.waitForTimeout(150);
        const res = await runMeasure(page, { vw: 1280, state: 'default', path: p.route, only: [rule.startsWith('D') ? 'D' : rule] });
        const hit = res.violations.filter((v) => (rule.startsWith('D') ? v.rule === 'D' && v.measured.startsWith(rule + ' ') : v.rule === rule) && v.screenIndex === info.index);
        // R5 does not apply to the footer; /404 has one screen only, so an extra h1 there is the first screen's h1 (R2 cannot be broken outside it).
        const sectionOnly = ((rule === 'R5' || rule === 'D5') && kind === 'last') || (rule === 'R2' && kind !== 'last' && p.route === '/404');
        rows.push({ page: p.route, rule, target: kind, screen: info.name, caught: hit.length > 0, na: sectionOnly, detail: hit[0] ? `${hit[0].measured} (required ${hit[0].required})` : sectionOnly ? 'not applicable here (R5: sections only, see last-section; R2 on /404: one screen only)' : 'NOT CAUGHT' });
        await ctx.close();
      }
    }
    log('proof', p.route);
  }
  await browser.close();
  const out = ['# Proof that each rule catches', '', 'Each rule is broken on purpose by injecting a violating element (or style) into the built page at 1280px, on the LAST screen (footer), the last section, and a middle section of every page; the audit must report that rule on that exact screen. The source is not touched, so there is nothing to restore.', '', '| page | rule | target | screen | result | detail |', '|---|---|---|---|---|---|'];
  for (const r of rows) out.push(`| ${r.page} | ${r.rule} | ${r.target} | ${r.screen.replace(/\|/g, '/')} | ${r.na ? 'n/a' : r.caught ? 'CAUGHT' : 'NOT CAUGHT'} | ${r.detail.replace(/\|/g, '/')} |`);
  const miss = rows.filter((r) => !r.caught && !r.na);
  out.push('', `Caught ${rows.filter((r) => r.caught).length} of ${rows.filter((r) => !r.na).length}; not applicable ${rows.filter((r) => r.na).length}; NOT CAUGHT ${miss.length}.`);
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'proof.md'), out.join('\n') + '\n');
  console.log(out.slice(-1)[0]);
  if (miss.length) { console.error(miss.map((m) => `${m.page} ${m.rule} ${m.target}`).join('\n')); process.exit(1); }
}

// ---------- main
const startedAt = Date.now();
const problems = verifyRules();
if (problems.length) { console.error('RULES OUT OF SYNC:\n' + problems.map((p) => '  ' + p).join('\n')); }
const discovered = discover();
if (process.env.AUDIT_PAGES) discovered.pages = discovered.pages.filter((p) => process.env.AUDIT_PAGES.split(',').includes(p.route));
const server = await serve();
const base = `http://localhost:${server.address().port}`;
if (args.has('--prove')) { await prove(base, discovered); server.close(); process.exit(0); }

const browsers = (process.env.AUDIT_BROWSERS || 'chromium,webkit').split(',');
const motionRoutes = discovered.pages.map((p) => p.route).filter((r) => r === '/' || r === '/platform');

// --e-only: the TASK 8 checks alone (E3-E6 on every page at the full widths, E1/E2/E5 motion), one summary per check
if (args.has('--e-only')) {
  // AUDIT_WIDTHS=375,1280 limits this mode to those widths (the full audit always uses rules.json widths)
  const eWidths = process.env.AUDIT_WIDTHS ? process.env.AUDIT_WIDTHS.split(',').map(Number) : R.widths.full;
  const rows = [];
  for (const bname of browsers) {
    const browser = await launch(bname);
    for (const p of discovered.pages) for (const w of eWidths) {
      const { ctx, page } = await load(browser, base, p.route, w, { illustrationRequests: [] });
      const e = await page.evaluate(`(${MEASURE_E})(${JSON.stringify(R)}, ${JSON.stringify({ vw: w, state: 'default', path: p.route })})`);
      rows.push({ browser: bname, page: p.route, width: w, state: 'default', res: { violations: e.violations, counts: { checkedPerRule: e.checked } } });
      await ctx.close();
    }
    await browser.close();
  }
  rows.push(...await runMotion({ launch, browsers, base, routes: motionRoutes, R, widths: eWidths, log }));
  server.close();
  console.log(`\nE checks on ${DIST}`);
  let bad = 0;
  for (const r of E_RULES) {
    const checked = rows.reduce((n, x) => n + (x.res.counts.checkedPerRule[r] || 0), 0);
    const v = rows.flatMap((x) => x.res.violations.filter((y) => y.rule === r).map((y) => ({ ...y, page: x.page, width: x.width, state: x.state, browser: x.browser })));
    const uniq = new Map(); for (const y of v) { const k = `${y.page}|${y.screen}|${y.element}|${y.measured}`; if (!uniq.has(k)) uniq.set(k, y); }
    const pages = [...new Set(v.map((y) => y.page))];
    bad += uniq.size;
    console.log(`${r}: ${uniq.size ? 'FAIL' : 'PASS'} · checked ${checked} · violations ${uniq.size}${pages.length ? ' · pages ' + pages.join(', ') : ''}`);
    for (const y of [...uniq.values()].slice(0, 6)) console.log(`   ${y.page} @${y.width} ${y.browser} ${y.state} | ${y.screen.slice(0, 40)} | ${y.element} | ${y.measured.slice(0, 110)} | required: ${y.required.slice(0, 70)}`);
    if (uniq.size > 6) console.log(`   … ${uniq.size - 6} more`);
  }
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'e-only.json'), JSON.stringify({ dist: DIST, rows: rows.map((x) => ({ page: x.page, width: x.width, state: x.state, browser: x.browser, violations: x.res.violations, checked: x.res.counts.checkedPerRule })) }, null, 1));
  process.exit(bad ? 1 : 0);
}

const results = [];
await Promise.all(browsers.map(async (bname) => {
  const browser = await launch(bname);
  for (const p of discovered.pages) {
    for (const w of R.widths.full) { await runStates(browser, bname, base, p, w, results); }
    if (!process.env.AUDIT_QUICK) await runSweep(browser, bname, base, p, results);
    log(bname, p.route, 'done');
  }
  await browser.close();
}));
// E1, E2 and the carousel after autoplay (E5): real motion, so outside the reduced-motion state runs above
if (!process.env.AUDIT_NO_MOTION && motionRoutes.length) results.push(...await runMotion({ launch, browsers, base, routes: motionRoutes, R, widths: R.widths.full, log }));
server.close();
const agg = aggregate(results, discovered);
const { coverageLine, violations, gaps } = writeReport({ results, discovered, agg, problems, startedAt, browsers });
console.log('\n' + coverageLine);
const fail = violations.length > 0 || gaps.length > 0 || problems.length > 0;
console.log(fail ? `AUDIT FAILED: ${violations.length} violations, ${gaps.length} coverage gaps, ${problems.length} rules sync problems. See qa/audit/report.md` : 'AUDIT PASSED');
process.exit(fail ? 1 : 0);
