import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const text = z.string().min(1);
const obj = <T extends z.ZodRawShape>(shape: T) => z.object(shape).strict();

const tone = z.enum(['default', 'sunken', 'inverse']).optional();
const messageKey = z.enum(['consultation']);

/** A button: either an internal/external link or a WhatsApp message by key. */
const action = obj({
  label: text,
  href: text.optional(),
  message: messageKey.optional(),
  variant: z.enum(['primary', 'secondary', 'inverse', 'text']).optional(),
  data_cta: text.optional(),
}).refine((a) => Boolean(a.href) !== Boolean(a.message), {
  message: 'An action needs exactly one of href or message',
});

const base = { tone, id: text.optional(), nav: text.optional() };

export const heroBlock = obj({
  type: z.literal('hero'),
  ...base,
  variant: z.enum(['display', 'page']),
  heading_id: text.optional(),
  label: text.optional(),
  hide_label_mobile: z.boolean().optional(),
  title: text,
  subtitle: text.optional(),
  lead: text.optional(),
  actions: z.array(action).default([]),
  meta: text.optional(),
  fee_note: text.optional(),
  intro: obj({ title: text, text }).optional(),
  illustration: z.enum(['property-check', 'regulations', 'platform']).optional(),
  metrics: z.array(obj({ value: text, label: text })).optional(),
});

export const cardsBlock = obj({
  type: z.literal('cards'),
  ...base,
  label: text.optional(),
  title: text.optional(),
  lead: text.optional(),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
  variant: z.enum(['card', 'seam']).default('card'),
  items: z
    .array(obj({
        label: text.optional(),
        title: text,
        text: text,
        tag: text.optional(),
        href: text.optional(),
      }),
    )
    .min(1),
  note: obj({ text, link: obj({ label: text, href: text }).optional() }).optional(),
});

export const servicesBlock = obj({
  type: z.literal('services'),
  ...base,
  title: text,
  lead: text.optional(),
  groups: z
    .array(
      obj({
        name: text.optional(),
        items: z.array(obj({ title: text, text: text, href: text })).min(1),
      }),
    )
    .min(1),
});

export const stepsBlock = obj({
  type: z.literal('steps'),
  ...base,
  label: text.optional(),
  title: text,
  layout: z.enum(['row', 'list', 'grid']).default('row'),
  items: z
    .array(obj({ label: text.optional(), title: text, text: text, timing: text.optional(), first: z.boolean().optional() }))
    .min(1),
});

export const metricsBlock = obj({
  type: z.literal('metrics'),
  ...base,
  title: text.optional(),
  items: z.array(obj({ value: text, label: text })).min(1),
  notes: z.array(text).optional(),
});

export const testimonialsBlock = obj({
  type: z.literal('testimonials'),
  ...base,
  title: text,
  items: z
    .array(obj({ quote: text, name: text, meta: text.optional(), photo: text.optional() }))
    .min(1),
});

export const logosBlock = obj({
  type: z.literal('logos'),
  ...base,
  title: text,
  items: z.array(obj({ image: text, name: text })).min(1),
  disclaimer: text,
});

export const faqBlock = obj({
  type: z.literal('faq'),
  ...base,
  label: text.optional(),
  json_ld: z.boolean().default(true),
  layout: z.enum(['split', 'stack']).optional(),
  heading_id: text.optional(),
  title: text,
  items: z
    .array(obj({ question: text, answer: text, href: text.optional(), linkText: text.optional() }))
    .min(1),
});

export const ctaBlock = obj({
  type: z.literal('cta'),
  ...base,
  label: text.optional(),
  title: text,
  text: text,
  action,
  secondary: obj({ label: text, href: text }).optional(),
  side: obj({ title: text, items: z.array(obj({ label: text, text })).min(1), note: text.optional() }).optional(),
  next_steps: z.array(text).optional(),
});

export const sampleBlock = obj({
  type: z.literal('sample'),
  ...base,
  label: text.optional(),
  title: text,
  lead: text.optional(),
  document_title: text,
  rows: z
    .array(obj({ label: text, value: text, status: z.enum(['ok', 'warn', 'danger']) }))
    .min(1),
  note: text.optional(),
});

export const disclosureBlock = obj({
  type: z.literal('disclosure'),
  ...base,
  title: text,
  text: text,
  href: text.optional(),
});


/** Sticky section navigator and back-to-top button for long guides. */
export const guideNavBlock = obj({
  type: z.literal('guide_nav'),
  ...base,
  brand: text,
  title: obj({ label: text, href: text }),
  links: z.array(obj({ label: text, href: text })).min(1),
  jump: obj({
    label: text,
    fallback: text,
    links: z.array(obj({ label: text, href: text })).min(1),
  }),
  to_top: text,
});

/** Question index: numbered links to guide sections. */
export const topicsBlock = obj({
  type: z.literal('topics'),
  ...base,
  title: text,
  items: z.array(obj({ number: text, question: text, hint: text, href: text })).min(1),
});

const guideRow = z.array(text);
const guideTag = obj({ label: text, kind: z.enum(['law', 'draft', 'impl', 'future', 'enf']) });

/** One part of a guide section. */
export const guidePart = z.discriminatedUnion('part', [
  obj({ part: z.literal('prose'), paragraphs: z.array(text).min(1), plain: z.boolean().optional() }),
  obj({ part: z.literal('heading'), id: text.optional(), text, variant: z.enum(['h3', 'base']).default('h3') }),
  obj({ part: z.literal('note'), variant: z.enum(['pull', 'tbl-note', 'sub-lead', 'callout']), text, strong: text.optional() }),
  obj({ part: z.literal('terms'), variant: z.enum(['defs', 'coef']), items: z.array(obj({ abbr: text, full: text, text })).min(1) }),
  obj({ part: z.literal('codes'), items: z.array(obj({ kind: z.enum(['i', 't', 'b', 'x']), letter: text, title: text, text })).length(4) }),
  obj({
    part: z.literal('list'),
    variant: z.enum(['plain', 'checks', 'restr', 'feas', 'steps4', 'facts', 'tools', 'base']),
    items: z.array(z.union([text, obj({ title: text, text })])).min(1),
  }),
  obj({
    part: z.literal('cards'),
    variant: z.enum(['rules', 'imb', 'plan']),
    items: z.array(obj({ tag: guideTag.optional(), kicker: text, title: text, text, draft: z.boolean().optional() })).min(1),
  }),
  obj({
    part: z.literal('table'),
    variant: z.enum(['layers', 'scenarios', 'kbli', 'pma', 'audit']),
    columns: z.array(text).min(2),
    groups: z.array(obj({ name: text.optional(), rows: z.array(obj({ cells: guideRow.min(2), highlight: z.boolean().optional() })).min(1) })).min(1),
  }),
  obj({ part: z.literal('compare'), items: z.array(obj({ kind: z.enum(['pbg', 'slf']), abbr: text, full: text, rows: z.array(obj({ label: text, value: text })).min(1) })).length(2) }),
  obj({ part: z.literal('path'), items: z.array(obj({ step_label: text, step: text, title: text, text, zone: text })).min(1) }),
  obj({ part: z.literal('chain'), items: z.array(obj({ title: text, text })).min(1) }),
  obj({
    part: z.literal('kbli_shift'),
    old: obj({ code: text, title: text, note: text }),
    arrow: text,
    current: obj({ code: text, title: text, note: text }),
  }),
  obj({ part: z.literal('split'), items: z.array(obj({ id: text.optional(), title: text, paragraphs: z.array(text).min(1) })).length(2) }),
  obj({ part: z.literal('formula'), items: z.array(text).min(3) }),
  obj({ part: z.literal('taxbox'), id: text.optional(), label: text, title: text, paragraphs: z.array(text).min(1) }),
  obj({ part: z.literal('screen'), columns: z.array(obj({ title: text, items: z.array(text).min(1) })).length(2) }),
  obj({ part: z.literal('results'), items: z.array(obj({ kind: z.enum(['ok', 'cd', 'mi']), title: text, text })).length(3) }),
  obj({
    part: z.literal('timeline'),
    items: z.array(obj({ title: text, text, tag: guideTag.extend({ kind: z.enum(['law', 'draft', 'impl', 'future', 'enf']) }), when: text })).min(1),
  }),
]);

/** A guide section: label, title, answer line and an ordered list of parts. */
export const guideBlock = obj({
  type: z.literal('guide'),
  ...base,
  label: text.optional(),
  chain: z.array(z.number().int().min(1).max(6)).optional(),
  heading_id: text.optional(),
  title: text.optional(),
  lead: text.optional(),
  answer: text.optional(),
  parts: z.array(guidePart).default([]),
});

/** Primary sources list with review date and status legend. */
export const sourcesBlock = obj({
  type: z.literal('sources'),
  ...base,
  title: text,
  intro: obj({ lead: text, items: z.array(text).min(1) }),
  review: obj({ strong: text, date: text, text, legend: z.array(guideTag).min(1) }),
  items: z
    .array(obj({ authority: text, document: text, tag: guideTag, href: text }))
    .min(1),
  new_tab: text,
  notice: obj({ strong: text, text }).optional(),
});

/** Intro copy with a grid of icon cards. */
export const featuresBlock = obj({
  type: z.literal('features'),
  ...base,
  label: text,
  title: text,
  paragraphs: z.array(text).min(1),
  items: z.array(obj({ icon: z.enum(['network', 'spark', 'layers', 'target']), title: text, text })).min(1),
});

/** Copy next to a highlighted figure panel with a call to action. */
export const spotlightBlock = obj({
  type: z.literal('spotlight'),
  ...base,
  label: text,
  title: text,
  lead: text,
  panel: obj({
    kicker: text,
    time: obj({ value: text, unit: text }),
    result: text,
    comparison: obj({ label: text, value: text }),
    cta: obj({ label: text, arrow: text, href: text }),
    note: text,
  }),
});

/** Illustrative acquisition case: copy on one side, case card on the other. */
export const acquisitionCaseBlock = obj({
  type: z.literal('acquisition_case'),
  ...base,
  label: text,
  title: text,
  paragraphs: z.array(text).min(1),
  profit: obj({ title: text, text }),
  case: obj({
    top: z.tuple([text, text]),
    photo: obj({ src: text, alt: text, width: z.number(), height: z.number() }),
    prices: z.array(obj({ label: text, value: text, discount: z.boolean().optional() })).length(3),
    facts: z.array(obj({ title: text, text })).length(2),
    disclaimer: text,
  }),
});

const archNode = obj({ title: text, text });

/** Input, processing and output diagram. */
export const architectureBlock = obj({
  type: z.literal('architecture'),
  ...base,
  label: text,
  title: text,
  head: z.tuple([text, text]),
  columns: z.tuple([text, text, text]),
  inputs: z.array(archNode).length(3),
  engine: obj({ kicker: text, title: text, modules: z.array(archNode).length(3) }),
  outputs: z.array(archNode).length(3),
  foot: z.array(obj({ title: text, text })).length(3),
  note: text,
});

/** Investment inquiry form that opens WhatsApp. Behaviour lives in src/scripts. */
const formField = obj({ label: text, tag: text });
export const inquiryBlock = obj({
  type: z.literal('inquiry'),
  ...base,
  label: text,
  title: text,
  lead: text,
  stage: z.array(obj({ label: text, text })).length(2),
  panel: obj({ title: text, note: text }),
  fields: obj({ name: formField, organisation: formField, role: formField, interest: formField, contact: formField, message: formField }),
  interest_options: z.array(obj({ value: z.string(), label: text })).min(2),
  message_placeholder: text,
  submit: text,
  disclaimer: text,
});

/** Sample report document: findings table, key risk, recommended action. */
export const reportBlock = obj({
  type: z.literal('report'),
  ...base,
  label: text,
  title: text,
  lead: text,
  line: text,
  document: obj({
    aria_label: text,
    brand: text,
    title: text,
    meta: text,
    columns: z.tuple([text, text, text]),
    findings_label: text,
    rows: z
      .array(obj({ category: text, finding: text, source: text, status: z.enum(['ok', 'risk', 'unverified']), status_label: text }))
      .min(1),
    risk: obj({ label: text, text }),
    action: obj({ label: text, text }),
    includes: text,
    disclaimer: text,
  }),
});

/** Side-by-side comparison of two options with a closing line. */
export const comparisonBlock = obj({
  type: z.literal('comparison'),
  ...base,
  title: text,
  highlight: obj({
    title: text,
    tag: text,
    facts: z.array(obj({ label: text, value: text })).min(1),
    text,
    action,
  }),
  other: obj({
    title: text,
    facts: z.array(obj({ label: text, value: text })).min(1),
    text,
  }),
  closing: text,
});

/** Pricing tiers. Each tier can preselect a plan in the order form. */
export const pricingBlock = obj({
  type: z.literal('pricing'),
  ...base,
  label: text.optional(),
  title: text,
  hint: text.optional(),
  note: text.optional(),
  result_label: text,
  tiers: z
    .array(
      obj({
        name: text,
        tag: text.optional(),
        price: text,
        scope: text,
        delivery: text,
        features: z.array(obj({ text, inherited: z.boolean().optional() })).min(1),
        result: text,
        cta: obj({ label: text, href: text, plan: text }),
        featured: z.boolean().optional(),
        standard: z.boolean().optional(),
      }),
    )
    .min(1),
});

const option = obj({ value: text, label: text, detail: text.optional() });

/** Four-step order form that sends the order via WhatsApp. Behaviour lives in src/scripts. */
export const orderBlock = obj({
  type: z.literal('order'),
  ...base,
  label: text,
  title: text,
  lead: text,
  step_label: text,
  stages: z.tuple([text, text, text, text]),
  summary_label: text,
  panel_aria: text,
  buttons: obj({ next: text, back: text, skip_docs: text, submit: text, confirm_location: text }),
  plan: obj({
    legend: text,
    options: z.array(obj({ value: text, name: text, detail: text, price: text, checked: z.boolean().optional() })).length(3),
  }),
  property: obj({
    type: obj({ legend: text, options: z.array(option).min(1) }),
    location: obj({ label: text, tag: text, help: text, placeholder: text, map_label: text }),
    use: obj({ legend: text, tag: text, options: z.array(option).min(1) }),
    project: obj({ label: text, tag: text }),
    seller: obj({ label: text, tag: text, help: text }),
    seller_type: obj({ legend: text, options: z.array(option).length(2) }),
    legal: obj({ label: text, tag: text, help: text }),
    nib: obj({ label: text, tag: text }),
  }),
  documents: obj({ lead: text, legend: text, options: z.array(option).min(1), note: text }),
  details: obj({
    name: obj({ label: text }),
    email: obj({ label: text, help: text }),
    review: obj({ label: text, plan: text, price: text, location: text, documents: text }),
    terms: obj({ before: text, link_text: text, href: text, after: text }),
    help: text,
  }),
  done: obj({
    title: text,
    rows: z.tuple([text, text, text, text]),
    note: obj({ before: text, after: text }),
    retry: obj({ before: text, link_text: text, after: text }),
  }),
  disclaimer: text,
});

export const block = z.discriminatedUnion('type', [
  heroBlock,
  cardsBlock,
  servicesBlock,
  stepsBlock,
  metricsBlock,
  testimonialsBlock,
  logosBlock,
  faqBlock,
  ctaBlock,
  sampleBlock,
  disclosureBlock,
  reportBlock,
  comparisonBlock,
  pricingBlock,
  orderBlock,
  featuresBlock,
  spotlightBlock,
  acquisitionCaseBlock,
  architectureBlock,
  inquiryBlock,
  guideNavBlock,
  topicsBlock,
  guideBlock,
  sourcesBlock,
]);

export type Block = z.infer<typeof block>;
export type BlockOf<T extends Block['type']> = Extract<Block, { type: T }>;
export type Action = z.infer<typeof action>;

const seo = obj({
  title: text,
  description: text,
  og_title: text.optional(),
  robots: text.optional(),
  og_image: text.optional(),
  og_type: text.optional(),
  og_description: text.optional(),
  meta: z.array(obj({ key: text, value: text, attr: z.enum(['name', 'property']).default('name') })).optional(),
  json_ld: z.any().optional(),
});

const home = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/home' }),
  schema: obj({
    seo,
    blocks: z.array(block).min(1),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/pages' }),
  schema: obj({ seo, page_class: text.optional(), header_cta: action.optional(), blocks: z.array(block).min(1) }),
});

export const collections = { home, pages };
