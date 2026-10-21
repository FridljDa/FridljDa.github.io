/**
 * The figures of geometric-median-bachelor-thesis:
 *
 * - median: a cloud of points with a few outliers, where the mean is pulled
 *   towards the outliers and the geometric median is not, and the path of the
 *   online algorithm's iterates from a far-off start into the median.
 * - expansion: one claim, the gradient of G, and the three steps the thesis
 *   needs to prove it.
 *
 * The points are made up, the iterates are the algorithm run on them. Drawn in
 * the style of the site's other figures (palette, short labels); the prose
 * explains them. Static: rendered on the server, no JavaScript.
 * MedianFigure.astro wraps them.
 */
import type { ComponentType, ReactNode } from 'react';
import { color } from '../remotion/shared';
import { ArrowMarker } from './map-parts';

function Svg({ viewBox, label, children }: { viewBox: string; label: string; children: ReactNode }) {
  return (
    <svg viewBox={viewBox} role="img" aria-label={label} style={{ display: 'block', width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      {children}
    </svg>
  );
}

/** mulberry32: a small seeded generator, so the made-up data never changes. */
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A standard normal draw (Box–Muller). */
const normal = (rand: () => number) => Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());

interface P {
  x: number;
  y: number;
}

const rand = random(2020);
const CLOUD: P[] = Array.from({ length: 70 }, () => ({ x: normal(rand), y: 0.8 * normal(rand) }));
const OUTLIERS: P[] = Array.from({ length: 16 }, () => ({ x: 6.2 + 0.35 * normal(rand), y: 3.6 + 0.35 * normal(rand) }));
const POINTS = [...CLOUD, ...OUTLIERS];

const MEAN: P = {
  x: POINTS.reduce((s, p) => s + p.x, 0) / POINTS.length,
  y: POINTS.reduce((s, p) => s + p.y, 0) / POINTS.length,
};

/** The geometric median of the points, by Weiszfeld's algorithm. */
const MEDIAN: P = (() => {
  let m = { ...MEAN };
  for (let k = 0; k < 500; k++) {
    let wx = 0;
    let wy = 0;
    let w = 0;
    for (const p of POINTS) {
      const d = Math.max(Math.hypot(p.x - m.x, p.y - m.y), 1e-9);
      wx += p.x / d;
      wy += p.y / d;
      w += 1 / d;
    }
    m = { x: wx / w, y: wy / w };
  }
  return m;
})();

/** The online algorithm: one point drawn at a time, a step of length c n^-alpha towards it. The first 60 steps, after which the path only wanders around the median. */
const ITERATES: P[] = (() => {
  const draw = random(7);
  let z: P = { x: -3.2, y: 3.4 };
  const path = [z];
  for (let n = 1; n <= 60; n++) {
    const p = POINTS[Math.floor(draw() * POINTS.length)];
    const d = Math.hypot(p.x - z.x, p.y - z.y);
    if (d === 0) continue;
    const step = 1.6 * n ** -0.66;
    z = { x: z.x + (step * (p.x - z.x)) / d, y: z.y + (step * (p.y - z.y)) / d };
    path.push(z);
  }
  return path;
})();

/** A label with a ring of the surface colour, legible on top of points. */
const Halo = ({ x, y, children }: { x: number; y: number; children: ReactNode }) => (
  <text x={x} y={y} fontSize={16} fontWeight={600} fill={color('text')} stroke={color('surface')} strokeWidth={5} paintOrder="stroke" strokeLinejoin="round">
    {children}
  </text>
);

const MedianDescription =
  'A cloud of blue points around the origin and a small group of outliers far to the upper right. The mean, a red cross, is pulled out of the cloud towards the outliers. The geometric median, a teal ring, sits in the cloud. A grey path of iterates starts at Z0 in the upper left, takes large steps at first and smaller ones later, and ends near the median.';

function Median() {
  const box = { left: 20, top: 20, right: 540, bottom: 320 };
  const dom = { x0: -4, x1: 7.5, y0: -2.8, y1: 4.8 };
  const sx = (v: number) => box.left + ((v - dom.x0) / (dom.x1 - dom.x0)) * (box.right - box.left);
  const sy = (v: number) => box.bottom - ((v - dom.y0) / (dom.y1 - dom.y0)) * (box.bottom - box.top);
  const path = ITERATES.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');
  const start = ITERATES[0];
  return (
    <Svg viewBox="0 0 560 340" label={MedianDescription}>
      {POINTS.map((p, i) => (
        <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={4.5} fill={color('added')} stroke={color('surface')} strokeWidth={1.5} />
      ))}
      <path d={path} fill="none" stroke={color('muted')} strokeWidth={1.5} strokeLinejoin="round" opacity={0.85} />
      <circle cx={sx(start.x)} cy={sy(start.y)} r={5} fill={color('muted')} />
      <text x={sx(start.x)} y={sy(start.y) - 14} textAnchor="middle" fontSize={17} fill={color('text')}>
        <tspan fontStyle="italic">Z</tspan>
        <tspan dy="0.3em" fontSize="0.7em">0</tspan>
      </text>
      <text x={sx(6.2)} y={sy(3.6) - 26} textAnchor="middle" fontSize={16} fontWeight={600} fill={color('text')}>
        Outliers
      </text>

      <g stroke={color('bad')} strokeWidth={3.5} strokeLinecap="round">
        <line x1={sx(MEAN.x) - 8} x2={sx(MEAN.x) + 8} y1={sy(MEAN.y) - 8} y2={sy(MEAN.y) + 8} />
        <line x1={sx(MEAN.x) - 8} x2={sx(MEAN.x) + 8} y1={sy(MEAN.y) + 8} y2={sy(MEAN.y) - 8} />
      </g>
      <Halo x={sx(MEAN.x) + 16} y={sy(MEAN.y) - 34}>Mean</Halo>
      <line x1={sx(MEAN.x) + 6} y1={sy(MEAN.y) - 10} x2={sx(MEAN.x) + 20} y2={sy(MEAN.y) - 28} stroke={color('text')} strokeWidth={1.5} />

      <circle cx={sx(MEDIAN.x)} cy={sy(MEDIAN.y)} r={10} fill="none" stroke={color('surface')} strokeWidth={7} />
      <circle cx={sx(MEDIAN.x)} cy={sy(MEDIAN.y)} r={10} fill="none" stroke={color('ok')} strokeWidth={3.5} />
      <Halo x={sx(MEDIAN.x) - 150} y={sy(MEDIAN.y) + 92}>
        Median <tspan fontStyle="italic">m</tspan>
      </Halo>
      <line x1={sx(MEDIAN.x) - 8} y1={sy(MEDIAN.y) + 10} x2={sx(MEDIAN.x) - 90} y2={sy(MEDIAN.y) + 80} stroke={color('text')} strokeWidth={1.5} />
    </Svg>
  );
}

const ExpansionDescription =
  'On the left, one claim: the gradient of G is Phi. An arrow leads to the three steps the thesis takes to prove it: a Taylor expansion of the square root, a bound on the remainder, and dominated convergence. Together they fill a page and a half.';

function Expansion() {
  const arrow = 'median-expansion-arrow';
  const steps = ['Taylor expansion of √t', 'Bound the remainder', 'Dominated convergence'];
  const node = (x: number, y: number, w: number, children: ReactNode, strong = false) => (
    <g>
      <rect x={x} y={y - 22} width={w} height={44} rx={9} fill={strong ? color('added-bg') : color('node-bg')} stroke={strong ? color('added') : color('node-border')} strokeWidth={2} />
      <text x={x + w / 2} y={y} dy="0.35em" textAnchor="middle" fontSize={17} fontWeight={600} fill={color('text')}>
        {children}
      </text>
    </g>
  );
  return (
    <Svg viewBox="0 0 560 236" label={ExpansionDescription}>
      <defs>
        <ArrowMarker id={arrow} />
      </defs>
      <text x={110} y={34} textAnchor="middle" fontSize={15} fill={color('muted')}>
        The claim
      </text>
      {node(20, 105, 180, <>∇<tspan fontStyle="italic">G</tspan> = Φ</>, true)}
      <path d="M204,105 H262" stroke={color('node-border')} strokeWidth={2} markerEnd={`url(#${arrow})`} />
      <text x={400} y={34} textAnchor="middle" fontSize={15} fill={color('muted')}>
        The proof in the thesis
      </text>
      {steps.map((s, i) => (
        <g key={s}>{node(270, 65 + i * 54, 260, s)}</g>
      ))}
      <rect x={346} y={202} width={108} height={24} rx={12} fill={color('warn')} />
      <text x={400} y={214} dy="0.35em" textAnchor="middle" fontSize={14} fontWeight={700} fill="#1f2937">
        1.5 pages
      </text>
    </Svg>
  );
}

export const FIGURES = {
  median: { component: Median, description: MedianDescription, width: 560 },
  expansion: { component: Expansion, description: ExpansionDescription, width: 560 },
} satisfies Record<string, { component: ComponentType; description: string; width: number }>;

export type FigureName = keyof typeof FIGURES;
