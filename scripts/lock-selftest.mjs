// Self-test of the lock (runs in CI): every file in qa/lock-fixtures/ breaks exactly the rules named in its first line,
// and the lock must report each of them. The clean fixture must pass. A fixture that passes when it should fail fails the test.
//   First line of a fixture:  lock-path: <virtual path in the repo>; expect: L1,L3   (or: expect: none)
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const dir = path.join(root, 'qa/lock-fixtures');
const files = fs.readdirSync(dir).filter((f) => !f.startsWith('.') && f !== 'README.md').sort();
const rows = [];
let bad = 0;
for (const f of files) {
  const text = fs.readFileSync(path.join(dir, f), 'utf8');
  const head = text.split('\n')[0];
  const m = head.match(/lock-path:\s*([^;]+);\s*expect:\s*([A-Za-z0-9,\s]+)/);
  if (!m) { rows.push([f, '-', '-', 'NO HEADER']); bad++; continue; }
  const vpath = m[1].trim();
  const expect = m[2].trim() === 'none' ? [] : m[2].split(',').map((s) => s.trim());
  const r = spawnSync('node', ['scripts/lock.mjs', '--file', vpath, '--stdin', '--json'], { cwd: root, input: text, encoding: 'utf8' });
  let found = [];
  try { found = JSON.parse(r.stdout); } catch { found = [{ rule: 'CRASH', what: (r.stderr || r.stdout).slice(0, 80) }]; }
  const got = [...new Set(found.map((e) => e.rule))];
  const ok = expect.length === 0 ? found.length === 0 : expect.every((e) => got.includes(e));
  if (!ok) bad++;
  rows.push([f, vpath, expect.join(',') || 'none', ok ? (expect.length ? `CAUGHT (${got.join(',')})` : 'PASSES (clean)') : `NOT AS EXPECTED (got ${got.join(',') || 'nothing'})`]);
}
const w = (i) => Math.max(...rows.map((r) => String(r[i]).length), 6);
console.log(`| ${'fixture'.padEnd(w(0))} | ${'pretends to be'.padEnd(w(1))} | ${'expects'.padEnd(w(2))} | result |`);
for (const r of rows) console.log(`| ${String(r[0]).padEnd(w(0))} | ${String(r[1]).padEnd(w(1))} | ${String(r[2]).padEnd(w(2))} | ${r[3]} |`);
console.log(bad ? `\nlock:selftest FAILED: ${bad} fixture(s) not as expected` : `\nlock:selftest passed: ${rows.length} fixtures, every forbidden pattern caught, clean fixture passes`);
process.exit(bad ? 1 : 0);
