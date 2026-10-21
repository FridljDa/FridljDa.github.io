# Slides for a talk on a blog post

`<slug>.mdx` in this directory, where `<slug>` is the blog post's filename
without extension. `/post/<slug>/presentation` shows the slides, and
`/post/<slug>/presentation?notes` shows each with its speaker notes.
`npm run presentation:pdf` (dev server running) prints both to
`<slug>.pdf` (one 1280×720 page per slide) and `<slug>-notes.pdf` (A4, slide
and notes) next to the source. Commit the PDFs with the change that made them.

```mdx
---
minutes: 35   # how long the talk runs, without questions
---

import Slide from '../../../components/presentation/Slide.astro';
import Notes from '../../../components/presentation/Notes.astro';
import SystemMap from '../../../components/SystemMap.astro';

<Slide title="The whole system">
<SystemMap preset="overview" />

<Notes>
- What I say over the slide.
</Notes>
</Slide>
```

Layouts, set with `layout`: `figure` (the default: a title and one figure),
`split` (text left, figure or a second text column right), `statement` (one
line or two, no title) and `title` (the opening slide). See
`src/components/presentation/Slide.astro`.

## Find the talk first

As with LinkedIn, a talk is not the post read aloud. Ask what the audience
should remember, then order the slides as a story. Unlike LinkedIn, a talk has
room: about 1 to 1.5 minutes per slide, and a post of about 2,300 words reads
aloud in under 20 minutes. A longer slot gets the post's own story told in more
depth, drawn from the posts it links to, not new claims: The Missing Test
Suite's 35-minute version walks one ticket through every step and spends its
extra time on the coding agent's side of the loop (evals, failure triage),
taken from Langfuse in Production.

What a talk takes as given goes on a slide of its own, early: The Missing Test
Suite's opens by saying that whether to build a workflow or an agent was
decided early, is a talk of its own, and is taken as fixed.

## Slides

- **The post's figures, not new ones.** Import the drawn figures (`SystemMap`,
  `PipelineFigure`, ...) so they print as vectors; use the mockups' light PNGs
  as plain Markdown images. An animation shows its last frame, the PNG under
  `/images/blog/animations/`.
- **Short lines on the slide, the argument in the notes.** A slide title says
  the point, not the topic: "Every question mark is a decision only the
  experts can make", not "The grid".
- **The running example is said to be invented**, on the slide where it first
  appears (see the root `AGENTS.md`). The notes describe the project in
  generic terms, like the post.
- **No occasion.** Like posts, a deck never names who it is for or why it was
  given, in the slides, the notes or the file name.
- **Links on the words**, as in posts; they stay clickable in the PDF.
