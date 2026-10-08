# Agent notes

## Images: full resolution, no Astro Image pipeline

Raster images are served as **original files** via plain `<img src="/images/...">` tags. The browser downscales in CSS (`object-cover`, Tailwind width classes).

We intentionally **do not** use `astro:assets` (`<Image />`, `srcset`, WebP conversion, or `/_image` resizing) for site images. An Astro Image experiment (commit `331996c`) produced noticeably soft results on high-DPI screens because pre-generated small variants cannot match browser downscaling from full-resolution sources.

**Tradeoff accepted:** larger downloads and slightly slower loads on slow connections. **Priority:** visual sharpness over bandwidth.

Assets live under `src/assets/images/` with `public/images` symlinked for stable `/images/...` URLs in MDX and frontmatter. Do not reintroduce responsive image optimization without explicit owner approval.

## Reposts (LinkedIn, Confluence)

Versions of blog posts for other channels live under `src/content/reposts/` and are never shown on the site. Read `src/content/reposts/AGENTS.md` before writing one.

## Figures: one style per post

All figures within a blog post share one visual style: the palette in `src/components/loop-animation.css`, the icons in `src/remotion/shared.tsx`, and short labels instead of explanatory text inside figures. Explanations go in the post's prose or a caption. Raster mockups are rendered in a light and a dark version and shown with `<ThemedImage>`. The Missing Compiler opens every section with `<SystemMap preset="..." />`, the same map with that section's part highlighted.

## Animated figures (Remotion)

Animations in posts are Remotion compositions in `src/remotion/`, embedded with `<LoopAnimation name="..." />` (`src/components/LoopAnimation.astro`). Every frame is a pure function of the frame number, and the last frame is the resting state: reduced motion and the Confluence copy show it as a still. Keep text inside them to short labels. After changing a composition, regenerate its PNG with `npm run confluence:figures` (dev server running) and commit only the PNGs that changed on purpose.
