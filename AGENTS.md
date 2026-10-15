# Agent notes

This file holds rules that span the repo. Details live in an `AGENTS.md` in the directory they cover, as deep as fits; read the one nearest to the files you change, and put new details there rather than here. Don't put one under `src/pages/`: Astro turns every `.md` file there into a page.

## Images: full resolution, no Astro Image pipeline

Raster images are served as **original files** via plain `<img src="/images/...">` tags. The browser downscales in CSS (`object-cover`, Tailwind width classes).

We intentionally **do not** use `astro:assets` (`<Image />`, `srcset`, WebP conversion, or `/_image` resizing) for site images. An Astro Image experiment (commit `331996c`) produced noticeably soft results on high-DPI screens because pre-generated small variants cannot match browser downscaling from full-resolution sources.

**Tradeoff accepted:** larger downloads and slightly slower loads on slow connections. **Priority:** visual sharpness over bandwidth.

Assets live under `src/assets/images/` with `public/images` symlinked for stable `/images/...` URLs in MDX and frontmatter. Do not reintroduce responsive image optimization without explicit owner approval.

## Reposts (LinkedIn, Confluence)

LinkedIn versions of blog posts are written by hand: read `src/content/reposts/linkedin/AGENTS.md` before writing one. The Confluence copy is generated from the post by code and never rewritten: see `src/content/reposts/AGENTS.md`.

## Examples: invented, never passed off as the project

Posts about client work explain through one concrete running example
(Northstar Bank, Alex Carter, a locked account), because a concrete case teaches
better than an abstract one. The example is invented to protect the client, so
never present it as the real project. Say it is invented before or where it
first appears ("The running example is invented to protect the client, but the
project behind it is real"), and describe the project itself only in generic
terms: "a customer support automation", not "a bank's support automation" or
"our support team at Northstar Bank". Figures and mockups may show the invented
names.

## Figures: one style per post

All figures within a blog post share one visual style. Drawn figures, mockups and the section maps: `src/components/AGENTS.md`. Animations: `src/remotion/AGENTS.md`.
