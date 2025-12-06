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
import { h } from 'hastscript';

// https://astro.build/config
export default defineConfig({
  // AI discoverability: Site URL configuration for proper canonical URLs and structured data
  site: 'https://danielfridljand.de',
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
        behavior: 'append',
        properties: {
          class: 'anchor-link',
          ariaLabel: 'Link to heading'
        },
        content: h('svg', {
          class: 'anchor-link-icon',
          width: '16',
          height: '16',
          viewBox: '0 0 16 16',
          fill: 'none',
          stroke: 'currentColor',
          'stroke-width': '1.5',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'aria-hidden': 'true'
        }, [
          h('path', {
            d: 'M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z'
          })
        ])
      }]
    ],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  }
});
