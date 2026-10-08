/**
 * Plays a Remotion composition from src/remotion/ in a blog post. Used through
 * LoopAnimation.astro, which handles the Confluence copy and the no-JS fallback.
 *
 * The animation starts the first time the figure is mostly in view, plays
 * once and rests on its last frame, which is the full picture. With
 * prefers-reduced-motion it shows only that last frame.
 */
import { useEffect, useRef, useState, type ComponentType } from 'react';
import { Player, Thumbnail, type PlayerRef } from '@remotion/player';
import { WIDTH, HEIGHT, FPS } from '../remotion/shared';
import { ShadowLoop, SHADOW_LOOP_FRAMES } from '../remotion/ShadowLoop';
import { BottleneckMoves, BOTTLENECK_FRAMES } from '../remotion/BottleneckMoves';
import './loop-animation.css';

export const ANIMATIONS = {
  'shadow-loop': { component: ShadowLoop, durationInFrames: SHADOW_LOOP_FRAMES },
  'bottleneck-moves': { component: BottleneckMoves, durationInFrames: BOTTLENECK_FRAMES },
} satisfies Record<string, { component: ComponentType; durationInFrames: number }>;

export type AnimationName = keyof typeof ANIMATIONS;

export default function LoopAnimation({ name }: { name: AnimationName }) {
  const { component, durationInFrames } = ANIMATIONS[name];
  const container = useRef<HTMLDivElement>(null);
  const player = useRef<PlayerRef>(null);
  const [still, setStill] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);

  useEffect(() => {
    if (still !== false || !container.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        player.current?.play();
      },
      { threshold: 0.6 }
    );
    observer.observe(container.current);
    return () => observer.disconnect();
  }, [still]);

  const common = {
    component,
    durationInFrames,
    compositionWidth: WIDTH,
    compositionHeight: HEIGHT,
    fps: FPS,
    style: { width: '100%', aspectRatio: `${WIDTH} / ${HEIGHT}` },
  };

  return (
    <div
      ref={container}
      className="loop-animation-player"
      // Keeps the figure's height while it decides between player and still.
      style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
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
