/**
 * The figures of ihw-forest-master-thesis:
 *
 * - bins: the same hypotheses on two covariates, binned by quantiles of each
 *   covariate and by the leaves of a tree. The hypotheses with small p-values
 *   gather in one corner; the tree gives that corner a bin of its own.
 * - results: discoveries in the histone QTL analysis per set of covariates,
 *   with quantile bins and with the forest (Table 6.1 of the thesis).
 *
 * The points in bins are made up; the results are the thesis's. Drawn in the
 * style of the site's other figures (palette, short labels); the prose
 * explains them. Static: rendered on the server, no JavaScript.
 * IhwFigure.astro wraps them.
 */
import type { ComponentType, ReactNode } from 'react';
import { color } from '../remotion/shared';

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

/** Where the signal is: hypotheses here are mostly real effects. */
const SIGNAL = { x: 0.28, y: 0.34 };
const inSignal = (h: { x: number; y: number }) => h.x < SIGNAL.x && h.y < SIGNAL.y;

const HYPOTHESES = (() => {
  const rand = random(2022);
  return Array.from({ length: 160 }, () => {
    const h = { x: rand(), y: rand() };
    return { ...h, small: rand() < (inSignal(h) ? 0.75 : 0.06) };
  });
})();

/** Cut points at the 20%, 40%, ... quantiles of one covariate. */
function quantiles(values: number[], bins: number) {
  const sorted = [...values].sort((a, b) => a - b);
  return Array.from({ length: bins - 1 }, (_, k) => sorted[Math.round(((k + 1) * sorted.length) / bins)]);
}

/** The tree's leaves, as [x0, y0, x1, y1]: the first split cuts off the signal's columns, the next its corner. */
const LEAVES: [number, number, number, number][] = [
  [0, 0, SIGNAL.x, SIGNAL.y],
  [0, SIGNAL.y, SIGNAL.x, 1],
  [SIGNAL.x, 0, 1, 0.55],
  [SIGNAL.x, 0.55, 1, 1],
];

const BinsDescription =
  'Two panels with the same 160 hypotheses, plotted by two covariates. Hypotheses with small p-values, in orange, gather in the lower-left corner; the rest are grey. On the left, quantile bins: a five by five grid of 25 cells, each holding few hypotheses, and the corner split across several cells. On the right, tree leaves: four rectangles, one of which is exactly the lower-left corner.';

function Bins() {
  const size = 230;
  const panels = [
    { left: 30, title: 'Quantile bins' },
    { left: 300, title: 'Tree leaves' },
  ];
  const top = 40;
  const qx = quantiles(HYPOTHESES.map((h) => h.x), 5);
  const qy = quantiles(HYPOTHESES.map((h) => h.y), 5);
  return (
    <Svg viewBox="0 0 560 312" label={BinsDescription}>
      {panels.map(({ left, title }, p) => {
        const sx = (v: number) => left + v * size;
        const sy = (v: number) => top + (1 - v) * size;
        return (
          <g key={title}>
            <text x={left + size / 2} y={24} textAnchor="middle" fontSize={17} fontWeight={600} fill={color('text')}>
              {title}
            </text>
            <rect x={left} y={top} width={size} height={size} fill={color('node-bg')} stroke={color('node-border')} strokeWidth={2} />
            {p === 0 ? (
              <g stroke={color('node-border')} strokeWidth={1.5}>
                {qx.map((v) => (
                  <line key={`x${v}`} x1={sx(v)} x2={sx(v)} y1={top} y2={top + size} />
                ))}
                {qy.map((v) => (
                  <line key={`y${v}`} x1={left} x2={left + size} y1={sy(v)} y2={sy(v)} />
                ))}
              </g>
            ) : (
              LEAVES.map(([x0, y0, x1, y1], i) => (
                <rect
                  key={i}
                  x={sx(x0)}
                  y={sy(y1)}
                  width={(x1 - x0) * size}
                  height={(y1 - y0) * size}
                  fill={i === 0 ? color('other-bg') : 'none'}
                  stroke={color('node-border')}
                  strokeWidth={2}
                />
              ))
            )}
            {HYPOTHESES.map((h, i) => (
              <circle key={i} cx={sx(h.x)} cy={sy(h.y)} r={h.small ? 4.5 : 3.5} fill={h.small ? color('other') : color('muted')} stroke={color('surface')} strokeWidth={1.2} />
            ))}
            <text x={left + size / 2} y={top + size + 26} textAnchor="middle" fontSize={16} fill={color('muted')}>
              Covariate 1
            </text>
            <text transform={`translate(${left - 10} ${top + size / 2}) rotate(-90)`} textAnchor="middle" fontSize={16} fill={color('muted')}>
              Covariate 2
            </text>
          </g>
        );
      })}
    </Svg>
  );
}

/** Table 6.1: discoveries per covariate set. Quantile bins could not run on all eleven. */
const RESULTS: { set: string; quantile: number | null; forest: number }[] = [
  { set: 'Distance', quantile: 12379, forest: 12903 },
  { set: 'Allele frequency', quantile: 8781, forest: 9048 },
  { set: 'Distance + frequency', quantile: 9861, forest: 13249 },
  { set: 'All eleven', quantile: null, forest: 13149 },
];

const ResultsDescription =
  'Grouped horizontal bars: discoveries in the histone QTL analysis for four sets of covariates, with quantile bins in orange and the forest in blue. Distance: 12,379 and 12,903. Allele frequency: 8,781 and 9,048. Distance plus frequency: 9,861 and 13,249. All eleven covariates: quantile bins could not run, the forest made 13,149.';

function Results() {
  const left = 196;
  const right = 470;
  const max = 14000;
  const sx = (v: number) => left + (v / max) * (right - left);
  const bar = 16;
  const row = 62;
  const top = 46;
  const series = [
    { key: 'quantile' as const, label: 'Quantile bins', fill: color('other') },
    { key: 'forest' as const, label: 'Forest', fill: color('added') },
  ];
  return (
    <Svg viewBox="0 0 560 310" label={ResultsDescription}>
      {series.map((s, i) => (
        <g key={s.key} transform={`translate(${left + i * 140} 14)`}>
          <rect width={14} height={14} rx={3} fill={s.fill} />
          <text x={20} y={7} dy="0.35em" fontSize={15} fill={color('text')}>
            {s.label}
          </text>
        </g>
      ))}
      <line x1={left} x2={left} y1={top - 8} y2={top + RESULTS.length * row - 14} stroke={color('edge')} strokeWidth={1.5} />
      {RESULTS.map((r, i) => {
        const y = top + i * row;
        return (
          <g key={r.set}>
            <text x={left - 12} y={y + bar + 1} dy="0.35em" textAnchor="end" fontSize={16} fill={color('text')}>
              {r.set}
            </text>
            {series.map((s, j) => {
              const v = r[s.key];
              const by = y + j * (bar + 2);
              return v === null ? (
                <text key={s.key} x={left + 8} y={by + bar / 2} dy="0.35em" fontSize={14} fill={color('muted')}>
                  could not run
                </text>
              ) : (
                <g key={s.key}>
                  <rect x={left} y={by} width={sx(v) - left} height={bar} rx={4} fill={s.fill} />
                  <text x={sx(v) + 6} y={by + bar / 2} dy="0.35em" fontSize={14} fill={color('text')}>
                    {v.toLocaleString('en-US')}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
      <text x={(left + right) / 2} y={top + RESULTS.length * row + 10} textAnchor="middle" fontSize={15} fill={color('muted')}>
        Discoveries
      </text>
    </Svg>
  );
}

export const FIGURES = {
  bins: { component: Bins, description: BinsDescription, width: 560 },
  results: { component: Results, description: ResultsDescription, width: 560 },
} satisfies Record<string, { component: ComponentType; description: string; width: number }>;

export type FigureName = keyof typeof FIGURES;
