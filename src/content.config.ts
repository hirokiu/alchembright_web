import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
const archive = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content' }),
  schema: z.looseObject({
    source_id: z.number().int(), content_type: z.enum(['post','page']), status: z.literal('publish'),
    title: z.string(), canonical_path: z.string().startsWith('/'), original_url: z.url().nullable(),
    published_at_local: z.string(), published_at_gmt: z.string().nullable(),
    modified_at_local: z.string(), category_ids: z.array(z.number()), tag_ids: z.array(z.number()),
    seo_description: z.string().trim().min(1).max(160).optional(),
    seo_modified_at: z.iso.date().optional(),
    article_kind: z.enum(['general', 'research', 'unreviewed']).default('unreviewed'),
    excerpt: z.string(), conversion_format: z.enum(['markdown','html-preserved']),
  }),
});
export const collections = { archive };
