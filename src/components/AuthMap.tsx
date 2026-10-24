/**
 * The running example of api-keys-oauth-jwt as one top-to-bottom map: the
 * support agent (an LLM) picks a tool and its arguments, the tools (code)
 * hold the secrets and attach a credential to each call, and the calls go to
 * three systems, each authenticated its own way: the ticketing system by API
 * key, the CRM by an OAuth access token that is a JWT, and an advisor's
 * calendar by a token the advisor consented to.
 *
 * Each section of the post shows the same map with its part highlighted and
 * the rest greyed out, like DesignMap.tsx does for uncoded-hospital-revenue.
 * Vertical, so phones and wide screens share one layout. Static: rendered on
 * the server, no JavaScript.
 */
import type { ReactNode } from 'react';
import { color, Agent, Store, type Point } from '../remotion/shared';
import { Dim, Tag, ArrowMarker } from './map-parts';

type NodeId = 'agent' | 'tools' | 'ticketing' | 'crm' | 'calendar';
type SystemId = Extract<NodeId, 'ticketing' | 'crm' | 'calendar'>;
/** Who a box belongs to, which sets its outline: the model, our code, or someone else's system. */
type Role = 'model' | 'code' | 'external';

export interface Preset {
  /** Parts drawn at full strength; everything else is greyed out. Empty means everything. */
  focus: NodeId[];
  /** Pills on the top right of a box, e.g. "Static". */
  tags?: { on: NodeId; text: string }[];
  description: string;
}

export const PRESETS = {
  overview: {
    focus: [],
    description:
      'The running example as one map: the support agent, an LLM, picks a tool and its arguments. The tools, code, hold the secrets and attach a credential to each call: an API key for the ticketing system, an OAuth access token for the CRM, and a token the advisor consented to for the calendar.',
  },
  'api-key': {
    focus: ['tools', 'ticketing'],
    tags: [{ on: 'ticketing', text: 'Static' }],
    description: 'Highlighted: the ticketing system, which takes the same API key on every call until someone rotates it.',
  },
  'client-credentials': {
    focus: ['tools', 'crm'],
    tags: [{ on: 'crm', text: 'One hour' }],
    description: 'Highlighted: the CRM. The tools trade the client secret for an access token at its auth server, and send the token with every call for the hour it lives.',
  },
  'auth-code': {
    focus: ['tools', 'calendar'],
    tags: [{ on: 'calendar', text: 'Consent' }],
    description: 'Highlighted: the calendar. The advisor consents once, and the tools keep a refresh token per advisor.',
  },
  jwt: {
    focus: ['crm'],
    tags: [{ on: 'crm', text: 'Self-checking' }],
    description: 'Highlighted: the CRM, whose API checks the access token, a JWT, on its own.',
  },
  errors: {
    focus: ['tools', 'ticketing', 'crm', 'calendar'],
    tags: [{ on: 'tools', text: 'Retry once' }],
    description: 'Highlighted: the tools and the three systems, where a call fails with 401 or 403.',
  },
} satisfies Record<string, Preset>;

export type PresetName = keyof typeof PRESETS;

const STROKE: Record<Role, string> = {
  model: color('added'),
  code: color('node-border'),
  external: color('other'),
};

const NODES: Record<NodeId, { name: string; role: Role; detail: string[] }> = {
  agent: { name: 'Support agent', role: 'model', detail: ['Picks a tool and its arguments'] },
  tools: { name: 'Tools', role: 'code', detail: ['Hold the secrets', 'Attach one to each call'] },
  ticketing: { name: 'Ticketing system', role: 'external', detail: ['API key on every call', 'Valid until rotated'] },
  crm: { name: 'CRM', role: 'external', detail: ['Auth server: secret → token', 'API: checks the JWT itself'] },
  calendar: { name: 'Advisor’s calendar', role: 'external', detail: ['Advisor consents once', 'Refresh token per advisor'] },
};

const SYSTEMS: SystemId[] = ['ticketing', 'crm', 'calendar'];

/** A key: the ticketing system's API key. */
const Key = ({ x, y }: Point) => (
  <g transform={`translate(${x} ${y})`} stroke={color('other')} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round">
    <circle cx={-12} cy={0} r={9} fill={color('node-bg')} />
    <circle cx={-12} cy={0} r={3} />
    <path d="M-3,0 H22 M14,0 V7 M20,0 V6" />
  </g>
);

/** A token in three parts, header, payload and signature: the CRM's JWT. */
const Token = ({ x, y }: Point) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x={-22} y={-11} width={44} height={22} rx={5} fill={color('node-bg')} stroke={color('other')} strokeWidth={2.5} />
    <rect x={-17} y={-4} width={8} height={8} rx={2} fill={color('other')} />
    <rect x={-5} y={-4} width={10} height={8} rx={2} fill={color('added')} />
    <rect x={9} y={-4} width={8} height={8} rx={2} fill={color('ok')} />
  </g>
);

/** A calendar page: the advisor's calendar. */
const Calendar = ({ x, y }: Point) => (
  <g transform={`translate(${x} ${y})`} stroke={color('other')} strokeWidth={2.5} strokeLinecap="round">
    <rect x={-17} y={-14} width={34} height={30} rx={4} fill={color('node-bg')} />
    <line x1={-17} x2={17} y1={-5} y2={-5} />
    <line x1={-8} x2={-8} y1={-19} y2={-10} />
    <line x1={8} x2={8} y1={-19} y2={-10} />
    <rect x={2} y={2} width={8} height={7} rx={1.5} fill={color('other')} stroke="none" />
  </g>
);

function NodeIcon({ id, at }: { id: NodeId; at: Point }): ReactNode {
  switch (id) {
    case 'agent':
      return <Agent {...at} scale={0.78} typing={1} />;
    case 'tools':
      return <Store {...at} scale={0.62} />;
    case 'ticketing':
      return <Key {...at} />;
    case 'crm':
      return <Token {...at} />;
    case 'calendar':
      return <Calendar {...at} />;
  }
}

const W = 480;
const PAD = 16;
/** Boxes leave room on the left for the line from the tools to the three systems. */
const BOX = { x: 60, w: 404 };
const TEXT_X = BOX.x + 84;
const TITLE = 21;
const DETAIL = 17;
const GAP = 34;
/** The line from the tools down to the systems, left of the boxes. */
const BUS_X = 28;

export default function AuthMap({ preset, id }: { preset: PresetName; id: string }) {
  const p: Preset = PRESETS[preset];
  const all = p.focus.length === 0;
  const on = (n: NodeId) => all || p.focus.includes(n);

  let y = PAD + 14;
  const order: NodeId[] = ['agent', 'tools', ...SYSTEMS];
  const boxes = order.map((n, i) => {
    const h = 54 + NODES[n].detail.length * (DETAIL + 8);
    const b = { id: n, y, h };
    // The systems sit closer together: they hang off one line, not one after another.
    y += h + (i < 2 ? GAP + 12 : 22);
    return b;
  });
  const height = y - 22 + PAD + 36;
  const at = Object.fromEntries(boxes.map((b) => [b.id, b])) as Record<NodeId, (typeof boxes)[number]>;
  const mid = (n: NodeId) => at[n].y + at[n].h / 2;
  const marker = `${id}-arrow`;
  const cx = BOX.x + BOX.w / 2;
  const edge = { fill: 'none', stroke: color('node-border'), strokeWidth: 2.5 };

  return (
    <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label={p.description} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      <defs>
        <ArrowMarker id={marker} />
      </defs>

      <Dim on={on('agent') && on('tools')} faded={0.3}>
        <path d={`M${cx},${at.agent.y + at.agent.h} V${at.tools.y - 4}`} {...edge} markerEnd={`url(#${marker})`} />
        <text x={cx + 12} y={(at.agent.y + at.agent.h + at.tools.y) / 2} dy="0.35em" fontSize={DETAIL} fontWeight={600} fill={color('text')}>
          Tool call, no secret
        </text>
      </Dim>

      {/* The trunk from the tools down the left margin, lit if any system is. */}
      <Dim on={on('tools') && SYSTEMS.some(on)} faded={0.3}>
        <path d={`M${BOX.x},${mid('tools')} H${BUS_X} V${mid('calendar')}`} {...edge} />
      </Dim>
      {SYSTEMS.map((s) => (
        <Dim key={s} on={on('tools') && on(s)} faded={0.3}>
          <path d={`M${BUS_X},${mid(s)} H${BOX.x - 6}`} {...edge} markerEnd={`url(#${marker})`} />
        </Dim>
      ))}

      {boxes.map((b) => {
        const node = NODES[b.id];
        return (
          <Dim key={b.id} on={on(b.id)} faded={0.3}>
            <rect x={BOX.x} y={b.y} width={BOX.w} height={b.h} rx={14} fill={color('node-bg')} stroke={STROKE[node.role]} strokeWidth={2.5} />
            <NodeIcon id={b.id} at={{ x: BOX.x + 42, y: b.y + 34 }} />
            <text x={TEXT_X} y={b.y + 34} dy="0.35em" fontSize={TITLE} fontWeight={600} fill={color('text')}>
              {node.name}
            </text>
            {node.detail.map((line, i) => (
              <text key={line} x={TEXT_X} y={b.y + 34 + (i + 1) * (DETAIL + 8)} dy="0.35em" fontSize={DETAIL} fontWeight={500} fill={color('muted')}>
                {line}
              </text>
            ))}
          </Dim>
        );
      })}

      {(p.tags ?? []).map((t) => {
        const b = at[t.on];
        const width = t.text.length * 17 * 0.59 + 44;
        return <Tag key={t.on} x={BOX.x + BOX.w - width / 2 + 16} y={b.y} text={t.text} size={17} />;
      })}

      <g transform={`translate(${cx - 190} ${height - 18})`} fontSize={18} fontWeight={600}>
        {(['model', 'code', 'external'] as Role[]).map((r, i) => (
          <g key={r} transform={`translate(${i * 125} 0)`}>
            <rect x={0} y={-14} width={16} height={16} rx={4} fill={color('node-bg')} stroke={STROKE[r]} strokeWidth={2.5} />
            <text x={24} y={0} fill={color('muted')}>
              {{ model: 'LLM', code: 'Our code', external: 'Their API' }[r]}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
