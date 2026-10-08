/**
 * The shadow-deployment loop: customers write in one at a time, each message
 * runs through the intent DAG to a leaf, and the subject-matter expert grades
 * the drafted reply. Most grades are a check. A cross sends the expert's
 * comment to the coding agent, which grows the DAG, and the next customer with
 * that request reaches the new leaf.
 *
 * The DAG ends as drawn in first-level-support-automation ("Step 1: Intent
 * recognition"). Nodes never move: every later node already has its slot, so
 * growing only fades in a node or draws in an edge.
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
  Agent,
  Envelope,
  Reply,
  Comment,
  Grade,
  Label,
  type Point,
} from './shared';

type Kind = 'intent' | 'other';

interface DagNode {
  label: string;
  kind: Kind;
  x: number;
  y: number;
  w: number;
}

const NODE_H = 42;
const row = (i: number) => 64 + 56 * i;
const PARENT = { x: 262, w: 172 };
const LEAF = { x: 514, w: 184 };

const parent = (label: string, y: number, kind: Kind = 'intent'): DagNode => ({ label, kind, ...PARENT, y });
const leaf = (label: string, i: number, kind: Kind = 'intent'): DagNode => ({ label, kind, ...LEAF, y: row(i) });

// Parents sit level with the middle of their leaves; the shared leaf sits between its two parents.
const NODES = {
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

type Id = keyof typeof NODES | 'root';

const ROOT: Point & { r: number } = { x: 196, y: (NODES.access.y + NODES.rootOther.y) / 2, r: 30 };

const EDGES = [
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

const outPoint = (id: Id): Point =>
  id === 'root' ? { x: ROOT.x + ROOT.r, y: ROOT.y } : { x: NODES[id].x + NODES[id].w, y: NODES[id].y };
const inPoint = (id: Exclude<Id, 'root'>): Point => ({ x: NODES[id].x, y: NODES[id].y });

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
  { path: ['cards', 'blocked'] },
  { path: ['cards', 'cardsOther'], grows: { edge: ['cards', 'locked'] } },
  { path: ['cards', 'locked'] },
  { path: ['access', 'login'] },
];

/** Parts of the DAG that only exist once a cross has grown them. */
const GROWN_NODES = new Set(SCRIPT.flatMap((v) => (v.grows?.node ? [v.grows.node] : [])));
const GROWN_EDGES = new Set(SCRIPT.flatMap((v) => (v.grows ? [edgeKey(...v.grows.edge)] : [])));

// Beats, in frames.
const ENTER = 10;
const HOP = 11;
const TO_EXPERT = 14;
const COMMENT = 16;
const TYPING = 26;
const SPARK = 14;
const GROW = 18;
const HOLD = 60;

const CUSTOMER: Point = { x: 96, y: ROOT.y };
const EXPERT: Point = { x: 846, y: 150 };
const AGENT: Point = { x: 846, y: 408 };
const TALLY_Y = 238;

interface Timed extends Visit {
  index: number;
  color: string;
  ok: boolean;
  start: number;
  /** Frame the message reaches each node of its path. */
  reach: number[];
  replyAt: number;
  gradeAt: number;
  commentAt?: number;
  typingAt?: number;
  sparkAt?: number;
  growAt?: number;
}

const TIMELINE: Timed[] = [];
let cursor = 0;
for (const [index, visit] of SCRIPT.entries()) {
  const start = cursor;
  const reach = visit.path.map((_, i) => start + ENTER + HOP * (i + 1));
  const replyAt = reach[reach.length - 1] + 6;
  const gradeAt = replyAt + TO_EXPERT;
  const timed: Timed = { ...visit, index, color: PALETTE[index % PALETTE.length], ok: !visit.grows, start, reach, replyAt, gradeAt };
  if (visit.grows) {
    timed.commentAt = gradeAt + 10;
    timed.typingAt = timed.commentAt + COMMENT;
    timed.sparkAt = timed.typingAt + TYPING;
    timed.growAt = timed.sparkAt + SPARK;
    cursor = timed.growAt + GROW + 6;
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

/** How lit a visit's path is: on while the message travels and is graded, then fading out. */
const lit = (frame: number, visit: Timed, from: number) => {
  if (frame < from) return 0;
  return 1 - progress(frame, visit.gradeAt + 8, visit.gradeAt + 20);
};

export const ShadowLoop = () => {
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
      <svg viewBox="0 0 960 540" width="100%" height="100%" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
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

        {/* The expert, their grades, and the coding agent; comments travel down the dashed line. */}
        <line x1={EXPERT.x} x2={EXPERT.x} y1={TALLY_Y + 22} y2={AGENT.y - 44} stroke={color('edge')} strokeWidth={2} strokeDasharray="4 6" />
        <Expert x={EXPERT.x} y={EXPERT.y} scale={1.5 * (grading ? 1 + 0.06 * pop(grading.replyAt + TO_EXPERT - 6) : 1)} />
        <Label x={EXPERT.x} y={EXPERT.y + 46}>
          Expert
        </Label>
        {TIMELINE.filter((v) => frame >= v.gradeAt).map((v, i) => {
          const x = EXPERT.x + (i - (SCRIPT.length - 1) / 2) * 18;
          return <Grade key={v.index} ok={v.ok} r={8} x={x} y={TALLY_Y} scale={pop(v.gradeAt + 8)} />;
        })}

        <Agent x={AGENT.x} y={AGENT.y} scale={1.5} typing={fixing ? progress(frame, fixing.typingAt!, fixing.sparkAt! - 4) : 0} />
        <Label x={AGENT.x} y={AGENT.y + 54}>
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
              x={lerp(-40, CUSTOMER.x, enter)}
              y={CUSTOMER.y + 50 * leave}
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
            parts.push(<circle key="msg" cx={p.x} cy={p.y} r={9} fill={v.color} opacity={fade} />);
          }

          // The drafted reply goes to the expert, who grades it.
          if (frame >= v.replyAt && frame < v.gradeAt + 4) {
            const t = progress(frame, v.replyAt, v.gradeAt);
            const p = mix({ x: leafOut.x + 22, y: leafOut.y }, { x: EXPERT.x - 46, y: EXPERT.y + 6 }, t);
            parts.push(<Reply key="reply" x={p.x} y={p.y} scale={1.4} stroke={v.color} opacity={1 - progress(frame, v.gradeAt, v.gradeAt + 4)} />);
          }
          const shown = pop(v.gradeAt);
          if (shown > 0) {
            const fade = 1 - progress(frame, v.gradeAt + 16, v.gradeAt + 24);
            parts.push(<Grade key="grade" ok={v.ok} x={EXPERT.x + 46} y={EXPERT.y - 34} scale={shown} opacity={fade} />);
          }
          return <g key={v.index}>{parts}</g>;
        })}

        {/* A cross: the expert's comment goes to the agent, and the agent's fix grows the DAG. */}
        {TIMELINE.filter((v) => v.grows && frame >= v.commentAt! && frame < v.growAt! + 4).map((v) => {
          const parts = [];
          if (frame < v.typingAt! + 4) {
            const t = progress(frame, v.commentAt!, v.typingAt!);
            const p = mix({ x: EXPERT.x, y: EXPERT.y + 80 }, { x: AGENT.x, y: AGENT.y - 60 }, t);
            parts.push(<Comment key="comment" x={p.x} y={p.y} scale={1.2} opacity={1 - progress(frame, v.typingAt!, v.typingAt! + 4)} />);
          }
          if (frame >= v.sparkAt!) {
            const g = v.grows!;
            const target = g.node
              ? { x: NODES[g.node].x + NODES[g.node].w / 2, y: NODES[g.node].y }
              : edgePoint(outPoint(g.edge[0]), inPoint(g.edge[1]), 0.5);
            const t = progress(frame, v.sparkAt!, v.growAt!);
            const from = { x: AGENT.x - 44, y: AGENT.y };
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
