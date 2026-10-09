/**
 * The step figures of first-level-support-automation, each following the
 * post's running example (Alex Carter's locked account) through one step:
 *
 * - intent-dag: the intent DAG, with Alex's route to Account locked and a
 *   card-PIN lockout's route to the same leaf.
 * - fetch-scores: each candidate record's score, stacked from the fields it
 *   matched, against the threshold.
 * - plan-tree: Account locked's decision tree, with the branch Alex lands on.
 *
 * Drawn in the style of the post's other figures (palette, icons, short
 * labels); the prose explains them. Static: rendered on the server, no
 * JavaScript. PipelineFigure.astro wraps them.
 */
import type { ComponentType, ReactNode } from 'react';
import { color, PALETTE, Envelope, Grade, Person, Reply, edgePath, type Point } from '../remotion/shared';
import { NODES, EDGES, ROOT, NODE_H, PARENT, LEAF, outPoint, inPoint, type Id } from '../remotion/ShadowLoop';
import { GROUP_COLORS } from './PipelineMap';

/** Alex Carter, the post's running example, in the color customers get in the shadow loop. */
const ALEX = PALETTE[0];
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

function Svg({ viewBox, label, children }: { viewBox: string; label: string; children: ReactNode }) {
  return (
    <svg viewBox={viewBox} role="img" aria-label={label} style={{ display: 'block', width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      {children}
    </svg>
  );
}

const IntentDagDescription =
  'The intent DAG: from the customer message to four parents, Account access, Card services, Payments and Other, and from Account access and Card services to their leaves, each with its own Other. Alex’s message takes Account access to Account locked; a card-PIN lockout reaches the same leaf through Card services.';

function IntentDag() {
  const routes: { color: string; path: Id[] }[] = [
    { color: ALEX, path: ['root', 'access', 'locked'] },
    { color: PALETTE[2], path: ['root', 'cards', 'locked'] },
  ];
  const routeOf = (from: Id, to: Id) => routes.find((r) => r.path.some((id, i) => id === from && r.path[i + 1] === to));
  // The root and the shared leaf are on both routes.
  const both = (id: Id) => routes.every((r) => r.path.includes(id));
  const one = (id: Id) => routes.find((r) => r.path.includes(id));

  return (
    <Svg viewBox="158 0 548 492" label={IntentDagDescription}>
      {[
        { x: PARENT.x + PARENT.w / 2, text: 'Parent' },
        { x: LEAF.x + LEAF.w / 2, text: 'Leaf' },
      ].map((h) => (
        <text key={h.text} x={h.x} y={24} textAnchor="middle" fontSize={17} fontWeight={600} fill={color('muted')}>
          {h.text}
        </text>
      ))}

      {EDGES.map(([from, to]) => (
        <path key={`${from}>${to}`} d={edgePath(outPoint(from), inPoint(to))} fill="none" stroke={color('edge')} strokeWidth={2} />
      ))}
      {EDGES.map(([from, to]) => {
        const route = routeOf(from, to);
        return route ? (
          <path key={`${from}>${to}`} d={edgePath(outPoint(from), inPoint(to))} fill="none" stroke={route.color} strokeWidth={4} strokeLinecap="round" />
        ) : null;
      })}

      <circle cx={ROOT.x} cy={ROOT.y} r={ROOT.r} fill={color('node-bg')} stroke={color('text')} strokeWidth={3} />
      <Envelope x={ROOT.x} y={ROOT.y} />

      {(Object.keys(NODES) as (keyof typeof NODES)[]).map((id) => {
        const node = NODES[id];
        const other = node.kind === 'other';
        const route = one(id);
        const stroke = both(id) ? color('text') : route ? route.color : other ? color('other') : color('node-border');
        return (
          <g key={id}>
            <rect
              x={node.x}
              y={node.y - NODE_H / 2}
              width={node.w}
              height={NODE_H}
              rx={9}
              fill={other ? color('other-bg') : color('node-bg')}
              stroke={stroke}
              strokeWidth={route ? 3 : 2}
              strokeDasharray={other ? '5 4' : undefined}
            />
            <text x={node.x + node.w / 2} y={node.y} dy="0.35em" textAnchor="middle" fontSize={19} fontWeight={route ? 650 : 500} fill={color('text')}>
              {node.label}
            </text>
          </g>
        );
      })}
    </Svg>
  );
}

/** Fetch: what each extracted field adds to a record's score when it matches. */
const FIELDS = {
  account: { group: 'account', weight: 5 },
  branch: { group: 'account', weight: 2 },
  family: { group: 'people', weight: 2 },
  given: { group: 'people', weight: 1 },
} as const;

type Field = keyof typeof FIELDS;

/** The candidate records and the values each matched on, stacked bottom up in this order. */
const RECORDS: { id: string; hits: [Field, string][] }[] = [
  { id: 'acc_001', hits: [['account', 'NSB01234'], ['branch', 'Riverton'], ['family', 'Carter'], ['given', 'Alex']] },
  { id: 'acc_017', hits: [['family', 'Carter'], ['given', 'Jamie']] },
  { id: 'acc_204', hits: [['family', 'Carter']] },
  { id: 'acc_388', hits: [['given', 'Alex']] },
];

const THRESHOLD = 6;

const FetchScoresDescription =
  'Candidate records, each a column stacked from the fields it matched, every field adding its weight: account number 5, branch 2, family name 2, given name 1. acc_001 matched NSB01234, Riverton, Carter and Alex for 10, the only score above the threshold. acc_017 matched Carter and Jamie for 3, acc_204 Carter for 2, acc_388 Alex for 1.';

function FetchScores() {
  const unit = 26;
  const base = 356;
  const col = { w: 112, gap: 20, left: 24 };
  const cx = (i: number) => col.left + col.w / 2 + i * (col.w + col.gap);
  const y = (score: number) => base - score * unit;
  const right = cx(RECORDS.length - 1) + col.w / 2;

  return (
    <Svg viewBox="0 0 548 396" label={FetchScoresDescription}>
      {[
        { x: col.left, fill: GROUP_COLORS.people, text: 'People' },
        { x: col.left + 108, fill: GROUP_COLORS.account, text: 'Account' },
      ].map((l) => (
        <g key={l.text}>
          <rect x={l.x} y={14} width={16} height={16} rx={4} fill={l.fill} />
          <text x={l.x + 24} y={22} dy="0.35em" fontSize={17} fontWeight={600} fill={color('muted')}>
            {l.text}
          </text>
        </g>
      ))}

      <line x1={col.left - 8} x2={right + 8} y1={base} y2={base} stroke={color('edge')} strokeWidth={2} />
      {/* Behind the columns: only a record that clears it covers it. */}
      <line x1={col.left - 8} x2={right + 8} y1={y(THRESHOLD)} y2={y(THRESHOLD)} stroke={color('text')} strokeWidth={2} strokeDasharray="7 5" />
      <text x={right + 8} y={y(THRESHOLD) - 10} textAnchor="end" fontSize={17} fontWeight={600} fill={color('muted')}>
        Threshold
      </text>

      {RECORDS.map((r, i) => {
        let score = 0;
        const segments = r.hits.map(([field, value]) => {
          const { group, weight } = FIELDS[field];
          score += weight;
          return { field, value, weight, fill: GROUP_COLORS[group], top: y(score), height: weight * unit };
        });
        const wins = score > THRESHOLD;
        return (
          <g key={r.id}>
            {segments.map((s) => (
              <g key={s.field}>
                <rect x={cx(i) - col.w / 2} y={s.top + 1} width={col.w} height={s.height - 2} rx={4} fill={s.fill} />
                {/* The weight under the value where the segment has room for two lines. */}
                <text x={cx(i)} y={s.top + s.height / 2} dy={s.weight > 1 ? '-0.25em' : '0.35em'} textAnchor="middle" fontSize={17} fill="#fff">
                  <tspan fontWeight={650}>{s.value}</tspan>
                  <tspan fontWeight={500} {...(s.weight > 1 ? { x: cx(i), dy: '1.2em' } : {})}>
                    {s.weight > 1 ? '' : ' '}+{s.weight}
                  </tspan>
                </text>
              </g>
            ))}
            <text x={cx(i)} y={y(score) - 12} textAnchor="middle" fontSize={21} fontWeight={700} fill={color('text')}>
              {score}
            </text>
            {wins && <Grade ok x={cx(i) + 32} y={y(score) - 19} r={12} />}
            <text x={cx(i)} y={base + 26} textAnchor="middle" fontSize={17} fontFamily={MONO} fill={color(wins ? 'text' : 'muted')}>
              {r.id}
            </text>
          </g>
        );
      })}

    </Svg>
  );
}

const PlanTreeDescription =
  'The decision tree behind the Account locked leaf. Record found? If not, ask for details. One record? If not, ask which one. Flagged? If so, escalate to security; if not, send the unlock steps. Alex’s message finds one unflagged record and gets the unlock steps.';

function PlanTree() {
  const chain = 140;
  /** The centre of the outcomes to the side. */
  const side = 426;
  const leaf = { y: 40, w: LEAF.w };
  const diamond = { w: 92, h: 40 };
  const box = { w: 200, h: 48 };
  const questions = [
    { y: 140, text: 'Record found?', exit: 'no', outcome: 'Ask for details' },
    { y: 250, text: 'One record?', exit: 'no', outcome: 'Ask which one' },
    { y: 360, text: 'Flagged?', exit: 'yes', outcome: 'Escalate', escalate: true },
  ];
  const final = { y: 470, text: 'Unlock steps' };
  const arrow = 'plan-tree-arrow';
  const lit = 'plan-tree-lit';

  const Outcome = ({ at, text, escalate, on }: { at: Point; text: string; escalate?: boolean; on?: boolean }) => (
    <g>
      <rect
        x={at.x - box.w / 2}
        y={at.y - box.h / 2}
        width={box.w}
        height={box.h}
        rx={10}
        fill={color('node-bg')}
        stroke={on ? ALEX : color('node-border')}
        strokeWidth={on ? 3 : 2}
      />
      {escalate ? (
        <Person x={at.x - box.w / 2 + 26} y={at.y - 1} scale={0.8} fill={color('text')} />
      ) : (
        <Reply x={at.x - box.w / 2 + 26} y={at.y} scale={1.1} stroke={on ? ALEX : color('node-border')} />
      )}
      <text x={at.x - box.w / 2 + 48} y={at.y} dy="0.35em" fontSize={18} fontWeight={on ? 650 : 500} fill={color('text')}>
        {text}
      </text>
    </g>
  );

  const Answer = ({ x, y, text, anchor = 'start' }: Point & { text: string; anchor?: 'start' | 'middle' }) => (
    <text x={x} y={y} textAnchor={anchor} fontSize={16} fontWeight={600} fill={color('muted')}>
      {text}
    </text>
  );

  return (
    <Svg viewBox="0 0 560 508" label={PlanTreeDescription}>
      <defs>
        {[
          { id: arrow, fill: color('node-border') },
          { id: lit, fill: ALEX },
        ].map((m) => (
          <marker key={m.id} id={m.id} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill={m.fill} />
          </marker>
        ))}
      </defs>

      {/* Down the chain: Alex's path, from the leaf to the unlock steps */}
      {[leaf.y + NODE_H / 2, ...questions.map((q) => q.y + diamond.h)].map((from, i) => {
        const to = (i < questions.length ? questions[i].y - diamond.h : final.y - box.h / 2) - 4;
        return <path key={from} d={`M${chain},${from} V${to}`} stroke={ALEX} strokeWidth={4} markerEnd={`url(#${lit})`} />;
      })}
      {questions.map((q, i) => (
        <Answer key={q.y} x={chain + 12} y={q.y + diamond.h + 22} text={i === questions.length - 1 ? 'no' : 'yes'} />
      ))}

      {/* Out to the side: the other answer's outcome */}
      {questions.map((q) => (
        <g key={q.y}>
          <path d={`M${chain + diamond.w},${q.y} H${side - box.w / 2 - 4}`} stroke={color('node-border')} strokeWidth={2.5} markerEnd={`url(#${arrow})`} />
          <Answer x={(chain + diamond.w + side - box.w / 2) / 2} y={q.y - 10} text={q.exit} anchor="middle" />
        </g>
      ))}

      <rect x={chain - leaf.w / 2} y={leaf.y - NODE_H / 2} width={leaf.w} height={NODE_H} rx={9} fill={color('node-bg')} stroke={ALEX} strokeWidth={3} />
      <text x={chain} y={leaf.y} dy="0.35em" textAnchor="middle" fontSize={19} fontWeight={650} fill={color('text')}>
        Account locked
      </text>

      {questions.map((q) => (
        <g key={q.y}>
          <path
            d={`M${chain},${q.y - diamond.h} L${chain + diamond.w},${q.y} L${chain},${q.y + diamond.h} L${chain - diamond.w},${q.y} Z`}
            fill={color('surface')}
            stroke={ALEX}
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <text x={chain} y={q.y} dy="0.35em" textAnchor="middle" fontSize={17} fontWeight={600} fill={color('text')}>
            {q.text}
          </text>
          <Outcome at={{ x: side, y: q.y }} text={q.outcome} escalate={q.escalate} />
        </g>
      ))}
      <Outcome at={{ x: chain, y: final.y }} text={final.text} on />
    </Svg>
  );
}

/**
 * `width` caps the figure on wide screens, about its own size, so its type
 * stays near the post's rather than scaling up with the column.
 */
export const FIGURES = {
  'intent-dag': { component: IntentDag, description: IntentDagDescription, width: 480 },
  'fetch-scores': { component: FetchScores, description: FetchScoresDescription, width: 520 },
  'plan-tree': { component: PlanTree, description: PlanTreeDescription, width: 460 },
} satisfies Record<string, { component: ComponentType; description: string; width: number }>;

export type FigureName = keyof typeof FIGURES;
