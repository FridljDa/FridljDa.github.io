// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwind from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

// https://astro.build/config
export default defineConfig({
  // AI discoverability: Site URL configuration for proper canonical URLs and structured data
  site: 'https://danielfridljand.de',
  base: '/',
  // Enable Server-Side Rendering
  output: 'server',
  
  // Configure the Node.js adapter
  adapter: node({
    // 'standalone' creates a server that runs on its own (Docker/Coolify, etc.).
    mode: 'standalone',
  }),

  integrations: [
    react(),
    mdx()
  ],
  
  vite: {
    plugins: [tailwind()]
  },
  
  // Server configuration
  server: {
    // HOST: true is required for Docker/cloud so the server binds to 0.0.0.0.
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
          class: 'heading-link'
        }
      }]
    ],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  }
});
