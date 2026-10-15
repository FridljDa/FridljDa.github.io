# LinkedIn versions of blog posts

`<slug>.md` in this directory, where `<slug>` is the blog post's filename
without extension. Copy it from `/post/<slug>/linkedin`, which shows the
character count, where "see more" cuts the text, and the images to upload.

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

## Limits

- **Text:** 3,000 characters, spaces and line breaks included. Stay a little
  under it; LinkedIn may count emoji differently than the copy page does.
- **Before "see more":** about 210 characters on desktop, about 140 on mobile,
  and never more than about three lines.
- **Images:** up to 20 per post, 5 MB each, shown at 4:5 at most. 4:5
  portrait (1080×1350) or square (1080×1080) uses the most of the feed.
- **Comment:** 1,250 characters.
- Alternatives when a feed post is too small: a PDF document post ("carousel",
  up to 300 pages and 100 MB), or a LinkedIn Article (about 110,000 characters).

## Find the story first

A LinkedIn post is a post of its own, not a shortened article. Before drafting,
step back from the blog post. Most of what makes the blog post good, its steps,
caveats, numbers and side arguments, makes a LinkedIn post worse.

1. **The message.** Ask what a reader who never clicks the link should
   remember. Write it as one sentence. If it needs an "and", keep one half.
2. **The points.** Pick the two or three things from the post that make that
   message interesting or believable: usually the result, what was surprising
   about it, and one concrete example.
3. **The narrative.** Order them as a story: the result or surprise first, then
   why, then what it means or what I did about it. Don't follow the blog post's
   section order.
4. **The rest goes to the link.** How-to steps, implementation details, figures
   described in words, caveats, secondary arguments, numbers that need context.
   Being true or hard-won is not a reason to keep a sentence; carrying the
   message is.

Then reread each paragraph and ask whether the post is weaker without it. If
not, cut it. That includes a paragraph with the post's sharpest line when it
carries a second message: Workflow or Agent's version left out how grading on
template match tilted the choice toward code, and its first comment names it
as something the full post adds. The first comment names only what the
LinkedIn text leaves out.

Answer the question a skeptical reader asks first. Arguing that the agent
should decide raises "and the security check?", so the text says who checks
the flag in each design.

The Missing Test Suite walks through the review loop step by step, the approval
rate it aims to raise, and which part of the review tool to build yourself. Its
LinkedIn version keeps one message, that coding agents moved the bottleneck to
the experts who can judge a reply, and the first comment says what the full
post adds.

When the blog post changes later, change the LinkedIn version only where its
message or supporting points changed. Don't carry every new detail across.

## Writing the text

- **Plain text only.** LinkedIn does not render Markdown: `**bold**`, `#`
  headings, `[links](...)` and tables show up literally. Use line breaks and
  short paragraphs. No Unicode "bold" letters: screen readers spell them out and
  search does not match them.
- **The first ~200 characters must work alone** and make someone tap "see
  more". No preamble such as "I wrote a new blog post".
- **Same voice as the blog:** first person, concrete, no hype or engagement
  bait ("Agree?", "Thoughts? 👇"). Keep the post's claims; do not add new ones.
- **Lead with what I think, not with what went wrong.** Put the position
  first and the project behind it as the experience it comes from, as The
  Missing Test Suite's version does ("On a support automation I built…", "My
  own job was designing the system"). An opening like "we did X; next time I
  would do the other way round" reads as a confession; the same facts told as
  where I found a design breaks read as expertise. Don't claim more projects
  or experience than the post describes: a design I recommend but haven't run
  stays in "would", and one the team only tried is "tried", not "built".
- **One word per thing.** Once the post says "workflow", don't switch to
  "tree" for the same thing.
- **Keep the client anonymous.** A post's running example (Northstar Bank,
  Alex Carter) is invented to protect the real client, so never present it as
  the project: "a support automation I built", not "a bank's support
  automation". Details that are generic, such as a locked account, can stay.
- **Link to the original** at `https://danielfridljand.de/post/<slug>`, in the
  text or in `firstComment`. A link in the text gets a preview card from the
  post's `og:image` only when no images are attached. Moving it to the first
  comment is common because links in the text are widely reported, though not
  documented, to reduce reach.
- **Hashtags:** 3–5 at the end, on their own line.
- **Mentions** (`@Name`) only resolve when typed in LinkedIn's composer, so add
  them there after pasting.

## Images

Attached images show below the text, so a sentence that points at one has to
make sense before the reader scrolls to it ("top right in the picture below",
not a "cell" the text hasn't introduced). Tie the post's concrete example to the
image when they match: the closed-account cell of Workflow or Agent's grid.

Reuse the post's images under `/images/blog/<slug>/` where they fit. A crop
made for LinkedIn goes in `src/assets/images/blog/<slug>/linkedin/` and keeps
full resolution like every other site image (see the root `AGENTS.md`).
