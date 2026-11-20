/**
 * The figures of one-agent-many-teams:
 *
 * - shapes: the post in one picture, three ways to split an agent among the
 *   same three teams. One subagent per team behind a router, handing off to
 *   each other; one agent team that every request queues behind; one loop
 *   owned by a platform team, with every team plugging into it.
 * - handoff: Alex's message through the subagent design. The router sends it
 *   to Accounts, which hands the card to Cards; the handoff carries only
 *   part of what Alex wrote, so Cards asks for the account number again.
 * - gate: which failing eval cases block a team's change. Its own domain's
 *   cases and the must-not-break set block it; other teams' cases are only
 *   reported to their owners.
 *
 * Drawn in the style of the post's map (TeamMap.tsx) and the figures of
 * workflow-vs-agent (palette, icons, short labels); the prose explains them.
 * Each has a wide layout and one for phones, and TeamFigure.astro shows the
 * one that fits. Static: rendered on the server, no JavaScript.
 */
import type { ComponentType, ReactNode } from 'react';
import { color, PALETTE, Agent, Envelope, Person, Reply, type Point } from '../remotion/shared';
import { Tag, ArrowMarker } from './map-parts';

/** Alex Carter, the running example, in the colour the other posts give customers. */
export const ALEX = PALETTE[0];

/** The three feature teams of Northstar Bank, each in its own colour. */
export const TEAMS = [
  { name: 'Accounts', color: PALETTE[3] },
  { name: 'Cards', color: PALETTE[1] },
  { name: 'Payments', color: PALETTE[2] },
];

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

const Text = ({
  x,
  y,
  anchor = 'middle',
  size,
  weight = 600,
  fill,
  muted,
  children,
}: Label & { size: number; weight?: number; fill?: string; muted?: boolean; children: ReactNode }) => (
  <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={weight} fill={fill ?? color(muted ? 'muted' : 'text')}>
    {children}
  </text>
);

const edge = { fill: 'none', stroke: color('node-border'), strokeWidth: 2.5 } as const;

/** A router: a decision diamond in a box. */
const Router = ({ x, y, w = 100, h = 48 }: Point & { w?: number; h?: number }) => (
  <g>
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={10} fill={color('node-bg')} stroke={color('node-border')} strokeWidth={2.5} />
    <path d={`M${x},${y - 14} L${x + 14},${y} L${x},${y + 14} L${x - 14},${y} Z`} fill={color('surface')} stroke={color('node-border')} strokeWidth={2.5} strokeLinejoin="round" />
  </g>
);

/** A team, never one person: one person in front of two colleagues, as Experts draws the experts. */
const Team = ({ x, y, scale = 1, fill }: Point & { scale?: number; fill: string }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <Person x={-15} y={-6} scale={0.78} fill={fill} opacity={0.75} />
    <Person x={15} y={-6} scale={0.78} fill={fill} opacity={0.75} />
    <Person x={0} y={4} fill={fill} />
  </g>
);

/** The customer's message: an envelope in a circle. */
const Message = ({ x, y, r = 26 }: Point & { r?: number }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={color('node-bg')} stroke={color('node-border')} strokeWidth={2.5} />
    <Envelope x={x} y={y} scale={r / 24} />
  </g>
);

// ---------------------------------------------------------------- shapes

const ShapesDescription =
  'Three ways to split one support agent among three teams, Accounts, Cards and Payments. First, an agent per team: a router sends the message to one of three subagents, which hand off to each other. Second, one team owns all: the three teams queue their requests behind a single agent team, the bottleneck. Third, one loop with many owners: a single agent loop owned by the platform team, with all three teams plugging into it, checked by a shared eval gate.';

const PANEL = { w: 300, h: 350 };
const TITLE = 20;
const NAME = 17;

/** An agent per team: a router, three subagents, handoffs between them. */
function PerTeam({ id }: { id: string }) {
  const xs = [50, 150, 250];
  return (
    <g>
      <Text x={150} y={26} size={TITLE}>
        Agent per team
      </Text>
      <Message x={150} y={66} />
      <path d="M150,92 V102" {...edge} markerEnd={`url(#${id})`} />
      <Router x={150} y={130} />
      {xs.map((x) => (
        <path key={x} d={`M150,154 C150,180 ${x},176 ${x},198`} {...edge} markerEnd={`url(#${id})`} />
      ))}
      {[0, 1].map((i) => (
        <path key={i} d={`M${xs[i] + 38},232 H${xs[i + 1] - 38}`} {...edge} strokeDasharray="5 4" markerEnd={`url(#${id})`} markerStart={`url(#${id})`} />
      ))}
      {TEAMS.map((t, i) => (
        <g key={t.name}>
          <Agent x={xs[i]} y={232} scale={1.25} typing={1} />
          <Text x={xs[i]} y={286} size={NAME} fill={t.color}>
            {t.name}
          </Text>
        </g>
      ))}
      <Tag x={150} y={326} text="Handoffs" size={NAME} />
    </g>
  );
}

/** One team owns all: every team's requests queue behind the agent team. */
function OneTeam({ id }: { id: string }) {
  const xs = [50, 150, 250];
  return (
    <g>
      <Text x={150} y={26} size={TITLE}>
        One team owns all
      </Text>
      {TEAMS.map((t, i) => (
        <g key={t.name}>
          <Team x={xs[i]} y={74} scale={1.1} fill={t.color} />
          <Text x={xs[i]} y={118} size={NAME} fill={t.color}>
            {t.name}
          </Text>
          <path d={`M${xs[i]},128 C${xs[i]},150 150,140 150,156`} {...edge} markerEnd={`url(#${id})`} />
        </g>
      ))}
      {/* The queue: requests waiting for the agent team. */}
      {[166, 182, 198].map((y) => (
        <rect key={y} x={128} y={y} width={44} height={12} rx={3} fill={color('other-bg')} stroke={color('other')} strokeWidth={2} />
      ))}
      <path d="M150,212 V226" {...edge} markerEnd={`url(#${id})`} />
      <rect x={95} y={232} width={110} height={56} rx={10} fill={color('node-bg')} stroke={color('node-border')} strokeWidth={2.5} />
      <Team x={150} y={260} scale={1} fill={color('added')} />
      <Text x={150} y={310} size={NAME}>
        Agent team
      </Text>
      <Tag x={228} y={188} text="Queue" size={NAME - 2} />
    </g>
  );
}

/** One loop, many owners: the teams plug into one agent the platform team owns. */
function OneLoop({ id }: { id: string }) {
  const xs = [50, 150, 250];
  return (
    <g>
      <Text x={150} y={26} size={TITLE}>
        One loop, many owners
      </Text>
      <Agent x={150} y={110} scale={1.6} typing={1} />
      <Text x={150} y={168} size={NAME}>
        Agent loop
      </Text>
      <Text x={150} y={188} size={NAME - 2} muted>
        Platform team
      </Text>
      {TEAMS.map((t, i) => (
        <g key={t.name}>
          {i !== 1 && <path d={`M${xs[i]},224 C${xs[i]},150 ${i === 0 ? 70 : 230},110 ${i === 0 ? 102 : 198},110`} {...edge} markerEnd={`url(#${id})`} />}
          <Team x={xs[i]} y={248} scale={1.1} fill={t.color} />
          <Text x={xs[i]} y={292} size={NAME} fill={t.color}>
            {t.name}
          </Text>
        </g>
      ))}
      {/* The middle team's edge runs up under the labels to the loop. */}
      <path d="M150,226 V200" {...edge} />
      <Tag x={150} y={326} text="Shared evals" size={NAME} />
    </g>
  );
}

const PANELS = [PerTeam, OneTeam, OneLoop];

function ShapesSvg({ tall, className, id }: { tall: boolean; className: string; id: string }) {
  const gap = 30;
  const width = tall ? PANEL.w : PANELS.length * PANEL.w + (PANELS.length - 1) * gap;
  const height = tall ? PANELS.length * PANEL.h + (PANELS.length - 1) * gap : PANEL.h;
  return (
    <Svg viewBox={`0 0 ${width} ${height}`} label={ShapesDescription} className={className}>
      <defs>
        <ArrowMarker id={id} />
      </defs>
      {PANELS.map((Panel, i) => {
        const offset = i * (tall ? PANEL.h + gap : PANEL.w + gap);
        return (
          <g key={i} transform={tall ? `translate(0 ${offset})` : `translate(${offset} 0)`}>
            {/* A thin rule between panels. */}
            {i > 0 &&
              (tall ? (
                <line x1={20} x2={PANEL.w - 20} y1={-gap / 2} y2={-gap / 2} stroke={color('edge')} strokeWidth={1.5} />
              ) : (
                <line x1={-gap / 2} x2={-gap / 2} y1={10} y2={PANEL.h - 10} stroke={color('edge')} strokeWidth={1.5} />
              ))}
            <Panel id={id} />
          </g>
        );
      })}
    </Svg>
  );
}

function Shapes() {
  return (
    <>
      <ShapesSvg tall={false} className="figure-wide" id="shapes-wide-arrow" />
      <ShapesSvg tall className="figure-tall" id="shapes-tall-arrow" />
    </>
  );
}

// ---------------------------------------------------------------- handoff

const HandoffDescription =
  'Alex’s message through an agent per team. Alex writes that the account is locked, the card is blocked, and gives the account number NSB01234. The router sends the message to the Accounts agent, which sees all three. Accounts hands the card over to the Cards agent, but the handoff carries only "Card blocked"; the lock and the account number are lost. So the Cards agent’s reply asks Alex for the account number again.';

type Chip = { text: string; lost?: boolean; bad?: boolean };

const ALL: Chip[] = [{ text: 'Account locked' }, { text: 'Card blocked' }, { text: 'NSB01234' }];

const STEPS: { name: string; chips: Chip[] }[] = [
  { name: 'Alex', chips: ALL },
  { name: 'Router', chips: [] },
  { name: 'Accounts agent', chips: ALL },
  { name: 'Cards agent', chips: [{ text: 'Account locked', lost: true }, { text: 'Card blocked' }, { text: 'NSB01234', lost: true }] },
  { name: 'Reply', chips: [{ text: 'Account number?', bad: true }] },
];

interface HandoffLayout {
  width: number;
  height: number;
  size: number;
  nodes: Point[];
  /** Where each step's name goes. */
  names: Label[];
  /** The centre of each step's chip stack, and the step between chips. */
  chips: Point[];
  chipStep: number;
  chip: { w: number; h: number };
  /** The edges between steps, and where "Handoff" goes. */
  edges: string[];
  handoff: Label;
  tag: Point;
}

const HANDOFF_WIDE: HandoffLayout = {
  width: 980,
  height: 290,
  size: 18,
  nodes: [86, 260, 460, 690, 890].map((x) => ({ x, y: 120 })),
  names: [86, 260, 460, 690, 890].map((x) => ({ x, y: 64 })),
  chips: [86, 260, 460, 690, 890].map((x) => ({ x, y: 226 })),
  chipStep: 38,
  chip: { w: 162, h: 30 },
  edges: ['M122,120 H198', 'M317,120 H410', 'M506,120 H640', 'M740,120 H860'],
  handoff: { x: 573, y: 108 },
  tag: { x: 890, y: 22 },
};

const HANDOFF_TALL: HandoffLayout = {
  width: 520,
  height: 720,
  size: 22,
  nodes: [60, 190, 320, 470, 620].map((y) => ({ x: 70, y })),
  names: [60, 190, 320, 470, 620].map((y) => ({ x: 140, y: y + 7, anchor: 'start' })),
  chips: [60, 190, 320, 470, 620].map((y) => ({ x: 420, y })),
  chipStep: 38,
  chip: { w: 186, h: 32 },
  edges: ['M70,96 V156', 'M70,216 V280', 'M70,352 V430', 'M70,508 V586'],
  handoff: { x: 86, y: 398, anchor: 'start' },
  tag: { x: 420, y: 676 },
};

function ChipBox({ at, chip, w, h, size }: { at: Point; chip: Chip; w: number; h: number; size: number }) {
  const stroke = chip.bad ? color('bad') : chip.lost ? color('edge') : ALEX;
  return (
    <g>
      <rect
        x={at.x - w / 2}
        y={at.y - h / 2}
        width={w}
        height={h}
        rx={h / 2}
        fill={chip.lost ? 'none' : color('node-bg')}
        stroke={stroke}
        strokeWidth={2}
        strokeDasharray={chip.lost ? '5 4' : undefined}
      />
      <text x={at.x} y={at.y} dy="0.35em" textAnchor="middle" fontSize={size - 1} fontWeight={600} fill={color(chip.lost ? 'muted' : 'text')} opacity={chip.lost ? 0.7 : 1}>
        {chip.text}
      </text>
      {/* What the handoff dropped is struck through. */}
      {chip.lost && <line x1={at.x - w / 2 + 16} x2={at.x + w / 2 - 16} y1={at.y} y2={at.y} stroke={color('muted')} strokeWidth={1.5} />}
    </g>
  );
}

function HandoffSvg({ layout, className, id }: { layout: HandoffLayout; className: string; id: string }) {
  const { nodes, size } = layout;
  return (
    <Svg viewBox={`0 0 ${layout.width} ${layout.height}`} label={HandoffDescription} className={className}>
      <defs>
        <ArrowMarker id={id} />
      </defs>
      {layout.edges.map((d) => (
        <path key={d} d={d} {...edge} markerEnd={`url(#${id})`} />
      ))}
      <Text {...layout.handoff} size={size}>
        Handoff
      </Text>
      <g>
        <circle cx={nodes[0].x} cy={nodes[0].y} r={34} fill={color('node-bg')} stroke={ALEX} strokeWidth={3} />
        <Envelope x={nodes[0].x} y={nodes[0].y} scale={1.4} />
      </g>
      <Router x={nodes[1].x} y={nodes[1].y} w={110} h={60} />
      <Agent x={nodes[2].x} y={nodes[2].y} scale={1.6} typing={1} />
      <Agent x={nodes[3].x} y={nodes[3].y} scale={1.6} typing={1} />
      <Reply x={nodes[4].x} y={nodes[4].y} scale={2.2} stroke={color('bad')} />
      {STEPS.map((s, i) => (
        <g key={s.name}>
          <Text {...layout.names[i]} size={size} fill={i === 2 ? TEAMS[0].color : i === 3 ? TEAMS[1].color : undefined}>
            {s.name}
          </Text>
          {s.chips.map((c, j) => (
            <ChipBox
              key={c.text}
              at={{ x: layout.chips[i].x, y: layout.chips[i].y + (j - (s.chips.length - 1) / 2) * layout.chipStep }}
              chip={c}
              w={layout.chip.w}
              h={layout.chip.h}
              size={size}
            />
          ))}
        </g>
      ))}
      <Tag {...layout.tag} text="Asks again" size={size - 1} />
    </Svg>
  );
}

function Handoff() {
  return (
    <>
      <HandoffSvg layout={HANDOFF_WIDE} className="figure-wide" id="handoff-wide-arrow" />
      <HandoffSvg layout={HANDOFF_TALL} className="figure-tall" id="handoff-tall-arrow" />
    </>
  );
}

// ---------------------------------------------------------------- gate

const GateDescription =
  'A grid of which failing eval cases block a change. Rows: a change by Accounts, by Cards, by Payments. Columns: the Accounts cases, the Cards cases, the Payments cases, and the must-not-break set. A change is blocked by failures in its own team’s cases and in the must-not-break set; failures in another team’s cases are reported to that team and don’t block.';

interface GateLayout {
  width: number;
  height: number;
  size: number;
  cell: { w: number; h: number };
  cols: number[];
  rows: number[];
  /** The baseline of the column headers' first line. */
  head: number;
  /** Each row's team: left of its cells on wide screens, above them on phones. */
  rowLabels: Label[];
  rowPrefix: string;
}

const GATE_WIDE: GateLayout = {
  width: 770,
  height: 330,
  size: 18,
  cell: { w: 120, h: 62 },
  cols: [284, 420, 556, 700],
  rows: [116, 192, 268],
  head: 30,
  rowLabels: [116, 192, 268].map((y) => ({ x: 4, y: y + 6, anchor: 'start' })),
  rowPrefix: 'Change by ',
};

const GATE_TALL: GateLayout = {
  width: 440,
  height: 400,
  size: 17,
  cell: { w: 98, h: 54 },
  cols: [52, 162, 272, 386],
  rows: [130, 236, 342],
  head: 26,
  rowLabels: [130, 236, 342].map((y) => ({ x: 4, y: y - 36, anchor: 'start' })),
  rowPrefix: 'Change by ',
};

const HEADS = [...TEAMS.map((t) => ({ top: t.name, bottom: 'cases', fill: t.color })), { top: 'Must not', bottom: 'break', fill: undefined }];

function GateSvg({ layout, className }: { layout: GateLayout; className: string }) {
  const { cell, size } = layout;
  return (
    <Svg viewBox={`0 0 ${layout.width} ${layout.height}`} label={GateDescription} className={className}>
      {HEADS.map((h, j) => (
        <g key={h.top}>
          <Text x={layout.cols[j]} y={layout.head} size={size} fill={h.fill}>
            {h.top}
          </Text>
          <Text x={layout.cols[j]} y={layout.head + size + 4} size={size - 2} muted>
            {h.bottom}
          </Text>
        </g>
      ))}
      {TEAMS.map((team, i) => (
        <g key={team.name}>
          <text {...layout.rowLabels[i]} textAnchor={layout.rowLabels[i].anchor} fontSize={size} fontWeight={600} fill={color('muted')}>
            {layout.rowPrefix}
            <tspan fill={team.color}>{team.name}</tspan>
          </text>
          {layout.cols.map((cx, j) => {
            const cy = layout.rows[i];
            const blocks = j === i || j === HEADS.length - 1;
            const box = { x: cx - cell.w / 2, y: cy - cell.h / 2, width: cell.w, height: cell.h, rx: 10 };
            return blocks ? (
              <g key={j}>
                <rect {...box} fill={color('node-bg')} stroke={color('bad')} strokeWidth={2.5} />
                <text x={cx} y={cy} dy="0.35em" textAnchor="middle" fontSize={size} fontWeight={700} fill={color('bad')}>
                  Blocks
                </text>
              </g>
            ) : (
              <g key={j}>
                <rect {...box} fill="none" stroke={color('edge')} strokeWidth={2} strokeDasharray="5 4" />
                <text x={cx} y={cy} dy="0.35em" textAnchor="middle" fontSize={size - 1} fontWeight={500} fill={color('muted')}>
                  Reports
                </text>
              </g>
            );
          })}
        </g>
      ))}
    </Svg>
  );
}

function Gate() {
  return (
    <>
      <GateSvg layout={GATE_WIDE} className="figure-wide" />
      <GateSvg layout={GATE_TALL} className="figure-tall" />
    </>
  );
}

export const FIGURES = {
  shapes: { component: Shapes, description: ShapesDescription, width: 760 },
  handoff: { component: Handoff, description: HandoffDescription, width: 760 },
  gate: { component: Gate, description: GateDescription, width: 620 },
} satisfies Record<string, { component: ComponentType; description: string; width: number }>;

export type FigureName = keyof typeof FIGURES;
