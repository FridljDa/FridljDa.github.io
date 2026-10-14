/**
 * The shadow-deployment loop, in batches: one developer (me) and a team of
 * subject-matter experts working through the feedback store, never waiting on
 * each other.
 *
 * - Day 1: customers write in, overlapping in time. Each message runs through
 *   the intent DAG to a leaf, and the experts grade the drafted reply. Most
 *   grades are a check; a cross's comment goes into the store, where the
 *   comments pile up.
 * - I take the pile in one sitting and store a fix plan for each comment. For
 *   one I first store a question; an expert answers it in the store, and I
 *   plan another fix while I wait.
 * - Night: the coding agent's nightly run takes all my plans at once and grows
 *   the DAG: two new leaves and a second parent for one of them.
 * - Day 2: I resubmit the three rejected tickets. Each runs again from the
 *   review tool, reaches its new leaf, and goes back into the shared queue,
 *   where the experts approve it.
 *
 * Two layouts of the same scene: `wide` (16:9) and `tall` for phones, with the
 * DAG on top and the experts, store, me and the coding agent below it.
 *
 * The DAG ends as drawn in first-level-support-automation ("Step 1: Intent
 * recognition"), whose static figure (PipelineFigures.tsx) imports the same
 * geometry from here. Nodes never move: every later node already has its
 * slot, so growing only fades in a node or draws in an edge.
 *
 * Everything is a function of the frame, so any frame renders the same way
 * every time; the last one is the resting state (full DAG, all grades).
 */
import type { ReactNode } from 'react';
import { useCurrentFrame, useVideoConfig, spring, AbsoluteFill } from 'remotion';
import {
  color,
  PALETTE,
  progress,
  mix,
  lerp,
  edgePoint,
  edgePath,
  Person,
  Experts,
  ReviewTool,
  Agent,
  Envelope,
  Reply,
  Comment,
  Grade,
  Label,
  type Point,
} from './shared';
import { ArrowMarker } from '../components/map-parts';


type Kind = 'intent' | 'other';

interface DagNode {
  label: string;
  kind: Kind;
  x: number;
  y: number;
  w: number;
}

export const NODE_H = 42;
const row = (i: number) => 64 + 56 * i;
export const PARENT = { x: 262, w: 172 };
export const LEAF = { x: 514, w: 184 };

const parent = (label: string, y: number, kind: Kind = 'intent'): DagNode => ({ label, kind, ...PARENT, y });
const leaf = (label: string, i: number, kind: Kind = 'intent'): DagNode => ({ label, kind, ...LEAF, y: row(i) });

// Parents sit level with the middle of their leaves; the shared leaf sits between its two parents.
export const NODES = {
  access: parent('Account access', (row(0) + row(3)) / 2),
  cards: parent('Card services', (row(3) + row(5)) / 2),
  payments: parent('Payments', row(6)),
  rootOther: parent('Other', row(7), 'other'),
  login: leaf('Login problem', 0),
  reset: leaf('Password reset', 1),
  accessOther: leaf('Other', 2, 'other'),
  locked: leaf('Account locked', 3),
  blocked: leaf('Card blocked', 4),
  cardsOther: leaf('Other', 5, 'other'),
} satisfies Record<string, DagNode>;

export type Id = keyof typeof NODES | 'root';

export const ROOT: Point & { r: number } = { x: 196, y: (NODES.access.y + NODES.rootOther.y) / 2, r: 30 };

export const EDGES = [
  ['root', 'access'],
  ['root', 'cards'],
  ['root', 'payments'],
  ['root', 'rootOther'],
  ['access', 'login'],
  ['access', 'reset'],
  ['access', 'accessOther'],
  ['access', 'locked'],
  ['cards', 'locked'],
  ['cards', 'blocked'],
  ['cards', 'cardsOther'],
] as const satisfies readonly (readonly [Id, Id])[];

const edgeKey = (from: Id, to: Id) => `${from}>${to}`;

export const outPoint = (id: Id): Point =>
  id === 'root' ? { x: ROOT.x + ROOT.r, y: ROOT.y } : { x: NODES[id].x + NODES[id].w, y: NODES[id].y };
export const inPoint = (id: Exclude<Id, 'root'>): Point => ({ x: NODES[id].x, y: NODES[id].y });

/** What a cross teaches the system: a new leaf, or a second parent for an existing one. */
interface Growth {
  node?: keyof typeof NODES;
  edge: readonly [Id, Exclude<Id, 'root'>];
}

interface Visit {
  /** Nodes after the root, ending on the leaf the message lands on. */
  path: Exclude<Id, 'root'>[];
  /** Frames after the day's first customer that this one writes in, so they overlap. */
  offset: number;
  grows?: Growth;
  /** A rejected day-1 ticket, by its place among the crosses, resubmitted from the review tool. */
  resubmits?: number;
}

// What the three crosses of day 1 grow, in the order the night grows them:
// the second parent for Account locked comes with or after the leaf itself.
const RESET: Growth = { node: 'reset', edge: ['access', 'reset'] };
const LOCKED: Growth = { node: 'locked', edge: ['access', 'locked'] };
const SECOND_PARENT: Growth = { edge: ['cards', 'locked'] };
const GROWTHS = [RESET, LOCKED, SECOND_PARENT];

const DAY_1: Visit[] = [
  { offset: 0, path: ['access', 'login'] },
  { offset: 18, path: ['access', 'accessOther'], grows: RESET },
  { offset: 40, path: ['cards', 'blocked'] },
  { offset: 58, path: ['access', 'accessOther'], grows: LOCKED },
  { offset: 82, path: ['payments'] },
  { offset: 100, path: ['cards', 'cardsOther'], grows: SECOND_PARENT },
];

// The same three tickets, resubmitted once the night has fixed them.
const DAY_2: Visit[] = [
  { offset: 0, path: ['access', 'reset'], resubmits: 0 },
  { offset: 20, path: ['access', 'locked'], resubmits: 1 },
  { offset: 40, path: ['cards', 'locked'], resubmits: 2 },
];

/** Parts of the DAG that only exist once the night has grown them. */
const GROWN_NODES = new Set(GROWTHS.flatMap((g) => (g.node ? [g.node] : [])));
const GROWN_EDGES = new Set(GROWTHS.map((g) => edgeKey(...g.edge)));

// Beats, in frames. The opening frame holds a moment, so the scene can be
// read before anything moves.
const LEAD = 30;
const ENTER = 10;
// A resubmitted ticket travels from the review tool back to the root.
const RESUBMIT = 30;
const HOP = 11;
const TO_EXPERT = 14;
// Comments move at about two thirds of the speed of the messages: the
// feedback is what the figure is about.
const TO_STORE = 18;
const TO_ME = 21;
const TO_DESK = 10;
const TO_AGENT = 21;
const PAUSE = 8;
const FADE = 5;
const TYPING = 36;
const SPARK = 21;
const GROW = 27;
const HOLD = 60;

/** Where an icon stands, or a comment rests between its trips. */
type Spot = 'experts' | 'store' | 'me' | 'agent0' | 'agent1' | 'agent2' | 'pile0' | 'pile1' | 'pile2' | 'desk0' | 'desk1' | 'desk2' | 'deskTop';

interface Layout {
  width: number;
  height: number;
  /** Where the DAG, drawn in its own coordinates above, is moved to. */
  dag: Point;
  /** Where the customers stand, side by side, and the offset they walk in from. */
  customers: Point[];
  walkIn: Point;
  expert: Point;
  tallyY: number;
  store: Point;
  /** The bottom of the pile of comments in the store; each next one sits a little higher. */
  pile: Point;
  me: Point;
  /** Where the comments I am working through lie, the first next to me. */
  desk: Point;
  deskStep: number;
  agent: Point;
  /** The size of the names under the icons, as on the map of the same width. */
  labelSize: number;
  /** Where "Nightly" goes, next to the line from the store to the coding agent. */
  nightly: Point & { anchor: 'start' | 'middle' };
  /** Where "Day 1", "Night" and "Day 2" go. */
  day: Point;
  /** A resubmitted ticket's way from the review tool to the root: start, two control points, end. */
  resubmit: [Point, Point, Point, Point];
}

export const LAYOUTS = {
  wide: {
    width: 960,
    height: 540,
    dag: { x: 0, y: 0 },
    customers: [
      { x: 96, y: ROOT.y },
      { x: 96, y: ROOT.y - 66 },
      { x: 96, y: ROOT.y + 66 },
    ],
    walkIn: { x: -136, y: 0 },
    expert: { x: 846, y: 96 },
    tallyY: 182,
    store: { x: 846, y: 290 },
    // Left of the review tool, so my plans fly to the coding agent clear of "Nightly".
    pile: { x: 762, y: 304 },
    me: { x: 748, y: 436 },
    desk: { x: 680, y: 440 },
    deskStep: -48,
    agent: { x: 868, y: 436 },
    labelSize: 21,
    nightly: { x: 866, y: 372, anchor: 'start' },
    day: { x: 24, y: 40 },
    // Under the DAG, entering the root from below.
    resubmit: [{ x: 796, y: 304 }, { x: 760, y: 530 }, { x: 196, y: 540 }, { x: 196, y: ROOT.y + ROOT.r }],
  },
  tall: {
    width: 540,
    height: 900,
    dag: { x: -162, y: 70 },
    customers: [
      { x: 34, y: 268 },
      { x: 34, y: 202 },
      { x: 34, y: 136 },
    ],
    walkIn: { x: -90, y: 0 },
    expert: { x: 112, y: 640 },
    tallyY: 722,
    store: { x: 112, y: 822 },
    pile: { x: 26, y: 846 },
    // Raised, so the line from the store to the coding agent passes below me.
    me: { x: 290, y: 724 },
    desk: { x: 354, y: 716 },
    deskStep: 48,
    agent: { x: 450, y: 822 },
    labelSize: 25,
    nightly: { x: 270, y: 856, anchor: 'middle' },
    day: { x: 20, y: 44 },
    // Up the left edge, left of the experts and clear of the DAG's first column.
    resubmit: [{ x: 60, y: 820 }, { x: 0, y: 800 }, { x: 4, y: 470 }, { x: 34, y: ROOT.y + 70 + ROOT.r }],
  },
} satisfies Record<string, Layout>;

export type LayoutName = keyof typeof LAYOUTS;

interface Timed extends Visit {
  index: number;
  color: string;
  ok: boolean;
  /** Which of the standing places the customer takes. */
  slot: number;
  start: number;
  /** Frame the message reaches each node of its path. */
  reach: number[];
  replyAt: number;
  gradeAt: number;
}

const enterOf = (visit: Visit) => (visit.resubmits === undefined ? ENTER : RESUBMIT);

const schedule = (visits: Visit[], from: number, firstIndex: number, colors?: string[]): Timed[] =>
  visits.map((visit, i) => {
    const index = firstIndex + i;
    const start = from + visit.offset;
    const reach = visit.path.map((_, h) => start + enterOf(visit) + HOP * (h + 1));
    const replyAt = reach[reach.length - 1] + 6;
    return {
      ...visit,
      index,
      color: visit.resubmits === undefined ? PALETTE[index % PALETTE.length] : colors![visit.resubmits],
      ok: !visit.grows,
      slot: i % 3,
      start,
      reach,
      replyAt,
      gradeAt: replyAt + TO_EXPERT,
    };
  });

const FIRST = schedule(DAY_1, LEAD, 0);
const CROSSES = FIRST.filter((v) => v.grows);

/**
 * A comment on its trips between the experts, the store, me and the coding
 * agent. It appears at `from`, rests wherever its last trip ended and fades
 * out at `gone`.
 */
interface Item {
  key: string;
  kind: 'expert' | 'plan' | 'question' | 'answer';
  from: Spot;
  appear: number;
  legs: { at: number; to: Spot; dur: number }[];
  gone: number;
}

const ITEMS: Item[] = [];

// Day 1: each cross's comment goes into the store and stays there.
const stored = CROSSES.map((v) => v.gradeAt + 10);
const piled = Math.max(...stored) + TO_STORE;

// I take the whole pile in one sitting...
const TAKE = piled + 20;
const AT_DESK = TAKE + TO_ME + TO_DESK;
// ...plan the first fix, ask the experts about the second, plan the third
// while they answer, and plan the second once the answer is in.
const PLAN = [AT_DESK + 12, 0, 0];
const ASK = PLAN[0] + 30;
const ASKED = ASK + TO_ME + PAUSE + TO_STORE;
PLAN[2] = ASK + 32;
const ANSWER = ASKED + 16;
const ANSWERED = ANSWER + TO_STORE + PAUSE + TO_ME + TO_DESK;
PLAN[1] = ANSWERED + 14;

// Night: the coding agent's run takes every plan in the store at once.
const NIGHT = Math.max(...PLAN) + TO_ME + 20;
const COLLECT = NIGHT + 14;
const TYPE_AT = COLLECT + 2 * 3 + TO_AGENT;
const SPARK_AT = TYPE_AT + TYPING;
const GROW_AT = GROWTHS.map((_, k) => SPARK_AT + 9 * k + SPARK);

const DAY_2_AT = Math.max(...GROW_AT) + GROW + 16;
const SECOND = schedule(DAY_2, DAY_2_AT + 16, DAY_1.length, CROSSES.map((v) => v.color));
const VISITS = [...FIRST, ...SECOND];

CROSSES.forEach((v, k) => {
  const desk = `desk${k}` as Spot;
  // Each plan goes to the place in the pile its comment came from.
  const pile = `pile${k}` as Spot;
  ITEMS.push({
    key: `expert-${k}`,
    kind: 'expert',
    from: 'experts',
    appear: stored[k],
    legs: [
      { at: stored[k], to: pile, dur: TO_STORE },
      { at: TAKE, to: 'me', dur: TO_ME },
      { at: TAKE + TO_ME, to: desk, dur: TO_DESK },
    ],
    gone: PLAN[k] + FADE,
  });
  ITEMS.push({
    key: `plan-${k}`,
    kind: 'plan',
    from: 'me',
    appear: PLAN[k],
    legs: [
      { at: PLAN[k], to: pile, dur: TO_ME },
      { at: COLLECT + 3 * k, to: `agent${k}` as Spot, dur: TO_AGENT },
    ],
    gone: COLLECT + 3 * k + TO_AGENT + FADE,
  });
});
ITEMS.push({
  key: 'question',
  kind: 'question',
  from: 'me',
  appear: ASK,
  legs: [
    { at: ASK, to: 'store', dur: TO_ME },
    { at: ASK + TO_ME + PAUSE, to: 'experts', dur: TO_STORE },
  ],
  gone: ASKED + FADE,
});
ITEMS.push({
  key: 'answer',
  kind: 'answer',
  from: 'experts',
  appear: ANSWER,
  legs: [
    { at: ANSWER, to: 'store', dur: TO_STORE },
    { at: ANSWER + TO_STORE + PAUSE, to: 'me', dur: TO_ME },
    { at: ANSWER + TO_STORE + PAUSE + TO_ME, to: 'deskTop', dur: TO_DESK },
  ],
  gone: PLAN[1] + FADE,
});

const lastGrade = Math.max(...VISITS.map((v) => v.gradeAt));
export const SHADOW_LOOP_FRAMES = lastGrade + 30 + HOLD;

/** Frame a grown node or edge appears; base parts are there from the start. */
const grownAt = (key: string) => {
  const k = GROWTHS.findIndex((g) => g.node === key || edgeKey(...g.edge) === key);
  return k >= 0 ? GROW_AT[k] : 0;
};

/** The point `by` units from `from` toward `to`: where a line between two icons leaves the first. */
const toward = (from: Point, to: Point, by: number): Point => {
  const length = Math.hypot(to.x - from.x, to.y - from.y);
  return mix(from, to, by / length);
};

/** How lit a visit's path is: on while the message travels and is graded, then fading out. */
const lit = (frame: number, visit: Timed, from: number) => {
  if (frame < from) return 0;
  return 1 - progress(frame, visit.gradeAt + 8, visit.gradeAt + 20);
};

/** A question of mine: my comment with a question mark on it. */
const Question = ({ x, y, scale, opacity }: Point & { scale: number; opacity: number }) => (
  <g opacity={opacity}>
    <Comment x={x} y={y} scale={scale} stroke={color('added')} />
    <g transform={`translate(${x + 22 * scale} ${y - 16 * scale}) scale(${scale})`}>
      <circle r={9} fill={color('added')} />
      <text y={0} dy="0.36em" textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">
        ?
      </text>
    </g>
  </g>
);

export const ShadowLoop = ({ layout = 'wide' }: { layout?: LayoutName }) => {
  const L: Layout = LAYOUTS[layout];
  const { expert: EXPERT, agent: AGENT, store: STORE, me: ME } = L;
  // The lines from the store to me and to the coding agent, from the edge of one icon to the other's.
  const storeToMe = toward(STORE, ME, 56);
  const meIn = toward(ME, STORE, 38);
  const storeToAgent = toward(STORE, AGENT, 56);
  const agentIn = toward(AGENT, STORE, 44);
  const marker = `shadow-loop-${layout}-arrow`;
  /** A point of the DAG in this layout's coordinates. */
  const D = (p: Point): Point => ({ x: p.x + L.dag.x, y: p.y + L.dag.y });
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = (at: number) => (frame < at ? 0 : spring({ frame: frame - at, fps, config: { damping: 12, mass: 0.6 } }));

  const spot = (s: Spot): Point => {
    if (s === 'experts') return { x: EXPERT.x, y: L.tallyY + 36 };
    if (s === 'store') return { x: STORE.x, y: STORE.y - 4 };
    // Above my head; into the coding agent's window, still as a pile.
    if (s === 'me') return { x: ME.x - 4, y: ME.y - 50 };
    if (s === 'deskTop') return { x: L.desk.x + L.deskStep + 5, y: L.desk.y - 12 };
    const k = Number(s.slice(-1));
    if (s.startsWith('agent')) return { x: AGENT.x + 3 * k, y: AGENT.y - 4 - 13 * k };
    if (s.startsWith('pile')) return { x: L.pile.x + 3 * k, y: L.pile.y - 13 * k };
    return { x: L.desk.x + L.deskStep * k, y: L.desk.y };
  };

  const placeOf = (item: Item): Point => {
    let at = spot(item.from);
    for (const leg of item.legs) {
      if (frame < leg.at) break;
      const t = progress(frame, leg.at, leg.at + leg.dur);
      const to = spot(leg.to);
      if (t < 1) return mix(at, to, t);
      at = to;
    }
    return at;
  };

  const active = VISITS.filter((v) => frame >= v.start && frame < v.gradeAt + 24);

  const nodeHighlight = (id: Id) => {
    let best: { color: string; amount: number } | undefined;
    for (const v of active) {
      const i = v.path.indexOf(id as Exclude<Id, 'root'>);
      const from = id === 'root' ? v.start + enterOf(v) : i >= 0 ? v.reach[i] : Infinity;
      const amount = lit(frame, v, from);
      if (amount > 0 && (!best || amount > best.amount)) best = { color: v.color, amount };
    }
    return best;
  };

  const edgeHighlight = (from: Id, to: Id) => {
    for (const v of active) {
      const nodes: Id[] = ['root', ...v.path];
      for (let i = 0; i < v.path.length; i++) {
        if (nodes[i] === from && nodes[i + 1] === to) {
          const start = v.reach[i] - HOP;
          const drawn = progress(frame, start, v.reach[i]);
          const amount = lit(frame, v, start);
          if (amount > 0) return { color: v.color, drawn, amount };
        }
      }
    }
    return undefined;
  };

  // The experts lean in when a reply or my question reaches them.
  const nudges = [...VISITS.map((v) => v.gradeAt - 6), ASKED - 4];
  const nudge = Math.max(0, ...nudges.map((at) => (frame >= at && frame < at + 20 ? pop(at) * (1 - progress(frame, at + 12, at + 20)) : 0)));
  const typing = frame >= TYPE_AT && frame < SPARK_AT ? progress(frame, TYPE_AT, SPARK_AT - 4) : 0;
  const night = progress(frame, NIGHT, NIGHT + 8) * (1 - progress(frame, DAY_2_AT, DAY_2_AT + 8));

  const days: { text: string; from: number; to: number }[] = [
    { text: 'Day 1', from: -Infinity, to: NIGHT },
    { text: 'Night', from: NIGHT, to: DAY_2_AT },
    { text: 'Day 2', from: DAY_2_AT, to: Infinity },
  ];

  return (
    <AbsoluteFill style={{ background: color('surface') }}>
      <svg viewBox={`0 0 ${L.width} ${L.height}`} width="100%" height="100%" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {days.map(({ text, from, to }) => {
          // The old label fades out before the new one fades in.
          const fadeIn = from === -Infinity ? 1 : progress(frame, from + 6, from + 14);
          const fadeOut = to === Infinity ? 0 : progress(frame, to - 6, to + 2);
          const opacity = fadeIn * (1 - fadeOut);
          return opacity > 0 ? (
            <g key={text} opacity={opacity}>
              <Label x={L.day.x} y={L.day.y} size={L.labelSize + 3} anchor="start">
                {text}
              </Label>
            </g>
          ) : null;
        })}

        <g transform={`translate(${L.dag.x} ${L.dag.y})`}>
        {/* Edges */}
        {EDGES.map(([from, to]) => {
          const key = edgeKey(from, to);
          const grows = GROWN_EDGES.has(key);
          const at = grows ? grownAt(key) : 0;
          if (frame < at) return null;
          const d = edgePath(outPoint(from), inPoint(to));
          const drawn = grows ? progress(frame, at, at + GROW) : 1;
          const hi = edgeHighlight(from, to);
          return (
            <g key={key}>
              <path
                d={d}
                fill="none"
                stroke={grows ? color('added') : color('edge')}
                strokeWidth={grows ? 2.5 : 2}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - drawn}
              />
              {hi && (
                <path
                  d={d}
                  fill="none"
                  stroke={hi.color}
                  strokeWidth={4}
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - hi.drawn}
                  opacity={hi.amount}
                />
              )}
            </g>
          );
        })}

        {/* Root: the incoming message */}
        {(() => {
          const hi = nodeHighlight('root');
          return (
            <g>
              <circle
                cx={ROOT.x}
                cy={ROOT.y}
                r={ROOT.r}
                fill={color('node-bg')}
                stroke={hi ? hi.color : color('node-border')}
                strokeWidth={hi ? lerp(2, 4, hi.amount) : 2}
              />
              <Envelope x={ROOT.x} y={ROOT.y} />
            </g>
          );
        })()}

        {/* Intent nodes */}
        {(Object.keys(NODES) as (keyof typeof NODES)[]).map((id) => {
          const node = NODES[id];
          const grows = GROWN_NODES.has(id);
          const at = grows ? grownAt(id) : 0;
          if (frame < at) return null;
          const scale = grows ? lerp(0.6, 1, pop(at)) : 1;
          const hi = nodeHighlight(id);
          const other = node.kind === 'other';
          const baseStroke = other ? color('other') : grows ? color('added') : color('node-border');
          return (
            <g
              key={id}
              transform={`translate(${node.x + node.w / 2} ${node.y}) scale(${scale})`}
              opacity={grows ? progress(frame, at, at + 8) : 1}
            >
              <rect
                x={-node.w / 2}
                y={-NODE_H / 2}
                width={node.w}
                height={NODE_H}
                rx={9}
                fill={other ? color('other-bg') : grows ? color('added-bg') : color('node-bg')}
                stroke={hi ? hi.color : baseStroke}
                strokeWidth={hi ? lerp(2, 4, hi.amount) : 2}
                strokeDasharray={other && !hi ? '5 4' : undefined}
              />
              <text y={0} dy="0.35em" textAnchor="middle" fontSize={19} fontWeight={500} fill={color('text')}>
                {node.label}
              </text>
            </g>
          );
        })}
        </g>

        {/* The experts, their grades, the store, me and the coding agent, joined as on the section maps:
            comments go back and forth between the store and the experts and between it and me, and the
            nightly run takes my plans to the coding agent. */}
        <defs>
          <ArrowMarker id={marker} />
        </defs>
        {[
          { d: `M${EXPERT.x},${L.tallyY + 18} V${STORE.y - 40}`, twoWay: true },
          { d: `M${storeToMe.x},${storeToMe.y} L${meIn.x},${meIn.y}`, twoWay: true },
          { d: `M${storeToAgent.x},${storeToAgent.y} L${agentIn.x},${agentIn.y}` },
        ].map(({ d, twoWay }) => (
          <path
            key={d}
            d={d}
            fill="none"
            stroke={color('node-border')}
            strokeWidth={2.5}
            markerEnd={`url(#${marker})`}
            markerStart={twoWay ? `url(#${marker})` : undefined}
          />
        ))}
        <text x={L.nightly.x} y={L.nightly.y} textAnchor={L.nightly.anchor} fontSize={L.labelSize - 4} fontWeight={600} fill={color('muted')}>
          Nightly
        </text>
        {night > 0 && (
          <text x={L.nightly.x} y={L.nightly.y} textAnchor={L.nightly.anchor} fontSize={L.labelSize - 4} fontWeight={600} fill={color('added')} opacity={night}>
            Nightly
          </text>
        )}
        <ReviewTool x={STORE.x} y={STORE.y} />
        <Person x={ME.x} y={ME.y} scale={1.4} fill={color('text')} />
        <Label x={ME.x} y={ME.y + 52} size={L.labelSize}>
          Me
        </Label>
        <Experts x={EXPERT.x} y={EXPERT.y} scale={1.5 * (1 + 0.06 * nudge)} />
        <Label x={EXPERT.x} y={EXPERT.y + 56} size={L.labelSize}>
          Experts
        </Label>
        {VISITS.filter((v) => frame >= v.gradeAt).map((v) => {
          // One row of grades, a small gap between the days.
          const i = v.index;
          const x = EXPERT.x + i * 18 + (i >= DAY_1.length ? 12 : 0) - ((VISITS.length - 1) * 18 + 12) / 2;
          return <Grade key={v.index} ok={v.ok} r={8} x={x} y={L.tallyY} scale={pop(v.gradeAt + 8)} />;
        })}

        <Agent x={AGENT.x} y={AGENT.y} scale={1.5} typing={typing} />
        <Label x={AGENT.x} y={AGENT.y + 52} size={L.labelSize}>
          Coding agent
        </Label>

        {active.map((v) => {
          const last = v.path[v.path.length - 1];
          const leafOut = outPoint(last);
          const parts: ReactNode[] = [];

          // The customer steps up, and leaves once their reply is graded. A resubmitted
          // ticket has no customer waiting: it comes back from the review tool.
          const enter = progress(frame, v.start, v.start + ENTER);
          const leave = progress(frame, v.gradeAt, v.gradeAt + 12);
          const stand = L.customers[v.slot];
          if (v.resubmits !== undefined) {
            if (frame < v.start + RESUBMIT) {
              const t = progress(frame, v.start, v.start + RESUBMIT);
              const [a, b, c, d] = L.resubmit;
              const u = 1 - t;
              const at = (k: 'x' | 'y') => u * u * u * a[k] + 3 * u * u * t * b[k] + 3 * u * t * t * c[k] + t * t * t * d[k];
              parts.push(<circle key="resubmit" cx={at('x')} cy={at('y')} r={9} fill={v.color} opacity={progress(frame, v.start, v.start + 4)} />);
            }
          } else parts.push(
            <Person
              key="customer"
              x={stand.x + L.walkIn.x * (1 - enter)}
              y={stand.y + L.walkIn.y * (1 - enter) + 16 * leave}
              scale={1.5}
              opacity={enter * (1 - leave)}
              fill={v.color}
            />
          );

          // The message travels root → parent → leaf.
          const travelStart = v.start + enterOf(v);
          const arrive = v.reach[v.reach.length - 1];
          if (frame >= travelStart && frame < arrive + 6) {
            const hop = Math.min(Math.floor((frame - travelStart) / HOP), v.path.length - 1);
            const nodes: Id[] = ['root', ...v.path];
            const t = progress(frame, travelStart + hop * HOP, travelStart + (hop + 1) * HOP);
            const p = edgePoint(outPoint(nodes[hop]), inPoint(v.path[hop]), t);
            const fade = 1 - progress(frame, arrive, arrive + 6);
            const q = D(p);
            parts.push(<circle key="msg" cx={q.x} cy={q.y} r={9} fill={v.color} opacity={fade} />);
          }

          // The drafted reply goes to the experts, who grade it.
          if (frame >= v.replyAt && frame < v.gradeAt + 4) {
            const t = progress(frame, v.replyAt, v.gradeAt);
            const p = mix(D({ x: leafOut.x + 22, y: leafOut.y }), { x: EXPERT.x - 58, y: EXPERT.y + 6 }, t);
            parts.push(<Reply key="reply" x={p.x} y={p.y} scale={1.4} stroke={v.color} opacity={1 - progress(frame, v.gradeAt, v.gradeAt + 4)} />);
          }
          const shown = pop(v.gradeAt);
          if (shown > 0) {
            const fade = 1 - progress(frame, v.gradeAt + 10, v.gradeAt + 17);
            parts.push(<Grade key="grade" ok={v.ok} x={EXPERT.x + 64} y={EXPERT.y - 36} scale={shown} opacity={fade} />);
          }
          return <g key={v.index}>{parts}</g>;
        })}

        {/* The comments: the experts' into the store, where they pile up; mine back into it; a question and its answer. */}
        {ITEMS.filter((item) => frame >= item.appear && frame < item.gone).map((item) => {
          const p = placeOf(item);
          const opacity = progress(frame, item.appear, item.appear + FADE) * (1 - progress(frame, item.gone - FADE, item.gone));
          if (item.kind === 'question') return <Question key={item.key} x={p.x} y={p.y} scale={0.85} opacity={opacity} />;
          const stroke = item.kind === 'plan' ? color('added') : color('bad');
          return <Comment key={item.key} x={p.x} y={p.y} scale={0.85} stroke={stroke} opacity={opacity} />;
        })}

        {/* The nightly run: the coding agent grows the DAG, one spark for each plan. */}
        {GROWTHS.map((g, k) => {
          const growAt = GROW_AT[k];
          const sparkAt = growAt - SPARK;
          if (frame < sparkAt || frame >= growAt + 4) return null;
          const target = D(
            g.node
              ? { x: NODES[g.node].x + NODES[g.node].w / 2, y: NODES[g.node].y }
              : edgePoint(outPoint(g.edge[0]), inPoint(g.edge[1]), 0.5)
          );
          const t = progress(frame, sparkAt, growAt);
          const from = { x: AGENT.x, y: AGENT.y - 34 };
          // Arc above the straight line, so the spark doesn't cut through the DAG's labels.
          const p = mix(from, target, t);
          const lift = Math.sin(Math.PI * t) * 60;
          return (
            <circle key={`spark-${k}`} cx={p.x} cy={p.y - lift} r={8} fill={color('added')} opacity={1 - progress(frame, growAt, growAt + 4)} />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
