// UserPromptSubmit: inject a digest of CLAUDE.md rules 1-9 into the context on every owner message.
const digest = `RULES CHECK REQUIRED. Read CLAUDE.md, docs/site-spec.md and src/styles/tokens.css before any change.
Start every reply that changes code with "Rules check:" and name the rules that apply.
1 Edges: container 1200, gutter 20/40, everything starts at the left edge; two columns: left column on the edge.
2 First screen (same on every page): page-title (h1), ONE paragraph, 1-2 buttons, optional illustration (desktop only). No eyebrow, list, meta strip, metric or extra link. Header bottom -> title 48/80; title->text 16; text->buttons 32; buttons 12/16. With art from 1024px: 50/50, gap 64, top-aligned, same frame ratio.
3 Type, 7 roles: page-title 32/48 (h1, first screen only), section-title 28/40 (h2), card-title 20/24 (h3), text 16/17, small 14/15, label 12 mono uppercase (numbers, statuses, tags; never above headings), metric 48/72. No other sizes, no eyebrows.
4 Spacing: heading->text 16, text->buttons 32, buttons 12/16, head->content 40, paragraph 16, card title->text 12, cards gap 16/32, card padding 24, list items 8.
5 Screens: padding 56/112; same-background neighbours share the gap (no top padding on the second); light/sunken/inverse only; never two inverse in a row.
6 Text width: section-title and text max 720; tables, grids, forms full width.
7 Cards: 1/2/2-3-4 columns, shared Grid only.
8 Buttons: 52px, full width on mobile, one primary per screen, mint primary on inverse, radius 0.
9 Lists: green diamond 8px (mint on inverse), 12px to text, 8px between items, aligned to the first line; numbered = label role "01". Shared List only.
Only existing blocks and shared elements (Section, SectionHead, Grid, Button, List, Hero). A new block or variation needs owner approval.
Before done: npm run check, npm run build, npm run check:layout with empty baselines. Protected files need owner approval. Branch next only. Reports in Russian.`;
process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: digest } }));
process.exit(0);
