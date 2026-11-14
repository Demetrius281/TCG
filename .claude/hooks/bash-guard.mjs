// G1, write time. PreToolUse on Bash: shell commands may not write into the protected tree or switch the gates off.
// Source, scripts, qa, .claude, .github, CLAUDE.md and tokens.css change through the Edit/Write tools only, where the lock runs first.
import path from 'node:path';

let input = '';
for await (const chunk of process.stdin) input += chunk;
let cmd = '';
try { cmd = JSON.parse(input).tool_input?.command ?? ''; } catch { process.exit(0); }

const PROTECTED = String.raw`(?:^|[\s'"=:(])(?:\./)?(?:src|scripts|qa|\.claude|\.github|\.githooks)/|CLAUDE\.md|tokens\.css|(?:^|[\s'"=:(])package\.json`;
const protectedRe = new RegExp(PROTECTED);
const reasons = [];
const block = (why) => reasons.push(why);

// 1. switching the gates off
if (/--no-verify|\s-n\s+.*git commit|git commit\b[^|;&]*\s-n\b/.test(cmd)) block('--no-verify skips the commit gate');
if (/core\.hooksPath|hooksPath/.test(cmd)) block('git config core.hooksPath changes the commit gate');
if (/HUSKY\s*=\s*0|HUSKY_SKIP/.test(cmd)) block('HUSKY=0 skips the commit gate');
if (/\.githooks/.test(cmd) && /(>|tee|sed\s+-i|rm\s|mv\s|cp\s|chmod|truncate|write)/.test(cmd)) block('.githooks/ is the commit gate and cannot be edited from the shell');
if (/\bSKIP_LOCK|LOCK_OFF|--no-lock/.test(cmd)) block('the lock cannot be skipped');

// 2. writes into the protected tree
const targets = [];
for (const m of cmd.matchAll(/(?:^|[^<>&0-9])>>?\s*(?!&)([^\s;|&)]+)/g)) targets.push(m[1].replace(/^['"]|['"]$/g, ''));
for (const m of cmd.matchAll(/\btee\s+(?:-a\s+)?([^\s;|&]+)/g)) targets.push(m[1]);
for (const m of cmd.matchAll(/\b(?:sed|perl)\s+(?:-[a-zA-Z]*\s+)*-[a-zA-Z]*i[^\s]*\s+(?:-e\s+)?(?:'[^']*'|"[^"]*"|\S+)\s+([^\s;|&]+)/g)) targets.push(m[1]);
for (const m of cmd.matchAll(/\b(?:cp|mv|install|ln|rsync|truncate)\s+([^;|&]+)/g)) targets.push(...m[1].trim().split(/\s+/).slice(-1));
const isProtectedPath = (t) => {
  if (!t || t === '/dev/null' || /^\/(tmp|private\/tmp|var\/folders)\//.test(t)) return false;
  return protectedRe.test(' ' + t) || /^(?:\.\/)?(?:src|scripts|qa|\.claude|\.github|\.githooks)\//.test(t) || /(^|\/)(CLAUDE\.md|tokens\.css|package\.json)$/.test(t);
};
for (const t of targets) if (isProtectedPath(t)) block(`writes ${t}`);
if (/\bgit\s+(apply|am)\b/.test(cmd)) block('git apply/am writes files without the lock');
if (/\bgit\s+checkout\s+(?!-b|-B)(?:[0-9a-f]{7,40}|origin\/\S+|HEAD~?\S*|\S+)\s+--\s/.test(cmd) || /\bgit\s+(restore\s+--source|checkout\s+(?:[0-9a-f]{7,40}|origin\/\S+)\b)/.test(cmd)) block('git checkout/restore of another commit brings in files without the lock');
// inline interpreters writing files that mention the protected tree
const interp = /\b(?:python3?|node|ruby|perl|deno|bun)\b\s+(?:-[a-zA-Z]*\s+)*(?:-c|-e|-p|-)\b|<<\s*['"]?\w+['"]?/.test(cmd);
const writes = /writeFile|write_text|writeFileSync|appendFile|fs\.(?:write|append|copy|rename|rm|unlink|mkdir)|shutil\.|os\.(?:rename|remove|replace)|open\([^)]*['"][wa+]|\.write\(|sed\s+-i|Path\([^)]*\)\.write/.test(cmd);
if (interp && writes && protectedRe.test(cmd)) block('an inline script writes into the protected tree');

if (!reasons.length) process.exit(0);
process.stderr.write(
  [
    'LOCK: this shell command is blocked because it ' + reasons.join('; ') + '.',
    '',
    'Source files, scripts, qa/, .claude/, .github/, CLAUDE.md and tokens.css are changed with the Edit/Write tools only:',
    'the lock (scripts/lock.mjs) checks the new content before it is written. Use Edit or Write for this change.',
  ].join('\n') + '\n',
);
process.exit(2);
