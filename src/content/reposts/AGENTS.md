# Reposts of blog posts

Versions of blog posts for other channels. They are never listed on the site:
nothing that builds the site's pages, sitemap, `llms.txt` or chat context reads
them, only the unlisted, noindex copy pages under `/post/<slug>/`.

## LinkedIn

Written by hand, one file per post in `linkedin/`. Not every post gets one. See
`linkedin/AGENTS.md`.

## Confluence

Nothing to write here. The Confluence copy is the blog post itself, converted
by code and never rewritten. `/post/<slug>/confluence`
(`src/pages/post/[slug]/confluence.astro`) renders any post as plain HTML for
pasting into Confluence, and `npm run confluence:figures` renders the drawn
figures to PNGs for it.

When something comes out wrong in the copy, fix that page or the component's
Confluence branch (it checks `Astro.locals.confluence`), so every post gets the
fix. Text that should read differently is a change to the blog post.
