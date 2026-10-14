/**
 * The figures of workflow-vs-agent, each following the post's running example
 * (Alex Carter's locked account):
 *
 * - grid: three intents against three account states, the mapping a workflow
 *   has to spell out. The tree decided two cells, both for a locked account,
 *   Alex's among them; the other seven are question marks.
 * - unlock-tool: the flag check inside the unlock tool, called by the
 *   workflow or by the agent, with Alex's route from the agent to the unlock
 *   steps.
 *
 * Drawn in the style of the post's map (DecisionMap.tsx) and the figures of
 * first-level-support-automation (palette, icons, short labels); the prose
 * explains them. Each has a wide layout and one for phones, and
 * DecisionFigure.astro shows the one that fits. Static: rendered on the
 * server, no JavaScript.
 */
import type { ComponentType, ReactNode } from 'react';
import { color, PALETTE, Agent, Grade, Person, Reply, type Point } from '../remotion/shared';
import { DecisionTree, Guard } from './DecisionMap';

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
const INTENTS = ['Locked account', 'Missing payment', 'Change of details'];

/** The cells the tree decided, by intent and state: both for a locked account. Every other cell is a rule nobody has written. */
const DECIDED: Record<string, { text: string; escalate?: boolean; alex?: boolean }> = {
  '0,0': { text: 'Unlock steps', alex: true },
  '0,1': { text: 'Escalate', escalate: true },
};

const GridDescription =
  'A grid of three intents, Locked account, Missing payment and Change of details, against three account states, No flags, Flagged and Closed. Two cells are decided, both for a locked account: with no flags it gets the unlock steps, which is Alex’s cell, and flagged it is escalated. The other seven cells are question marks.';

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
                {decided.alex && <Person x={cx + cell.w / 2 - 17} y={cy - cell.h / 2 + 19} scale={0.6} fill={ALEX} />}
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

const UnlockToolDescription =
  'The unlock tool, called by the workflow or by the agent. Inside it there is one question: is the account flagged? If not, the tool sends the unlock steps; if it is, the tool refuses. Alex’s request comes from the agent, the account isn’t flagged, and Alex gets the unlock steps.';

interface UnlockLayout {
  width: number;
  height: number;
  workflow: Point;
  agent: Point;
  /** Each caller's name, with what runs it under it. */
  names: { workflow: Label; agent: Label };
  /** Each caller's call into the tool, ending on the question; Alex's comes from the agent. */
  calls: { workflow: string; agent: string };
  callLabels: Label[];
  tool: { x: number; y: number; w: number; h: number };
  toolLabel: Label;
  guard: Point;
  question: Point;
  unlock: Point;
  refuse: Point;
  /** From the question to each outcome: "no" is Alex's. */
  answers: { no: string; yes: string };
  answerLabels: { no: Label; yes: Label };
}

const UNLOCK_WIDE: UnlockLayout = {
  width: 610,
  height: 330,
  workflow: { x: 64, y: 84 },
  agent: { x: 64, y: 234 },
  names: { workflow: { x: 64, y: 142 }, agent: { x: 64, y: 292 } },
  calls: {
    workflow: 'M124,84 C210,84 226,138 288,138',
    agent: 'M104,234 C210,234 226,162 288,162',
  },
  callLabels: [
    { x: 184, y: 66 },
    { x: 176, y: 262 },
  ],
  tool: { x: 244, y: 16, w: 358, h: 304 },
  toolLabel: { x: 264, y: 52, anchor: 'start' },
  guard: { x: 590, y: 24 },
  question: { x: 352, y: 150 },
  unlock: { x: 352, y: 270 },
  refuse: { x: 528, y: 270 },
  answers: {
    no: 'M352,188 V240',
    yes: 'M432,150 H516 Q528,150 528,162 V240',
  },
  answerLabels: { no: { x: 364, y: 220, anchor: 'start' }, yes: { x: 480, y: 140 } },
};

const UNLOCK_TALL: UnlockLayout = {
  width: 440,
  height: 488,
  workflow: { x: 90, y: 52 },
  agent: { x: 350, y: 52 },
  names: { workflow: { x: 90, y: 112 }, agent: { x: 350, y: 112 } },
  calls: {
    workflow: 'M150,52 C192,52 198,110 198,274',
    agent: 'M310,52 C248,52 242,110 242,274',
  },
  callLabels: [
    { x: 186, y: 182, anchor: 'end' },
    { x: 254, y: 182, anchor: 'start' },
  ],
  tool: { x: 4, y: 202, w: 432, h: 278 },
  toolLabel: { x: 22, y: 236, anchor: 'start' },
  guard: { x: 420, y: 210 },
  question: { x: 220, y: 312 },
  unlock: { x: 330, y: 432 },
  refuse: { x: 106, y: 432 },
  answers: {
    no: 'M300,312 C330,312 330,350 330,402',
    yes: 'M140,312 C106,312 106,350 106,402',
  },
  answerLabels: { no: { x: 342, y: 366, anchor: 'start' }, yes: { x: 94, y: 366, anchor: 'end' } },
};

function UnlockSvg({ layout, className }: { layout: UnlockLayout; className: string }) {
  const { tool, question, unlock, refuse } = layout;
  const diamond = { w: 80, h: 38 };
  const box = { h: 50, unlock: 170, refuse: 124 };
  const arrow = `unlock-${className}-arrow`;
  const lit = `unlock-${className}-lit`;
  const line = { fill: 'none', stroke: color('node-border'), strokeWidth: 2.5, markerEnd: `url(#${arrow})` };
  const alex = { fill: 'none', stroke: ALEX, strokeWidth: 4, markerEnd: `url(#${lit})` };

  const Outcome = ({ at, w, text, on }: { at: Point; w: number; text: string; on?: boolean }) => (
    <g>
      <rect x={at.x - w / 2} y={at.y - box.h / 2} width={w} height={box.h} rx={10} fill={color('surface')} stroke={on ? ALEX : color('node-border')} strokeWidth={on ? 3 : 2} />
      {on ? <Reply x={at.x - w / 2 + 26} y={at.y} scale={1.1} stroke={ALEX} /> : <Grade ok={false} x={at.x - w / 2 + 26} y={at.y} r={12} />}
      <text x={at.x - w / 2 + 48} y={at.y} dy="0.35em" fontSize={18} fontWeight={on ? 650 : 500} fill={color('text')}>
        {text}
      </text>
    </g>
  );

  return (
    <Svg viewBox={`0 0 ${layout.width} ${layout.height}`} label={UnlockToolDescription} className={className}>
      <defs>
        {[
          { id: arrow, fill: color('node-border') },
          { id: lit, fill: ALEX },
        ].map((m) => (
          <marker key={m.id} id={m.id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill={m.fill} />
          </marker>
        ))}
      </defs>

      {/* The tool, with its one question inside */}
      <rect x={tool.x} y={tool.y} width={tool.w} height={tool.h} rx={16} fill={color('node-bg')} stroke={color('node-border')} strokeWidth={2.5} />
      <Text {...layout.toolLabel} size={19}>
        Unlock tool
      </Text>
      <Text {...layout.toolLabel} y={layout.toolLabel.y + 22} size={16} muted>
        Code
      </Text>
      <Guard {...layout.guard} scale={1.1} />

      {/* The callers: the workflow, and the agent, which Alex's request comes from */}
      <rect x={layout.workflow.x - 56} y={layout.workflow.y - 32} width={112} height={64} rx={11} fill={color('node-bg')} stroke={color('node-border')} strokeWidth={2.5} />
      <g transform={`translate(${layout.workflow.x} ${layout.workflow.y}) scale(0.7)`}>
        <DecisionTree />
      </g>
      <Agent {...layout.agent} scale={1.4} typing={1} />
      {[
        { at: layout.names.workflow, name: 'Workflow', kind: 'Code' },
        { at: layout.names.agent, name: 'Agent', kind: 'LLM' },
      ].map(({ at, name, kind }) => (
        <g key={name}>
          <Text {...at} size={19}>
            {name}
          </Text>
          <Text {...at} y={at.y + 22} size={16} muted>
            {kind}
          </Text>
        </g>
      ))}

      <path d={layout.calls.workflow} {...line} />
      <path d={layout.calls.agent} {...alex} />
      {layout.callLabels.map((l) => (
        <Text key={l.y} {...l} size={16} muted>
          Send unlock
        </Text>
      ))}

      <path d={layout.answers.yes} {...line} />
      <path d={layout.answers.no} {...alex} />
      <Text {...layout.answerLabels.no} size={16} muted>
        no
      </Text>
      <Text {...layout.answerLabels.yes} size={16} muted>
        yes
      </Text>

      <path
        d={`M${question.x},${question.y - diamond.h} L${question.x + diamond.w},${question.y} L${question.x},${question.y + diamond.h} L${question.x - diamond.w},${question.y} Z`}
        fill={color('surface')}
        stroke={ALEX}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <text x={question.x} y={question.y} dy="0.35em" textAnchor="middle" fontSize={17} fontWeight={600} fill={color('text')}>
        Flagged?
      </text>
      <Outcome at={unlock} w={box.unlock} text="Unlock steps" on />
      <Outcome at={refuse} w={box.refuse} text="Refuse" />
    </Svg>
  );
}

function UnlockTool() {
  return (
    <>
      <UnlockSvg layout={UNLOCK_WIDE} className="figure-wide" />
      <UnlockSvg layout={UNLOCK_TALL} className="figure-tall" />
    </>
  );
}

/**
 * `width` caps the wide layout on wide screens, about its own size, so its
 * type stays near the post's rather than scaling up with the column.
 */
export const FIGURES = {
  grid: { component: IntentGrid, description: GridDescription, width: 560 },
  'unlock-tool': { component: UnlockTool, description: UnlockToolDescription, width: 500 },
} satisfies Record<string, { component: ComponentType; description: string; width: number }>;

export type FigureName = keyof typeof FIGURES;
