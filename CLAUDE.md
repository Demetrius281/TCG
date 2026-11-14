# TCG site — rules. Read fully before ANY change. No exceptions.

## Mandatory workflow
1. Before any edit, new page or new block: read this file, docs/site-spec.md,
   src/styles/tokens.css.
2. Start every reply that changes code with "Rules check:" and name the rules
   below that apply.
3. Build only from existing blocks and shared elements. A new block or a new
   variation needs owner approval first.
4. Before reporting done: npm run check, npm run build, npm run check:layout pass
   with empty baselines.
5. Never edit protected files without owner approval: CLAUDE.md, .claude/,
   .github/, scripts/check-design.mjs, qa/rules/, qa/baseline/.
6. Branch `next` only. Never touch `main` or /legacy. Reports in Russian.

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
metric 48/72 (big figures).
No other sizes. No other roles. No eyebrows above any heading on any screen.

## 4. Spacing between elements (px)
heading -> text 16 · text -> buttons 32 · between buttons 12 mobile / 16 desktop ·
heading block -> screen content 40 · paragraph -> paragraph 16 ·
card title -> card text 12 · between cards 16 mobile / 32 desktop ·
card padding 24 · list items 8.

## 5. Screens
Padding top and bottom 56px mobile / 112px desktop.
Gap between two screens is always 56/112: when neighbours share a background,
the second has no top padding. Backgrounds: light, sunken, inverse only.
Two inverse screens are never adjacent.

## 6. Text width
section-title and text max 720px. Tables, card grids, forms use the full container.

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
B. Screen layout: stacked | split (head 5/12 left, content 7/12 right, gap 64,
   from 1024px) | article (nav 280px + text 720px; /regulations, legal, blog).
C. Background per screen within rule 5.
D. Blocks and order from the page-type template in docs/site-spec.md.
