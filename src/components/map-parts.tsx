/**
 * Pieces shared by the section maps (SystemMap.tsx, PipelineMap.tsx): greying
 * out what a section doesn't talk about, the numbered step badges, the
 * amber pills, and the arrowhead.
 */
import type { ReactNode } from 'react';
import { color, type Point } from '../remotion/shared';

/** Full strength when `on`, otherwise faded and grey. */
export function Dim({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <g opacity={on ? 1 : 0.22} style={on ? undefined : { filter: 'grayscale(1)' }}>
      {children}
    </g>
  );
}

/** A step's number in a blue circle. */
export const Badge = ({ x, y, text }: Point & { text: string }) => {
  const w = text.length > 1 ? 40 : 24;
  return (
    <g>
      <rect x={x - w / 2} y={y - 12} width={w} height={24} rx={12} fill={color('added')} />
      <text x={x} y={y} dy="0.35em" textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff">
        {text}
      </text>
    </g>
  );
};

/** An amber pill next to a part, e.g. "Bottleneck". */
export const Tag = ({ x, y, text, size }: Point & { text: string; size: number }) => {
  const width = text.length * size * 0.59 + 44;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-width / 2} y={-size} width={width} height={size * 2} rx={size} fill={color('warn')} />
      <text y={0} dy="0.35em" textAnchor="middle" fontSize={size} fontWeight={700} fill="#1f2937">
        {text}
      </text>
    </g>
  );
};

/** The arrowhead for an svg's edges, referenced as url(#id). */
export const ArrowMarker = ({ id }: { id: string }) => (
  <marker id={id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 Z" fill={color('node-border')} />
  </marker>
);
