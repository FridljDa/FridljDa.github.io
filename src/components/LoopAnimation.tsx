/**
 * Plays a Remotion composition from src/remotion/ in a blog post. Used through
 * LoopAnimation.astro, which handles the Confluence copy and the no-JS fallback.
 *
 * The animation starts the first time the figure is almost fully in view, so
 * the reader is looking at it rather than at the text above, plays once and
 * rests on its last frame, which is the full picture. With
 * prefers-reduced-motion it shows only that last frame. A figure narrower
 * than NARROW (a phone, or a narrow column) gets the composition's tall layout.
 */
import { useEffect, useRef, useState, type ComponentType } from 'react';
import { Player, Thumbnail, type PlayerRef } from '@remotion/player';
import { FPS } from '../remotion/shared';
import { ShadowLoop, SHADOW_LOOP_FRAMES, LAYOUTS } from '../remotion/ShadowLoop';
import './loop-animation.css';

type Layout = 'wide' | 'tall';

export const ANIMATIONS = {
  'shadow-loop': { component: ShadowLoop, durationInFrames: SHADOW_LOOP_FRAMES, layouts: LAYOUTS },
} satisfies Record<
  string,
  { component: ComponentType<{ layout?: Layout }>; durationInFrames: number; layouts: Record<Layout, { width: number; height: number }> }
>;

const NARROW = 560;

export type AnimationName = keyof typeof ANIMATIONS;

export default function LoopAnimation({ name }: { name: AnimationName }) {
  const { component, durationInFrames, layouts } = ANIMATIONS[name];
  const container = useRef<HTMLDivElement>(null);
  const player = useRef<PlayerRef>(null);
  const [still, setStill] = useState<boolean | undefined>(undefined);
  const [layout, setLayout] = useState<Layout>('wide');

  useEffect(() => {
    setLayout((container.current?.clientWidth ?? NARROW) < NARROW ? 'tall' : 'wide');
    setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (still !== false || !container.current) return;
    // In view: 90% of the figure, or, when it is taller than the screen, most of the screen.
    const inView = (entry: IntersectionObserverEntry) =>
      entry.intersectionRatio >= 0.9 || entry.intersectionRect.height >= 0.8 * (entry.rootBounds?.height ?? Infinity);
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some(inView)) return;
        observer.disconnect();
        player.current?.play();
      },
      { threshold: [0.25, 0.5, 0.75, 0.9, 1] }
    );
    observer.observe(container.current);
    return () => observer.disconnect();
  }, [still]);

  const common = {
    component,
    durationInFrames,
    compositionWidth: layouts[layout].width,
    compositionHeight: layouts[layout].height,
    fps: FPS,
    inputProps: { layout },
    style: { width: '100%', aspectRatio: `${layouts[layout].width} / ${layouts[layout].height}` },
  };

  return (
    <div
      ref={container}
      className="loop-animation-player"
      // Keeps the figure's height while it decides between player and still.
      style={{ aspectRatio: `${layouts[layout].width} / ${layouts[layout].height}` }}
      data-ready={still === undefined ? undefined : ''}
    >
      {still === undefined ? null : still ? (
        <Thumbnail {...common} frameToDisplay={durationInFrames - 1} />
      ) : (
        <Player
          ref={player}
          {...common}
          controls
          showVolumeControls={false}
          allowFullscreen={false}
          moveToBeginningWhenEnded={false}
          clickToPlay
          acknowledgeRemotionLicense
        />
      )}
    </div>
  );
}
