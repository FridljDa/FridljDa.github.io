# Agent notes

This file holds rules that span the repo. Details live in an `AGENTS.md` in the directory they cover, as deep as fits; read the one nearest to the files you change, and put new details there rather than here. Don't put one under `src/pages/`: Astro turns every `.md` file there into a page.

## Images: full resolution, no Astro Image pipeline

Raster images are served as **original files** via plain `<img src="/images/...">` tags. The browser downscales in CSS (`object-cover`, Tailwind width classes).

We intentionally **do not** use `astro:assets` (`<Image />`, `srcset`, WebP conversion, or `/_image` resizing) for site images. An Astro Image experiment (commit `331996c`) produced noticeably soft results on high-DPI screens because pre-generated small variants cannot match browser downscaling from full-resolution sources.

**Tradeoff accepted:** larger downloads and slightly slower loads on slow connections. **Priority:** visual sharpness over bandwidth.

Assets live under `src/assets/images/` with `public/images` symlinked for stable `/images/...` URLs in MDX and frontmatter. Do not reintroduce responsive image optimization without explicit owner approval.

## Reposts (LinkedIn, Confluence)

LinkedIn versions of blog posts are written by hand: read `src/content/reposts/linkedin/AGENTS.md` before writing one. The Confluence copy is generated from the post by code and never rewritten, and only posts with `confluence: true` in their frontmatter get one: see `src/content/reposts/AGENTS.md`.

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

## Posts stand on their own

A post never says why it was written or who it is for. It does not address,
name or hint at a particular company, team or role as its reader or occasion
("for the X team", "as X does it", "what X looks for"). Naming tools,
open-source projects and cited sources is fine; naming an employer or
organisation as context is not, unless the owner asks. The same applies to
reposts, file names, slugs, frontmatter, figure text, commit messages and PR
descriptions, since this repo is public.

## Links in the text, no source lists

A post has no Sources, References or Further reading section, and no list of
links at the end. A source worth giving is a hyperlink on the words of the claim
it supports, where that claim is made. A source that fits nowhere in the text is
not worth giving.

## Reference posts: recent and heavily iterated

When writing or reviewing a post, take your cues on structure, figures and
tone from posts that are **recent** and that the owner **iterated on a lot**.
They hold the current house style and the owner's corrections; older posts and
posts committed once or twice predate both, so don't copy their habits (Mermaid
diagrams, long prose without figures, unsourced claims).

Find them from the history rather than a list kept here, which goes stale:
count commits per post, and look at when they were made. The commit count of
the post's own drawn figures (`src/components/<Name>Figures.tsx`,
`<Name>Map.tsx`) counts as well. A shallow clone hides most of the history, so
run `git fetch --unshallow` first.

```sh
for f in src/content/blog/*.mdx; do
  echo "$(git log --oneline -- "$f" | wc -l) $(git log -1 --format=%cs -- "$f") $f"
done | sort -rn | head
```

In October 2026 these were Workflow or Agent, Documented but Never Coded
(uncoded-hospital-revenue), The Missing Test Suite and Architecture of a
First-Level Support Automation. Kernel to Attention has many commits, but most
are from April, so it is not a reference.

## Figures: one style per post

All figures within a blog post share one visual style. Drawn figures, mockups and the section maps: `src/components/AGENTS.md`. Animations: `src/remotion/AGENTS.md`.
