// Measured layout check (CLAUDE.md rules 1-9). Every distance is measured from the first/last VISIBLE text or
// element box (never from wrapper boxes). Run after `npm run build`: npm run check:layout
// Serves dist/ itself, opens every page at 375 and 1280px and compares computed values with the rules.
// qa/baseline/layout.json is empty: every page passes.
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

  const meta = {};
  // First visible box of an element: the box of its first visible text line (Range), else the element.
  const textTop = (el) => {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      if (!n.textContent.trim() || !visible(n.parentElement)) continue;
      const r = document.createRange(); r.selectNodeContents(n);
      const b = r.getBoundingClientRect();
      if (b.height) return b.top;
    }
    return el.getBoundingClientRect().top;
  };
  // Rule 2: header size, header bottom -> page-title top (the h1 box on every page)
  const header = document.querySelector('header');
  const hb = header.getBoundingClientRect();
  if (!near(hb.height, desktop ? 76 : 56, 1.5)) fail('2-header-height', header, hb.height, desktop ? 76 : 56);
  const sections = [...main.querySelectorAll(':scope > section')].filter(visible);
  const first = sections[0];
  const h1 = first?.querySelector('h1');
  if (!h1 || !visible(h1)) fail('2-no-page-title', first ?? main, 'no visible h1 in the first screen', 'h1');
  else {
    const hr = h1.getBoundingClientRect();
    const d = hr.top - hb.bottom;
    const cs1 = getComputedStyle(h1);
    meta.headerToTitle = Math.round(d * 10) / 10;
    meta.titleSize = parseFloat(cs1.fontSize);
    meta.titleX = Math.round(hr.left * 10) / 10;
    if (!near(d, desktop ? 80 : 48, 1.5)) fail('2-page-top', h1, Math.round(d * 10) / 10, desktop ? 80 : 48);
    if (!near(hr.left, containerLeft)) fail('2-title-left', h1, Math.round(hr.left * 10) / 10, containerLeft);
    // The first visible text of the first screen is the page-title
    const firstText = textTop(first.querySelector('.inner'));
    if (!near(firstText, textTop(h1), 1.5) && firstText < textTop(h1) - 1.5) fail('2-first-text-not-title', first, `text starts ${Math.round(textTop(h1) - firstText)}px above the h1`, 'page-title first');
    // first screen: only title, one paragraph, 1-2 buttons, optional illustration
    const hero = first.querySelector('.hero');
    if (!hero) fail('2-first-screen-hero', first, 'first section is not the shared Hero', 'Hero');
    else {
      const copy = hero.querySelector('.copy');
      const paras = [...copy.querySelectorAll('p')].filter(visible);
      const btns = [...copy.querySelectorAll('.btn')].filter(visible);
      if (paras.length !== 1) fail('2-first-screen-content', hero, `${paras.length} paragraphs`, 1);
      if (btns.length < 1 || btns.length > 2) fail('2-first-screen-content', hero, `${btns.length} buttons`, '1-2');
      const onPlatform = location.pathname === '/platform';
      const points = copy.querySelector('.points');
      // CLAUDE.md A2: only /platform may hold a bulleted list of up to 2 items between the text and the buttons
      if (points && (!onPlatform || points.querySelectorAll(':scope > li').length > 2)) fail('2-first-screen-list', points, onPlatform ? 'more than 2 items' : 'list outside /platform', 'A2: /platform only, up to 2 items');
      const stray = [...copy.querySelectorAll('ul, ol, dl, table, .t-label, a:not(.btn), small, time, figure, img, svg')].filter((e) => visible(e) && !e.closest('.btn') && !(onPlatform && e.closest('.points')));
      if (stray.length) fail('2-first-screen-content', stray[0], stray.map((e) => e.tagName.toLowerCase()).join(','), 'nothing but title, text, buttons');
      if (copy.querySelectorAll('h2, h3').length) fail('2-first-screen-content', copy, 'subheading in the first screen', 'none');
      const lead = paras[0];
      if (lead) {
        const g = lead.getBoundingClientRect().top - hr.bottom;
        meta.titleToText = Math.round(g * 10) / 10;
        if (!near(g, 16)) fail('4-title-text', h1, Math.round(g * 10) / 10, 16);
        if (btns[0] && points && visible(points)) {
          const pr = points.getBoundingClientRect();
          const gl = pr.top - lead.getBoundingClientRect().bottom;
          const gb = btns[0].getBoundingClientRect().top - pr.bottom;
          meta.textToList = Math.round(gl * 10) / 10;
          meta.listToButtons = Math.round(gb * 10) / 10;
          if (!near(gl, 32)) fail('2-text-list', lead, Math.round(gl * 10) / 10, 32);
          if (!near(gb, 32)) fail('2-list-buttons', points, Math.round(gb * 10) / 10, 32);
        } else if (btns[0]) {
          const g2 = btns[0].getBoundingClientRect().top - lead.getBoundingClientRect().bottom;
          meta.textToButtons = Math.round(g2 * 10) / 10;
          if (!near(g2, 32)) fail('4-text-buttons', lead, Math.round(g2 * 10) / 10, 32);
        }
        if (lead.getBoundingClientRect().width > 720.5) fail('6-text-width', lead, Math.round(lead.getBoundingClientRect().width), 720);
      }
      if (hr.width > 900.5) fail('6-h1-width', h1, Math.round(hr.width), 900);
    }
  }
  // Illustration frames (every hero, from 1024px): top = page-title top, same ratio everywhere, 50/50
  main.querySelectorAll('.hero').forEach((hero) => {
    const art = hero.querySelector('[data-illustration]');
    const title = hero.querySelector('h1');
    if (!art || !visible(art) || !title) return;
    const ar = art.getBoundingClientRect();
    const ratio = Math.round((ar.width / ar.height) * 1000) / 1000;
    if (hero.closest('section') === first) { meta.illustrationTop = Math.round((ar.top - title.getBoundingClientRect().top) * 10) / 10; meta.illustrationRatio = ratio; }
    if (!near(ar.top, title.getBoundingClientRect().top, 2)) fail('2-illustration-top', art, Math.round(ar.top - title.getBoundingClientRect().top), 0);
    if (Math.abs(ratio - 460 / 512) > 0.02) fail('2-illustration-ratio', art, ratio, 460 / 512);
    const copy = hero.querySelector('.copy').getBoundingClientRect();
    if (desktop) {
      if (Math.abs(copy.width - ar.width) > 2) fail('2-illustration-split', art, `${Math.round(copy.width)}/${Math.round(ar.width)}`, '50/50');
      if (!near(ar.left - copy.right, 64, 2)) fail('2-illustration-gap', art, Math.round(ar.left - copy.right), 64);
    }
  });
  // Exactly one page-title per page
  if (main.querySelectorAll('h1').length > 1 && location.pathname !== '/styleguide') fail('3-one-h1', main, main.querySelectorAll('h1').length, 1);
  // No eyebrow/label directly above any h1 or h2
  const isLabelish = (e) => {
    if (!e || !visible(e)) return false;
    const c = getComputedStyle(e);
    return /\b(t-label|eyebrow|kicker)\b/.test(e.className) || (c.textTransform === 'uppercase' && /mono/i.test(c.fontFamily) && parseFloat(c.fontSize) <= 13);
  };
  main.querySelectorAll('h1, h2').forEach((h) => {
    if (!visible(h)) return;
    const hbx = h.getBoundingClientRect();
    let prev = h.previousElementSibling;
    if (!prev && h.parentElement.classList.contains('head')) prev = h.parentElement.previousElementSibling;
    if (!prev && h.parentElement.classList.contains('head')) prev = h.parentElement.parentElement.previousElementSibling;
    // any label-like element ending within 48px above the heading, in the same column
    const near48 = [...h.closest('section').querySelectorAll('*')].filter((e) => isLabelish(e) && e.children.length === 0 && e.getBoundingClientRect().bottom <= hbx.top + 1 && hbx.top - e.getBoundingClientRect().bottom < 48 && e.getBoundingClientRect().left < hbx.left + 40 && e.getBoundingClientRect().right > hbx.left && !e.closest('.card, li, .panel, form, figure, table, nav'));
    if (isLabelish(prev) || near48.length) fail('3-eyebrow-above-heading', h, (near48[0] ?? prev).textContent.trim().slice(0, 30), 'no label above headings');
  });

  // Rule 5: section padding, tones
  sections.forEach((s, i) => {
    const cs = getComputedStyle(s);
    const exp = desktop ? 112 : 56;
    const pb = parseFloat(cs.paddingBottom);
    const pt = parseFloat(cs.paddingTop);
    if (!near(pb, exp, 1.5)) fail('5-section-padding-bottom', s, pb, exp);
    const tone = s.className.match(/tone-(\w+)/)?.[1];
    const prevTone = sections[i - 1]?.className.match(/tone-(\w+)/)?.[1];
    if (i > 0 && prevTone === tone && !near(pt, 0, 1.5)) fail('5-doubled-gap', s, `top padding ${pt}`, 0);
    if (i > 0 && prevTone !== tone && !near(pt, exp, 1.5)) fail('5-section-padding-top', s, pt, exp);
    if (i > 0) {
      // measured by the eye: last visible content of the previous screen -> first visible content of this one
      // visible = text, controls, media, the illustration frame, and any box with a background or a border (cards, panels, rules)
      const boxed = (e) => { const c = getComputedStyle(e); const bg = c.backgroundColor.match(/[\d.]+/g)?.map(Number); const hasBg = bg && (bg[3] ?? 1) > 0.05 && getComputedStyle(sec0(e)).backgroundColor !== c.backgroundColor; return hasBg || ['Top', 'Bottom'].some((s) => parseFloat(c['border' + s + 'Width']) > 0 && c['border' + s + 'Style'] !== 'none'); };
      const sec0 = (e) => e.closest('section');
      const content = (sec) => [...sec.querySelectorAll('*')].filter((e) => e !== sec && !e.closest('svg') && !['SCRIPT', 'STYLE', 'SVG'].includes(e.tagName) && visible(e) && !e.classList.contains('inner') && !e.closest('[aria-hidden="true"]') && (e.matches('.btn, img, input, table, form, [data-illustration]') || [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) || boxed(e)));
      const rect = (e) => { let x = e; while (x.parentElement && getComputedStyle(x).display === 'inline') x = x.parentElement; return x.getBoundingClientRect(); };
      const a = content(sections[i - 1]); const b = content(s);
      if (a.length && b.length) {
        const bottom = Math.max(...a.map((e) => rect(e).bottom));
        const top = Math.min(...b.map((e) => rect(e).top));
        const be = a.find((e) => rect(e).bottom === bottom); const te = b.find((e) => rect(e).top === top);
        const g = top - bottom;
        const want = prevTone === tone ? exp : 2 * exp;
        meta.screenGaps = (meta.screenGaps ?? []).concat(Math.round(g));
        if (Math.abs(g - want) > 3) fail('5-screen-gap', s, Math.round(g), `${want} (last visible: ${be.tagName.toLowerCase()}.${String(be.className).slice(0, 20)} -> first visible: ${te.tagName.toLowerCase()}.${String(te.className).slice(0, 20)})`);
      }
    }
    if (!['default', 'sunken', 'inverse'].includes(tone)) fail('5-tone', s, tone, 'default|sunken|inverse');
    const prev = sections[i - 1];
    if (prev && tone === 'inverse' && prev.classList.contains('tone-inverse')) fail('C-adjacent-inverse', s, 'inverse after inverse', 'never');
  });

  // Rule 3: font sizes
  const allowed = desktop ? [48, 40, 24, 17, 15, 12, 72] : [32, 28, 20, 16, 14, 12, 48];
  const roleSize = { H2: desktop ? 40 : 28, H3: desktop ? 24 : 20 };
  const seenSize = new Set();
  // Every visible text element of the page (header, main, footer) must render exactly one of the 7 role sizes (tolerance 0.1px).
  document.body.querySelectorAll('*').forEach((el) => {
    if (el.closest('svg') || ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME'].includes(el.tagName)) return;
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (!hasText || !visible(el)) return;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    const ok = allowed.some((a) => near(fs, a, 0.1));
    if (!ok) { const k = `${el.tagName}.${el.className}.${Math.round(fs * 10)}`; if (!seenSize.has(k)) { seenSize.add(k); fail('3-font-size', el, fs, allowed.join('/')); } }
    const want = el.tagName === 'H2' ? roleSize.H2 : el.tagName === 'H3' ? roleSize.H3 : el.tagName === 'H1' ? (desktop ? 48 : 32) : 0;
    if (want && !near(fs, want, 0.1)) fail('3-heading-role', el, fs, want);
  });
  main.querySelectorAll('h1').forEach((el) => {
    if (!visible(el)) return;
    const fs = parseFloat(getComputedStyle(el).fontSize);
    const okSizes = desktop ? [48] : [32];
    if (!okSizes.some((a) => near(fs, a, 0.1))) fail('3-h1', el, fs, okSizes.join('/'));
    // Rule 6: hero H1 max 900
    if (el.getBoundingClientRect().width > 900.5) fail('6-h1-width', el, el.getBoundingClientRect().width, 900);
  });

  // Rule 1: headings and leads start at the container's left edge
  const edgeEls = [...main.querySelectorAll('h1, h2, header.head > *')].filter(visible);
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
    if (next && next.classList.contains('lead') && visible(next) && !near(gap(h, next), 16)) fail('4-title-lead', h, Math.round(gap(h, next)), 16);
  });
  // lead -> buttons (the buttons follow the lead, or the head that holds it)
  main.querySelectorAll('.lead').forEach((lead) => {
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
    // text -> buttons is 32 (also when the buttons sit next to the head in a row that wrapped)
    const exp = next.matches('.btn, .action-stack') || next.querySelector(':scope > .btn:not(.btn-text)') ? 32 : 40;
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
  main.querySelectorAll('h2, .lead, p').forEach((el) => {
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
  // A text link under a button is centred on the button's width (shared ActionStack)
  main.querySelectorAll('.action-stack').forEach((st) => {
    const btn = st.querySelector('.btn'); const link = st.querySelector(':scope > a:not(.btn)');
    if (!btn || !link || !visible(btn) || !visible(link)) return;
    const b = btn.getBoundingClientRect(); const l = link.getBoundingClientRect();
    if (!near((b.left + b.right) / 2, (l.left + l.right) / 2, 1)) fail('8-link-centred', link, `link centre ${Math.round((l.left + l.right) / 2)}`, `button centre ${Math.round((b.left + b.right) / 2)}`);
    if (!near(b.width, l.width, 1)) fail('8-link-width', link, Math.round(l.width), `button width ${Math.round(b.width)}`);
  });
  // Rule 9: lists. Only ui/List markers: bulleted = diamond 8px (accent; mint on inverse), 12px to the text, 8px between items,
  // aligned to the first text line; numbered = label role "01". No list-style, no other li markers.
  const rgbOf = (v) => { const d = document.createElement('i'); d.style.color = v; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; };
  main.querySelectorAll('ul, ol').forEach((l) => {
    if (!visible(l)) return;
    const ls = getComputedStyle(l).listStyleType;
    if (ls !== 'none') fail('9-list-style', l, ls, 'none');
  });
  main.querySelectorAll('li').forEach((li) => {
    if (!visible(li)) return;
    const list = li.parentElement;
    const isShared = list.classList.contains('list');
    for (const pseudo of ['::before', '::after']) {
      const c = getComputedStyle(li, pseudo).content;
      if (c === 'none' || c === 'normal') continue;
      if (!isShared || pseudo === '::after') { fail('9-list-marker', li, `${pseudo} ${c.slice(0, 12)} outside ui/List`, 'no marker'); continue; }
    }
    if (!isShared) return;
    const b = getComputedStyle(li, '::before');
    const lr = li.getBoundingClientRect();
    const lineH = parseFloat(getComputedStyle(li).lineHeight) || parseFloat(getComputedStyle(li).fontSize) * 1.5;
    if (list.classList.contains('is-bulleted')) {
      const w = parseFloat(b.width), h = parseFloat(b.height);
      if (!near(w, 8, 0.5) || !near(h, 8, 0.5)) fail('9-bullet-size', li, `${w}x${h}`, '8x8');
      const inverse = !!li.closest('.tone-inverse');
      const want = rgbOf(inverse ? getComputedStyle(document.documentElement).getPropertyValue('--color-accent-inverse') : getComputedStyle(document.documentElement).getPropertyValue('--color-accent'));
      if (b.backgroundColor !== want) fail('9-bullet-colour', li, b.backgroundColor, want + (inverse ? ' (mint)' : ' (green)'));
      const textLeft = lr.left + parseFloat(getComputedStyle(li).paddingLeft);
      const gapToText = textLeft - (lr.left + parseFloat(b.left) + w);
      if (!near(gapToText, 12, 0.6)) fail('9-bullet-gap', li, Math.round(gapToText * 10) / 10, 12);
      const center = parseFloat(b.top) + h / 2;
      if (Math.abs(center - lineH / 2) > 2.5) fail('9-bullet-align', li, Math.round(center * 10) / 10, `first line centre ${Math.round(lineH / 2 * 10) / 10}`);
    } else if (list.classList.contains('is-numbered')) {
      if (!/mono/i.test(b.fontFamily) || !near(parseFloat(b.fontSize), 12, 0.3)) fail('9-number-role', li, `${b.fontFamily.slice(0, 12)} ${b.fontSize}`, 'label role (mono 12)');
    }
    const next = li.nextElementSibling;
    if (next && visible(next) && !near(next.getBoundingClientRect().top - lr.bottom, 8, 0.6)) fail('9-list-item-gap', li, Math.round((next.getBoundingClientRect().top - lr.bottom) * 10) / 10, 8);
  });
  return { out, meta };
}

const server = await serve();
const port = server.address().port;
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});
const found = [];
const metas = [];
for (const vp of VIEWPORTS) {
  for (const pg of PAGES) {
    const ctx = await browser.newContext({ viewport: { width: vp, height: 900 } });
    const page = await ctx.newPage();
    const reqs = [];
    page.on('request', (r) => reqs.push(new URL(r.url()).pathname));
    await page.goto(`http://localhost:${port}${pg}`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    const { out: res, meta } = await page.evaluate(`(${measure.toString()})(${vp})`);
    for (const r of res) found.push({ page: pg, vp, ...r });
    metas.push({ page: pg, vp, ...meta });
    if (vp < 768 && reqs.some((u) => u.startsWith('/illustrations/'))) found.push({ page: pg, vp, rule: 'E-illustration-on-mobile', desc: 'request', measured: reqs.filter((u) => u.startsWith('/illustrations/')).join(','), expected: 'none' });
    await ctx.close();
  }
}
await browser.close();
server.close();

// Cross-page: page-title size and left x identical on every page; same illustration frame ratio; table on request
for (const vp of VIEWPORTS) {
  const m = metas.filter((x) => x.vp === vp && x.titleSize !== undefined);
  for (const k of ['titleSize', 'titleX', 'headerToTitle', 'titleToText']) {
    const vals = [...new Set(m.map((x) => x[k]).filter((v) => v !== undefined))];
    if (vals.length > 1) found.push({ page: 'all', vp, rule: `X-same-${k}`, desc: m.map((x) => `${x.page}=${x[k]}`).join(' '), measured: vals.join('/'), expected: 'identical' });
  }
  const ratios = [...new Set(m.map((x) => x.illustrationRatio).filter((v) => v !== undefined))];
  if (ratios.length > 1) found.push({ page: 'all', vp, rule: 'X-same-illustrationRatio', desc: m.map((x) => `${x.page}=${x.illustrationRatio}`).join(' '), measured: ratios.join('/'), expected: 'identical' });
}
if (process.env.TABLE) {
  fs.writeFileSync(process.env.TABLE, JSON.stringify(metas, null, 1));
}

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
