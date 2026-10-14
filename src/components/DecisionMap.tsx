/**
 * The automation workflow-vs-agent is about, as one map: a customer message
 * goes to intent recognition, an LLM call, which routes it either to a
 * workflow in code or to an agent. Both act only through the same tools,
 * which are code and can hold rules of their own, drawn as a shield on them.
 * Every action goes out through the tools, the reply included; experts grade
 * each reply, and their grades feed back into the workflow: a new branch while
 * code is the default, a request type graduating into code once the agent is.
 *
 * Each section of the post shows the same map with its part highlighted and
 * the rest greyed out, like PipelineMap.tsx does for
 * first-level-support-automation. Static: rendered on the server, no
 * JavaScript.
 */
import { color, Agent, Envelope, Experts, Reply, type Point } from '../remotion/shared';
import { Dim, Tag, ArrowMarker } from './map-parts';

type NodeId = 'message' | 'intent' | 'workflow' | 'agent' | 'tools' | 'reply' | 'experts';
type EdgeId = 'toIntent' | 'direct' | 'known' | 'other' | 'workflowTools' | 'agentTools' | 'send' | 'grade' | 'feedback';
type Part = NodeId | EdgeId;
type Route = 'code' | 'agent';

export interface Preset {
  /** Parts drawn at full strength; everything else is greyed out. Empty means everything. */
  focus: Part[];
  /** Pills next to parts, e.g. "Default". */
  tags?: { on: NodeId; text: string }[];
  /** The route requests take unless intent recognition sends them the other way, which is dashed. Unset: neither, both solid. */
  default?: Route;
  /** A rule inside the tools, which holds whoever calls them: a shield on the tools. */
  guard?: boolean;
  /** The first design: the message goes straight to the agent, with no intent step and no workflow. */
  direct?: boolean;
  /** Only shows where a section sits in the system, so wide screens get it smaller. */
  small?: boolean;
  description: string;
}

export const PRESETS = {
  overview: {
    focus: [],
    guard: true,
    description:
      'The system as one map: a customer message goes to intent recognition, an LLM call, which routes it either to a workflow in code or to an agent. Both act only through the same tools, which are code and can hold rules of their own, shown as a shield. The tools send the reply, and experts grade every reply; their grades feed back into the workflow.',
  },
  'agent-first': {
    focus: ['message', 'direct', 'agent', 'agentTools', 'tools', 'send', 'reply'],
    direct: true,
    tags: [{ on: 'agent', text: 'Any order' }],
    small: true,
    description:
      'Highlighted: the first design. The customer message goes straight to one agent holding every tool, which calls them in any order it chooses and sends the reply. Nothing makes it check the security flag before sending unlock instructions.',
  },
  workflow: {
    focus: ['message', 'toIntent', 'intent', 'known', 'workflow', 'workflowTools', 'tools', 'send', 'reply'],
    default: 'code',
    tags: [{ on: 'workflow', text: 'Default' }],
    small: true,
    description:
      'Highlighted: the workflow. An LLM call reads the message, recognising the intent and extracting the identifier; code does the rest, looking up the account, checking the flag and sending the template, always in that order.',
  },
  tree: {
    focus: ['workflow', 'feedback', 'experts'],
    default: 'code',
    tags: [{ on: 'workflow', text: 'Every cell' }],
    small: true,
    description:
      'Highlighted: the workflow, with the experts’ feedback adding a new branch to it each round. It needs a rule for every request on every account state.',
  },
  fallback: {
    focus: ['intent', 'known', 'workflow', 'other', 'agent', 'reply', 'grade', 'experts'],
    default: 'code',
    tags: [{ on: 'workflow', text: 'Default' }],
    small: true,
    description:
      'Highlighted: code is the default; only requests that land in an Other leaf go, by the dashed route, to the fallback agent. The experts grade every reply.',
  },
  guards: {
    focus: ['tools', 'workflowTools', 'agentTools', 'workflow', 'agent'],
    guard: true,
    tags: [{ on: 'tools', text: 'Must hold' }],
    small: true,
    description:
      'Highlighted: the tools, with a guard in them, and both routes into them: whether the workflow or the agent calls a tool, the rule inside it holds.',
  },
  // The end state, full size and all of it: the overview's parts, with the default swapped.
  'next-time': {
    focus: [],
    default: 'agent',
    guard: true,
    tags: [{ on: 'agent', text: 'Default' }],
    description:
      'Next time: the agent is the default route, and a request type takes the dashed route to a workflow in code only once the experts’ grades say it should graduate. The guard stays in the tools on both routes.',
  },
  rules: {
    focus: ['agent', 'agentTools', 'tools', 'experts'],
    default: 'agent',
    guard: true,
    tags: [{ on: 'experts', text: 'Know the rules' }],
    small: true,
    description:
      'Highlighted: the agent, which can read records through its tools, and the experts, who know the bank’s rules that nobody has written down.',
  },
  start: {
    focus: ['tools', 'agentTools', 'agent', 'send', 'reply', 'grade', 'experts', 'feedback', 'workflow'],
    default: 'agent',
    guard: true,
    tags: [{ on: 'tools', text: 'Build first' }],
    small: true,
    description:
      'Highlighted: what to build first. The rules in the tools, an agent behind them drafting replies, and the experts grading those replies; their grades decide which request types graduate into a workflow in code.',
  },
} satisfies Record<string, Preset>;

export type PresetName = keyof typeof PRESETS;

/** Not drawn in the first design, which had no router and no workflow. */
const NOT_DIRECT: Part[] = ['intent', 'workflow', 'toIntent', 'known', 'other', 'workflowTools', 'feedback'];

/** What the routes and the feedback say, by which route is the default; the grade edge always says "Grade". */
const ROUTE_LABELS: Record<Route, Partial<Record<EdgeId, string>>> = {
  code: { known: 'Known', other: 'Other', feedback: 'New branch' },
  agent: { known: 'Graduated', feedback: 'Graduate' },
};

interface Label extends Point {
  anchor?: 'start' | 'middle' | 'end';
}

interface Layout {
  width: number;
  height: number;
  labelSize: number;
  tagSize: number;
  N: Record<NodeId, Point>;
  /** Paths for each edge; `twoWay` gives it an arrowhead at both ends, `label` is where its word goes if the preset gives it one. */
  edges: Record<EdgeId, { d: string; twoWay?: boolean; label?: Label }>;
  /** Where each node's name goes; what runs it ("LLM", "Code") sits under it. */
  labels: Record<NodeId, Label>;
  /** The shield, on the tools' top right corner. */
  guard: Point;
  tags: Partial<Record<NodeId, Point>>;
}

/** A step is drawn as a box this size with a small picture of what it does inside, as in PipelineMap.tsx. */
const BOX = { w: 160, h: 92 };

const WIDE: Layout = {
  width: 960,
  height: 510,
  labelSize: 21,
  tagSize: 19,
  N: {
    message: { x: 60, y: 270 },
    intent: { x: 232, y: 270 },
    workflow: { x: 480, y: 130 },
    agent: { x: 480, y: 400 },
    tools: { x: 716, y: 270 },
    reply: { x: 892, y: 270 },
    experts: { x: 892, y: 130 },
  },
  edges: {
    toIntent: { d: 'M104,270 H148' },
    // Under where the intent step would be: the first design had none.
    direct: { d: 'M98,288 C200,352 320,400 429,400' },
    known: { d: 'M316,252 C360,252 356,130 396,130', label: { x: 340, y: 182, anchor: 'end' } },
    // Right of the curve, clear of the intent's "LLM".
    other: { d: 'M316,288 C360,288 356,400 429,400', label: { x: 372, y: 332, anchor: 'start' } },
    // Calls go in, results come back: both deciders act through the same tools.
    workflowTools: { d: 'M564,152 C612,152 596,252 632,252', twoWay: true },
    agentTools: { d: 'M531,388 C600,388 596,288 632,288', twoWay: true },
    send: { d: 'M800,270 H858' },
    grade: { d: 'M892,230 V168', label: { x: 880, y: 206, anchor: 'end' } },
    // Along the top, above the tools, crossing nothing.
    feedback: { d: 'M848,130 C740,130 660,108 564,108', label: { x: 704, y: 104 } },
  },
  labels: {
    message: { x: 60, y: 340 },
    intent: { x: 232, y: 342 },
    workflow: { x: 480, y: 202 },
    agent: { x: 480, y: 466 },
    tools: { x: 716, y: 342 },
    reply: { x: 892, y: 336 },
    // Above: the grade comes in underneath.
    experts: { x: 892, y: 84 },
  },
  guard: { x: 790, y: 228 },
  tags: {
    workflow: { x: 480, y: 46 },
    // Left of the agent, below the route coming in.
    agent: { x: 346, y: 456 },
    tools: { x: 716, y: 410 },
    // Left of centre, to stay inside the map.
    experts: { x: 838, y: 32 },
  },
};

/** Bigger type for the small section maps, drawn at about two thirds of the column. */
const WIDE_SMALL: Layout = { ...WIDE, labelSize: 25, tagSize: 23 };

/**
 * The same map for phones, top to bottom: the message and intent, the
 * workflow and the agent side by side, the tools under both, and the reply
 * with the experts next to it; the feedback goes up the left margin.
 */
const TALL: Layout = {
  width: 620,
  height: 850,
  labelSize: 25,
  tagSize: 23,
  N: {
    message: { x: 310, y: 48 },
    intent: { x: 310, y: 176 },
    workflow: { x: 150, y: 350 },
    agent: { x: 470, y: 350 },
    tools: { x: 310, y: 610 },
    reply: { x: 310, y: 750 },
    experts: { x: 150, y: 750 },
  },
  edges: {
    toIntent: { d: 'M310,90 V125' },
    direct: { d: 'M338,76 C420,110 470,200 470,306' },
    known: { d: 'M226,186 C150,186 150,240 150,298', label: { x: 138, y: 250, anchor: 'end' } },
    other: { d: 'M394,186 C470,186 470,240 470,308', label: { x: 482, y: 250, anchor: 'start' } },
    workflowTools: { d: 'M234,362 C292,362 290,460 290,558', twoWay: true },
    agentTools: { d: 'M419,362 C330,362 330,460 330,558', twoWay: true },
    send: { d: 'M310,660 V708' },
    grade: { d: 'M280,750 H195', label: { x: 238, y: 736 } },
    feedback: { d: 'M108,754 C30,730 26,420 66,362', label: { x: 56, y: 560, anchor: 'start' } },
  },
  labels: {
    message: { x: 362, y: 56, anchor: 'start' },
    intent: { x: 310, y: 254 },
    workflow: { x: 150, y: 428 },
    agent: { x: 470, y: 428 },
    tools: { x: 216, y: 604, anchor: 'end' },
    reply: { x: 350, y: 758, anchor: 'start' },
    experts: { x: 150, y: 704 },
  },
  guard: { x: 384, y: 568 },
  tags: {
    workflow: { x: 150, y: 496 },
    agent: { x: 470, y: 496 },
    tools: { x: 506, y: 616 },
    experts: { x: 150, y: 816 },
  },
};

const NAMES: Record<NodeId, string> = {
  message: 'Message',
  intent: 'Intent',
  workflow: 'Workflow',
  agent: 'Agent',
  tools: 'Tools',
  reply: 'Reply',
  experts: 'Experts',
};

/** Under a step's name, what runs it. */
const KINDS: Partial<Record<NodeId, string>> = {
  intent: 'LLM',
  workflow: 'Code',
  agent: 'LLM',
  tools: 'Code',
};

function Box({ at }: { at: Point }) {
  return (
    <rect x={at.x - BOX.w / 2} y={at.y - BOX.h / 2} width={BOX.w} height={BOX.h} rx={14} fill={color('node-bg')} stroke={color('node-border')} strokeWidth={2.5} />
  );
}

/** A decision in code, each branch ending in a template: PipelineMap's plan, centred on (0, 0). */
export function DecisionTree() {
  const line = { stroke: color('node-border'), strokeWidth: 2 };
  const d = { x: -40, y: 0 };
  const ends = [-27, 0, 27].map((dy) => ({ x: 34, y: dy }));
  return (
    <g>
      {ends.map((e) => (
        <path key={e.y} d={`M${d.x + 16},${d.y} C${d.x + 40},${d.y} ${e.x - 44},${e.y} ${e.x - 24},${e.y}`} fill="none" {...line} />
      ))}
      <path d={`M${d.x},${d.y - 18} L${d.x + 18},${d.y} L${d.x},${d.y + 18} L${d.x - 18},${d.y} Z`} fill={color('surface')} stroke={color('node-border')} strokeWidth={2.5} strokeLinejoin="round" />
      {ends.map((e) => (
        <rect key={e.y} x={e.x - 24} y={e.y - 9} width={48} height={18} rx={5} fill={color('surface')} stroke={color('node-border')} strokeWidth={2} />
      ))}
    </g>
  );
}

/**
 * A rule the tools enforce, whoever calls them: a shield with a check. Not a
 * padlock, which would read as the running example's locked account.
 */
export const Guard = ({ x, y, scale = 1 }: Point & { scale?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <path d="M0,-17 L14,-12 V-1 C14,8 8,14 0,18 C-8,14 -14,8 -14,-1 V-12 Z" fill={color('node-bg')} stroke={color('text')} strokeWidth={2.5} strokeLinejoin="round" />
    <path d="M-6,0 l4,4 l8,-9" fill="none" stroke={color('ok')} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
  </g>
);

function NodeIcon({ id, at }: { id: NodeId; at: Point }) {
  const { x, y } = at;
  const line = { stroke: color('node-border'), strokeWidth: 2 };
  switch (id) {
    case 'message':
      return (
        <g>
          <circle cx={x} cy={y} r={40} fill={color('node-bg')} stroke={color('node-border')} strokeWidth={2.5} />
          <Envelope x={x} y={y} scale={1.6} />
        </g>
      );
    case 'intent': {
      // A small intent DAG, as PipelineMap draws intent recognition.
      const p = (dx: number, dy: number) => ({ x: x + dx, y: y + dy });
      const root = p(-52, 0);
      const mids = [p(-2, -22), p(-2, 22)];
      const leaves = [p(48, -33), p(48, -11), p(48, 11), p(48, 33)];
      const links: [Point, Point][] = [
        [root, mids[0]],
        [root, mids[1]],
        [mids[0], leaves[0]],
        [mids[0], leaves[1]],
        [mids[0], leaves[2]],
        [mids[1], leaves[2]],
        [mids[1], leaves[3]],
      ];
      return (
        <g>
          <Box at={at} />
          {links.map(([a, b], i) => (
            <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} {...line} />
          ))}
          {[root, ...mids, ...leaves].map((q, i) => (
            <circle key={i} cx={q.x} cy={q.y} r={i === 0 ? 8 : 6.5} fill={i === 0 ? color('node-border') : color('surface')} stroke={color('node-border')} strokeWidth={2} />
          ))}
        </g>
      );
    }
    case 'workflow':
      return (
        <g>
          <Box at={at} />
          <g transform={`translate(${x} ${y})`}>
            <DecisionTree />
          </g>
        </g>
      );
    case 'agent':
      return <Agent x={x} y={y} scale={1.8} typing={1} />;
    case 'tools':
      // A wrench, as SystemMap draws a read tool; the jaw is cut in the box's own fill.
      return (
        <g>
          <Box at={at} />
          <g transform={`translate(${x - 6} ${y + 4}) rotate(-40) scale(1.25)`}>
            <rect x={-4} y={-6} width={38} height={12} rx={6} fill={color('node-bg')} stroke={color('node-border')} strokeWidth={2.5} />
            <circle cx={-12} cy={0} r={15} fill={color('node-bg')} stroke={color('node-border')} strokeWidth={2.5} />
            <rect x={-30} y={-5} width={16} height={10} fill={color('node-bg')} />
            <path d="M-26.5,-5 H-14 V5 H-26.5" fill="none" stroke={color('node-border')} strokeWidth={2.5} strokeLinejoin="round" />
          </g>
        </g>
      );
    case 'reply':
      return <Reply x={x} y={y} scale={2.6} stroke={color('node-border')} />;
    case 'experts':
      return <Experts x={x} y={y} scale={1.45} />;
  }
}

function MapSvg({ layout, preset, id, className }: { layout: Layout; preset: Preset; id: string; className: string }) {
  const p = preset;
  const { N } = layout;
  const all = p.focus.length === 0;
  const on = (part: Part) => all || p.focus.includes(part);
  const shown = (part: Part) => (part === 'direct' ? !!p.direct : !(p.direct && NOT_DIRECT.includes(part)));
  // The exception route is dashed, and so is the feedback, which changes the system rather than answering a request.
  const dashed = (e: EdgeId) => e === 'feedback' || (e === 'known' && p.default === 'agent') || (e === 'other' && p.default === 'code');
  const text = (e: EdgeId) => (e === 'grade' ? 'Grade' : p.default && ROUTE_LABELS[p.default][e]);
  const marker = `${id}-arrow`;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      role="img"
      aria-label={p.description}
      style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}
    >
      <defs>
        <ArrowMarker id={marker} />
      </defs>

      {(Object.keys(layout.edges) as EdgeId[]).filter(shown).map((e) => {
        const edge = layout.edges[e];
        const label = text(e);
        return (
          <Dim key={e} on={on(e)}>
            <path
              d={edge.d}
              fill="none"
              stroke={color('node-border')}
              strokeWidth={2.5}
              strokeDasharray={dashed(e) ? '7 6' : undefined}
              markerEnd={`url(#${marker})`}
              markerStart={edge.twoWay ? `url(#${marker})` : undefined}
            />
            {label && edge.label && (
              <text
                x={edge.label.x}
                y={edge.label.y}
                textAnchor={edge.label.anchor ?? 'middle'}
                fontSize={layout.labelSize - 4}
                fontWeight={600}
                fill={color('muted')}
              >
                {label}
              </text>
            )}
          </Dim>
        );
      })}

      {(Object.keys(N) as NodeId[]).filter(shown).map((n) => {
        const label = layout.labels[n];
        const kind = KINDS[n];
        return (
          <Dim key={n} on={on(n)}>
            <NodeIcon id={n} at={N[n]} />
            {n === 'tools' && p.guard && <Guard {...layout.guard} scale={1.3} />}
            <text x={label.x} y={label.y} textAnchor={label.anchor ?? 'middle'} fontSize={layout.labelSize} fontWeight={600} fill={color('text')}>
              {NAMES[n]}
            </text>
            {kind && (
              <text
                x={label.x}
                y={label.y + layout.labelSize + 2}
                textAnchor={label.anchor ?? 'middle'}
                fontSize={layout.labelSize - 4}
                fontWeight={600}
                fill={color('muted')}
              >
                {kind}
              </text>
            )}
          </Dim>
        );
      })}

      {(p.tags ?? []).map((t) => (
        <Tag key={t.on} {...layout.tags[t.on]!} text={t.text} size={layout.tagSize} />
      ))}
    </svg>
  );
}

/** Both layouts; DecisionMap.astro shows the one that fits the figure's width. */
export default function DecisionMap({ preset, id }: { preset: PresetName; id: string }) {
  const p: Preset = PRESETS[preset];
  return (
    <>
      <MapSvg layout={p.small ? WIDE_SMALL : WIDE} preset={p} id={`${id}-wide`} className="map-wide" />
      <MapSvg layout={TALL} preset={p} id={`${id}-tall`} className="map-tall" />
    </>
  );
}
