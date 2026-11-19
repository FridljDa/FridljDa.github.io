/**
 * The figures of the four posts on pricing motor insurance with the public
 * French portfolio freMTPL2. One file, so the series shares one style.
 *
 * frequency-times-severity:
 * - claimpath: one policy-year, claims arriving along the exposure, each
 *   with its own size.
 * - exposure: claim frequency per policy-year by exposure band.
 * - counts: policies by number of claims, observed and Poisson.
 * - sizes: pure premium against mean claim size per one-way group, with the
 *   slope a single Tweedie model assumes.
 *
 * large-claim-loading:
 * - split: share of claims and of claim cost below and above the cap.
 * - folds: pure premium per cross-validation fold and the test set, uncapped
 *   and capped.
 * - largeshare: share of claims above the cap per driver-age band.
 * - loading: the large-claim loading with its bootstrap interval, and two
 *   values it would take with less large-claim cost.
 *
 * tweedie-glm-vs-xgboost:
 * - gains: per fold, each model's D² minus the Tweedie GLM's.
 * - calibration: observed against charged premium per decile, test set.
 * - relativities: partial dependence on bonus-malus and driver age.
 * - datasize: D² against the number of fitting policies, with TabICL.
 *
 * reports-that-cant-disagree:
 * - pipeline: rules write results, notebooks only read them, checks stand
 *   guard on the way to the reports.
 *
 * The numbers come from the rendered reports of the analysis, rounded as the
 * posts give them. Drawn in the style of the site's other figures (palette,
 * short labels); the prose explains them. Static: rendered on the server, no
 * JavaScript. PricingFigure.astro wraps them.
 */
import type { ComponentType, ReactNode } from 'react';
import { color, PALETTE } from '../remotion/shared';
import { ArrowMarker } from './map-parts';

/**
 * One color per model or quantity, the same in every figure and both themes.
 * Amber marks what to look at: the tail of the claim counts, bonus-malus, the young drivers, the cap.
 */
const MODEL = {
  glm: { label: 'Tweedie GLM', stroke: PALETTE[4] },
  glmfs: { label: 'Poisson × Gamma GLM', stroke: PALETTE[3] },
  xgb: { label: 'Tweedie XGBoost', stroke: PALETTE[1] },
  xgbfs: { label: 'Poisson × Gamma XGBoost', stroke: PALETTE[0] },
  tabicl: { label: 'TabICL', stroke: PALETTE[2] },
} as const;
type Model = keyof typeof MODEL;

const NEUTRAL = color('node-border');
const LOOK = color('warn');
const W = 580;

function Svg({ height, label, children }: { height: number; label: string; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label={label} style={{ display: 'block', width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      {children}
    </svg>
  );
}

const lin = (min: number, max: number, from: number, to: number) => (v: number) => from + ((v - min) / (max - min)) * (to - from);
const log = (min: number, max: number, from: number, to: number) => (v: number) =>
  from + ((Math.log10(v) - Math.log10(min)) / (Math.log10(max) - Math.log10(min))) * (to - from);
const thousands = (v: number) => v.toLocaleString('en-US');
const pct = (v: number, digits = 1) => `${(v * 100).toFixed(digits)}%`;
const signed = (v: number, digits = 2) => (v >= 0 ? `+${v.toFixed(digits)}` : `−${Math.abs(v).toFixed(digits)}`);

/** Horizontal grid lines with labels on the left. */
function YGrid({ ticks, sy, left, right, format }: { ticks: number[]; sy: (v: number) => number; left: number; right: number; format: (v: number) => string }) {
  return (
    <g fontSize={14} fill={color('muted')}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={left} x2={right} y1={sy(t)} y2={sy(t)} stroke={color('edge')} strokeWidth={1} />
          <text x={left - 8} y={sy(t)} dy="0.35em" textAnchor="end">
            {format(t)}
          </text>
        </g>
      ))}
    </g>
  );
}

/** Vertical grid lines with labels below. */
function XGrid({ ticks, sx, top, bottom, format }: { ticks: number[]; sx: (v: number) => number; top: number; bottom: number; format: (v: number) => string }) {
  return (
    <g fontSize={14} fill={color('muted')}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={sx(t)} x2={sx(t)} y1={top} y2={bottom} stroke={color('edge')} strokeWidth={1} />
          <text x={sx(t)} y={bottom + 20} textAnchor="middle">
            {format(t)}
          </text>
        </g>
      ))}
    </g>
  );
}

const Title = ({ x, y, children, anchor = 'start' }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end' }) => (
  <text x={x} y={y} textAnchor={anchor} fontSize={16} fontWeight={600} fill={color('text')}>
    {children}
  </text>
);

/* frequency-times-severity */

const ClaimPathDescription =
  'One policy over its exposure of e years, drawn as a time axis. Three claims arrive at random times, so N = 3; each is a vertical bar whose height is its amount, Z1, Z2 and Z3. How many bars there are is the frequency part, how tall they are the severity part, and their sum is the total S.';

/** One policy-year: claims arrive along the exposure, each with its own size. */
function ClaimPath() {
  const left = 40;
  const right = 400;
  const base = 270;
  const claims = [
    { t: 0.22, z: 60, label: 'Z₁' },
    { t: 0.51, z: 120, label: 'Z₂' },
    { t: 0.83, z: 38, label: 'Z₃' },
  ];
  const sx = lin(0, 1, left, right);
  const total = claims.reduce((a, c) => a + c.z, 0);
  const stackX = 500;
  let acc = 0;
  return (
    <Svg height={340} label={ClaimPathDescription}>
      <defs>
        <ArrowMarker id="pricing-claimpath-arrow" />
      </defs>
      <line x1={left} x2={right + 14} y1={base} y2={base} stroke={color('text')} strokeWidth={1.5} markerEnd="url(#pricing-claimpath-arrow)" />
      <g fontSize={14} fill={color('muted')}>
        <text x={left} y={base + 22} textAnchor="middle">
          0
        </text>
        <text x={right} y={base + 22} textAnchor="middle">
          e
        </text>
        <text x={(left + right) / 2} y={base + 50} textAnchor="middle">
          time in force (years)
        </text>
      </g>
      {claims.map((c) => (
        <g key={c.label}>
          <rect x={sx(c.t) - 9} y={base - c.z} width={18} height={c.z} rx={3} fill={PALETTE[0]} />
          <circle cx={sx(c.t)} cy={base} r={6} fill={LOOK} stroke={color('surface')} strokeWidth={1.5} />
          <text x={sx(c.t)} y={base - c.z - 10} textAnchor="middle" fontSize={15} fill={color('text')}>
            {c.label}
          </text>
        </g>
      ))}
      <g fontSize={14} fontWeight={600}>
        <circle cx={left + 6} cy={24} r={6} fill={LOOK} />
        <text x={left + 18} y={24} dy="0.35em" fill={color('text')}>
          how many: N
        </text>
        <rect x={left + 150} y={16} width={14} height={16} rx={3} fill={PALETTE[0]} />
        <text x={left + 172} y={24} dy="0.35em" fill={color('text')}>
          how large: Z₁, Z₂, Z₃
        </text>
      </g>
      {claims.map((c) => {
        const y = base - acc - c.z;
        acc += c.z;
        return <rect key={`s${c.label}`} x={stackX - 14} y={y} width={28} height={c.z} fill={PALETTE[0]} stroke={color('surface')} strokeWidth={2} rx={2} />;
      })}
      <line x1={stackX - 22} x2={stackX + 22} y1={base} y2={base} stroke={color('text')} strokeWidth={1.5} />
      <text x={stackX} y={base - total - 12} textAnchor="middle" fontSize={15} fontWeight={600} fill={color('text')}>
        S
      </text>
      <text x={stackX} y={base + 22} textAnchor="middle" fontSize={14} fill={color('muted')}>
        total
      </text>
    </Svg>
  );
}

/** Training policies by number of claims, observed and under one common Poisson rate. */
const COUNTS = [
  { label: '0', observed: 515206, poisson: 514592 },
  { label: '1', observed: 18590, poisson: 19716 },
  { label: '2', observed: 1024, poisson: 563 },
  { label: '3', observed: 50, poisson: 12.1 },
  { label: '4+', observed: 13, poisson: 0.2 },
];

const CountsDescription =
  'Pairs of bars on a log scale: training policies by number of claims, observed against a Poisson with one common rate and each policy\'s own exposure. No claim: 515,206 observed, 514,592 expected. One claim: 18,590 against 19,716. Two: 1,024 against 563. Three: 50 against 12. Four or more: 13 against 0.2. The observed bars, in amber from two claims on, pull away from the Poisson ones in the tail.';

function Counts() {
  const box = { left: 72, top: 48, right: 568, bottom: 270 };
  const sy = log(0.1, 1e6, box.bottom, box.top);
  const step = (box.right - box.left) / COUNTS.length;
  const bar = step * 0.3;
  const fmt = (v: number) => (v >= 100 ? thousands(Math.round(v)) : v >= 1 ? String(Math.round(v)) : v.toFixed(1));
  return (
    <Svg height={330} label={CountsDescription}>
      <Title x={4} y={22}>
        Policies (log scale)
      </Title>
      <g fontSize={14} fill={color('text')}>
        <rect x={box.right - 248} y={14} width={14} height={14} rx={3} fill={NEUTRAL} />
        <text x={box.right - 228} y={21} dy="0.35em">
          observed
        </text>
        <rect x={box.right - 148} y={14} width={14} height={14} rx={3} fill={PALETTE[0]} />
        <text x={box.right - 128} y={21} dy="0.35em">
          Poisson, one rate
        </text>
      </g>
      <YGrid ticks={[0.1, 10, 1000, 1e5]} sy={sy} left={box.left} right={box.right} format={(v) => (v < 1 ? '0.1' : thousands(v))} />
      {COUNTS.map((c, i) => {
        const x = box.left + step * i + step / 2;
        const tail = i >= 2;
        return (
          <g key={c.label}>
            <rect x={x - bar - 2} y={sy(c.observed)} width={bar} height={box.bottom - sy(c.observed)} rx={3} fill={tail ? LOOK : NEUTRAL} />
            <rect x={x + 2} y={sy(c.poisson)} width={bar} height={box.bottom - sy(c.poisson)} rx={3} fill={PALETTE[0]} />
            <text x={x - bar / 2 - 2} y={sy(c.observed) - 6} textAnchor="middle" fontSize={12} fill={color('text')}>
              {fmt(c.observed)}
            </text>
            <text x={x + bar / 2 + 2} y={Math.min(sy(c.poisson), sy(c.observed) - 14) - 6} textAnchor="middle" fontSize={12} fill={color('muted')}>
              {fmt(c.poisson)}
            </text>
            <text x={x} y={box.bottom + 22} textAnchor="middle" fontSize={14} fill={color('text')}>
              {c.label}
            </text>
          </g>
        );
      })}
      <text x={(box.left + box.right) / 2} y={box.bottom + 50} textAnchor="middle" fontSize={14} fill={color('muted')}>
        Claims per policy
      </text>
    </Svg>
  );
}

/**
 * One-way groups of the training data (deciles of numeric features, levels of
 * categorical ones, at least 200 claims): capped pure premium per policy-year
 * and mean capped claim size. Bonus-malus is marked.
 */
const GROUPS: [string, number, number][] = [
  ['DrivAge', 199.7, 1688], ['DrivAge', 115.3, 1610], ['DrivAge', 108.1, 1572], ['DrivAge', 108.6, 1588], ['DrivAge', 113.0, 1551],
  ['DrivAge', 120.2, 1538], ['DrivAge', 123.4, 1602], ['DrivAge', 108.7, 1591], ['DrivAge', 97.5, 1513], ['DrivAge', 98.4, 1669],
  ['BonusMalus', 81.0, 1546], ['BonusMalus', 123.2, 1606], ['BonusMalus', 175.6, 1578], ['BonusMalus', 185.5, 1663], ['BonusMalus', 311.6, 1706],
  ['VehAge', 122.2, 1714], ['VehAge', 120.8, 1523], ['VehAge', 101.8, 1495], ['VehAge', 85.4, 1524], ['VehAge', 125.1, 1662],
  ['VehAge', 116.2, 1604], ['VehAge', 132.6, 1775], ['VehAge', 120.1, 1572], ['VehAge', 134.9, 1655], ['VehAge', 120.4, 1484],
  ['VehPower', 133.9, 1674], ['VehPower', 110.7, 1550], ['VehPower', 122.3, 1600], ['VehPower', 115.5, 1615], ['VehPower', 116.6, 1610], ['VehPower', 134.6, 1667],
  ['Density', 78.2, 1527], ['Density', 95.7, 1578], ['Density', 98.2, 1541], ['Density', 109.0, 1606], ['Density', 102.3, 1529],
  ['Density', 120.7, 1624], ['Density', 138.2, 1579], ['Density', 148.4, 1680], ['Density', 156.2, 1659], ['Density', 154.1, 1602],
  ['VehBrand', 112.7, 1541], ['VehBrand', 138.4, 1712], ['VehBrand', 161.7, 1655], ['VehBrand', 109.0, 1696], ['VehBrand', 129.8, 1712],
  ['VehBrand', 113.1, 1578], ['VehBrand', 137.8, 1630], ['VehBrand', 122.4, 1530], ['VehBrand', 133.0, 1597], ['VehBrand', 120.9, 1514],
  ['Region', 127.9, 1496], ['Region', 136.1, 1531], ['Region', 97.6, 1529], ['Region', 109.1, 1678], ['Region', 110.9, 1588],
  ['Region', 127.1, 1609], ['Region', 97.9, 1718], ['Region', 108.2, 1480], ['Region', 104.6, 1580], ['Region', 111.5, 1546],
  ['Region', 125.3, 1659], ['Region', 74.8, 1409], ['Region', 143.4, 1551], ['Region', 129.4, 1777], ['Region', 159.8, 1890],
  ['VehGas', 125.2, 1597], ['VehGas', 111.3, 1596],
];
/** Geometric centre of the groups, where the reference lines pass. */
const CENTRE = { pp: 121.3, size: 1602 };

const SizesDescription =
  'Scatter on log scales of 68 one-way groups of the training data: capped pure premium per policy-year against mean capped claim size. Pure premiums range from 75 to 312, a factor of 4.2; claim sizes from 1,409 to 1,890, a factor of 1.3. The five bonus-malus groups, in amber, go from 81 to 312 in pure premium and from 1,546 to 1,706 in claim size. A dashed line of slope 0.7 through the centre shows what a single Tweedie model with p = 1.7 assumes; the points lie along the flat line instead, with a least-squares slope of 0.1.';

function Sizes() {
  const box = { left: 72, top: 48, right: 556, bottom: 300 };
  const sx = log(60, 400, box.left, box.right);
  // The same factor per pixel on both axes, so slopes read as they are.
  const span = Math.log10(400 / 60);
  const ymid = CENTRE.size;
  const ylo = ymid / Math.pow(10, (span * (box.bottom - box.top)) / (box.right - box.left) / 2);
  const yhi = ymid * Math.pow(10, (span * (box.bottom - box.top)) / (box.right - box.left) / 2);
  const sy = log(ylo, yhi, box.bottom, box.top);
  const line = (slope: number, x: number) => CENTRE.size * Math.pow(x / CENTRE.pp, slope);
  const x0 = 60;
  const x1 = 400;
  // The Tweedie line leaves the box at the top; end it there.
  const xTop = CENTRE.pp * Math.pow(yhi / CENTRE.size, 1 / 0.7);
  return (
    <Svg height={360} label={SizesDescription}>
      <Title x={4} y={22}>
        Mean claim size (log scale)
      </Title>
      <YGrid ticks={[1000, 1500, 2000, 3000].filter((t) => t > ylo && t < yhi)} sy={sy} left={box.left} right={box.right} format={thousands} />
      <XGrid ticks={[75, 100, 150, 200, 300]} sx={sx} top={box.top} bottom={box.bottom} format={String} />
      <line x1={sx(x0)} x2={sx(xTop)} y1={sy(line(0.7, x0))} y2={sy(line(0.7, xTop))} stroke={PALETTE[0]} strokeWidth={2} strokeDasharray="6 4" />
      <line x1={sx(x0)} x2={sx(x1)} y1={sy(CENTRE.size)} y2={sy(CENTRE.size)} stroke={color('text')} strokeWidth={1.5} strokeDasharray="2 4" />
      {GROUPS.map(([v, pp, size], i) => (
        <circle key={i} cx={sx(pp)} cy={sy(size)} r={v === 'BonusMalus' ? 6.5 : 4.5} fill={v === 'BonusMalus' ? LOOK : NEUTRAL} opacity={v === 'BonusMalus' ? 1 : 0.8} />
      ))}
      <text x={sx(215)} y={sy(line(0.7, 215)) + 4} textAnchor="end" fontSize={14} fill={PALETTE[0]} dx={-12}>
        single Tweedie, p = 1.7
      </text>
      <text x={sx(380)} y={sy(CENTRE.size) + 22} textAnchor="end" fontSize={14} fill={color('text')}>
        claim size flat
      </text>
      <text x={sx(311.6)} y={sy(1706) - 14} textAnchor="middle" fontSize={14} fontWeight={600} fill={color('text')}>
        bonus-malus 86+
      </text>
      <text x={sx(81) + 10} y={sy(1546) + 20} fontSize={14} fontWeight={600} fill={color('text')}>
        bonus-malus 50–53
      </text>
      <text x={(box.left + box.right) / 2} y={box.bottom + 46} textAnchor="middle" fontSize={14} fill={color('muted')}>
        Capped pure premium per policy-year (log scale)
      </text>
    </Svg>
  );
}

/** Claim frequency relative to the portfolio, by exposure band, and the policy-years in each band. */
const EXPOSURE = [
  { label: '≤ 0.05', rel: 4.15, years: 1338 },
  { label: '0.05–0.1', rel: 1.96, years: 6079 },
  { label: '0.1–0.25', rel: 1.66, years: 17175 },
  { label: '0.25–0.5', rel: 1.31, years: 50826 },
  { label: '0.5–0.75', rel: 1.09, years: 57780 },
  { label: '0.75–0.99', rel: 1.02, years: 53537 },
  { label: '1', rel: 0.74, years: 165600 },
  { label: '> 1', rel: 0.54, years: 1363 },
];

const ExposureDescription =
  'Bars of claim frequency per policy-year relative to the portfolio, by exposure band in years, with the policy-years in each band below. Up to 0.05 years: 4.15 times the average (1,338 policy-years). 0.05 to 0.1: 1.96. 0.1 to 0.25: 1.66. 0.25 to 0.5: 1.31. 0.5 to 0.75: 1.09. 0.75 to 0.99: 1.02. Exactly one year: 0.74 (165,600 policy-years). Above one year: 0.54. A line marks the portfolio average, 1.';

function Exposure() {
  const box = { left: 52, top: 48, right: 568, bottom: 260 };
  const sy = lin(0, 4.5, box.bottom, box.top);
  const step = (box.right - box.left) / EXPOSURE.length;
  const bar = step * 0.64;
  return (
    <Svg height={350} label={ExposureDescription}>
      <Title x={4} y={22}>
        Claim frequency, relative to the portfolio
      </Title>
      <YGrid ticks={[0, 1, 2, 3, 4]} sy={sy} left={box.left} right={box.right} format={(v) => `${v}×`} />
      <line x1={box.left} x2={box.right} y1={sy(1)} y2={sy(1)} stroke={color('text')} strokeWidth={1.5} strokeDasharray="5 4" />
      {EXPOSURE.map((b, i) => {
        const x = box.left + step * i + (step - bar) / 2;
        return (
          <g key={b.label}>
            <rect x={x} y={sy(b.rel)} width={bar} height={box.bottom - sy(b.rel)} rx={3} fill={i === 0 ? LOOK : NEUTRAL} />
            <text x={x + bar / 2} y={b.rel < 1 ? sy(1) - 7 : sy(b.rel) - 7} textAnchor="middle" fontSize={14} fill={color('text')}>
              {b.rel.toFixed(2)}
            </text>
            <text x={x + bar / 2} y={box.bottom + 20} textAnchor="middle" fontSize={13} fill={color('text')}>
              {b.label}
            </text>
            <text x={x + bar / 2} y={box.bottom + 40} textAnchor="middle" fontSize={12} fill={color('muted')}>
              {thousands(b.years)}
            </text>
          </g>
        );
      })}
      <text x={(box.left + box.right) / 2} y={box.bottom + 66} textAnchor="middle" fontSize={14} fill={color('muted')}>
        Exposure (years); below it, policy-years in the band
      </text>
    </Svg>
  );
}

/* large-claim-loading */

const SplitDescription =
  'Two horizontal bars split at the cap of 18,000. Claims: 99.0% are below the cap, 1.0% above it. Claim cost: 66.3% is the part of every claim below the cap, 33.7% is the excess above the cap, marked amber.';

function Split() {
  const left = 120;
  const right = 560;
  const sx = lin(0, 1, left, right);
  const rows = [
    { label: 'Claims', below: 0.99, belowText: 'below the cap: 99.0%', aboveText: '1.0%' },
    { label: 'Claim cost', below: 0.663, belowText: 'up to the cap: 66.3%', aboveText: 'excess: 33.7%' },
  ];
  return (
    <Svg height={150} label={SplitDescription}>
      {rows.map((r, i) => {
        const y = 36 + i * 56;
        return (
          <g key={r.label}>
            <text x={left - 10} y={y} dy="0.35em" textAnchor="end" fontSize={16} fill={color('text')}>
              {r.label}
            </text>
            <rect x={left} y={y - 16} width={sx(r.below) - left} height={32} fill={color('node-bg')} stroke={NEUTRAL} strokeWidth={1.5} />
            <rect x={sx(r.below)} y={y - 16} width={right - sx(r.below)} height={32} fill={LOOK} stroke={NEUTRAL} strokeWidth={1.5} />
            <text x={left + 10} y={y} dy="0.35em" fontSize={15} fill={color('text')}>
              {r.belowText}
            </text>
            <text x={i === 0 ? right - 8 : sx(r.below) + 8} y={y} dy="0.35em" textAnchor={i === 0 ? 'end' : 'start'} fontSize={15} fontWeight={600} fill="#1f2937">
              {i === 0 ? '' : r.aboveText}
            </text>
            {i === 0 && (
              <text x={right} y={y - 24} textAnchor="end" fontSize={14} fill={color('text')}>
                above: {r.aboveText}
              </text>
            )}
          </g>
        );
      })}
      <text x={(left + right) / 2} y={140} textAnchor="middle" fontSize={14} fill={color('muted')}>
        Training claims, split at the cap of 18,000
      </text>
    </Svg>
  );
}

/** Pure premium (claim cost per policy-year) of each fold and the test set. */
const FOLDS = [
  { label: 'Fold 1', raw: 142, capped: 115 },
  { label: 'Fold 2', raw: 197, capped: 118 },
  { label: 'Fold 3', raw: 233, capped: 123 },
  { label: 'Fold 4', raw: 144, capped: 118 },
  { label: 'Fold 5', raw: 173, capped: 116 },
  { label: 'Test', raw: 127, capped: 114 },
];

const FoldsDescription =
  'Dots of pure premium per policy-year in each of five folds and the test set. Uncapped, in amber: 142, 197, 233, 144, 173 and 127. Capped at 18,000, in grey: 115, 118, 123, 118, 116 and 114.';

function Folds() {
  const box = { left: 56, top: 64, right: 568, bottom: 280 };
  const sy = lin(100, 250, box.bottom, box.top);
  const step = (box.right - box.left) / FOLDS.length;
  return (
    <Svg height={326} label={FoldsDescription}>
      <Title x={4} y={22}>
        Pure premium per policy-year
      </Title>
      <g fontSize={15} fill={color('text')}>
        <circle cx={box.left + 8} cy={44} r={7} fill={LOOK} />
        <text x={box.left + 22} y={44} dy="0.35em">
          uncapped
        </text>
        <circle cx={box.left + 128} cy={44} r={7} fill={NEUTRAL} />
        <text x={box.left + 142} y={44} dy="0.35em">
          capped at 18,000
        </text>
      </g>
      <YGrid ticks={[100, 150, 200, 250]} sy={sy} left={box.left} right={box.right} format={String} />
      {FOLDS.map((f, i) => {
        const x = box.left + step * (i + 0.5);
        return (
          <g key={f.label}>
            <line x1={x} x2={x} y1={sy(f.capped)} y2={sy(f.raw)} stroke={color('edge')} strokeWidth={2} />
            <circle cx={x} cy={sy(f.raw)} r={7} fill={LOOK} />
            <circle cx={x} cy={sy(f.capped)} r={7} fill={NEUTRAL} />
            <text x={x + 12} y={sy(f.raw)} dy="0.35em" fontSize={14} fill={color('text')}>
              {f.raw}
            </text>
            <text x={x + 12} y={sy(f.capped)} dy="0.35em" fontSize={14} fill={color('muted')}>
              {f.capped}
            </text>
            <text x={x} y={box.bottom + 24} textAnchor="middle" fontSize={15} fontWeight={f.label === 'Test' ? 600 : 400} fill={color('text')}>
              {f.label}
            </text>
          </g>
        );
      })}
    </Svg>
  );
}

/** Share of training claims above the cap per driver-age band, with exact 95% intervals. */
const LARGE_SHARE = [
  { label: '18–21', share: 0.0226, lo: 0.0132, hi: 0.0359, n: '17 of 753', look: true },
  { label: '22–25', share: 0.006, lo: 0.0024, hi: 0.0124, n: '7 of 1,159' },
  { label: '26–30', share: 0.0112, lo: 0.0069, hi: 0.017, n: '21 of 1,881' },
  { label: '31–40', share: 0.0112, lo: 0.0083, hi: 0.0147, n: '51 of 4,560' },
  { label: '41–50', share: 0.008, lo: 0.0058, hi: 0.0108, n: '42 of 5,269' },
  { label: '51–60', share: 0.0094, lo: 0.0067, hi: 0.0129, n: '39 of 4,127' },
  { label: '61–70', share: 0.0074, lo: 0.004, hi: 0.0123, n: '14 of 1,902' },
  { label: '71–80', share: 0.017, lo: 0.01, hi: 0.0271, n: '17 of 998' },
  { label: '81+', share: 0.0087, lo: 0.0011, hi: 0.0311, n: '2 of 230' },
];
const LARGE_OVERALL = 210 / 20879;

const LargeShareDescription =
  'Dots with 95% intervals: the share of training claims above the cap of 18,000 in each driver-age band, against a dotted line at the overall share of 1.0%. 18 to 21, in amber: 2.3% (17 of 753 claims), interval 1.3% to 3.6%. The other bands lie between 0.6% and 1.7%, and every interval but the youngest band\'s contains the overall share.';

function LargeShare() {
  const box = { left: 56, top: 40, right: 568, bottom: 264 };
  const sy = lin(0, 0.04, box.bottom, box.top);
  const step = (box.right - box.left) / LARGE_SHARE.length;
  return (
    <Svg height={326} label={LargeShareDescription}>
      <Title x={4} y={22}>
        Share of claims above the cap
      </Title>
      <YGrid ticks={[0, 0.01, 0.02, 0.03, 0.04]} sy={sy} left={box.left} right={box.right} format={(v) => pct(v, 0)} />
      <line x1={box.left} x2={box.right} y1={sy(LARGE_OVERALL)} y2={sy(LARGE_OVERALL)} stroke={color('text')} strokeWidth={1.5} strokeDasharray="5 4" />
      {LARGE_SHARE.map((b, i) => {
        const x = box.left + step * (i + 0.5);
        const fill = b.look ? LOOK : NEUTRAL;
        return (
          <g key={b.label}>
            <line x1={x} x2={x} y1={sy(b.lo)} y2={sy(b.hi)} stroke={fill} strokeWidth={3} strokeLinecap="round" />
            <circle cx={x} cy={sy(b.share)} r={6.5} fill={fill} />
            <text x={x} y={box.bottom + 22} textAnchor="middle" fontSize={14} fontWeight={b.look ? 600 : 400} fill={color('text')}>
              {b.label}
            </text>
          </g>
        );
      })}
      <text x={(box.left + box.right) / 2} y={box.bottom + 50} textAnchor="middle" fontSize={14} fill={color('muted')}>
        Driver age band · dotted: all claims, 1.0%
      </text>
    </Svg>
  );
}

const LoadingDescription =
  'Three values of the large-claim loading on a scale from 1.0 to 1.9. Estimated on the training policies: 1.51, with a 95% bootstrap interval from 1.28 to 1.80. Without the single largest training excess: 1.39. What the test set would have needed: 1.12.';

function Loading() {
  const left = 250;
  const right = 560;
  const top = 16;
  const row = 44;
  const rows = [
    { label: 'Training policies', v: 1.508, lo: 1.28, hi: 1.8, look: true },
    { label: 'Without the largest claim', v: 1.386 },
    { label: 'What the test set needed', v: 1.119 },
  ];
  const bottom = top + rows.length * row;
  const sx = lin(1, 1.9, left, right);
  return (
    <Svg height={bottom + 50} label={LoadingDescription}>
      <XGrid ticks={[1, 1.2, 1.4, 1.6, 1.8]} sx={sx} top={top} bottom={bottom} format={(v) => v.toFixed(1)} />
      {rows.map((r, i) => {
        const y = top + i * row + row / 2;
        const fill = r.look ? LOOK : NEUTRAL;
        return (
          <g key={r.label}>
            <text x={left - 12} y={y} dy="0.35em" textAnchor="end" fontSize={16} fill={color('text')}>
              {r.label}
            </text>
            {r.lo !== undefined && <line x1={sx(r.lo)} x2={sx(r.hi!)} y1={y} y2={y} stroke={fill} strokeWidth={3} strokeLinecap="round" />}
            <circle cx={sx(r.v)} cy={y} r={7} fill={fill} />
            <text x={sx(r.v)} y={y - 13} textAnchor="middle" fontSize={14} fill={color('text')}>
              {r.v.toFixed(2)}
            </text>
          </g>
        );
      })}
      <text x={(left + right) / 2} y={bottom + 44} textAnchor="middle" fontSize={14} fill={color('muted')}>
        Large-claim loading ℓ
      </text>
    </Svg>
  );
}

/* tweedie-glm-vs-xgboost */

/** Per held-out fold, D² of a model minus D² of the Tweedie GLM, in percentage points. */
const GAINS: { model: Model; mean: number; folds: number[] }[] = [
  { model: 'glmfs', mean: -0.24, folds: [-0.31, -0.14, -0.39, -0.17, -0.22] },
  { model: 'xgb', mean: 0.27, folds: [0.14, 0.46, 0.26, 0.27, 0.23] },
  { model: 'xgbfs', mean: 0.44, folds: [0.27, 0.58, 0.57, 0.21, 0.58] },
  { model: 'tabicl', mean: -1.16, folds: [-1.19, -0.61, -0.92, -1.85, -1.26] },
];

const GainsDescription =
  'For four models, the gain in D² over the Tweedie GLM in percentage points: a bar for the mean over five folds and a dot per fold. Poisson × Gamma GLM: mean −0.24, all folds below zero. Tweedie XGBoost: +0.27, all folds above zero. Poisson × Gamma XGBoost: +0.44, folds from +0.21 to +0.58. TabICL: −1.16, folds from −1.85 to −0.61.';

function Gains() {
  const left = 214;
  const right = 560;
  const top = 12;
  const row = 46;
  const bottom = top + GAINS.length * row;
  const sx = lin(-2, 0.8, left, right);
  return (
    <Svg height={bottom + 54} label={GainsDescription}>
      <XGrid ticks={[-2, -1.5, -1, -0.5, 0, 0.5]} sx={sx} top={top} bottom={bottom} format={(v) => (v === 0 ? '0' : signed(v, 1))} />
      <line x1={sx(0)} x2={sx(0)} y1={top} y2={bottom} stroke={color('text')} strokeWidth={1.5} />
      {GAINS.map((g, i) => {
        const y = top + i * row + row / 2;
        const stroke = MODEL[g.model].stroke;
        const a = sx(Math.min(0, g.mean));
        const b = sx(Math.max(0, g.mean));
        return (
          <g key={g.model}>
            <text x={left - 12} y={y} dy="0.35em" textAnchor="end" fontSize={15} fontWeight={g.model === 'xgbfs' ? 600 : 400} fill={color('text')}>
              {MODEL[g.model].label}
            </text>
            <rect x={a} y={y - 13} width={b - a} height={26} rx={3} fill={stroke} fillOpacity={0.35} />
            {g.folds.map((f, k) => (
              <circle key={k} cx={sx(f)} cy={y} r={5} fill={stroke} stroke={color('surface')} strokeWidth={1} />
            ))}
          </g>
        );
      })}
      <text x={(left + right) / 2} y={bottom + 46} textAnchor="middle" fontSize={14} fill={color('muted')}>
        D² minus the Tweedie GLM's, percentage points
      </text>
    </Svg>
  );
}

/** Exposure-weighted mean charged and observed capped premium per decile of the prediction, test set. */
const DECILES = [
  [44, 31],
  [59, 52],
  [68, 66],
  [76, 68],
  [85, 84],
  [96, 81],
  [110, 111],
  [130, 142],
  [168, 174],
  [317, 328],
];

const CalibrationDescription =
  'Ten points, one per decile of equal exposure in the test set, of the observed capped claim cost per policy-year against the premium charged, both on log scales, with the diagonal where the two are equal. From the cheapest decile, charged 44 and observed 31, to the dearest, charged 317 and observed 328. The points rise with the diagonal and lie close to it, except the cheapest, which lies below.';

function Calibration() {
  const box = { left: 64, top: 30, right: 556, bottom: 330 };
  const sx = log(25, 400, box.left, box.right);
  const sy = log(25, 400, box.bottom, box.top);
  const ticks = [25, 50, 100, 200, 400];
  return (
    <Svg height={392} label={CalibrationDescription}>
      <Title x={4} y={18}>
        Observed per policy-year
      </Title>
      <YGrid ticks={ticks} sy={sy} left={box.left} right={box.right} format={String} />
      <XGrid ticks={ticks} sx={sx} top={box.top} bottom={box.bottom} format={String} />
      <line x1={sx(25)} y1={sy(25)} x2={sx(400)} y2={sy(400)} stroke={color('text')} strokeWidth={1.5} strokeDasharray="5 4" />
      <path d={DECILES.map(([c, o], i) => `${i ? 'L' : 'M'}${sx(c)},${sy(o)}`).join(' ')} fill="none" stroke={MODEL.xgbfs.stroke} strokeWidth={2} />
      {DECILES.map(([c, o], i) => (
        <circle key={i} cx={sx(c)} cy={sy(o)} r={6} fill={MODEL.xgbfs.stroke} stroke={color('surface')} strokeWidth={1.5} />
      ))}
      <text x={sx(44) + 10} y={sy(31) + 4} fontSize={14} fill={color('text')}>
        charged 44, claimed 31
      </text>
      <text x={sx(317) - 10} y={sy(328) - 12} textAnchor="end" fontSize={14} fill={color('text')}>
        charged 317, claimed 328
      </text>
      <text x={(box.left + box.right) / 2} y={box.bottom + 46} textAnchor="middle" fontSize={14} fill={color('muted')}>
        Charged per policy-year (capped premium, log scale)
      </text>
    </Svg>
  );
}

/** Partial dependence of the final model, relative to the average premium. */
const BM_PD = [
  [50, 0.68],
  [51, 0.718],
  [54, 0.932],
  [57, 1.049],
  [60, 1.49],
  [64, 1.787],
  [69, 1.79],
  [76, 1.886],
  [80, 1.985],
  [86, 2.009],
  [95, 2.229],
  [106, 4.559],
];
const AGE_PD = [
  [20, 1.141],
  [25, 0.752],
  [28, 0.746],
  [30, 0.75],
  [31, 0.761],
  [33, 0.805],
  [35, 0.842],
  [36, 0.88],
  [38, 0.903],
  [39, 0.916],
  [41, 1.06],
  [43, 1.085],
  [44, 1.196],
  [46, 1.205],
  [48, 1.237],
  [49, 1.242],
  [51, 1.24],
  [53, 1.241],
  [54, 1.189],
  [56, 1.165],
  [59, 1.14],
  [62, 1.159],
  [66, 1.163],
  [71, 1.193],
  [80, 1.305],
];

const RelativitiesDescription =
  'Two line charts of the final model\'s premium relative to the average, with a dotted line at 1. Left, bonus-malus from 50 to 106: the relativity rises from 0.68 to 4.56, a factor of 6.7, with a jump between 95 and 106. Right, driver age from 20 to 80 on its own scale: 1.14 at 20, a minimum of 0.75 near 28, a second peak of 1.24 near 49, and 1.30 at 80.';

function Relativities() {
  const top = 48;
  const bottom = 270;
  const panels = [
    { title: 'Bonus-malus', data: BM_PD, x: [50, 106], xt: [50, 70, 90, 106], y: [0, 5], yt: [0, 1, 2, 3, 4, 5], left: 44, right: 270 },
    { title: 'Driver age', data: AGE_PD, x: [20, 80], xt: [20, 40, 60, 80], y: [0.6, 1.4], yt: [0.6, 0.8, 1, 1.2, 1.4], left: 340, right: 568 },
  ];
  return (
    <Svg height={326} label={RelativitiesDescription}>
      {panels.map((p) => {
        const sx = lin(p.x[0], p.x[1], p.left, p.right);
        const sy = lin(p.y[0], p.y[1], bottom, top);
        return (
          <g key={p.title}>
            <Title x={(p.left + p.right) / 2} y={22} anchor="middle">
              {p.title}
            </Title>
            <YGrid ticks={p.yt} sy={sy} left={p.left} right={p.right} format={(v) => v.toFixed(p.y[1] > 2 ? 0 : 1)} />
            <XGrid ticks={p.xt} sx={sx} top={bottom} bottom={bottom} format={String} />
            <line x1={p.left} x2={p.right} y1={sy(1)} y2={sy(1)} stroke={color('text')} strokeWidth={1.5} strokeDasharray="5 4" />
            <path d={p.data.map(([x, y], i) => `${i ? 'L' : 'M'}${sx(x)},${sy(y)}`).join(' ')} fill="none" stroke={MODEL.xgbfs.stroke} strokeWidth={3} strokeLinejoin="round" />
          </g>
        );
      })}
      <text x={W / 2} y={318} textAnchor="middle" fontSize={14} fill={color('muted')}>
        Premium relative to the average premium (partial dependence)
      </text>
    </Svg>
  );
}

/** Held-out D² (%) against fitting policies, mean over folds; the GLM from 30,000 policies. */
const SIZES = [10000, 30000, 100000, 427906];
const DATA_SIZE: { model: Model; d2: (number | null)[] }[] = [
  { model: 'glm', d2: [null, 3.2, 3.9, 4.1] },
  { model: 'xgbfs', d2: [3.2, 3.8, 4.3, 4.6] },
];

const DataSizeDescription =
  'Held-out D² in percent against the number of fitting policies on a log scale, mean over five folds. Poisson × Gamma XGBoost: 3.2% at 10,000 policies, 3.8% at 30,000, 4.3% at 100,000 and 4.6% at all 427,906. Tweedie GLM, from 30,000 policies: 3.2%, 3.9% and 4.1%. TabICL, a single point at its context of 10,000 policies: 2.9%.';

function DataSize() {
  const box = { left: 52, top: 40, right: 540, bottom: 280 };
  const sx = log(8000, 500000, box.left, box.right);
  const sy = lin(2, 5, box.bottom, box.top);
  const line = (d2: (number | null)[]) =>
    d2
      .map((v, i) => (v === null ? null : `${sx(SIZES[i])},${sy(v)}`))
      .filter(Boolean)
      .map((p, i) => `${i ? 'L' : 'M'}${p}`)
      .join(' ');
  return (
    <Svg height={380} label={DataSizeDescription}>
      <Title x={4} y={20}>
        Held-out D² (%)
      </Title>
      <YGrid ticks={[2, 3, 4, 5]} sy={sy} left={box.left} right={box.right} format={String} />
      <XGrid ticks={SIZES} sx={sx} top={box.bottom} bottom={box.bottom} format={(v) => (v > 400000 ? 'all 427,906' : thousands(v))} />
      {DATA_SIZE.map((s) => (
        <g key={s.model}>
          <path d={line(s.d2)} fill="none" stroke={MODEL[s.model].stroke} strokeWidth={3} strokeLinejoin="round" />
          {s.d2.map((v, i) => (v === null ? null : <circle key={i} cx={sx(SIZES[i])} cy={sy(v)} r={5} fill={MODEL[s.model].stroke} />))}
        </g>
      ))}
      <rect x={sx(10000) - 7} y={sy(2.9) - 7} width={14} height={14} transform={`rotate(45 ${sx(10000)} ${sy(2.9)})`} fill={MODEL.tabicl.stroke} />
      <g fontSize={15} fill={color('text')}>
        {([
          { m: 'xgbfs', x: 0 },
          { m: 'glm', x: 248 },
          { m: 'tabicl', x: 396 },
        ] as { m: Model; x: number }[]).map(({ m, x }) => (
          <g key={m}>
            <line x1={box.left + x} x2={box.left + x + 22} y1={box.bottom + 56} y2={box.bottom + 56} stroke={MODEL[m].stroke} strokeWidth={m === 'tabicl' ? 10 : 3} />
            <text x={box.left + x + 30} y={box.bottom + 56} dy="0.35em">
              {m === 'tabicl' ? 'TabICL' : MODEL[m].label}
            </text>
          </g>
        ))}
      </g>
      <text x={(box.left + box.right) / 2} y={box.bottom + 90} textAnchor="middle" fontSize={14} fill={color('muted')}>
        Fitting policies (log scale)
      </text>
    </Svg>
  );
}

/* reports-that-cant-disagree */

const PipelineDescription =
  'A diagram in four columns. Config holds every parameter. Snakemake rules, from download through cleaning, the split and cap, the model fits per fold, the benchmark and the final model, write data layers and small result files. Notebooks only read the result files and render to reports. Checks guard two arrows: a read-only check and a check for hand-typed numbers before every render, and a pre-push hook that re-renders and refuses the push if the reports changed.';

function Pipeline() {
  const arrow = 'pricing-pipeline-arrow';
  const box = (x: number, y: number, w: number, h: number, title: string, lines: string[], fill = color('node-bg')) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={9} fill={fill} stroke={NEUTRAL} strokeWidth={2} />
      <text x={x + w / 2} y={y + 24} textAnchor="middle" fontSize={16} fontWeight={600} fill={color('text')}>
        {title}
      </text>
      {lines.map((l, i) => (
        <text key={l} x={x + w / 2} y={y + 48 + i * 20} textAnchor="middle" fontSize={13} fill={color('muted')}>
          {l}
        </text>
      ))}
    </g>
  );
  const tag = (x: number, y: number, text: string) => (
    <g>
      <rect x={x - 62} y={y - 13} width={124} height={26} rx={13} fill={LOOK} />
      <text x={x} y={y} dy="0.35em" textAnchor="middle" fontSize={13} fontWeight={600} fill="#1f2937">
        {text}
      </text>
    </g>
  );
  const edge = (x1: number, y1: number, x2: number, y2: number) => (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={NEUTRAL} strokeWidth={2} markerEnd={`url(#${arrow})`} />
  );
  return (
    <Svg height={350} label={PipelineDescription}>
      <defs>
        <ArrowMarker id={arrow} />
      </defs>
      {box(8, 20, 120, 110, 'Config', ['caps, seed,', 'cap quantile,', 'hyperparameters'])}
      {box(8, 160, 120, 170, 'Rules', ['download', 'eda · silver', 'gold · fit_fold', 'benchmark', 'final_model'], color('added-bg'))}
      {box(170, 160, 120, 170, 'Results', ['stats.json', 'small tables', 'per topic'])}
      {box(330, 160, 112, 170, 'Notebooks', ['read results', 'draw, explain', 'compute nothing'])}
      {box(466, 160, 106, 170, 'Reports', ['HTML, PDF,', 'pipeline graph,', 'in git'])}
      {edge(68, 130, 68, 156)}
      {edge(128, 245, 166, 245)}
      {edge(290, 245, 326, 245)}
      {edge(442, 245, 462, 245)}
      {tag(386, 112, 'read-only check')}
      {tag(386, 76, 'no typed numbers')}
      <line x1={386} y1={125} x2={386} y2={156} stroke={LOOK} strokeWidth={2} />
      {tag(519, 112, 'pre-push render')}
      <line x1={519} y1={125} x2={519} y2={156} stroke={LOOK} strokeWidth={2} />
    </Svg>
  );
}

/**
 * `width` caps the figure on wide screens, about its own size, so its type
 * doesn't grow past the post's body text.
 */
export const FIGURES = {
  claimpath: { component: ClaimPath, description: ClaimPathDescription, width: 600 },
  exposure: { component: Exposure, description: ExposureDescription, width: 600 },
  counts: { component: Counts, description: CountsDescription, width: 600 },
  sizes: { component: Sizes, description: SizesDescription, width: 600 },
  split: { component: Split, description: SplitDescription, width: 600 },
  folds: { component: Folds, description: FoldsDescription, width: 600 },
  largeshare: { component: LargeShare, description: LargeShareDescription, width: 600 },
  loading: { component: Loading, description: LoadingDescription, width: 600 },
  gains: { component: Gains, description: GainsDescription, width: 600 },
  calibration: { component: Calibration, description: CalibrationDescription, width: 560 },
  relativities: { component: Relativities, description: RelativitiesDescription, width: 600 },
  datasize: { component: DataSize, description: DataSizeDescription, width: 600 },
  pipeline: { component: Pipeline, description: PipelineDescription, width: 600 },
} satisfies Record<string, { component: ComponentType; description: string; width: number }>;

export type FigureName = keyof typeof FIGURES;
