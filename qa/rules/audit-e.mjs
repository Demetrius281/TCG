// TASK 8 checks E1-E6, added to npm run audit. Existing rules (audit-dom.mjs) are not changed.
//   measureE(R, ctx)  runs INSIDE the page (serialised with toString): E3 repeated-row alignment, E4 diagram symmetry,
//                     E5 carousel alignment, E6 no CTA link after a button. Same screen list and names as measure().
//   runMotion(...)    runs in node: E1 motion runs (and stops under prefers-reduced-motion), E2 flow direction,
//                     E5 again after the carousel advanced by itself.
// Tolerance: 1px (TASK 8). Targets of E1/E2/E4 are fixed by the task: home screen 2, home screen 3, the /platform diagram.
export const E_RULES = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6'];
export const E_TARGETS = [
  { name: 'home screen 2', path: '/', section: 2, hub: true },
  { name: 'home screen 3', path: '/', section: 3 },
  { name: '/platform diagram', path: '/platform', selector: 'section#technology' },
];

export function measureE(R, ctx) {
  const TOL = 1;
  const vw = ctx.vw;
  const only = (r) => !ctx.only || ctx.only.includes(r);
  const EXCL = R.exclusions.selector;
  const SKIP = 'script, style, noscript, template, link, meta, head, title';
  const t = Math.min(1, Math.max(0, (vw - R.fluid.from) / (R.fluid.to - R.fluid.from)));
  const val = (s) => (s.mode === 'fluid' ? s.mobile + (s.desktop - s.mobile) * t : vw >= (s.stepAt ?? R.breakpoints.desktop) ? s.desktop : s.mobile);
  const gutter = val(R.container.gutter);
  const cLeft = (vw - Math.min(vw - 2 * gutter, R.container.max)) / 2;
  const rc = (e) => e.getBoundingClientRect();
  const cs = (e) => getComputedStyle(e);
  const near = (a, b, tol = TOL) => Math.abs(a - b) <= tol;
  const visible = (e) => { const r = rc(e); if (!r.width || !r.height) return false; const c = cs(e); return c.visibility !== 'hidden' && c.display !== 'none'; };
  const label = (e) => (e.textContent || e.getAttribute('aria-label') || e.tagName).trim().replace(/\s+/g, ' ').slice(0, 40);
  const r1 = (n) => Math.round(n * 10) / 10;

  // ---- screens: identical to measure() (header, every section, footer, then anything outside)
  const screens = [];
  const byEl = new Map();
  const addScreen = (el, name, kind) => { const s = { index: screens.length, el, name, kind, counts: Object.fromEntries(['E1', 'E2', 'E3', 'E4', 'E5', 'E6'].map((r) => [r, { c: 0, v: 0 }])) }; screens.push(s); byEl.set(el, s); return s; };
  const header = document.querySelector('header.header');
  if (header) addScreen(header, 'header', 'header');
  document.querySelectorAll('section').forEach((s) => {
    const h = s.querySelector('h1, h2, h3');
    addScreen(s, (h ? h.textContent.trim().replace(/\s+/g, ' ').slice(0, 60) : s.id || 'section') + (s.id ? ` #${s.id}` : ''), 'section');
  });
  const footer = document.querySelector('footer');
  if (footer) addScreen(footer, 'footer', 'footer');
  const pseudo = new Map();
  const screenOf = (e) => {
    const a = e.closest('header.header, footer, section');
    if (a && byEl.has(a)) return byEl.get(a);
    let top = e;
    while (top.parentElement && top.parentElement !== document.body) top = top.parentElement;
    const key = `outside: ${top.tagName.toLowerCase()}${top.id ? '#' + top.id : ''}${top.className && typeof top.className === 'string' ? '.' + top.className.trim().split(/\s+/)[0] : ''}`;
    if (!pseudo.has(key)) pseudo.set(key, addScreen(top, key, 'outside'));
    return pseudo.get(key);
  };
  const violations = [];
  const checked = { E1: 0, E2: 0, E3: 0, E4: 0, E5: 0, E6: 0 };
  const chk = (rule, e, ok, measured, required) => {
    const s = screenOf(e);
    s.counts[rule].c++; checked[rule]++;
    if (!ok) { s.counts[rule].v++; violations.push({ rule, screen: s.name, screenIndex: s.index, kind: s.kind, element: label(e), measured: String(measured), required: String(required) }); }
  };

  // first text line start (honours text-align: the start of a right-aligned line is its right end)
  const textStart = (e) => {
    const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      if (!n.nodeValue.trim()) continue;
      const r = document.createRange(); r.selectNodeContents(n);
      const b = r.getClientRects()[0];
      if (!b) continue;
      const al = cs(n.parentElement).textAlign;
      return { x: al === 'right' || al === 'end' ? b.right : al === 'center' ? (b.left + b.right) / 2 : b.left, top: b.top };
    }
    const b = rc(e); return { x: b.left, top: b.top };
  };

  // ---- E3 repeated-row alignment
  if (only('E3')) {
    const stateClass = /^(is-|__|has-hover|open|active)/;
    const sig = (e, depth) => {
      const cls = [...e.classList].filter((c) => !stateClass.test(c)).sort().join('.');
      const kids = depth > 0 ? [...e.children].filter((k) => !k.matches(SKIP)).map((k) => sig(k, depth - 1)).join(',') : '';
      return `${e.tagName}.${cls}(${kids})`;
    };
    const ROLES = [
      // a heading; else the first element with its own text that is not a label, note or screen-reader text (rows with a text-role title)
      ['title', (m) => m.querySelector('h1, h2, h3, h4, .t-card-title, .t-section-title') || [...m.querySelectorAll('*')].find((x) => !x.matches('.t-label, .t-small, .sr-only, svg, svg *') && [...x.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim()))],
      ['label', (m) => m.querySelector('.t-label')],
      ['photo', (m) => m.querySelector('img')],
      ['divider', (m) => [...m.querySelectorAll('*')].find((d) => d.matches('hr') || (parseFloat(cs(d).borderTopWidth) > 0 && cs(d).borderTopStyle !== 'none' && visible(d)))],
      ['button', (m) => m.querySelector('.btn, .ei-btn')],
    ];
    const parents = [...document.body.querySelectorAll('*')].filter((p) => !p.matches(SKIP) && !p.closest(`${EXCL}, ${SKIP}`) && p.children.length >= 3);
    for (const P of parents) {
      const kids = [...P.children].filter((k) => !k.matches(SKIP) && !k.matches(EXCL) && visible(k) && !['inline', 'contents'].includes(cs(k).display) && !['absolute', 'fixed'].includes(cs(k).position));
      if (kids.length < 3) continue;
      const groups = new Map();
      for (const k of kids) { const s = sig(k, 3); if (!groups.has(s)) groups.set(s, []); groups.get(s).push(k); }
      for (const members of groups.values()) {
        if (members.length < 3) continue;
        // horizontal rows: same top; vertical lists: same left
        const cluster = (key) => { const out = []; for (const m of members) { const v = rc(m)[key]; const g = out.find((x) => near(x.v, v)); if (g) g.items.push(m); else out.push({ v, items: [m] }); } return out.filter((g) => g.items.length >= 2); };
        for (const [roleName, find] of ROLES) {
          for (const g of cluster('top')) {
            const els = g.items.map(find);
            if (els.some((x) => !x || !visible(x))) continue;
            const tops = els.map((x) => (roleName === 'title' || roleName === 'label' ? textStart(x).top : rc(x).top));
            let ok = Math.max(...tops) - Math.min(...tops) <= TOL;
            if (!ok && (roleName === 'photo' || roleName === 'button')) {
              // boxes of different heights may share a centre or a bottom line instead
              const mid = els.map((x) => (rc(x).top + rc(x).bottom) / 2); const bot = els.map((x) => rc(x).bottom);
              ok = Math.max(...mid) - Math.min(...mid) <= TOL || Math.max(...bot) - Math.min(...bot) <= TOL;
            }
            const ref = Math.min(...tops);
            els.forEach((x, i) => chk('E3', x, ok || near(tops[i], ref), `${roleName} y ${r1(tops[i] - ref)} from the row`, `${roleName} on one line across the row (±${TOL})`));
          }
          for (const g of cluster('left')) {
            const els = g.items.map(find);
            if (els.some((x) => !x || !visible(x))) continue;
            // a box centred in its item (a glyph tile) is aligned by its centre
            const centred = els.every((x, i) => { const a = rc(x); const m = rc(g.items[i]); return a.width < m.width - 2 && near((a.left + a.right) / 2, (m.left + m.right) / 2); });
            const xs = els.map((x) => (centred ? (rc(x).left + rc(x).right) / 2 : roleName === 'title' || roleName === 'label' ? textStart(x).x : rc(x).left));
            const ref = xs[0];
            els.forEach((x, i) => chk('E3', x, near(xs[i], ref), `${roleName} x ${r1(xs[i])} vs ${r1(ref)}`, `${roleName} starts at one x down the list (±${TOL})`));
          }
        }
      }
    }
  }

  // ---- E4 diagram symmetry (home screen 2, home screen 3, /platform diagram)
  if (only('E4')) {
    const nums = (p) => (p.getAttribute('d') || '').match(/-?[\d.]+/g)?.map(Number) ?? [];
    const pts = (p) => { const n = nums(p); const o = []; for (let i = 0; i + 1 < n.length; i += 2) o.push([n[i], n[i + 1]]); return o; };
    const mirrored = (a, b, axis) => a.length > 0 && a.length === b.length && a.every(([x, y], i) => near(x + b[i][0], 2 * axis) && near(y, b[i][1]));
    const sections = [...document.querySelectorAll('main section')];
    const targets = [];
    if (ctx.path === '/') targets.push(sections[1], sections[2]);
    if (ctx.path === '/platform') targets.push(document.querySelector('section#technology'));
    document.querySelectorAll('[data-diagram]').forEach((d) => { const s = d.closest('section'); if (s && !targets.includes(s)) targets.push(s); });
    for (const sec of targets) {
      if (!sec) continue;
      const d = sec.querySelector('[data-diagram]');
      if (!d) { chk('E4', sec, false, 'no shared Diagram on this screen', 'mirrored diagram (Diagram primitive)'); continue; }
      if (!visible(d)) continue;
      const host = rc(d);
      if (d.dataset.diagram === 'converge') {
        const hub = d.querySelector('[data-hub]'); const hb = rc(hub); const axis = (hb.left + hb.right) / 2 - host.left;
        chk('E4', hub, near(axis, host.width / 2), `hub centre ${r1(axis)}`, `container centre ${r1(host.width / 2)}`);
        const sp = [...d.querySelectorAll('[data-sphere]')].map((s) => ({ el: s, b: rc(s) }));
        const wires = [...d.querySelectorAll('[data-wire]')];
        const stacked = sp.length > 1 && sp[1].b.top >= sp[0].b.bottom - 1;
        if (stacked) {
          wires.forEach((w) => { const p = pts(w); chk('E4', d, p.length > 0 && p.every(([x]) => near(x, axis)), `chain x ${p.map(([x]) => r1(x)).join('/')}`, `one vertical chain on the centre axis ${r1(axis)}`); });
        } else {
          const n = sp.length;
          for (let i = 0; i < Math.ceil(n / 2); i++) {
            const j = n - 1 - i;
            const ci = (sp[i].b.left + sp[i].b.right) / 2 - host.left; const cj = (sp[j].b.left + sp[j].b.right) / 2 - host.left;
            chk('E4', sp[i].el, near(ci + cj, 2 * axis) && near(sp[i].b.top, sp[j].b.top) && near(sp[i].b.width, sp[j].b.width), `spheres ${i + 1}/${j + 1}: centres ${r1(ci)}+${r1(cj)}, tops ${r1(sp[i].b.top)}/${r1(sp[j].b.top)}`, `mirrored about ${r1(axis)}`);
            if (i === j) chk('E4', wires[i], pts(wires[i]).every(([x]) => near(x, axis)), `centre path x ${pts(wires[i]).map(([x]) => r1(x)).join('/')}`, `straight on the axis ${r1(axis)}`);
            else chk('E4', wires[i], mirrored(pts(wires[i]), pts(wires[j]), axis), `paths ${i + 1}/${j + 1}: ${wires[i].getAttribute('d')} | ${wires[j].getAttribute('d')}`, `mirror images about ${r1(axis)}`);
          }
        }
      } else {
        if (vw < R.breakpoints.tablet) continue; // one column below the tablet width: nothing to mirror
        const col = (k) => d.querySelector(`[data-col="${k}"]`);
        const ci = rc(col('in')); const cc = rc(col('core')); const co = rc(col('out'));
        const axis = (cc.left + cc.right) / 2 - host.left;
        chk('E4', col('in'), near(ci.width, co.width), `input ${r1(ci.width)} / output ${r1(co.width)}`, 'input and output columns of equal width');
        chk('E4', col('in'), near(ci.left - host.left + (co.right - host.left), 2 * axis), `input left ${r1(ci.left - host.left)}, output right ${r1(co.right - host.left)}`, `mirrored about the core axis ${r1(axis)}`);
        const ins = [...d.querySelectorAll('[data-in]')]; const outs = [...d.querySelectorAll('[data-out]')];
        ins.forEach((a, i) => { const b = outs[i]; if (!b) return; chk('E4', a, near(rc(a).top, rc(b).top) && near(rc(a).height, rc(b).height), `row ${i + 1}: input top ${r1(rc(a).top)} h ${r1(rc(a).height)}, output top ${r1(rc(b).top)} h ${r1(rc(b).height)}`, 'input row i and output row i share top and height'); });
        const hIn = ins.map((a) => rc(a).height); if (hIn.length) chk('E4', col('in'), Math.max(...hIn) - Math.min(...hIn) <= TOL, `input heights ${hIn.map(r1).join('/')}`, 'equal heights in the column');
        const wIn = [...d.querySelectorAll('[data-wire-in]')]; const wOut = [...d.querySelectorAll('[data-wire-out]')];
        wIn.forEach((w, i) => { const a = pts(w); const b = wOut[i] ? pts(wOut[i]).reverse() : []; chk('E4', w, mirrored(a, b, axis), `connectors ${i + 1}: ${w.getAttribute('d')} | ${wOut[i]?.getAttribute('d')}`, `left and right connectors mirrored about ${r1(axis)}`); });
        const foot = [...d.querySelectorAll('[data-foot]')];
        foot.forEach((f, k) => { const c = [ci, cc, co][k]; if (c) chk('E4', f, near(rc(f).left, c.left) && near(rc(f).width, c.width), `foot ${k + 1} left ${r1(rc(f).left)} w ${r1(rc(f).width)}`, `column ${k + 1} left ${r1(c.left)} w ${r1(c.width)}`); });
      }
    }
  }

  // ---- E5 carousel
  if (only('E5')) {
    document.querySelectorAll('[data-carousel]').forEach((car) => {
      const vp = car.querySelector('[data-viewport]'); const tr = car.querySelector('[data-track]');
      if (!vp || !tr || !visible(vp)) return;
      const v = rc(vp);
      const cards = [...tr.children].filter((c) => { const r = rc(c); return r.width && r.right > v.left + 1 && r.left < v.right - 1; });
      if (!cards.length) return;
      const first = cards.reduce((a, b) => (rc(b).left < rc(a).left ? b : a));
      chk('E5', first, near(rc(first).left, cLeft), `first visible card left ${r1(rc(first).left)}`, `container left ${r1(cLeft)} (±${TOL})`);
      cards.forEach((c) => chk('E5', c, !(rc(c).left < v.left - TOL), `card left ${r1(rc(c).left)} < viewport ${r1(v.left)}`, 'no visible card cut on the left'));
      const hs = cards.map((c) => rc(c).height);
      chk('E5', first, Math.max(...hs) - Math.min(...hs) <= TOL, `heights ${hs.map(r1).join('/')}`, 'cards of equal height');
      const part = (name, find) => {
        const els = cards.map(find); if (els.some((x) => !x)) { chk('E5', first, false, `${name} missing in a card`, `${name} in every card`); return; }
        const ys = els.map((x) => rc(x).top);
        chk('E5', first, Math.max(...ys) - Math.min(...ys) <= TOL, `${name} y ${ys.map(r1).join('/')}`, `${name} on one line across visible cards (±${TOL})`);
      };
      part('divider', (c) => [...c.querySelectorAll('*')].find((d) => parseFloat(cs(d).borderTopWidth) > 0 && cs(d).borderTopStyle !== 'none' && !d.matches('.card')));
      part('photo', (c) => c.querySelector('img'));
      part('name', (c) => c.querySelector('.t-card-title, h3'));
      part('meta', (c) => [...c.querySelectorAll('.t-small')].pop());
    });
  }

  // ---- E6 no CTA link directly after a button or a button group (built HTML: every element, shown or not)
  if (only('E6')) {
    const isBtn = (e) => e.matches('.btn, .ei-btn');
    const onlyButtons = (e) => e.children.length > 0 && [...e.children].every((k) => isBtn(k) || k.matches(SKIP));
    const standaloneLink = (e) => {
      if (e.matches('a') && !isBtn(e)) return true;
      const links = [...e.querySelectorAll('a:not(.btn):not(.ei-btn)')];
      return links.length === 1 && e.textContent.trim().length > 0 && e.textContent.trim() === links[0].textContent.trim();
    };
    const nextEl = (e) => { let n = e.nextElementSibling; while (n && n.matches(SKIP)) n = n.nextElementSibling; return n; };
    document.querySelectorAll('.btn, .ei-btn').forEach((b) => {
      if (b.closest(SKIP)) return;
      // the button, or the group it ends (a container holding buttons only)
      let from = b;
      while (!nextEl(from) && from.parentElement && from.parentElement !== document.body && onlyButtons(from.parentElement)) from = from.parentElement;
      const n = nextEl(from);
      chk('E6', b, !(n && standaloneLink(n)), n ? `followed by link "${n.textContent.trim().slice(0, 40)}"` : 'nothing follows', 'no text link directly after a button or button group');
    });
  }

  return { violations, checked, screens: screens.map((s) => ({ index: s.index, name: s.name, counts: s.counts })) };
}

// ---------- node side: motion (E1, E2) and the carousel after it advanced by itself (E5)
// launch(name) -> browser; base: server url; sink: results array (same row shape as the audit's).
export async function runMotion({ launch, browsers, base, routes, R, widths, log = () => {} }) {
  const MEASURE_E = measureE.toString();
  const rows = [];
  const push = (browser, page, width, state, violations, checkedPerRule) => rows.push({ browser, page, width, state, sweep: false, res: { screens: [], violations, counts: { checkedPerRule } }, rc: null });
  for (const bname of browsers) {
    const browser = await launch(bname);
    // decoder page: PNG -> pixels through a canvas
    const dctx = await browser.newContext(); const dec = await dctx.newPage();
    const pixels = (buf) => dec.evaluate(async (b64) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0); return { w: img.width, h: img.height, d: Array.from(g.getImageData(0, 0, img.width, img.height).data) }; }, buf.toString('base64'));
    const diff = async (a, b) => { const A = await pixels(a); const B = await pixels(b); if (A.w !== B.w || A.h !== B.h) return Math.max(A.w * A.h, B.w * B.h); let n = 0; for (let i = 0; i < A.d.length; i += 4) if (A.d[i] !== B.d[i] || A.d[i + 1] !== B.d[i + 1] || A.d[i + 2] !== B.d[i + 2]) n++; return n; };
    for (const width of widths) {
      for (const tgt of E_TARGETS.filter((t) => routes.includes(t.path))) {
        for (const motion of ['no-preference', 'reduce']) {
          const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: motion });
          await ctx.route('**/*', (r) => (r.request().url().startsWith(base) ? r.continue() : r.abort()));
          const page = await ctx.newPage();
          await page.goto(base + tgt.path, { waitUntil: 'load' });
          await page.evaluate(() => document.fonts.ready);
          const info = await page.evaluate(({ tgt }) => {
            const sec = tgt.selector ? document.querySelector(tgt.selector) : document.querySelectorAll('main section')[tgt.section - 1];
            if (!sec) return null;
            const el = sec.querySelector('[data-diagram], [data-flow]') || sec;
            el.setAttribute('data-e-target', '');
            const hub = sec.querySelector('[data-hub], [data-flow-hub]'); if (hub) hub.setAttribute('data-e-hub', '');
            const h = sec.querySelector('h1, h2, h3');
            const all = [...document.querySelectorAll('section')];
            const header = document.querySelector('header.header') ? 1 : 0;
            return { screen: (h ? h.textContent.trim().replace(/\s+/g, ' ').slice(0, 60) : sec.id || 'section') + (sec.id ? ` #${sec.id}` : ''), index: header + all.indexOf(sec), diagram: el !== sec, hub: !!hub };
          }, { tgt });
          const v = []; const checked = { E1: 0, E2: 0 };
          const viol = (rule, element, measured, required) => v.push({ rule, screen: info?.screen ?? tgt.name, screenIndex: info?.index ?? -1, kind: 'section', element, measured: String(measured), required: String(required) });
          if (!info) { checked.E1++; viol('E1', tgt.name, 'screen not found', 'the target screen exists'); push(bname, tgt.path, width, `motion:${motion}`, v, checked); await ctx.close(); continue; }
          const target = page.locator('[data-e-target]');
          await target.evaluate((e) => e.scrollIntoView({ block: 'center' }));
          await page.waitForTimeout(2600);
          const a = await target.screenshot({ animations: 'allow' });
          await page.waitForTimeout(700);
          const b = await target.screenshot({ animations: 'allow' });
          const n = await diff(a, b);
          checked.E1++;
          const name = `${tgt.name}${info.diagram ? '' : ' (no diagram)'}`;
          if (motion === 'no-preference' && n === 0) viol('E1', name, 'pixel difference 0 between two frames 700 ms apart', 'motion: difference > 0');
          if (motion === 'reduce' && n !== 0) viol('E1', name, `pixel difference ${n} under prefers-reduced-motion`, 'no motion: difference 0');
          if (tgt.hub && motion === 'no-preference') {
            // the hub's centre pixel over one full cycle (every 250 ms): reaches the green token and returns to the dark token
            const colours = await page.evaluate(() => { const probe = (v) => { const d = document.createElement('i'); d.style.color = v; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c.match(/\d+/g).slice(0, 3).map(Number); }; const r = getComputedStyle(document.documentElement); return { green: probe(r.getPropertyValue('--color-accent')), dark: probe(r.getPropertyValue('--color-inverse')) }; });
            const hub = page.locator('[data-e-hub]');
            const samples = [];
            if (info.hub) {
              const box = await hub.boundingBox();
              for (let i = 0; i <= 26; i++) {
                const shot = await page.screenshot({ clip: { x: box.x + box.width / 2, y: box.y + box.height / 2, width: 1, height: 1 }, animations: 'allow' });
                const p = await pixels(shot); samples.push(p.d.slice(0, 3));
                await page.waitForTimeout(250);
              }
            }
            const is = (c, ref) => c.every((x, k) => Math.abs(x - ref[k]) <= 6);
            const gi = samples.findIndex((c) => is(c, colours.green));
            const back = gi >= 0 && samples.slice(gi + 1).some((c) => is(c, colours.dark));
            checked.E1++;
            if (!(gi >= 0 && back)) viol('E1', 'TCG node centre pixel', `${samples.length} samples: ${gi >= 0 ? 'green reached' : 'never green'}${gi >= 0 ? (back ? '' : ', never back to dark') : ''} (${[...new Set(samples.map((c) => c.join(',')))].slice(0, 6).join(' | ')})`, `reaches rgb(${colours.green}) and returns to rgb(${colours.dark}) within one cycle`);
            // E2: every moving dot goes up (towards the hub); sampled every animation frame for one cycle
            const track = await page.evaluate(() => new Promise((done) => {
              const dots = [...document.querySelectorAll('[data-e-target] [data-dot]')];
              const seq = dots.map(() => []);
              const t0 = performance.now();
              const tick = (now) => {
                dots.forEach((d, i) => { if (getComputedStyle(d).visibility === 'visible' && d.getBoundingClientRect().width) { const r = d.getBoundingClientRect(); seq[i].push(r.top + r.height / 2); } else if (seq[i].length && seq[i][seq[i].length - 1] !== null) seq[i].push(null); });
                if (now - t0 < 6300) requestAnimationFrame(tick); else done({ n: dots.length, seq });
              };
              requestAnimationFrame(tick);
            }));
            let moved = 0; let away = 0; let samplesN = 0; let worst = '';
            track.seq.forEach((s, i) => { for (let k = 1; k < s.length; k++) { if (s[k] === null || s[k - 1] === null) continue; samplesN++; const dy = s[k] - s[k - 1]; if (dy < -0.05) moved++; if (dy > 0.5) { away++; worst = `dot ${i + 1} moved down ${Math.round(dy * 10) / 10}px`; } } });
            checked.E2 += Math.max(1, samplesN);
            if (!track.n || !moved) viol('E2', 'flow dots', `${track.n} dots, ${moved} upward steps`, 'dots travel from the spheres up into TCG');
            if (away) viol('E2', 'flow dots', `${away} steps away from TCG (${worst})`, 'y decreases on every path (towards TCG)');
          }
          push(bname, tgt.path, width, `motion:${motion}`, v, checked);
          await ctx.close();
        }
      }
      // E5 after the carousel advanced by itself: wait for a stop, then measure
      if (routes.includes('/')) {
        const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'no-preference' });
        await ctx.route('**/*', (r) => (r.request().url().startsWith(base) ? r.continue() : r.abort()));
        const page = await ctx.newPage();
        await page.goto(base + '/', { waitUntil: 'load' });
        await page.evaluate(() => document.fonts.ready);
        const has = await page.evaluate(() => { const c = document.querySelector('[data-carousel]'); if (!c) return false; c.scrollIntoView({ block: 'center' }); return true; });
        if (has) {
          await page.mouse.move(0, 0);
          await page.waitForTimeout(4600);
          // a stop: the scroll position unchanged for 400 ms (at most 6 s)
          await page.evaluate(() => new Promise((done) => { const vp = document.querySelector('[data-viewport]'); let last = vp.scrollLeft; let still = 0; const t0 = performance.now(); const tick = () => { if (vp.scrollLeft === last) still += 50; else { still = 0; last = vp.scrollLeft; } if (still >= 400 || performance.now() - t0 > 6000) done(); else setTimeout(tick, 50); }; tick(); }));
          const res = await page.evaluate(`(${MEASURE_E})(${JSON.stringify(R)}, ${JSON.stringify({ vw: width, path: '/', only: ['E5'] })})`);
          push(bname, '/', width, 'motion:carousel-after-autoplay', res.violations, { E5: res.checked.E5 });
        }
        await ctx.close();
      }
      log('motion', bname, width);
    }
    await dctx.close();
    await browser.close();
  }
  return rows;
}
