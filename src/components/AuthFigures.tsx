/**
 * The figures of api-keys-oauth-jwt other than its section map (AuthMap.tsx):
 * the two OAuth grants as sequence figures, client credentials for the CRM
 * and authorization code for the advisor's calendar, and the anatomy of the
 * CRM's access token, a JWT. Same palette, box style and outlines as the map:
 * blue for the model, grey for our code, orange for someone else's system,
 * teal for a person. Narrow enough to share one layout between phones and wide
 * screens. Static: rendered on the server, no JavaScript.
 */
import type { ReactNode } from 'react';
import { color } from '../remotion/shared';
import { ArrowMarker, Badge, Tag } from './map-parts';

type Role = 'code' | 'external' | 'human';

const STROKE: Record<Role, string> = {
  code: color('node-border'),
  external: color('other'),
  human: color('ok'),
};

const W = 480;
const LABEL = 15;
const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

interface Lane {
  name: string;
  role: Role;
  x: number;
}

/** A call from one lane to another, or, without `to`, a note on the `from` lane. */
interface Message {
  from: number;
  to?: number;
  label: string;
  /** Answers are dashed, as in a sequence diagram. */
  reply?: boolean;
}

/** One row of a sequence: a message, or a line of text across the figure that marks time passing. */
type Row = Message | { gap: string };

const HEAD = { y: 12, h: 44 };
const ROW = 58;

/**
 * A sequence diagram drawn in the map's style: a box per party along the top,
 * a dashed lifeline under each, and a numbered row per message.
 */
function Sequence({ id, lanes, rows, tag, label }: { id: string; lanes: Lane[]; rows: Row[]; tag?: string; label: string }) {
  const m = `${id}-arrow`;
  const top = HEAD.y + HEAD.h;
  const bottom = top + 24 + rows.length * ROW;
  const height = bottom + (tag ? 56 : 16);
  let n = 0;
  return (
    <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label={label} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      <defs>
        <ArrowMarker id={m} />
      </defs>
      {lanes.map((l) => (
        <g key={l.name}>
          <line x1={l.x} x2={l.x} y1={top} y2={bottom} stroke={color('edge')} strokeWidth={2} strokeDasharray="5 5" />
          <rect x={l.x - 54} y={HEAD.y} width={108} height={HEAD.h} rx={12} fill={color('node-bg')} stroke={STROKE[l.role]} strokeWidth={2.5} />
          <text x={l.x} y={HEAD.y + HEAD.h / 2} dy="0.35em" textAnchor="middle" fontSize={15} fontWeight={700} fill={color('text')}>
            {l.name}
          </text>
        </g>
      ))}
      {rows.map((r, i) => {
        const y = top + 24 + i * ROW + ROW / 2;
        if ('gap' in r) {
          return (
            <text key={i} x={W / 2} y={y} dy="0.35em" textAnchor="middle" fontSize={LABEL} fontWeight={600} fontStyle="italic" fill={color('muted')}>
              {r.gap}
            </text>
          );
        }
        const from = lanes[r.from].x;
        if (r.to === undefined) {
          const w = r.label.length * LABEL * 0.56 + 28;
          const x = Math.min(Math.max(from - w / 2, 4), W - 4 - w);
          return (
            <g key={i}>
              <rect x={x} y={y - 17} width={w} height={34} rx={9} fill={color('node-bg')} stroke={STROKE[lanes[r.from].role]} strokeWidth={2} />
              <text x={x + w / 2} y={y} dy="0.35em" textAnchor="middle" fontSize={LABEL} fontWeight={600} fill={color('text')}>
                {r.label}
              </text>
            </g>
          );
        }
        n += 1;
        const to = lanes[r.to].x;
        const dir = Math.sign(to - from);
        const mid = (from + to) / 2;
        const w = r.label.length * LABEL * 0.56 + 12;
        return (
          <g key={i}>
            <path
              d={`M${from},${y + 8} H${to - dir * 6}`}
              fill="none"
              stroke={color('node-border')}
              strokeWidth={2.5}
              strokeDasharray={r.reply ? '7 6' : undefined}
              markerEnd={`url(#${m})`}
            />
            {/* The label sits above its arrow, on the figure's background so lifelines don't run through it. */}
            <rect x={mid - w / 2} y={y - 21} width={w} height={22} fill={color('surface')} />
            <text x={mid} y={y - 10} dy="0.35em" textAnchor="middle" fontSize={LABEL} fontWeight={600} fill={color('text')}>
              {r.label}
            </text>
            <Badge x={from} y={y + 8} text={String(n)} />
          </g>
        );
      })}
      {tag && <Tag x={W / 2} y={bottom + 30} text={tag} size={15} />}
    </svg>
  );
}

function ClientCredentials({ id }: { id: string }) {
  return (
    <Sequence
      id={id}
      label={DESCRIPTIONS['client-credentials']}
      lanes={[
        { name: 'Tools', role: 'code', x: 72 },
        { name: 'Auth server', role: 'external', x: 240 },
        { name: 'CRM API', role: 'external', x: 408 },
      ]}
      rows={[
        { from: 0, to: 1, label: 'Client ID + secret' },
        { from: 1, to: 0, label: 'Access token, 1 h', reply: true },
        { from: 0, to: 2, label: 'Bearer access token' },
        { from: 2, label: 'Checks the JWT' },
        { from: 2, to: 0, label: '200: Alex’s account', reply: true },
      ]}
      tag="Reuse the token for the hour"
    />
  );
}

function AuthorizationCode({ id }: { id: string }) {
  return (
    <Sequence
      id={id}
      label={DESCRIPTIONS['authorization-code']}
      lanes={[
        { name: 'Advisor', role: 'human', x: 60 },
        { name: 'Auth server', role: 'external', x: 180 },
        { name: 'Our backend', role: 'code', x: 300 },
        { name: 'Calendar', role: 'external', x: 420 },
      ]}
      rows={[
        { from: 2, to: 0, label: 'Redirect: scope, state, PKCE' },
        { from: 0, to: 1, label: 'Log in, approve' },
        { from: 1, to: 2, label: 'Code, via browser' },
        { from: 2, to: 1, label: 'Code + verifier' },
        { from: 1, to: 2, label: 'Access + refresh', reply: true },
        { from: 2, to: 3, label: 'Bearer access token' },
        { gap: 'An hour later, without the advisor' },
        { from: 2, to: 1, label: 'Refresh token' },
        { from: 1, to: 2, label: 'New pair', reply: true },
      ]}
      tag="Store the new refresh token"
    />
  );
}

/** One part of the token: its encoded start in the bar, and what it holds in a card underneath. */
interface Part {
  name: string;
  tone: 'other' | 'added' | 'ok';
  encoded: string;
  lines: [string, string][];
  note: string;
}

const PARTS: Part[] = [
  {
    name: 'Header',
    tone: 'other',
    encoded: 'eyJhbGci…',
    lines: [
      ['alg', 'RS256'],
      ['kid', 'crm-2026-10'],
    ],
    note: 'Which key signed it',
  },
  {
    name: 'Payload',
    tone: 'added',
    encoded: 'eyJpc3Mi…',
    lines: [
      ['iss', 'auth.crm.example.com'],
      ['sub', 'support-agent'],
      ['aud', 'api.crm.example.com'],
      ['scope', 'contacts.read cases.write'],
      ['exp', 'in one hour'],
    ],
    note: 'Readable by anyone',
  },
  {
    name: 'Signature',
    tone: 'ok',
    encoded: 'Kq3xT9…',
    lines: [['over', 'header.payload']],
    note: 'Auth server’s private key',
  },
];

function JwtAnatomy({ id }: { id: string }) {
  const bar = { y: 14, h: 44 };
  const segW = [148, 148, 124];
  const dot = 14;
  const startX = (W - (segW[0] + segW[1] + segW[2] + 2 * dot)) / 2;
  const xs = [startX, startX + segW[0] + dot, startX + segW[0] + segW[1] + 2 * dot];
  const lineH = 24;
  let y = bar.y + bar.h + 26;
  const cards = PARTS.map((p) => {
    const h = 44 + p.lines.length * lineH;
    const c = { ...p, y, h };
    y += h + 16;
    return c;
  });
  const height = y + 40;
  const fill = (t: Part['tone']) => (t === 'added' ? color('added-bg') : t === 'other' ? color('other-bg') : color('node-bg'));
  return (
    <svg viewBox={`0 0 ${W} ${height}`} role="img" aria-label={DESCRIPTIONS.jwt} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      <defs>
        <ArrowMarker id={`${id}-arrow`} />
      </defs>
      {PARTS.map((p, i) => (
        <g key={p.name}>
          <rect x={xs[i]} y={bar.y} width={segW[i]} height={bar.h} rx={10} fill={fill(p.tone)} stroke={color(p.tone)} strokeWidth={2.5} />
          <text x={xs[i] + segW[i] / 2} y={bar.y + bar.h / 2} dy="0.35em" textAnchor="middle" fontSize={15} fontWeight={600} fontFamily={MONO} fill={color('text')}>
            {p.encoded}
          </text>
          {i < 2 && (
            <text x={xs[i] + segW[i] + dot / 2} y={bar.y + bar.h - 10} textAnchor="middle" fontSize={26} fontWeight={700} fill={color('text')}>
              .
            </text>
          )}
        </g>
      ))}
      {cards.map((c) => (
        <g key={c.name}>
          <rect x={16} y={c.y} width={W - 32} height={c.h} rx={14} fill={color('node-bg')} stroke={color(c.tone)} strokeWidth={2.5} />
          <text x={36} y={c.y + 24} dy="0.35em" fontSize={18} fontWeight={700} fill={color('text')}>
            {c.name}
          </text>
          <text x={W - 36} y={c.y + 24} dy="0.35em" textAnchor="end" fontSize={14} fontWeight={600} fill={color('muted')}>
            {c.note}
          </text>
          {c.lines.map(([k, v], j) => (
            <text key={k} x={36} y={c.y + 44 + j * lineH + lineH / 2} dy="0.35em" fontSize={15} fontFamily={MONO} fill={color('text')}>
              <tspan fill={color('muted')}>{k}</tspan>
              <tspan x={110}>{v}</tspan>
            </text>
          ))}
        </g>
      ))}
      <Tag x={W / 2} y={height - 22} text="Signed, not encrypted" size={15} />
    </svg>
  );
}

export const DESCRIPTIONS = {
  'client-credentials':
    'Client credentials: the tools send the client ID and secret to the CRM’s auth server and get an access token valid for an hour. They send it as a bearer token to the CRM API, which checks the JWT itself and returns Alex’s account.',
  'authorization-code':
    'Authorization code: our backend redirects the advisor to the auth server with the scope, a state value and a PKCE challenge. The advisor logs in and approves; the auth server sends a code back through the browser, and the backend trades code and verifier for an access and a refresh token, then calls the calendar. An hour later it trades the refresh token for a new pair, without the advisor.',
  jwt: 'The CRM’s access token is a JWT in three dot-separated parts. The header names the algorithm and the key; the payload holds the claims iss, sub, aud, scope and exp, readable by anyone; the signature over both is made with the auth server’s private key.',
} as const;

export type FigureName = keyof typeof DESCRIPTIONS;

const FIGURES: Record<FigureName, (props: { id: string }) => ReactNode> = {
  'client-credentials': ClientCredentials,
  'authorization-code': AuthorizationCode,
  jwt: JwtAnatomy,
};

export default function AuthFigure({ name, id }: { name: FigureName; id: string }) {
  const Figure = FIGURES[name];
  return <Figure id={id} />;
}
