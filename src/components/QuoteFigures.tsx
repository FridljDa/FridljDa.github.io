/**
 * The figures of from-drawing-to-quote other than its section map
 * (QuoteMap.tsx): how a quote gets made today, what the system reads out of
 * the running example's request, assessment with rules and similar past
 * parts, the break-even between the two machines, the review screen, and
 * three overrides becoming a proposed rule. Same palette, box style and icons as the map, and
 * narrow enough to share one layout between phones and wide screens. Static:
 * rendered on the server, no JavaScript.
 */
import type { ReactNode } from 'react';
import { color, Expert, Reply, type Point } from '../remotion/shared';
import { ArrowMarker, Tag } from './map-parts';

type Role = 'company' | 'platform' | 'human';

const STROKE: Record<Role, string> = {
  company: color('node-border'),
  platform: color('added'),
  human: color('ok'),
};

const TITLE = 21;
const LINE = 18;

/** A box with a title and one short label under it. */
function Step({ at, w, h, title, line, role }: { at: Point; w: number; h: number; title: string; line?: string; role: Role }) {
  const titleY = line ? at.y - 11 : at.y;
  return (
    <g>
      <rect x={at.x - w / 2} y={at.y - h / 2} width={w} height={h} rx={14} fill={color('node-bg')} stroke={STROKE[role]} strokeWidth={2.5} />
      <text x={at.x} y={titleY} dy="0.35em" textAnchor="middle" fontSize={TITLE} fontWeight={600} fill={color('text')}>
        {title}
      </text>
      {line && (
        <text x={at.x} y={at.y + 15} dy="0.35em" textAnchor="middle" fontSize={LINE} fontWeight={500} fill={color('muted')}>
          {line}
        </text>
      )}
    </g>
  );
}

const arrow = (marker: string, d: string, dashed = false) => (
  <path d={d} fill="none" stroke={color('node-border')} strokeWidth={2.5} strokeDasharray={dashed ? '7 6' : undefined} markerEnd={`url(#${marker})`} />
);

/** A rounded label with a colored outline, e.g. where a value came from. Right-aligned at x. */
function Chip({ x, y, text, tone }: Point & { text: string; tone: 'ok' | 'bad' | 'muted' | 'added' }) {
  const width = text.length * 8.6 + 22;
  return (
    <g>
      <rect x={x - width} y={y - 14} width={width} height={28} rx={14} fill={color('surface')} stroke={color(tone === 'muted' ? 'node-border' : tone)} strokeWidth={2} />
      <text x={x - width / 2} y={y} dy="0.35em" textAnchor="middle" fontSize={15} fontWeight={600} fill={color('text')}>
        {text}
      </text>
    </g>
  );
}

/** Two columns, three rows, read left to right: the request, the expert's three steps, then the ERP and the offer. */
function Today({ id }: { id: string }) {
  const m = `${id}-arrow`;
  const xs = [110, 330];
  const ys = [70, 200, 330];
  const steps: { title: string; line: string; role: Role }[] = [
    { title: 'Request', line: 'mail, drawings', role: 'company' },
    { title: 'Check', line: 'anything missing?', role: 'human' },
    { title: 'Assess', line: 'machine, tooling', role: 'human' },
    { title: 'Calculate', line: 'in a spreadsheet', role: 'human' },
    { title: 'Retype', line: 'into the ERP', role: 'company' },
    { title: 'Send', line: 'offer as PDF', role: 'company' },
  ];
  return (
    <svg viewBox="0 0 440 390" role="img" aria-label={DESCRIPTIONS.today} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      <defs>
        <ArrowMarker id={m} />
      </defs>
      {ys.map((y) => (
        <g key={y}>{arrow(m, `M200,${y} H236`)}</g>
      ))}
      {/* From the end of each row back to the start of the next. */}
      {arrow(m, 'M330,110 V135 H110 V156')}
      {arrow(m, 'M330,240 V265 H110 V286')}
      {steps.map((s, i) => (
        <Step key={s.title} at={{ x: xs[i % 2], y: ys[Math.floor(i / 2)] }} w={180} h={80} title={s.title} line={s.line} role={s.role} />
      ))}
      {/* Where the time goes: the expert's assessment and calculation. */}
      <Tag x={220} y={160} text="One expert" size={15} />
    </svg>
  );
}

/** The running example's request as the system reads it: one row per field, with where its value came from. */
function Request({ id }: { id: string }) {
  const rows: { field: string; value: string; source: string; tone: 'ok' | 'bad' | 'muted' | 'added' }[] = [
    { field: 'Product line', value: 'Formed parts', source: 'Classified', tone: 'added' },
    { field: 'Material', value: 'Stainless 1.4310', source: 'Title block', tone: 'ok' },
    { field: 'Diameter', value: '4 mm', source: 'Drawing', tone: 'ok' },
    { field: 'Surface', value: '—', source: 'Missing', tone: 'bad' },
    { field: 'Heat treatment', value: 'None', source: 'Drawing note', tone: 'ok' },
    { field: 'Quantity', value: '45,000 a year', source: 'Email', tone: 'muted' },
    { field: 'Delivery', value: 'From Q2', source: 'Email', tone: 'muted' },
  ];
  const top = 92;
  const step = 44;
  const bottom = top + rows.length * step;
  return (
    <svg viewBox={`0 0 520 ${bottom + 92}`} role="img" aria-label={DESCRIPTIONS.request} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      <rect x={10} y={10} width={500} height={bottom + 72} rx={14} fill={color('node-bg')} stroke={color('added')} strokeWidth={2.5} />
      <text x={30} y={42} dy="0.35em" fontSize={TITLE} fontWeight={700} fill={color('text')}>
        LO-318 Tent-pole clip
      </text>
      <text x={30} y={68} dy="0.35em" fontSize={16} fontWeight={500} fill={color('muted')}>
        Lindqvist Outdoor, request by email
      </text>
      {rows.map((r, i) => {
        const y = top + 22 + i * step;
        const missing = r.tone === 'bad';
        return (
          <g key={r.field}>
            {missing && <rect x={20} y={y - 19} width={480} height={38} rx={8} fill={color('bad')} fillOpacity={0.2} />}
            <text x={30} y={y} dy="0.35em" fontSize={17} fontWeight={500} fill={color('muted')}>
              {r.field}
            </text>
            <text x={170} y={y} dy="0.35em" fontSize={17} fontWeight={700} fill={color('text')}>
              {r.value}
            </text>
            <Chip x={492} y={y} text={r.source} tone={r.tone} />
          </g>
        );
      })}
      <line x1={20} x2={500} y1={bottom + 12} y2={bottom + 12} stroke={color('edge')} strokeWidth={2} />
      <Reply x={44} y={bottom + 44} scale={1.1} stroke={color('added')} />
      <text x={68} y={bottom + 44} dy="0.35em" fontSize={17} fontWeight={600} fill={color('text')}>
        Question drafted: surface, run length?
      </text>
    </svg>
  );
}

/** Assessment for the running example: the rules allow both machines, and the three most similar past parts show what each choice took. */
function Similar({ id }: { id: string }) {
  const m = `${id}-arrow`;
  const parts = [
    { no: 'A-2291', name: 'Tarp clip, 4 mm', machine: 'Large', hours: '85 h' },
    { no: 'A-3107', name: 'Hose clip, 3.5 mm', machine: 'Large', hours: '100 h' },
    { no: 'A-1450', name: 'Retaining clip, 4 mm', machine: 'Small', hours: '8 h' },
  ];
  const rules = ['4 mm: both machines', '45,000 a year: both'];
  return (
    <svg viewBox="0 0 520 580" role="img" aria-label={DESCRIPTIONS.similar} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      <defs>
        <ArrowMarker id={m} />
      </defs>
      <rect x={10} y={10} width={500} height={120} rx={14} fill={color('node-bg')} stroke={color('added')} strokeWidth={2.5} />
      <text x={30} y={40} dy="0.35em" fontSize={TITLE} fontWeight={700} fill={color('text')}>
        Written rules
      </text>
      {rules.map((r, i) => (
        <g key={r} transform={`translate(42 ${76 + i * 32})`}>
          <circle r={11} fill={color('ok')} />
          <path d="M-5,0 l3.5,3.5 l6.5,-7" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          <text x={22} y={0} dy="0.35em" fontSize={17} fontWeight={500} fill={color('text')}>
            {r}
          </text>
        </g>
      ))}

      <rect x={10} y={150} width={500} height={230} rx={14} fill={color('node-bg')} stroke={color('added')} strokeWidth={2.5} />
      <text x={30} y={180} dy="0.35em" fontSize={TITLE} fontWeight={700} fill={color('text')}>
        Similar past parts
      </text>
      {parts.map((p, i) => {
        const y = 230 + i * 56;
        return (
          <g key={p.no}>
            <text x={30} y={y - 10} dy="0.35em" fontSize={17} fontWeight={700} fill={color('text')}>
              {p.no} <tspan fontWeight={500}>{p.name}</tspan>
            </text>
            <text x={30} y={y + 14} dy="0.35em" fontSize={16} fontWeight={500} fill={color('muted')}>
              {p.machine} machine, tooling {p.hours}
            </text>
          </g>
        );
      })}

      {arrow(m, 'M260,380 V426')}
      <rect x={60} y={430} width={400} height={130} rx={14} fill={color('node-bg')} stroke={color('added')} strokeWidth={2.5} />
      <text x={84} y={470} dy="0.35em" fontSize={TITLE} fontWeight={700} fill={color('text')}>
        Proposal to the expert
      </text>
      <text x={84} y={514} dy="0.35em" fontSize={17} fontWeight={600} fill={color('text')}>
        Large machine, 90 h tooling
      </text>
      <text x={84} y={540} dy="0.35em" fontSize={17} fontWeight={500} fill={color('muted')}>
        Small machine as a second variant
      </text>
    </svg>
  );
}

/** The review screen for the running example: the drawing next to the draft, the edited tooling hours and the reason picked for the change. */
function Review({ id }: { id: string }) {
  const fields = [
    { field: 'Material', value: 'Stainless 1.4310' },
    { field: 'Diameter', value: '4 mm', linked: true },
    { field: 'Heat treatment', value: 'None' },
    { field: 'Quantity', value: '45,000 / yr' },
  ];
  const reasons = [
    { text: 'Misread', x: 26 },
    { text: 'Rule doesn’t apply', x: 126 },
    { text: 'Differs from similar parts', x: 26, row: 1, picked: true },
    { text: 'Customer-specific', x: 286, row: 1 },
  ];
  return (
    <svg viewBox="0 0 520 640" role="img" aria-label={DESCRIPTIONS.review} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      <rect x={10} y={10} width={500} height={620} rx={14} fill={color('node-bg')} stroke={color('ok')} strokeWidth={2.5} />
      <text x={26} y={40} dy="0.35em" fontSize={TITLE} fontWeight={700} fill={color('text')}>
        LO-318 <tspan fontWeight={500} fill={color('muted')}>Lindqvist Outdoor</tspan>
      </text>

      {/* The open question blocks the offer, not the draft. */}
      <rect x={20} y={64} width={480} height={40} rx={8} fill={color('warn')} fillOpacity={0.22} stroke={color('warn')} strokeWidth={2} />
      <text x={34} y={84} dy="0.35em" fontSize={16} fontWeight={600} fill={color('text')}>
        Surface missing: question to the customer
      </text>
      <Chip x={490} y={84} text="Send" tone="added" />

      {/* The drawing, with the spot the selected value was read from outlined. */}
      <rect x={20} y={120} width={232} height={190} rx={8} fill={color('surface')} stroke={color('node-border')} strokeWidth={2} />
      {/* A clip: a straight leg, a tight loop at the top, a short return leg. */}
      <path d="M110,280 V170 A26,26 0 0 1 162,170 V214 Q162,230 178,230 H200" fill="none" stroke={color('node-border')} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
      <text x={44} y={204} dy="0.35em" fontSize={15} fontWeight={600} fill={color('muted')}>
        Ø4
      </text>
      <rect x={36} y={190} width={42} height={28} rx={6} fill="none" stroke={color('added')} strokeWidth={2.5} />
      <text x={136} y={292} dy="0.35em" textAnchor="middle" fontSize={14} fontWeight={500} fill={color('muted')}>
        Drawing, page 1
      </text>

      {fields.map((f, i) => {
        const y = 140 + i * 44;
        return (
          <g key={f.field}>
            {f.linked && <rect x={264} y={y - 18} width={236} height={36} rx={8} fill="none" stroke={color('added')} strokeWidth={2.5} />}
            <text x={276} y={y} dy="0.35em" fontSize={15} fontWeight={500} fill={color('muted')}>
              {f.field}
            </text>
            <text x={490} y={y} dy="0.35em" textAnchor="end" fontSize={16} fontWeight={700} fill={color('text')}>
              {f.value}
            </text>
          </g>
        );
      })}

      <text x={26} y={344} dy="0.35em" fontSize={17} fontWeight={700} fill={color('text')}>
        Two variants
      </text>
      {[
        { name: 'Small machine', hours: '8 h', price: '1,200 € + 0.48 €/pc' },
        { name: 'Large machine', hours: '100 h', price: '15,000 € + 0.19 €/pc', edited: '90' },
      ].map((v, i) => {
        const y = 386 + i * 54;
        return (
          <g key={v.name}>
            <rect x={20} y={y - 22} width={480} height={44} rx={8} fill={color('surface')} stroke={v.edited ? color('warn') : color('edge')} strokeWidth={2} />
            <text x={34} y={y} dy="0.35em" fontSize={16} fontWeight={600} fill={color('text')}>
              {v.name}
            </text>
            {v.edited && (
              <text x={196} y={y} dy="0.35em" fontSize={16} fontWeight={500} fill={color('muted')} textDecoration="line-through">
                {v.edited}
              </text>
            )}
            <text x={v.edited ? 222 : 196} y={y} dy="0.35em" fontSize={16} fontWeight={700} fill={color('text')}>
              {v.hours}
            </text>
            <text x={490} y={y} dy="0.35em" textAnchor="end" fontSize={16} fontWeight={500} fill={color('text')}>
              {v.price}
            </text>
          </g>
        );
      })}

      <text x={26} y={486} dy="0.35em" fontSize={16} fontWeight={600} fill={color('text')}>
        Why 100 h?
      </text>
      {reasons.map((r) => {
        const width = r.text.length * 8.6 + 22;
        const y = 524 + (r.row ?? 0) * 40;
        return (
          <g key={r.text}>
            <rect x={r.x} y={y - 14} width={width} height={28} rx={14} fill={r.picked ? color('ok') : color('surface')} stroke={r.picked ? color('ok') : color('node-border')} strokeWidth={2} />
            <text x={r.x + width / 2} y={y} dy="0.35em" textAnchor="middle" fontSize={15} fontWeight={600} fill={r.picked ? '#fff' : color('text')}>
              {r.text}
            </text>
          </g>
        );
      })}
      <text x={26} y={604} dy="0.35em" fontSize={15} fontWeight={500} fill={color('muted')}>
        Offer waits for the surface
      </text>
    </svg>
  );
}

/** Total cost over the quantity ordered for the two machines, with the running example's invented numbers. */
function BreakEven({ id }: { id: string }) {
  const variants = [
    { name: 'Small machine', tooling: 1200, piece: 0.48, stroke: color('other') },
    { name: 'Large machine', tooling: 13500, piece: 0.19, stroke: color('added') },
  ];
  const plot = { left: 92, right: 490, top: 50, bottom: 300 };
  const maxQ = 140000;
  const maxC = 80000;
  const x = (q: number) => plot.left + (q / maxQ) * (plot.right - plot.left);
  const y = (c: number) => plot.bottom - (c / maxC) * (plot.bottom - plot.top);
  const cost = (v: (typeof variants)[number], q: number) => v.tooling + v.piece * q;
  const qStar = (variants[1].tooling - variants[0].tooling) / (variants[0].piece - variants[1].piece);
  const marks = [
    { q: 45000, text: '1 year' },
    { q: 135000, text: '3 years' },
  ];
  return (
    <svg viewBox="0 0 520 420" role="img" aria-label={DESCRIPTIONS['break-even']} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      {[0, 20000, 40000, 60000, 80000].map((c) => (
        <g key={c}>
          <line x1={plot.left} x2={plot.right} y1={y(c)} y2={y(c)} stroke={color('edge')} strokeWidth={1} />
          <text x={plot.left - 10} y={y(c)} dy="0.35em" textAnchor="end" fontSize={15} fill={color('muted')}>
            {c === 0 ? '0' : `${c / 1000}k €`}
          </text>
        </g>
      ))}
      {[0, 40000, 80000, 120000].map((q) => (
        <text key={q} x={x(q)} y={plot.bottom + 22} dy="0.35em" textAnchor="middle" fontSize={15} fill={color('muted')}>
          {q === 0 ? '0' : `${q / 1000}k`}
        </text>
      ))}
      <text x={(plot.left + plot.right) / 2} y={plot.bottom + 52} dy="0.35em" textAnchor="middle" fontSize={16} fontWeight={600} fill={color('muted')}>
        Pieces ordered
      </text>
      {marks.map((mk) => (
        <g key={mk.q}>
          <line x1={x(mk.q)} x2={x(mk.q)} y1={plot.top - 14} y2={plot.bottom} stroke={color('node-border')} strokeWidth={1.5} strokeDasharray="5 5" />
          <text x={x(mk.q)} y={plot.top - 26} dy="0.35em" textAnchor="middle" fontSize={15} fontWeight={600} fill={color('text')}>
            {mk.text}
          </text>
        </g>
      ))}
      {variants.map((v) => (
        <path key={v.name} d={`M${x(0)},${y(cost(v, 0))} L${x(maxQ)},${y(cost(v, maxQ))}`} stroke={v.stroke} strokeWidth={3} strokeLinecap="round" fill="none" />
      ))}
      <circle cx={x(qStar)} cy={y(cost(variants[0], qStar))} r={6} fill={color('text')} stroke={color('surface')} strokeWidth={2} />
      <text x={x(qStar) - 12} y={y(cost(variants[0], qStar)) - 18} dy="0.35em" textAnchor="end" fontSize={15} fontWeight={600} fill={color('text')}>
        same price
      </text>
      {/* The gap at three years, which the caption quotes. */}
      <text x={x(135000) - 10} y={y((cost(variants[0], 135000) + cost(variants[1], 135000)) / 2)} dy="0.35em" textAnchor="end" fontSize={15} fontWeight={700} fill={color('text')}>
        ≈ 27k €
      </text>
      <text transform={`translate(18 ${(plot.top + plot.bottom) / 2}) rotate(-90)`} textAnchor="middle" fontSize={16} fontWeight={600} fill={color('muted')}>
        Total price
      </text>
      {/* Direct labels: the small machine's above and left of its line, the large machine's below and right. */}
      <text x={x(100000) - 12} y={y(cost(variants[0], 100000)) - 16} dy="0.35em" textAnchor="end" fontSize={16} fontWeight={700} fill={color('text')}>
        Small machine
      </text>
      <text x={x(80000) + 12} y={y(cost(variants[1], 80000)) + 22} dy="0.35em" fontSize={16} fontWeight={700} fill={color('text')}>
        Large machine
      </text>
      <g transform={`translate(${plot.left} ${plot.bottom + 86})`} fontSize={15} fontWeight={600}>
        {variants.map((v, i) => (
          <g key={v.name} transform={`translate(0 ${i * 24})`}>
            <line x1={0} x2={22} y1={0} y2={0} stroke={v.stroke} strokeWidth={3} strokeLinecap="round" />
            <text x={30} y={0} dy="0.35em" fill={color('muted')}>
              {v.name}: {v.tooling.toLocaleString('en-US')} € tooling + {v.piece.toFixed(2)} € a piece
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}

/** Overrides of one kind, the rule they suggest, and the expert's decision. */
function Overrides({ id }: { id: string }) {
  const m = `${id}-arrow`;
  const rows = [
    { req: 'R-1187', what: 'Stainless, 3 mm, tight bend', change: '+12 h' },
    { req: 'R-1203', what: 'Stainless, 5 mm, tight bend', change: '+8 h' },
    { req: 'R-1262', what: 'Stainless, 4 mm, tight bend', change: '+10 h' },
  ];
  return (
    <svg viewBox="0 0 520 610" role="img" aria-label={DESCRIPTIONS.overrides} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      <defs>
        <ArrowMarker id={m} />
      </defs>
      <rect x={10} y={10} width={500} height={220} rx={14} fill={color('node-bg')} stroke={color('ok')} strokeWidth={2.5} />
      <text x={30} y={40} dy="0.35em" fontSize={TITLE} fontWeight={700} fill={color('text')}>
        Overrides of one kind
      </text>
      {rows.map((r, i) => {
        const y = 92 + i * 46;
        return (
          <g key={r.req}>
            <text x={30} y={y - 9} dy="0.35em" fontSize={17} fontWeight={700} fill={color('text')}>
              {r.req} <tspan fontWeight={500}>{r.what}</tspan>
            </text>
            <text x={30} y={y + 13} dy="0.35em" fontSize={15} fontWeight={500} fill={color('muted')}>
              Tooling {r.change}, “differs from similar parts”
            </text>
          </g>
        );
      })}

      {arrow(m, 'M260,230 V266')}
      <rect x={10} y={270} width={500} height={150} rx={14} fill={color('node-bg')} stroke={color('added')} strokeWidth={2.5} strokeDasharray="7 6" />
      <text x={30} y={300} dy="0.35em" fontSize={TITLE} fontWeight={700} fill={color('text')}>
        Proposed rule
      </text>
      <text x={30} y={340} dy="0.35em" fontSize={17} fontWeight={600} fill={color('text')}>
        Stainless, bend radius under the diameter
      </text>
      <text x={30} y={364} dy="0.35em" fontSize={17} fontWeight={600} fill={color('text')}>
        → 10 h more tooling
      </text>
      <text x={30} y={396} dy="0.35em" fontSize={15} fontWeight={500} fill={color('muted')}>
        On 9 other past requests: agrees with the expert on 8
      </text>

      {arrow(m, 'M260,420 V456')}
      <rect x={10} y={460} width={500} height={130} rx={14} fill={color('node-bg')} stroke={color('ok')} strokeWidth={2.5} />
      <Expert x={50} y={500} scale={0.95} />
      <text x={86} y={500} dy="0.35em" fontSize={TITLE} fontWeight={700} fill={color('text')}>
        The expert decides
      </text>
      {[
        { text: 'Approve', tone: 'ok' as const, x: 186 },
        { text: 'Edit', tone: 'muted' as const, x: 296 },
        { text: 'Reject', tone: 'bad' as const, x: 416 },
      ].map((b) => (
        <Chip key={b.text} x={b.x} y={553} text={b.text} tone={b.tone} />
      ))}
    </svg>
  );
}

export const DESCRIPTIONS = {
  today:
    'How a quote gets made today: a request arrives by mail with drawings, someone checks whether anything is missing, the expert assesses machine and tooling, calculates the price in a spreadsheet, the result is retyped into the ERP, and the offer is sent as a PDF. Assessing and calculating sit with one expert.',
  request:
    'What the system reads out of the running example’s request, LO-318, a tent-pole clip for Lindqvist Outdoor: product line formed parts, classified; stainless 1.4310 from the title block; 4 mm and no heat treatment from the drawing and its notes; 45,000 a year and delivery from Q2 from the email. The surface is missing, and a question asking for it, and for how long the part will run, is drafted.',
  similar:
    'Assessment for the running example. The written rules allow both machines for 4 mm and 45,000 a year. The three most similar past parts: A-2291, a tarp clip of 4 mm, ran on the large machine with 85 hours of tooling; A-3107, a hose clip of 3.5 mm, on the large machine with 100 hours; A-1450, a retaining clip of 4 mm, on the small machine with 8 hours. The proposal to the expert: the large machine with 90 hours of tooling, and the small machine as a second variant.',
  'break-even':
    'Total price over the number of pieces ordered, with invented numbers and the draft’s 90 hours of tooling on the large machine. The small machine costs 1,200 euros of tooling plus 0.48 euros a piece, the large machine 13,500 euros plus 0.19 euros a piece. The lines cross at about 42,000 pieces, a little under one year of demand; at 135,000 pieces, three years, the large machine costs about 39,000 euros against about 66,000, about 27,000 less.',
  review:
    'The review screen for LO-318: a banner says the surface is missing and offers to send the drafted question; the drawing sits next to the extracted fields, and selecting the diameter outlines the spot on the drawing it was read from. Below, the two variants: the small machine with 8 hours of tooling at 1,200 euros plus 0.48 euros a piece, and the large machine with tooling edited from 90 to 100 hours, now 15,000 euros plus 0.19 euros a piece. The reason picked for the change is that the part differs from the similar parts. The offer waits for the surface.',
  overrides:
    'Overrides of one kind: on requests R-1187, R-1203 and R-1262, the running example, stainless parts of 3 to 5 mm with a tight bend, the expert raised the tooling hours by 8 to 12 with the reason that the part differs from the similar parts. The system proposes a rule, stainless with a bend radius under the diameter gets 10 hours more tooling, which agrees with the expert on 8 of 9 other past requests. The expert approves, edits or rejects it.',
} as const;

export type FigureName = keyof typeof DESCRIPTIONS;

const FIGURES: Record<FigureName, (props: { id: string }) => ReactNode> = {
  today: Today,
  request: Request,
  similar: Similar,
  'break-even': BreakEven,
  review: Review,
  overrides: Overrides,
};

export default function QuoteFigure({ name, id }: { name: FigureName; id: string }) {
  const Figure = FIGURES[name];
  return <Figure id={id} />;
}
