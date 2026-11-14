// The lock: one linter for the design rules, used by all three gates (write time, commit, merge).
//   node scripts/lock.mjs                       whole repo (working tree)
//   node scripts/lock.mjs --file <path> --stdin check <path> with the content on stdin (write-time hook)
//   node scripts/lock.mjs --tree <dir>          whole tree in another directory (pre-commit uses the staged tree)
//   node scripts/lock.mjs --json                machine-readable output
// Rules: L1 forbidden CSS properties in blocks/pages/layouts; L2 only tokens in primitives/base; L3 forbidden everywhere;
// L4 imports and the block/primitive registry (qa/rules/blocks.json); L5 every message names file, line, value, rule, alternative.
import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n) => (args.includes(n) ? args[args.indexOf(n) + 1] : undefined);
const ROOT = path.resolve(opt('--tree') ?? process.cwd());
const R = JSON.parse(fs.readFileSync(path.join(ROOT, 'qa/rules/rules.json'), 'utf8'));
const REG = JSON.parse(fs.readFileSync(path.join(ROOT, 'qa/rules/blocks.json'), 'utf8'));
const LOCK = R.lock;
const SCALE = R.scale.steps;
const t0 = Date.now();

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');
const errors = [];
const err = (file, line, rule, what, allowed) => errors.push({ file, line, rule, what, allowed });

// ---------- helpers
const globToRe = (g) => new RegExp('^' + g.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$');
const forbiddenRe = LOCK.blockForbiddenPatterns.map(globToRe);
const allowedRe = LOCK.blockAllowedProps.map(globToRe);
const tokensCss = fs.readFileSync(path.join(ROOT, 'src/styles/tokens.css'), 'utf8');
const tokenNames = new Set([...tokensCss.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]));
const spacingTokens = new Set(LOCK.spacingTokens);
const SPACING_PROPS = /^(margin|padding|gap|row-gap|column-gap|inset|top|right|bottom|left)(-[a-z-]+)?$/;
const BLOCK_VALUE_OK = /^(none|transparent|inherit|currentColor|0|solid|dashed|dotted|auto|normal|center|start|end|stretch|baseline|space-between|space-around|flex-start|flex-end|grid|flex|block|inline|inline-flex|inline-block|contents|column|row|wrap|nowrap|visible|hidden|clip|left|right|top|bottom|column-reverse|row-reverse|subgrid|inline-grid|none)$/;

const kindOf = (f) => {
  if (f === 'src/styles/tokens.css') return 'tokens';
  if (f === 'src/styles/base.css') return 'base';
  if (/^src\/components\/ui\/[^/]+\.astro$/.test(f)) return 'ui';
  if (/^src\/components\/blocks\/[^/]+\.astro$/.test(f)) return 'block';
  if (/^src\/pages\//.test(f)) return 'page';
  return 'other';
};

// Remove frontmatter and script/style bodies, keep line count, for template scanning.
function templateOf(text) {
  let t = text;
  const fm = t.match(/^(?:<!--[^\n]*-->\n)?---\n[\s\S]*?\n---/);
  if (fm) t = fm[0].replace(/[^\n]/g, ' ') + t.slice(fm[0].length);
  t = t.replace(/<style[\s\S]*?<\/style>/g, (m) => m.replace(/[^\n]/g, ' '));
  t = t.replace(/<script[\s\S]*?<\/script>/g, (m) => m.replace(/[^\n]/g, ' '));
  return t;
}
const lineAt = (text, idx) => text.slice(0, idx).split('\n').length;

// ---------- CSS rules
function checkCss(file, kind, css, lineOffset, isGlobalAttr) {
  let root;
  try { root = postcss.parse(css); } catch (e) { err(file, lineOffset + (e.line ?? 1) - 1, 'L2', `CSS does not parse: ${e.reason}`, 'fix the syntax'); return; }
  const at = (n) => lineOffset + (n.source?.start?.line ?? 1) - 1;
  const inMin = (n) => { for (let p = n.parent; p; p = p.parent) if (p.type === 'atrule') return p; return null; };
  root.walkRules((rule) => {
    const sel = rule.selector;
    if (/:global\(/.test(sel)) err(file, at(rule), 'L3', `:global() in "${sel.slice(0, 60)}"`, 'put page-wide rules in src/styles/base.css; scoped rules in the primitive');
    if (kind === 'block' || kind === 'page' || kind === 'other') {
      const owned = LOCK.classesOwnedByPrimitives.map((g) => globToRe(g.replace(/^/, '')));
      for (const m of sel.matchAll(/\.([\w-]+)/g)) {
        if (owned.some((re) => re.test(m[1]))) err(file, at(rule), 'L3', `class .${m[1]} of a primitive is redefined in "${sel.slice(0, 60)}"`, 'use the primitive with its props; a new variation needs owner approval');
      }
    }
  });
  root.walkDecls((d) => {
    const prop = d.prop.toLowerCase();
    const value = d.value.trim();
    const line = at(d);
    if (d.important || /!important/.test(value)) err(file, line, 'L3', `!important on ${prop}`, 'remove it; fix the cause in the primitive');
    if (prop === 'font-weight' && /^(600|700|800|900|bold|bolder)$/.test(value)) err(file, line, 'D2', `font-weight: ${value}`, 'weights are 300 (metric), 400 (text), 500 (titles, control, label)');
    if (prop === 'font' && kind !== 'base' && kind !== 'tokens' && !/^inherit$/.test(value)) err(file, line, 'L1', `font: ${value}`, 'use a type role (Text role=...) or font: inherit in a primitive');
    if (kind === 'tokens') return;
    // L2: values in primitives and base are tokens only
    if (kind === 'ui' || kind === 'base') {
      const stripped = value.replace(/var\(\s*--[\w-]+\s*(,[^)]*)?\)/g, 'VAR');
      const raw = stripped.match(/(?<![\w.-])-?\d*\.?\d+(px|rem|em|vw|vh|vmin|vmax|ch|ex|cqw)\b/);
      if (raw && !/^(100vh|100dvh|100vw)$/.test(stripped)) err(file, line, 'L2', `${prop}: ${value} (raw ${raw[0]})`, 'use a token from src/styles/tokens.css: var(--s-8|12|16|24|32|40), --section-y, --grid-gap, --size-*, --bw-*');
      for (const m of value.matchAll(/var\(\s*(--[\w-]+)/g)) {
        const name = m[1];
        if (!tokenNames.has(name) && !name.startsWith('--c-')) err(file, line, 'L2', `${prop}: var(${name}) is not in tokens.css`, 'use a token from src/styles/tokens.css');
        if (SPACING_PROPS.test(prop) && tokenNames.has(name) && !spacingTokens.has(name)) err(file, line, 'D5', `${prop}: var(${name}) is not a spacing token`, `spacing uses only ${[...spacingTokens].join(', ')}`);
      }
      let flat = stripped; for (let i = 0; i < 6; i++) flat = flat.replace(/[a-z-]*\([^()]*\)/g, 'X');
      if (SPACING_PROPS.test(prop) && /(^|[^\w-])-?\d*\.?\d+(?![\w%.-])/.test(flat) && !/^(0\s*)+$/.test(flat.trim()) && !/(^|\s)0(\s|$)/.test(flat)) err(file, line, 'D5', `${prop}: ${value}`, 'spacing is 0 or a token');
      return;
    }
    // L1: blocks, pages, layouts
    if (forbiddenRe.some((re) => re.test(prop))) {
      err(file, line, 'L1', `${prop}: ${value} in a ${kind}`, 'spacing, size and type exist only in primitives: use Stack/Cluster/Grid/Card/Text (gap="8|12|16|24|32|40")');
      return;
    }
    if (!allowedRe.some((re) => re.test(prop))) {
      err(file, line, 'L1', `${prop}: ${value} is not allowed in a ${kind}`, `allowed: ${LOCK.blockAllowedProps.join(', ')}`);
      return;
    }
    if (prop === 'overflow' || prop === 'overflow-x' || prop === 'overflow-y') {
      if (/clip/.test(value) || (/hidden/.test(value) && /section/.test(d.parent?.selector ?? ''))) err(file, line, 'L1', `${prop}: ${value}`, 'sections never clip; use overflow auto/visible on content only');
    }
    if (/^(color|background|background-color)$/.test(prop) && !/^(none|transparent|inherit|currentColor)$/.test(value) && !/^var\(--c-[\w-]+\)$/.test(value)) err(file, line, 'L1', `${prop}: ${value}`, 'colours come from var(--c-*) only');
    if (/^border/.test(prop)) {
      const bad = value.replace(/var\(--(c|bw)-[\w-]+\)/g, '').split(/\s+/).filter(Boolean).filter((x) => !BLOCK_VALUE_OK.test(x));
      if (bad.length) err(file, line, 'L1', `${prop}: ${value}`, 'borders use var(--bw-*) and var(--c-*) only');
    }
  });
}

// ---------- scripts
function checkScript(file, code, lineOffset) {
  const lines = code.split('\n');
  lines.forEach((l, i) => {
    if (/\.style\b\s*[.[=]|\.style\.[a-zA-Z]+\s*=|setProperty\s*\(|\.cssText\b|setAttribute\(\s*['"]style['"]/.test(l)) err(file, lineOffset + i, 'L3', `style written from a script: ${l.trim().slice(0, 70)}`, 'toggle a class or an attribute and style it in the primitive');
  });
}

// ---------- one file
function checkFile(file, text) {
  const kind = kindOf(file);
  if (/\.css$/.test(file)) { checkCss(file, kind, text, 1); return; }
  if (/\.(js|ts|mjs)$/.test(file)) {
    checkScript(file, text, 1);
    if (/<\/?(b|strong)\b/i.test(text) && !/^qa\//.test(file)) { const i = text.search(/<\/?(b|strong)\b/i); err(file, lineAt(text, i), 'D2', 'a <b>/<strong> tag', 'no bold inside text (D2)'); }
    return;
  }
  if (!/\.astro$/.test(file)) return;

  // styles
  for (const m of text.matchAll(/<style([^>]*)>([\s\S]*?)<\/style>/g)) {
    const attrs = m[1];
    const startLine = lineAt(text, m.index + m[0].indexOf('>') + 1);
    if (/\bis:global\b/.test(attrs)) err(file, lineAt(text, m.index), 'L3', '<style is:global>', 'page-wide rules live in src/styles/base.css only');
    checkCss(file, kind, m[2], startLine);
  }
  // scripts
  for (const m of text.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) checkScript(file, m[2], lineAt(text, m.index + m[0].indexOf('>') + 1));
  // template-level rules
  const tpl = templateOf(text);
  for (const m of tpl.matchAll(/\sstyle\s*=/g)) err(file, lineAt(tpl, m.index), 'L3', 'style="" attribute', 'no inline styles: use primitive props or classes');
  for (const m of tpl.matchAll(/\bstyle=\{/g)) err(file, lineAt(tpl, m.index), 'L3', 'style={} attribute', 'no inline styles');
  for (const m of tpl.matchAll(/<\/?(b|strong)(\s|>)/gi)) err(file, lineAt(tpl, m.index), 'D2', `<${m[1]}> tag`, 'no bold inside text (D2)');
  // frontmatter strings with bold tags
  const fm = text.match(/^(?:<!--[^\n]*-->\n)?---\n([\s\S]*?)\n---/);
  if (fm) for (const m of fm[1].matchAll(/<\/?(b|strong)(\s|>)/gi)) err(file, lineAt(text, m.index + 4), 'D2', `<${m[1]}> in a string`, 'no bold inside text (D2)');
  // gap props must be names from the scale
  for (const m of tpl.matchAll(/<(Stack|Cluster)\b[^>]*?\sgap=(?:\{([^}]*)\}|"([^"]*)")/g)) {
    const v = (m[2] ?? m[3]).trim().replace(/^['"]|['"]$/g, '');
    const ok = SCALE.map(String).includes(v) || (m[1] === 'Cluster' && v === 'buttons');
    if (!ok) err(file, lineAt(tpl, m.index), 'D5', `<${m[1]} gap=${v}>`, `gap is one of ${SCALE.join(', ')}${m[1] === 'Cluster' ? ', buttons' : ''}`);
  }
  for (const m of tpl.matchAll(/<Text\b[^>]*?\srole=(?:\{([^}]*)\}|"([^"]*)")/g)) {
    const raw = (m[1] ?? m[2]).trim();
    const literal = m[2] !== undefined || /^['"][^'"]*['"]$/.test(raw);
    const v = raw.replace(/^['"]|['"]$/g, '');
    if (literal && !(v in R.roles)) err(file, lineAt(tpl, m.index), 'L1', `<Text role=${v}>`, `role is one of ${Object.keys(R.roles).join(', ')}`);
  }
  // L4 imports
  const front = fm ? fm[1] : '';
  const imports = [...front.matchAll(/import\s+(?:[\w*{}\s,]+\s+from\s+)?['"]([^'"]+)['"]/g)].map((m) => ({ spec: m[1], line: lineAt(text, text.indexOf(m[0])) }));
  const base = path.posix.dirname(file);
  const resolved = (spec) => (spec.startsWith('.') ? path.posix.normalize(path.posix.join(base, spec)) : spec);
  if (kind === 'page') {
    for (const im of imports) {
      const r = resolved(im.spec);
      if (/^src\/components\/blocks\//.test(r)) {
        const name = r.replace(/^src\/components\/blocks\//, '').replace(/\.astro$/, '');
        if (!REG.blocks.includes(name)) err(file, im.line, 'L4', `page imports block ${name} that is not in blocks.json`, 'only blocks listed in qa/rules/blocks.json');
      } else if (/^src\/components\//.test(r)) err(file, im.line, 'L4', `page imports ${r}`, 'pages import blocks (qa/rules/blocks.json) and layouts only');
    }
  }
  if (kind === 'block') {
    const name = path.posix.basename(file, '.astro');
    if (!REG.blocks.includes(name)) err(file, 1, 'L4', `block ${name} is not in qa/rules/blocks.json`, 'adding a block needs owner approval: edit blocks.json (protected)');
    for (const im of imports) {
      const r = resolved(im.spec);
      if (/^src\/components\/blocks\//.test(r)) {
        const n = r.replace(/^src\/components\/blocks\//, '').replace(/\.astro$/, '');
        if (!REG.blocks.includes(n)) err(file, im.line, 'L4', `block imports block ${n} that is not in blocks.json`, 'only listed blocks');
      } else if (/^src\/components\/ui\//.test(r)) {
        const n = r.replace(/^src\/components\/ui\//, '').replace(/\.astro$/, '');
        if (!REG.primitives.includes(n)) err(file, im.line, 'L4', `block imports ${n} which is not a primitive in blocks.json`, 'only primitives listed in qa/rules/blocks.json');
      } else if (/^src\/components\//.test(r)) {
        if (!/^src\/components\/seo\/JsonLd$/.test(r.replace(/\.astro$/, ''))) err(file, im.line, 'L4', `block imports ${r}`, 'blocks import ui primitives, other listed blocks and seo/JsonLd only');
      }
    }
  }
  if (kind === 'ui') {
    const name = path.posix.basename(file, '.astro');
    if (!REG.primitives.includes(name)) err(file, 1, 'L4', `primitive ${name} is not in qa/rules/blocks.json`, 'adding a primitive needs owner approval: edit blocks.json (protected)');
  }
}

// ---------- run
const SRC_RE = /\.(astro|css|ts|js|mjs)$/;
function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

if (flag('--file')) {
  const file = opt('--file').split(path.sep).join('/');
  const f = path.isAbsolute(file) ? rel(file) : file;
  const text = flag('--stdin') ? fs.readFileSync(0, 'utf8') : fs.readFileSync(path.join(ROOT, f), 'utf8');
  if (/^src\//.test(f) && SRC_RE.test(f)) checkFile(f, text);
  else if (/^(CLAUDE\.md|qa\/rules\/blocks\.json)$/.test(f)) { /* protected files are guarded by guard.mjs, nothing to lint */ }
} else {
  const files = walk(path.join(ROOT, 'src')).filter((p) => SRC_RE.test(p));
  for (const p of files) checkFile(rel(p), fs.readFileSync(p, 'utf8'));
  // registry: every block and primitive file is listed, every listed one exists
  const have = (d) => fs.existsSync(path.join(ROOT, d)) ? fs.readdirSync(path.join(ROOT, d)).filter((x) => x.endsWith('.astro')).map((x) => x.replace(/\.astro$/, '')) : [];
  for (const n of REG.blocks) if (!have('src/components/blocks').includes(n)) err('qa/rules/blocks.json', 1, 'L4', `block ${n} is listed but src/components/blocks/${n}.astro does not exist`, 'remove it from blocks.json');
  for (const n of REG.primitives) if (!have('src/components/ui').includes(n)) err('qa/rules/blocks.json', 1, 'L4', `primitive ${n} is listed but src/components/ui/${n}.astro does not exist`, 'remove it from blocks.json');
  // generated scale types in sync with rules.json
  try { execFileSync('node', [path.join(ROOT, 'scripts/gen-scale.mjs'), '--check'], { cwd: ROOT, stdio: 'pipe' }); }
  catch (e) { err('src/lib/scale.ts', 1, 'D5', 'generated scale types are out of date with qa/rules/rules.json', 'run npm run gen:scale'); }
}

const out = errors.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
if (flag('--json')) console.log(JSON.stringify(out, null, 1));
else {
  for (const e of out) console.error(`${e.file}:${e.line}  [${e.rule}] ${e.what}\n    allowed: ${e.allowed}`);
  const ms = Date.now() - t0;
  console.log(out.length ? `lock FAILED: ${out.length} error(s) (${ms} ms)` : `lock passed: 0 errors (${ms} ms)`);
}
process.exitCode = out.length ? 1 : 0;
