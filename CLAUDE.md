# TCG site — rules for every session

Read this file, docs/site-spec.md and src/styles/tokens.css before any work.
Branch `next` only. Never touch `main` or /legacy. Reports to the owner in Russian.
The design system wins over legacy. Legacy is a reference for texts, forms, illustrations only.

## Universal rules (every page, no exceptions)
1. Edge. Container 1200px, gutter 20px mobile / 40px desktop. Every label, heading,
   lead and paragraph starts at the container's left edge. In two-column layouts the
   left column starts at that edge. Mobile: one column, left-aligned.
2. Page top. Header 56px mobile / 76px desktop. Header bottom -> first element of the
   page: 48px mobile / 80px desktop, on every page (token --page-top).
3. Type. Only these roles (mobile/desktop px): display 36/60 (home, /platform H1),
   h1 32/48 (other H1), h2 28/40 (section title), h3 20/24 (card, step, FAQ question),
   h4 17/18 (subhead in long text), lead 18/20, body 16/17, small 14/15, caption 13,
   label 12 mono uppercase. No other font sizes anywhere.
4. Text spacing (px): label->title 16; title->lead 16; lead->buttons 32;
   between buttons 12 mobile / 16 desktop; section head->content 40;
   paragraph->paragraph 16; card title->card text 12; h4 in long text 32 above,
   12 below; list items 8.
5. Sections. Padding top and bottom 56px mobile / 112px desktop (--section-y).
   Background: light, sunken or inverse only.
6. Text width. h2, lead, paragraphs max 720px (--container-prose).
   Hero H1 max 900px (--hero-title-max). Tables, card grids, forms use full container.
7. Cards. Gap 16px mobile / 32px desktop (--grid-gap). Card padding 24px.
   Columns: 1 mobile, 2 tablet, 2/3/4 desktop.
8. Buttons. Height 52px; full width on mobile, auto on desktop. One primary per screen.
   Mint primary on inverse sections. Radius 0.

## Allowed variations (only these)
A. Hero: display (home, /platform; animation right, desktop only) | page (no art) |
   page with art (text and art 50/50 from 1024px).
B. Section layout: stacked (head above, content full width) | split (head 5/12 left,
   content 7/12 right from 1024px, gap 64px) | article (nav 280px left, text column
   720px; only /regulations, legal pages, blog posts).
C. Section tone chosen per page; two inverse sections never adjacent.
D. Blocks and their order come from the page-type template in docs/site-spec.md:
   home, service, due-diligence, platform, guide, legal, blog post.
E. Illustrations: hero only, desktop only (>=768px), never loaded on mobile,
   static under prefers-reduced-motion.

## How to build
- Section headings only through SectionHead. Sections only through Section.
  Card grids only through the shared Grid. Buttons only through Button/WhatsAppLink.
- Pages only from existing blocks. A new block or a new variation needs owner approval.
- Text only in content files (src/content). One copy of every text in the DOM.
- No hex/px outside tokens.css, no inline styles, no font-size outside base.css roles.
- Before reporting done: `npm run check` and `npm run build` must pass.
- Never edit CLAUDE.md, .claude/, .github/, scripts/check-design.mjs, qa/rules/,
  qa/baseline/ without owner approval.
