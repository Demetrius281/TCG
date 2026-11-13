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
}).refine((a) => Boolean(a.href) !== Boolean(a.message), {
  message: 'An action needs exactly one of href or message',
});

const base = { tone, id: text.optional() };

export const heroBlock = obj({
  type: z.literal('hero'),
  ...base,
  variant: z.enum(['display', 'page']),
  label: text.optional(),
  title: text,
  lead: text.optional(),
  actions: z.array(action).default([]),
  meta: text.optional(),
  fee_note: text.optional(),
  illustration: z.enum(['property-check']).optional(),
  metrics: z.array(obj({ value: text, label: text })).optional(),
});

export const cardsBlock = obj({
  type: z.literal('cards'),
  ...base,
  label: text.optional(),
  title: text.optional(),
  lead: text.optional(),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).default(3),
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
  schema: obj({ seo, blocks: z.array(block).min(1) }),
});

export const collections = { home, pages };
