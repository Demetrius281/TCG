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

const base = { tone };

export const heroBlock = obj({
  type: z.literal('hero'),
  ...base,
  variant: z.enum(['display', 'page']),
  label: text.optional(),
  title: text,
  lead: text.optional(),
  actions: z.array(action).default([]),
  fee_note: text.optional(),
  illustration: text.optional(),
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
    .array(obj({ label: text.optional(), title: text, text: text, href: text.optional() }))
    .min(1),
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
  layout: z.enum(['row', 'list']).default('row'),
  items: z.array(obj({ title: text, text: text, timing: text.optional() })).min(1),
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
  title: text,
  items: z
    .array(obj({ question: text, answer: text, href: text.optional(), linkText: text.optional() }))
    .min(1),
});

export const ctaBlock = obj({
  type: z.literal('cta'),
  ...base,
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
]);

export type Block = z.infer<typeof block>;
export type BlockOf<T extends Block['type']> = Extract<Block, { type: T }>;
export type Action = z.infer<typeof action>;

const home = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/home' }),
  schema: obj({
    seo: obj({ title: text, description: text }),
    blocks: z.array(block).min(1),
  }),
});

export const collections = { home };
