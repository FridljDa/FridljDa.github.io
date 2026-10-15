/**
 * The figures of uncoded-hospital-revenue other than its section map
 * (DesignMap.tsx): how a German hospital gets paid for a case, how one code
 * changes its price, the running example's two uncoded diagnoses, how the
 * evidence selector answers, a coder's worklist, and the life of one
 * suggestion through the design, with the step names the map uses.
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
    { title: 'Grouper', line: 'With and without the code', icon: <Gauge x={0} y={0} scale={1.4} /> },
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

/** One case version grouped twice, without and with the kidney failure; the difference is the price of the code. */
function Pricing({ id }: { id: string }) {
  const m = `${id}-arrow`;
  const cols = [
    { x: 122, variant: 'Without', drg: 'F62C', line: 'lower severity' },
    { x: 358, variant: 'With', drg: 'F62B', line: 'higher severity' },
  ];
  return (
    <svg viewBox="0 0 480 470" role="img" aria-label={DESCRIPTIONS.pricing} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      <defs>
        <ArrowMarker id={m} />
      </defs>
      {cols.map((c) => (
        <g key={c.x}>
          {arrow(m, `M240,86 C240,108 ${c.x},104 ${c.x},121`)}
          {arrow(m, `M${c.x},199 V236`)}
          <text x={c.x + 12} y={218} dy="0.35em" fontSize={16} fontWeight={500} fill={color('muted')}>
            grouper
          </text>
          {arrow(m, `M${c.x},316 C${c.x},340 240,336 240,356`)}
        </g>
      ))}
      <Step at={{ x: 240, y: 50 }} w={300} h={72} title="One case version" line="as documented" role="hospital" />
      {cols.map((c) => (
        <g key={c.drg}>
          <Step at={{ x: c.x, y: 160 }} w={200} h={76} title={c.variant} line="N17.93" role="platform" />
          <Step at={{ x: c.x, y: 278 }} w={200} h={76} title={c.drg} line={c.line} role="platform" />
        </g>
      ))}
      <Step at={{ x: 240, y: 400 }} w={360} h={76} title="Price of the code" line="weight gap x base rate" role="platform" icon={<Gauge x={0} y={0} scale={1.4} />} />
    </svg>
  );
}

/** A check or a cross in a small circle: whether a fact meets one condition for coding. */
function Mark({ x, y, yes }: Point & { yes: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={13} fill={color(yes ? 'ok' : 'bad')} />
      <path d={yes ? 'M-6,0 l4,4 l8,-8' : 'M-5,-5 l10,10 M5,-5 l-10,10'} fill="none" stroke="#fff" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/**
 * The running example in two parts. Above, every fact day by day in the lane
 * of its diagnosis, with the system it was recorded in. Below, the two
 * diagnoses against what coding them takes: both are in the record and
 * treated, only one has a physician behind it, and neither is coded.
 */
function RunningExample(_props: { id: string }) {
  // One left column for day and row labels, and the same two columns above and below.
  const W = 540;
  const lanes = [
    { x: 252, title: 'Kidney' },
    { x: 440, title: 'Malnutrition' },
  ];
  const events: { day?: string; lane: 0 | 1; title: string; line: string }[] = [
    { day: 'Day 1', lane: 0, title: 'Creatinine 1.2', line: 'lab system' },
    { lane: 1, title: 'NRS 2002: 4', line: 'nursing form' },
    { day: 'Day 3', lane: 0, title: 'Creatinine 4.3', line: 'lab system' },
    { lane: 0, title: 'Drug paused', line: 'medication order' },
    { day: 'Day 4', lane: 1, title: 'Weight -10%', line: 'scanned note' },
    { lane: 1, title: 'Supplements', line: "dietitian's order" },
  ];
  // Facts of the same day and lane stack; a fact in the other lane shares the row.
  const ROW = 84;
  let row = -1;
  let lastDay = '';
  const placed = events.map((e, i) => {
    const prev = events[i - 1];
    if (e.day || !prev || prev.lane === e.lane) row += 1;
    if (e.day) lastDay = e.day;
    return { ...e, y: 100 + row * ROW, showDay: Boolean(e.day), dayLabel: lastDay };
  });
  const timelineEnd = 100 + row * ROW + 40;

  const tableTop = timelineEnd + 56;
  const checks: { label: string; values: [boolean | string, boolean | string] }[] = [
    { label: 'In the record', values: [true, true] },
    { label: 'Treated (D003)', values: [true, true] },
    { label: 'Physician acted', values: [true, false] },
    { label: 'Coded', values: [false, false] },
    { label: 'Found by', values: ['lab rule', 'reading'] },
    { label: 'Ends as', values: ['suggestion', 'question'] },
  ];
  const ROW_T = 42;
  const height = tableTop + 36 + checks.length * ROW_T + 12;

  return (
    <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label={DESCRIPTIONS['running-example']} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      {lanes.map((l) => (
        <g key={l.x}>
          <line x1={l.x} x2={l.x} y1={52} y2={timelineEnd} stroke={color('edge')} strokeWidth={2.5} strokeDasharray="6 6" />
          <text x={l.x} y={30} dy="0.35em" textAnchor="middle" fontSize={TITLE} fontWeight={700} fill={color('text')}>
            {l.title}
          </text>
        </g>
      ))}
      {placed.map((e) => (
        <g key={e.title}>
          {e.showDay && (
            <text x={16} y={e.y} dy="0.35em" fontSize={17} fontWeight={600} fill={color('muted')}>
              {e.dayLabel}
            </text>
          )}
          <Step at={{ x: lanes[e.lane].x, y: e.y }} w={176} h={68} title={e.title} line={e.line} role="hospital" />
        </g>
      ))}

      <line x1={8} x2={W - 8} y1={tableTop - 28} y2={tableTop - 28} stroke={color('edge')} strokeWidth={2} />
      <text x={16} y={tableTop} dy="0.35em" fontSize={17} fontWeight={600} fill={color('muted')}>
        At discharge
      </text>
      {lanes.map((l, i) => (
        <text key={l.title} x={l.x} y={tableTop} dy="0.35em" textAnchor="middle" fontSize={17} fontWeight={700} fill={color('text')}>
          {l.title}
        </text>
      ))}
      {checks.map((c, r) => {
        const y = tableTop + 36 + r * ROW_T + ROW_T / 2;
        return (
          <g key={c.label}>
            {r % 2 === 0 && <rect x={8} y={y - ROW_T / 2} width={W - 16} height={ROW_T} rx={8} fill={color('node-bg')} />}
            <text x={16} y={y} dy="0.35em" fontSize={LINE} fontWeight={500} fill={color('text')}>
              {c.label}
            </text>
            {c.values.map((v, i) =>
              typeof v === 'boolean' ? (
                <Mark key={i} x={lanes[i].x} y={y} yes={v} />
              ) : (
                <text key={i} x={lanes[i].x} y={y} dy="0.35em" textAnchor="middle" fontSize={17} fontWeight={600} fill={color('muted')}>
                  {v}
                </text>
              ),
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** The evidence selector's answer: a fixed question, numbered passages, and the one passage it picks, or none. */
function Selector({ id }: { id: string }) {
  const m = `${id}-arrow`;
  const passages = ['Mobilised with help', 'Weight down 10% in 3 months', 'Supplement drinks twice a day', 'Wound dressing changed', 'Sleeps poorly', 'None of these'];
  const picked = 2;
  const top = 128;
  const rowH = 46;
  const panelH = passages.length * rowH + 20;
  const modelY = top + panelH + 72;
  return (
    <svg viewBox={`0 0 480 ${modelY + 112}`} role="img" aria-label={DESCRIPTIONS.selector} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      <defs>
        <ArrowMarker id={m} />
      </defs>
      {arrow(m, `M240,86 V${top - 4}`)}
      {arrow(m, `M240,${top + panelH} V${modelY - 40}`)}
      <Step at={{ x: 240, y: 50 }} w={400} h={72} title="Was it treated?" line="candidate: E44.0" role="platform" />
      <rect x={40} y={top} width={400} height={panelH} rx={14} fill={color('node-bg')} stroke={color('node-border')} strokeWidth={2.5} />
      {passages.map((text, i) => {
        const y = top + 10 + i * rowH + rowH / 2;
        const none = i === passages.length - 1;
        const on = i === picked;
        return (
          <g key={text}>
            {on && <rect x={50} y={y - rowH / 2 + 3} width={380} height={rowH - 6} rx={10} fill={color('ok')} fillOpacity={0.16} stroke={color('ok')} strokeWidth={2.5} />}
            {!none && (
              <>
                <circle cx={76} cy={y} r={13} fill={on ? color('ok') : color('edge')} />
                <text x={76} y={y} dy="0.35em" textAnchor="middle" fontSize={15} fontWeight={700} fill={on ? '#fff' : color('text')}>
                  {i + 1}
                </text>
              </>
            )}
            <text x={none ? 64 : 100} y={y} dy="0.35em" fontSize={LINE} fontWeight={on ? 600 : 500} fontStyle={none ? 'italic' : undefined} fill={on ? color('text') : color('muted')}>
              {text}
            </text>
          </g>
        );
      })}
      <Step at={{ x: 240, y: modelY }} w={400} h={72} title="Decision model" line="picks 3, p = 0.93" role="platform" icon={<Agent x={0} y={0} scale={0.75} typing={1} />} />
      <Tag x={240} y={modelY + 76} text="No text it could invent" size={15} />
    </svg>
  );
}

/** A small rounded button or chip. */
function Chip({ x, y, w, text, tone }: { x: number; y: number; w: number; text: string; tone: 'ok' | 'bad' | 'plain' }) {
  const solid = tone === 'ok';
  return (
    <g>
      <rect x={x} y={y - 18} width={w} height={36} rx={18} fill={solid ? color('ok') : color('node-bg')} stroke={tone === 'bad' ? color('bad') : solid ? color('ok') : color('edge')} strokeWidth={2} />
      <text x={x + w / 2} y={y} dy="0.35em" textAnchor="middle" fontSize={16} fontWeight={600} fill={solid ? '#fff' : tone === 'bad' ? color('bad') : color('muted')}>
        {text}
      </text>
    </g>
  );
}

/** One quoted line of evidence with its source, the quote marked like a highlighter would. */
function Quote({ y, text, source }: { y: number; text: string; source: string }) {
  return (
    <g>
      <rect x={52} y={y - 15} width={text.length * 9.6 + 16} height={30} rx={6} fill={color('warn')} fillOpacity={0.3} />
      <text x={60} y={y} dy="0.35em" fontSize={17} fontWeight={600} fill={color('text')}>
        {text}
      </text>
      <text x={60} y={y + 26} dy="0.35em" fontSize={15} fontWeight={500} fill={color('muted')}>
        {source}
      </text>
    </g>
  );
}

/** What the coder sees: the top suggestion with its evidence and price, and a question bundled for the physician. */
function Worklist({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 480 620" role="img" aria-label={DESCRIPTIONS.worklist} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      <rect x={20} y={20} width={440} height={392} rx={14} fill={color('node-bg')} stroke={color('ok')} strokeWidth={2.5} />
      <text x={44} y={56} dy="0.35em" fontSize={TITLE} fontWeight={700} fill={color('text')}>
        N17.93
      </text>
      <text x={436} y={56} dy="0.35em" textAnchor="end" fontSize={16} fontWeight={600} fill={color('muted')}>
        Suggestion 1 of 4
      </text>
      <text x={44} y={86} dy="0.35em" fontSize={LINE} fontWeight={500} fill={color('muted')}>
        Acute kidney failure, stage 3
      </text>
      <Quote y={132} text="Creatinine 4.3 mg/dl" source="Lab report, day 3, p. 2" />
      <Quote y={196} text="ACE inhibitor paused" source="Ward note, day 3, p. 1" />
      <text x={44} y={262} dy="0.35em" fontSize={LINE} fontWeight={500} fill={color('muted')}>
        DRG
      </text>
      <text x={96} y={262} dy="0.35em" fontSize={TITLE} fontWeight={700} fill={color('text')}>
        F62C → F62B
      </text>
      <Chip x={44} y={316} w={120} text="Accept" tone="ok" />
      <Chip x={176} y={316} w={120} text="Reject" tone="bad" />
      <Chip x={44} y={370} w={124} text="Not treated" tone="plain" />
      <Chip x={176} y={370} w={124} text="Wrong code" tone="plain" />
      <Chip x={308} y={370} w={128} text="Already coded" tone="plain" />
      <rect x={20} y={436} width={440} height={164} rx={14} fill={color('node-bg')} stroke={color('ok')} strokeWidth={2.5} strokeDasharray="8 6" />
      <text x={44} y={470} dy="0.35em" fontSize={TITLE} fontWeight={700} fill={color('text')}>
        Ask the physician
      </text>
      <text x={44} y={502} dy="0.35em" fontSize={LINE} fontWeight={500} fill={color('muted')}>
        Moderate malnutrition, relevant to treatment?
      </text>
      <text x={44} y={530} dy="0.35em" fontSize={15} fontWeight={500} fill={color('muted')}>
        Dietitian note attached
      </text>
      <Chip x={44} y={570} w={90} text="Yes" tone="ok" />
      <Chip x={146} y={570} w={90} text="No" tone="bad" />
    </svg>
  );
}

export const DESCRIPTIONS = {
  'billing-chain':
    'How a hospital gets paid for an inpatient case: staff document in the KIS, coders turn the record into ICD-10-GM and OPS codes, a certified grouper maps them to a DRG, the invoice goes to the Krankenkasse, which pays or sends it to the Medizinischer Dienst for an audit that cuts what the record cannot support. The gap this post is about sits between documenting and coding.',
  pricing:
    'How one secondary diagnosis changes the price: the same case is grouped without and with N17.93, acute kidney failure; without it the case lands in F62C, with it the higher severity moves it to F62B, and the difference in cost weight times the base rate is the price of the code.',
  'running-example':
    'The running example. Kidney: creatinine 1.2 on admission and 4.3 on day three, both in the lab system, and the drug paused by a medication order. Malnutrition: a nursing screening score of 4 on day one, then on day four a scanned dietitian note with a 10 percent weight loss and an order for supplement drinks. At discharge both are in the record and both were treated, but only the kidney failure has a physician acting on it, and neither is coded. A lab rule finds the first and it ends as a suggestion; the second has to be read and ends as a question for the physician.',
  selector:
    'How the evidence selector answers: a fixed question about a candidate code, here whether the malnutrition was treated, numbered passages from the record plus "none of these", and a decision model that picks passage 3, the supplement drinks, with a probability. It cannot write a quote of its own.',
  worklist:
    'What the coder sees: the top suggestion, N17.93, with the two quotes that prove it highlighted and their sources, the DRG before and after, accept and reject with one-click reasons; below it a question bundled for the physician about the malnutrition, with the dietitian note attached.',
  suggestion:
    'The life of one suggestion: a cheap signal raises a candidate, the evidence selector picks the passage that supports it, a DKR rule check decides whether it counts, the grouper prices it, and it ends as a suggestion to the coder, a question to the physician, or is dropped. The malnutrition case ends as a question.',
} as const;

export type FigureName = keyof typeof DESCRIPTIONS;

const FIGURES: Record<FigureName, (props: { id: string }) => ReactNode> = {
  'billing-chain': BillingChain,
  pricing: Pricing,
  'running-example': RunningExample,
  selector: Selector,
  worklist: Worklist,
  suggestion: Suggestion,
};

export default function DesignFigure({ name, id }: { name: FigureName; id: string }) {
  const Figure = FIGURES[name];
  return <Figure id={id} />;
}
