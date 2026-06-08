import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const sections = defineCollection({
  loader: glob({
    pattern: '**/*.mdx',
    base: './src/content/sections'
  }),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    order: z.number(),
    heroKind: z.enum(['plain', 'lifecycle', 'mermaid', 'tabs', 'side-by-side']),
    eyebrow: z.string().optional(),
    estimatedRead: z.number().int().positive().optional(),
    lang: z.enum(['en', 'zh'])
  })
});

export const collections = { sections };
