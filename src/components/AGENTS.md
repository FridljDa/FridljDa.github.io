# Components

## Figures in blog posts

All figures within a blog post share one visual style: the palette in
`loop-animation.css`, the icons in `src/remotion/shared.tsx`, and short labels
instead of explanatory text inside figures. Explanations go in the post's prose
or a caption. A figure takes the palette by putting the `lv-theme` class on its
root element (`<figure class="quote-map lv-theme not-prose my-8">`); don't add
its own class to `loop-animation.css`.

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
- **Section maps, the house style:** prefer them to prose. Show the whole
  system once, then open each subsection with the same map, its part
  highlighted and with its components, the rest greyed out by name only
  (`Dim` in `map-parts.tsx`). Keep what a part does in the map, as short
  labels, icons and amber tags, and keep the prose after it short: a few
  bullets, not one big figure followed by a wall of text. The Uncoded
  Hospital Revenue post does this with `<DesignMap preset="..." />`, and
  API Keys, OAuth and JWT with `<AuthMap preset="..." />` and
  `<AuthFigure name="..." />` (`AuthFigures.tsx`).
- **Pinned figures:** where the prose walks through a figure's numbered
  steps, `<AuthSteps name="..." caption="...">` keeps the figure pinned
  beside the text on wide screens, so the arrow a step refers to stays in
  view. Put a request and its response under the step that sends it.
- **Animations:** `<LoopAnimation name="..." />`; see `src/remotion/AGENTS.md`.
- **Confluence:** a paste into Confluence drops inline SVG, so the drawn figures
  show a PNG in the Confluence copy (their `Astro.locals.confluence` branch).
  Regenerate the PNGs with `npm run confluence:figures` (dev server running)
  and commit only the PNGs that changed on purpose.
