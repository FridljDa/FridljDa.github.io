/**
 * The pipeline first-level-support-automation is about, as one map: a
 * customer message goes to intent recognition and to extraction in parallel;
 * fetch looks up records with the extracted fields; plan generation takes the
 * intent's leaf and the records and drafts the reply and tool calls. A leaf
 * called "Other" has no plan in code and goes to the fallback agent instead.
 *
 * Each section of the post shows the same map with its part highlighted and
 * the rest greyed out, like SystemMap.tsx does for the-missing-compiler.
 * Static: rendered on the server, no JavaScript.
 */
import { color, PALETTE, Agent, Envelope, Evals, Reply, Store, type Point } from '../remotion/shared';
import { Dim, Badge, Tag, ArrowMarker } from './map-parts';

type NodeId = 'message' | 'intent' | 'extract' | 'fetch' | 'plan' | 'reply' | 'agent';
type EdgeId = 'toIntent' | 'toExtract' | 'fields' | 'leaf' | 'records' | 'toReply' | 'other' | 'fromAgent';
type Step = 'intent' | 'extract' | 'fetch' | 'plan';
type Part = NodeId | EdgeId;

export interface Preset {
  /** Parts drawn at full strength; everything else is greyed out. Empty means everything. */
  focus: Part[];
  /** Pills next to parts, e.g. "Default". */
  tags?: { on: NodeId; text: string }[];
  /** A checklist next to each step: its own evals. */
  evals?: boolean;
  /** Only shows where a section sits in the pipeline, so wide screens get it smaller. */
  small?: boolean;
  description: string;
}

const PLAN_PARTS: Part[] = ['intent', 'leaf', 'fetch', 'records', 'plan', 'toReply', 'reply', 'other', 'agent', 'fromAgent'];

export const PRESETS = {
  overview: {
    focus: [],
    description:
      'The pipeline: the customer message goes to intent recognition and to extraction, both LLM calls, in parallel. Fetch, in code, looks up records with the extracted fields. Plan generation, in code, takes the intent leaf and the records and writes the reply and tool calls; a leaf called Other goes to a fallback agent instead.',
  },
  intent: {
    focus: ['message', 'toIntent', 'intent'],
    small: true,
    description: 'Highlighted: step 1, intent recognition, an LLM call that classifies the message against the intent DAG.',
  },
  extract: {
    focus: ['message', 'toExtract', 'extract'],
    small: true,
    description: 'Highlighted: step 2, extraction, LLM calls that pull groups of fields out of the message.',
  },
  fetch: {
    focus: ['extract', 'fields', 'fetch'],
    small: true,
    description: 'Highlighted: step 3, fetch, code that looks up and scores records with the extracted fields.',
  },
  plan: {
    focus: PLAN_PARTS,
    small: true,
    description:
      'Highlighted: step 4, plan generation, code that takes the intent leaf and the fetched records and writes the reply and tool calls; a leaf called Other goes to the fallback agent.',
  },
  evals: {
    focus: ['intent', 'extract', 'fetch', 'plan'],
    evals: true,
    description: 'Highlighted: each of the four steps, each with its own evals.',
  },
  default: {
    focus: ['plan', 'toReply', 'reply', 'other', 'agent', 'fromAgent'],
    tags: [{ on: 'plan', text: 'Default' }],
    small: true,
    description: 'Highlighted: code plans the reply by default; only a leaf called Other goes to the agent.',
  },
} satisfies Record<string, Preset>;

export type PresetName = keyof typeof PRESETS;

interface Label extends Point {
  anchor?: 'start' | 'middle' | 'end';
}

interface Layout {
  width: number;
  height: number;
  labelSize: number;
  tagSize: number;
  N: Record<NodeId, Point>;
  edges: Record<EdgeId, { d: string; dashed?: boolean; label?: Label & { text: string } }>;
  /** Where each node's name goes; the step's kind ("LLM", "Code") sits under it. */
  labels: Record<NodeId, Label>;
  evals: Record<Step, Point>;
  tags: Partial<Record<NodeId, Point>>;
}

/** A step is drawn as a box this size with a small picture of what it does inside. */
const BOX = { w: 160, h: 92 };

const WIDE: Layout = {
  width: 960,
  height: 500,
  labelSize: 21,
  tagSize: 19,
  N: {
    message: { x: 60, y: 200 },
    intent: { x: 245, y: 100 },
    extract: { x: 245, y: 300 },
    fetch: { x: 485, y: 300 },
    plan: { x: 705, y: 200 },
    reply: { x: 880, y: 392 },
    agent: { x: 705, y: 392 },
  },
  edges: {
    toIntent: { d: 'M102,184 C140,184 130,100 161,100' },
    toExtract: { d: 'M102,216 C140,216 130,300 161,300' },
    fields: { d: 'M327,300 H401', label: { x: 364, y: 288, text: 'Fields' } },
    leaf: { d: 'M327,100 C495,100 535,180 621,180', label: { x: 440, y: 100, text: 'Leaf' } },
    records: { d: 'M567,300 C600,300 596,222 621,222', label: { x: 598, y: 248, anchor: 'end', text: 'Records' } },
    toReply: { d: 'M787,200 C850,200 880,260 880,350' },
    other: { d: 'M705,310 V352', dashed: true, label: { x: 717, y: 338, anchor: 'start', text: 'Other' } },
    fromAgent: { d: 'M747,392 H846' },
  },
  labels: {
    message: { x: 60, y: 270 },
    intent: { x: 245, y: 172 },
    extract: { x: 245, y: 372 },
    fetch: { x: 485, y: 372 },
    plan: { x: 705, y: 272 },
    reply: { x: 880, y: 458 },
    agent: { x: 705, y: 452 },
  },
  evals: {
    intent: { x: 356, y: 46 },
    extract: { x: 138, y: 380 },
    fetch: { x: 596, y: 396 },
    plan: { x: 814, y: 136 },
  },
  tags: { plan: { x: 705, y: 124 } },
};

/** Bigger type for the small section maps, drawn at about two thirds of the column. */
const WIDE_SMALL: Layout = { ...WIDE, labelSize: 25, tagSize: 23 };

/**
 * The same map for phones, in two columns: the LLM steps on top, fetch and
 * plan below them, and the reply and the agent at the bottom.
 */
const TALL: Layout = {
  width: 620,
  height: 760,
  labelSize: 25,
  tagSize: 23,
  N: {
    message: { x: 310, y: 56 },
    intent: { x: 150, y: 190 },
    extract: { x: 470, y: 190 },
    fetch: { x: 470, y: 420 },
    plan: { x: 150, y: 420 },
    reply: { x: 150, y: 640 },
    agent: { x: 470, y: 640 },
  },
  edges: {
    toIntent: { d: 'M278,84 C230,112 150,108 150,140' },
    toExtract: { d: 'M342,84 C390,112 470,108 470,140' },
    fields: { d: 'M470,312 V370', label: { x: 486, y: 348, anchor: 'start', text: 'Fields' } },
    leaf: { d: 'M150,312 V370', label: { x: 166, y: 348, anchor: 'start', text: 'Leaf' } },
    records: { d: 'M388,420 H236', label: { x: 312, y: 406, text: 'Records' } },
    toReply: { d: 'M150,540 V598' },
    other: { d: 'M234,452 C330,470 420,560 444,600', dashed: true, label: { x: 322, y: 530, text: 'Other' } },
    fromAgent: { d: 'M426,640 H184' },
  },
  labels: {
    message: { x: 362, y: 64, anchor: 'start' },
    intent: { x: 150, y: 268 },
    extract: { x: 470, y: 268 },
    fetch: { x: 470, y: 498 },
    plan: { x: 150, y: 498 },
    reply: { x: 150, y: 708 },
    agent: { x: 470, y: 708 },
  },
  evals: {
    intent: { x: 40, y: 130 },
    extract: { x: 580, y: 130 },
    fetch: { x: 580, y: 356 },
    plan: { x: 40, y: 356 },
  },
  tags: { plan: { x: 72, y: 336 } },
};

const NAMES: Record<NodeId, string> = {
  message: 'Message',
  intent: 'Intent',
  extract: 'Extract',
  fetch: 'Fetch',
  plan: 'Plan',
  reply: 'Reply',
  agent: 'Agent',
};

/** Under a step's name, what runs it; under the reply's, what comes with it. */
const KINDS: Partial<Record<NodeId, string>> = {
  intent: 'LLM',
  extract: 'LLM',
  fetch: 'Code',
  plan: 'Code',
  reply: '+ tool calls',
};

const STEPS: Record<Step, string> = { intent: '1', extract: '2', fetch: '3', plan: '4' };

/** Extraction's two groups, in the colors the post's extraction figure gives them. */
export const GROUP_COLORS = { people: PALETTE[1], account: PALETTE[3] };

function Box({ at }: { at: Point }) {
  return (
    <rect x={at.x - BOX.w / 2} y={at.y - BOX.h / 2} width={BOX.w} height={BOX.h} rx={14} fill={color('node-bg')} stroke={color('node-border')} strokeWidth={2.5} />
  );
}

function NodeIcon({ id, at }: { id: NodeId; at: Point }) {
  const { x, y } = at;
  const line = { stroke: color('node-border'), strokeWidth: 2 };
  switch (id) {
    case 'message':
      // The root of the intent DAG, as the DAG figures draw it.
      return (
        <g>
          <circle cx={x} cy={y} r={40} fill={color('node-bg')} stroke={color('node-border')} strokeWidth={2.5} />
          <Envelope x={x} y={y} scale={1.6} />
        </g>
      );
    case 'intent': {
      // A small intent DAG, with a leaf shared by two parents.
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
    case 'extract':
      // Two groups of fields, each a card of names and the values found.
      return (
        <g>
          <Box at={at} />
          {[
            { dy: -21, fill: GROUP_COLORS.people },
            { dy: 21, fill: GROUP_COLORS.account },
          ].map(({ dy, fill }) => (
            <g key={dy}>
              <rect x={x - 60} y={y + dy - 16} width={120} height={32} rx={6} fill={color('surface')} stroke={color('node-border')} strokeWidth={2} />
              <rect x={x - 50} y={y + dy - 7} width={30} height={6} rx={3} fill={color('edge')} />
              <rect x={x - 12} y={y + dy - 9} width={30} height={10} rx={5} fill={fill} />
              <rect x={x + 22} y={y + dy - 9} width={28} height={10} rx={5} fill={fill} />
              <rect x={x - 50} y={y + dy + 4} width={22} height={6} rx={3} fill={color('edge')} />
            </g>
          ))}
        </g>
      );
    case 'fetch': {
      // Records, and their scores against a threshold: one clears it.
      const base = y + 30;
      const bars = [
        { dx: 12, h: 58, fill: color('ok') },
        { dx: 32, h: 24, fill: color('node-border') },
        { dx: 52, h: 16, fill: color('node-border') },
      ];
      return (
        <g>
          <Box at={at} />
          <Store x={x - 38} y={y + 2} scale={0.8} />
          <line x1={x + 2} x2={x + 66} y1={base} y2={base} {...line} />
          {bars.map((b) => (
            <rect key={b.dx} x={x + b.dx - 7} y={base - b.h} width={14} height={b.h} rx={2} fill={b.fill} />
          ))}
          <line x1={x + 2} x2={x + 66} y1={base - 38} y2={base - 38} stroke={color('text')} strokeWidth={2} strokeDasharray="4 3" />
        </g>
      );
    }
    case 'plan': {
      // A decision on the fetched data, each branch ending in a template.
      const d = { x: x - 40, y };
      const ends = [-27, 0, 27].map((dy) => ({ x: x + 34, y: y + dy }));
      return (
        <g>
          <Box at={at} />
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
    case 'reply':
      return <Reply x={x} y={y} scale={2.6} stroke={color('node-border')} />;
    case 'agent':
      return <Agent x={x} y={y} scale={1.5} typing={1} />;
  }
}

function MapSvg({ layout, preset, id, className }: { layout: Layout; preset: Preset; id: string; className: string }) {
  const p = preset;
  const { N } = layout;
  const all = p.focus.length === 0;
  const on = (part: Part) => all || p.focus.includes(part);
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

      {(Object.keys(layout.edges) as EdgeId[]).map((e) => {
        const edge = layout.edges[e];
        return (
          <Dim key={e} on={on(e)}>
            <path
              d={edge.d}
              fill="none"
              stroke={color('node-border')}
              strokeWidth={2.5}
              strokeDasharray={edge.dashed ? '7 6' : undefined}
              markerEnd={`url(#${marker})`}
            />
            {edge.label && (
              <text
                x={edge.label.x}
                y={edge.label.y}
                textAnchor={edge.label.anchor ?? 'middle'}
                fontSize={layout.labelSize - 4}
                fontWeight={600}
                fill={color('muted')}
              >
                {edge.label.text}
              </text>
            )}
          </Dim>
        );
      })}

      {(Object.keys(N) as NodeId[]).map((n) => {
        const label = layout.labels[n];
        const kind = KINDS[n];
        const step = STEPS[n as Step];
        return (
          <Dim key={n} on={on(n)}>
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
            {step && <Badge x={N[n].x - BOX.w / 2 + 4} y={N[n].y - BOX.h / 2 + 4} text={step} />}
            {step && p.evals && <Evals {...layout.evals[n as Step]} scale={1.3} />}
          </Dim>
        );
      })}

      {(p.tags ?? []).map((t) => (
        <Tag key={t.on} {...layout.tags[t.on]!} text={t.text} size={layout.tagSize} />
      ))}
    </svg>
  );
}

/** Both layouts; PipelineMap.astro shows the one that fits the figure's width. */
export default function PipelineMap({ preset, id }: { preset: PresetName; id: string }) {
  const p: Preset = PRESETS[preset];
  return (
    <>
      <MapSvg layout={p.small ? WIDE_SMALL : WIDE} preset={p} id={`${id}-wide`} className="map-wide" />
      <MapSvg layout={TALL} preset={p} id={`${id}-tall`} className="map-tall" />
    </>
  );
}
