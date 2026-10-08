/**
 * Pieces shared by the Remotion compositions under src/remotion/: the canvas,
 * theme colors and the small icons they are drawn from.
 *
 * Colors are CSS custom properties with the light theme as fallback, so the
 * Player on the site follows the page's dark mode (see loop-visuals.css) and a
 * render outside the site gets the light theme.
 */
import type { ReactNode } from 'react';
import { interpolate, Easing } from 'remotion';

export const WIDTH = 960;
export const HEIGHT = 540;
export const FPS = 30;

const LIGHT = {
  surface: '#ffffff',
  text: '#1f2937',
  muted: '#6b7280',
  edge: '#cbd5e1',
  'node-bg': '#f8fafc',
  'node-border': '#64748b',
  'other-bg': '#fff7ed',
  other: '#ea580c',
  'added-bg': '#dbeafe',
  added: '#2563eb',
  ok: '#2a9d8f',
  bad: '#e76f51',
  warn: '#e9a23b',
} as const;

export type Token = keyof typeof LIGHT;

/** A theme color, e.g. fill={color('node-bg')}. */
export const color = (token: Token) => `var(--lv-${token}, ${LIGHT[token]})`;

/** Customers and work items: mid-tones that read on light and dark backgrounds. */
export const PALETTE = ['#2a9d8f', '#4f86c6', '#e76f51', '#8e7cc3', '#e9a23b'];

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** 0 → 1 between two frames, eased. */
export const progress = (frame: number, from: number, to: number, easing = Easing.inOut(Easing.cubic)) =>
  interpolate(frame, [from, to], [0, 1], { ...clamp, easing });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export interface Point {
  x: number;
  y: number;
}

export const mix = (a: Point, b: Point, t: number): Point => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

/** Point on the cubic Bézier from a to b with both control points at the horizontal midpoint. */
export function edgePoint(a: Point, b: Point, t: number): Point {
  const mx = (a.x + b.x) / 2;
  const u = 1 - t;
  return {
    x: u * u * u * a.x + 3 * u * u * t * mx + 3 * u * t * t * mx + t * t * t * b.x,
    y: u * u * u * a.y + 3 * u * u * t * a.y + 3 * u * t * t * b.y + t * t * t * b.y,
  };
}

export const edgePath = (a: Point, b: Point) => {
  const mx = (a.x + b.x) / 2;
  return `M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`;
};

interface IconProps {
  x: number;
  y: number;
  scale?: number;
  opacity?: number;
}

const Place = ({ x, y, scale = 1, opacity = 1, children }: IconProps & { children: ReactNode }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    {children}
  </g>
);

/** Head and shoulders, about 32 units tall, centered on (x, y). */
export const Person = ({ fill, ...place }: IconProps & { fill: string }) => (
  <Place {...place}>
    <circle cx={0} cy={-8} r={8} fill={fill} />
    <path d="M-14,16 C-14,4 -7,1 0,1 C7,1 14,4 14,16 Z" fill={fill} />
  </Place>
);

/** A subject-matter expert: a person with a check badge. */
export const Expert = (place: IconProps) => (
  <Place {...place}>
    <Person x={0} y={0} fill={color('text')} />
    <circle cx={13} cy={-12} r={8} fill={color('ok')} stroke={color('surface')} strokeWidth={2} />
    <path d="M9.5,-12 l2.5,2.5 l4.5,-5" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Place>
);

/** A coding agent: a terminal window with a prompt. `typing` (0–1) grows the lines it writes. */
export const Agent = ({ typing = 0, ...place }: IconProps & { typing?: number }) => {
  const lines = [0.9, 0.6, 0.75];
  return (
    <Place {...place}>
      <rect x={-26} y={-20} width={52} height={40} rx={6} fill={color('node-bg')} stroke={color('added')} strokeWidth={2.5} />
      <line x1={-26} x2={26} y1={-11} y2={-11} stroke={color('added')} strokeWidth={1.5} />
      <path d="M-19,-3 l5,4 l-5,4" fill="none" stroke={color('added')} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {lines.map((w, i) => {
        const t = Math.min(Math.max(typing * lines.length - i, 0), 1);
        return t > 0 ? (
          <line
            key={i}
            x1={-8}
            x2={-8 + 28 * w * t}
            y1={-3 + i * 6}
            y2={-3 + i * 6}
            stroke={color('added')}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        ) : null;
      })}
    </Place>
  );
};

/** A developer at a laptop, the coding step before agents. */
export const Developer = (place: IconProps) => (
  <Place {...place}>
    <Person x={0} y={-8} scale={0.85} fill={color('text')} />
    <rect x={-14} y={-1} width={28} height={17} rx={2} fill={color('node-bg')} stroke={color('text')} strokeWidth={2.5} />
    <line x1={-20} x2={20} y1={17} y2={17} stroke={color('text')} strokeWidth={3} strokeLinecap="round" />
  </Place>
);

/** An eval suite: a checklist. */
export const Evals = (place: IconProps) => (
  <Place {...place}>
    <rect x={-16} y={-19} width={32} height={38} rx={4} fill={color('node-bg')} stroke={color('text')} strokeWidth={2.5} />
    {[-9, 0, 9].map((y) => (
      <g key={y}>
        <path d={`M-10,${y} l2.5,2.5 l4,-5`} fill="none" stroke={color('ok')} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        <line x1={0} x2={10} y1={y} y2={y} stroke={color('muted')} strokeWidth={2.2} strokeLinecap="round" />
      </g>
    ))}
  </Place>
);

/** A customer message. */
export const Envelope = (place: IconProps) => (
  <Place {...place}>
    <rect x={-15} y={-10} width={30} height={20} rx={3} fill={color('node-bg')} stroke={color('node-border')} strokeWidth={2} />
    <path d="M-15,-9 L0,2 L15,-9" fill="none" stroke={color('node-border')} strokeWidth={2} strokeLinejoin="round" />
  </Place>
);

/** A drafted reply. */
export const Reply = ({ stroke, ...place }: IconProps & { stroke: string }) => (
  <Place {...place}>
    <path d="M-10,-13 h13 l7,7 v19 h-20 Z" fill={color('surface')} stroke={stroke} strokeWidth={2.5} strokeLinejoin="round" />
    <line x1={-5} x2={5} y1={0} y2={0} stroke={stroke} strokeWidth={2} strokeLinecap="round" />
    <line x1={-5} x2={3} y1={6} y2={6} stroke={stroke} strokeWidth={2} strokeLinecap="round" />
  </Place>
);

/** An expert's comment: a speech bubble with scribbled lines. */
export const Comment = (place: IconProps) => (
  <Place {...place}>
    <path
      d="M-20,-14 h40 a5,5 0 0 1 5,5 v16 a5,5 0 0 1 -5,5 h-26 l-8,7 v-7 h-6 a5,5 0 0 1 -5,-5 v-16 a5,5 0 0 1 5,-5 Z"
      fill={color('surface')}
      stroke={color('bad')}
      strokeWidth={2.5}
      strokeLinejoin="round"
    />
    <path d="M-13,-5 q4,-3 8,0 t8,0 t8,0" fill="none" stroke={color('bad')} strokeWidth={2} strokeLinecap="round" />
    <path d="M-13,3 q4,-3 8,0 t8,0" fill="none" stroke={color('bad')} strokeWidth={2} strokeLinecap="round" />
  </Place>
);

/** A grade: a filled circle with a check or a cross. */
export const Grade = ({ ok, r = 18, ...place }: IconProps & { ok: boolean; r?: number }) => (
  <Place {...place}>
    <circle r={r} fill={color(ok ? 'ok' : 'bad')} />
    <path
      d={ok ? 'M-7,0 l5,5 l9,-10' : 'M-6,-6 l12,12 M6,-6 l-12,12'}
      transform={`scale(${r / 18})`}
      fill="none"
      stroke="#fff"
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Place>
);

export const Label = ({
  x,
  y,
  children,
  size = 17,
  anchor = 'middle',
}: Point & { children: ReactNode; size?: number; anchor?: 'middle' | 'start' | 'end' }) => (
  <text x={x} y={y} textAnchor={anchor} fontSize={size} fill={color('muted')} fontWeight={500}>
    {children}
  </text>
);
