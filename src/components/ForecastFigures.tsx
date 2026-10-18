/**
 * The figures of week-ahead-ridership-forecast:
 *
 * - windows: the three times of a forecast. The model is trained on data up to
 *   t1, issues forecasts during the following week at t2, each for t3 = t2 + 7 days.
 * - holidays: RMSE per day over all stations and hours, for the four-week
 *   average, the calendar average with holidays and the model without recent
 *   demand, with the four public holidays and the days whose four-week
 *   average still holds one marked.
 * - ladder: RMSE over the six evaluation weeks for the five baselines and the
 *   two models.
 * - groups: the same RMSE split by kind of day: ordinary, holiday, and after a
 *   holiday (the same weekday one to four weeks later).
 * - importance: per group of inputs, the mean absolute SHAP contribution to the
 *   model with every input, and the change in RMSE when the model is
 *   retrained without that group.
 *
 * The numbers come from the evaluation the post describes, on the post's
 * synthetic data, which it says once. Drawn in the style of the site's other
 * figures (palette, short labels); the prose explains them. Static: rendered on
 * the server, no JavaScript. ForecastFigure.astro wraps them.
 */
import type { ComponentType, ReactNode } from 'react';
import { color, PALETTE } from '../remotion/shared';
import { ArrowMarker } from './map-parts';

/**
 * One color per forecast, the same in every figure and both themes. No green,
 * red or amber, which mean good, bad and look-here. Amber marks the holidays
 * in the holidays chart and the inputs to look at in the importance chart.
 */
const SERIES = {
  average: { label: 'Four-week average', stroke: PALETTE[2] },
  calendar: { label: 'Calendar average with holidays', stroke: PALETTE[4] },
  full: { label: 'Model, every input', stroke: PALETTE[1] },
  model: { label: 'Model without recent demand', stroke: PALETTE[0] },
} as const;
type Series = keyof typeof SERIES;

/** Bars that stand for no forecast or input in particular. */
const NEUTRAL = color('node-border');

function Svg({ viewBox, label, children }: { viewBox: string; label: string; children: ReactNode }) {
  return (
    <svg viewBox={viewBox} role="img" aria-label={label} style={{ display: 'block', width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      {children}
    </svg>
  );
}

/** A time as the post writes it: italic t with a subscript. */
const Time = ({ sub }: { sub: number }) => (
  <>
    <tspan fontStyle="italic">t</tspan>
    <tspan dy="0.3em" fontSize="0.7em">
      {sub}
    </tspan>
  </>
);

const thousands = (v: number) => v.toLocaleString('en-US');
const signed = (v: number) => (v > 0 ? `+${v}` : `${v}`.replace('-', '−'));

const WindowsDescription =
  'A time axis with three blocks. Training data runs for three years up to t1, the Monday retrain. In the following week, forecasts are issued; one is issued at time t2. An arrow of seven days leads from t2 to t3, in the block of target hours the week after.';

function Windows() {
  const arrow = 'forecast-windows-arrow';
  const y = 96;
  const h = 44;
  const blocks = [
    { x: 8, w: 236, label: 'Training data', note: '3 years', fill: color('node-bg') },
    { x: 252, w: 156, label: 'Forecasts issued', note: '1 week', fill: color('added-bg') },
    { x: 416, w: 156, label: 'Target hours', note: '1 week', fill: color('node-bg') },
  ];
  const t1 = 248;
  const t2 = 310;
  const t3 = t2 + 164;
  const tick = (x: number, sub: number, caption: string) => (
    <g>
      <line x1={x} x2={x} y1={y + h / 2 + 4} y2={y + h / 2 + 18} stroke={color('text')} strokeWidth={2} />
      <text x={x} y={y + h / 2 + 40} textAnchor="middle" fontSize={18} fill={color('text')}>
        <Time sub={sub} />
      </text>
      <text x={x} y={y + h / 2 + 62} textAnchor="middle" fontSize={15} fill={color('muted')}>
        {caption}
      </text>
    </g>
  );
  return (
    <Svg viewBox="0 0 580 190" label={WindowsDescription}>
      <defs>
        <ArrowMarker id={arrow} />
      </defs>
      {blocks.map((b) => (
        <g key={b.label}>
          <rect x={b.x} y={y - h / 2} width={b.w} height={h} rx={9} fill={b.fill} stroke={color('node-border')} strokeWidth={2} />
          <text x={b.x + b.w / 2} y={y - 4} textAnchor="middle" fontSize={16} fontWeight={600} fill={color('text')}>
            {b.label}
          </text>
          <text x={b.x + b.w / 2} y={y + 15} textAnchor="middle" fontSize={14} fill={color('muted')}>
            {b.note}
          </text>
        </g>
      ))}
      <path d={`M${t2},${y - h / 2 - 4} C${t2 + 30},${y - h / 2 - 62} ${t3 - 30},${y - h / 2 - 62} ${t3},${y - h / 2 - 6}`} fill="none" stroke={color('node-border')} strokeWidth={2} markerEnd={`url(#${arrow})`} />
      <text x={(t2 + t3) / 2} y={y - h / 2 - 54} textAnchor="middle" fontSize={16} fontWeight={600} fill={color('text')}>
        7 days
      </text>
      {tick(t1, 1, 'retrain')}
      {tick(t2, 2, 'issue')}
      {tick(t3, 3, 'target')}
    </Svg>
  );
}

/* The charts. */

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

const scale = (axis: Axis, from: number, to: number) => (v: number) => from + ((v - axis.min) / (axis.max - axis.min)) * (to - from);

/** A short colored line and the series' name, for legends. */
const Key = ({ x, y, series, dashed }: { x: number; y: number; series: Series; dashed?: boolean }) => (
  <g>
    <line x1={x} x2={x + 22} y1={y} y2={y} stroke={SERIES[series].stroke} strokeWidth={3} strokeLinecap="round" strokeDasharray={dashed ? '6 4' : undefined} />
    <text x={x + 30} y={y} dy="0.35em" fontSize={16} fill={color('text')}>
      {SERIES[series].label}
    </text>
  </g>
);

type DayKind = 'ordinary' | 'holiday' | 'echo';
interface Day {
  date: string;
  kind: DayKind;
  average: number;
  calendar: number;
  model: number;
}

/** RMSE per day over the 60 station-hours, rounded; 'echo' days have a holiday among the four days their four-week average reads. */
const DAYS: Day[] = [
  { date: '2025-12-23', kind: 'ordinary', average: 218, calendar: 199, model: 190 },
  { date: '2025-12-24', kind: 'ordinary', average: 182, calendar: 199, model: 201 },
  { date: '2025-12-25', kind: 'holiday', average: 754, calendar: 368, model: 250 },
  { date: '2025-12-26', kind: 'holiday', average: 1015, calendar: 276, model: 176 },
  { date: '2025-12-27', kind: 'ordinary', average: 250, calendar: 214, model: 198 },
  { date: '2025-12-28', kind: 'ordinary', average: 187, calendar: 196, model: 211 },
  { date: '2025-12-29', kind: 'ordinary', average: 235, calendar: 197, model: 193 },
  { date: '2025-12-30', kind: 'ordinary', average: 334, calendar: 297, model: 291 },
  { date: '2025-12-31', kind: 'ordinary', average: 218, calendar: 199, model: 202 },
  { date: '2026-01-01', kind: 'holiday', average: 700, calendar: 482, model: 222 },
  { date: '2026-01-02', kind: 'echo', average: 350, calendar: 243, model: 182 },
  { date: '2026-01-03', kind: 'ordinary', average: 190, calendar: 198, model: 188 },
  { date: '2026-01-04', kind: 'ordinary', average: 269, calendar: 249, model: 236 },
  { date: '2026-01-05', kind: 'ordinary', average: 204, calendar: 215, model: 196 },
  { date: '2026-01-06', kind: 'holiday', average: 835, calendar: 454, model: 207 },
  { date: '2026-01-07', kind: 'ordinary', average: 362, calendar: 303, model: 280 },
  { date: '2026-01-08', kind: 'echo', average: 443, calendar: 211, model: 172 },
  { date: '2026-01-09', kind: 'echo', average: 397, calendar: 301, model: 259 },
  { date: '2026-01-10', kind: 'ordinary', average: 259, calendar: 242, model: 195 },
  { date: '2026-01-11', kind: 'ordinary', average: 170, calendar: 174, model: 179 },
  { date: '2026-01-12', kind: 'ordinary', average: 205, calendar: 183, model: 185 },
  { date: '2026-01-13', kind: 'echo', average: 354, calendar: 206, model: 223 },
  { date: '2026-01-14', kind: 'ordinary', average: 216, calendar: 210, model: 182 },
  { date: '2026-01-15', kind: 'echo', average: 447, calendar: 281, model: 245 },
  { date: '2026-01-16', kind: 'echo', average: 373, calendar: 238, model: 184 },
  { date: '2026-01-17', kind: 'ordinary', average: 267, calendar: 259, model: 305 },
  { date: '2026-01-18', kind: 'ordinary', average: 237, calendar: 218, model: 189 },
  { date: '2026-01-19', kind: 'ordinary', average: 202, calendar: 167, model: 159 },
  { date: '2026-01-20', kind: 'echo', average: 267, calendar: 190, model: 203 },
  { date: '2026-01-21', kind: 'ordinary', average: 356, calendar: 377, model: 348 },
  { date: '2026-01-22', kind: 'echo', average: 387, calendar: 229, model: 165 },
  { date: '2026-01-23', kind: 'echo', average: 333, calendar: 275, model: 219 },
  { date: '2026-01-24', kind: 'ordinary', average: 254, calendar: 250, model: 194 },
  { date: '2026-01-25', kind: 'ordinary', average: 225, calendar: 248, model: 232 },
  { date: '2026-01-26', kind: 'ordinary', average: 234, calendar: 238, model: 204 },
  { date: '2026-01-27', kind: 'echo', average: 594, calendar: 492, model: 479 },
  { date: '2026-01-28', kind: 'ordinary', average: 240, calendar: 249, model: 208 },
  { date: '2026-01-29', kind: 'echo', average: 360, calendar: 316, model: 268 },
  { date: '2026-01-30', kind: 'ordinary', average: 229, calendar: 275, model: 212 },
  { date: '2026-01-31', kind: 'ordinary', average: 202, calendar: 206, model: 190 },
  { date: '2026-02-01', kind: 'ordinary', average: 215, calendar: 202, model: 196 },
  { date: '2026-02-02', kind: 'ordinary', average: 181, calendar: 151, model: 194 },
];

const HolidaysDescription =
  'RMSE per day over all stations and hours, from 23 December 2025 to 2 February 2026, for three forecasts. The four public holidays, 25 and 26 December, 1 and 6 January, are shaded amber; the days after a holiday, the same weekday one to four weeks later, are shaded lightly. Ticks mark the start of each of the six evaluation weeks. The four-week average jumps to between 700 and 1,015 passengers on the holidays and stays high on many of the days after them. The calendar average with holidays rises to between 280 and 480 on the holidays. The model without recent demand stays mostly between 150 and 300. On 27 January all three rise to between 480 and 600.';

function Holidays() {
  const box: Box = { left: 64, top: 64, right: 556, bottom: 300 };
  const y: Axis = { min: 0, max: 1100, ticks: [0, 250, 500, 750, 1000], format: thousands, label: 'RMSE per day (passengers)' };
  const sy = scale(y, box.bottom, box.top);
  const step = (box.right - box.left) / DAYS.length;
  const sx = (i: number) => box.left + step * (i + 0.5);
  const line = (key: 'average' | 'calendar' | 'model') => DAYS.map((d, i) => `${i ? 'L' : 'M'}${sx(i)},${sy(d[key])}`).join(' ');
  /** The six evaluation weeks start on Tuesdays, every seventh day. */
  const weekStarts = DAYS.flatMap((d, i) => (i % 7 === 0 ? [{ i, label: new Date(`${d.date}T12:00:00Z`).toLocaleString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }) }] : []));
  return (
    <Svg viewBox="0 0 580 392" label={HolidaysDescription}>
      {DAYS.map((d, i) =>
        d.kind === 'ordinary' ? null : (
          <rect key={d.date} x={box.left + step * i} y={box.top} width={step} height={box.bottom - box.top} fill={color('warn')} fillOpacity={d.kind === 'holiday' ? 0.5 : 0.2} />
        ),
      )}
      <g fontSize={15} fill={color('muted')}>
        {y.ticks.map((t) => (
          <g key={t}>
            <line x1={box.left} x2={box.right} y1={sy(t)} y2={sy(t)} stroke={color('edge')} strokeWidth={1} />
            <text x={box.left - 8} y={sy(t)} dy="0.35em" textAnchor="end">
              {y.format(t)}
            </text>
          </g>
        ))}
        {weekStarts.map(({ i, label }) => (
          <g key={i}>
            <line x1={box.left + step * i} x2={box.left + step * i} y1={box.bottom} y2={box.bottom + 6} stroke={color('node-border')} strokeWidth={1.5} />
            <text x={box.left + step * i} y={box.bottom + 24} textAnchor="middle">
              {label}
            </text>
          </g>
        ))}
      </g>
      <text x={4} y={box.top - 40} fontSize={16} fontWeight={600} fill={color('text')}>
        {y.label}
      </text>
      <path d={line('calendar')} fill="none" stroke={SERIES.calendar.stroke} strokeWidth={2} strokeLinejoin="round" />
      <path d={line('average')} fill="none" stroke={SERIES.average.stroke} strokeWidth={2.5} strokeDasharray="6 4" strokeLinejoin="round" />
      <path d={line('model')} fill="none" stroke={SERIES.model.stroke} strokeWidth={3} strokeLinejoin="round" />
      <Key x={box.left} y={box.bottom + 52} series="average" dashed />
      <Key x={box.left + 230} y={box.bottom + 52} series="model" />
      <Key x={box.left} y={box.bottom + 76} series="calendar" />
      <g fontSize={15} fill={color('text')}>
        <rect x={box.left + 2} y={box.top - 26} width={14} height={14} fill={color('warn')} fillOpacity={0.5} />
        <text x={box.left + 22} y={box.top - 19} dy="0.35em">Holiday</text>
        <rect x={box.left + 104} y={box.top - 26} width={14} height={14} fill={color('warn')} fillOpacity={0.2} />
        <text x={box.left + 124} y={box.top - 19} dy="0.35em">After a holiday</text>
      </g>
    </Svg>
  );
}

/** RMSE over the six evaluation weeks, 2,504 rows, as the post gives them. */
const LADDER: { label: string; rmse: number; series?: Series }[] = [
  { label: 'Station and hour', rmse: 496 },
  { label: 'Last week', rmse: 432 },
  { label: 'Four-week average', rmse: 381, series: 'average' },
  { label: 'Calendar average', rmse: 349 },
  { label: 'Calendar average with holidays', rmse: 266, series: 'calendar' },
  { label: 'Model, every input', rmse: 246, series: 'full' },
  { label: 'Model without recent demand', rmse: 226, series: 'model' },
];

const LadderDescription =
  'Horizontal bars, RMSE over the six evaluation weeks in passengers. Baselines: station and hour 496, last week 432, four-week average 381, calendar average 349, calendar average with holidays 266. Models: with every input 246, without recent demand 226.';

function Ladder() {
  const left = 250;
  const right = 520;
  const row = 34;
  const top = 16;
  const sx = scale({ min: 0, max: 520, ticks: [], format: String, label: '' }, left, right);
  return (
    <Svg viewBox={`0 0 580 ${top + LADDER.length * row + 54}`} label={LadderDescription}>
      {[0, 100, 200, 300, 400, 500].map((t) => (
        <g key={t}>
          <line x1={sx(t)} x2={sx(t)} y1={top} y2={top + LADDER.length * row} stroke={color('edge')} strokeWidth={1} />
          <text x={sx(t)} y={top + LADDER.length * row + 20} textAnchor="middle" fontSize={15} fill={color('muted')}>
            {t}
          </text>
        </g>
      ))}
      <text x={(left + right) / 2} y={top + LADDER.length * row + 42} textAnchor="middle" fontSize={16} fontWeight={600} fill={color('text')}>
        RMSE (passengers)
      </text>
      {LADDER.map((r, i) => {
        const y = top + i * row + row / 2;
        const fill = r.series ? SERIES[r.series].stroke : NEUTRAL;
        return (
          <g key={r.label}>
            <text x={left - 10} y={y} dy="0.35em" textAnchor="end" fontSize={16} fontWeight={i >= 5 ? 600 : 400} fill={color('text')}>
              {r.label}
            </text>
            <rect x={left} y={y - 11} width={sx(r.rmse) - left} height={22} rx={4} fill={fill} />
            <text x={sx(r.rmse) + 6} y={y} dy="0.35em" fontSize={16} fill={color('text')}>
              {r.rmse}
            </text>
          </g>
        );
      })}
    </Svg>
  );
}

/** RMSE by kind of day over the six weeks, as the post gives them. */
const GROUPS: { label: string; rows: string; rmse: Partial<Record<Series, number>> }[] = [
  { label: 'Ordinary days', rows: '1,609 rows', rmse: { calendar: 231, full: 229, model: 217 } },
  { label: 'Holidays', rows: '238 rows', rmse: { calendar: 403, full: 228, model: 215 } },
  { label: 'After a holiday', rows: '657 rows', rmse: { calendar: 283, full: 289, model: 251 } },
];

const GroupsDescription =
  'Grouped bars, RMSE in passengers by kind of day for three forecasts: calendar average with holidays, model with every input, model without recent demand. Ordinary days, 1,609 rows: 231, 229, 217. Holidays, 238 rows: 403, 228, 215. After a holiday, the same weekday one to four weeks later, 657 rows: 283, 289, 251.';

function Groups() {
  const box: Box = { left: 64, top: 96, right: 560, bottom: 330 };
  const y: Axis = { min: 0, max: 450, ticks: [0, 100, 200, 300, 400], format: String, label: 'RMSE (passengers)' };
  const sy = scale(y, box.bottom, box.top);
  const order: Series[] = ['calendar', 'full', 'model'];
  const group = (box.right - box.left) / GROUPS.length;
  const bar = 36;
  return (
    <Svg viewBox="0 0 580 392" label={GroupsDescription}>
      <Key x={box.left} y={16} series="calendar" />
      <Key x={box.left} y={40} series="full" />
      <Key x={box.left + 250} y={40} series="model" />
      <g fontSize={16} fill={color('muted')}>
        {y.ticks.map((t) => (
          <g key={t}>
            <line x1={box.left} x2={box.right} y1={sy(t)} y2={sy(t)} stroke={color('edge')} strokeWidth={1} />
            <text x={box.left - 8} y={sy(t)} dy="0.35em" textAnchor="end">
              {t}
            </text>
          </g>
        ))}
      </g>
      <text x={4} y={box.top - 18} fontSize={16} fontWeight={600} fill={color('text')}>
        {y.label}
      </text>
      {GROUPS.map((g, gi) => {
        const cx = box.left + group * (gi + 0.5);
        return (
          <g key={g.label}>
            {order.map((s, si) => {
              const x = cx + (si - order.length / 2) * (bar + 6) + 3;
              const v = g.rmse[s]!;
              return (
                <g key={s}>
                  <rect x={x} y={sy(v)} width={bar} height={box.bottom - sy(v)} rx={3} fill={SERIES[s].stroke} />
                  <text x={x + bar / 2} y={sy(v) - 7} textAnchor="middle" fontSize={15} fill={color('text')}>
                    {v}
                  </text>
                </g>
              );
            })}
            <text x={cx} y={box.bottom + 24} textAnchor="middle" fontSize={16} fontWeight={600} fill={color('text')}>
              {g.label}
            </text>
            <text x={cx} y={box.bottom + 46} textAnchor="middle" fontSize={15} fill={color('muted')}>
              {g.rows}
            </text>
          </g>
        );
      })}
    </Svg>
  );
}

/**
 * Per group of inputs: mean absolute SHAP contribution to the model with every
 * input, and its six-week RMSE when retrained without the group, against 246
 * with every input. Rounded as the post gives them.
 */
const WITH_EVERY_INPUT = 246;
const IMPORTANCE = [
  { label: 'Recent demand', shap: 713, without: 226 },
  { label: 'Station', shap: 136, without: 270 },
  { label: 'Calendar', shap: 115, without: 358 },
  { label: 'Weather forecast', shap: 13, without: 250 },
  { label: 'Traffic', shap: 11, without: 245 },
].map((r) => ({ ...r, change: r.without - WITH_EVERY_INPUT }));

const ImportanceDescription =
  'Two panels with one row per group of inputs. Left, mean absolute SHAP contribution in passengers: recent demand 713, station 136, calendar 115, weather forecast 13, traffic 11. Right, change in RMSE over the six weeks when the model is retrained without the group: recent demand minus 20, an improvement, marked amber; station plus 24; calendar plus 112; weather forecast plus 4; traffic minus 1. Under the right axis: left is better, right is worse.';

function Importance() {
  const label = 150;
  const top = 64;
  const row = 40;
  const bottom = top + IMPORTANCE.length * row;
  const left = { from: label, to: 312, axis: { min: 0, max: 800, ticks: [0, 400, 800], format: String, label: '' } as Axis };
  const right = { from: 396, to: 546, axis: { min: -40, max: 120, ticks: [-40, 0, 40, 80, 120], format: signed, label: '' } as Axis };
  const lx = scale(left.axis, left.from, left.to);
  const rx = scale(right.axis, right.from, right.to);
  const ticks = (axis: Axis, sx: (v: number) => number) =>
    axis.ticks.map((t) => (
      <g key={t}>
        <line x1={sx(t)} x2={sx(t)} y1={top} y2={bottom} stroke={color(t === 0 ? 'node-border' : 'edge')} strokeWidth={t === 0 ? 1.5 : 1} />
        <text x={sx(t)} y={bottom + 20} textAnchor="middle" fontSize={14} fill={color('muted')}>
          {axis.format(t)}
        </text>
      </g>
    ));
  return (
    <Svg viewBox={`0 0 580 ${bottom + 52}`} label={ImportanceDescription}>
      <g fontSize={16} fontWeight={600} fill={color('text')} textAnchor="middle">
        <text x={(left.from + left.to) / 2} y={22}>Mean |SHAP|</text>
        <text x={(left.from + left.to) / 2} y={42} fontSize={14} fontWeight={400} fill={color('muted')}>
          passengers
        </text>
        <text x={(right.from + right.to) / 2} y={22}>RMSE without it</text>
        <text x={(right.from + right.to) / 2} y={42} fontSize={14} fontWeight={400} fill={color('muted')}>
          change in passengers
        </text>
      </g>
      {ticks(left.axis, lx)}
      {ticks(right.axis, rx)}
      <text x={rx(0)} y={bottom + 44} textAnchor="middle" fontSize={14} fill={color('muted')}>
        ← better · worse →
      </text>
      {IMPORTANCE.map((r, i) => {
        const y = top + i * row + row / 2;
        const look = r.change < -10;
        const fill = look ? color('warn') : NEUTRAL;
        const a = rx(Math.min(0, r.change));
        const b = rx(Math.max(0, r.change));
        return (
          <g key={r.label}>
            <text x={label - 10} y={y} dy="0.35em" textAnchor="end" fontSize={16} fill={color('text')}>
              {r.label}
            </text>
            <rect x={lx(0)} y={y - 11} width={lx(r.shap) - lx(0)} height={22} rx={3} fill={fill} />
            <text x={lx(r.shap) + 6} y={y} dy="0.35em" fontSize={15} fill={color('text')}>
              {r.shap}
            </text>
            <rect x={a} y={y - 11} width={Math.max(b - a, 1.5)} height={22} rx={3} fill={fill} />
            <text x={r.change < 0 ? a - 6 : b + 6} y={y} dy="0.35em" textAnchor={r.change < 0 ? 'end' : 'start'} fontSize={15} fill={color('text')}>
              {signed(r.change)}
            </text>
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
  windows: { component: Windows, description: WindowsDescription, width: 600 },
  holidays: { component: Holidays, description: HolidaysDescription, width: 600 },
  ladder: { component: Ladder, description: LadderDescription, width: 600 },
  groups: { component: Groups, description: GroupsDescription, width: 600 },
  importance: { component: Importance, description: ImportanceDescription, width: 600 },
} satisfies Record<string, { component: ComponentType; description: string; width: number }>;

export type FigureName = keyof typeof FIGURES;
