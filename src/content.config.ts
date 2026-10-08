import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { LINKEDIN, countCharacters } from './utils/linkedin';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    math: z.boolean().default(false),
  }),
});

/**
 * LinkedIn versions of blog posts, written by hand and never listed on the
 * site. The filename is the post's slug and the body is the post text, kept
 * as plain text. See src/content/reposts/AGENTS.md.
 */
const linkedin = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/reposts/linkedin' }),
  schema: z.object({
    status: z.enum(['draft', 'posted']).default('draft'),
    postedAt: z.coerce.date().optional(),
    url: z.url().optional(),
    images: z.array(z.string()).max(LINKEDIN.maxImages).default([]),
    firstComment: z
      .string()
      .refine((text) => countCharacters(text) <= LINKEDIN.maxCommentLength, {
        message: `A LinkedIn comment holds at most ${LINKEDIN.maxCommentLength} characters`,
      })
      .optional(),
  }),
});

export const collections = { blog, linkedin };
