# TCG website — build spec (next)

Site: twinsconsulting.group (PT Twins Consulting Group, Bali).
Positioning: "Verified data, capital access and development strategy for property investors in Bali."
Business model: Intelligence (online DD + data platform) → Advisory (paid consulting) → Capital (buyouts of undervalued and unfinished properties with investors). Primary audience: investors.

## 1. Stack
- Astro, latest stable, version pinned in package-lock. `output: 'static'`, TypeScript strict.
- Plain CSS with custom properties. Styles live inside components. No Tailwind, no React.
- Interactivity: plain TypeScript in component `<script>` tags.
- Content: YAML for pages built from blocks, Markdown/MDX for long text. Zod schemas in `src/content.config.ts`. A wrong field must fail the build.
- Hosting: Vercel. Every pushed branch gets a preview.
- Analytics: keep GTM-P9JVP4SF.
- Fonts: Geist and Geist Mono, self-hosted (files already in the repo).

## 2. Hard rules
1. One Header and one Footer for the whole site, rendered only in `src/layouts/Base.astro`.
2. Pages are lists of blocks in content files. Page files contain no markup or styles of their own.
3. Every colour, font size, spacing, radius and shadow comes from `src/styles/tokens.css`. No other values anywhere.
4. No inline styles.
5. No duplicated text for mobile and desktop. One text, responsive layout.
6. Mobile-first. On mobile, all text is left-aligned.
7. Breakpoints: `min-width` only: 480, 768, 1024, 1280px.
8. Navigation, contacts and WhatsApp message templates each have one source file in `src/data/`.
9. Do not invent texts, facts or numbers. Missing copy is `[TEXT]`.
10. Never push to `main`. Work only on the branch you were given. Changes to tokens, components or layouts need the owner's approval.

## 3. Structure
src/styles/: tokens.css, base.css, prose.css
src/data/: site.ts (name, address, email, WhatsApp, GTM ID), navigation.ts (header + footer, single source), whatsapp.ts (message templates by key)
src/content.config.ts
src/content/: home/index.yaml, services/<slug>.yaml, legal/*.md
src/components/: layout/ (Header, MobileMenu, Footer, Breadcrumbs, SkipLink), ui/ (Button, WhatsAppLink, Card, Accordion, Icon), blocks/ (one component per block type), seo/ (Head, JsonLd)
src/layouts/: Base.astro, BlockPage.astro, Guide.astro, Legal.astro
src/pages/
public/: assets/brand/, fonts/, og/, robots.txt, llms.txt
docs/: site-spec.md

## 4. Sitemap
Header: Platform · Buyers · Owners · Regulations · Blog. Buyers and Owners are dropdowns with no page of their own.

| Menu | Page | URL | Status |
|---|---|---|---|
| Platform | Investor page | /platform | Port as is + "why now" section (2026 regulation changes) |
| Buyers | Preliminary Due Diligence | /due-diligence | Port as is, incl. order form |
| Buyers | Acquisition Advisory | /acquisition-advisory | New, service template |
| Owners | Distressed Property Buyout | /distressed-property-buyout | New, service template |
| Owners | Go-to-Market for Developers | /go-to-market | New, service template; separate section for launched projects that do not sell |
| Owners | Land Monetization Strategy | /land | Port as is; link to /go-to-market as a monetization option |
| Regulations | Guide | /regulations | Port as is |
| Blog | List + articles | /blog, /blog/<slug> | After launch |
| Footer | Privacy Policy, Terms | /privacy-policy, /terms | Terms is new and includes a Conflict of Interest Policy section |

Internal links point to the new paths (/due-diligence, /regulations); the 301 redirects exist only for old external links.

Owner decisions (2026-11): where the system and legacy differ, the system wins everywhere: the smaller system heading scale, the mint primary button on dark sections, radius 0 and the 1200px container all stay. Legacy defines composition only.

Two-column form blocks (order, inquiry) share the option `sticky_copy` (default true): from 1024px the copy column stays in view below the sticky header (class `.sticky-copy` in base.css); on mobile the columns stack.

"Port as is" means content and logic stay the same, and the page is rebuilt on the shared tokens and components.
Prices appear only on /due-diligence ($90 / $150 / $250).
Footer: services grouped as Buyers / Owners and Developers (no Investors group); Resources column: Regulations, Platform, Blog; Privacy Policy, Terms, Conflict of Interest Policy; contacts (WhatsApp, email, address).

301 redirects (vercel.json):
- /services/property-legal-audit → /regulations
- /services/distressed-property → /distressed-property-buyout
- /services/due-diligence → /due-diligence
- /property-check → /due-diligence

## 5. Design tokens — src/styles/tokens.css
Style: warm light background, dark green accent, square corners, Geist, mono labels.

:root {
  --color-bg: #F6F5F1;
  --color-surface: #FFFFFF;
  --color-sunken: #ECEAE4;
  --color-inverse: #0F1413;
  --color-inverse-raised: #2A3331;
  --color-text: #0F1413;
  --color-text-2: #3E4744;
  --color-text-3: #5B6461;
  --color-on-inverse: #E8E6E0;
  --color-on-inverse-2: #B9C0BD;
  --color-border: #E2E0D9;
  --color-border-strong: #D9D6CE;
  --color-border-inverse: #2F3A38;
  --color-accent: #0E5A55;
  --color-accent-hover: #0F1413;
  --color-accent-inverse: #5FD3B6;
  --color-ok: #0E5A55;
  --color-warn: #8A5D0B;
  --color-danger: #A23B2A;
  --font-sans: 'Geist', system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-mono: 'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace;
  --fs-display: clamp(2.25rem, 1.6630rem + 2.6087vw, 3.75rem);
  --fs-h1: clamp(2rem, 1.6087rem + 1.7391vw, 3rem);
  --fs-h2: clamp(1.75rem, 1.4565rem + 1.3043vw, 2.5rem);
  --fs-h3: clamp(1.25rem, 1.1522rem + 0.4348vw, 1.5rem);
  --fs-h4: clamp(1.0625rem, 1.0380rem + 0.1087vw, 1.125rem);
  --fs-lead: clamp(1.125rem, 1.0761rem + 0.2174vw, 1.25rem);
  --fs-body: clamp(1rem, 0.9755rem + 0.1087vw, 1.0625rem);
  --fs-small: clamp(0.875rem, 0.8505rem + 0.1087vw, 0.9375rem);
  --fs-caption: 0.8125rem;
  --fs-label: 0.75rem;
  --fs-metric: clamp(3rem, 2.4130rem + 2.6087vw, 4.5rem);
  --space-1: 0.25rem; --space-2: 0.5rem; --space-3: 0.75rem; --space-4: 1rem;
  --space-5: 1.25rem; --space-6: 1.5rem; --space-8: 2rem; --space-10: 2.5rem;
  --space-12: 3rem; --space-16: 4rem; --space-20: 5rem; --space-24: 6rem;
  --container: 75rem;
  --container-prose: 45rem;
  --gutter: clamp(1.25rem, 0.7609rem + 2.1739vw, 2.5rem);
  --section-y: clamp(3.5rem, 2.1304rem + 6.0870vw, 7rem);
  --grid-gap: clamp(1rem, 0.6087rem + 1.7391vw, 2rem);
  --radius: 0;
  --radius-full: 999px;
  --control-h: 3.25rem;
  --control-h-lg: 3rem;
  --header-h: 3.5rem;
  --header-h-lg: 4.75rem;
  --shadow-menu: 0 18px 40px -24px rgba(15, 20, 19, 0.45);
  --shadow-lift: 0 10px 24px -14px rgba(15, 20, 19, 0.6);
  --ease: 200ms ease;
  --z-header: 40; --z-menu: 50; --z-overlay: 60;
}

Type scale (px, size/line-height, mobile 360 → desktop 1280):
| Level | Mobile | Desktop | Weight | Tracking | Font | Use |
|---|---|---|---|---|---|---|
| display | 36/40 | 60/64 | 500 | -0.025em | Geist | h1 on home and /platform |
| h1 | 32/36 | 48/52 | 500 | -0.025em | Geist | h1 elsewhere |
| h2 | 28/32 | 40/44 | 500 | -0.02em | Geist | section titles |
| h3 | 20/26 | 24/30 | 500 | -0.012em | Geist | cards, steps, FAQ |
| h4 | 17/24 | 18/26 | 600 | 0 | Geist | subheads in long text |
| lead | 18/28 | 20/30 | 400 | 0 | Geist | paragraph under a title |
| body | 16/26 | 17/28 | 400 | 0 | Geist | body text |
| small | 14/22 | 15/24 | 400 | 0 | Geist | notes, disclaimers |
| caption | 13/20 | 13/20 | 400 | 0 | Geist | captions, meta |
| label | 12/16 | 12/16 | 500, uppercase | +0.08em | Geist Mono | eyebrows, step numbers, statuses |
| metric | 48/48 | 72/72 | 300 | -0.04em | Geist | big numbers like "58+" |
Minimum text size: 12px, label level only.

## 6. Component behaviour
- Focus state everywhere: 2px outline --color-accent, 3px offset (--color-accent-inverse on dark).
- Header: sticky. Mobile: 56px, short logo + Menu button. Desktop (≥1024): full menu with dropdowns for Buyers and Owners, one CTA button. Current section marked with aria-current.
- MobileMenu: full-screen panel under the header; Buyers and Owners expand into service lists, then Platform, Regulations, Blog, then a full-width CTA. Esc closes; page scroll locked while open.
- Dropdown (desktop): opens on click and hover, closes on Esc and outside click, --shadow-menu.
- Button: variants primary, secondary, inverse, text. Mobile: 52px high, full width. Hover: --color-accent-hover, 2px lift, --shadow-lift.
- WhatsAppLink: same look as Button; message taken by key from whatsapp.ts; target=_blank rel=noopener.
- Faq: accordion with aria-expanded; outputs FAQPage JSON-LD.
- Testimonials: continuous auto-scroll kept; pauses on hover, focus and touch; Pause button; no animation under prefers-reduced-motion.
- LogoStrip: greyscale logos, mandatory disclaimer.
- Footer: mobile single column, links 44px tall.

## 7. Block catalog
Layout rule for migrated pages: the legacy page defines composition (order, columns, alignment, element type, what is hidden on mobile); this system defines every value (spacing, type, line-height, colour, border width, container, radius). Section tone follows the legacy page (default, sunken = legacy sand, inverse = legacy dark). Variants are preferred over new blocks. Layout parity is checked with `qa/shots.mjs` and `qa/report.mjs` (output in `qa/output/`, never committed or deployed).
| type | Fields |
|---|---|
| hero | variant (display, page), heading_id, label, title, subtitle, lead, actions[], meta, fee_note, illustration (home, property-check, regulations, platform), metrics[]. With `illustration` the copy and the art sit in two columns from 1024px; the ratio follows the illustration (property-check 1.45:1, regulations 1:1, platform 2:1). Illustrations load only from 768px, through the `DesktopIllustration` loader (fragment in /public/illustrations, script chunk in src/scripts/illustrations); the slot reserves its size (aspect ratio of the artwork) so nothing shifts. The legacy platform intro ("One Platform. Complete Market Intelligence.") was hidden at every width and was dropped from markup and content: no hidden text on the page. `subtitle` renders as a lighter second line under a display-size title |
| cards | label, title, lead, columns (2,3,4), variant (card, seam), items[]: label, title, text, tag, href; note: text, link. `seam` = cells share 1px rules with no gaps and the note stacks its link under the text |
| services | title (optional), lead, groups[]: id (anchor), name (rendered as an h2), items[]: title, text, href. Full-width ruled rows; anchors clear the sticky header |
| steps | label, title, layout (row, list, grid), items[]: label, title, text, timing, first. `grid` = 2x2 hairline-divided cells, first step has an accent top rule |
| deliverables | title, lead, items[]: title, text |
| table | title, caption, head[], rows[][] |
| metrics | title, items[]: value, label; notes[]; letter: org, quote, href; partners[]: group, name, href. `letter` and each partner are not rendered while the quote, name or link is a [placeholder] |
| testimonials | title, items[]: quote, name, meta, photo |
| logos | title, items[]: image, name; disclaimer |
| faq | label, heading_id, title, layout (split, stack), json_ld, items[]: question, answer, href, linkText. No `layout` = narrow list under the heading (home); `split` = heading left, list right from 768px; `stack` = heading above a full-width list. An empty `items` list keeps the block in the file and renders nothing |
| text | title, body (Markdown) |
| cta | label, title, text, action, secondary, next_steps[], side: title, items[]: label, text, note. With `side` the block is two columns from 768px (copy and buttons left, documents list right) and the list is hidden on mobile |
| pricing | title, tiers[]: name, price, term, features[], featured |
| order | sticky_copy (default true), title, lead (+ the staged order form fields; see src/content/pages/due-diligence.yaml) |
| report | label, title, lead, chips[], sample report card (rows, key risk, recommended action, footnote) |
| comparison | title, two plans side by side (featured + traditional), closing line |
| features | label, title, lead[], items[]: icon, title, text. Copy left, 2x2 cards right from 768px |
| spotlight | label, title, lead, panel: kicker, time, result, comparison, cta, note. Copy left, ruled panel (no box) right from 768px |
| acquisition_case | label, title, paragraphs[], profit, case: top, photo, prices[], facts[], disclaimer. 3 price columns with dividers and a tinted discount cell from 1024px |
| architecture | label, title, head, columns, inputs[], engine, outputs[], foot[], note. Flow dots are desktop-only and off with prefers-reduced-motion |
| inquiry | sticky_copy (default true), label, title, lead, stage[], panel, fields, interest_options, submit, disclaimer |
| guide_nav | brand, title, links[], jump, to_top. Fixed bar; same height as the shared header (bar + border) so it fully covers it |
| topics | label, title, items[]: n, title, hint, href. Hairline-divided grid |
| guide | label, chain[], heading_id, title, lead, answer, parts[]. `answer` = left-border callout. Parts: prose, heading, note (pull, callout, tbl-note, sub-lead), terms (defs, coef), codes, list (restr, checks = 3-column square-bullet lists; feas, steps4 = zero-padded numbering; facts, tools = ruled two-column rows; base = hairline grid), cards (rules, plan, imb), table (layers, scenarios, kbli, pma, audit: ruled, no box), compare, path (rows from 768px, swipe cards on mobile), chain (01–06 with top rules; 2 columns mobile, 3 tablet, 6 desktop), kbli_shift, split, formula, taxbox, screen, results, timeline (zero-padded numbers, dot tags) |
| sources | label, title, intro lists, review notice, legend, groups[]: items[]: authority, document, tag, href; notice |
| sample | label, title, lead, document_title, rows[]: label, value, status (ok, warn, danger); note |
| case | title, task, approach, roles[], result, quote: text, name, meta |
| disclosure | title, text, href |
| flow | title, lead, sources: title, items[]; hub; outputs[]: title, text; closing. Sources, hub and outputs are HTML text (once in the DOM). From 768px the loader draws SVG connector lines over them (draw-in once; static with prefers-reduced-motion). Below 768px: source chips, hub, stacked cards, no SVG |
| answers | title, lead, launch, list_title, items[], links[]. `launch` is appended to the lead and is not rendered while it is a [placeholder] |
| related | title, items[]: title, text, href |

## 8. Home — src/content/home/index.yaml
No eyebrows on any screen. A value in square brackets is a placeholder: it stays in the YAML and the element is not rendered until it is filled. WhatsApp button text comes from the `book` message key ("Hello TCG, I'd like to book a consultation about a property in Bali.").
| # | Section | Blocks | Content |
|---|---|---|---|
| 1 | Hero | hero (display, illustration home) | H1, lead, "Check a Property" → /due-diligence#pricing, "Book a Consultation" → WhatsApp. The legacy hero illustration loads from 768px only |
| 2 | How TCG works | flow | Sources → TCG → Intelligence, Advisory, Capital. No links |
| 3 | Platform | answers | Questions the platform answers; links to /platform and /due-diligence. Launch date sentence is a placeholder |
| 4 | Advisory | cards (3, linked) | Acquisition Advisory, Go-to-Market for Developers, Land Monetization Strategy |
| 5 | Capital | cards (2, linked) + link + fineprint | Stalled projects, Developer stock → /distressed-property-buyout; "Invest alongside TCG" → /platform; disclosure line → /terms#conflict-of-interest |
| 6 | Proof | metrics | Row of 4 metrics (5+, 10+, 58, 150+), `reach` line, then letter and partners cards (rendered only when filled). Letter of thanks and partners are placeholders (not rendered); external links open in a new tab with rel="noopener" |
| 7 | Testimonials and logos | testimonials + logos | Unchanged from legacy; continuous carousel |
| 8 | Start where you are | services (inverse) | Numbered rows in groups #buyers and #owners, then the closing block (WhatsApp `book`, link to /platform). Replaces the choices and the all-services screens |
| 9 | FAQ | faq (empty) | Kept in the file; renders nothing until new questions are provided |
| 10 | Final CTA | cta | "Message us on WhatsApp" |

## 9. Service page template — src/content/services/<slug>.yaml
Used by Acquisition Advisory, Distressed Property Buyout, Go-to-Market for Developers. /due-diligence, /platform and /land keep their current structure.
1. hero (page): who it is for, outcome, one button, fee_note (how the fee is formed). Required.
2. cards: client situations. Required.
3. deliverables: what the client receives. Required.
4. sample: excerpt of a report or memo. Required.
5. steps: process with timing and payment point. Required.
6. text: how the price is formed, with no figures. Required.
7. case: task → approach → roles involved (job titles only) → result → client quote. Built from real testimonials. Required.
8. disclosure: Distressed Property Buyout only.
9. faq: objections from a sceptical buyer. Required.
10. cta: what to send, when we reply, what happens next. Required.
11. related: related service. Optional.
No team block. No staff names.

## 10. Copy rules (English)
- No "X, not Y" or "X is not Y" constructions.
- No parallel, repetitive constructions in headlines.
- Restrained, business tone.
- No invented facts, numbers, clients or quotes. Use [TEXT] where copy is missing.
- Reuse text from the current site only where it fits the new section.

## 11. Layout rules
The rules text is CLAUDE.md (rules 1-9 and the mandatory workflow); this section only records how they are enforced and built. Enforced by `npm run check` (static), `npm run check:layout` (measured at 375 and 1280px, from the first/last VISIBLE text or element box) and the /styleguide page. Both baselines (qa/baseline/design.json, qa/baseline/layout.json) are empty and must stay empty.

### Summary of the rules
- First screen on every page: page-title (h1, 32/48), one paragraph, 1-2 buttons, optional illustration (desktop only). No eyebrow, list, meta strip, metric or extra link. Header bottom -> title 48/80; title -> text 16; text -> buttons 32. With art from 1024px: 50/50, gap 64, top-aligned, one frame ratio (460/512) on every page.
- Type: 7 roles (page-title, section-title, card-title, text, small, label, metric). Tokens `--fs-page-title`, `--fs-section-title`, `--fs-card-title`, `--fs-text`, `--fs-small`, `--fs-label`, `--fs-metric` (and the matching `--lh-*`). Removed roles: display, h4, lead, caption. No eyebrows above any heading.
- Screens: padding 56/112. Neighbours with the same background share the gap (the second has no top padding). Never two inverse screens in a row.
- Lists: shared `List` only (green diamond, mint on inverse; numbered = label role "01").

### Shared elements that implement the rules
Section (tone, layout: stacked | split | article), SectionHead (title, text, small meta line; `next` = content 40px or actions 32px; hero mode), Hero (the first screen), Grid (cols 2, 3, 4), List (bulleted | numbered), Button / WhatsAppLink (Action). Blocks use them and cannot override their spacing, width, gap, markers or type. Block CSS may bind a font size only to one of the 7 role tokens (`font-size: var(--fs-small)`); any other value fails `npm run check`.

### Where the old first-screen extras went
- /due-diligence: meta strip "Land · Villas · Developers" is the small meta line of the first `cards` block (`meta`).
- /platform: two of the former metrics are the `points` list of the first screen (A2); "2 Revenue Streams" is removed.
- /regulations: the second line of the page-title (`subtitle`) is a span of the h1 in the same role.
- Secondary hero buttons are always secondary buttons (no text links in the hero).
- /platform only (variation A2): the first screen holds a bulleted list of 2 items (`points`) between the text and the buttons, 32px above and below.
- A text link under a button is rendered by the shared `ActionStack`, centred on the button's width.

### Page-type templates (block order)
- home: section 8.
- service: section 9.
- due-diligence: hero → cards → report → comparison → pricing → steps → order → faq → cta.
- platform: hero → features → spotlight → acquisition_case → architecture → inquiry.
- guide (/regulations): hero → guide_nav → topics → guide (one per section) → cta → faq → sources.
- legal and blog post: article layout; block order to be set by the owner before these pages are built.

### Decisions
`.t-metric` (48/72px) is the 7th role. The `seam` card variant is removed (cards always use Grid). Round status dots and radios inside forms and tags keep `--radius-full`; they are not list markers and not buttons.

## 12. Out of scope until after launch
Blog pipeline, payments, document upload, owner application form, tests (Lighthouse CI, Playwright), /styleguide, language versions.
