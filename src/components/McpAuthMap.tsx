/**
 * The running example of mcp-server-authorization as one top-to-bottom map:
 * the bank's AI assistant (an LLM) picks a tool, and the MCP client inside the
 * AI app, code the bank didn't write, makes the call. It gets a token from
 * Northstar's auth server and sends it to Northstar's MCP server, which checks
 * it and calls the CRM with a token of its own.
 *
 * The counterpart to AuthMap.tsx, with the sides swapped: there the agent's
 * tools were our code and the APIs someone else's; here the caller is someone
 * else's app and the API is ours.
 *
 * Each section of the post shows the same map with its part highlighted and
 * the rest greyed out. Vertical, so phones and wide screens share one layout.
 * Static: rendered on the server, no JavaScript.
 */
import type { ReactNode } from 'react';
import { color, Agent, Store, type Point } from '../remotion/shared';
import { Dim, Tag, ArrowMarker } from './map-parts';

type NodeId = 'assistant' | 'client' | 'auth' | 'mcp' | 'crm';
/** Who a box belongs to, which sets its outline: the model, Northstar, or someone else. */
type Role = 'model' | 'ours' | 'theirs';

export interface Preset {
  /** Parts drawn at full strength; everything else is greyed out. Empty means everything. */
  focus: NodeId[];
  /** Pills on the top right of a box. */
  tags?: { on: NodeId; text: string }[];
  description: string;
}

export const PRESETS = {
  overview: {
    focus: [],
    description:
      'The running example as one map: the bank’s AI assistant, an LLM, picks a tool. The MCP client in the AI app, code the bank didn’t write, gets a token from Northstar’s auth server and calls Northstar’s MCP server with it. The MCP server checks the token and calls the CRM with a token of its own.',
  },
  roles: {
    focus: ['client', 'auth', 'mcp'],
    description: 'Highlighted: the three OAuth roles. The MCP client is the client, Northstar’s auth server issues the tokens, and the MCP server is the resource server that checks them.',
  },
  discovery: {
    focus: ['client', 'auth', 'mcp'],
    tags: [{ on: 'mcp', text: '401' }],
    description: 'Highlighted: discovery. The MCP server answers a call without a token with 401 and the address of its metadata, which names the auth server.',
  },
  'client-id': {
    focus: ['client', 'auth'],
    tags: [{ on: 'client', text: 'URL as ID' }],
    description: 'Highlighted: the MCP client and the auth server. The client’s ID is a URL, and the auth server fetches the client’s description from it.',
  },
  consent: {
    focus: ['client', 'auth'],
    tags: [{ on: 'auth', text: 'Consent' }],
    description: 'Highlighted: the authorization code flow between the MCP client and the auth server, where the advisor logs in and consents.',
  },
  'mix-up': {
    focus: ['client', 'auth'],
    tags: [{ on: 'client', text: 'Check iss' }],
    description: 'Highlighted: the MCP client, which checks which auth server answered before it sends the code anywhere.',
  },
  'token-check': {
    focus: ['client', 'mcp'],
    tags: [{ on: 'mcp', text: 'Check aud' }],
    description: 'Highlighted: the MCP server, which checks the token on every request, its audience above all.',
  },
  downstream: {
    focus: ['mcp', 'crm'],
    tags: [{ on: 'crm', text: 'Own token' }],
    description: 'Highlighted: the MCP server and the CRM behind it. The MCP server calls the CRM with a token of its own, never the one it received.',
  },
  clients: {
    focus: ['assistant', 'client'],
    description: 'Highlighted: the AI app, the assistant and its MCP client, whose requirements the server has to meet.',
  },
  enterprise: {
    focus: ['client', 'auth'],
    tags: [{ on: 'auth', text: 'IdP decides' }],
    description: 'Highlighted: the MCP client and the auth server, where the company’s identity provider decides instead of the advisor.',
  },
} satisfies Record<string, Preset>;

export type PresetName = keyof typeof PRESETS;

const STROKE: Record<Role, string> = {
  model: color('added'),
  ours: color('node-border'),
  theirs: color('other'),
};

const NODES: Record<NodeId, { name: string; role: Role; detail: string[] }> = {
  assistant: { name: 'Bank’s AI assistant', role: 'model', detail: ['Picks a tool and its arguments'] },
  client: { name: 'MCP client', role: 'theirs', detail: ['Part of the AI app, not ours', 'Finds the login, holds the token'] },
  auth: { name: 'Auth server', role: 'ours', detail: ['Northstar’s identity provider', 'Logs in, issues tokens'] },
  mcp: { name: 'MCP server', role: 'ours', detail: ['lookup_account, open_case', 'Checks every token'] },
  crm: { name: 'CRM', role: 'theirs', detail: ['Its own token, its own audience'] },
};

/** A browser window: the AI app's client code. */
const Window = ({ x, y }: Point) => (
  <g transform={`translate(${x} ${y})`} stroke={color('other')} strokeWidth={2.5} strokeLinejoin="round">
    <rect x={-20} y={-15} width={40} height={30} rx={4} fill={color('node-bg')} />
    <line x1={-20} x2={20} y1={-6} y2={-6} />
    <circle cx={-14} cy={-10.5} r={1.2} fill={color('other')} stroke="none" />
    <circle cx={-9} cy={-10.5} r={1.2} fill={color('other')} stroke="none" />
  </g>
);

/** A shield: the auth server. */
const Shield = ({ x, y }: Point) => (
  <g transform={`translate(${x} ${y})`} stroke={color('node-border')} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round">
    <path d="M0,-17 L15,-11 V1 C15,10 8,15 0,18 C-8,15 -15,10 -15,1 V-11 Z" fill={color('node-bg')} />
    <path d="M-6,0 L-1,5 L7,-5" fill="none" />
  </g>
);

/** A server with two slots: the MCP server. */
const Server = ({ x, y }: Point) => (
  <g transform={`translate(${x} ${y})`} stroke={color('node-border')} strokeWidth={2.5}>
    <rect x={-19} y={-16} width={38} height={14} rx={3} fill={color('node-bg')} />
    <rect x={-19} y={2} width={38} height={14} rx={3} fill={color('node-bg')} />
    <circle cx={12} cy={-9} r={1.8} fill={color('node-border')} stroke="none" />
    <circle cx={12} cy={9} r={1.8} fill={color('node-border')} stroke="none" />
  </g>
);

function NodeIcon({ id, at }: { id: NodeId; at: Point }): ReactNode {
  switch (id) {
    case 'assistant':
      return <Agent {...at} scale={0.78} typing={1} />;
    case 'client':
      return <Window {...at} />;
    case 'auth':
      return <Shield {...at} />;
    case 'mcp':
      return <Server {...at} />;
    case 'crm':
      return <Store {...at} scale={0.62} />;
  }
}

const W = 480;
const PAD = 16;
/** Boxes leave room on the left for the line from the client to the auth server and the MCP server. */
const BOX = { x: 60, w: 404 };
const TEXT_X = BOX.x + 84;
const TITLE = 21;
const DETAIL = 17;
const GAP = 46;
/** The line from the client down to the auth server and the MCP server, left of the boxes. */
const BUS_X = 28;

export default function McpAuthMap({ preset, id }: { preset: PresetName; id: string }) {
  const p: Preset = PRESETS[preset];
  const all = p.focus.length === 0;
  const on = (n: NodeId) => all || p.focus.includes(n);

  let y = PAD + 14;
  const order: NodeId[] = ['assistant', 'client', 'auth', 'mcp', 'crm'];
  // Auth server and MCP server hang off one line from the client, so they sit closer together.
  const gapAfter: Record<NodeId, number> = { assistant: GAP, client: GAP, auth: 22, mcp: GAP, crm: 0 };
  const boxes = order.map((n) => {
    const h = 54 + NODES[n].detail.length * (DETAIL + 8);
    const b = { id: n, y, h };
    y += h + gapAfter[n];
    return b;
  });
  const height = y + PAD + 36;
  const at = Object.fromEntries(boxes.map((b) => [b.id, b])) as Record<NodeId, (typeof boxes)[number]>;
  const mid = (n: NodeId) => at[n].y + at[n].h / 2;
  const marker = `${id}-arrow`;
  const cx = BOX.x + BOX.w / 2;
  const edge = { fill: 'none', stroke: color('node-border'), strokeWidth: 2.5 };

  const down = (from: NodeId, to: NodeId, label: string) => (
    <Dim on={on(from) && on(to)} faded={0.3}>
      <path d={`M${cx},${at[from].y + at[from].h} V${at[to].y - 4}`} {...edge} markerEnd={`url(#${marker})`} />
      <text x={cx + 12} y={(at[from].y + at[from].h + at[to].y) / 2} dy="0.35em" fontSize={DETAIL} fontWeight={600} fill={color('text')}>
        {label}
      </text>
    </Dim>
  );

  return (
    <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label={p.description} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      <defs>
        <ArrowMarker id={marker} />
      </defs>

      {down('assistant', 'client', 'Tool call')}
      {down('mcp', 'crm', 'Its own token')}

      {/* The trunk from the client down the left margin, lit if the auth server or the MCP server is. */}
      <Dim on={on('client') && (on('auth') || on('mcp'))} faded={0.3}>
        <path d={`M${BOX.x},${mid('client')} H${BUS_X} V${mid('mcp')}`} {...edge} />
      </Dim>
      {(['auth', 'mcp'] as NodeId[]).map((s) => (
        <Dim key={s} on={on('client') && on(s)} faded={0.3}>
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
        {(['model', 'ours', 'theirs'] as Role[]).map((r, i) => (
          <g key={r} transform={`translate(${i * 125} 0)`}>
            <rect x={0} y={-14} width={16} height={16} rx={4} fill={color('node-bg')} stroke={STROKE[r]} strokeWidth={2.5} />
            <text x={24} y={0} fill={color('muted')}>
              {{ model: 'LLM', ours: 'Northstar', theirs: 'Not ours' }[r]}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
