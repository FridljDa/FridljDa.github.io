# Reposts of blog posts

Versions of blog posts for other channels. They are never listed on the site:
nothing that builds the site's pages, sitemap, `llms.txt` or chat context reads
them, only the unlisted, noindex copy pages under `/post/<slug>/`.

Not every post gets a repost. A post has a LinkedIn version only when
`linkedin/<slug>.md` exists.

## Confluence

Nothing to write: `/post/<slug>/confluence` renders any blog post as plain HTML
for pasting into Confluence (see `src/pages/post/[slug]/confluence.astro`).

## LinkedIn

`linkedin/<slug>.md`, where `<slug>` is the blog post's filename without
extension. Copy it from `/post/<slug>/linkedin`, which shows the character
count, where "see more" cuts the text, and the images to upload.

```yaml
---
status: draft            # draft | posted
postedAt: 2026-10-10     # once posted
url: https://www.linkedin.com/posts/...   # once posted
images:                  # optional, at most 20, uploaded by hand
  - /images/blog/<slug>/featured.png
firstComment: |          # optional, at most 1,250 characters
  Full post: https://danielfridljand.de/post/<slug>
---
Post text, as plain text.
```

### Limits

- **Text:** 3,000 characters, spaces and line breaks included. Stay a little
  under it; LinkedIn may count emoji differently than the copy page does.
- **Before "see more":** about 210 characters on desktop, about 140 on mobile,
  and never more than about three lines.
- **Images:** up to 20 per post, 5 MB each, shown at 4:5 at most. 4:5
  portrait (1080×1350) or square (1080×1080) uses the most of the feed.
- **Comment:** 1,250 characters.
- Alternatives when a feed post is too small: a PDF document post ("carousel",
  up to 300 pages and 100 MB), or a LinkedIn Article (about 110,000 characters).

### Writing the text

- **Plain text only.** LinkedIn does not render Markdown: `**bold**`, `#`
  headings, `[links](...)` and tables show up literally. Use line breaks and
  short paragraphs. No Unicode "bold" letters: screen readers spell them out and
  search does not match them.
- **A post of its own, not a shortened article.** One idea, the result or
  surprise first, then two or three supporting points, then the link.
- **The first ~200 characters must work alone** and make someone tap "see
  more". No preamble such as "I wrote a new blog post".
- **Same voice as the blog:** first person, concrete, no hype or engagement
  bait ("Agree?", "Thoughts? 👇"). Keep the post's claims; do not add new ones.
- **Link to the original** at `https://danielfridljand.de/post/<slug>`, in the
  text or in `firstComment`. A link in the text gets a preview card from the
  post's `og:image` only when no images are attached. Moving it to the first
  comment is common because links in the text are widely reported, though not
  documented, to reduce reach.
- **Hashtags:** 3–5 at the end, on their own line.
- **Mentions** (`@Name`) only resolve when typed in LinkedIn's composer, so add
  them there after pasting.

### Images

Reuse the post's images under `/images/blog/<slug>/` where they fit. A crop
made for LinkedIn goes in `src/assets/images/blog/<slug>/linkedin/` and keeps
full resolution like every other site image (see the root `AGENTS.md`).
