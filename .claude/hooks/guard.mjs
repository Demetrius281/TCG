// PreToolUse (Edit|Write): the files that enforce the design rules need the owner's confirmation (permissionDecision "ask").
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
const protectedPaths = ['CLAUDE.md', '.claude/', '.github/', '.githooks/', 'package.json', 'scripts/check-design.mjs', 'scripts/lock.mjs', 'scripts/lock-selftest.mjs', 'scripts/gen-scale.mjs', 'scripts/audit.mjs', 'qa/rules/', 'qa/baseline/', 'qa/lock-fixtures/', 'src/styles/tokens.css', 'src/styles/base.css', 'src/components/ui/'];
if (protectedPaths.some((p) => (p.endsWith('/') ? rel.startsWith(p) : rel === p))) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'ask',
        permissionDecisionReason: `${rel} is a protected file (CLAUDE.md, .claude/, .github/, .githooks/, package.json, scripts/{check-design,lock,lock-selftest,gen-scale,audit}.mjs, qa/rules/ incl. blocks.json, qa/baseline/, qa/lock-fixtures/, tokens.css, base.css, src/components/ui/). Owner confirmation required.`,
      },
    }),
  );
}
process.exit(0);
