# Reposts of blog posts

Versions of blog posts for other channels. They are never listed on the site:
nothing that builds the site's pages, sitemap, `llms.txt` or chat context reads
them, only the unlisted, noindex copy pages under `/post/<slug>/`.

## LinkedIn

Written by hand, one file per post in `linkedin/`. Not every post gets one. See
`linkedin/AGENTS.md`.

## Presentation

Slides for a talk on a post, written by hand as MDX, one file per post in
`presentation/`, printed to PDF. See `presentation/AGENTS.md`.

## Confluence

Nothing to write here. The Confluence copy is the blog post itself, converted
by code and never rewritten. Like LinkedIn, few posts get one: only posts with
`confluence: true` in their frontmatter, typically client work colleagues
should read on Confluence. Add the flag only when the post is going to be
pasted. `/post/<slug>/confluence` (`src/pages/post/[slug]/confluence.astro`)
renders a flagged post as plain HTML for pasting into Confluence (the rest are
a 404), and `npm run confluence:figures` renders the drawn figures of flagged
posts to PNGs for it.

When something comes out wrong in the copy, fix that page or the component's
Confluence branch (it checks `Astro.locals.confluence`), so every post gets the
fix. Text that should read differently is a change to the blog post.
