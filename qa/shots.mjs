// Section-by-section screenshots of legacy vs new at 1280 and 375.
// Usage: QA_PW=/path/to/dir-with-node_modules node qa/shots.mjs
// Needs: legacy served on :8801 (python3 -m http.server from /legacy) and new on :8802 (astro preview).
// Output: qa/output/img/*.png and qa/output/pairs.json (consumed by qa/report.mjs). qa/output is git-ignored.
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire((process.env.QA_PW || process.cwd()) + '/package.json');
const { chromium } = require('playwright-core');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = path.resolve('qa/output');
const IMG = path.join(OUT, 'img');
fs.mkdirSync(IMG, { recursive: true });

const PAGES = (process.env.PAGES || 'due-diligence,regulations,platform').split(',');
const WIDTHS = (process.env.WIDTHS || '1280,375').split(',').map(Number);
const ONLY = process.env.ONLY ? process.env.ONLY.split(',').map(Number) : null; // section indexes to re-shoot
const BASES = { legacy: 'http://localhost:8801', new: 'http://localhost:8802' };
const SEL = { legacy: 'body > section, main > section, .anchor-wrap > section', new: 'main > section' };

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const pairs = [];
for (const pg of PAGES) {
  for (const w of WIDTHS) {
    const count = {};
    for (const side of ['legacy', 'new']) {
      const ctx = await browser.newContext({ viewport: { width: w, height: 900 } });
      const page = await ctx.newPage();
      await page.goto(`${BASES[side]}/${pg}.html`, { waitUntil: 'load' });
      await page.addStyleTag({ content: 'header:not(.head),.secnav,.to-top,.m-nav,.site-header{visibility:hidden!important}' });
      // trigger scroll reveals / lazy work
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < h; y += 600) {
        await page.evaluate((y) => window.scrollTo(0, y), y);
        await page.waitForTimeout(60);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(w >= 768 ? 1500 : 300);
      const secs = (await page.$$(SEL[side])).filter(Boolean);
      const keep = [];
      for (const s of secs) {
        const b = await s.boundingBox();
        if (b && b.height > 20) keep.push(s);
      }
      count[side] = keep.length;
      let i = 0;
      for (const s of keep) {
        if (ONLY && !ONLY.includes(i)) { i++; continue; }
        await s.screenshot({ path: path.join(IMG, `${pg}-${w}-${String(i).padStart(2, '0')}-${side}.png`), animations: 'disabled' });
        i++;
      }
      await ctx.close();
    }
    console.log(pg, w, count);
    pairs.push({ page: pg, width: w, legacy: count.legacy, new: count.new });
  }
}
// merge with earlier runs so a partial re-shoot keeps the other pages in the report
const file = path.join(OUT, 'pairs.json');
const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
const merged = [...prev.filter((p) => !pairs.some((q) => q.page === p.page && q.width === p.width)), ...pairs];
fs.writeFileSync(file, JSON.stringify(merged, null, 1));
await browser.close();
