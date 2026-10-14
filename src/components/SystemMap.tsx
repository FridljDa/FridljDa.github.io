/**
 * The whole system The Missing Test Suite is about, as one map: customers write
 * to the support agent, and in shadow its drafts land in the review tool I
 * built, a review screen with a store behind it. The tool sits between a team
 * of experts and me: they grade drafts and comment there, I read the comments
 * and add my own on how to fix each one, and nobody messages anybody directly.
 * Each night the coding agent implements the tickets I have commented on,
 * checks itself against evals and CI (the test suite it has) and ships back
 * into the support agent. For a new read tool the coding agent writes a spec,
 * which I hand to IT, the one handoff outside the review tool; their endpoint
 * becomes the support agent's read tool. Old tickets, the offline replay that
 * got the project started, only appear on the map of the section about them.
 *
 * Each section of the post shows the same map with its part highlighted and
 * the rest greyed out, so the post reads as one system seen from different
 * angles. Static: rendered on the server, no JavaScript.
 */
import { color, PALETTE, Person, Experts, Agent, Developer, Evals, Comment, Reply, type Point } from '../remotion/shared';
import { Dim, Badge, Tag, ArrowMarker } from './map-parts';

type NodeId = 'customers' | 'tickets' | 'support' | 'store' | 'tool' | 'expert' | 'me' | 'coder' | 'tests' | 'it' | 'endpoints';
type EdgeId =
  | 'messages'
  | 'replay'
  | 'drafts'
  | 'graded'
  | 'comment'
  | 'plan'
  | 'nightly'
  | 'checks'
  | 'ships'
  | 'spec'
  | 'build'
  | 'reads';

/** What a preset can highlight: a node or an edge. The review tool is two: the screen (`tool`) and the store behind it. */
type Part = NodeId | EdgeId;

export interface Preset {
  /**
   * Parts drawn at full strength; everything else is greyed out. Empty means
   * everything. Only what the section's prose talks about.
   */
  focus: Part[];
  /** Pills next to parts, e.g. "Bottleneck". */
  tags?: { on: NodeId; text: string }[];
  /** Before coding agents: I write the code myself. */
  meCodes?: boolean;
  /** Step 2 done by an agent with skills instead of me. */
  agentTranslates?: boolean;
  /** Only shows where a section sits in the system, so wide screens get it smaller. */
  small?: boolean;
  description: string;
}


export const PRESETS = {
  overview: {
    focus: [],
    description:
      'The whole system: customers write to the support agent; in shadow its drafts land in the review tool I built, a review screen with a store behind it. A team of experts, the support staff who answer those tickets, grades each draft there as they pick up its ticket, and I read their comments there in batches and add my own on how to fix each one; nobody messages anybody directly. Each night the coding agent implements the tickets I commented on, checks itself against evals and CI and ships into the support agent. For a new read tool, the coding agent writes a spec that I hand to IT, the one handoff outside the review tool, and IT build the endpoint.',
  },
  'coding-agents': {
    focus: ['coder', 'checks', 'tests'],
    small: true,
    description: 'Highlighted: the coding agent and its evals and CI, the verdict it gets on every attempt.',
  },
  'no-test-suite': {
    focus: ['customers', 'messages', 'support', 'expert'],
    small: true,
    description: 'Highlighted: customer messages, the support agent that drafts the replies, and the experts, the only verdict a reply can get.',
  },
  // "The loop we built": where the drafts land, then one map per step.
  'review-tool': {
    focus: ['support', 'drafts', 'tool', 'store'],
    small: true,
    description: 'Highlighted: in shadow, the support agent’s drafts land in the review tool I built, a review screen with a store behind it.',
  },
  grade: {
    focus: ['expert', 'graded', 'tool', 'store'],
    small: true,
    description: 'Highlighted: step 1, the experts grade drafts in the review tool, each in their own time; grades and comments stay there with their tickets.',
  },
  specify: {
    focus: ['tool', 'store', 'comment', 'me'],
    small: true,
    description: 'Highlighted: step 2, I read the experts’ comments in the review tool and add my own on how to fix each one.',
  },
  implement: {
    focus: ['tool', 'store', 'nightly', 'coder'],
    small: true,
    description: 'Highlighted: step 3, the coding agent’s nightly run takes the tickets I commented on from the review tool and implements them.',
  },
  check: {
    focus: ['coder', 'checks', 'tests'],
    small: true,
    description: 'Highlighted: step 4, evals and CI check the coding agent’s change, the same check a coding agent gets on every attempt.',
  },
  // The two maps of "The bottleneck moves": who writes the code, and where the bottleneck sits.
  before: {
    focus: ['me', 'plan', 'coder'],
    meCodes: true,
    tags: [{ on: 'coder', text: 'Bottleneck' }],
    description: 'Without coding agents: I would read the feedback, decide the fix and write the code myself, and writing the code would be the bottleneck.',
  },
  today: {
    focus: ['expert', 'coder'],
    tags: [{ on: 'expert', text: 'Bottleneck' }],
    description: 'Today: the coding agent writes the code; the bottleneck is the experts’ grading.',
  },
  endpoints: {
    focus: ['coder', 'spec', 'it', 'build', 'endpoints', 'reads', 'support'],
    tags: [{ on: 'it', text: 'Wait' }],
    small: true,
    description:
      'Highlighted: the coding agent writes a spec, I hand it to IT, and IT builds the endpoint, which becomes the support agent’s read tool. The handoff to IT adds a wait.',
  },
  shadow: {
    focus: ['tickets', 'replay', 'support'],
    small: true,
    description: 'Highlighted: old tickets replayed through the support agent offline, with no experts to grade the replies.',
  },
  'review-screen': {
    focus: ['expert', 'graded', 'tool'],
    tags: [{ on: 'tool', text: 'Build this' }],
    small: true,
    description: 'Highlighted: the review screen, the part of the review tool worth building. The store behind it stays greyed out.',
  },
  'next-bottleneck': {
    focus: ['me'],
    tags: [{ on: 'me', text: 'Next bottleneck' }],
    small: true,
    description: 'Highlighted: me, turning feedback into a comment the coding agent can implement, marked as the next bottleneck.',
  },
  'could-be': {
    focus: ['comment', 'me', 'nightly'],
    agentTranslates: true,
    tags: [{ on: 'me', text: 'Was me' }],
    description: 'Highlighted: an agent with skills reading the stored feedback and commenting on how to fix it, where I used to; the coding agent picks it up at night.',
  },
  start: {
    focus: ['customers', 'messages', 'support', 'drafts', 'tool', 'store', 'expert', 'graded'],
    tags: [{ on: 'tool', text: 'Build first' }],
    small: true,
    description: 'Highlighted: the shadow path, the review tool and the experts, the first thing to build.',
  },
} satisfies Record<string, Preset>;

export type PresetName = keyof typeof PRESETS;

interface Ride {
  at: Point;
  icon: 'comment' | 'mine' | 'plan' | 'person';
}

interface Layout {
  width: number;
  height: number;
  /** Bigger in the narrow layout, which is shown smaller. */
  labelSize?: number;
  /** The font size of a preset's pills. */
  tagSize?: number;
  N: Record<NodeId, Point>;
  /**
   * Paths for each edge. `rides` puts icons on it: the expert's comment, mine,
   * the plan, or the person passing the spec; `twoWay` gives it an arrowhead at
   * both ends, and `label` a short word next to it.
   */
  edges: Record<
    Exclude<EdgeId, 'checks'>,
    { d: string; dashed?: boolean; twoWay?: boolean; rides?: Ride[]; label?: Point & { text: string } }
  >;
  /** The coding agent's loop with evals and CI: there and back. */
  checks: [string, string];
  labels: Record<NodeId, Point & { anchor?: 'start' | 'middle' | 'end' }>;
  badges: Partial<Record<NodeId, Point>>;
  /** Where a preset's tag goes, by the part it marks. */
  tags: Partial<Record<NodeId, Point>>;
}

const WIDE: Layout = (() => {
  const N: Record<NodeId, Point> = {
    customers: { x: 86, y: 300 },
    tickets: { x: 86, y: 470 },
    support: { x: 300, y: 300 },
    // The review tool: the screen, with the store tucked behind its lower right corner.
    store: { x: 368, y: 178 },
    tool: { x: 300, y: 144 },
    expert: { x: 92, y: 144 },
    me: { x: 620, y: 84 },
    coder: { x: 620, y: 300 },
    tests: { x: 846, y: 300 },
    it: { x: 760, y: 470 },
    endpoints: { x: 500, y: 470 },
  };
  return {
    width: 960,
    height: 560,
    N,
    edges: {
      messages: { d: `M${N.customers.x + 40},300 H${N.support.x - 84}` },
      replay: { d: `M${N.tickets.x + 36},462 C190,462 180,330 ${N.support.x - 88},330`, dashed: true },
      drafts: { d: `M${N.support.x},${N.support.y - 50} V${N.tool.y + 48}` },
      // Drafts go out to the experts, grades and comments come back: all through the tool.
      graded: { d: `M146,144 H${N.tool.x - 70}`, twoWay: true, rides: [{ at: { x: 189, y: 144 }, icon: 'comment' }] },
      // Both comments stay in the tool: the experts' goes out to me, mine comes back.
      comment: {
        d: 'M368,118 C470,110 520,100 578,90',
        twoWay: true,
        rides: [
          { at: { x: 442, y: 110 }, icon: 'comment' },
          { at: { x: 522, y: 98 }, icon: 'mine' },
        ],
      },
      // Before coding agents only: I go from the feedback straight to the code.
      plan: { d: `M${N.me.x},${N.me.y + 40} V${N.coder.y - 46}`, rides: [{ at: { x: 620, y: 192 }, icon: 'plan' }] },
      nightly: { d: 'M402,190 C480,200 545,225 586,266', label: { x: 470, y: 238, text: 'Nightly' } },
      ships: { d: `M${N.coder.x - 50},300 H${N.support.x + 88}` },
      // The spec reaches IT through me, pinging someone on Teams.
      spec: { d: `M${N.coder.x + 40},${N.coder.y + 36} C720,350 ${N.it.x},380 ${N.it.x},${N.it.y - 40}`, rides: [{ at: { x: 742, y: 380 }, icon: 'person' }] },
      build: { d: `M${N.it.x - 46},470 H${N.endpoints.x + 46}` },
      reads: { d: `M${N.endpoints.x},${N.endpoints.y - 34} C${N.endpoints.x},380 470,330 ${N.support.x + 88},330` },
    },
    checks: [
      `M${N.coder.x + 48},286 C700,240 790,240 ${N.tests.x - 36},282`,
      `M${N.tests.x - 36},318 C790,360 700,360 ${N.coder.x + 48},314`,
    ],
    labels: {
      customers: { x: 86, y: 356 },
      tickets: { x: 86, y: 538 },
      support: { x: 300, y: 372 },
      store: { x: 0, y: 0 },
      tool: { x: 300, y: 78 },
      expert: { x: 92, y: 210 },
      me: { x: 620, y: 38 },
      coder: { x: 620, y: 366 },
      tests: { x: 846, y: 358 },
      it: { x: 760, y: 528 },
      endpoints: { x: 500, y: 526 },
    },
    badges: {
      expert: { x: 36, y: 100 },
      me: { x: N.me.x + 48, y: N.me.y + 32 },
      // Top right, so the nightly run can come in at the top left.
      coder: { x: N.coder.x + 56, y: N.coder.y - 48 },
      tests: { x: N.tests.x + 52, y: N.tests.y - 40 },
    },
    tags: {
      expert: { x: 110, y: 40 },
      tool: { x: 300, y: 26 },
      // Up and to the right, clear of step 2's badge in the small map's bigger pills.
      me: { x: 792, y: 76 },
      coder: { x: 620, y: 414 },
      it: { x: 870, y: 410 },
    },
  };
})();

/**
 * The same map for phones: two columns instead of four, the business side on
 * the left (customers, support agent, expert) and the build side on the right
 * (evals, coding agent, me, IT), so labels stay readable at a phone's width.
 */
const TALL: Layout = (() => {
  const N: Record<NodeId, Point> = {
    tickets: { x: 64, y: 84 },
    customers: { x: 230, y: 84 },
    support: { x: 150, y: 240 },
    store: { x: 218, y: 420 },
    tool: { x: 150, y: 386 },
    expert: { x: 150, y: 562 },
    me: { x: 480, y: 476 },
    coder: { x: 480, y: 240 },
    tests: { x: 480, y: 92 },
    it: { x: 480, y: 676 },
    endpoints: { x: 150, y: 676 },
  };
  return {
    width: 620,
    height: 760,
    labelSize: 25,
    N,
    edges: {
      messages: { d: 'M226,112 L196,184' },
      replay: { d: 'M78,112 L102,184', dashed: true },
      drafts: { d: 'M150,292 V336' },
      graded: { d: 'M150,434 V516', twoWay: true, rides: [{ at: { x: 150, y: 475 }, icon: 'comment' }] },
      comment: {
        d: 'M252,404 C340,410 400,425 440,452',
        twoWay: true,
        rides: [
          { at: { x: 318, y: 410 }, icon: 'comment' },
          { at: { x: 398, y: 426 }, icon: 'mine' },
        ],
      },
      plan: { d: 'M480,436 V322', rides: [{ at: { x: 480, y: 380 }, icon: 'plan' }] },
      nightly: { d: 'M216,346 C280,310 370,284 436,266', label: { x: 318, y: 300, text: 'Nightly' } },
      ships: { d: 'M430,240 H240' },
      spec: { d: 'M524,240 C620,300 618,620 528,654', rides: [{ at: { x: 596, y: 420 }, icon: 'person' }] },
      build: { d: 'M434,676 H188' },
      reads: { d: 'M116,666 C36,630 28,280 60,262' },
    },
    checks: ['M448,206 C418,180 422,140 454,114', 'M508,126 C542,148 544,178 514,202'],
    labels: {
      tickets: { x: 30, y: 40, anchor: 'start' },
      customers: { x: 236, y: 40 },
      support: { x: 244, y: 206, anchor: 'start' },
      store: { x: 0, y: 0 },
      tool: { x: 240, y: 384, anchor: 'start' },
      expert: { x: 210, y: 574, anchor: 'start' },
      me: { x: 480, y: 540 },
      coder: { x: 468, y: 306 },
      tests: { x: 480, y: 40 },
      it: { x: 480, y: 740 },
      endpoints: { x: 150, y: 740 },
    },
    badges: {
      expert: { x: 78, y: 534 },
      me: { x: 522, y: 450 },
      coder: { x: 536, y: 214 },
      tests: { x: 424, y: 76 },
    },
    tags: {
      expert: { x: 300, y: 610 },
      tool: { x: 380, y: 334 },
      // Under the label, clear of the spec's curve on the right.
      me: { x: 436, y: 578 },
      coder: { x: 335, y: 266 },
      it: { x: 340, y: 714 },
    },
  };
})();

const LABELS: Partial<Record<NodeId, string>> = {
  customers: 'Customers',
  tickets: 'Old tickets',
  support: 'Support agent',
  tool: 'Review tool',
  expert: 'Experts',
  me: 'Me',
  coder: 'Coding agent',
  tests: 'Evals & CI',
  it: 'IT',
  endpoints: 'Endpoints',
};

const STEPS: Partial<Record<NodeId, string>> = { expert: '1', me: '2', coder: '3', tests: '4' };

function NodeIcon({ id, at, agentTranslates, meCodes }: { id: NodeId; at: Point; agentTranslates?: boolean; meCodes?: boolean }) {
  const { x, y } = at;
  switch (id) {
    case 'customers':
      return (
        <g>
          <Person x={x - 22} y={y + 4} scale={1.1} fill={PALETTE[0]} />
          <Person x={x + 22} y={y + 4} scale={1.1} fill={PALETTE[2]} />
          <Person x={x} y={y - 4} scale={1.25} fill={PALETTE[1]} />
        </g>
      );
    case 'tickets':
      return (
        <g>
          {[8, 0, -8].map((o) => (
            <rect key={o} x={x - 26 + o} y={y - 22 - o} width={42} height={50} rx={4} fill={color('node-bg')} stroke={color('node-border')} strokeWidth={2} />
          ))}
          <line x1={x - 26} x2={x} y1={y - 4} y2={y - 4} stroke={color('node-border')} strokeWidth={2} />
          <line x1={x - 26} x2={x - 6} y1={y + 6} y2={y + 6} stroke={color('node-border')} strokeWidth={2} />
        </g>
      );
    case 'support': {
      // The system being built: a box holding a small intent DAG.
      const w = 168;
      const h = 100;
      const p = (dx: number, dy: number) => ({ x: x + dx, y: y + dy });
      const root = p(-50, 0);
      const mids = [p(0, -24), p(0, 24)];
      const leaves = [p(50, -34), p(50, -12), p(50, 12), p(50, 34)];
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
          <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={14} fill={color('node-bg')} stroke={color('node-border')} strokeWidth={2.5} />
          {links.map(([a, b], i) => (
            <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={color('node-border')} strokeWidth={2} />
          ))}
          {[root, ...mids, ...leaves].map((q, i) => (
            <circle key={i} cx={q.x} cy={q.y} r={i === 0 ? 9 : 7} fill={i === 0 ? color('node-border') : color('surface')} stroke={color('node-border')} strokeWidth={2} />
          ))}
        </g>
      );
    }
    case 'store':
      // The store behind the review screen: every draft, grade and comment.
      return (
        <g>
          <path d={`M${x - 26},${y - 18} v36 a26,9 0 0 0 52,0 v-36`} fill={color('node-bg')} stroke={color('node-border')} strokeWidth={2.5} />
          <ellipse cx={x} cy={y - 18} rx={26} ry={9} fill={color('node-bg')} stroke={color('node-border')} strokeWidth={2.5} />
          <path d={`M${x - 26},${y} a26,9 0 0 0 52,0`} fill="none" stroke={color('node-border')} strokeWidth={2} />
        </g>
      );
    case 'tool':
      // The review screen, in front of the store.
      return (
        <g>
          <rect x={x - 62} y={y - 42} width={124} height={84} rx={8} fill={color('node-bg')} stroke={color('text')} strokeWidth={2.5} />
          <rect x={x - 52} y={y - 32} width={50} height={8} rx={3} fill={color('node-border')} />
          <rect x={x - 52} y={y - 18} width={92} height={6} rx={3} fill={color('edge')} />
          <rect x={x - 52} y={y - 6} width={80} height={6} rx={3} fill={color('edge')} />
          <rect x={x - 52} y={y + 12} width={22} height={18} rx={4} fill={color('ok')} />
          <rect x={x - 24} y={y + 12} width={22} height={18} rx={4} fill={color('bad')} />
        </g>
      );
    case 'expert':
      return <Experts x={x} y={y} scale={1.45} />;
    case 'me':
      return agentTranslates ? <Agent x={x} y={y} scale={1.4} typing={1} /> : <Person x={x} y={y} scale={1.6} fill={color('text')} />;
    case 'coder':
      return meCodes ? <Developer x={x} y={y} scale={1.6} /> : <Agent x={x} y={y} scale={1.6} typing={1} />;
    case 'tests':
      return <Evals x={x} y={y} scale={1.4} />;
    case 'it':
      return (
        <g>
          <Person x={x - 18} y={y} scale={1.3} fill={color('text')} />
          <Agent x={x + 24} y={y + 8} scale={0.8} typing={1} />
        </g>
      );
    case 'endpoints':
      // A read tool for the support agent: a wrench.
      return (
        <g transform={`translate(${x} ${y}) rotate(-40)`}>
          <rect x={-4} y={-6} width={38} height={12} rx={6} fill={color('node-bg')} stroke={color('node-border')} strokeWidth={2.5} />
          <circle cx={-12} cy={0} r={15} fill={color('node-bg')} stroke={color('node-border')} strokeWidth={2.5} />
          <rect x={-30} y={-5} width={16} height={10} fill={color('surface')} />
          <path d="M-26.5,-5 H-14 V5 H-26.5" fill="none" stroke={color('node-border')} strokeWidth={2.5} strokeLinejoin="round" />
        </g>
      );
  }
}

function MapSvg({ layout, preset, id, className }: { layout: Layout; preset: Preset; id: string; className: string }) {
  const p = preset;
  const { N } = layout;
  const all = p.focus.length === 0;
  const on = (part: Part) => all || p.focus.includes(part);
  const marker = `${id}-arrow`;
  const shown = (part: NodeId | EdgeId) => {
    // A one-off at the start, not part of the loop: only drawn where a section is about it.
    if (part === 'tickets' || part === 'replay') return p.focus.includes(part);
    // Before coding agents I went from the feedback straight to the code; since, the agent's nightly run picks it up.
    if (part === 'plan') return !!p.meCodes;
    if (part === 'nightly') return !p.meCodes;
    return true;
  };

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

      {(Object.keys(layout.edges) as (keyof Layout['edges'])[]).filter(shown).map((e) => {
        const edge = layout.edges[e];
        // Before coding agents nobody passes my spec on, and I write no comments for an agent.
        const rides = (edge.rides ?? []).filter((r) => !(p.meCodes && (r.icon === 'person' || r.icon === 'mine')));
        return (
          <Dim key={e} on={on(e)}>
            <path
              d={edge.d}
              fill="none"
              stroke={color('node-border')}
              strokeWidth={2.5}
              strokeDasharray={edge.dashed ? '7 6' : undefined}
              markerEnd={`url(#${marker})`}
              markerStart={edge.twoWay && !p.meCodes ? `url(#${marker})` : undefined}
            />
            {rides.map((r) => (
              <g key={r.icon} transform={`translate(${r.at.x} ${r.at.y})`}>
                <circle r={26} fill={color('surface')} />
                {r.icon === 'comment' ? (
                  <Comment x={0} y={0} />
                ) : r.icon === 'mine' ? (
                  <Comment x={0} y={0} stroke={color('added')} />
                ) : r.icon === 'person' ? (
                  <Person x={0} y={0} scale={1.1} fill={color('text')} />
                ) : (
                  <Reply x={0} y={0} stroke={color('added')} scale={1.2} />
                )}
              </g>
            ))}
            {edge.label && (
              <text x={edge.label.x} y={edge.label.y} textAnchor="middle" fontSize={(layout.labelSize ?? 21) - 4} fontWeight={600} fill={color('muted')}>
                {edge.label.text}
              </text>
            )}
          </Dim>
        );
      })}

      {/* The coding agent's own loop: the verdict it gets for free */}
      <Dim on={on('checks')}>
        {layout.checks.map((d) => (
          <path key={d} d={d} fill="none" stroke={color('ok')} strokeWidth={3} markerEnd={`url(#${marker})`} />
        ))}
      </Dim>

      {(Object.keys(N) as NodeId[]).filter(shown).map((n) => {
        const text = n === 'me' && p.agentTranslates ? 'Agent + skills' : n === 'coder' && p.meCodes ? 'Me, coding' : LABELS[n];
        const label = layout.labels[n];
        const badge = layout.badges[n];
        return (
          <Dim key={n} on={on(n)}>
            <NodeIcon id={n} at={N[n]} agentTranslates={p.agentTranslates} meCodes={p.meCodes} />
            {text && (
              <text x={label.x} y={label.y} textAnchor={label.anchor ?? 'middle'} fontSize={layout.labelSize ?? 21} fontWeight={600} fill={color('text')}>
                {text}
              </text>
            )}
            {STEPS[n] && badge && <Badge {...badge} text={STEPS[n]!} />}
          </Dim>
        );
      })}

      {(p.tags ?? []).map((t) => (
        <Tag key={t.on} {...layout.tags[t.on]!} text={t.text} size={layout.tagSize ?? 19} />
      ))}
    </svg>
  );
}

/**
 * The wide map drawn at about two thirds of the column: bigger type, so it
 * stays readable, with two labels nudged clear of the lines next to them.
 */
const WIDE_SMALL: Layout = {
  ...WIDE,
  labelSize: 25,
  tagSize: 23,
  labels: { ...WIDE.labels, coder: { x: 610, y: 368 } },
};

/** Both layouts; SystemMap.astro shows the one that fits the figure's width. */
export default function SystemMap({ preset, id }: { preset: PresetName; id: string }) {
  const p: Preset = PRESETS[preset];
  return (
    <>
      <MapSvg layout={p.small ? WIDE_SMALL : WIDE} preset={p} id={`${id}-wide`} className="map-wide" />
      <MapSvg layout={TALL} preset={p} id={`${id}-tall`} className="map-tall" />
    </>
  );
}
