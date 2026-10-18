/**
 * The figures of workflow-vs-agent:
 *
 * - default: the post's recommendation. Request types, most common first, the
 *   long tail in the agent's colour; a type is in the workflow's only once it
 *   is common and the experts reject the agent's drafts, or its action can't
 *   be undone. The legend says what each design is: who decides each step.
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
import { color, PALETTE, Expert, Grade, Person, Reply, type Point } from '../remotion/shared';
import { Tag } from './map-parts';

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

const STATES = ['Verified, no flags', 'Flagged', 'Closed'];
const INTENTS = ['Account locked', 'Missing payment', 'Change of details'];

/** The cells the tree decided, by intent and state: both for a locked account. Every other cell is a rule nobody has written. */
const DECIDED: Record<string, { text: string; escalate?: boolean; alex?: boolean }> = {
  '0,0': { text: 'Unlock steps', alex: true },
  '0,1': { text: 'Escalate', escalate: true },
};

const GridDescription =
  'A grid of three intents, Account locked, Missing payment and Change of details, against three account states, Verified with no flags, Flagged and Closed. Two cells are decided, both for Account locked: verified with no flags it gets the unlock steps, which is Alex’s cell, and flagged it is escalated. The other seven cells are question marks.';

interface GridLayout {
  width: number;
  height: number;
  size: number;
  cell: { w: number; h: number };
  /** Centres of the columns, and of each row's cells. */
  cols: number[];
  rows: number[];
  /** The baseline of the column headers, and their text if it differs from STATES. */
  head: number;
  states?: string[];
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
  // The full first header doesn't fit a phone's column.
  states: ['Verified', 'Flagged', 'Closed'],
  intents: [114, 238, 362].map((y) => ({ x: 4, y: y - 50, anchor: 'start' })),
};

function GridSvg({ layout, className }: { layout: GridLayout; className: string }) {
  const { cell, size } = layout;
  return (
    <Svg viewBox={`0 0 ${layout.width} ${layout.height}`} label={GridDescription} className={className}>
      {(layout.states ?? STATES).map((state, j) => (
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

const DefaultDescription =
  'Request types as bars, most common first, with a long tail of rare ones. The legend: in a workflow, code decides the next step; in an agent, the LLM does; and the agent is the default. Under each bar is the experts’ grade of the agent’s drafts. The two most common types are rejected, so they are in the workflow; a rare type whose action can’t be undone is in the workflow too, under a lock. Every other type, a common one that is approved and rare ones whether approved or not, stays with the agent.';

/** The request types, most common first: the share of tickets, the experts' grade of the agent's drafts, and whether code runs it. */
const TYPES: { share: number; ok: boolean; code?: boolean; irreversible?: boolean }[] = [
  { share: 1, ok: false, code: true },
  { share: 0.64, ok: false, code: true },
  { share: 0.44, ok: true },
  { share: 0.31, ok: true },
  { share: 0.22, ok: false },
  { share: 0.16, ok: true },
  { share: 0.12, ok: true, code: true, irreversible: true },
  { share: 0.085, ok: true },
  { share: 0.06, ok: false },
  { share: 0.045, ok: true },
];

interface DefaultLayout {
  width: number;
  height: number;
  size: number;
  /** Where each design's legend entry starts: swatch, name, and what it is below. */
  legend: { workflow: Point; agent: Point };
  plot: { left: number; right: number; top: number; bottom: number };
  bar: number;
}

const DEFAULT_WIDE: DefaultLayout = {
  width: 640,
  height: 400,
  size: 18,
  legend: { workflow: { x: 40, y: 24 }, agent: { x: 340, y: 24 } },
  plot: { left: 60, right: 636, top: 140, bottom: 316 },
  bar: 40,
};

// About 4:5 once framed, so it also fills a LinkedIn image.
const DEFAULT_TALL: DefaultLayout = {
  width: 440,
  height: 560,
  size: 19,
  legend: { workflow: { x: 4, y: 24 }, agent: { x: 4, y: 90 } },
  plot: { left: 60, right: 436, top: 182, bottom: 466 },
  bar: 28,
};

const routeColor = (code?: boolean) => color(code ? 'node-border' : 'added');

/** A padlock: what can't be undone. */
const Lock = ({ x, y }: Point) => (
  <g transform={`translate(${x} ${y})`}>
    <path d="M-6,-2 v-5 a6,6 0 0 1 12,0 v5" fill="none" stroke={color('text')} strokeWidth={2.5} />
    <rect x={-9} y={-2} width={18} height={14} rx={3} fill={color('text')} />
  </g>
);

function LegendEntry({ at, code, name, what, size, tag }: { at: Point; code?: boolean; name: string; what: string; size: number; tag?: string }) {
  const nameEnd = at.x + size * 1.5 + name.length * (size + 2) * 0.62;
  const tagWidth = tag ? tag.length * (size - 4) * 0.59 + 44 : 0;
  return (
    <g>
      <rect x={at.x} y={at.y - size * 0.8} width={size} height={size} rx={4} fill={routeColor(code)} />
      <Text x={at.x + size * 1.5} y={at.y} anchor="start" size={size + 2} weight={700}>
        {name}
      </Text>
      {tag && <Tag x={nameEnd + 12 + tagWidth / 2} y={at.y - size * 0.35} text={tag} size={size - 4} />}
      <Text x={at.x + size * 1.5} y={at.y + size + 8} anchor="start" size={size} weight={500} muted>
        {what}
      </Text>
    </g>
  );
}

function DefaultSvg({ layout, className }: { layout: DefaultLayout; className: string }) {
  const { plot, size, bar } = layout;
  const slot = (plot.right - plot.left) / TYPES.length;
  const cx = (i: number) => plot.left + slot * (i + 0.5);
  const top = (share: number) => plot.bottom - share * (plot.bottom - plot.top);
  const gradeY = plot.bottom + 24;
  const axis = { stroke: color('edge'), strokeWidth: 2 };
  // The bracket over the common types the agent got wrong.
  const rejected = TYPES.map((t, i) => (t.code && !t.irreversible ? i : -1)).filter((i) => i >= 0);
  const bracket = { x1: cx(rejected[0]) - bar / 2, x2: cx(rejected[rejected.length - 1]) + bar / 2, y: plot.top - 14 };
  const locked = TYPES.findIndex((t) => t.irreversible);
  return (
    <Svg viewBox={`0 0 ${layout.width} ${layout.height}`} label={DefaultDescription} className={className}>
      <LegendEntry at={layout.legend.workflow} code name="Workflow" what="Code decides the next step" size={size} />
      <LegendEntry at={layout.legend.agent} name="Agent" what="The LLM decides the next step" size={size} tag="Default" />

      <line x1={plot.left} x2={plot.right} y1={plot.bottom} y2={plot.bottom} {...axis} />
      <text transform={`translate(${plot.left - 16} ${(plot.top + plot.bottom) / 2}) rotate(-90)`} textAnchor="middle" fontSize={size} fontWeight={600} fill={color('muted')}>
        Tickets
      </text>
      {/* The experts' grades of the agent's drafts, one per request type */}
      <Expert x={plot.left - 30} y={gradeY} scale={0.75} />
      <Text x={plot.right} y={gradeY + 44} anchor="end" size={size} muted>
        Request types, most common first →
      </Text>

      {TYPES.map((t, i) => (
        <g key={i}>
          <rect x={cx(i) - bar / 2} y={top(t.share)} width={bar} height={plot.bottom - top(t.share)} rx={3} fill={routeColor(t.code)} />
          <Grade x={cx(i)} y={gradeY} ok={t.ok} r={10} />
        </g>
      ))}

      <path d={`M${bracket.x1},${bracket.y + 6} V${bracket.y} H${bracket.x2} V${bracket.y + 6}`} fill="none" stroke={color('text')} strokeWidth={2} />
      <Text x={bracket.x1} y={bracket.y - 10} anchor="start" size={size}>
        Common, rejected
      </Text>

      <Lock x={cx(locked)} y={top(TYPES[locked].share) - 22} />
      <Text x={cx(locked)} y={top(TYPES[locked].share) - 42} size={size}>
        Can’t undo
      </Text>
    </Svg>
  );
}

function AgentByDefault() {
  return (
    <>
      <DefaultSvg layout={DEFAULT_WIDE} className="figure-wide" />
      <DefaultSvg layout={DEFAULT_TALL} className="figure-tall" />
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
  default: { component: AgentByDefault, description: DefaultDescription, width: 600 },
  grid: { component: IntentGrid, description: GridDescription, width: 560 },
  coverage: { component: Coverage, description: CoverageDescription, width: 500 },
} satisfies Record<string, { component: ComponentType; description: string; width: number }>;

export type FigureName = keyof typeof FIGURES;
