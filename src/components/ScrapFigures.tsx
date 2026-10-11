/**
 * The figures of scrap-conditional-independence:
 *
 * - line: the production line, orders of three ball types passing four
 *   machines, each with a sensor, and good balls and scrap at the end.
 * - question: ball type Z drives both a signal X_i and scrap Y; the post asks
 *   whether X_i and Y are linked beyond that.
 * - pooled: made-up orders where temperature tracks scrap across all orders,
 *   but not within any ball type.
 * - u-shape: made-up basketball orders where scrap rises as temperature leaves
 *   its set point either way, so the best straight line is flat.
 * - residual: made-up orders, the residual left after the ball type against a
 *   model's prediction of it from the signals: flat, where a signal would put
 *   the orders on the diagonal.
 *
 * Drawn in the style of the site's other figures (palette, icons, short
 * labels); the prose explains them. Static: rendered on the server, no
 * JavaScript. ScrapFigure.astro wraps them.
 */
import type { ComponentType, ReactNode } from 'react';
import { color, edgePath, Ball, Gauge, Grade, PALETTE, type BallKind } from '../remotion/shared';
import { ArrowMarker } from './map-parts';

/**
 * One color per ball type, the same in every figure and both themes. Checked
 * with the dataviz palette validator on #ffffff and #111827: the site's
 * PALETTE has no three hues that stay apart under color blindness, and green,
 * red and amber mean good, scrap and look-here.
 */
const BALLS: Record<BallKind, { label: string; fill: string }> = {
  football: { label: 'Football', fill: '#2563eb' },
  volleyball: { label: 'Volleyball', fill: '#c06c9b' },
  basketball: { label: 'Basketball', fill: '#b8860b' },
};
const KINDS = Object.keys(BALLS) as BallKind[];

function Svg({ viewBox, label, children }: { viewBox: string; label: string; children: ReactNode }) {
  return (
    <svg viewBox={viewBox} role="img" aria-label={label} style={{ display: 'block', width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      {children}
    </svg>
  );
}

/** A variable as the post writes it: italic, with an optional subscript. */
const Var = ({ name, sub }: { name: string; sub?: string }) => (
  <>
    <tspan fontStyle="italic">{name}</tspan>
    {sub && (
      <tspan dy="0.3em" fontSize="0.7em" fontStyle={/\d/.test(sub) ? undefined : 'italic'}>
        {sub}
      </tspan>
    )}
  </>
);

const LineDescription =
  'The production line: orders of footballs, volleyballs and basketballs, the ball type Z, pass machines M1 to M4 in turn. Each machine has a sensor recording a signal, X1 to X4. At the end of the line, balls are either good or scrap, Y.';

function Line() {
  const arrow = 'scrap-line-arrow';
  const machine = { w: 72, h: 52, y: 80, left: (k: number) => 112 + k * 92 };
  return (
    <Svg viewBox="0 0 560 186" label={LineDescription}>
      <defs>
        <ArrowMarker id={arrow} />
      </defs>

      {KINDS.map((kind, i) => (
        <Ball key={kind} kind={kind} fill={BALLS[kind].fill} x={46} y={46 + i * 34} scale={0.85} />
      ))}
      <text x={46} y={160} textAnchor="middle" fontSize={15} fontWeight={600} fill={color('text')}>
        Ball type <Var name="Z" />
      </text>

      <path d={`M68,${machine.y} H${machine.left(0) - 3}`} stroke={color('node-border')} strokeWidth={2} markerEnd={`url(#${arrow})`} />
      {[0, 1, 2, 3].map((k) => {
        const x = machine.left(k);
        const cx = x + machine.w / 2;
        return (
          <g key={k}>
            {k > 0 && (
              <path d={`M${x - 20},${machine.y} H${x - 3}`} stroke={color('node-border')} strokeWidth={2} markerEnd={`url(#${arrow})`} />
            )}
            <rect x={x} y={machine.y - machine.h / 2} width={machine.w} height={machine.h} rx={9} fill={color('node-bg')} stroke={color('node-border')} strokeWidth={2} />
            <text x={cx} y={machine.y} dy="0.35em" textAnchor="middle" fontSize={19} fontWeight={600} fill={color('text')}>
              M{k + 1}
            </text>
            <line x1={cx} x2={cx} y1={machine.y + machine.h / 2} y2={125} stroke={color('node-border')} strokeWidth={2} />
            <Gauge x={cx} y={136} />
            <text x={cx} y={172} textAnchor="middle" fontSize={18} fill={color('text')}>
              <Var name="X" sub={String(k + 1)} />
            </text>
          </g>
        );
      })}

      {[50, 110].map((y) => (
        <path key={y} d={edgePath({ x: 460, y: machine.y }, { x: 490, y })} fill="none" stroke={color('node-border')} strokeWidth={2} markerEnd={`url(#${arrow})`} />
      ))}
      <Grade ok x={506} y={50} r={12} />
      <text x={506} y={26} textAnchor="middle" fontSize={15} fontWeight={600} fill={color('text')}>
        Good
      </text>
      <Grade ok={false} x={506} y={110} r={12} />
      <text x={506} y={144} textAnchor="middle" fontSize={15} fontWeight={600} fill={color('text')}>
        Scrap <Var name="Y" />
      </text>
    </Svg>
  );
}

const QuestionDescription =
  'Three nodes. Ball type Z has arrows to signal X_i and to scrap Y. A dashed line with a question mark joins X_i and Y: are they linked beyond the ball type?';

function Question() {
  const arrow = 'scrap-question-arrow';
  const node = { w: 150, h: 46 };
  const z = { x: 210, y: 36 };
  const x = { x: 90, y: 158 };
  const y = { x: 330, y: 158 };
  const box = (c: { x: number; y: number }, children: ReactNode) => (
    <g>
      <rect x={c.x - node.w / 2} y={c.y - node.h / 2} width={node.w} height={node.h} rx={9} fill={color('node-bg')} stroke={color('node-border')} strokeWidth={2} />
      <text x={c.x} y={c.y} dy="0.35em" textAnchor="middle" fontSize={18} fontWeight={600} fill={color('text')}>
        {children}
      </text>
    </g>
  );
  return (
    <Svg viewBox="0 0 420 190" label={QuestionDescription}>
      <defs>
        <ArrowMarker id={arrow} />
      </defs>
      <path d={`M${z.x - 30},${z.y + node.h / 2} L${x.x + 10},${x.y - node.h / 2 - 3}`} stroke={color('node-border')} strokeWidth={2} markerEnd={`url(#${arrow})`} />
      <path d={`M${z.x + 30},${z.y + node.h / 2} L${y.x - 10},${y.y - node.h / 2 - 3}`} stroke={color('node-border')} strokeWidth={2} markerEnd={`url(#${arrow})`} />
      <line x1={x.x + node.w / 2} x2={y.x - node.w / 2} y1={x.y} y2={y.y} stroke={color('text')} strokeWidth={2} strokeDasharray="6 5" />
      <circle cx={z.x} cy={x.y} r={14} fill={color('surface')} stroke={color('text')} strokeWidth={2} />
      <text x={z.x} y={x.y} dy="0.35em" textAnchor="middle" fontSize={17} fontWeight={700} fill={color('text')}>
        ?
      </text>
      {box(z, <>Ball type <Var name="Z" /></>)}
      {box(x, <>Signal <Var name="X" sub="i" /></>)}
      {box(y, <>Scrap <Var name="Y" /></>)}
    </Svg>
  );
}

/* The two charts: made-up orders, the same on every render. */

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

interface Order {
  x: number;
  y: number;
}

/** Least squares: the best straight line through the orders. */
function fit(orders: Order[]) {
  const mean = (f: (o: Order) => number) => orders.reduce((s, o) => s + f(o), 0) / orders.length;
  const mx = mean((o) => o.x);
  const my = mean((o) => o.y);
  const slope = mean((o) => (o.x - mx) * (o.y - my)) / mean((o) => (o.x - mx) ** 2);
  return (x: number) => my + slope * (x - mx);
}

interface Axis {
  min: number;
  max: number;
  ticks: number[];
  format: (v: number) => string;
  label: string;
}

interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

function scales(box: Box, x: Axis, y: Axis) {
  return {
    sx: (v: number) => box.left + ((v - x.min) / (x.max - x.min)) * (box.right - box.left),
    sy: (v: number) => box.bottom - ((v - y.min) / (y.max - y.min)) * (box.bottom - box.top),
  };
}

/** Hairline gridlines at the y ticks, tick labels, and both axis titles. */
function Axes({ box, x, y }: { box: Box; x: Axis; y: Axis }) {
  const { sx, sy } = scales(box, x, y);
  return (
    <g fontSize={14} fill={color('muted')}>
      {y.ticks.map((t) => (
        <g key={t}>
          <line x1={box.left} x2={box.right} y1={sy(t)} y2={sy(t)} stroke={color('edge')} strokeWidth={1} />
          <text x={box.left - 8} y={sy(t)} dy="0.35em" textAnchor="end">
            {y.format(t)}
          </text>
        </g>
      ))}
      {x.ticks.map((t) => (
        <text key={t} x={sx(t)} y={box.bottom + 20} textAnchor="middle">
          {x.format(t)}
        </text>
      ))}
      <text x={(box.left + box.right) / 2} y={box.bottom + 44} textAnchor="middle" fontSize={15} fontWeight={600} fill={color('text')}>
        {x.label}
      </text>
      <text x={4} y={box.top - 18} fontSize={15} fontWeight={600} fill={color('text')}>
        {y.label}
      </text>
    </g>
  );
}

/** A dot with the surface ring that keeps it legible where dots overlap. */
const Dot = ({ x, y, fill }: { x: number; y: number; fill: string }) => (
  <circle cx={x} cy={y} r={4.5} fill={fill} stroke={color('surface')} strokeWidth={1.5} />
);

const percent = (v: number) => `${v}%`;
const scrapAxis = (max: number): Axis => ({
  min: 0,
  max,
  ticks: Array.from({ length: max / 2 + 1 }, (_, i) => i * 2),
  format: percent,
  label: 'Scrap rate',
});

/** Per ball type: where machine 2's temperature sits, and how much of the order is scrapped. Scrap ignores temperature. */
const POOLED_MIX: Record<BallKind, { temperature: number; scrap: number }> = {
  football: { temperature: 158, scrap: 1.8 },
  volleyball: { temperature: 170, scrap: 3.2 },
  basketball: { temperature: 182, scrap: 4.9 },
};

const POOLED_ORDERS = (() => {
  const rand = random(286);
  return KINDS.flatMap((kind) =>
    Array.from({ length: 22 }, () => ({
      kind,
      x: POOLED_MIX[kind].temperature + 3.5 * normal(rand),
      y: POOLED_MIX[kind].scrap + 0.55 * normal(rand),
    })),
  );
})();

const PooledDescription =
  'Made-up orders: scrap rate against the temperature at machine 2, one dot per order, colored by ball type. Footballs run coolest and have the least scrap, basketballs run hottest and have the most. A dashed line through all orders rises steeply. Within each ball type, the best line is flat: temperature says nothing about scrap once the ball type is known.';

function Pooled() {
  const box = { left: 56, top: 92, right: 452, bottom: 330 };
  const x: Axis = { min: 148, max: 192, ticks: [150, 160, 170, 180, 190], format: (v) => `${v}`, label: 'Temperature at M2 (°C)' };
  const y = scrapAxis(8);
  const { sx, sy } = scales(box, x, y);

  const xs = POOLED_ORDERS.map((o) => o.x);
  const lo = Math.min(...xs);
  const hi = Math.max(...xs);
  const pooled = fit(POOLED_ORDERS);


  return (
    <Svg viewBox="0 0 560 384" label={PooledDescription}>
      <g fontSize={15} fill={color('text')}>
        {KINDS.map((kind, i) => (
          <g key={kind} transform={`translate(${box.left + i * 116} 18)`}>
            <circle cx={6} cy={0} r={6} fill={BALLS[kind].fill} />
            <text x={18} y={0} dy="0.35em">
              {BALLS[kind].label}
            </text>
          </g>
        ))}
        <g transform={`translate(${box.left} 46)`}>
          <line x1={0} x2={26} y1={0} y2={0} stroke={color('text')} strokeWidth={2} strokeDasharray="6 4" />
          <text x={34} y={0} dy="0.35em">
            All orders
          </text>
          <line x1={136} x2={162} y1={0} y2={0} stroke={color('text')} strokeWidth={3} />
          <text x={170} y={0} dy="0.35em">
            Within each ball type
          </text>
        </g>
      </g>

      <Axes box={box} x={x} y={y} />

      {POOLED_ORDERS.map((o, i) => (
        <Dot key={i} x={sx(o.x)} y={sy(o.y)} fill={BALLS[o.kind].fill} />
      ))}

      {KINDS.map((kind) => {
        const orders = POOLED_ORDERS.filter((o) => o.kind === kind);
        const line = fit(orders);
        const a = Math.min(...orders.map((o) => o.x));
        const b = Math.max(...orders.map((o) => o.x));
        const d = `M${sx(a)},${sy(line(a))} L${sx(b)},${sy(line(b))}`;
        return (
          <g key={kind}>
            <path d={d} stroke={color('surface')} strokeWidth={7} strokeLinecap="round" />
            <path d={d} stroke={BALLS[kind].fill} strokeWidth={3} strokeLinecap="round" />
          </g>
        );
      })}

      <path d={`M${sx(lo)},${sy(pooled(lo))} L${sx(hi)},${sy(pooled(hi))}`} stroke={color('text')} strokeWidth={2} strokeDasharray="6 4" />
      <text x={sx(hi) + 8} y={sy(pooled(hi))} dy="0.35em" fontSize={15} fill={color('text')}>
        All orders
      </text>
    </Svg>
  );
}

/** Basketball orders, temperature as distance from the set point: scrap grows with its square. Mirrored, so drifts either way are equally common. */
const U_ORDERS = (() => {
  const rand = random(11);
  const mean = (d: number) => 3 + 0.04 * d * d;
  return Array.from({ length: 30 }, () => 4.2 * normal(rand)).flatMap((d) =>
    [d, -d].filter((v) => Math.abs(v) < 9.6).map((v) => ({ x: v, y: mean(v) + 0.45 * normal(rand) })),
  );
})();

const UShapeDescription =
  'Made-up basketball orders: scrap rate against how far the temperature is from its set point, from 10 degrees below to 10 above. Scrap is lowest at the set point and rises in both directions, a U. The best straight line through the orders is flat, so the covariance is about zero. The conditional mean follows the U.';

function UShape() {
  const box = { left: 56, top: 40, right: 412, bottom: 290 };
  const x: Axis = { min: -10, max: 10, ticks: [-10, -5, 0, 5, 10], format: (v) => (v > 0 ? `+${v}` : `${v}`.replace('-', '−')), label: 'Temperature − set point (°C)' };
  const y = scrapAxis(8);
  const { sx, sy } = scales(box, x, y);
  const line = fit(U_ORDERS);
  const curve = Array.from({ length: 41 }, (_, i) => -9.6 + (i * 19.2) / 40)
    .map((d, i) => `${i ? 'L' : 'M'}${sx(d)},${sy(3 + 0.04 * d * d)}`)
    .join(' ');

  return (
    <Svg viewBox="0 0 560 344" label={UShapeDescription}>
      <Axes box={box} x={x} y={y} />
      {U_ORDERS.map((o, i) => (
        <Dot key={i} x={sx(o.x)} y={sy(o.y)} fill={BALLS.basketball.fill} />
      ))}
      <path d={curve} fill="none" stroke={color('text')} strokeWidth={2.5} strokeLinecap="round" />
      <path d={`M${sx(-9.6)},${sy(line(-9.6))} L${sx(9.6)},${sy(line(9.6))}`} stroke={color('text')} strokeWidth={2} strokeDasharray="6 4" />
      <g fontSize={15} fill={color('text')}>
        <text x={sx(9.6) + 10} y={sy(3 + 0.04 * 9.6 * 9.6)} dy="0.35em">
          Conditional mean
        </text>
        <text x={sx(9.6) + 10} y={sy(line(9.6))} dy="0.35em">
          Best straight line
        </text>
      </g>
    </Svg>
  );
}

/** Held-out orders: what the ball type leaves of each order's scrap rate, and a model's guess at it from the signals, which know nothing about it. */
const RESIDUAL_ORDERS = (() => {
  const rand = random(5);
  return Array.from({ length: 70 }, () => ({ x: 0.6 * normal(rand), y: 0.08 * normal(rand) })).filter((o) => Math.abs(o.x) < 1.9);
})();

const ResidualDescription =
  'Made-up held-out orders: the residual left after a model of scrap from the ball type, against a second model\'s prediction of that residual from the signals, both in percentage points from −2 to +2. The orders form a flat band around zero. A dashed diagonal marks where they would lie if the signals predicted the residual.';

function Residual() {
  const box = { left: 64, top: 40, right: 364, bottom: 340 };
  const signed = (v: number) => (v > 0 ? `+${v}` : `${v}`.replace('-', '−'));
  const axis = (label: string): Axis => ({ min: -2, max: 2, ticks: [-2, -1, 0, 1, 2], format: signed, label });
  const x = axis('Actual residual (percentage points)');
  const y = axis('Predicted residual');
  const { sx, sy } = scales(box, x, y);
  return (
    <Svg viewBox="0 0 560 396" label={ResidualDescription}>
      <Axes box={box} x={x} y={y} />
      <path d={`M${sx(-2)},${sy(-2)} L${sx(2)},${sy(2)}`} stroke={color('text')} strokeWidth={2} strokeDasharray="6 4" />
      {RESIDUAL_ORDERS.map((o, i) => (
        <Dot key={i} x={sx(o.x)} y={sy(o.y)} fill={PALETTE[3]} />
      ))}
      <text x={sx(2) + 8} y={sy(2)} dy="0.35em" fontSize={15} fill={color('text')}>
        Predicted = actual
      </text>
    </Svg>
  );
}

/**
 * `width` caps the figure on wide screens, about its own size, so its type
 * doesn't grow past the post's body text.
 */
export const FIGURES = {
  line: { component: Line, description: LineDescription, width: 600 },
  question: { component: Question, description: QuestionDescription, width: 440 },
  pooled: { component: Pooled, description: PooledDescription, width: 600 },
  'u-shape': { component: UShape, description: UShapeDescription, width: 600 },
  residual: { component: Residual, description: ResidualDescription, width: 560 },
} satisfies Record<string, { component: ComponentType; description: string; width: number }>;

export type FigureName = keyof typeof FIGURES;
