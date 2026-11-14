// GENERATED from qa/rules/rules.json by scripts/gen-scale.mjs. Do not edit.
export const SCALE = [8,12,16,24,32,40] as const;
export type Gap = (typeof SCALE)[number];
export type ClusterGap = Gap | 'buttons';
export const ROLES = ["page-title","section-title","card-title","text","small","label","metric","control"] as const;
export type Role = (typeof ROLES)[number];
export const assertGap = (v: unknown, who: string): void => {
  if (!(SCALE as readonly unknown[]).includes(v)) throw new Error(`${who}: gap ${String(v)} is not in the scale ${SCALE.join(', ')} (CLAUDE.md D5)`);
};
