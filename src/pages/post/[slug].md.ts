import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { getBlogPostRawMarkdown } from '../../utils/markdown-generator';
import { logger } from '../../utils/logger';

export const GET: APIRoute = async ({ params }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response('Not Found', { status: 404 });
  }

  const blogPosts = await getCollection('blog');
  const post = blogPosts.find((p: CollectionEntry<'blog'>) => p.id === slug);

  if (!post) {
    return new Response('Not Found', { status: 404 });
  }

  try {
    const markdown = await getBlogPostRawMarkdown(post);
    return new Response(markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
      },
    });
  } catch (error) {
    logger.error(
      'Error generating markdown for post:',
      error instanceof Error ? error.message : String(error)
    );
    return new Response('Internal Server Error', { status: 500 });
  }
};

