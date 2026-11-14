// Runs INSIDE the page (serialised with toString by scripts/audit.mjs). Every expected value comes from R (rules.json).
// measure(R, ctx) -> { screens, violations, counts }.   recount(R, ctx) -> independent counts straight from the DOM.
// ctx: { vw, state, path, sweep, only, mutate }
export function measure(R, ctx) {
  const vw = ctx.vw;
  const T = R.tolerance;
  const ALL = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'X'];
  const enabled = (r) => (!ctx.only || ctx.only.includes(r)) && (!ctx.sweep || ['R1', 'R4', 'R6', 'X'].includes(r));
  const t = Math.min(1, Math.max(0, (vw - R.fluid.from) / (R.fluid.to - R.fluid.from)));
  const val = (s) => (s.mode === 'fluid' ? s.mobile + (s.desktop - s.mobile) * t : vw >= (s.stepAt ?? R.breakpoints.desktop) ? s.desktop : s.mobile);
  const near = (a, b, tol = T.px) => Math.abs(a - b) <= tol;
  const EXCL = R.exclusions.selector;
  const SKIP = 'script, style, noscript, template, link, meta, head, title';

  const cache = new Map();
  const cs = (e) => { let c = cache.get(e); if (!c) { c = getComputedStyle(e); cache.set(e, c); } return c; };
  const rcCache = new Map();
  const rc = (e) => { let r = rcCache.get(e); if (!r) { r = e.getBoundingClientRect(); rcCache.set(e, r); } return r; };
  const visible = (e) => { const r = rc(e); if (!r.width || !r.height) return false; if (r.bottom <= 0 || r.right <= 0) return false; const c = cs(e); return c.visibility !== 'hidden' && c.display !== 'none'; };
  const label = (e) => (e.textContent || e.getAttribute('aria-label') || e.tagName).trim().replace(/\s+/g, ' ').slice(0, 40);

  // ---- screens (found from the DOM)
  const screens = [];
  const byEl = new Map();
  const addScreen = (el, name, kind) => { const s = { index: screens.length, el, name, kind, counts: Object.fromEntries(ALL.map((r) => [r, { c: 0, v: 0 }])) }; screens.push(s); byEl.set(el, s); return s; };
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
    if (e === document.body || e === document.documentElement) top = document.body;
    else while (top.parentElement && top.parentElement !== document.body) top = top.parentElement;
    const key = `outside: ${top.tagName.toLowerCase()}${top.id ? '#' + top.id : ''}${top.className && typeof top.className === 'string' ? '.' + top.className.trim().split(/\s+/)[0] : ''}`;
    if (!pseudo.has(key)) pseudo.set(key, addScreen(top, key, 'outside'));
    return pseudo.get(key);
  };

  const violations = [];
  const chk = (rule, e, ok, measured, required) => {
    const s = screenOf(e);
    s.counts[rule].c++;
    if (!ok) { s.counts[rule].v++; violations.push({ rule, screen: s.name, screenIndex: s.index, kind: s.kind, element: label(e), measured: String(measured), required: String(required) }); }
  };

  // ---- elements
  const els = [...document.body.querySelectorAll('*')].filter((e) => !e.matches(SKIP) && !e.closest(`${EXCL}, ${SKIP}`) && visible(e));
  const ownText = (e) => [...e.childNodes].filter((n) => n.nodeType === 3 && n.nodeValue.trim());
  const textEls = els.filter((e) => ownText(e).length);
  const bump = (e, k) => { const s = screenOf(e); s.appl = s.appl || {}; s.appl[k] = (s.appl[k] || 0) + 1; };
  textEls.forEach((e) => bump(e, 'text'));
  els.forEach((e) => { if (e.matches('.grid, [class*="cols-"]')) bump(e, 'grid'); if (e.matches('.btn, .ei-btn')) bump(e, 'btn'); if (e.tagName === 'LI') bump(e, 'li'); if (e.matches('ul, ol')) bump(e, 'ul'); if (e.matches('h1, h2') || (e.tagName === 'P' && !e.closest('li, .card, figure, table, form, dl, fieldset, blockquote, aside, .panel, .metrics, .btn, details, .doc'))) bump(e, 'width'); });
  const gutter = val(R.container.gutter);
  const cLeft = (vw - Math.min(vw - 2 * gutter, R.container.max)) / 2;
  const pad = val(R.screen.padding);
  const firstTextLeft = (e) => {
    const n = ownText(e)[0];
    if (!n) return rc(e).left;
    const r = document.createRange(); r.selectNodeContents(n);
    const b = r.getClientRects()[0] ?? r.getBoundingClientRect();
    return b.left;
  };
  const isBlockish = (e) => { const d = cs(e).display; return d !== 'inline' && d !== 'contents'; };
  const counts = { textNodes: 0, screens: 0, grids: 0, btns: 0, lis: 0, uls: 0, h12: 0 };

  // ---- R3 roles
  const roleList = Object.entries(R.roles).map(([name, r]) => ({ name, size: r.mobile + (r.desktop - r.mobile) * t, ...r }));
  if (enabled('R3')) {
    for (const e of textEls) {
      const c = cs(e);
      const size = parseFloat(c.fontSize);
      const mono = /mono/i.test(c.fontFamily);
      const weight = Number(c.fontWeight);
      const cas = c.textTransform === 'uppercase' ? 'uppercase' : 'none';
      const matches = roleList.filter((r) => near(size, r.size, T.font) && (r.family === 'mono') === mono && weight === r.weight && cas === r.case);
      const tagRole = roleList.find((r) => r.tag === (e.tagName === 'H4' ? 'H3' : e.tagName));
      counts.textNodes += ownText(e).length;
      let ok = matches.length > 0;
      let req = roleList.map((r) => `${r.name} ${Math.round(r.size * 10) / 10}px ${r.family} w${r.weight} ${r.case}`).join(' | ');
      if (tagRole) { ok = matches.some((m) => m.name === tagRole.name); req = `${tagRole.name} ${Math.round(tagRole.size * 10) / 10}px ${tagRole.family} w${tagRole.weight}`; }
      if (ok && matches.every((m) => m.name === 'label')) {
        // label: never directly above a heading
        const nx = e.nextElementSibling;
        if (nx && /^H[1-6]$/.test(nx.tagName)) { ok = false; req = 'label never above a heading'; }
      }
      chk('R3', e, ok, `${Math.round(size * 100) / 100}px ${mono ? 'mono' : 'sans'} w${weight} ${cas}`, req);
    }
  } else {
    for (const e of textEls) counts.textNodes += ownText(e).length;
  }

  // ---- R1 left edge
  const colBox = (a) => { const p = a.parentElement; const pd = p ? cs(p).display : ''; return /grid|flex/.test(pd) || a.matches('.card, figure, .panel, li, details, td, th, article, form, blockquote') || parseFloat(cs(a).paddingLeft) > 0 || parseFloat(cs(a).borderLeftWidth) > 0; };
  // Column starts of a grid / flex parent for one of its children: track lines (grid) or parent start / previous sibling + gap (flex)
  const visSib = new Map();
  const trackMemo = new Map();
  const trackEdges = (e) => {
    const P = e.parentElement; if (!P) return [];
    if (!/grid/.test(cs(P).display) && !visSib.has(P)) visSib.set(P, [...P.children].filter((k) => visible(k)));
    const key = /grid/.test(cs(P).display) ? P : null;
    if (key && trackMemo.has(key)) return trackMemo.get(key);
    const pc = cs(P); const out = [];
    const start = rc(P).left + parseFloat(pc.borderLeftWidth) + parseFloat(pc.paddingLeft);
    const gap = parseFloat(pc.columnGap) || 0;
    if (/grid/.test(pc.display)) { let x = start; out.push(x); for (const col of pc.gridTemplateColumns.split(' ')) { const w = parseFloat(col); if (Number.isNaN(w)) continue; x += w + gap; out.push(x); } }
    else if (/flex/.test(pc.display)) { out.push(start); if (!/column/.test(pc.flexDirection)) { const sib = visSib.get(P); const i = sib.indexOf(e); if (i > 0) out.push(rc(sib[i - 1]).right + gap); } }
    if (key) trackMemo.set(key, out);
    return out;
  };
  if (enabled('R1')) {
    // R1 exclusion (listed in the report): aria-hidden elements that hold only a glyph (arrow, plus). Every other block-level text, button and image is checked.
    const r1 = els.filter((e) => ((ownText(e).length && isBlockish(e)) || e.matches('.btn, img, .ei-btn')) && !(e.getAttribute('aria-hidden') === 'true' && new RegExp(R.exclusions.r1GlyphPattern).test(e.textContent)));
    for (const e of r1) {
      const boxLeft = rc(e).left;
      const left = e.matches('.btn, img, .ei-btn') ? boxLeft : firstTextLeft(e);
      const edges = [cLeft];
      edges.push(...trackEdges(e));
      for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) {
        if (colBox(a)) { const c = cs(a); edges.push(rc(a).left, rc(a).left + parseFloat(c.borderLeftWidth) + parseFloat(c.paddingLeft)); }
        if (byEl.has(a)) break;
      }
      // the text starts at an edge, or the element's own box (a padded link or pill) does
      let ok = edges.some((x) => near(left, x)) || edges.some((x) => near(boxLeft, x));
      let req = `container ${Math.round(cLeft * 10) / 10} or a column/card edge`;
      const stack = e.closest('.stack');
      if (stack && e.matches('a:not(.btn)')) { const b = stack.querySelector('.btn'); const br = rc(b); ok = near((rc(e).left + rc(e).right) / 2, (br.left + br.right) / 2, 1); req = 'centred on the button'; }
      bump(e, 'blk');
      chk('R1', e, ok, Math.round(left * 10) / 10, req);
    }
  }

  // ---- R2 first screen
  const first = document.querySelector('main > section');
  if (enabled('R2')) {
    if (header) {
      const hh = rc(header).height;
      chk('R2', header, near(hh, val(R.header), T.px + 0.5), Math.round(hh * 10) / 10, `header ${val(R.header)}`);
      chk('R2', header, cs(header).position === 'sticky' || cs(header).position === 'fixed', cs(header).position, 'sticky');
    }
    document.querySelectorAll('main h1, h1').forEach((h) => {
      if (!visible(h) || h.closest(EXCL)) return;
      if (!first || !first.contains(h)) chk('R2', h, false, 'h1 outside the first screen', 'page-title on the first screen only');
    });
    if (!first) {
      const m = document.querySelector('main') || document.body;
      chk('R2', m, false, 'no first screen (no section in main)', 'first screen with page-title');
    } else {
      const h1 = first.querySelector('h1');
      const hb = header ? rc(header).bottom : 0;
      if (!h1 || !visible(h1)) chk('R2', first, false, 'no visible h1', 'page-title');
      else {
        const hr = rc(h1);
        chk('R2', h1, near(hr.top - hb, val(R.pageTop)), Math.round((hr.top - hb) * 10) / 10, `header -> title ${val(R.pageTop)}`);
        chk('R2', h1, hr.width <= R.width.pageTitle + 0.5, Math.round(hr.width), `max ${R.width.pageTitle}`);
        const hero = first.querySelector('.hero');
        const copy = hero?.querySelector('.copy') ?? first;
        const kids = [...copy.querySelectorAll('*')].filter((e) => visible(e) && !e.closest('.btn'));
        const paras = kids.filter((e) => e.tagName === 'P' && !e.closest('.points, .list, li'));
        const btns = [...copy.querySelectorAll('.btn')].filter(visible);
        const onA2 = ctx.path === R.firstScreen.A2.page;
        const points = copy.querySelector('.points');
        chk('R2', first, paras.length === R.firstScreen.paragraphs, `${paras.length} paragraphs`, R.firstScreen.paragraphs);
        chk('R2', first, btns.length >= 1 && btns.length <= R.firstScreen.maxButtons, `${btns.length} buttons`, `1-${R.firstScreen.maxButtons}`);
        const stray = kids.filter((e) => e.matches('ul, ol, dl, table, .t-label, a:not(.btn), small, time, figure, img, h2, h3') && !(onA2 && e.closest('.points')));
        chk('R2', first, stray.length === 0, stray.map((e) => e.tagName.toLowerCase() + (e.className ? '.' + String(e.className).split(' ')[0] : '')).join(','), 'only page-title, one text, 1-2 buttons, illustration');
        if (points) chk('R2', points, onA2 && points.querySelectorAll(':scope > li').length <= R.firstScreen.A2.maxItems, onA2 ? `${points.querySelectorAll(':scope > li').length} items` : 'list outside /platform', `A2: ${R.firstScreen.A2.page} only, up to ${R.firstScreen.A2.maxItems}`);
        const lead = paras[0];
        if (lead) {
          chk('R2', lead, near(rc(lead).top - hr.bottom, R.spacing.headingText), Math.round((rc(lead).top - hr.bottom) * 10) / 10, `title -> text ${R.spacing.headingText}`);
          if (btns[0]) {
            if (points && visible(points)) {
              const pr = rc(points);
              chk('R2', points, near(pr.top - rc(lead).bottom, R.firstScreen.A2.textToList), Math.round((pr.top - rc(lead).bottom) * 10) / 10, `text -> list ${R.firstScreen.A2.textToList}`);
              chk('R2', points, near(rc(btns[0]).top - pr.bottom, R.firstScreen.A2.listToButtons), Math.round((rc(btns[0]).top - pr.bottom) * 10) / 10, `list -> buttons ${R.firstScreen.A2.listToButtons}`);
            } else chk('R2', lead, near(rc(btns[0]).top - rc(lead).bottom, R.spacing.textButtons), Math.round((rc(btns[0]).top - rc(lead).bottom) * 10) / 10, `text -> buttons ${R.spacing.textButtons}`);
          }
          chk('R2', lead, rc(lead).width <= R.width.text + 0.5, Math.round(rc(lead).width), `max ${R.width.text}`);
        }
        const host = first.querySelector('[data-illustration]');
        if (host) {
          const shown = visible(host);
          if (vw < R.firstScreen.illustrationShownFrom) chk('R2', host, !shown, 'visible', 'illustration hidden below ' + R.firstScreen.illustrationShownFrom);
          else if (shown) {
            const ar = rc(host);
            chk('R2', host, Math.abs(ar.width / ar.height - R.firstScreen.illustrationRatio) <= T.ratio, Math.round((ar.width / ar.height) * 1000) / 1000, `frame ratio ${R.firstScreen.illustrationRatio}`);
            if (vw >= R.firstScreen.illustrationSplitFrom) {
              chk('R2', host, near(ar.top, hr.top, T.illustrationTop), Math.round(ar.top - hr.top), 'illustration top = title top');
              const cw = rc(copy);
              chk('R2', host, Math.abs(cw.width - ar.width) <= 2, `${Math.round(cw.width)}/${Math.round(ar.width)}`, '50/50');
              chk('R2', host, near(ar.left - cw.right, R.firstScreen.illustrationGap, 2), Math.round(ar.left - cw.right), `gap ${R.firstScreen.illustrationGap}`);
            }
          }
        }
      }
    }
  }

  // ---- R4 spacing pairs (full) / stuck pairs (sweep)
  const btnGap = val(R.spacing.buttons);
  const cardGap = val(R.spacing.cards);
  const headingTag = (e) => /^H[1-6]$/.test(e.tagName);
  const cardLike = (e) => e.closest('.card, li, article, figure, .panel');
  const sepBy = (a, b) => { const sides = (e, s) => parseFloat(cs(e)['border' + s + 'Width']) > 0; const bg = (e) => { const m = cs(e).backgroundColor.match(/[\d.]+/g); return m && (m[3] ?? 1) > 0.05; }; return sides(a, 'Bottom') || sides(b, 'Top') || bg(a) || bg(b) || !!a.matches('hr') || !!b.matches('hr'); };
  const captionPair = (a, b) => (headingTag(a) || a.matches('dt, .t-label, strong, b, summary') || Number(cs(a).fontWeight) >= 500) && parseFloat(cs(b).fontSize) <= parseFloat(cs(a).fontSize);
  if (enabled('R4')) {
    const parents = new Set(els.map((e) => e.parentElement).filter(Boolean));
    for (const P of parents) {
      const kids = [...P.children].filter((k) => !k.matches(SKIP) && visible(k) && !k.closest(EXCL) && !['absolute', 'fixed'].includes(cs(k).position));
      for (let i = 0; i < kids.length - 1; i++) {
        const a = kids[i]; const b = kids[i + 1];
        if (!isBlockish(a) || !isBlockish(b)) continue;
        const ra = rc(a); const rb = rc(b);
        const overlapX = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
        const stacked = rb.top >= ra.bottom - 1 && overlapX > 0;
        const side = !stacked && Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top) > 0 && rb.left >= ra.right - 1;
        if (!stacked && !side) continue;
        const g = stacked ? rb.top - ra.bottom : rb.left - ra.right;
        const btnA = a.matches('.btn, .ei-btn'); const btnB = b.matches('.btn, .ei-btn');
        let want = null; let name = '';
        if (!ctx.sweep) {
          if (btnA && btnB) { want = btnGap; name = 'between buttons'; }
          else if (stacked && /^H[12]$/.test(a.tagName) && !btnB) { want = R.spacing.headingText; name = 'heading -> text'; }
          else if (stacked && a.tagName === 'H3' && !btnB && !a.closest('.hero')) { want = cardLike(a) ? R.spacing.cardTitleText : R.spacing.headingText; name = cardLike(a) ? 'card-title -> text' : 'heading -> text'; }
          else if (stacked && a.tagName === 'P' && b.tagName === 'P') { want = R.spacing.paragraph; name = 'paragraph -> paragraph'; }
          else if (stacked && b.matches('.btn, .ei-btn, .actions, .stack') && !a.matches('.btn, .ei-btn') && !a.closest('form, .card, li')) { want = R.spacing.textButtons; name = 'text -> buttons'; }
          else if (stacked && a.matches('header.head') && !a.closest('.hero, .card, li')) { want = a.classList.contains('next-actions') ? R.spacing.textButtons : R.spacing.headContent; name = 'heading block -> content'; }
          else if (a.matches('li') && b.matches('li') && P.matches('.list')) { want = R.spacing.listItems; name = 'list items'; }
        }
        if (want !== null) { chk('R4', a, near(g, want, T.gap), Math.round(g * 10) / 10, `${name} ${want}`); continue; }
        // every other pair: stuck check
        const lastBottom = (e) => { let m = null; const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); for (let n = w.nextNode(); n; n = w.nextNode()) { if (!n.nodeValue.trim()) continue; const r = document.createRange(); r.selectNodeContents(n); const b = r.getBoundingClientRect(); if (b.height && (m === null || b.bottom > m)) m = b.bottom; } return m; };
        const firstTop = (e) => { let m = null; const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); for (let n = w.nextNode(); n; n = w.nextNode()) { if (!n.nodeValue.trim()) continue; const r = document.createRange(); r.selectNodeContents(n); const b = r.getBoundingClientRect(); if (b.height && (m === null || b.top < m)) m = b.top; } return m; };
        const lb = stacked ? lastBottom(a) : null; const ft = stacked ? firstTop(b) : null;
        const visual = lb !== null && ft !== null ? ft - lb : g;
        const stuck = g < T.stuck && g > -T.px && visual < T.stuck && !sepBy(a, b) && !captionPair(a, b);
        chk('R4', a, !stuck, Math.round(g * 10) / 10, `gap >= ${T.stuck} between the visible content of this element and the next (stuck pair)`);
      }
    }
    if (!ctx.sweep) {
      document.querySelectorAll('.card').forEach((c) => {
        if (!visible(c) || c.closest(EXCL)) return;
        const s = cs(c); const p = [s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft].map(parseFloat);
        chk('R4', c, p.every((x) => near(x, R.spacing.cardPadding)), p.join('/'), `card padding ${R.spacing.cardPadding}`);
      });
      document.querySelectorAll('.stack').forEach((st) => {
        const b = st.querySelector('.btn'); const l = st.querySelector(':scope > a:not(.btn)');
        if (!b || !l || !visible(b) || !visible(l)) return;
        const rb = rc(b); const rl = rc(l);
        chk('R4', l, near((rb.left + rb.right) / 2, (rl.left + rl.right) / 2, 1), `link centre ${Math.round((rl.left + rl.right) / 2)}`, `button centre ${Math.round((rb.left + rb.right) / 2)}`);
      });
    }
  }

  // ---- R5 screens
  const sections = screens.filter((s) => s.kind === 'section' && visible(s.el));
  if (enabled('R5')) {
    const tone = (s) => (s.el.className.match(/tone-(\w+)/) || [])[1];
    sections.forEach((s, i) => {
      const c = cs(s.el);
      const isFirst = s.el === first;
      const tp = parseFloat(c.paddingTop); const bp = parseFloat(c.paddingBottom);
      const prev = sections[i - 1];
      const same = prev && tone(prev) === tone(s);
      chk('R5', s.el, R.screen.tones.includes(tone(s)), tone(s), R.screen.tones.join('|'));
      chk('R5', s.el, near(bp, pad), Math.round(bp * 10) / 10, `padding-bottom ${Math.round(pad * 10) / 10}`);
      const wantTop = isFirst ? val(R.pageTop) : same ? 0 : pad;
      chk('R5', s.el, near(tp, wantTop), Math.round(tp * 10) / 10, `padding-top ${Math.round(wantTop * 10) / 10}${same ? ' (same background as the previous screen)' : ''}`);
      if (prev && tone(s) === 'inverse') chk('R5', s.el, tone(prev) !== 'inverse', 'inverse after inverse', 'never two adjacent inverse screens');
      if (prev) {
        const content = (sec) => [...sec.el.querySelectorAll('*')].filter((e) => e !== sec.el && !e.matches(SKIP) && !(e.parentElement && e.parentElement.closest(EXCL)) && !e.matches('svg') && visible(e) && !e.classList.contains('inner') && (e.matches('.btn, img, input, table, form, [data-illustration]') || ownText(e).length || (() => { const bg = cs(e).backgroundColor.match(/[\d.]+/g); return (bg && (bg[3] ?? 1) > 0.05 && cs(e).backgroundColor !== cs(sec.el).backgroundColor) || ['Top', 'Bottom'].some((k) => parseFloat(cs(e)['border' + k + 'Width']) > 0); })()));
        const rr = (e) => { let x = e; while (x.parentElement && cs(x).display === 'inline') x = x.parentElement; return rc(x); };
        const a = content(prev); const b = content(s);
        if (a.length && b.length) {
          const gap = Math.min(...b.map((e) => rr(e).top)) - Math.max(...a.map((e) => rr(e).bottom));
          const want = same ? pad : 2 * pad;
          chk('R5', s.el, near(gap, want, T.screenGapExtra), Math.round(gap), `visible gap ${Math.round(want * 10) / 10}`);
        }
      }
    });
  }

  // ---- R6 widths
  if (enabled('R6')) {
    document.querySelectorAll('h2, p, h1').forEach((e) => {
      if (!visible(e) || e.closest(EXCL)) return;
      const w = rc(e).width;
      if (e.tagName === 'H1' || e.tagName === 'H2') counts.h12++;
      if (e.tagName === 'H1') return chk('R6', e, w <= R.width.pageTitle + 0.5, Math.round(w), `page-title max ${R.width.pageTitle}`);
      if (e.tagName === 'P' && e.closest('li, .card, figure, table, form, dl, fieldset, blockquote, aside, .panel, .metrics, .btn, details, .doc')) return;
      chk('R6', e, w <= R.width.text + 0.5, Math.round(w), `max ${R.width.text}`);
    });
  }

  // ---- R7 card grids
  if (enabled('R7')) {
    document.querySelectorAll('.grid, [class*="cols-"]').forEach((g) => {
      if (!visible(g) || g.closest(EXCL)) return;
      counts.grids++;
      const c = cs(g);
      if (c.display !== 'grid') return;
      const m = String(g.className).match(/cols-(\d)/);
      const cols = c.gridTemplateColumns.split(' ').length;
      const want = vw < R.breakpoints.tablet ? R.cards.mobileColumns : vw < R.breakpoints.desktop ? R.cards.tabletColumns : Number(m?.[1] ?? cols);
      chk('R7', g, cols === want && (vw < R.breakpoints.desktop || R.cards.desktopColumns.includes(cols)), `${cols} columns`, `${want} columns`);
      chk('R7', g, near(parseFloat(c.columnGap), cardGap, T.gap) && near(parseFloat(c.rowGap), cardGap, T.gap), `${c.columnGap}/${c.rowGap}`, `gap ${Math.round(cardGap * 10) / 10}`);
    });
  }

  // ---- R8 buttons
  if (enabled('R8')) {
    const btns = els.filter((e) => e.matches('.btn, .ei-btn'));
    counts.btns = btns.length;
    const accent = (v) => { const d = document.createElement('i'); d.style.color = v; document.body.appendChild(d); const x = getComputedStyle(d).color; d.remove(); return x; };
    const rootCs = getComputedStyle(document.documentElement);
    const mint = accent(rootCs.getPropertyValue('--color-accent-inverse')); const green = accent(rootCs.getPropertyValue('--color-accent'));
    for (const b of btns) {
      const r = rc(b);
      chk('R8', b, near(r.height, R.button.height, 0.75), Math.round(r.height * 10) / 10, `height ${R.button.height}`);
      chk('R8', b, parseFloat(cs(b).borderTopLeftRadius) === R.button.radius, cs(b).borderTopLeftRadius, `radius ${R.button.radius}`);
      const pw = rc(b.parentElement).width;
      if (vw < R.button.fullWidthBelow && !b.closest('.stack, header.header, .pc-nav, .ei-form, form')) chk('R8', b, near(r.width, pw, 2), Math.round(r.width), `full width ${Math.round(pw)} below ${R.button.fullWidthBelow}`);
    }
    const bySection = new Map();
    for (const b of btns) { const s = screenOf(b); if (!bySection.has(s)) bySection.set(s, []); bySection.get(s).push(b); }
    for (const [s, list] of bySection) {
      const prim = list.filter((b) => R.button.primaryClasses.some((k) => b.classList.contains(k)));
      chk('R8', s.el, prim.length <= 1, `${prim.length} primary buttons`, 'one primary per screen');
      const inverse = s.el.classList.contains('tone-inverse');
      for (const b of prim) {
        const bg = cs(b).backgroundColor;
        if (ctx.state !== 'hover+focus') chk('R8', b, inverse ? bg === mint : bg === green, bg, inverse ? 'mint on an inverse screen' : 'green on a light screen');
      }
    }
  }

  // ---- R9 lists
  if (enabled('R9')) {
    document.querySelectorAll('ul, ol').forEach((l) => {
      if (!visible(l) || l.closest(EXCL)) return;
      counts.uls++;
      chk('R9', l, cs(l).listStyleType === 'none', cs(l).listStyleType, 'list-style none (markers come from List)');
    });
    const lis = els.filter((e) => e.tagName === 'LI');
    counts.lis = lis.length;
    for (const li of lis) {
      const list = li.parentElement;
      const shared = list.classList.contains('list');
      const b = getComputedStyle(li, '::before'); const a = getComputedStyle(li, '::after');
      const has = (p) => p.content !== 'none' && p.content !== 'normal';
      if (!shared) { chk('R9', li, !has(b) && !has(a), has(b) ? `::before ${b.content.slice(0, 10)}` : has(a) ? `::after ${a.content.slice(0, 10)}` : 'no marker', 'no marker outside List'); continue; }
      if (!list.classList.contains('is-bulleted') && !list.classList.contains('is-numbered')) { chk('R9', li, false, 'class .list without is-bulleted / is-numbered', 'markers only through the List component'); continue; }
      const lr = rc(li); const lh = parseFloat(cs(li).lineHeight) || parseFloat(cs(li).fontSize) * 1.5;
      if (list.classList.contains('is-bulleted')) {
        const w = parseFloat(b.width); const h = parseFloat(b.height);
        chk('R9', li, near(w, R.list.marker, 0.5) && near(h, R.list.marker, 0.5), `${w}x${h}`, `diamond ${R.list.marker}`);
        const inverse = !!li.closest('.tone-inverse');
        const rootCs = getComputedStyle(document.documentElement);
        const d = document.createElement('i'); d.style.color = rootCs.getPropertyValue(inverse ? '--color-accent-inverse' : '--color-accent'); document.body.appendChild(d); const want = getComputedStyle(d).color; d.remove();
        chk('R9', li, b.backgroundColor === want, b.backgroundColor, inverse ? 'mint' : 'green');
        const gap = lr.left + parseFloat(cs(li).paddingLeft) - (lr.left + parseFloat(b.left) + w);
        chk('R9', li, near(gap, R.list.gapToText, 0.6), Math.round(gap * 10) / 10, `${R.list.gapToText} to text`);
        chk('R9', li, Math.abs(parseFloat(b.top) + h / 2 - lh / 2) <= 2.5, Math.round((parseFloat(b.top) + h / 2) * 10) / 10, `first line centre ${Math.round((lh / 2) * 10) / 10}`);
      } else {
        const lab = R.roles[R.list.numberedRole];
        chk('R9', li, /mono/i.test(b.fontFamily) && near(parseFloat(b.fontSize), lab.mobile, 0.3) && has(b), `${b.fontFamily.slice(0, 12)} ${b.fontSize}`, `${R.list.numberedRole} role (mono ${lab.mobile})`);
      }
      const nx = li.nextElementSibling;
      if (nx && visible(nx)) chk('R9', li, near(rc(nx).top - lr.bottom, R.list.itemGap, 0.6), Math.round((rc(nx).top - lr.bottom) * 10) / 10, `items ${R.list.itemGap}`);
    }
  }

  // ---- X page-level
  if (enabled('X')) {
    const docW = document.documentElement.scrollWidth;
    const target = (() => { let best = null; let max = vw + 1; for (const e of els) { const r = rc(e).right; if (r > max && !e.closest('[class*="track"], .viewport, .scroll, [tabindex="0"]') && !(() => { for (let a = e.parentElement; a; a = a.parentElement) { const o = cs(a).overflowX; if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') return true; } return false; })()) { max = r; best = e; } } return best; })();
    chk('X', target || document.body, docW <= vw + 1, `scrollWidth ${docW}`, `no horizontal scroll (viewport ${vw})`);
    for (const e of textEls) {
      if (!isBlockish(e)) continue;
      const c = cs(e);
      if (c.overflowX !== 'visible') continue;
      chk('X', e, e.scrollWidth <= e.clientWidth + 1, `${e.scrollWidth} > ${e.clientWidth}`, 'text inside its box');
    }
    if (ctx.state === 'default') {
      const key = (m) => m.getAttribute('name') || m.getAttribute('property') || m.getAttribute('http-equiv');
      const seen = {};
      document.head.querySelectorAll('meta[name], meta[property], link[rel=canonical], title').forEach((m) => { const k = m.tagName === 'TITLE' ? 'title' : m.tagName === 'LINK' ? 'canonical' : key(m); seen[k] = (seen[k] || 0) + 1; });
      const outside = screenOf(document.body.querySelector('main') || document.body);
      for (const [k, n] of Object.entries(seen)) { outside.counts.X.c++; if (n > 1 && !/^(og:image:|article:)/.test(k)) { outside.counts.X.v++; violations.push({ rule: 'X', screen: '(document head)', screenIndex: -1, kind: 'head', element: k, measured: `${n} tags`, required: 'one tag' }); } }
    }
  }

  counts.screens = screens.filter((s) => s.kind !== 'outside').length;
  const checkedPerRule = Object.fromEntries(ALL.map((r) => [r, screens.reduce((n, s) => n + s.counts[r].c, 0)]));
  return {
    screens: screens.map((s) => ({ index: s.index, name: s.name, kind: s.kind, counts: s.counts, appl: s.appl || {} })),
    violations,
    counts: { ...counts, checkedPerRule, textElements: textEls.length, elements: els.length },
  };
}

// Independent recount: separate traversal (TreeWalker over text nodes, XPath for sections), no shared helpers with measure().
export function recount(R) {
  const excl = R.exclusions.selector;
  let nodes = 0; let excluded = 0;
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    if (!n.nodeValue.trim()) continue;
    const p = n.parentElement;
    if (!p || p.closest('script, style, noscript, template')) continue;
    const r = p.getBoundingClientRect(); const c = getComputedStyle(p);
    if (!r.width || !r.height || r.bottom <= 0 || r.right <= 0 || c.visibility === 'hidden' || c.display === 'none') continue;
    if (p.closest(excl)) excluded++; else nodes++;
  }
  const xp = (q) => document.evaluate(q, document, null, XPathResult.NUMBER_TYPE, null).numberValue;
  const vis = (e) => { const r = e.getBoundingClientRect(); const c = getComputedStyle(e); return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && c.visibility !== 'hidden' && c.display !== 'none' && !e.closest(excl); };
  const q = (s) => [...document.querySelectorAll(s)].filter(vis).length;
  return {
    screens: xp('count(//section)') + xp('count(//header[contains(@class,"header")])') + xp('count(//footer)'),
    textNodes: nodes,
    excludedTextNodes: excluded,
    applicable: { R7: q('.grid, [class*="cols-"]'), R8: q('.btn, .ei-btn'), R9li: q('li'), R9list: q('ul, ol'), R6: q('h1, h2') },
  };
}

// Applies a deliberate violation of one rule to a target screen (used by `npm run audit -- --prove`).
export function mutate(rule, kind, idx) {
  const secs = [...document.querySelectorAll('section')];
  const hdr = document.querySelector('header.header'); const ftr = document.querySelector('footer');
  const list = [hdr, ...secs, ftr].filter(Boolean);
  const target = kind === 'last' ? list[list.length - 1] : kind === 'last-section' ? secs[secs.length - 1] : secs[Math.floor(secs.length / 2)];
  if (idx === 'info') return { name: target.tagName.toLowerCase() === 'section' ? (target.querySelector('h1, h2, h3')?.textContent.trim().replace(/\s+/g, ' ').slice(0, 60) || target.id || 'section') + (target.id ? ` #${target.id}` : '') : target.tagName.toLowerCase(), index: list.indexOf(target) };
  const host = target.querySelector(':scope > .inner') || target;
  const add = (html) => { const d = document.createElement('div'); d.innerHTML = html; const el = d.firstElementChild; host.appendChild(el); return el; };
  const P = 'font-family:Geist,sans-serif;font-size:17px;font-weight:400;line-height:1.6;margin:0;';
  if (rule === 'R1') add(`<p style="${P}margin-left:13px">Audit probe R1</p>`);
  if (rule === 'R2') add('<h1 style="font-family:Geist,sans-serif;font-size:48px;font-weight:500;margin:0">Audit probe R2</h1>');
  if (rule === 'R3') add('<p style="font-family:Geist,sans-serif;font-size:13px;font-weight:400;margin:0">Audit probe R3</p>');
  if (rule === 'R4') add(`<div><p style="${P}">Audit probe R4 a</p><p style="${P}">Audit probe R4 b</p></div>`);
  if (rule === 'R5') { target.style.paddingTop = '7px'; if (target.tagName !== 'SECTION') target.setAttribute('data-probe-r5', '1'); }
  if (rule === 'R6') add(`<p style="${P}width:900px">Audit probe R6</p>`);
  if (rule === 'R7') add('<ul class="grid cols-3" style="display:grid;grid-template-columns:repeat(2,1fr);gap:5px;margin:0;padding:0;list-style:none"><li><p style="margin:0">a</p></li><li><p style="margin:0">b</p></li></ul>');
  if (rule === 'R8') add('<a class="btn btn-primary" style="display:inline-flex;height:40px;border-radius:8px;background:rgb(1,2,3);color:#fff;font-size:15px">Audit probe R8</a>');
  if (rule === 'R9') add('<ul style="list-style:disc;margin:0;padding-left:20px"><li style="font-size:17px">Audit probe R9</li></ul>');
  if (rule === 'X') add('<div style="width:3000px;height:6px;background:#888"></div>');
  return null;
}
