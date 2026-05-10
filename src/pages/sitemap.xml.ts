// AI discoverability: Dynamic sitemap generation for better AI agent discoverability
import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import { SITE } from '../data/site';

export const GET: APIRoute = async () => {
  const blogPosts = await getCollection('blog');
  const today = new Date().toISOString().split('T')[0];
  const cvYamlUrl = `${SITE.url}/uploads/cv.yaml`;
  
  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- AI discoverability: Home page -->
  <url>
    <loc>${SITE.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- AI discoverability: Machine-readable CV -->
  <url>
    <loc>${cvYamlUrl}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- AI discoverability: Blog posts -->
  ${blogPosts
    .sort((a: CollectionEntry<'blog'>, b: CollectionEntry<'blog'>) => b.data.pubDate.getTime() - a.data.pubDate.getTime())
    .map((post: CollectionEntry<'blog'>) => {
      const lastmod = post.data.updatedDate || post.data.pubDate;
      const htmlUrl = `${SITE.url}/post/${post.id}`;
      const markdownUrl = `${SITE.url}/post/${post.id}.md`;
      const lastModified = lastmod.toISOString().split('T')[0];
      return `  <url>
    <loc>${htmlUrl}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${markdownUrl}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
