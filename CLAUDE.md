# TCG site — rules. Read fully before ANY change. No exceptions.

## Mandatory workflow
1. Before any edit, new page or new block: read this file, docs/site-spec.md,
   src/styles/tokens.css.
2. Start every reply that changes code with "Rules check:" and name the rules
   below that apply.
3. Build only from the primitives (src/components/ui) and the listed blocks
   (qa/rules/blocks.json). Blocks never set size, spacing or type themselves. A new block,
   primitive or variation needs owner approval first.
4. Before reporting done: npm run lock, npm run check, npm run build, npm run check:layout
   pass with empty baselines.
5. Never edit protected files without owner approval: CLAUDE.md, .claude/, .github/,
   .githooks/, package.json, scripts/ (check-design, lock, lock-selftest, gen-scale, audit),
   qa/rules/ (rules.json, blocks.json), qa/baseline/, qa/lock-fixtures/, src/styles/tokens.css.
6. Branch `next` only. Never touch `main` or /legacy. Reports in Russian.
7. Work is done only when `npm run audit` passes with full coverage and 0 violations.
   Paste its COVERAGE line in every report. Never report a page or screen as checked
   unless the audit checked it.
8. The rules are enforced when the code is written (the lock, scripts/lock.mjs): a Claude Code
   hook checks every Edit/Write before the file is written, a git pre-commit hook checks the
   staged tree, the GitHub Action checks every push and PR. Source files change through
   Edit/Write only, never through shell redirection, sed -i, cp, mv or inline scripts.

## 1. Edges
Container max 1200px, centred. Side gutter 20px mobile / 40px desktop.
Every heading, text, button starts at the container's left edge.
Two-column layouts: the left column starts at that edge. Mobile: one column.

## 2. First screen (identical on every page)
Contains only: page-title, one paragraph of text, 1–2 buttons, and optionally an
illustration (desktop only). No eyebrow/label, no lists, no meta strips, no
metrics, no extra links. Anything else goes to the next block.
Header 56px mobile / 76px desktop, sticky.
Header bottom -> page-title top: 48px mobile / 80px desktop.
page-title -> text 16px; text -> buttons 32px; between buttons 12/16px.
With illustration (from 1024px): text column left, illustration right, 50/50,
gap 64px; both columns top-aligned (illustration top = page-title top);
illustration frame has the same aspect ratio on every page.
page-title max width 900px; text max width 720px.

## 3. Type — 7 roles only (mobile/desktop px)
page-title 32/48 (h1, first screen only) ·
section-title 28/40 (h2, every screen after the first) ·
card-title 20/24 (h3: cards, steps, FAQ questions, subheads in the guide) ·
text 16/17 (all running text) ·
small 14/15 (notes, captions, disclaimers, meta) ·
label 12 mono uppercase (numbers "01", statuses, tags; never above headings) ·
metric 48/72 (big figures) ·
control 14/15 (button and link text, D1: small size, sans, weight 500, no uppercase; only .btn, .ei-btn and <a>).
No other sizes. No other roles. No eyebrows above any heading on any screen.
No bold inside text (D2): no <b>/<strong>, no font weight 600 or 700 anywhere.

## 4. Spacing between elements (px)
heading -> text 16 · text -> buttons 32 everywhere, in cards and forms too (D4) ·
between buttons 12 mobile / 16 desktop ·
heading block -> screen content 40 · paragraph -> paragraph 16 ·
card title -> card text 12 everywhere (h3/h4), heading (h1/h2) -> text 16 (D6) ·
between cards 16 mobile / 32 desktop · card padding 24 · list items 8.
Spacing scale (D5): every gap is one of 8, 12, 16, 24, 32, 40; screens 56/112; card grid 16/32.
Named fixed values: header 56/76, page top 48/80, split gap 64, article nav 280. Nothing else exists.

## 5. Screens
Padding top and bottom 56px mobile / 112px desktop.
Gap between two screens is always 56/112: when neighbours share a background,
the second has no top padding. Backgrounds: light, sunken, inverse only.
Two inverse screens are never adjacent.

## 6. Text width
section-title and text max 720px (D3: all running text: p, li, dd, blockquote, card text,
list text, article). Table cells are exempt. Tables, card grids, forms use the full container.

## 7. Cards
Columns: 1 mobile, 2 tablet, 2/3/4 desktop. Shared Grid only.

## 8. Buttons
Height 52px; full width mobile, auto desktop. One primary per screen.
Mint primary on inverse screens. Radius 0 everywhere.

## 9. Lists
Bulleted: green diamond 8px (mint on inverse), 12px to text, 8px between items,
aligned to the first text line. Numbered: label role "01", "02".
No other markers.

## Allowed variations (only these)
A. First screen: with or without illustration (rule 2).
A2. /platform only: the first screen may hold a bulleted list of up to 2 items between the text and the buttons. Text -> list 32px, list -> buttons 32px, list rule 9 applies.
B. Screen layout: stacked | split (head 5/12 left, content 7/12 right, gap 64,
   from 1024px) | article (nav 280px + text 720px; /regulations, legal, blog).
C. Background per screen within rule 5.
D. Blocks and order from the page-type template in docs/site-spec.md.

## 10. The lock (scripts/lock.mjs, qa/rules/blocks.json)
Size, spacing and type exist only in the primitives (src/components/ui), tokens.css and base.css.
L1 Outside those files these CSS properties are forbidden: margin, padding, gap, font, line-height,
letter-spacing, text-transform, width, height (min/max), inset/top/right/bottom/left, grid-template,
flex-basis, border-radius, transform. Blocks may use only display, grid-area, grid-template-areas, align-*,
justify-*, place-*, order, flex-direction, flex-wrap, visibility, overflow (never clip), colours and borders
through var(--c-*) and var(--bw-*).
L2 In the primitives and base.css values are tokens, 0, auto, percentages. No raw px/rem/em/vw.
L3 Everywhere: no style="", no <style is:global>, no :global(), no !important, no element.style or setProperty,
no <b>/<strong>, no redefining a primitive's class (.t-*, .btn, .list, .grid, .card, .stack, .head) in a block.
L4 Pages import only listed blocks and layouts; blocks import only listed primitives, listed blocks and seo/JsonLd.
A block or primitive that is not in qa/rules/blocks.json is an error.
L5 Every error names file, line, value, rule and the allowed alternative.
Gates: write time (.claude hooks on Edit/Write/MultiEdit and Bash), commit (.githooks/pre-commit on the staged
tree), merge (GitHub Action: lock, lock:selftest, check, build, check:layout, audit).
D7 Approved exclusions: svg and [data-illustration]; aria-hidden glyph-only elements for the edge rule (R1).
