/**
 * The automation workflow-vs-agent is about, as one map: a customer message
 * goes to intent recognition, an LLM call, which routes it either to a
 * workflow in code or to an agent. Both act only through the same tools,
 * which are code. Every action goes out through the tools, the reply
 * included; experts grade each reply, and their grades feed back into both
 * deciders: into the workflow as a new branch while code is the default, or a
 * request type graduating into code once the agent is; into the agent as its
 * prompt and the past tickets it may look at.
 *
 * Each section of the post shows the same map with its part highlighted and
 * the rest greyed out, like PipelineMap.tsx does for
 * first-level-support-automation. Static: rendered on the server, no
 * JavaScript.
 */
import { color, Agent, Envelope, Experts, Reply, type Point } from '../remotion/shared';
import { Dim, Tag, ArrowMarker } from './map-parts';

type NodeId = 'message' | 'intent' | 'workflow' | 'agent' | 'tools' | 'reply' | 'experts';
type EdgeId = 'toIntent' | 'direct' | 'known' | 'other' | 'workflowTools' | 'agentTools' | 'send' | 'grade' | 'feedback' | 'guide';
type Part = NodeId | EdgeId;
type Route = 'code' | 'agent';

export interface Preset {
  /** Parts drawn at full strength; everything else is greyed out. Empty means everything. */
  focus: Part[];
  /** Pills next to parts, e.g. "Default". */
  tags?: { on: NodeId; text: string }[];
  /** The route requests take unless intent recognition sends them the other way, which is dashed. Unset: neither, both solid. */
  default?: Route;
  /** The first design: the message goes straight to the agent, with no intent step and no workflow. */
  direct?: boolean;
  /** Only shows where a section sits in the system, so wide screens get it smaller. */
  small?: boolean;
  description: string;
}

export const PRESETS = {
  overview: {
    focus: [],
    description:
      'The system as one map: a message goes to intent recognition, an LLM call, which routes it to a workflow in code or to an agent. Both act through the same tools, which send the reply; experts grade it and their grades feed back into both the workflow and the agent.',
  },

  'agent-first': {
    focus: ['message', 'direct', 'agent', 'agentTools', 'tools', 'send', 'reply'],
    direct: true,
    tags: [{ on: 'agent', text: 'Any order' }],
    small: true,
    description:
      'Highlighted: the first design. The customer message goes straight to one agent holding every tool, which calls them in any order it chooses and sends the reply. Nothing makes it check the security flag before sending unlock instructions.',
  },
  // Before the fallback agent existed: no default, since there was no other route yet.
  workflow: {
    focus: ['message', 'toIntent', 'intent', 'known', 'workflow', 'workflowTools', 'tools', 'send', 'reply'],
    tags: [{ on: 'intent', text: 'One job' }],
    small: true,
    description:
      'Highlighted: the workflow. The LLM has one job, reading the message: it recognises the intent and extracts the identifier. Code does the rest, looking up the account, checking the flag and sending the template, always in that order.',
  },
  tree: {
    focus: ['workflow', 'feedback', 'experts'],
    default: 'code',
    tags: [{ on: 'workflow', text: 'Grows' }],
    small: true,
    description: 'Highlighted: the workflow, which grows a new branch each round of the experts’ feedback.',
  },
  // A pair with next-time: the same parts lit, the dashes swapped, the pill moved.
  fallback: {
    focus: ['intent', 'known', 'other', 'workflow', 'agent'],
    default: 'code',
    tags: [{ on: 'agent', text: 'Leftovers' }],
    small: true,
    description:
      'Highlighted: intent recognition sends known requests to the workflow, the default, and the rest by the dashed Other route to the agent.',
  },
  'next-time': {
    focus: ['intent', 'known', 'other', 'workflow', 'agent', 'feedback', 'guide', 'experts'],
    default: 'agent',
    tags: [{ on: 'agent', text: 'Default' }],
    small: true,
    description:
      'Highlighted: the routing next time. The agent is the default route; a request type takes the dashed route to the workflow only once it is common and the agent gets it wrong, or its action can’t be undone. The experts’ feedback goes into the agent’s prompt and examples, and graduates request types into the workflow.',
  },
} satisfies Record<string, Preset>;

export type PresetName = keyof typeof PRESETS;

/** Not drawn in the first design, which had no router and no workflow. */
const NOT_DIRECT: Part[] = ['intent', 'workflow', 'toIntent', 'known', 'other', 'workflowTools', 'feedback'];

/** What the routes and the feedback say, by which route is the default; the grade edge always says "Grade". */
const ROUTE_LABELS: Record<Route, Partial<Record<EdgeId, string>>> = {
  code: { known: 'Known', other: 'Other', feedback: 'New branch', guide: 'Prompt, examples' },
  agent: { known: 'Graduated', feedback: 'Graduate', guide: 'Prompt, examples' },
};

interface Label extends Point {
  anchor?: 'start' | 'middle' | 'end';
}

interface Layout {
  width: number;
  height: number;
  labelSize: number;
  /** The words on the edges: as big as the node names in the small and the phone maps, which are shown smaller. */
  edgeSize: number;
  tagSize: number;
  N: Record<NodeId, Point>;
  /** Paths for each edge; `twoWay` gives it an arrowhead at both ends, `label` is where its word goes if the preset gives it one. */
  edges: Record<EdgeId, { d: string; twoWay?: boolean; label?: Label }>;
  /** Where each node's name goes; what runs it ("LLM", "Code") sits under it. */
  labels: Record<NodeId, Label>;
  tags: Partial<Record<NodeId, Point>>;
}

/** Greyed parts a little stronger than the other posts' maps, so their labels stay readable in the small maps. */
const FADED = 0.34;

/** A step is drawn as a box this size with a small picture of what it does inside, as in PipelineMap.tsx. */
const BOX = { w: 160, h: 92 };

const WIDE: Layout = {
  width: 1050,
  height: 530,
  labelSize: 21,
  edgeSize: 19,
  tagSize: 19,
  // Symmetric about the middle line: the workflow above it, the agent below,
  // and the experts' feedback reaching each by mirrored arcs.
  N: {
    message: { x: 56, y: 270 },
    intent: { x: 216, y: 270 },
    workflow: { x: 450, y: 130 },
    agent: { x: 450, y: 410 },
    tools: { x: 680, y: 270 },
    reply: { x: 834, y: 270 },
    experts: { x: 1000, y: 270 },
  },
  edges: {
    toIntent: { d: 'M100,270 H132' },
    // Under where the intent step would be: the first design had none.
    direct: { d: 'M94,288 C180,352 300,410 395,410' },
    known: { d: 'M298,252 C336,252 330,130 366,130', label: { x: 322, y: 182, anchor: 'end' } },
    other: { d: 'M298,288 C336,288 330,410 395,410', label: { x: 322, y: 394, anchor: 'end' } },
    // Calls go in, results come back: both deciders act through the same tools.
    workflowTools: { d: 'M534,152 C580,152 562,252 596,252', twoWay: true },
    agentTools: { d: 'M501,398 C570,398 562,288 596,288', twoWay: true },
    send: { d: 'M764,270 H800' },
    grade: { d: 'M870,270 H950', label: { x: 908, y: 300 } },
    // Mirror images: up over the tools into the workflow, down under them into the agent.
    feedback: { d: 'M992,226 C980,120 760,104 534,108', label: { x: 760, y: 98 } },
    guide: { d: 'M992,314 C980,420 760,436 506,432', label: { x: 760, y: 462 } },
  },
  labels: {
    message: { x: 56, y: 340 },
    intent: { x: 216, y: 342 },
    workflow: { x: 450, y: 202 },
    agent: { x: 450, y: 476 },
    tools: { x: 680, y: 342 },
    reply: { x: 834, y: 336 },
    // Above and to the left: the grade comes in from the left, the feedback leaves at the top and bottom.
    experts: { x: 980, y: 214, anchor: 'end' },
  },
  tags: {
    intent: { x: 216, y: 192 },
    workflow: { x: 450, y: 46 },
    // Left of the agent, below the route coming in.
    agent: { x: 300, y: 466 },
  },
};

/** Bigger type for the small section maps, drawn at about two thirds of the column. */
const WIDE_SMALL: Layout = { ...WIDE, labelSize: 25, edgeSize: 25, tagSize: 23 };

/**
 * The same map for phones, top to bottom: the message and intent, the
 * workflow and the agent side by side, the tools under both, then the reply
 * and the experts; the feedback goes up both margins.
 */
const TALL: Layout = {
  width: 620,
  height: 960,
  labelSize: 25,
  edgeSize: 23,
  tagSize: 23,
  // Symmetric about the middle line, as the wide map is about its own.
  N: {
    message: { x: 310, y: 48 },
    intent: { x: 310, y: 176 },
    workflow: { x: 150, y: 350 },
    agent: { x: 470, y: 350 },
    tools: { x: 310, y: 610 },
    reply: { x: 310, y: 750 },
    experts: { x: 310, y: 880 },
  },
  edges: {
    toIntent: { d: 'M310,90 V125' },
    direct: { d: 'M338,76 C420,110 470,200 470,306' },
    known: { d: 'M226,186 C150,186 150,240 150,298', label: { x: 138, y: 250, anchor: 'end' } },
    other: { d: 'M394,186 C470,186 470,240 470,308', label: { x: 482, y: 250, anchor: 'start' } },
    workflowTools: { d: 'M234,362 C292,362 290,460 290,558', twoWay: true },
    agentTools: { d: 'M419,362 C330,362 330,460 330,558', twoWay: true },
    send: { d: 'M310,660 V708' },
    grade: { d: 'M310,794 V838', label: { x: 324, y: 824, anchor: 'start' } },
    // Mirror images up the two margins.
    feedback: { d: 'M262,884 C40,884 26,430 66,362', label: { x: 56, y: 700, anchor: 'start' } },
    guide: { d: 'M358,884 C580,884 600,400 526,362', label: { x: 564, y: 700, anchor: 'end' } },
  },
  labels: {
    message: { x: 362, y: 56, anchor: 'start' },
    intent: { x: 310, y: 254 },
    workflow: { x: 150, y: 428 },
    agent: { x: 470, y: 428 },
    tools: { x: 216, y: 604, anchor: 'end' },
    reply: { x: 350, y: 758, anchor: 'start' },
    experts: { x: 310, y: 946 },
  },
  tags: {
    // Under its labels, between the two routes.
    intent: { x: 310, y: 322 },
    workflow: { x: 150, y: 496 },
    agent: { x: 470, y: 496 },
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
function DecisionTree() {
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
  const dashed = (e: EdgeId) => e === 'feedback' || e === 'guide' || (e === 'known' && p.default === 'agent') || (e === 'other' && p.default === 'code');
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
          <Dim key={e} on={on(e)} faded={FADED}>
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
                fontSize={layout.edgeSize}
                fontWeight={500}
                fill={color('text')}
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
          <Dim key={n} on={on(n)} faded={FADED}>
            <NodeIcon id={n} at={N[n]} />
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
