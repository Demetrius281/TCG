// Measured layout check (CLAUDE.md rules 1-8). Run after `npm run build`: npm run check:layout
// Serves dist/ itself, opens every page at 375 and 1280px and compares computed values with the rules.
// Known failures of pages that are not migrated yet live in qa/baseline/layout.json; /styleguide has none.
// Env: PW_CHANNEL=chrome uses the installed Chrome instead of the Playwright chromium build.
//      WRITE_BASELINE=1 writes qa/baseline/layout.json (only when the file does not exist).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = path.resolve('dist');
const PAGES = ['/', '/due-diligence', '/regulations', '/platform', '/styleguide'];
const VIEWPORTS = [375, 1280];
const BASELINE = path.resolve('qa/baseline/layout.json');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.txt': 'text/plain' };

function serve() {
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = path.join(ROOT, p === '/' ? 'index.html' : p);
    if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = file.replace(/\/$/, '') + '.html';
    if (!fs.existsSync(file)) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((r) => server.listen(0, () => r(server)));
}

// Measured inside the page. Returns a list of { rule, desc, measured, expected }.
function measure(vp) {
  const desktop = vp >= 1024;
  const tol = 1.25;
  const out = [];
  const fail = (rule, el, measured, expected) => {
    const cls = (el.getAttribute?.('class') || '').split(/\s+/).filter(Boolean).slice(0, 2).join('.');
    const text = (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 28);
    out.push({ rule, desc: `${el.tagName.toLowerCase()}${cls ? '.' + cls : ''} "${text}"`, measured, expected });
  };
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none' && !el.closest('[hidden]');
  };
  const near = (a, b, t = tol) => Math.abs(a - b) <= t;
  const main = document.querySelector('main');
  const containerLeft = (innerWidth - Math.min(innerWidth - 2 * (desktop ? 40 : 20), 1200)) / 2;
  const gutter = desktop ? 40 : 20;

  // Rule 2: header size, header bottom -> first element
  const header = document.querySelector('header');
  const hb = header.getBoundingClientRect();
  if (!near(hb.height, desktop ? 76 : 56, 1.5)) fail('2-header-height', header, hb.height, desktop ? 76 : 56);
  const sections = [...main.querySelectorAll(':scope > section')].filter(visible);
  const first = sections[0];
  if (first) {
    const inner = first.querySelector(':scope > .inner');
    const fe = inner?.firstElementChild;
    if (fe) {
      const d = fe.getBoundingClientRect().top - hb.bottom;
      if (!near(d, desktop ? 80 : 48, 1.5)) fail('2-page-top', first, Math.round(d * 10) / 10, desktop ? 80 : 48);
    }
  }

  // Rule 5: section padding, tones
  sections.forEach((s, i) => {
    const cs = getComputedStyle(s);
    const exp = desktop ? 112 : 56;
    const pb = parseFloat(cs.paddingBottom);
    const pt = parseFloat(cs.paddingTop);
    if (!near(pb, exp, 1.5)) fail('5-section-padding-bottom', s, pb, exp);
    if (i > 0 && !near(pt, exp, 1.5)) fail('5-section-padding-top', s, pt, exp);
    const tone = s.className.match(/tone-(\w+)/)?.[1];
    if (!['default', 'sunken', 'inverse'].includes(tone)) fail('5-tone', s, tone, 'default|sunken|inverse');
    const prev = sections[i - 1];
    if (prev && tone === 'inverse' && prev.classList.contains('tone-inverse')) fail('C-adjacent-inverse', s, 'inverse after inverse', 'never');
  });

  // Rule 3: font sizes
  const allowed = desktop ? [60, 48, 40, 24, 18, 20, 17, 15, 13, 12, 72] : [36, 32, 28, 20, 17, 18, 16, 14, 13, 12, 48];
  const roleSize = { H2: desktop ? 40 : 28, H3: desktop ? 24 : 20, H4: desktop ? 18 : 17 };
  const seenSize = new Set();
  main.querySelectorAll('*').forEach((el) => {
    if (el.closest('svg') || ['SCRIPT', 'STYLE'].includes(el.tagName)) return;
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!hasText || !visible(el)) return;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    const ok = allowed.some((a) => near(fs, a, 0.6));
    if (!ok) { const k = `${el.tagName}.${el.className}.${Math.round(fs * 10)}`; if (!seenSize.has(k)) { seenSize.add(k); fail('3-font-size', el, fs, allowed.join('/')); } }
    const want = el.tagName === 'H2' ? roleSize.H2 : 0;
    if (want && !near(fs, want, 0.6)) fail('3-heading-role', el, fs, want);
  });
  main.querySelectorAll('h1').forEach((el) => {
    if (!visible(el)) return;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    const okSizes = desktop ? [48, 60] : [32, 36];
    if (!okSizes.some((a) => near(fs, a, 0.6))) fail('3-h1', el, fs, okSizes.join('/'));
    // Rule 6: hero H1 max 900
    if (el.getBoundingClientRect().width > 900.5) fail('6-h1-width', el, el.getBoundingClientRect().width, 900);
  });

  // Rule 1: headings and leads start at the container's left edge
  const edgeEls = [...main.querySelectorAll('h1, h2, header.head > *, .t-lead')].filter(visible);
  edgeEls.forEach((el) => {
    if (el.closest('li, .card, figure, table, form, blockquote, .panel, .layout-split > .body, .layout-article > .body')) return;
    const x = el.getBoundingClientRect().left;
    if (!near(x, containerLeft)) fail('1-left-edge', el, Math.round(x * 10) / 10, containerLeft);
  });
  if (document.documentElement.scrollWidth > innerWidth + 1) fail('1-horizontal-scroll', document.body, document.documentElement.scrollWidth, innerWidth);

  // Rule 4: text spacing
  const gap = (a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().bottom;
  main.querySelectorAll('h1, h2').forEach((h) => {
    if (!visible(h) || h.closest('li, .card, .panel')) return;
    const prev = h.previousElementSibling;
    if (prev && prev.classList.contains('t-label') && visible(prev) && !near(gap(prev, h), 16)) fail('4-label-title', h, Math.round(gap(prev, h)), 16);
    const next = h.nextElementSibling;
    if (next && next.classList.contains('t-lead') && visible(next) && !near(gap(h, next), 16)) fail('4-title-lead', h, Math.round(gap(h, next)), 16);
  });
  // lead -> buttons (the buttons follow the lead, or the head that holds it)
  main.querySelectorAll('.t-lead').forEach((lead) => {
    if (!visible(lead) || lead.closest('li, .card, .panel')) return;
    const after = lead.nextElementSibling ?? (lead.parentElement.classList.contains('head') ? lead.parentElement.nextElementSibling : null);
    if (after && (after.classList.contains('btn') || after.querySelector?.('.btn:not(.btn-text)')) && visible(after)) {
      const g = after.getBoundingClientRect().top - lead.getBoundingClientRect().bottom;
      if (!near(g, 32)) fail('4-lead-buttons', lead, Math.round(g), 32);
    }
  });
  main.querySelectorAll('header.head').forEach((hd) => {
    if (!visible(hd)) return;
    const next = hd.nextElementSibling;
    if (!next || !visible(next) || next.getBoundingClientRect().top < hd.getBoundingClientRect().bottom - 1) return;
    const exp = hd.classList.contains('next-actions') ? 32 : 40;
    const g = gap(hd, next);
    if (!near(g, exp)) fail('4-head-content', hd, Math.round(g), exp);
  });
  main.querySelectorAll('.card').forEach((c) => {
    if (!visible(c)) return;
    const cs = getComputedStyle(c);
    const pads = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map(parseFloat);
    if (!pads.every((p) => near(p, 24))) fail('7-card-padding', c, pads.join('/'), 24);
    const t = c.querySelector(':scope > h3');
    const tx = t?.nextElementSibling;
    if (t && tx && !near(gap(t, tx), 12)) fail('4-card-title-text', c, Math.round(gap(t, tx)), 12);
  });
  // between buttons
  main.querySelectorAll('.btn:not(.btn-text)').forEach((b) => {
    const n = b.nextElementSibling;
    if (!n || !n.classList.contains('btn') || !visible(b) || !visible(n)) return;
    const a = b.getBoundingClientRect();
    const c = n.getBoundingClientRect();
    const g = Math.max(c.left - a.right, c.top - a.bottom);
    const exp = desktop ? 16 : 12;
    if (!near(g, exp)) fail('4-button-gap', b, Math.round(g), exp);
  });

  // Rule 6: text widths (h2, lead and paragraphs outside tables, cards, forms)
  main.querySelectorAll('h2, .t-lead, p').forEach((el) => {
    if (!visible(el) || el.closest('li, .card, figure, table, form, dl, fieldset, blockquote, aside, .panel, .metrics, .btn') || el.classList.contains('t-label')) return;
    const w = el.getBoundingClientRect().width;
    if (w > 720.5) fail('6-text-width', el, Math.round(w), 720);
  });

  // Rule 7: grid gap and columns
  main.querySelectorAll('.grid, [class*="cols-"]').forEach((g) => {
    const cs = getComputedStyle(g);
    if (cs.display !== 'grid' || !visible(g)) return;
    const exp = desktop ? 32 : 16;
    const cg = parseFloat(cs.columnGap);
    const rg = parseFloat(cs.rowGap);
    if (!near(cg, exp) || !near(rg, exp)) fail('7-grid-gap', g, `${cg}/${rg}`, exp);
    const cols = cs.gridTemplateColumns.split(' ').length;
    const m = g.className.match(/cols-(\d)/);
    const want = vp < 768 ? 1 : desktop ? Number(m?.[1] ?? cols) : Math.min(2, Number(m?.[1] ?? cols));
    if (m && cols !== want) fail('7-grid-columns', g, cols, want);
  });

  // Rule 8: buttons
  main.querySelectorAll('.btn:not(.btn-text)').forEach((b) => {
    if (!visible(b)) return;
    const r = b.getBoundingClientRect();
    if (!near(r.height, 52, 0.75)) fail('8-button-height', b, Math.round(r.height * 10) / 10, 52);
    const radius = parseFloat(getComputedStyle(b).borderTopLeftRadius);
    if (radius !== 0) fail('8-button-radius', b, radius, 0);
    const parentW = b.parentElement.getBoundingClientRect().width;
    if (!desktop && r.width < parentW - 2 && !b.closest('.buttons, .actions, .row')) fail('8-button-width-mobile', b, Math.round(r.width), Math.round(parentW));
    if (desktop && r.width > 1200 * 0.6) fail('8-button-width-desktop', b, Math.round(r.width), 'auto');
  });
  sections.forEach((s) => {
    const primaries = [...s.querySelectorAll('.btn-primary, .btn-inverse')].filter(visible);
    if (primaries.length > 1) fail('8-one-primary', s, primaries.length, 1);
    const dark = (b) => { for (let e = b.parentElement; e; e = e.parentElement) { const c = getComputedStyle(e).backgroundColor.match(/[\d.]+/g)?.map(Number); if (c && (c[3] ?? 1) > 0.5) return (c[0] + c[1] + c[2]) / 3 < 128; } return false; };
    if (s.classList.contains('tone-inverse') && [...s.querySelectorAll('.btn-primary')].some(dark)) fail('8-inverse-primary', s, 'btn-primary on a dark surface', 'btn-inverse (mint)');
  });
  return out;
}

const server = await serve();
const port = server.address().port;
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const found = [];
for (const vp of VIEWPORTS) {
  for (const pg of PAGES) {
    const ctx = await browser.newContext({ viewport: { width: vp, height: 900 } });
    const page = await ctx.newPage();
    const reqs = [];
    page.on('request', (r) => reqs.push(new URL(r.url()).pathname));
    await page.goto(`http://localhost:${port}${pg}`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    const res = await page.evaluate(`(${measure.toString()})(${vp})`);
    for (const r of res) found.push({ page: pg, vp, ...r });
    if (vp < 768 && reqs.some((u) => u.startsWith('/illustrations/'))) found.push({ page: pg, vp, rule: 'E-illustration-on-mobile', desc: 'request', measured: reqs.filter((u) => u.startsWith('/illustrations/')).join(','), expected: 'none' });
    await ctx.close();
  }
}
await browser.close();
server.close();

const key = (f) => `${f.page}|${f.vp}|${f.rule}|${f.desc}`;
const keys = [...new Set(found.map(key))].sort();
if (process.env.WRITE_BASELINE && !fs.existsSync(BASELINE)) {
  fs.mkdirSync(path.dirname(BASELINE), { recursive: true });
  fs.writeFileSync(BASELINE, JSON.stringify(keys.filter((k) => !k.startsWith('/styleguide|')), null, 1) + '\n');
  console.log(`baseline written: ${keys.filter((k) => !k.startsWith('/styleguide|')).length} known failures`);
}
const known = new Set(fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : []);
const fresh = found.filter((f) => f.page === '/styleguide' || !known.has(key(f)));
const per = {};
for (const f of found) per[f.page] = (per[f.page] ?? 0) + 1;
console.log('check:layout failures per page (including known):', JSON.stringify(per));
if (fresh.length) {
  console.error(`\ncheck:layout FAILED: ${fresh.length} new failure(s)`);
  for (const f of fresh) console.error(`  ${f.page} @${f.vp} [${f.rule}] ${f.desc}: measured ${f.measured}, expected ${f.expected}`);
  process.exit(1);
}
console.log('check:layout passed (known failures are listed in qa/baseline/layout.json)');
