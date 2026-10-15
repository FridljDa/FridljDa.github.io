/**
 * The revenue-leakage design of calliora-system-design-interview as one
 * top-to-bottom map: hospital systems feed a case context store, gap
 * detectors propose codes, a counterfactual grouper prices them, a ranked
 * worklist puts them in front of a coder, and the coder's decisions go back
 * to the hospital and into the evals.
 *
 * Unlike the other posts' section maps, this one gains detail as the post
 * goes on, the way the design does in the interview: a black box while the
 * requirements are open, then six abstract boxes, then the components inside
 * each box. Later sections highlight their part and grey out the rest.
 * Vertical by design, so phones and wide screens share one layout. Static:
 * rendered on the server, no JavaScript.
 */
import { color } from '../remotion/shared';
import { Dim, Tag, ArrowMarker } from './map-parts';

type NodeId = 'sources' | 'system' | 'store' | 'detect' | 'grouper' | 'worklist' | 'feedback';
type Part = NodeId | 'loop';
/** blackbox: one unknown box between input and output. boxes: the six steps. detail: each step with its components. */
type Level = 'blackbox' | 'boxes' | 'detail';
/** Who a box belongs to, which sets its outline: the hospital, the platform, or a person. */
type Role = 'hospital' | 'platform' | 'human';

export interface Preset {
  level: Level;
  /** Parts drawn at full strength; everything else is greyed out. Empty means everything. */
  focus: Part[];
  /** Pills on the top right of a box, e.g. "Hard part". */
  tags?: { on: NodeId; text: string }[];
  description: string;
}

export const PRESETS = {
  clarify: {
    level: 'blackbox',
    focus: [],
    tags: [{ on: 'system', text: 'Open questions' }],
    description:
      'Before any design: documentation from the hospital systems goes into an unknown system, and a coder gets something to act on.',
  },
  'end-to-end': {
    level: 'boxes',
    focus: [],
    description:
      'The simple end-to-end design: hospital systems feed a case context store, gap detectors propose codes, a counterfactual grouper prices them, a ranked worklist goes to the coder, and decisions go back to the hospital and, as labels, to the detectors.',
  },
  components: {
    level: 'detail',
    focus: [],
    description:
      'The same six steps with their components: adapters per hospital system and a versioned case timeline; cheap signals, an LLM that cites the page, and rule checks; a certified grouper pricing each variant; a worklist for coders and bundled physician queries; write-back and labels.',
  },
  ingestion: {
    level: 'detail',
    focus: ['sources', 'store'],
    tags: [{ on: 'store', text: 'Hard part' }],
    description: 'Highlighted: the hospital systems and the case context store, where most of the integration work sits.',
  },
  suggestion: {
    level: 'detail',
    focus: ['detect', 'grouper', 'worklist'],
    tags: [{ on: 'detect', text: 'Precision first' }],
    description: 'Highlighted: the gap detectors, the counterfactual grouper and the worklist, the path one suggestion takes.',
  },
  finishing: {
    level: 'detail',
    focus: ['worklist', 'feedback', 'loop'],
    tags: [{ on: 'feedback', text: 'Evals' }],
    description: 'Highlighted: the coder’s decisions, written back to the hospital and fed back to the detectors as labels.',
  },
} satisfies Record<string, Preset>;

export type PresetName = keyof typeof PRESETS;

const NODES: Record<NodeId, { name: string; role: Role; detail: string[] }> = {
  sources: { name: 'Hospital systems', role: 'hospital', detail: ['KIS via HL7 v2 or FHIR', 'Letters, lab PDFs, scans'] },
  system: { name: '?', role: 'platform', detail: [] },
  store: { name: 'Case context store', role: 'platform', detail: ['One adapter per KIS', 'Versioned case timeline', 'Audit log'] },
  detect: { name: 'Gap detectors', role: 'platform', detail: ['Cheap signals for recall', 'LLM verifies, cites the page', 'DKR rule checks'] },
  grouper: { name: 'Counterfactual grouper', role: 'platform', detail: ['Certified grouper', 'Revenue delta per variant', 'Cached per case version'] },
  worklist: { name: 'Ranked worklist', role: 'human', detail: ['Coder accepts or rejects', 'One bundled physician query'] },
  feedback: { name: 'Write-back and labels', role: 'hospital', detail: ['Accepted codes into the KIS', 'Decisions into the evals'] },
};

const ORDER: Record<Level, NodeId[]> = {
  blackbox: ['sources', 'system', 'worklist'],
  boxes: ['sources', 'store', 'detect', 'grouper', 'worklist', 'feedback'],
  detail: ['sources', 'store', 'detect', 'grouper', 'worklist', 'feedback'],
};

/** In the black box, the output is just "a coder" and nothing about a worklist yet. */
const BLACKBOX_NAMES: Partial<Record<NodeId, string>> = { sources: 'Documentation', worklist: 'Coder' };

const W = 560;
const BOX = { x: 110, w: 380 };
const TITLE = 22;
const DETAIL = 18;
const GAP = 46;
const PAD = 22;

const STROKE: Record<Role, string> = {
  hospital: color('node-border'),
  platform: color('added'),
  human: color('ok'),
};

function boxHeight(level: Level, id: NodeId) {
  if (id === 'system') return 110;
  const lines = level === 'detail' ? NODES[id].detail.length : 0;
  return 64 + lines * (DETAIL + 8);
}

export default function DesignMap({ preset, id }: { preset: PresetName; id: string }) {
  const p: Preset = PRESETS[preset];
  const order = ORDER[p.level];
  const all = p.focus.length === 0;
  const on = (part: Part) => all || p.focus.includes(part);

  let y = PAD + 14;
  const boxes = order.map((n) => {
    const h = boxHeight(p.level, n);
    const b = { id: n, y, h };
    y += h + GAP;
    return b;
  });
  // Room under the last box for the legend.
  const height = y - GAP + PAD + 34;
  const at = Object.fromEntries(boxes.map((b) => [b.id, b])) as Record<NodeId, (typeof boxes)[number]>;
  const marker = `${id}-arrow`;
  const cx = BOX.x + BOX.w / 2;
  const showLoop = p.level !== 'blackbox';

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
          {/* Labels go back up the left margin to the detectors: dashed, since they change the system rather than a case. */}
          <path
            d={`M${BOX.x},${at.feedback.y + at.feedback.h / 2} H${BOX.x - 50} V${at.detect.y + at.detect.h / 2} H${BOX.x - 6}`}
            fill="none"
            stroke={color('node-border')}
            strokeWidth={2.5}
            strokeDasharray="7 6"
            markerEnd={`url(#${marker})`}
          />
          <text
            transform={`translate(${BOX.x - 62} ${(at.detect.y + at.feedback.y + at.feedback.h) / 2}) rotate(-90)`}
            textAnchor="middle"
            fontSize={DETAIL}
            fontWeight={500}
            fill={color('text')}
          >
            Labels
          </text>
        </Dim>
      )}

      {boxes.map((b) => {
        const node = NODES[b.id];
        const name = (p.level === 'blackbox' && BLACKBOX_NAMES[b.id]) || node.name;
        const unknown = b.id === 'system';
        const lines = p.level === 'detail' ? node.detail : [];
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
            <text
              x={cx}
              y={unknown ? b.y + b.h / 2 : b.y + 40}
              dy={unknown ? '0.35em' : undefined}
              textAnchor="middle"
              fontSize={unknown ? 44 : TITLE}
              fontWeight={600}
              fill={unknown ? color('muted') : color('text')}
            >
              {name}
            </text>
            {lines.map((line, i) => (
              <text key={line} x={cx} y={b.y + 40 + (i + 1) * (DETAIL + 8)} textAnchor="middle" fontSize={DETAIL} fontWeight={500} fill={color('muted')}>
                {line}
              </text>
            ))}
          </Dim>
        );
      })}

      {(p.tags ?? []).map((t) => {
        const b = at[t.on];
        const width = t.text.length * 16 * 0.59 + 44;
        return <Tag key={t.on} x={BOX.x + BOX.w - width / 2 + 24} y={b.y} text={t.text} size={16} />;
      })}

      <g transform={`translate(${cx - 170} ${height - 16})`} fontSize={15} fontWeight={600}>
        {(['hospital', 'platform', 'human'] as Role[]).map((r, i) => (
          <g key={r} transform={`translate(${i * 120} 0)`}>
            <rect x={0} y={-12} width={14} height={14} rx={4} fill={color('node-bg')} stroke={STROKE[r]} strokeWidth={2.5} />
            <text x={22} y={0} fill={color('muted')}>
              {{ hospital: 'Hospital', platform: 'Platform', human: 'Person' }[r]}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
