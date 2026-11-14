// Generates src/lib/scale.ts (TypeScript union types) from qa/rules/rules.json. Run: npm run gen:scale
// The lock fails when the generated file is out of date, so a value that is not in rules.json cannot compile.
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const R = JSON.parse(fs.readFileSync(path.join(root, 'qa/rules/rules.json'), 'utf8'));
const steps = R.scale.steps;
const roles = Object.keys(R.roles);
const out = `// GENERATED from qa/rules/rules.json by scripts/gen-scale.mjs. Do not edit.
export const SCALE = ${JSON.stringify(steps)} as const;
export type Gap = (typeof SCALE)[number];
export type ClusterGap = Gap | 'buttons';
export const ROLES = ${JSON.stringify(roles)} as const;
export type Role = (typeof ROLES)[number];
export const assertGap = (v: unknown, who: string): void => {
  if (!(SCALE as readonly unknown[]).includes(v)) throw new Error(\`\${who}: gap \${String(v)} is not in the scale \${SCALE.join(', ')} (CLAUDE.md D5)\`);
};
`;
const file = path.join(root, 'src/lib/scale.ts');
if (process.argv.includes('--check')) {
  const cur = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  if (cur !== out) { console.error('src/lib/scale.ts is out of date: run npm run gen:scale'); process.exit(1); }
} else fs.writeFileSync(file, out);
