/**
 * The figures of uncoded-hospital-revenue other than its section map
 * (DesignMap.tsx): how a German hospital gets paid for a case, and the life
 * of one suggestion through the design, with the step names the map uses.
 * Same palette, box style and icons as the map. Both are narrow enough to
 * share one layout between phones and wide screens. Static: rendered on the
 * server, no JavaScript.
 */
import type { ReactNode } from 'react';
import { color, Agent, Envelope, Evals, Gauge, type Point } from '../remotion/shared';
import { ArrowMarker, Tag } from './map-parts';

type Role = 'hospital' | 'platform' | 'human' | 'payer';

const STROKE: Record<Role, string> = {
  hospital: color('node-border'),
  platform: color('added'),
  human: color('ok'),
  payer: color('other'),
};

const TITLE = 21;
const LINE = 18;

/** A box with an optional icon on its left and a title with one short label under it. */
function Step({ at, w, h, title, line, role, icon }: { at: Point; w: number; h: number; title: string; line?: string; role: Role; icon?: ReactNode }) {
  const left = at.x - w / 2;
  const textX = icon ? left + 70 : at.x;
  const anchor = icon ? 'start' : 'middle';
  const titleY = line ? at.y - 11 : at.y;
  return (
    <g>
      <rect x={left} y={at.y - h / 2} width={w} height={h} rx={14} fill={color('node-bg')} stroke={STROKE[role]} strokeWidth={2.5} />
      {icon && <g transform={`translate(${left + 36} ${at.y})`}>{icon}</g>}
      <text x={textX} y={titleY} dy="0.35em" textAnchor={anchor} fontSize={TITLE} fontWeight={600} fill={color('text')}>
        {title}
      </text>
      {line && (
        <text x={textX} y={at.y + 15} dy="0.35em" textAnchor={anchor} fontSize={LINE} fontWeight={500} fill={color('muted')}>
          {line}
        </text>
      )}
    </g>
  );
}

const arrow = (marker: string, d: string, dashed = false) => (
  <path d={d} fill="none" stroke={color('node-border')} strokeWidth={2.5} strokeDasharray={dashed ? '7 6' : undefined} markerEnd={`url(#${marker})`} />
);

/** Two columns, three rows, read left to right: treatment to invoice, then the payer and its audit. */
function BillingChain({ id }: { id: string }) {
  const m = `${id}-arrow`;
  const xs = [100, 320];
  const ys = [60, 190, 320];
  const steps: { title: string; line: string; role: Role }[] = [
    { title: 'Document', line: 'in the KIS', role: 'hospital' },
    { title: 'Code', line: 'ICD-10-GM, OPS', role: 'human' },
    { title: 'Group', line: 'to a DRG', role: 'hospital' },
    { title: 'Invoice', line: 'weight x base rate', role: 'hospital' },
    { title: 'Krankenkasse', line: 'pays or audits', role: 'payer' },
    { title: 'MD audit', line: 'cuts unsupported', role: 'payer' },
  ];
  return (
    <svg viewBox="0 0 420 380" role="img" aria-label={DESCRIPTIONS['billing-chain']} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      <defs>
        <ArrowMarker id={m} />
      </defs>
      {ys.map((y) => (
        <g key={y}>{arrow(m, `M185,${y} H231`)}</g>
      ))}
      {/* From the end of each row back to the start of the next. */}
      {arrow(m, 'M320,100 V125 H100 V146')}
      {arrow(m, 'M320,230 V255 H100 V276')}
      {steps.map((s, i) => (
        <Step key={s.title} at={{ x: xs[i % 2], y: ys[Math.floor(i / 2)] }} w={180} h={80} title={s.title} line={s.line} role={s.role} />
      ))}
      {/* Where this post's system works: between documenting and coding. */}
      <Tag x={208} y={28} text="Gap" size={15} />
    </svg>
  );
}

/** One candidate code, from the signal that raised it to one of three outcomes; the malnutrition case ends in a question. */
function Suggestion({ id }: { id: string }) {
  const m = `${id}-arrow`;
  const cx = 240;
  const steps = [
    { title: 'Cheap signal', line: 'NRS 2002 score 4', icon: <Envelope x={0} y={0} scale={1.1} /> },
    { title: 'Evidence selector', line: 'Dietitian note, p. 1', icon: <Agent x={0} y={0} scale={0.75} typing={1} /> },
    { title: 'DKR rule check', line: 'Treated: D003 holds', icon: <Evals x={0} y={0} scale={0.75} /> },
    { title: 'Grouper delta', line: 'Priced per variant', icon: <Gauge x={0} y={0} scale={1.4} /> },
  ];
  const ys = steps.map((_, i) => 50 + i * 100);
  const outcomes = [
    { x: 82, title: 'Suggest', line: 'to the coder', role: 'human' as Role },
    { x: 240, title: 'Ask', line: 'the physician', role: 'human' as Role },
    { x: 398, title: 'Drop', line: 'not codable', role: 'platform' as Role },
  ];
  const last = ys[ys.length - 1];
  return (
    <svg viewBox="0 0 480 590" role="img" aria-label={DESCRIPTIONS.suggestion} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      <defs>
        <ArrowMarker id={m} />
      </defs>
      {ys.slice(1).map((y) => (
        <g key={y}>{arrow(m, `M${cx},${y - 64} V${y - 41}`)}</g>
      ))}
      {outcomes.map((o) => (
        <g key={o.title}>{arrow(m, `M${cx},${last + 36} C${cx},${last + 70} ${o.x},${last + 62} ${o.x},${last + 103}`, o.title === 'Drop')}</g>
      ))}
      {steps.map((s, i) => (
        <Step key={s.title} at={{ x: cx, y: ys[i] }} w={360} h={72} title={s.title} line={s.line} role="platform" icon={s.icon} />
      ))}
      {outcomes.map((o) => (
        <Step key={o.title} at={{ x: o.x, y: last + 146 }} w={150} h={80} title={o.title} line={o.line} role={o.role} />
      ))}
      <Tag x={240} y={last + 208} text="This case" size={15} />
    </svg>
  );
}

export const DESCRIPTIONS = {
  'billing-chain':
    'How a hospital gets paid for an inpatient case: staff document in the KIS, coders turn the record into ICD-10-GM and OPS codes, a certified grouper maps them to a DRG, the invoice goes to the Krankenkasse, which pays or sends it to the Medizinischer Dienst for an audit that cuts what the record cannot support. The gap this post is about sits between documenting and coding.',
  suggestion:
    'The life of one suggestion: a cheap signal raises a candidate, the evidence selector picks the passage that supports it, a DKR rule check decides whether it counts, the grouper prices it, and it ends as a suggestion to the coder, a question to the physician, or is dropped. The malnutrition case ends as a question.',
} as const;

export type FigureName = keyof typeof DESCRIPTIONS;

export default function DesignFigure({ name, id }: { name: FigureName; id: string }) {
  return name === 'billing-chain' ? <BillingChain id={id} /> : <Suggestion id={id} />;
}
