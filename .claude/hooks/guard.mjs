// PreToolUse (Edit|Write): block edits to the files that enforce the design rules.
import path from 'node:path';

let input = '';
for await (const chunk of process.stdin) input += chunk;
let file = '';
try {
  file = JSON.parse(input).tool_input?.file_path ?? '';
} catch {
  process.exit(0);
}
const root = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const rel = path.relative(root, path.resolve(root, file)).split(path.sep).join('/');
const protectedPaths = ['CLAUDE.md', '.claude/', '.github/', 'scripts/check-design.mjs', 'qa/rules/', 'qa/baseline/'];
if (protectedPaths.some((p) => (p.endsWith('/') ? rel.startsWith(p) : rel === p))) {
  console.error(`Blocked: ${rel} is protected. Editing CLAUDE.md, .claude/, .github/, scripts/check-design.mjs, qa/rules/ or qa/baseline/ needs owner approval.`);
  process.exit(2);
}
process.exit(0);
