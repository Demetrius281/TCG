// G1, write time. PreToolUse on Edit|Write|MultiEdit|NotebookEdit: compute the file as it WOULD be after the tool call
// and run the lock (scripts/lock.mjs) on that content BEFORE anything is written. Any error -> exit 2, the file is not written.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

let input = '';
for await (const chunk of process.stdin) input += chunk;
let ev;
try { ev = JSON.parse(input); } catch { process.exit(0); }
const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const ti = ev.tool_input ?? {};
const file = ti.file_path ?? ti.notebook_path ?? '';
if (!file) process.exit(0);
const abs = path.resolve(root, file);
const rel = path.relative(root, abs).split(path.sep).join('/');
if (!/^src\/.*\.(astro|css|ts|js|mjs)$/.test(rel)) process.exit(0);

const current = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : '';
const apply = (text, e) => {
  if (!e.old_string && e.old_string !== '') return text;
  if (e.old_string === '') return e.new_string;
  if (!text.includes(e.old_string)) return null;
  return e.replace_all ? text.split(e.old_string).join(e.new_string) : text.replace(e.old_string, () => e.new_string);
};
let result;
switch (ev.tool_name) {
  case 'Write': result = ti.content ?? ''; break;
  case 'Edit': result = apply(current, ti); break;
  case 'MultiEdit': { result = current; for (const e of ti.edits ?? []) { result = result === null ? null : apply(result, e); } break; }
  default: process.exit(0);
}
if (result === null) process.exit(0); // the edit itself will fail; nothing to lint

const r = spawnSync('node', [path.join(root, 'scripts/lock.mjs'), '--file', rel, '--stdin'], { cwd: root, input: result, encoding: 'utf8' });
if (r.status === 0) process.exit(0);
const msg = [`LOCK: this edit to ${rel} breaks the design rules and was NOT written.`, '', (r.stderr || r.stdout).trim(), '', 'Fix the content so it uses the primitives (src/components/ui) and tokens, then try again. See CLAUDE.md and qa/rules/rules.json.'].join('\n');
process.stderr.write(msg + '\n');
process.exit(2);
