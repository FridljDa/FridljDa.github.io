/**
 * The figures of workflow-vs-agent:
 *
 * - grid: three intents against three account states, the mapping a workflow
 *   has to spell out. The tree decided two cells, both for a locked account,
 *   Alex's among them; the other seven are question marks.
 * - coverage: a schematic, not measured: the share of tickets the tree
 *   answers, branch after branch. Each branch answers fewer new tickets than
 *   the last, so the share flattens below all of them.
 *
 * Drawn in the style of the post's map (DecisionMap.tsx) and the figures of
 * first-level-support-automation (palette, icons, short labels); the prose
 * explains them. Each has a wide layout and one for phones, and
 * DecisionFigure.astro shows the one that fits. Static: rendered on the
 * server, no JavaScript.
 */
import type { ComponentType, ReactNode } from 'react';
import { color, PALETTE, Person, Reply, type Point } from '../remotion/shared';

/** Alex Carter, the post's running example, in the color customers get in the shadow loop. */
const ALEX = PALETTE[0];

interface Label extends Point {
  anchor?: 'start' | 'middle' | 'end';
}

function Svg({ viewBox, label, className, children }: { viewBox: string; label: string; className: string; children: ReactNode }) {
  return (
    <svg className={className} viewBox={viewBox} role="img" aria-label={label} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      {children}
    </svg>
  );
}

const Text = ({ x, y, anchor = 'middle', size, weight = 600, muted, children }: Label & { size: number; weight?: number; muted?: boolean; children: ReactNode }) => (
  <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={weight} fill={color(muted ? 'muted' : 'text')}>
    {children}
  </text>
);

const STATES = ['No flags', 'Flagged', 'Closed'];
const INTENTS = ['Account locked', 'Missing payment', 'Change of details'];

/** The cells the tree decided, by intent and state: both for a locked account. Every other cell is a rule nobody has written. */
const DECIDED: Record<string, { text: string; escalate?: boolean; alex?: boolean }> = {
  '0,0': { text: 'Unlock steps', alex: true },
  '0,1': { text: 'Escalate', escalate: true },
};

const GridDescription =
  'A grid of three intents, Account locked, Missing payment and Change of details, against three account states, No flags, Flagged and Closed. Two cells are decided, both for Account locked: with no flags it gets the unlock steps, which is Alex’s cell, and flagged it is escalated. The other seven cells are question marks.';

interface GridLayout {
  width: number;
  height: number;
  size: number;
  cell: { w: number; h: number };
  /** Centres of the columns, and of each row's cells. */
  cols: number[];
  rows: number[];
  /** The baseline of the column headers. */
  head: number;
  /** Each row's intent: left of its cells on wide screens, above them on phones. */
  intents: Label[];
}

const GRID_WIDE: GridLayout = {
  width: 644,
  height: 312,
  size: 19,
  cell: { w: 140, h: 80 },
  cols: [266, 418, 570],
  rows: [84, 176, 268],
  head: 26,
  intents: [84, 176, 268].map((y) => ({ x: 4, y: y + 7, anchor: 'start' })),
};

const GRID_TALL: GridLayout = {
  width: 444,
  height: 404,
  size: 20,
  cell: { w: 136, h: 76 },
  cols: [72, 222, 372],
  rows: [114, 238, 362],
  head: 26,
  intents: [114, 238, 362].map((y) => ({ x: 4, y: y - 50, anchor: 'start' })),
};

function GridSvg({ layout, className }: { layout: GridLayout; className: string }) {
  const { cell, size } = layout;
  return (
    <Svg viewBox={`0 0 ${layout.width} ${layout.height}`} label={GridDescription} className={className}>
      {STATES.map((state, j) => (
        <Text key={state} x={layout.cols[j]} y={layout.head} size={size} muted>
          {state}
        </Text>
      ))}
      {INTENTS.map((intent, i) => (
        <g key={intent}>
          <Text {...layout.intents[i]} size={size}>
            {intent}
          </Text>
          {layout.cols.map((cx, j) => {
            const cy = layout.rows[i];
            const decided = DECIDED[`${i},${j}`];
            const box = { x: cx - cell.w / 2, y: cy - cell.h / 2, width: cell.w, height: cell.h, rx: 10 };
            if (!decided) {
              // A gap in the rules, drawn like the intent DAG's "Other".
              return (
                <g key={j}>
                  <rect {...box} fill={color('other-bg')} stroke={color('other')} strokeWidth={2} strokeDasharray="5 4" />
                  <text x={cx} y={cy} dy="0.35em" textAnchor="middle" fontSize={34} fontWeight={700} fill={color('other')}>
                    ?
                  </text>
                </g>
              );
            }
            const stroke = decided.alex ? ALEX : color('node-border');
            return (
              <g key={j}>
                <rect {...box} fill={color('node-bg')} stroke={stroke} strokeWidth={decided.alex ? 3 : 2} />
                {decided.escalate ? (
                  <Person x={cx} y={cy - 13} scale={0.8} fill={color('text')} />
                ) : (
                  <Reply x={cx} y={cy - 13} scale={1.1} stroke={stroke} />
                )}
                <text x={cx} y={cy + 26} textAnchor="middle" fontSize={size - 1} fontWeight={decided.alex ? 650 : 500} fill={color('text')}>
                  {decided.text}
                </text>
              </g>
            );
          })}
        </g>
      ))}
    </Svg>
  );
}

function IntentGrid() {
  return (
    <>
      <GridSvg layout={GRID_WIDE} className="figure-wide" />
      <GridSvg layout={GRID_TALL} className="figure-tall" />
    </>
  );
}

const CoverageDescription =
  'Schematic, not measured: the share of tickets the tree answers against the number of branches written. Each branch answers fewer new tickets than the last, so the share flattens below all tickets.';

interface CoverageLayout {
  width: number;
  height: number;
  size: number;
  plot: { left: number; right: number; top: number; bottom: number };
}

const COVERAGE_WIDE: CoverageLayout = { width: 560, height: 290, size: 17, plot: { left: 44, right: 470, top: 30, bottom: 246 } };
const COVERAGE_TALL: CoverageLayout = { width: 400, height: 300, size: 19, plot: { left: 44, right: 316, top: 30, bottom: 248 } };

/** Branches written, and the share the tree answers after the k-th. */
const BRANCHES = 12;
const CEILING = 0.8;
const KEEP = 0.72;
const answered = (k: number) => CEILING * (1 - KEEP ** k);

function CoverageSvg({ layout, className }: { layout: CoverageLayout; className: string }) {
  const { plot, size } = layout;
  const x = (k: number) => plot.left + (k / BRANCHES) * (plot.right - plot.left);
  const y = (share: number) => plot.bottom - share * (plot.bottom - plot.top);
  const points = Array.from({ length: BRANCHES + 1 }, (_, k) => ({ x: x(k), y: y(answered(k)) }));
  const last = points[BRANCHES];
  const axis = { stroke: color('edge'), strokeWidth: 2 };
  return (
    <Svg viewBox={`0 0 ${layout.width} ${layout.height}`} label={CoverageDescription} className={className}>
      {/* What no branch answers yet, in the grid's colour for a gap */}
      <rect x={plot.left} y={y(1)} width={plot.right - plot.left} height={last.y - y(1)} fill={color('other-bg')} />
      <line x1={plot.left} x2={plot.right} y1={y(1)} y2={y(1)} stroke={color('other')} strokeWidth={2} strokeDasharray="5 4" />
      <Text x={plot.right + 8} y={y(1)} anchor="start" size={size} muted>
        All
      </Text>
      <text x={plot.right - 10} y={(y(1) + last.y) / 2} dy="0.35em" textAnchor="end" fontSize={size} fontWeight={600} fill={color('other')}>
        Unanswered
      </text>

      <line x1={plot.left} x2={plot.right} y1={plot.bottom} y2={plot.bottom} {...axis} />
      <line x1={plot.left} x2={plot.left} y1={plot.bottom} y2={plot.top - 10} {...axis} />
      <text transform={`translate(${plot.left - 16} ${(plot.top + plot.bottom) / 2}) rotate(-90)`} textAnchor="middle" fontSize={size} fontWeight={600} fill={color('muted')}>
        Tickets answered
      </text>
      <Text x={plot.right} y={plot.bottom + size + 8} anchor="end" size={size} muted>
        Branches written →
      </Text>

      <polyline points={points.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={color('node-border')} strokeWidth={2.5} strokeLinejoin="round" />
      {points.slice(1).map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4.5} fill={color('node-border')} stroke={color('surface')} strokeWidth={2} />
      ))}
    </Svg>
  );
}

function Coverage() {
  return (
    <>
      <CoverageSvg layout={COVERAGE_WIDE} className="figure-wide" />
      <CoverageSvg layout={COVERAGE_TALL} className="figure-tall" />
    </>
  );
}

/**
 * `width` caps the wide layout on wide screens, about its own size, so its
 * type stays near the post's rather than scaling up with the column.
 */
export const FIGURES = {
  grid: { component: IntentGrid, description: GridDescription, width: 560 },
  coverage: { component: Coverage, description: CoverageDescription, width: 500 },
} satisfies Record<string, { component: ComponentType; description: string; width: number }>;

export type FigureName = keyof typeof FIGURES;
