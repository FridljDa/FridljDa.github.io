/**
 * The figures of scrap-conditional-independence:
 *
 * - line: the production line, orders of three ball types passing four
 *   machines, each recording three signals, and good balls and scrap at the end.
 * - question: ball type Z drives both a signal X_i and the scrap rate Y; the
 *   post asks whether X_i and Y are linked beyond that.
 * - pooled: orders where temperature tracks scrap across all orders, but not
 *   within any ball type.
 * - u-shape: a hypothetical signal in basketball orders, scrap rising as the
 *   temperature leaves its set point either way, so the best straight line is flat.
 * - cancel: a hypothetical signal whose slope is positive for footballs and
 *   negative for volleyballs, so the common slope the GCM estimates is flat.
 * - residual: the residual left after the ball type against a model's
 *   prediction of it from the signals and the ball type: flat, where a link
 *   would tilt the orders towards the diagonal.
 * - forest: each signal's slope on scrap, beta-hat, with its 95% interval,
 *   against a band of slopes too small to act on.
 *
 * All data are made up; the post says so once. Drawn in the style of the site's other figures (palette, icons, short
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

/** A range of signals, X_a–X_b, with the baseline restored after each subscript. */
const SignalRange = ({ from, to }: { from: number; to: number }) => (
  <>
    <tspan fontStyle="italic">X</tspan>
    <tspan dy="0.3em" fontSize="0.7em">{from}</tspan>
    <tspan dy="-0.3em">–</tspan>
    <tspan fontStyle="italic">X</tspan>
    <tspan dy="0.3em" fontSize="0.7em">{to}</tspan>
  </>
);

const LineDescription =
  'The production line: orders of footballs, volleyballs and basketballs, the ball type Z, pass machines M1 to M4 in turn. Each machine records three signals: X1 to X3 at M1, X4 to X6 at M2, X7 to X9 at M3, X10 to X12 at M4. At the end of the line, balls are either good or scrap.';

function Line() {
  const arrow = 'scrap-line-arrow';
  const machine = { w: 72, h: 52, y: 80, left: (k: number) => 112 + k * 92 };
  return (
    <Svg viewBox="0 0 560 190" label={LineDescription}>
      <defs>
        <ArrowMarker id={arrow} />
      </defs>

      {KINDS.map((kind, i) => (
        <Ball key={kind} kind={kind} fill={BALLS[kind].fill} x={46} y={46 + i * 34} scale={0.85} />
      ))}
      <text x={50} y={162} textAnchor="middle" fontSize={16} fontWeight={600} fill={color('text')}>
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
            <text x={cx} y={machine.y} dy="0.35em" textAnchor="middle" fontSize={20} fontWeight={600} fill={color('text')}>
              M{k + 1}
            </text>
            <line x1={cx} x2={cx} y1={machine.y + machine.h / 2} y2={125} stroke={color('node-border')} strokeWidth={2} />
            <Gauge x={cx} y={136} />
            <text x={cx} y={174} textAnchor="middle" fontSize={19} fill={color('text')}>
              <SignalRange from={3 * k + 1} to={3 * k + 3} />
            </text>
          </g>
        );
      })}

      {[50, 110].map((y) => (
        <path key={y} d={edgePath({ x: 460, y: machine.y }, { x: 490, y })} fill="none" stroke={color('node-border')} strokeWidth={2} markerEnd={`url(#${arrow})`} />
      ))}
      <Grade ok x={506} y={50} r={12} />
      <text x={506} y={26} textAnchor="middle" fontSize={16} fontWeight={600} fill={color('text')}>
        Good
      </text>
      <Grade ok={false} x={506} y={110} r={12} />
      <text x={506} y={146} textAnchor="middle" fontSize={16} fontWeight={600} fill={color('text')}>
        Scrap
      </text>
    </Svg>
  );
}

const QuestionDescription =
  'Three nodes. Ball type Z has arrows to signal X_i and to scrap rate Y. A dashed line with a question mark joins X_i and Y: are they linked beyond the ball type?';

function Question() {
  const arrow = 'scrap-question-arrow';
  const node = { w: 156, h: 46 };
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
      {box(y, <>Scrap rate <Var name="Y" /></>)}
    </Svg>
  );
}

/* The charts: made-up orders, the same on every render. */

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
    <g fontSize={16} fill={color('muted')}>
      {y.ticks.map((t) => (
        <g key={t}>
          <line x1={box.left} x2={box.right} y1={sy(t)} y2={sy(t)} stroke={color('edge')} strokeWidth={1} />
          <text x={box.left - 8} y={sy(t)} dy="0.35em" textAnchor="end">
            {y.format(t)}
          </text>
        </g>
      ))}
      {x.ticks.map((t) => (
        <text key={t} x={sx(t)} y={box.bottom + 22} textAnchor="middle">
          {x.format(t)}
        </text>
      ))}
      <text x={(box.left + box.right) / 2} y={box.bottom + 50} textAnchor="middle" fontSize={17} fontWeight={600} fill={color('text')}>
        {x.label}
      </text>
      <text x={4} y={box.top - 18} fontSize={17} fontWeight={600} fill={color('text')}>
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
const signed = (v: number) => (v > 0 ? `+${v}` : `${v}`.replace('-', '−'));
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

/** Orders per ball type in the chart, in the proportions of the post's 180, 140 and 80. */
const POOLED_COUNT: Record<BallKind, number> = { football: 36, volleyball: 28, basketball: 16 };

/** Each type's orders with the noise's chance slope taken out, so the best line within a type is exactly flat. */
const POOLED_ORDERS = (() => {
  const rand = random(286);
  return KINDS.flatMap((kind) => {
    const orders = Array.from({ length: POOLED_COUNT[kind] }, () => ({
      kind,
      x: POOLED_MIX[kind].temperature + 3.5 * normal(rand),
      y: POOLED_MIX[kind].scrap + 0.55 * normal(rand),
    }));
    const line = fit(orders);
    const slope = line(1) - line(0);
    const mx = orders.reduce((s, o) => s + o.x, 0) / orders.length;
    return orders.map((o) => ({ ...o, y: o.y - slope * (o.x - mx) }));
  });
})();

const PooledDescription =
  'Orders: scrap rate against the temperature at machine M2, one dot per order, colored and labelled by ball type. Footballs run coolest and have the least scrap, basketballs run hottest and have the most. A dashed line through all orders rises steeply. Within each ball type, the best line, drawn solid in that type\'s color, is flat: once the ball type is known, scrap shows no trend with temperature.';

function Pooled() {
  const box = { left: 56, top: 40, right: 446, bottom: 290 };
  const x: Axis = { min: 148, max: 192, ticks: [150, 160, 170, 180, 190], format: (v) => `${v}`, label: 'Temperature at M2 (°C)' };
  const y = scrapAxis(7);
  const { sx, sy } = scales(box, x, y);

  const xs = POOLED_ORDERS.map((o) => o.x);
  const lo = Math.min(...xs);
  const hi = Math.max(...xs);
  const pooled = fit(POOLED_ORDERS);
  /** Each type's name sits above its cluster, starting at its leftmost order, clear of the next cluster's line. */
  const clusterLabel = (kind: BallKind) => {
    const orders = POOLED_ORDERS.filter((o) => o.kind === kind);
    return { x: Math.min(...orders.map((o) => o.x)), y: sy(Math.max(...orders.map((o) => o.y))) - 16 };
  };

  return (
    <Svg viewBox="0 0 560 352" label={PooledDescription}>
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
            {kind === 'basketball' && (
              <text x={sx(b) + 8} y={sy(line(b)) + 8} dy="0.35em" fontSize={16} fill={color('text')}>
                Within type
              </text>
            )}
            <text x={sx(clusterLabel(kind).x)} y={clusterLabel(kind).y} fontSize={16} fontWeight={600} fill={BALLS[kind].fill}>
              {BALLS[kind].label}
            </text>
          </g>
        );
      })}

      <path d={`M${sx(lo)},${sy(pooled(lo))} L${sx(hi)},${sy(pooled(hi))}`} stroke={color('text')} strokeWidth={2} strokeDasharray="6 4" />
      <text x={sx(hi) + 8} y={sy(pooled(hi)) - 8} dy="0.35em" fontSize={16} fill={color('text')}>
        All orders
      </text>
    </Svg>
  );
}

/**
 * Basketball orders, temperature as distance d from the set point: scrap grows
 * with d squared, averaging the 4.9% the post gives basketballs. Mirrored, so
 * the orders are spread symmetrically about the set point.
 */
const uMean = (d: number) => 4.4 + 0.03 * d * d;
const U_ORDERS = (() => {
  const rand = random(11);
  return Array.from({ length: 30 }, () => 4.2 * normal(rand)).flatMap((d) =>
    [d, -d].filter((v) => Math.abs(v) < 9.6).map((v) => ({ x: v, y: uMean(v) + 0.45 * normal(rand) })),
  );
})();

const UShapeDescription =
  'A hypothetical signal in basketball orders: scrap rate against how far the temperature is from its set point, from 10 degrees below to 10 above. Scrap is lowest at the set point and rises in both directions, a U. The best straight line through the orders is flat, so the covariance is about zero. The conditional mean follows the U.';

function UShape() {
  const box = { left: 56, top: 40, right: 412, bottom: 290 };
  const x: Axis = { min: -10, max: 10, ticks: [-10, -5, 0, 5, 10], format: signed, label: 'Temperature − set point (°C)' };
  const y = scrapAxis(8);
  const { sx, sy } = scales(box, x, y);
  const line = fit(U_ORDERS);
  const curve = Array.from({ length: 41 }, (_, i) => -9.6 + (i * 19.2) / 40)
    .map((d, i) => `${i ? 'L' : 'M'}${sx(d)},${sy(uMean(d))}`)
    .join(' ');

  return (
    <Svg viewBox="0 0 560 350" label={UShapeDescription}>
      <Axes box={box} x={x} y={y} />
      {U_ORDERS.map((o, i) => (
        <Dot key={i} x={sx(o.x)} y={sy(o.y)} fill={BALLS.basketball.fill} />
      ))}
      <path d={curve} fill="none" stroke={color('text')} strokeWidth={2.5} strokeLinecap="round" />
      <path d={`M${sx(-9.6)},${sy(line(-9.6))} L${sx(9.6)},${sy(line(9.6))}`} stroke={color('text')} strokeWidth={2} strokeDasharray="6 4" />
      <g fontSize={16} fill={color('text')}>
        <text x={sx(9.6) + 10} y={sy(uMean(9.6))} dy="0.35em">
          Conditional mean
        </text>
        <text x={sx(9.6) + 10} y={sy(line(9.6))} dy="0.35em">
          Best straight line
        </text>
      </g>
    </Svg>
  );
}

/**
 * A hypothetical signal in footballs and volleyballs, each order centred on its
 * type's averages: scrap rises with temperature in one type and falls in the
 * other, so the common slope through all of them is about flat.
 */
const CANCEL_SLOPE: Partial<Record<BallKind, number>> = { football: 0.09, volleyball: -0.09 };
const CANCEL_ORDERS = (() => {
  const rand = random(7);
  const centred = (['football', 'volleyball'] as BallKind[]).map((kind) => {
    const orders = Array.from({ length: 30 }, () => 3 * normal(rand))
      .filter((x) => Math.abs(x) < 7.5)
      .map((x) => ({ kind, x, y: CANCEL_SLOPE[kind]! * x + 0.22 * normal(rand) }));
    const mx = orders.reduce((s, o) => s + o.x, 0) / orders.length;
    const my = orders.reduce((s, o) => s + o.y, 0) / orders.length;
    return orders.map((o) => ({ ...o, x: o.x - mx, y: o.y - my }));
  });
  // Tilt the volleyballs just enough that the two covariances cancel exactly.
  const [football, volleyball] = centred;
  const sum = (orders: { x: number; y: number }[], f: (o: { x: number; y: number }) => number) => orders.reduce((s, o) => s + f(o), 0);
  const tilt = -(sum(football, (o) => o.x * o.y) + sum(volleyball, (o) => o.x * o.y)) / sum(volleyball, (o) => o.x * o.x);
  return [...football, ...volleyball.map((o) => ({ ...o, y: o.y + tilt * o.x }))];
})();

const CancelDescription =
  'A hypothetical signal in football and volleyball orders, each centred on its ball type\'s averages: scrap rate against temperature, both as differences from the type\'s average. In footballs, scrap rises with temperature; in volleyballs, it falls. The best line through all orders together, the common slope, is flat: the two covariances cancel.';

function Cancel() {
  const box = { left: 64, top: 40, right: 420, bottom: 290 };
  const x: Axis = { min: -8, max: 8, ticks: [-8, -4, 0, 4, 8], format: signed, label: 'Temperature − type average (°C)' };
  const y: Axis = { min: -1, max: 1, ticks: [-1, 0, 1], format: signed, label: 'Scrap rate − type average (percentage points)' };
  const { sx, sy } = scales(box, x, y);
  const common = fit(CANCEL_ORDERS);
  const end = 7.5;
  return (
    <Svg viewBox="0 0 560 352" label={CancelDescription}>
      <Axes box={box} x={x} y={y} />
      {CANCEL_ORDERS.map((o, i) => (
        <Dot key={i} x={sx(o.x)} y={sy(o.y)} fill={BALLS[o.kind].fill} />
      ))}
      {(['football', 'volleyball'] as BallKind[]).map((kind) => {
        const orders = CANCEL_ORDERS.filter((o) => o.kind === kind);
        const line = fit(orders);
        const a = Math.min(...orders.map((o) => o.x));
        const b = Math.max(...orders.map((o) => o.x));
        const d = `M${sx(a)},${sy(line(a))} L${sx(b)},${sy(line(b))}`;
        return (
          <g key={kind}>
            <path d={d} stroke={color('surface')} strokeWidth={7} strokeLinecap="round" />
            <path d={d} stroke={BALLS[kind].fill} strokeWidth={3} strokeLinecap="round" />
            <text x={sx(b) + 10} y={sy(line(b))} dy="0.35em" fontSize={16} fontWeight={600} fill={BALLS[kind].fill}>
              {BALLS[kind].label}
            </text>
          </g>
        );
      })}
      <path d={`M${sx(-end)},${sy(common(-end))} L${sx(end)},${sy(common(end))}`} stroke={color('text')} strokeWidth={2} strokeDasharray="6 4" />
      <text x={sx(end) + 10} y={sy(common(end))} dy="0.35em" fontSize={16} fill={color('text')}>
        Common slope
      </text>
    </Svg>
  );
}

/** Held-out orders: what the ball type leaves of each order's scrap rate, and a model's guess at it from the signals and the ball type, which know nothing about it. */
const RESIDUAL_ORDERS = (() => {
  const rand = random(5);
  return Array.from({ length: 70 }, () => ({ x: 0.6 * normal(rand), y: 0.08 * normal(rand) })).filter((o) => Math.abs(o.x) < 1.9);
})();

const ResidualDescription =
  'Held-out orders: the residual left after subtracting the average scrap rate of the order\'s ball type, against a second model\'s prediction of that residual from the signals and the ball type, both in percentage points from −2 to +2. The orders form a flat band around zero. A dashed diagonal marks where they would lie if the signals predicted the residual perfectly; a link would tilt the band towards it.';

function Residual() {
  const box = { left: 64, top: 40, right: 364, bottom: 340 };
  const axis = (label: string): Axis => ({ min: -2, max: 2, ticks: [-2, -1, 0, 1, 2], format: signed, label });
  const x = axis('Actual residual (percentage points)');
  const y = axis('Predicted residual (percentage points)');
  const { sx, sy } = scales(box, x, y);
  return (
    <Svg viewBox="0 0 384 402" label={ResidualDescription}>
      <Axes box={box} x={x} y={y} />
      <path d={`M${sx(-2)},${sy(-2)} L${sx(2)},${sy(2)}`} stroke={color('text')} strokeWidth={2} strokeDasharray="6 4" />
      {RESIDUAL_ORDERS.map((o, i) => (
        <Dot key={i} x={sx(o.x)} y={sy(o.y)} fill={PALETTE[3]} />
      ))}
      <text x={sx(1.6) - 10} y={sy(1.6)} dy="0.35em" textAnchor="end" fontSize={16} fill={color('text')}>
        Predicted = actual
      </text>
    </Svg>
  );
}

/**
 * Results of the GCM, one row per signal: beta-hat, the slope of scrap on the
 * signal in percentage points per within-type standard deviation of the
 * signal, and the half-width of its 95% interval. X7 is the one rejection at
 * 5% (p = 0.02), X11 the one interval reaching past the band. The post quotes
 * these numbers.
 */
const FOREST: { estimate: number; halfWidth: number }[] = [
  { estimate: -0.021, halfWidth: 0.058 },
  { estimate: 0.034, halfWidth: 0.061 },
  { estimate: 0.008, halfWidth: 0.057 },
  { estimate: -0.045, halfWidth: 0.066 },
  { estimate: 0.012, halfWidth: 0.059 },
  { estimate: 0.027, halfWidth: 0.071 },
  { estimate: 0.075, halfWidth: 0.063 },
  { estimate: -0.03, halfWidth: 0.06 },
  { estimate: 0.041, halfWidth: 0.064 },
  { estimate: -0.016, halfWidth: 0.062 },
  { estimate: -0.03, halfWidth: 0.165 },
  { estimate: 0.019, halfWidth: 0.058 },
];
/** Slopes inside ±BAND percentage points per within-type standard deviation are too small to act on. */
const BAND = 0.15;
/** Signals to look at, with the short note the figure gives each. */
const LOOK_HERE: Record<number, ReactNode> = {
  7: (
    <>
      <tspan fontStyle="italic">p</tspan> = 0.02
    </>
  ),
  11: 'Wide interval',
};

const ForestDescription =
  'For each of the twelve signals, grouped by machine M1 to M4, the slope of scrap on the signal in percentage points per within-type standard deviation of the signal, with its 95% interval, on a scale from −0.25 to +0.25. A shaded band from −0.15 to +0.15 marks slopes too small to act on. Every interval but one lies inside the band. X7 at M3 is the only interval that excludes zero, from 0.01 to 0.14, with p = 0.02. X11 at M4 has a wide interval, from −0.20 to +0.14, reaching past the band on the left.';

function Forest() {
  const box = { left: 104, top: 56, right: 470, bottom: 400 };
  const row = 24;
  const gap = 12;
  const min = -0.25;
  const max = 0.25;
  const sx = (v: number) => box.left + ((v - min) / (max - min)) * (box.right - box.left);
  const rowY = (i: number) => box.top + 10 + i * row + Math.floor(i / 3) * gap + row / 2;

  return (
    <Svg viewBox="0 0 560 488" label={ForestDescription}>
      <rect x={sx(-BAND)} y={box.top} width={sx(BAND) - sx(-BAND)} height={box.bottom - box.top} fill={color('edge')} fillOpacity={0.4} />
      <text x={sx(0)} y={box.top - 14} textAnchor="middle" fontSize={16} fontWeight={600} fill={color('text')}>
        Too small to act on (±{BAND})
      </text>

      <g fontSize={16} fill={color('muted')}>
        {[-0.2, -0.1, 0, 0.1, 0.2].map((t) => (
          <g key={t}>
            <line x1={sx(t)} x2={sx(t)} y1={box.top} y2={box.bottom} stroke={color(t === 0 ? 'node-border' : 'edge')} strokeWidth={t === 0 ? 1.5 : 1} />
            <text x={sx(t)} y={box.bottom + 22} textAnchor="middle">
              {signed(t)}
            </text>
          </g>
        ))}
      </g>
      <g textAnchor="middle" fontSize={17} fontWeight={600} fill={color('text')}>
        <text x={(box.left + box.right) / 2} y={box.bottom + 50}>
          Percentage points of scrap
        </text>
        <text x={(box.left + box.right) / 2} y={box.bottom + 72}>
          per within-type standard deviation of the signal
        </text>
      </g>

      {[0, 1, 2, 3].map((m) => (
        <text key={m} x={8} y={(rowY(3 * m) + rowY(3 * m + 2)) / 2} dy="0.35em" fontSize={16} fontWeight={600} fill={color('text')}>
          M{m + 1}
        </text>
      ))}

      {FOREST.map(({ estimate, halfWidth }, i) => {
        const y = rowY(i);
        const note = LOOK_HERE[i + 1];
        const fill = note ? color('warn') : PALETTE[3];
        return (
          <g key={i}>
            {note && (
              <text x={sx(estimate + halfWidth) + 12} y={y} dy="0.35em" fontSize={16} fill={color('text')}>
                {note}
              </text>
            )}
            <text x={box.left - 14} y={y} dy="0.35em" textAnchor="end" fontSize={17} fill={color('text')}>
              <Var name="X" sub={String(i + 1)} />
            </text>
            <line x1={sx(estimate - halfWidth)} x2={sx(estimate + halfWidth)} y1={y} y2={y} stroke={fill} strokeWidth={3} strokeLinecap="round" />
            <circle cx={sx(estimate)} cy={y} r={5.5} fill={fill} stroke={color('surface')} strokeWidth={1.5} />
          </g>
        );
      })}
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
  cancel: { component: Cancel, description: CancelDescription, width: 600 },
  residual: { component: Residual, description: ResidualDescription, width: 420 },
  forest: { component: Forest, description: ForestDescription, width: 600 },
} satisfies Record<string, { component: ComponentType; description: string; width: number }>;

export type FigureName = keyof typeof FIGURES;
