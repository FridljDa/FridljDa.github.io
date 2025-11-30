// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

// https://astro.build/config
export default defineConfig({
  site: 'https://fridljda.github.io',
  base: '/',
  // Enable Server-Side Rendering
  output: 'server',
  
  // Configure the Node.js adapter
  adapter: node({
    // 'standalone' creates a server that runs on its own.
    // This is ideal for Render web services.
    mode: 'standalone',
  }),

  integrations: [
    react(),
    tailwind(),
    mdx()
  ],
  
  // Server configuration
  server: {
    // HOST: true is critical for Docker/Render environments.
    // It binds the server to 0.0.0.0 instead of localhost/127.0.0.1
    // enabling external access through the container network.
    host: true,
    port: 4321,
  },
  
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      rehypeKatex,
      rehypeSlug,
      [rehypeAutolinkHeadings, {
        behavior: 'wrap',
        properties: {
          class: 'anchor-link'
        }
      }]
    ],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  }
});
