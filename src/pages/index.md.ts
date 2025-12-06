import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { generateHomePageMarkdown } from '../utils/markdown-generator';

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
    console.error('Error generating home page markdown:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};

