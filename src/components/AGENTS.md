# Components

## Figures in blog posts

All figures within a blog post share one visual style: the palette in
`loop-animation.css`, the icons in `src/remotion/shared.tsx`, and short labels
instead of explanatory text inside figures. Explanations go in the post's prose
or a caption.

- **Mockups:** raster mockups come from `scripts/mockups/` via
  `npm run mockup:png`, in a light and a dark version, and are shown with
  `<ThemedImage>`.
- **Section maps:** The Missing Test Suite opens every section with
  `<SystemMap preset="..." />`, the same map with that section's part
  highlighted. Architecture of a First-Level Support Automation does the same
  with `<PipelineMap preset="..." />`, and follows its running example through
  each step with `<PipelineFigure name="..." />` (`PipelineFigures.tsx`).
  Workflow or Agent does the same with `<DecisionMap preset="..." />`, and
  draws its running example with `<DecisionFigure name="..." />`
  (`DecisionFigures.tsx`).
- **Animations:** `<LoopAnimation name="..." />`; see `src/remotion/AGENTS.md`.
- **Confluence:** a paste into Confluence drops inline SVG, so the drawn figures
  show a PNG in the Confluence copy (their `Astro.locals.confluence` branch).
  Regenerate the PNGs with `npm run confluence:figures` (dev server running)
  and commit only the PNGs that changed on purpose.
