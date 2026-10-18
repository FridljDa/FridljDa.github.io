/**
 * The design of from-drawing-to-quote as one top-to-bottom map: requests
 * arrive in the shared inbox, intake checks them, drawing extraction reads
 * the drawings, assessment proposes machine and tooling from written rules
 * and similar past parts, calculation prices the variants, the expert
 * reviews, and handover produces the offer and the ERP fields. The expert's
 * changes go back to assessment as rule proposals.
 *
 * Like the design map of uncoded-hospital-revenue (DesignMap.tsx), it gains
 * detail as the post goes on: a black box while the requirements are open,
 * then seven abstract boxes, then the components inside each box. Later
 * sections highlight their part, grey out the rest, and show the components
 * only for the highlighted boxes. Vertical by design, so phones and wide
 * screens share one layout. Static: rendered on the server, no JavaScript.
 */
import type { ReactNode } from 'react';
import { color, Agent, Envelope, Evals, Expert, Gauge, Reply, Store, type Point } from '../remotion/shared';
import { Dim, Tag, ArrowMarker } from './map-parts';

type NodeId = 'inbox' | 'system' | 'intake' | 'extract' | 'assess' | 'calculate' | 'review' | 'handover';
type Part = NodeId | 'loop';
/** blackbox: one unknown box between input and output. boxes: the seven steps. detail: each step with its components. */
type Level = 'blackbox' | 'boxes' | 'detail';
/** Who a box belongs to, which sets its outline: the manufacturer's mailbox, the platform, or the expert. */
type Role = 'company' | 'platform' | 'human';

export interface Preset {
  level: Level;
  /** Parts drawn at full strength, with their components; everything else is greyed out and shown by name only. Empty means everything. */
  focus: Part[];
  /** Pills on the top right of a box, e.g. "LLM reads". */
  tags?: { on: NodeId; text: string }[];
  description: string;
}

export const PRESETS = {
  clarify: {
    level: 'blackbox',
    focus: [],
    tags: [{ on: 'system', text: 'Unknown' }],
    description: 'Before any design: a request for a quote goes into an unknown system, and an offer should come out.',
  },
  'end-to-end': {
    level: 'boxes',
    focus: [],
    description:
      'The simplest design: requests arrive in the inbox, intake checks them, drawing extraction reads the drawings, assessment proposes machine and tooling, calculation prices the variants, the expert reviews, and handover produces the offer. The expert’s changes go back to assessment as rule proposals.',
  },
  components: {
    level: 'detail',
    focus: [],
    description:
      'The same seven steps with their components: the shared mailbox with drawings; intake deciding request or not and the product line, one draft per drawing; a vision LLM filling a typed record with a source per value, then the checklist and the question to the customer; written rules and similar past parts proposing machine and tooling hours; a cost-plus calculation in code for both machines and each quantity break; the expert reviewing with the drawing beside the draft; the offer PDF, the mail and the ERP fields.',
  },
  intake: {
    level: 'detail',
    focus: ['inbox', 'intake'],
    description: 'Highlighted: the inbox and intake, which decides whether an email is a request and its product line, and splits it into one draft per drawing.',
  },
  extract: {
    level: 'detail',
    focus: ['extract'],
    tags: [{ on: 'extract', text: 'LLM reads' }],
    description: 'Highlighted: drawing extraction, a vision LLM filling a typed record with the source of every value, then a checklist that finds what is missing and drafts the question to the customer.',
  },
  assess: {
    level: 'detail',
    focus: ['assess'],
    tags: [{ on: 'assess', text: 'Rules constrain' }],
    description: 'Highlighted: assessment, where written rules set what is allowed and similar past parts propose the machine and the tooling hours within it.',
  },
  calculate: {
    level: 'detail',
    focus: ['calculate'],
    tags: [{ on: 'calculate', text: 'Code only' }],
    description: 'Highlighted: calculation, a cost-plus scheme in code, priced for each machine that can make the part and each quantity break.',
  },
  review: {
    level: 'detail',
    focus: ['review'],
    tags: [{ on: 'review', text: 'Adoption' }],
    description: 'Highlighted: the expert’s review, with the drawing beside the draft and a reason for every change.',
  },
  handover: {
    level: 'detail',
    focus: ['handover'],
    description: 'Highlighted: handover, which produces the offer PDF, the mail to the customer and the fields for the ERP.',
  },
  rules: {
    level: 'detail',
    focus: ['review', 'loop', 'assess'],
    tags: [{ on: 'assess', text: 'Proposals' }],
    description: 'Highlighted: the expert’s changes going back to assessment as proposed rules, which the expert approves.',
  },
  life: {
    level: 'detail',
    focus: ['inbox', 'intake', 'extract', 'assess', 'calculate', 'review', 'handover'],
    description: 'Highlighted: the path of the running example, from the inbox through intake, extraction, assessment and calculation to the expert’s review and the offer.',
  },
  finishing: {
    level: 'detail',
    focus: ['review', 'loop'],
    tags: [{ on: 'review', text: 'Evals' }],
    description: 'Highlighted: the expert’s changes, which are both the evaluation and the source of new rules.',
  },
} satisfies Record<string, Preset>;

export type PresetName = keyof typeof PRESETS;

const NODES: Record<NodeId, { name: string; role: Role; detail: string[] }> = {
  inbox: { name: 'Inbox', role: 'company', detail: ['Shared mailbox', 'Drawings, 3D models'] },
  system: { name: '?', role: 'platform', detail: [] },
  intake: { name: 'Intake', role: 'platform', detail: ['Request or not', 'Product line', 'One draft per drawing'] },
  extract: { name: 'Drawing extraction', role: 'platform', detail: ['Vision LLM', 'Source per value', 'Checklist, question'] },
  assess: { name: 'Assessment', role: 'platform', detail: ['Written rules', 'Similar past parts', 'Machine, tooling hours'] },
  calculate: { name: 'Calculation', role: 'platform', detail: ['Cost-plus, in code', 'Both machines', 'Quantity breaks'] },
  review: { name: 'Review', role: 'human', detail: ['Drawing beside draft', 'Edit with a reason'] },
  handover: { name: 'Handover', role: 'platform', detail: ['Offer PDF, mail', 'ERP fields to copy'] },
};

/** Each step's icon from shared.tsx, centred on (x, y). */
function NodeIcon({ id, at }: { id: NodeId; at: Point }): ReactNode {
  switch (id) {
    case 'inbox':
      return <Envelope {...at} scale={1.2} />;
    case 'intake':
      return <Evals {...at} scale={0.8} />;
    case 'extract':
      return <Agent {...at} scale={0.78} typing={1} />;
    case 'assess':
      return <Store {...at} scale={0.62} />;
    case 'calculate':
      return <Gauge {...at} scale={1.5} />;
    case 'review':
      return <Expert {...at} scale={0.95} />;
    case 'handover':
      return <Reply {...at} scale={1.1} stroke={color('node-border')} />;
    case 'system':
      return null;
  }
}

const ORDER: Record<Level, NodeId[]> = {
  blackbox: ['inbox', 'system', 'handover'],
  boxes: ['inbox', 'intake', 'extract', 'assess', 'calculate', 'review', 'handover'],
  detail: ['inbox', 'intake', 'extract', 'assess', 'calculate', 'review', 'handover'],
};

/** In the black box, the input is just a request and the output an offer. */
const BLACKBOX_NAMES: Partial<Record<NodeId, string>> = { inbox: 'Request', handover: 'Offer' };

const W = 470;
const BOX = { x: 76, w: 370 };
/** Where a box's title and component lines start, right of its icon. */
const TEXT_X = BOX.x + 82;
const TITLE = 23;
const DETAIL = 20;
const GAP = 44;
const PAD = 22;

const STROKE: Record<Role, string> = {
  company: color('node-border'),
  platform: color('added'),
  human: color('ok'),
};

const LEGEND: { role: Role; text: string; width: number }[] = [
  { role: 'company', text: 'Manufacturer', width: 165 },
  { role: 'platform', text: 'Platform', width: 120 },
  { role: 'human', text: 'Expert', width: 90 },
];

export default function QuoteMap({ preset, id }: { preset: PresetName; id: string }) {
  const p: Preset = PRESETS[preset];
  const order = ORDER[p.level];
  const all = p.focus.length === 0;
  const on = (part: Part) => all || p.focus.includes(part);
  const lines = (n: NodeId) => (p.level === 'detail' && on(n) ? NODES[n].detail : []);

  let y = PAD + 14;
  const boxes = order.map((n) => {
    const h = n === 'system' ? 110 : 68 + lines(n).length * (DETAIL + 8);
    const b = { id: n, y, h };
    y += h + GAP;
    return b;
  });
  // Room under the last box for the legend.
  const height = y - GAP + PAD + 36;
  const at = Object.fromEntries(boxes.map((b) => [b.id, b])) as Record<NodeId, (typeof boxes)[number]>;
  const marker = `${id}-arrow`;
  const cx = BOX.x + BOX.w / 2;
  const showLoop = p.level !== 'blackbox';
  const legendWidth = LEGEND.reduce((sum, l) => sum + l.width, 0);

  return (
    <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label={p.description} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      <defs>
        <ArrowMarker id={marker} />
      </defs>

      {boxes.slice(1).map((b, i) => {
        const prev = boxes[i];
        return (
          <Dim key={b.id} on={on(prev.id) && on(b.id)} faded={0.3}>
            <path d={`M${cx},${prev.y + prev.h} V${b.y - 4}`} stroke={color('node-border')} strokeWidth={2.5} markerEnd={`url(#${marker})`} />
          </Dim>
        );
      })}

      {showLoop && (
        <Dim on={on('loop')} faded={0.3}>
          {/* The expert's changes go back up the left margin to assessment: dashed, since they change the rules rather than a quote. */}
          <path
            d={`M${BOX.x},${at.review.y + at.review.h / 2} H${BOX.x - 40} V${at.assess.y + at.assess.h / 2} H${BOX.x - 6}`}
            fill="none"
            stroke={color('node-border')}
            strokeWidth={2.5}
            strokeDasharray="7 6"
            markerEnd={`url(#${marker})`}
          />
          <text
            transform={`translate(${BOX.x - 52} ${(at.assess.y + at.review.y + at.review.h) / 2}) rotate(-90)`}
            textAnchor="middle"
            fontSize={DETAIL}
            fontWeight={600}
            fill={color('text')}
          >
            Rule proposals
          </text>
        </Dim>
      )}

      {boxes.map((b) => {
        const node = NODES[b.id];
        const name = (p.level === 'blackbox' && BLACKBOX_NAMES[b.id]) || node.name;
        const unknown = b.id === 'system';
        return (
          <Dim key={b.id} on={on(b.id)} faded={0.3}>
            <rect
              x={BOX.x}
              y={b.y}
              width={BOX.w}
              height={b.h}
              rx={14}
              fill={color('node-bg')}
              stroke={STROKE[node.role]}
              strokeWidth={2.5}
              strokeDasharray={unknown ? '7 6' : undefined}
            />
            {unknown ? (
              <text x={cx} y={b.y + b.h / 2} dy="0.35em" textAnchor="middle" fontSize={44} fontWeight={600} fill={color('muted')}>
                ?
              </text>
            ) : (
              <>
                <NodeIcon id={b.id} at={{ x: BOX.x + 42, y: b.y + 34 }} />
                <text x={TEXT_X} y={b.y + 34} dy="0.35em" fontSize={TITLE} fontWeight={600} fill={color('text')}>
                  {name}
                </text>
                {lines(b.id).map((line, i) => (
                  <text key={line} x={TEXT_X} y={b.y + 34 + (i + 1) * (DETAIL + 8)} dy="0.35em" fontSize={DETAIL} fontWeight={500} fill={color('muted')}>
                    {line}
                  </text>
                ))}
              </>
            )}
          </Dim>
        );
      })}

      {(p.tags ?? []).map((t) => {
        const b = at[t.on];
        const width = t.text.length * 17 * 0.59 + 44;
        return <Tag key={t.on} x={BOX.x + BOX.w - width / 2 + 16} y={b.y} text={t.text} size={17} />;
      })}

      <g transform={`translate(${(W - legendWidth) / 2} ${height - 18})`} fontSize={18} fontWeight={600}>
        {LEGEND.map((l, i) => (
          <g key={l.role} transform={`translate(${LEGEND.slice(0, i).reduce((sum, x) => sum + x.width, 0)} 0)`}>
            <rect x={0} y={-14} width={16} height={16} rx={4} fill={color('node-bg')} stroke={STROKE[l.role]} strokeWidth={2.5} />
            <text x={24} y={0} fill={color('muted')}>
              {l.text}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
