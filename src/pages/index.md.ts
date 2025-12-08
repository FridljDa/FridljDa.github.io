import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { generateHomePageMarkdown } from '../utils/markdown-generator';
import { logger } from '../utils/logger';

export const GET: APIRoute = async () => {
  try {
    const blogPosts = await getCollection('blog');
    const markdown = generateHomePageMarkdown(blogPosts);

    return new Response(markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
      },
    });
  } catch (error) {
    logger.error(
      'Error generating home page markdown:',
      error instanceof Error ? error.message : String(error)
    );
    return new Response('Internal Server Error', { status: 500 });
  }
};

