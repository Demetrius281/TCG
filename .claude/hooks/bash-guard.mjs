// G1, write time. PreToolUse on Bash. Policy: a shell command may write only to node_modules, dist, qa/audit, qa/parity/output
// and /tmp. Every other write inside the repository is blocked (source, scripts, qa, .claude, .github, .githooks, CLAUDE.md,
// package.json, ...): those files change through Edit/Write, where the lock runs on the new content first.
// A write target that cannot be resolved (variables, command substitution, globs, a preceding cd) is blocked as well.
import path from 'node:path';

let input = '';
for await (const chunk of process.stdin) input += chunk;
let ev = {};
try { ev = JSON.parse(input); } catch { process.exit(0); }
const cmd = ev.tool_input?.command ?? '';
const root = path.resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd());
const cwd = path.resolve(ev.cwd || root);
const reasons = [];
const block = (why) => { if (!reasons.includes(why)) reasons.push(why); };

const ALLOWED = ['node_modules', 'dist', 'qa/audit', 'qa/parity/output'].map((d) => path.join(root, d));
const ABS_OK = [/^\/tmp(\/|$)/, /^\/private\/tmp(\/|$)/, /^\/private\/var\/folders\//, /^\/var\/folders\//, /^\/dev\/(null|stderr|stdout|tty)$/];
const inside = (p, dir) => p === dir || p.startsWith(dir + path.sep);
const hasCd = /(^|[;&|(]|\s)(cd|pushd)\s/.test(cmd);

/** Is writing to this target acceptable? */
function checkTarget(raw, via) {
  let t = raw.replace(/^['"]|['"]$/g, '');
  if (!t || t === '-') return;
  if (/^&\d?$/.test(t)) return; // 2>&1
  if (ABS_OK.some((re) => re.test(t))) return;
  if (/[$`*?{}~]|\$\(|\$\{/.test(t) && !/^\/(tmp|private\/tmp)\//.test(t)) return block(`${via} to an unresolvable path (${t.slice(0, 40)}): variables, substitutions and globs are not allowed as write targets`);
  if (!path.isAbsolute(t) && hasCd) return block(`${via} to a relative path (${t}) after a cd: use an absolute path under /tmp`);
  const abs = path.resolve(cwd, t);
  if (ABS_OK.some((re) => re.test(abs))) return;
  if (!inside(abs, root)) return; // outside the repository: not this guard's business
  if (ALLOWED.some((d) => inside(abs, d))) return;
  block(`${via} ${path.relative(root, abs) || '.'} (inside the repository, outside node_modules, dist, qa/audit, qa/parity/output)`);
}

// 1. switching the gates off, pushing to main
if (/--no-verify|git\s+commit\b[^|;&]*\s-n\b/.test(cmd)) block('--no-verify skips the commit gate');
if (/core\.hooksPath|hooksPath/.test(cmd)) block('git config core.hooksPath changes the commit gate');
if (/HUSKY\s*=\s*0|HUSKY_SKIP/.test(cmd)) block('HUSKY=0 skips the commit gate');
if (/SKIP_LOCK|LOCK_OFF|--no-lock/.test(cmd)) block('the lock cannot be skipped');
for (const m of cmd.matchAll(/\bgit\s+push\b([^|;&\n]*)/g)) {
  const a = m[1];
  if (/\s(--force|-f|--force-with-lease|--mirror|--delete|-d)\b|\s\+\S/.test(a)) block('git push --force / delete is not allowed');
  if (/(^|[\s:])(main|master)(\s|$)|HEAD:(main|master)|refs\/heads\/(main|master)/.test(a)) block('git push to main is not allowed (branch next only)');
}

// 2. write operations and their targets
for (const m of cmd.matchAll(/(?:^|[^<>&0-9\\])(?:\d?>>?|&>>?|>\|)\s*(?!&)(\S+)/g)) checkTarget(m[1], 'redirection writes');
for (const m of cmd.matchAll(/\btee\s+((?:-\S+\s+)*)([^\s;|&]+)/g)) checkTarget(m[2], 'tee writes');
for (const m of cmd.matchAll(/\bsponge\s+(?:-\S+\s+)*([^\s;|&]+)/g)) checkTarget(m[1], 'sponge writes');
for (const m of cmd.matchAll(/\bdd\b[^;|&\n]*\bof=([^\s;|&]+)/g)) checkTarget(m[1], 'dd writes');
for (const m of cmd.matchAll(/\b(?:sed|perl|ruby)\b[^;|&\n]*?\s-[a-zA-Z]*i[^\s]*\s+(?:-e\s+)?(?:'[^']*'|"[^"]*"|\S+)\s+([^;|&\n]+)/g)) for (const f of m[1].trim().split(/\s+/)) checkTarget(f, 'in-place edit of');
if (/\b(sed|perl|ruby)\b[^;|&\n]*\s-[a-zA-Z]*i\b/.test(cmd) && !reasons.length) block('in-place edit (-i) with a target the guard cannot resolve');
for (const m of cmd.matchAll(/\b(cp|mv|install|ln|rsync|truncate|touch|mkdir|rmdir|rm|chmod|chown|unlink|shred)\b([^;|&\n]*)/g)) {
  const args = m[2].trim().split(/\s+/).filter((x) => x && !x.startsWith('-'));
  const tg = /^(cp|mv|install|ln|rsync)$/.test(m[1]) ? args.slice(-1).concat(m[1] === 'mv' ? args.slice(0, -1) : []) : args;
  tg.forEach((t) => checkTarget(t, `${m[1]} writes`));
}
if (/\bpatch\b\s/.test(cmd)) block('patch writes files without the lock');
if (/\b(prettier|eslint|stylelint|biome|black|gofmt|rustfmt)\b[^;|&\n]*(--write|\s-w\b|--fix)/.test(cmd)) block('a formatter with --write/--fix rewrites files without the lock');
if (/\bgit\s+(apply|am|cherry-pick|merge|rebase|pull|stash\s+(pop|apply)|clean|reset\s+--hard|restore|rm|mv)\b/.test(cmd)) block('this git command rewrites the working tree without the lock');
if (/\bgit\s+(checkout|switch)\s+(?!-b\b|-B\b|-c\b)\S/.test(cmd) && !/\bgit\s+(checkout|switch)\s+next\s*($|[;&|])/.test(cmd)) block('git checkout/switch of another commit or branch brings in files without the lock');

// 3. inline interpreters that write files
const interp = /\b(?:python3?|node|ruby|perl|deno|bun|php)\b\s+(?:-[a-zA-Z]+\s+)*(?:-c|-e|-p|-r)\b|\b(?:python3?|node|ruby|perl)\b\s+-(?:\s|$)|<<-?\s*['"]?\w+['"]?/.test(cmd);
const writes = /writeFile|write_text|writeFileSync|appendFile|createWriteStream|fs\.(?:write|append|copy|rename|rm|unlink|mkdir|cp)|shutil\.|os\.(?:rename|remove|replace|system)|subprocess|child_process|execSync|spawn|open\([^)]*['"][wa+]|\.write\(|Path\([^)]*\)\.write|json\.dump|sed\s+-i|>\s*['"]?[\w./~-]+/.test(cmd);
if (interp && writes) {
  const lits = [...cmd.matchAll(/['"]((?:\.{0,2}\/)?[\w.-]+(?:\/[\w.@-]+)+(?:\.\w+)?)['"]/g)].map((m) => m[1]);
  const bad = lits.filter((p) => { if (ABS_OK.some((re) => re.test(p))) return false; const abs = path.resolve(cwd, p); return inside(abs, root) && !ALLOWED.some((d) => inside(abs, d)); });
  if (bad.length) block(`an inline script writes into the repository (${bad[0]})`);
  else if (/os\.environ|process\.env|path\.join|path\.resolve|\$\{?\w+|\+\s*['"]\//.test(cmd) && !lits.length) block('an inline script writes to a path built at run time');
}

if (!reasons.length) process.exit(0);
process.stderr.write(
  [
    'LOCK: this shell command is blocked: ' + reasons.join('; ') + '.',
    '',
    'Shell commands may write only to node_modules, dist, qa/audit, qa/parity/output and /tmp. Source, scripts, qa, .claude, .github,',
    '.githooks, CLAUDE.md, package.json and tokens.css change through the Edit/Write tools only, where the lock checks the new content first.',
  ].join('\n') + '\n',
);
process.exit(2);
