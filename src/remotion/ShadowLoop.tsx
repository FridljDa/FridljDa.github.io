/**
 * The shadow-deployment loop: customers write in one at a time, each message
 * runs through the intent DAG to a leaf, and the subject-matter expert grades
 * the drafted reply. Most grades are a check. On a cross the expert's comment
 * is stored with the case; I pick it up from the store and store a comment of
 * my own on how to fix it. The coding agent's nightly run takes mine from the
 * store and grows the DAG, and the next customer with that request reaches
 * the new leaf.
 *
 * Two layouts of the same scene: `wide` (16:9) and `tall` for phones, with the
 * DAG on top and the expert, store, me and the coding agent below it.
 *
 * The DAG ends as drawn in first-level-support-automation ("Step 1: Intent
 * recognition"), whose static figure (PipelineFigures.tsx) imports the same
 * geometry from here. Nodes never move: every later node already has its
 * slot, so growing only fades in a node or draws in an edge.
 *
 * Everything is a function of the frame, so any frame renders the same way
 * every time; the last one is the resting state (full DAG, all grades).
 */
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
  Expert,
  Store,
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
  grows?: Growth;
}

const SCRIPT: Visit[] = [
  { path: ['access', 'login'] },
  { path: ['cards', 'blocked'] },
  { path: ['access', 'accessOther'], grows: { node: 'reset', edge: ['access', 'reset'] } },
  { path: ['access', 'reset'] },
  { path: ['payments'] },
  { path: ['access', 'accessOther'], grows: { node: 'locked', edge: ['access', 'locked'] } },
  { path: ['access', 'locked'] },
  { path: ['cards', 'cardsOther'], grows: { edge: ['cards', 'locked'] } },
  { path: ['cards', 'locked'] },
];

/** Parts of the DAG that only exist once a cross has grown them. */
const GROWN_NODES = new Set(SCRIPT.flatMap((v) => (v.grows?.node ? [v.grows.node] : [])));
const GROWN_EDGES = new Set(SCRIPT.flatMap((v) => (v.grows ? [edgeKey(...v.grows.edge)] : [])));

// Beats, in frames. The opening frame holds a moment, so the scene can be
// read before anything moves.
const LEAD = 30;
const ENTER = 10;
const HOP = 11;
const TO_EXPERT = 14;
// A cross and the fix it leads to are what the figure is about, so they move
// at about two thirds of the speed of the checks.
const TO_STORE = 18;
const TO_ME = 21;
const TO_AGENT = 18;
const TYPING = 36;
const SPARK = 21;
const GROW = 27;
const HOLD = 60;

interface Layout {
  width: number;
  height: number;
  /** Where the DAG, drawn in its own coordinates above, is moved to. */
  dag: Point;
  /** Where a customer stands, and where they walk in from. */
  customer: Point;
  customerFrom: Point;
  expert: Point;
  tallyY: number;
  store: Point;
  me: Point;
  agent: Point;
  /** The size of the names under the icons, as on the map of the same width. */
  labelSize: number;
  /** Where "Nightly" goes, next to the line from the store to the coding agent. */
  nightly: Point & { anchor: 'start' | 'middle' };
}

export const LAYOUTS = {
  wide: {
    width: 960,
    height: 540,
    dag: { x: 0, y: 0 },
    customer: { x: 96, y: ROOT.y },
    customerFrom: { x: -40, y: ROOT.y },
    expert: { x: 846, y: 96 },
    tallyY: 178,
    store: { x: 846, y: 282 },
    me: { x: 748, y: 430 },
    agent: { x: 868, y: 430 },
    labelSize: 21,
    nightly: { x: 866, y: 364, anchor: 'start' },
  },
  tall: {
    width: 540,
    height: 900,
    dag: { x: -162, y: 70 },
    customer: { x: 34, y: 262 },
    customerFrom: { x: 34, y: -40 },
    expert: { x: 112, y: 650 },
    tallyY: 726,
    store: { x: 112, y: 820 },
    // Raised, so the line from the store to the coding agent passes below me.
    me: { x: 290, y: 724 },
    agent: { x: 440, y: 820 },
    labelSize: 25,
    nightly: { x: 270, y: 854, anchor: 'middle' },
  },
} satisfies Record<string, Layout>;

export type LayoutName = keyof typeof LAYOUTS;

interface Timed extends Visit {
  index: number;
  color: string;
  ok: boolean;
  start: number;
  /** Frame the message reaches each node of its path. */
  reach: number[];
  replyAt: number;
  gradeAt: number;
  storeAt?: number;
  meAt?: number;
  /** My comment on the fix goes back into the store... */
  mineAt?: number;
  /** ...and the nightly run takes it to the coding agent. */
  nightlyAt?: number;
  typingAt?: number;
  sparkAt?: number;
  growAt?: number;
}

const TIMELINE: Timed[] = [];
let cursor = LEAD;
for (const [index, visit] of SCRIPT.entries()) {
  const start = cursor;
  const reach = visit.path.map((_, i) => start + ENTER + HOP * (i + 1));
  const replyAt = reach[reach.length - 1] + 6;
  const gradeAt = replyAt + TO_EXPERT;
  const timed: Timed = { ...visit, index, color: PALETTE[index % PALETTE.length], ok: !visit.grows, start, reach, replyAt, gradeAt };
  if (visit.grows) {
    timed.storeAt = gradeAt + 15;
    timed.meAt = timed.storeAt + TO_STORE + 6;
    timed.mineAt = timed.meAt + TO_ME + 9;
    timed.nightlyAt = timed.mineAt + TO_ME + 9;
    timed.typingAt = timed.nightlyAt + TO_AGENT;
    timed.sparkAt = timed.typingAt + TYPING;
    timed.growAt = timed.sparkAt + SPARK;
    cursor = timed.growAt + GROW + 9;
  } else {
    cursor = gradeAt - 10;
  }
  TIMELINE.push(timed);
}

export const SHADOW_LOOP_FRAMES = cursor + HOLD;

/** Frame a grown node or edge appears; base parts are there from the start. */
const grownAt = (key: string) => {
  const visit = TIMELINE.find((v) => v.grows && (v.grows.node === key || edgeKey(...v.grows.edge) === key));
  return visit?.growAt ?? 0;
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

export const ShadowLoop = ({ layout = 'wide' }: { layout?: LayoutName }) => {
  const L: Layout = LAYOUTS[layout];
  const { expert: EXPERT, agent: AGENT, store: STORE, me: ME } = L;
  // The lines from the store to me and to the coding agent, from the edge of one icon to the other's.
  const storeToMe = toward(STORE, ME, 42);
  const meIn = toward(ME, STORE, 38);
  const storeToAgent = toward(STORE, AGENT, 42);
  const agentIn = toward(AGENT, STORE, 44);
  const marker = `shadow-loop-${layout}-arrow`;
  /** A point of the DAG in this layout's coordinates. */
  const D = (p: Point): Point => ({ x: p.x + L.dag.x, y: p.y + L.dag.y });
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = (at: number) => (frame < at ? 0 : spring({ frame: frame - at, fps, config: { damping: 12, mass: 0.6 } }));

  const active = TIMELINE.filter((v) => frame >= v.start && frame < v.gradeAt + 24);

  const nodeHighlight = (id: Id) => {
    let best: { color: string; amount: number } | undefined;
    for (const v of active) {
      const i = v.path.indexOf(id as Exclude<Id, 'root'>);
      const from = id === 'root' ? v.start + ENTER : i >= 0 ? v.reach[i] : Infinity;
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

  // The visit, if any, that is waiting on the expert or the coding agent right now.
  const grading = TIMELINE.find((v) => frame >= v.replyAt && frame < v.gradeAt + 14);
  const fixing = TIMELINE.find((v) => v.typingAt !== undefined && frame >= v.typingAt && frame < v.sparkAt!);

  return (
    <AbsoluteFill style={{ background: color('surface') }}>
      <svg viewBox={`0 0 ${L.width} ${L.height}`} width="100%" height="100%" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
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

        {/* The expert, their grades, the store, me and the coding agent, joined as on the section maps:
            the grade and comment go into the store, comments go back and forth between it and me, and
            the nightly run takes mine to the coding agent. */}
        <defs>
          <ArrowMarker id={marker} />
        </defs>
        {[
          { d: `M${EXPERT.x},${L.tallyY + 18} V${STORE.y - 36}` },
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
        <Store x={STORE.x} y={STORE.y} />
        <Person x={ME.x} y={ME.y} scale={1.4} fill={color('text')} />
        <Label x={ME.x} y={ME.y + 52} size={L.labelSize}>
          Me
        </Label>
        <Expert x={EXPERT.x} y={EXPERT.y} scale={1.5 * (grading ? 1 + 0.06 * pop(grading.replyAt + TO_EXPERT - 6) : 1)} />
        <Label x={EXPERT.x} y={EXPERT.y + 48} size={L.labelSize}>
          Expert
        </Label>
        {TIMELINE.filter((v) => frame >= v.gradeAt).map((v, i) => {
          const x = EXPERT.x + (i - (SCRIPT.length - 1) / 2) * 18;
          return <Grade key={v.index} ok={v.ok} r={8} x={x} y={L.tallyY} scale={pop(v.gradeAt + 8)} />;
        })}

        <Agent x={AGENT.x} y={AGENT.y} scale={1.5} typing={fixing ? progress(frame, fixing.typingAt!, fixing.sparkAt! - 4) : 0} />
        <Label x={AGENT.x} y={AGENT.y + 52} size={L.labelSize}>
          Coding agent
        </Label>

        {active.map((v) => {
          const last = v.path[v.path.length - 1];
          const leafOut = outPoint(last);
          const parts = [];

          // The customer steps up, and leaves once their reply is graded.
          const enter = progress(frame, v.start, v.start + ENTER);
          const leave = progress(frame, v.gradeAt, v.gradeAt + 12);
          parts.push(
            <Person
              key="customer"
              x={lerp(L.customerFrom.x, L.customer.x, enter)}
              y={lerp(L.customerFrom.y, L.customer.y, enter) + 50 * leave}
              scale={1.5}
              opacity={enter * (1 - leave)}
              fill={v.color}
            />
          );

          // The message travels root → parent → leaf.
          const travelStart = v.start + ENTER;
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

          // The drafted reply goes to the expert, who grades it.
          if (frame >= v.replyAt && frame < v.gradeAt + 4) {
            const t = progress(frame, v.replyAt, v.gradeAt);
            const p = mix(D({ x: leafOut.x + 22, y: leafOut.y }), { x: EXPERT.x - 46, y: EXPERT.y + 6 }, t);
            parts.push(<Reply key="reply" x={p.x} y={p.y} scale={1.4} stroke={v.color} opacity={1 - progress(frame, v.gradeAt, v.gradeAt + 4)} />);
          }
          const shown = pop(v.gradeAt);
          if (shown > 0) {
            const fade = 1 - progress(frame, v.gradeAt + 16, v.gradeAt + 24);
            parts.push(<Grade key="grade" ok={v.ok} x={EXPERT.x + 46} y={EXPERT.y - 34} scale={shown} opacity={fade} />);
          }
          return <g key={v.index}>{parts}</g>;
        })}

        {/* A cross: the comment is stored, I pick it up and store mine on the fix, and the agent's nightly run grows the DAG. */}
        {TIMELINE.filter((v) => v.grows && frame >= v.storeAt! && frame < v.growAt! + 4).map((v) => {
          const parts = [];
          const travel = (from: Point, to: Point, start: number, end: number) => mix(from, to, progress(frame, start, end));
          if (frame < v.meAt! + TO_ME + 2) {
            // Into the store, then out of it to me.
            const p =
              frame < v.meAt!
                ? travel({ x: EXPERT.x, y: L.tallyY + 30 }, { x: STORE.x, y: STORE.y - 34 }, v.storeAt!, v.storeAt! + TO_STORE)
                : travel({ x: STORE.x + 30, y: STORE.y - 10 }, { x: ME.x - 10, y: ME.y - 44 }, v.meAt!, v.meAt! + TO_ME);
            parts.push(<Comment key="comment" x={p.x} y={p.y} scale={1.1} opacity={1 - progress(frame, v.meAt! + TO_ME - 2, v.meAt! + TO_ME + 2)} />);
          }
          if (frame >= v.mineAt! && frame < v.typingAt! + 4) {
            // My comment on the fix: into the store, and at night out of it to the coding agent.
            const p =
              frame < v.nightlyAt!
                ? travel({ x: ME.x + 10, y: ME.y - 44 }, { x: STORE.x - 10, y: STORE.y + 30 }, v.mineAt!, v.mineAt! + TO_ME)
                : travel({ x: STORE.x + 10, y: STORE.y + 30 }, { x: AGENT.x - 10, y: AGENT.y - 44 }, v.nightlyAt!, v.typingAt!);
            const fade = frame < v.nightlyAt! ? 1 : 1 - progress(frame, v.typingAt!, v.typingAt! + 4);
            parts.push(<Comment key="mine" x={p.x} y={p.y} scale={1.1} stroke={color('added')} opacity={fade} />);
          }
          if (frame >= v.sparkAt!) {
            const g = v.grows!;
            const target = D(
              g.node
                ? { x: NODES[g.node].x + NODES[g.node].w / 2, y: NODES[g.node].y }
                : edgePoint(outPoint(g.edge[0]), inPoint(g.edge[1]), 0.5)
            );
            const t = progress(frame, v.sparkAt!, v.growAt!);
            const from = { x: AGENT.x, y: AGENT.y - 34 };
            // Arc above the straight line, so the spark doesn't cut through the DAG's labels.
            const p = mix(from, target, t);
            const lift = Math.sin(Math.PI * t) * 60;
            parts.push(
              <circle
                key="spark"
                cx={p.x}
                cy={p.y - lift}
                r={8}
                fill={color('added')}
                opacity={1 - progress(frame, v.growAt!, v.growAt! + 4)}
              />
            );
          }
          return <g key={`fix-${v.index}`}>{parts}</g>;
        })}
      </svg>
    </AbsoluteFill>
  );
};
