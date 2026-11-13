# Layout parity QA

Tools for comparing the migrated pages with the legacy pages. Nothing here is deployed: `qa/output/` is git-ignored and Vercel only publishes `dist/`.

1. Serve legacy and new:
   - `cd legacy && python3 -m http.server 8801`
   - `npm run build && npx astro preview --port 8802`
2. Screenshot section by section at 1280px and 375px (needs `playwright-core` and Google Chrome; point `QA_PW` at a folder whose `node_modules` has `playwright-core`):
   - `QA_PW=/path/to/pw node qa/shots.mjs`
   - Optional: `PAGES=regulations,platform`, `WIDTHS=1280`, `ONLY=0,13` (section indexes) to re-shoot part of a page.
3. Build the side-by-side report from `qa/notes.json` (one line per section: `match`, `fixed: ...` or `intentional difference: ...`):
   - `node qa/report.mjs`
4. Open it locally: `open qa/output/index.html` (macOS) or open the file in any browser.
