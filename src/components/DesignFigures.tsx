/**
 * The figures of uncoded-hospital-revenue other than its section map
 * (DesignMap.tsx): how a German hospital gets paid for a case, how one code
 * changes its price, the running example's two uncoded diagnoses, the coding
 * agent with its tools and typed answer, and the life of one suggestion through the
 * design, with the step names the map uses. Plus mockups of the screens: the
 * coder's worklist, the evidence on its page, the physician's questions and a
 * detector in shadow mode.
 * Same palette, box style and icons as the map. Both are narrow enough to
 * share one layout between phones and wide screens. Static: rendered on the
 * server, no JavaScript.
 */
import type { ReactNode } from 'react';
import { color, Agent, Envelope, Evals, Gauge, Store, type Point } from '../remotion/shared';
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
    { title: 'Coding agent', line: 'Dietitian note, p. 1', icon: <Agent x={0} y={0} scale={0.75} typing={1} /> },
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

/** A sheet of paper with a short title, filler lines and highlighted facts; dashed and empty when the document is missing. */
function Doc({ x, y, rot, title, lines, scanned, missing }: Point & { rot: number; title: string; lines: (string | null)[]; scanned?: boolean; missing?: string }) {
  const w = 124;
  const h = 108;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot} ${w / 2} ${h / 2})`}>
      <rect width={w} height={h} rx={6} fill={missing ? 'none' : color('surface')} stroke={missing ? color('bad') : color('node-border')} strokeWidth={2} strokeDasharray={missing ? '6 5' : undefined} />
      {scanned && <rect width={w} height={h} rx={6} fill={color('edge')} fillOpacity={0.35} />}
      <text x={10} y={18} dy="0.35em" fontSize={14} fontWeight={700} fill={missing ? color('bad') : color('muted')}>
        {title}
      </text>
      {missing ? (
        <text x={w / 2} y={64} dy="0.35em" textAnchor="middle" fontSize={15} fontStyle="italic" fill={color('bad')}>
          {missing}
        </text>
      ) : (
        lines.map((l, i) => {
          const ly = 44 + i * 24;
          return l ? (
            <g key={i}>
              <rect x={6} y={ly - 11} width={l.length * 8 + 10} height={22} rx={4} fill={color('warn')} fillOpacity={0.35} />
              <text x={11} y={ly} dy="0.35em" fontSize={15} fontWeight={700} fill={color('text')}>
                {l}
              </text>
            </g>
          ) : (
            <rect key={i} x={10} y={ly - 3} width={i % 2 ? 70 : 90} height={6} rx={3} fill={color('edge')} />
          );
        })
      )}
    </g>
  );
}

/**
 * The running example as the two kinds of evidence it is. The kidney failure
 * is a number crossing a line: creatinine against three times its baseline,
 * which a rule can watch. The malnutrition is spread over documents that have
 * to be read, and the physician's is missing. Below, both run through the
 * same two gates in the same columns: both were treated, only one has a
 * physician behind it.
 */
function RunningExample({ id }: { id: string }) {
  const m = `${id}-arrow`;
  const W = 540;
  const cols = [150, 405];

  // Creatinine in mg/dl per day: 1.2 on admission, 4.3 on day 3, then falling once the drug is paused.
  const values = [1.2, 1.4, 4.3, 3.4, 2.6];
  const dayX = (d: number) => 60 + d * 45;
  const valY = (v: number) => 250 - v * 34;
  const points = values.map((v, d) => ({ x: dayX(d), y: valY(v), v }));
  const threshold = 3 * values[0];

  const gates = [
    { label: 'Treated (D003)', y: 344, marks: [true, true] },
    { label: 'Physician involved', y: 392, marks: [true, false] },
  ];
  const outcomeY = 472;

  return (
    <svg viewBox={`0 0 ${W} 520`} role="img" aria-label={DESCRIPTIONS['running-example']} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      <defs>
        <ArrowMarker id={m} />
      </defs>
      {[
        { x: cols[0], title: 'Kidney', line: 'a number crosses a line' },
        { x: cols[1], title: 'Malnutrition', line: 'facts spread over paper' },
      ].map((h) => (
        <g key={h.title}>
          <text x={h.x} y={22} dy="0.35em" textAnchor="middle" fontSize={TITLE} fontWeight={700} fill={color('text')}>
            {h.title}
          </text>
          <text x={h.x} y={48} dy="0.35em" textAnchor="middle" fontSize={16} fontWeight={500} fill={color('muted')}>
            {h.line}
          </text>
        </g>
      ))}

      {/* Kidney: creatinine per day against its baseline and three times it. */}
      <line x1={44} x2={256} y1={250} y2={250} stroke={color('node-border')} strokeWidth={2} />
      <line x1={44} x2={256} y1={valY(values[0])} y2={valY(values[0])} stroke={color('muted')} strokeWidth={1.5} strokeDasharray="5 5" />
      <text x={252} y={valY(values[0]) + 16} dy="0.35em" textAnchor="end" fontSize={14} fill={color('muted')}>
        baseline 1.2
      </text>
      <line x1={44} x2={256} y1={valY(threshold)} y2={valY(threshold)} stroke={color('bad')} strokeWidth={2} strokeDasharray="7 5" />
      <text x={48} y={valY(threshold) - 14} dy="0.35em" fontSize={14} fontWeight={600} fill={color('bad')}>
        3× baseline
      </text>
      <polyline points={points.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke={color('added')} strokeWidth={3} strokeLinejoin="round" />
      {points.map((p, d) => (
        <circle key={d} cx={p.x} cy={p.y} r={d === 2 ? 7 : 5} fill={d === 2 ? color('bad') : color('added')} stroke={color('surface')} strokeWidth={2} />
      ))}
      <text x={points[2].x + 12} y={points[2].y - 6} dy="0.35em" fontSize={15} fontWeight={700} fill={color('bad')}>
        4.3 mg/dl
      </text>
      {values.map((_, d) => (
        <text key={d} x={dayX(d)} y={266} dy="0.35em" textAnchor="middle" fontSize={14} fill={color('muted')}>
          {d === 0 ? 'Day 1' : d + 1}
        </text>
      ))}
      <path d={`M${dayX(2)},280 l-6,9 h12 z`} fill={color('ok')} />
      <text x={dayX(2)} y={302} dy="0.35em" textAnchor="middle" fontSize={14} fontWeight={600} fill={color('ok')}>
        drug paused
      </text>

      {/* Malnutrition: the facts sit in three different documents; the physician's is missing. */}
      <Doc x={276} y={68} rot={-3} title="Nursing form" lines={[null, 'NRS 2002: 4', null]} />
      <Doc x={406} y={76} rot={3} title="Scanned note" lines={['−10% in 3 mo', null, 'drinks 2×/day']} scanned />
      <Doc x={282} y={192} rot={2} title="Medication" lines={[null, 'Supplement', null]} />
      <Doc x={408} y={198} rot={-2} title="Physician" lines={[]} missing="no diagnosis" />

      {/* The same two gates for both, in the same columns. */}
      {cols.map((x, i) => (
        <path
          key={x}
          d={`M${x},318 V${outcomeY - 40}`}
          fill="none"
          stroke={color('node-border')}
          strokeWidth={2.5}
          strokeDasharray={i === 1 ? '7 6' : undefined}
          markerEnd={`url(#${m})`}
        />
      ))}
      {gates.map((g) => (
        <g key={g.label}>
          <rect x={8} y={g.y - 18} width={W - 16} height={36} rx={8} fill={color('node-bg')} stroke={color('edge')} strokeWidth={1.5} />
          <text x={(cols[0] + cols[1]) / 2} y={g.y} dy="0.35em" textAnchor="middle" fontSize={17} fontWeight={600} fill={color('text')}>
            {g.label}
          </text>
          {g.marks.map((yes, i) => (
            <Mark key={i} x={cols[i]} y={g.y} yes={yes} />
          ))}
        </g>
      ))}
      <Step at={{ x: cols[0], y: outcomeY }} w={232} h={72} title="Suggest N17.93" line="F62C → F62B" role="human" />
      <Step at={{ x: cols[1], y: outcomeY }} w={232} h={72} title="Ask the physician" line="about E44.0" role="human" />
    </svg>
  );
}

/** The coding agent: four read-only tools above it, and the typed answer it must return below it. */
function CodingAgent({ id }: { id: string }) {
  const m = `${id}-arrow`;
  const tools = [
    { title: 'Case reader', line: 'one case only' },
    { title: 'ICD-10-GM', line: 'codes and their notes' },
    { title: 'Python', line: '4.3 / 1.2 = 3.6' },
    { title: 'Past decisions', line: 'this hospital' },
  ];
  const xs = [125, 355];
  const ys = [50, 140];
  const agentY = 256;
  const fields = [
    { text: 'code: E44.0', check: 'in the catalog' },
    { text: 'evidence: passages 2, 3', check: 'in this case' },
    { text: 'treated: yes', check: 'yes or no' },
  ];
  const top = agentY + 76;
  const rowH = 46;
  const panelH = fields.length * rowH + 20;
  return (
    <svg viewBox={`0 0 480 ${top + panelH + 64}`} role="img" aria-label={DESCRIPTIONS.agent} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      <defs>
        <ArrowMarker id={m} />
      </defs>
      {xs.map((x) => (
        <g key={x}>{arrow(m, `M${x},176 V${agentY - 40}`)}</g>
      ))}
      {tools.map((t, i) => (
        <Step key={t.title} at={{ x: xs[i % 2], y: ys[Math.floor(i / 2)] }} w={214} h={72} title={t.title} line={t.line} role="platform" />
      ))}
      <Step at={{ x: 240, y: agentY }} w={400} h={72} title="Coding agent" line="read-only tools" role="platform" icon={<Agent x={0} y={0} scale={0.75} typing={1} />} />
      {arrow(m, `M240,${agentY + 36} V${top - 4}`)}
      <rect x={40} y={top} width={400} height={panelH} rx={14} fill={color('node-bg')} stroke={color('node-border')} strokeWidth={2.5} />
      {fields.map((f, i) => {
        const y = top + 10 + i * rowH + rowH / 2;
        return (
          <g key={f.text}>
            <Mark x={68} y={y} yes />
            <text x={92} y={y} dy="0.35em" fontSize={16} fontWeight={600} fill={color('text')}>
              {f.text}
            </text>
            <text x={428} y={y} dy="0.35em" textAnchor="end" fontSize={14} fontWeight={600} fill={color('muted')}>
              {f.check}
            </text>
          </g>
        );
      })}
      <Tag x={240} y={top + panelH + 30} text="Invalid answers are rejected" size={15} />
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

/** A screen's top bar: a back link on the left, where you are on the right. */
function TopBar({ left, right }: { left: string; right: string }) {
  return (
    <g>
      <rect x={20} y={16} width={440} height={44} rx={10} fill={color('node-bg')} stroke={color('edge')} strokeWidth={2} />
      <text x={36} y={38} dy="0.35em" fontSize={15} fontWeight={600} fill={color('added')}>
        {left}
      </text>
      <text x={444} y={38} dy="0.35em" textAnchor="end" fontSize={15} fontWeight={600} fill={color('text')}>
        {right}
      </text>
    </g>
  );
}

/** What a coder sees after opening a suggestion: the scanned page, its numbered passages, and the one the agent cited. */
function EvidencePage(_props: { id: string }) {
  const passages: { y: number; text?: string; picked?: boolean; bars?: number }[] = [
    { y: 140, bars: 2 },
    { y: 214, text: 'Weight down 10% in 3 months.' },
    { y: 272, text: 'Supplement drinks twice a day.', picked: true },
    { y: 334, bars: 2 },
    { y: 408, bars: 1 },
  ];
  return (
    <svg viewBox="0 0 480 540" role="img" aria-label={DESCRIPTIONS['evidence-page']} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      <TopBar left="← Suggestion" right="Dietitian note, scanned, p. 1" />
      <g transform="rotate(0.8 240 280)">
        <rect x={40} y={78} width={400} height={372} rx={4} fill={color('surface')} stroke={color('node-border')} strokeWidth={2} />
        <rect x={40} y={78} width={400} height={372} rx={4} fill={color('edge')} fillOpacity={0.3} />
        {passages.map((p, i) => (
          <g key={i}>
            {p.picked && <rect x={50} y={p.y - 22} width={380} height={44} rx={8} fill={color('ok')} fillOpacity={0.16} stroke={color('ok')} strokeWidth={2.5} />}
            {p.text && !p.picked && <rect x={84} y={p.y - 14} width={p.text.length * 8.6 + 10} height={28} rx={5} fill={color('warn')} fillOpacity={0.3} />}
            <circle cx={66} cy={p.y} r={12} fill={p.picked ? color('ok') : color('edge')} />
            <text x={66} y={p.y} dy="0.35em" textAnchor="middle" fontSize={13} fontWeight={700} fill={p.picked ? '#fff' : color('text')}>
              {i + 1}
            </text>
            {p.text ? (
              <text x={90} y={p.y} dy="0.35em" fontSize={16} fontWeight={p.picked ? 700 : 600} fill={color('text')} fontStyle="italic">
                {p.text}
              </text>
            ) : (
              Array.from({ length: p.bars ?? 1 }, (_, k) => <rect key={k} x={90} y={p.y - 4 + (k - ((p.bars ?? 1) - 1) / 2) * 22} width={k % 2 ? 230 : 310} height={8} rx={4} fill={color('edge')} />)
            )}
          </g>
        ))}
      </g>
      <rect x={20} y={470} width={440} height={54} rx={12} fill={color('node-bg')} stroke={color('ok')} strokeWidth={2.5} />
      <Mark x={48} y={497} yes />
      <text x={72} y={497} dy="0.35em" fontSize={16} fontWeight={600} fill={color('text')}>
        Passage 3 answers "Was it treated?"
      </text>
    </svg>
  );
}

/** The physician's side: open questions bundled one per case, the first one opened. */
function PhysicianQuestion(_props: { id: string }) {
  const others = [
    { y: 382, title: 'Case 4698', line: '1 question' },
    { y: 440, title: 'Case 4702', line: '2 questions' },
  ];
  return (
    <svg viewBox="0 0 480 480" role="img" aria-label={DESCRIPTIONS['physician-question']} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      <text x={24} y={30} dy="0.35em" fontSize={TITLE} fontWeight={700} fill={color('text')}>
        Questions from coding
      </text>
      <text x={456} y={30} dy="0.35em" textAnchor="end" fontSize={15} fontWeight={600} fill={color('muted')}>
        Ward 4B, 3 cases
      </text>
      <rect x={20} y={60} width={440} height={290} rx={14} fill={color('node-bg')} stroke={color('ok')} strokeWidth={2.5} />
      <text x={44} y={92} dy="0.35em" fontSize={15} fontWeight={600} fill={color('muted')}>
        Case 4711, discharge Friday
      </text>
      <text x={44} y={128} dy="0.35em" fontSize={19} fontWeight={700} fill={color('text')}>
        Moderate malnutrition (E44.0),
      </text>
      <text x={44} y={156} dy="0.35em" fontSize={19} fontWeight={700} fill={color('text')}>
        relevant to treatment?
      </text>
      <g transform="translate(44 188)">
        <rect width={392} height={64} rx={10} fill={color('surface')} stroke={color('edge')} strokeWidth={2} />
        <g transform="translate(14 14)">
          <rect width={28} height={36} rx={3} fill={color('node-bg')} stroke={color('node-border')} strokeWidth={2} />
          <rect x={6} y={10} width={16} height={3} rx={1.5} fill={color('edge')} />
          <rect x={6} y={18} width={12} height={3} rx={1.5} fill={color('edge')} />
        </g>
        <text x={56} y={22} dy="0.35em" fontSize={16} fontWeight={600} fill={color('text')}>
          Dietitian note, day 4
        </text>
        <text x={56} y={44} dy="0.35em" fontSize={14} fontWeight={500} fill={color('muted')}>
          −10% in 3 months, supplement drinks
        </text>
      </g>
      <Chip x={44} y={300} w={96} text="Yes" tone="ok" />
      <Chip x={152} y={300} w={96} text="No" tone="bad" />
      <Chip x={260} y={300} w={110} text="Not sure" tone="plain" />
      {others.map((o) => (
        <g key={o.title} opacity={0.6}>
          <rect x={20} y={o.y - 24} width={440} height={48} rx={12} fill={color('node-bg')} stroke={color('edge')} strokeWidth={2} />
          <text x={44} y={o.y} dy="0.35em" fontSize={17} fontWeight={600} fill={color('text')}>
            {o.title}
          </text>
          <text x={436} y={o.y} dy="0.35em" textAnchor="end" fontSize={15} fontWeight={600} fill={color('muted')}>
            {o.line}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** A new detector version in shadow mode next to the live one, and the gate it has to pass before it goes live. */
function Shadow(_props: { id: string }) {
  const metrics = [
    { label: 'Would suggest per week', values: [140, 212], max: 230, fmt: (v: number) => String(v) },
    { label: 'Precision, coder-checked', values: [0.78, 0.74], max: 1, fmt: (v: number) => `${Math.round(v * 100)}%` },
    { label: 'Revenue at stake per week', values: [41, 58], max: 70, fmt: (v: number) => `€${v}k` },
  ];
  const versions = [
    { name: 'v1 live', fill: color('edge') },
    { name: 'v2 shadow', fill: color('added') },
  ];
  const gates = [
    { text: 'Precision at least 70%', yes: true },
    { text: '200 cases checked by a coder', yes: true },
  ];
  return (
    <svg viewBox="0 0 480 560" role="img" aria-label={DESCRIPTIONS.shadow} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      <text x={24} y={28} dy="0.35em" fontSize={TITLE} fontWeight={700} fill={color('text')}>
        Malnutrition detector
      </text>
      <text x={24} y={56} dy="0.35em" fontSize={15} fontWeight={500} fill={color('muted')}>
        4 weeks on live cases
      </text>
      {versions.map((v, i) => (
        <g key={v.name} transform={`translate(${290 + i * 92} 56)`}>
          <rect x={0} y={-8} width={16} height={16} rx={4} fill={v.fill} />
          <text x={22} y={0} dy="0.35em" fontSize={14} fontWeight={600} fill={color('muted')}>
            {v.name}
          </text>
        </g>
      ))}
      {metrics.map((mt, r) => {
        const y = 100 + r * 96;
        return (
          <g key={mt.label}>
            <text x={24} y={y} dy="0.35em" fontSize={16} fontWeight={600} fill={color('text')}>
              {mt.label}
            </text>
            {mt.values.map((v, i) => {
              const w = (v / mt.max) * 330;
              const by = y + 24 + i * 28;
              return (
                <g key={i}>
                  <rect x={24} y={by - 10} width={w} height={20} rx={5} fill={versions[i].fill} />
                  <text x={32 + w} y={by} dy="0.35em" fontSize={14} fontWeight={700} fill={color('text')}>
                    {mt.fmt(v)}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
      <line x1={20} x2={460} y1={392} y2={392} stroke={color('edge')} strokeWidth={2} />
      {gates.map((g, i) => (
        <g key={g.text}>
          <Mark x={40} y={424 + i * 40} yes={g.yes} />
          <text x={64} y={424 + i * 40} dy="0.35em" fontSize={16} fontWeight={500} fill={color('text')}>
            {g.text}
          </text>
        </g>
      ))}
      <Chip x={24} y={524} w={160} text="Promote v2" tone="ok" />
      <text x={200} y={524} dy="0.35em" fontSize={14} fontWeight={500} fill={color('muted')}>
        audit outcomes follow in months
      </text>
    </svg>
  );
}

/** One case in the store: its event log, one version per message, a suggestion pinned to the version it was made on, and the current view built from the log. */
function EventLog({ id }: { id: string }) {
  const m = `${id}-arrow`;
  const rows: { time: string; event: string; source: string; pin?: { text: string; tone: 'ok' | 'bad' } }[] = [
    { time: 'Mon 08:10', event: 'Admission', source: 'ADT message' },
    { time: 'Mon 09:02', event: 'Creatinine 1.2 mg/dl', source: 'lab result' },
    { time: 'Wed 07:45', event: 'Creatinine 4.3 mg/dl', source: 'lab result' },
    { time: 'Wed 11:20', event: 'ACE inhibitor paused', source: 'medication order', pin: { text: 'N17.93', tone: 'ok' } },
    { time: 'Thu 14:05', event: 'Dietitian note', source: 'scanned document' },
    { time: 'Thu 16:30', event: 'v3 corrected to 4.1', source: 'lab correction', pin: { text: 'Re-check', tone: 'bad' } },
  ];
  const top = 56;
  const ROW = 52;
  const viewY = top + rows.length * ROW + 92;
  return (
    <svg viewBox={`0 0 480 ${viewY + 44}`} role="img" aria-label={DESCRIPTIONS['event-log']} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      <defs>
        <ArrowMarker id={m} />
      </defs>
      <text x={24} y={26} dy="0.35em" fontSize={TITLE} fontWeight={700} fill={color('text')}>
        Case 4711: event log
      </text>
      <text x={456} y={26} dy="0.35em" textAnchor="end" fontSize={15} fontWeight={600} fill={color('muted')}>
        append-only
      </text>
      {rows.map((r, i) => {
        const y = top + i * ROW + ROW / 2;
        return (
          <g key={r.time}>
            <rect x={16} y={y - ROW / 2 + 3} width={448} height={ROW - 6} rx={10} fill={color('node-bg')} stroke={r.pin ? (r.pin.tone === 'ok' ? color('ok') : color('bad')) : color('edge')} strokeWidth={r.pin ? 2.5 : 1.5} />
            <circle cx={40} cy={y} r={13} fill={color('added')} />
            <text x={40} y={y} dy="0.35em" textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">
              {`v${i + 1}`}
            </text>
            <text x={66} y={y - 9} dy="0.35em" fontSize={16} fontWeight={600} fill={color('text')}>
              {r.event}
            </text>
            <text x={66} y={y + 11} dy="0.35em" fontSize={13} fontWeight={500} fill={color('muted')}>
              {`${r.time} · ${r.source}`}
            </text>
            {r.pin && <Chip x={352} y={y} w={100} text={r.pin.text} tone={r.pin.tone === 'ok' ? 'ok' : 'bad'} />}
          </g>
        );
      })}
      {arrow(m, `M240,${top + rows.length * ROW + 4} V${viewY - 40}`)}
      <text x={254} y={top + rows.length * ROW + 30} dy="0.35em" fontSize={14} fontWeight={600} fill={color('muted')}>
        replayed into
      </text>
      <Step at={{ x: 240, y: viewY }} w={448} h={72} title="Current view" line="creatinine 4.1, drug paused, 1 scan" role="platform" icon={<Store x={0} y={0} scale={0.55} />} />
    </svg>
  );
}

/** Three suggestions scored by expected value: revenue delta times the chance of acceptance, minus the audit-risk penalty. */
function Ranking(_props: { id: string }) {
  const PX = 0.1;
  const x0 = 56;
  const rows = [
    { name: 'Code B', note: 'modest, well documented', delta: 900, p: 0.95, risk: 50 },
    { name: 'Code A', note: 'valuable, thin evidence', delta: 3000, p: 0.25, risk: 300 },
    { name: 'Code C', note: 'worth nothing, still listed', delta: 0, p: 0.9, risk: 0 },
  ];
  const eur = (v: number) => `€${v.toLocaleString('en-US')}`;
  const legend = [
    { text: 'Δ revenue', fill: 'none', stroke: color('node-border') },
    { text: '× P(accept)', fill: color('added'), stroke: color('added') },
    { text: '− audit risk', fill: color('bad'), stroke: color('bad') },
  ];
  return (
    <svg viewBox="0 0 480 372" role="img" aria-label={DESCRIPTIONS.ranking} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      {legend.map((l, i) => (
        <g key={l.text} transform={`translate(${24 + i * 150} 22)`}>
          <rect x={0} y={-8} width={22} height={16} rx={4} fill={l.fill} stroke={l.stroke} strokeWidth={2} />
          <text x={30} y={0} dy="0.35em" fontSize={14} fontWeight={600} fill={color('muted')}>
            {l.text}
          </text>
        </g>
      ))}
      {rows.map((r, i) => {
        const y = 70 + i * 104;
        const expected = r.delta * r.p;
        const score = Math.round(expected - r.risk);
        return (
          <g key={r.name}>
            <circle cx={30} cy={y} r={13} fill={color('added')} />
            <text x={30} y={y} dy="0.35em" textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff">
              {i + 1}
            </text>
            <text x={x0} y={y} dy="0.35em" fontSize={17} fontWeight={700} fill={color('text')}>
              {r.name}
              <tspan fontWeight={500} fill={color('muted')}>{`  ${r.note}`}</tspan>
            </text>
            {r.delta > 0 && <rect x={x0} y={y + 20} width={r.delta * PX} height={24} rx={5} fill="none" stroke={color('node-border')} strokeWidth={2} strokeDasharray="5 4" />}
            {expected > 0 && <rect x={x0} y={y + 20} width={expected * PX} height={24} rx={5} fill={color('added')} />}
            {r.risk > 0 && <rect x={x0 + (expected - r.risk) * PX} y={y + 20} width={r.risk * PX} height={24} fill={color('bad')} />}
            {r.delta === 0 && <line x1={x0} x2={x0} y1={y + 18} y2={y + 46} stroke={color('node-border')} strokeWidth={3} />}
            <text x={456} y={y + 32} dy="0.35em" textAnchor="end" fontSize={17} fontWeight={700} fill={color('text')}>
              {eur(score)}
            </text>
            <text x={x0} y={y + 62} dy="0.35em" fontSize={14} fontWeight={500} fill={color('muted')}>
              {`${eur(r.delta)} × ${r.p.toFixed(2)} − ${eur(r.risk)}`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Inside the coding agent's answer: from all passages to the few it reads, then the same fields for both running cases and the outcome they lead to. */
function DetectorQuestions({ id }: { id: string }) {
  const m = `${id}-arrow`;
  const funnel = [
    { n: '140', line: 'passages' },
    { n: '20', line: 'read by the agent' },
    { n: '3', line: 'typed fields' },
  ];
  const cols = [318, 428];
  type Answer = { text?: string; yes?: boolean };
  const rows: { q: string; a: [Answer, Answer] }[] = [
    { q: 'Which passage proves it?', a: [{ text: 'passage 7' }, { text: 'passage 3' }] },
    { q: 'Was it treated?', a: [{ yes: true }, { yes: true }] },
    { q: 'Did a physician diagnose it?', a: [{ yes: true }, { yes: false }] },
  ];
  const top = 168;
  const ROW = 54;
  const outY = top + 40 + rows.length * ROW + 34;
  return (
    <svg viewBox={`0 0 480 ${outY + 30}`} role="img" aria-label={DESCRIPTIONS['detector-questions']} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      <defs>
        <ArrowMarker id={m} />
      </defs>
      {funnel.map((f, i) => {
        const cx = 80 + i * 160;
        return (
          <g key={f.line}>
            {i > 0 && arrow(m, `M${cx - 104},52 H${cx - 62}`)}
            <rect x={cx - 56} y={20} width={112} height={64} rx={12} fill={color('node-bg')} stroke={color('added')} strokeWidth={2.5} />
            <text x={cx} y={52} dy="0.35em" textAnchor="middle" fontSize={26} fontWeight={700} fill={color('text')}>
              {f.n}
            </text>
            <text x={cx} y={104} dy="0.35em" textAnchor="middle" fontSize={15} fontWeight={600} fill={color('muted')}>
              {f.line}
            </text>
          </g>
        );
      })}
      {[
        { title: 'Kidney', line: 'N17.93' },
        { title: 'Malnutrition', line: 'E44.0' },
      ].map((h, i) => (
        <g key={h.title}>
          <text x={cols[i]} y={top - 12} dy="0.35em" textAnchor="middle" fontSize={16} fontWeight={700} fill={color('text')}>
            {h.title}
          </text>
          <text x={cols[i]} y={top + 10} dy="0.35em" textAnchor="middle" fontSize={14} fontWeight={600} fill={color('muted')}>
            {h.line}
          </text>
        </g>
      ))}
      {rows.map((r, i) => {
        const y = top + 40 + i * ROW + ROW / 2;
        return (
          <g key={r.q}>
            {i % 2 === 0 && <rect x={8} y={y - ROW / 2} width={464} height={ROW} rx={8} fill={color('node-bg')} />}
            <text x={18} y={y} dy="0.35em" fontSize={16} fontWeight={600} fill={color('text')}>
              {r.q}
            </text>
            {r.a.map((ans, k) =>
              ans.text ? (
                <text key={k} x={cols[k]} y={y} dy="0.35em" textAnchor="middle" fontSize={15} fontWeight={700} fill={color('ok')}>
                  {ans.text}
                </text>
              ) : (
                <Mark key={k} x={cols[k]} y={y} yes={Boolean(ans.yes)} />
              ),
            )}
          </g>
        );
      })}
      <Chip x={cols[0] - 46} y={outY} w={92} text="Suggest" tone="ok" />
      <Chip x={cols[1] - 46} y={outY} w={92} text="Ask" tone="plain" />
      <text x={18} y={outY} dy="0.35em" fontSize={16} fontWeight={600} fill={color('muted')}>
        Leads to
      </text>
    </svg>
  );
}

/** Passages a keyword search returns for malnutrition: four traps the agent must reject, and the one that proves it. */
function Traps(_props: { id: string }) {
  const rows: { text: string; label: string; ok?: boolean }[] = [
    { text: 'No signs of malnutrition.', label: 'Negated' },
    { text: 'Weight loss after surgery, 2023.', label: 'Earlier stay' },
    { text: 'Dietitian consult if weight drops.', label: 'Only a plan' },
    { text: 'Weight −10% (copied from 2023).', label: 'Copied forward' },
    { text: 'Supplement drinks since day 4.', label: 'Current, treated', ok: true },
  ];
  const ROW = 62;
  return (
    <svg viewBox={`0 0 480 ${rows.length * ROW + 24}`} role="img" aria-label={DESCRIPTIONS.traps} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      {rows.map((r, i) => {
        const y = 16 + i * ROW + ROW / 2;
        return (
          <g key={r.label}>
            <rect x={8} y={y - ROW / 2 + 5} width={464} height={ROW - 10} rx={10} fill={color('node-bg')} stroke={r.ok ? color('ok') : color('edge')} strokeWidth={r.ok ? 2.5 : 1.5} />
            <Mark x={34} y={y} yes={Boolean(r.ok)} />
            <text x={58} y={y} dy="0.35em" fontSize={15} fontWeight={600} fontStyle="italic" fill={color('text')}>
              {r.text}
            </text>
            <text x={460} y={y} dy="0.35em" textAnchor="end" fontSize={14} fontWeight={700} fill={r.ok ? color('ok') : color('bad')}>
              {r.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** A lane: a titled band with a timing note on the right. */
function Lane({ y, h, title, note, role }: { y: number; h: number; title: string; note: string; role: Role }) {
  return (
    <g>
      <rect x={8} y={y} width={464} height={h} rx={14} fill="none" stroke={STROKE[role]} strokeWidth={2.5} strokeDasharray="8 6" />
      <text x={24} y={y + 24} dy="0.35em" fontSize={17} fontWeight={700} fill={color('text')}>
        {title}
      </text>
      <text x={456} y={y + 24} dy="0.35em" textAnchor="end" fontSize={14} fontWeight={600} fill={color('muted')}>
        {note}
      </text>
    </g>
  );
}

/** A small box in a lane, for one step. */
function Pill({ x, y, w, text, dashed }: Point & { w: number; text: string; dashed?: boolean }) {
  return (
    <g>
      <rect x={x} y={y - 20} width={w} height={40} rx={10} fill={color('node-bg')} stroke={color('node-border')} strokeWidth={2} strokeDasharray={dashed ? '6 5' : undefined} />
      <text x={x + w / 2} y={y} dy="0.35em" textAnchor="middle" fontSize={13} fontWeight={700} fill={color('text')}>
        {text}
      </text>
    </g>
  );
}

/** What runs when: the background pipeline keeps the suggestion queue current, the foreground reads it and decides. */
function Lanes({ id }: { id: string }) {
  const m = `${id}-arrow`;
  const bg = ['Sync', 'Detectors', 'Grouper', 'Update queue'];
  const fg = ['Open queue', 'Accept / reject', 'Write-back'];
  return (
    <svg viewBox="0 0 480 500" role="img" aria-label={DESCRIPTIONS.lanes} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      <defs>
        <ArrowMarker id={m} />
      </defs>
      <Lane y={8} h={172} title="Background, async" note="hours behind the record" role="platform" />
      {bg.map((t, i) => (
        <g key={t}>
          {i > 0 && arrow(m, `M${22 + i * 114 - 12},86 H${22 + i * 114 - 2}`)}
          <Pill x={22 + i * 114} y={86} w={102} text={t} />
        </g>
      ))}
      <text x={24} y={138} dy="0.35em" fontSize={14} fontWeight={600} fill={color('muted')}>
        Physician answers: days later, as new events
      </text>
      <text x={24} y={162} dy="0.35em" fontSize={14} fontWeight={600} fill={color('muted')}>
        New catalog year: re-run the open cases
      </text>
      {arrow(m, `M240,180 V214`)}
      <Step at={{ x: 240, y: 252 }} w={330} h={68} title="Suggestion queue" line="per case version" role="platform" icon={<Store x={0} y={0} scale={0.55} />} />
      {arrow(m, `M240,286 V320`)}
      <Lane y={328} h={160} title="Foreground, sync" note="milliseconds" role="human" />
      {fg.map((t, i) => (
        <g key={t}>
          {i > 0 && arrow(m, `M${24 + i * 148 - 18},408 H${24 + i * 148 - 2}`, i === 2)}
          <Pill x={24 + i * 148} y={408} w={128} text={t} dashed={i === 2} />
        </g>
      ))}
      <text x={24} y={460} dy="0.35em" fontSize={14} fontWeight={600} fill={color('muted')}>
        People read and decide; nobody waits on a model
      </text>
    </svg>
  );
}

export const DESCRIPTIONS = {
  'billing-chain':
    'How a hospital gets paid for an inpatient case: staff document in the KIS, coders turn the record into ICD-10-GM and OPS codes, a certified grouper maps them to a DRG, the invoice goes to the Krankenkasse, which pays or sends it to the Medizinischer Dienst for an audit that cuts what the record cannot support. The gap this post is about sits between documenting and coding.',
  pricing:
    'How one secondary diagnosis changes the price: the same case is grouped without and with N17.93, acute kidney failure; without it the case lands in F62C, with it the higher severity moves it to F62B, and the difference in cost weight times the base rate is the price of the code.',
  'running-example':
    'The running example as two kinds of evidence. Kidney: a chart of creatinine per day, 1.2 on admission, 4.3 on day three, above the line at three times the baseline, then falling after the drug is paused; a rule can watch a number cross a line. Malnutrition: the facts are spread over a nursing form with an NRS 2002 score of 4, a scanned dietitian note with a 10 percent weight loss and supplement drinks twice a day, and the medication list, while the physician has no diagnosis. Both pass the D003 gate because both were treated; only the kidney failure passes the physician gate, so N17.93 becomes a suggestion that moves the case from F62C to F62B, while E44.0 becomes a question for the physician.',
  agent:
    'The coding agent and its four read-only tools: a case reader that can only open the one case it was started on, the ICD-10-GM catalog with each code\'s notes, Python for arithmetic such as 4.3 divided by 1.2 is 3.6, and this hospital\'s past coding decisions. Its answer is a typed record, here code E44.0, which must exist in the catalog, evidence passages 2 and 3, which must exist in this case, and treated yes. An answer that fails these checks is rejected.',
  worklist:
    'What the coder sees: the top suggestion, N17.93, with the two quotes that prove it highlighted and their sources, the DRG before and after, accept and reject with one-click reasons; below it a question bundled for the physician about the malnutrition, with the dietitian note attached.',
  'event-log':
    'The running example\'s case in the store as an append-only event log, one version per message: v1 admission, v2 creatinine 1.2, v3 creatinine 4.3, v4 the ACE inhibitor paused, where the N17.93 suggestion is made, v5 the scanned dietitian note, and v6 a lab correction of v3 to 4.1, which marks the suggestion for a re-check. The log is replayed into the current view: creatinine 4.1, drug paused, one scan.',
  ranking:
    'Three invented suggestions ranked by expected value, revenue delta times the probability the coder accepts minus the audit-risk penalty. First, code B: 900 euros times 0.95 minus 50 is 805. Second, code A: 3,000 euros times 0.25 minus 300 is 450. Last, code C: worth nothing, still listed at 0.',
  'detector-questions':
    'Inside the coding agent\'s answer: of 140 passages in the record, the agent reads 20, and fills three typed fields per candidate. Kidney failure, N17.93: passage 7 proves it, treated yes, diagnosed by a physician yes, so it becomes a suggestion. Malnutrition, E44.0: passage 3 proves it, treated yes, diagnosed by a physician no, so it becomes a question for the physician.',
  traps:
    'Five passages a search for malnutrition returns: "No signs of malnutrition" is negated; "Weight loss after surgery, 2023" is an earlier stay; "Dietitian consult if weight drops" is only a plan; "Weight minus 10 percent, copied from 2023" is copied forward. Only "Supplement drinks since day 4" proves current, treated malnutrition.',
  lanes:
    'What runs when. In the background, asynchronously and hours behind the record: each sync from the hospital\'s copy of the data runs the detectors and the grouper on the cases that changed and updates the suggestion queue; physician answers come back days later, and a new catalog year re-runs the open cases. In the foreground, synchronously and in milliseconds: coders open the queue, accept or reject, and write-back to the KIS is queued. Nothing in the foreground waits on a model.',
  'evidence-page':
    'What a coder sees after opening a suggestion: the scanned dietitian note, page 1, split into numbered passages; passage 2, the weight loss, is marked, and passage 3, supplement drinks twice a day, is outlined as the one the agent cited to answer "Was it treated?".',
  'physician-question':
    'The physician\'s side: questions from coding bundled one per case. The open one asks whether moderate malnutrition, E44.0, was relevant to treatment, with the dietitian note from day four attached, and three answers: yes, no, not sure. Two more cases wait below with one and two questions.',
  shadow:
    'A new version of the malnutrition detector in shadow mode for four weeks next to the live one, with invented numbers: v2 would suggest 212 codes a week against 140, has a precision of 74 percent against 78 on the suggestions a coder checked, and puts 58 thousand euros a week at stake against 41. It passes the gate of at least 70 percent precision and 200 cases checked by a coder, so it can be promoted; audit outcomes follow months later.',
  suggestion:
    'The life of one suggestion: a cheap signal raises a candidate, the coding agent cites the passage that supports it, a DKR rule check decides whether it counts, the grouper prices it, and it ends as a suggestion to the coder, a question to the physician, or is dropped. The malnutrition case ends as a question.',
} as const;

export type FigureName = keyof typeof DESCRIPTIONS;

const FIGURES: Record<FigureName, (props: { id: string }) => ReactNode> = {
  'billing-chain': BillingChain,
  pricing: Pricing,
  'running-example': RunningExample,
  agent: CodingAgent,
  worklist: Worklist,
  'event-log': EventLog,
  'detector-questions': DetectorQuestions,
  traps: Traps,
  lanes: Lanes,
  ranking: Ranking,
  'evidence-page': EvidencePage,
  'physician-question': PhysicianQuestion,
  shadow: Shadow,
  suggestion: Suggestion,
};

export default function DesignFigure({ name, id }: { name: FigureName; id: string }) {
  const Figure = FIGURES[name];
  return <Figure id={id} />;
}
