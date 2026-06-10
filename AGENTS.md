# Agent notes

## Images: full resolution, no Astro Image pipeline

Raster images are served as **original files** via plain `<img src="/images/...">` tags. The browser downscales in CSS (`object-cover`, Tailwind width classes).

We intentionally **do not** use `astro:assets` (`<Image />`, `srcset`, WebP conversion, or `/_image` resizing) for site images. An Astro Image experiment (commit `331996c`) produced noticeably soft results on high-DPI screens because pre-generated small variants cannot match browser downscaling from full-resolution sources.

**Tradeoff accepted:** larger downloads and slightly slower loads on slow connections. **Priority:** visual sharpness over bandwidth.

Assets live under `src/assets/images/` with `public/images` symlinked for stable `/images/...` URLs in MDX and frontmatter. Do not reintroduce responsive image optimization without explicit owner approval.
