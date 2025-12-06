import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { getBlogPostRawMarkdown } from '../../utils/markdown-generator';

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
    console.error('Error generating markdown for post:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};

