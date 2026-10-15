/**
 * The figures of uncoded-hospital-revenue other than its section map
 * (DesignMap.tsx): how a German hospital gets paid for a case, and the life
 * of one suggestion through the design. Same palette and box style as the
 * map. Static: rendered on the server, no JavaScript.
 */
import { color, type Point } from '../remotion/shared';
import { ArrowMarker } from './map-parts';

type Role = 'hospital' | 'platform' | 'human' | 'payer';

const STROKE: Record<Role, string> = {
  hospital: color('node-border'),
  platform: color('added'),
  human: color('ok'),
  payer: color('other'),
};

function Step({ at, w, h, title, lines = [], role, size = 20 }: { at: Point; w: number; h: number; title: string; lines?: string[]; role: Role; size?: number }) {
  const top = at.y - h / 2;
  const first = lines.length ? top + 34 : at.y;
  return (
    <g>
      <rect x={at.x - w / 2} y={top} width={w} height={h} rx={14} fill={color('node-bg')} stroke={STROKE[role]} strokeWidth={2.5} />
      <text x={at.x} y={first} dy={lines.length ? undefined : '0.35em'} textAnchor="middle" fontSize={size} fontWeight={600} fill={color('text')}>
        {title}
      </text>
      {lines.map((l, i) => (
        <text key={l} x={at.x} y={first + (i + 1) * 23} textAnchor="middle" fontSize={16} fontWeight={500} fill={color('muted')}>
          {l}
        </text>
      ))}
    </g>
  );
}

const arrow = (marker: string, d: string, dashed = false) => (
  <path d={d} fill="none" stroke={color('node-border')} strokeWidth={2.5} strokeDasharray={dashed ? '7 6' : undefined} markerEnd={`url(#${marker})`} />
);

/** Two rows of three: treatment to invoice, then the payer and its audit. */
function BillingChain({ id }: { id: string }) {
  const m = `${id}-arrow`;
  const xs = [100, 280, 460];
  const steps: { title: string; lines: string[]; role: Role }[] = [
    { title: 'Document', lines: ['Ward staff', 'in the KIS'], role: 'hospital' },
    { title: 'Code', lines: ['ICD-10-GM, OPS', 'per the DKR'], role: 'human' },
    { title: 'Group', lines: ['Certified grouper', 'codes to a DRG'], role: 'hospital' },
    { title: 'Invoice', lines: ['Cost weight', 'x base rate'], role: 'hospital' },
    { title: 'Krankenkasse', lines: ['Pays, or sends', 'it to audit'], role: 'payer' },
    { title: 'MD audit', lines: ['Cuts what the', 'record lacks'], role: 'payer' },
  ];
  const at = (i: number) => ({ x: xs[i % 3], y: i < 3 ? 70 : 230 });
  return (
    <svg viewBox="0 0 560 300" role="img" aria-label={DESCRIPTIONS['billing-chain']} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      <defs>
        <ArrowMarker id={m} />
      </defs>
      {arrow(m, 'M175,70 H201')}
      {arrow(m, 'M355,70 H381')}
      {/* From the end of the first row back to the start of the second. */}
      {arrow(m, 'M460,115 V150 H100 V181')}
      {arrow(m, 'M175,230 H201')}
      {arrow(m, 'M355,230 H381')}
      {steps.map((s, i) => (
        <Step key={s.title} at={at(i)} w={150} h={90} title={s.title} lines={s.lines} role={s.role} size={19} />
      ))}
    </svg>
  );
}

/** One candidate code, from the signal that raised it to one of three outcomes. */
function Suggestion({ id }: { id: string }) {
  const m = `${id}-arrow`;
  const cx = 280;
  const outcomes = [
    { x: 95, title: 'Suggest', lines: ['To the coder,', 'evidence attached'], role: 'human' as Role },
    { x: 280, title: 'Ask', lines: ['The physician:', 'one yes or no'], role: 'human' as Role },
    { x: 465, title: 'Drop', lines: ['Not codable,', 'or worth 0 EUR'], role: 'platform' as Role },
  ];
  return (
    <svg viewBox="0 0 560 560" role="img" aria-label={DESCRIPTIONS.suggestion} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      <defs>
        <ArrowMarker id={m} />
      </defs>
      {arrow(m, `M${cx},104 V126`)}
      {arrow(m, `M${cx},224 V246`)}
      {outcomes.map((o) => (
        <g key={o.title}>{arrow(m, `M${cx},344 C${cx},380 ${o.x},372 ${o.x},408`, o.title === 'Drop')}</g>
      ))}
      <Step at={{ x: cx, y: 62 }} w={400} h={84} title="Candidate" lines={['Creatinine 4.3 mg/dl, over 3x baseline']} role="platform" />
      <Step at={{ x: cx, y: 177 }} w={400} h={92} title="Evidence extractor" lines={['Lab report, page 2; dialysis ordered']} role="platform" />
      <Step at={{ x: cx, y: 297 }} w={400} h={92} title="Rule check and grouper delta" lines={['Treated? N17.93 moves F62C to F62B']} role="platform" />
      {outcomes.map((o) => (
        <Step key={o.title} at={{ x: o.x, y: 470 }} w={170} h={110} title={o.title} lines={o.lines} role={o.role} />
      ))}
    </svg>
  );
}

export const DESCRIPTIONS = {
  'billing-chain':
    'How a hospital gets paid for an inpatient case: physicians and nurses document in the KIS, coders turn the record into ICD-10-GM and OPS codes, a certified grouper maps them to a DRG, the invoice goes to the Krankenkasse, which pays or sends it to the Medizinischer Dienst for an audit that cuts what the record cannot support.',
  suggestion:
    'The life of one suggestion: a cheap signal raises a candidate, the evidence extractor finds the page that supports it, a rule check and the grouper decide whether it counts and what it is worth, and it ends as a suggestion to the coder, a yes or no question to the physician, or is dropped.',
} as const;

export type FigureName = keyof typeof DESCRIPTIONS;

export default function DesignFigure({ name, id }: { name: FigureName; id: string }) {
  return name === 'billing-chain' ? <BillingChain id={id} /> : <Suggestion id={id} />;
}
