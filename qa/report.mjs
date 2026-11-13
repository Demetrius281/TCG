// Builds qa/output/index.html (legacy vs new side by side, per section and width, one note per section).
// Notes come from qa/notes.json: { "<page>/<index>": "match" | "fixed: ..." | "intentional difference: ..." }
// Usage: node qa/report.mjs   then open qa/output/index.html (see qa/README.md)
import fs from 'fs';
import path from 'path';

const OUT = path.resolve('qa/output');
const pairs = JSON.parse(fs.readFileSync(path.join(OUT, 'pairs.json'), 'utf8'));
const notes = JSON.parse(fs.readFileSync(path.resolve('qa/notes.json'), 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

let body = '';
for (const pg of [...new Set(pairs.map((p) => p.page))]) {
  body += `<h2>/${pg}</h2>`;
  const n = pairs.find((p) => p.page === pg && p.width === 1280).legacy;
  for (let i = 0; i < n; i++) {
    const idx = String(i).padStart(2, '0');
    const note = notes[`${pg}/${i}`] || 'NO NOTE';
    const cls = note.startsWith('match') ? 'ok' : note.startsWith('fixed') ? 'fx' : 'in';
    body += `<section class="row"><p class="note ${cls}"><b>${pg} · section ${i + 1}</b> — ${esc(note)}</p>`;
    for (const w of [1280, 375]) {
      body += `<div class="w w${w}"><span>${w}px</span>`;
      for (const side of ['legacy', 'new']) {
        body += `<figure><figcaption>${side}</figcaption><img loading="lazy" src="img/${pg}-${w}-${idx}-${side}.png" alt="${side} ${pg} section ${i + 1} at ${w}px"></figure>`;
      }
      body += '</div>';
    }
    body += '</section>';
  }
}
const html = `<!doctype html><meta charset="utf-8"><title>Layout parity QA</title>
<style>
body{font:14px/1.4 system-ui,sans-serif;margin:24px;background:#eee;color:#111}
h2{margin:40px 0 8px}
.row{background:#fff;border:1px solid #ccc;margin:0 0 24px;padding:12px}
.note{margin:0 0 12px;padding:6px 10px;border-left:4px solid #888;background:#f4f4f4}
.note.ok{border-color:#2a8a4a}.note.fx{border-color:#c28a00}.note.in{border-color:#3a6ad0}
.w{display:flex;gap:12px;align-items:flex-start;margin-bottom:16px;overflow-x:auto}
.w>span{writing-mode:vertical-rl;color:#666}
figure{margin:0;flex:1 1 0;min-width:0}
.w375 figure{flex:0 0 375px}
figcaption{font-weight:600;margin-bottom:4px;text-transform:uppercase;font-size:11px;color:#555}
img{display:block;width:100%;height:auto;border:1px solid #ddd}
</style><h1>Layout parity: legacy vs new</h1>
<p>Left = legacy, right = new. Notes: green = match, amber = fixed, blue = intentional difference.</p>${body}`;
fs.writeFileSync(path.join(OUT, 'index.html'), html);
console.log('written', path.join(OUT, 'index.html'));
