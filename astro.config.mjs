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

  // The Missing Compiler was renamed The Missing Test Suite; keep its old links working.
  redirects: {
    '/post/the-missing-compiler': '/post/the-missing-test-suite',
    '/post/the-missing-compiler/linkedin': '/post/the-missing-test-suite/linkedin',
    '/post/the-missing-compiler/confluence': '/post/the-missing-test-suite/confluence',
    '/post/the-missing-compiler.md': '/post/the-missing-test-suite.md',
  },
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
    mdx()
  ],
  
  vite: {
    plugins: [tailwind()],
    // Pre-bundled at startup: otherwise the dev server discovers Remotion on a
    // post's first visit, re-bundles it, and fails that page's requests with 504.
    optimizeDeps: {
      include: ['remotion', '@remotion/player'],
    },
  },
  
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
