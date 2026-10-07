import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    // Set when the post was first published elsewhere (e.g. Medium).
    canonicalUrl: z.url().optional(),
  }),
});

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    company: z.string(),
    role: z.string(),
    period: z.string(),
    location: z.string().optional(),
    summary: z.string(),
    stack: z.array(z.string()).default([]),
    // Measured outcomes. The "Impact" section only appears when this is filled in.
    impact: z.array(z.string()).default([]),
    order: z.number().default(0),
  }),
});

export const collections = { blog, work };
