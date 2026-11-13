# Animated figures (Remotion)

Animations in posts are Remotion compositions in this directory, embedded with
`<LoopAnimation name="..." />` (`src/components/LoopAnimation.astro`). They
follow the figure style in `src/components/AGENTS.md`; `shared.tsx` holds the
icons every figure uses.

Every frame is a pure function of the frame number, and the last frame is the
resting state: reduced motion shows it, and without JavaScript a PNG of it. Keep
text inside them to short labels.

After changing a composition, regenerate its PNG with
`npm run animation:stills` (dev server running) and commit only the PNGs that
changed on purpose.
