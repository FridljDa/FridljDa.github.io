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
 * as plain text. See src/content/reposts/linkedin/AGENTS.md, which the
 * pattern leaves out.
 */
const linkedin = defineCollection({
  loader: glob({ pattern: ['*.md', '!AGENTS.md'], base: './src/content/reposts/linkedin' }),
  // Strict, so a field LinkedIn has no place for fails the build instead of
  // being dropped without a word.
  schema: z
    .object({
      status: z.enum(['draft', 'posted']).default('draft'),
      postedAt: z.coerce.date().optional(),
      url: z.url().optional(),
      // A post takes one image; more go in comments, one each.
      image: z.string().optional(),
      comments: z
        .array(
          z
            .object({
              text: z.string().refine((text) => countCharacters(text) <= LINKEDIN.maxCommentLength, {
                message: `A LinkedIn comment holds at most ${LINKEDIN.maxCommentLength} characters`,
              }),
              image: z.string().optional(),
            })
            .strict(),
        )
        .default([]),
    })
    .strict(),
});

export const collections = { blog, linkedin };
