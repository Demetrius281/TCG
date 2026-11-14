// Static design check (CLAUDE.md "How to build"). Run: npm run check
// Fails on: hex colours or px outside tokens.css, inline styles, font-size outside base.css,
// <h2> outside SectionHead, raw <section>, overrides of Section/SectionHead/Grid spacing from blocks,
// unknown block types in the content files.
// Known exceptions: theme-color meta, matchMedia strings, min-width media queries, env() insets,
// SVG entity text, SVG illustration fragments (font-size only).
// Violations that existed before the rules (the pages that are not migrated yet) are listed in
// qa/baseline/design.json. New violations fail; the baseline can only shrink.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const ROOT = process.cwd();
const BASELINE = path.join(ROOT, 'qa/baseline/design.json');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

const src = walk(path.join(ROOT, 'src')).filter((f) => /\.(astro|css|ts|js|mjs)$/.test(f));
const frags = walk(path.join(ROOT, 'public/illustrations')).filter((f) => f.endsWith('.html'));
const yamls = walk(path.join(ROOT, 'src/content')).filter((f) => f.endsWith('.yaml'));

const found = [];
const add = (file, rule, snippet) => found.push({ file: rel(file), rule, snippet: snippet.replace(/\s+/g, ' ').trim().slice(0, 90) });

function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' ')).replace(/^\s*\/\/.*$/gm, '');
}

for (const file of [...src, ...frags]) {
  const name = rel(file);
  const isTokens = name === 'src/styles/tokens.css';
  const isBase = name === 'src/styles/base.css';
  const isFrag = name.startsWith('public/illustrations/');
  const raw = fs.readFileSync(file, 'utf8');
  const text = stripComments(raw);
  const lines = text.split('\n');

  lines.forEach((line) => {
    if (!isTokens) {
      // Rule: no hex outside tokens.css
      const l = line.replace(/&#\d+;/g, '');
      if (!/theme-color/.test(l)) {
        for (const m of l.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
          const ctx = l.slice(Math.max(0, m.index - 1), m.index);
          if (/["'(=:,\s{]/.test(ctx) || m.index === 0) {
            // hrefs and anchors such as href="#add" are not colours
            if (!/(href|id|aria-\w+|for|data-\w+)\s*=\s*["']#?[^"']*$/.test(l.slice(0, m.index + 1)) && !/href: /.test(l)) add(file, 'hex-outside-tokens', l);
          }
        }
        // Rule: no px outside tokens.css (min-width media queries, matchMedia strings and env() are allowed)
        const lp = l
          .replace(/\(\s*(min|max)-width\s*:\s*\d+px\s*\)/g, '')
          .replace(/matchMedia\([^)]*\)/g, '')
          .replace(/env\([^)]*\)/g, '');
        if (/(?<![\w.-])-?\d*\.?\d+px\b/.test(lp)) add(file, 'px-outside-tokens', l);
      }
    }
    // Rule: no inline styles
    if (/\sstyle\s*=/.test(line) || /\bstyle=\{/.test(line)) add(file, 'inline-style', line);
    // Rule: font-size only in base.css roles (SVG illustration fragments are exempt)
    if (!isBase && !isTokens && !isFrag && /(^|[;{\s])font-size\s*:/.test(line)) add(file, 'font-size-outside-base', line);
  });

  if (name.endsWith('.astro')) {
    const isHead = name === 'src/components/ui/SectionHead.astro';
    const isSection = name === 'src/components/ui/Section.astro';
    if (!isHead) for (const l of lines) if (/<h2[\s>]/.test(l)) add(file, 'h2-outside-sectionhead', l);
    if (!isSection) for (const l of lines) if (/<section[\s>]/.test(l)) add(file, 'raw-section', l);
    // Rule: blocks cannot override Section, SectionHead or Grid spacing
    if (name.startsWith('src/components/blocks/')) {
      const css = [...text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
      for (const m of css.matchAll(/([^{}@]+)\{([^{}]*)\}/g)) {
        const selectors = m[1].split(',').map((s) => s.trim());
        const owned = selectors.some((s) => /(^|[\s>+~])\.(section|inner|head|grid)(?![\w-])/.test(s) || /(^|[\s>+~])\.cols-\d(?![\w-])/.test(s));
        if (owned && /(padding|margin|gap|max-width|width)\s*:/.test(m[2])) add(file, 'override-shared-spacing', `${m[1].trim()} { ${m[2].trim()} }`);
      }
      if (/--section-y/.test(text)) add(file, 'override-shared-spacing', '--section-y used in a block');
    }
  }
}

// Rule: block types must exist (registry and schema)
const registry = fs.readFileSync(path.join(ROOT, 'src/components/blocks/Blocks.astro'), 'utf8');
const regKeys = new Set([...registry.slice(registry.indexOf('const registry')).matchAll(/^\s+(\w+):\s*\w+,/gm)].map((m) => m[1]));
const schema = fs.readFileSync(path.join(ROOT, 'src/content.config.ts'), 'utf8');
const schemaTypes = new Set([...schema.matchAll(/type: z\.literal\('(\w+)'\)/g)].map((m) => m[1]));
for (const file of yamls) {
  let doc;
  try { doc = YAML.parse(fs.readFileSync(file, 'utf8')); } catch (e) { add(file, 'yaml-parse', String(e.message).slice(0, 80)); continue; }
  for (const b of doc?.blocks ?? []) {
    if (!regKeys.has(b.type) || !schemaTypes.has(b.type)) add(file, 'unknown-block-type', String(b.type));
  }
}

// Compare with the baseline
const key = (f) => `${f.file}|${f.rule}|${f.snippet}`;
const counts = {};
for (const f of found) counts[key(f)] = (counts[key(f)] ?? 0) + 1;
if (process.env.CHECK_INIT && !fs.existsSync(BASELINE)) {
  fs.mkdirSync(path.dirname(BASELINE), { recursive: true });
  fs.writeFileSync(BASELINE, JSON.stringify(Object.fromEntries(Object.entries(counts).sort()), null, 1) + '\n');
  console.log(`baseline written: ${found.length} known violations in ${Object.keys(counts).length} entries`);
}
const base = fs.existsSync(BASELINE) ? JSON.parse(fs.readFileSync(BASELINE, 'utf8')) : {};
const fresh = [];
for (const [k, n] of Object.entries(counts)) if (n > (base[k] ?? 0)) fresh.push([k, n - (base[k] ?? 0)]);
const byRule = {};
for (const f of found) byRule[f.rule] = (byRule[f.rule] ?? 0) + 1;
if (fresh.length) {
  console.error('check FAILED: new design violations (fix them; do not edit the baseline):');
  for (const [k, n] of fresh) {
    const [file, rule, ...rest] = k.split('|');
    const snippet = rest.join('|');
    console.error(`  ${file} [${rule}]${n > 1 ? ` x${n}` : ''} ${snippet}`);
  }
  process.exit(1);
}
const known = Object.values(base).reduce((a, b) => a + b, 0);
console.log(`check passed: ${found.length} known violations remain in the baseline (${known} listed). By rule: ${JSON.stringify(byRule)}`);
