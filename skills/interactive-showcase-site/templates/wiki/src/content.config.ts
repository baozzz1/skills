import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const concepts = defineCollection({
  loader: glob({
    pattern: '**/*.mdx',
    base: './src/content/concepts'
  }),
  schema: z.object({
    id: z.string(),
    conceptId: z.string(),
    routeSlug: z.string(),
    title: z.string(),
    order: z.number(),
    category: z.string(),
    lang: z.enum(['en', 'zh'])
  })
});

export const collections = { concepts };
