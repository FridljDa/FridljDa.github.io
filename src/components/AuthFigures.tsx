/**
 * The figures of api-keys-oauth-jwt other than its section map (AuthMap.tsx):
 * sequence figures for the ticketing system's API key, the two OAuth grants
 * (client credentials for the CRM, authorization code for the advisor's
 * calendar), the two attacks state and PKCE stop, the advisor signing in through the bank's identity provider, and a failing call, 401
 * against 403, and the anatomy of the CRM's access token, a JWT. Same palette,
 * box style and outlines as the map: grey for our code,
 * orange for someone else's system, teal for a person, red for an attacker. Narrow enough to share one layout between phones and wide
 * screens. Static: rendered on the server, no JavaScript.
 *
 * Each row of a sequence figure carries the step it belongs to as data-step,
 * so AuthSteps.astro can highlight the step the reader is at and grey out the
 * rest. A note and the bottom tag belong to the step they comment on, a gap
 * row to the step after it.
 */
import type { ReactNode } from 'react';
import { color } from '../remotion/shared';
import { ArrowMarker, Tag } from './map-parts';
import { Sequence, W, MONO } from './sequence-figure';

function ApiKey({ id }: { id: string }) {
  return (
    <Sequence
      id={id}
      label={DESCRIPTIONS['api-key']}
      lanes={[
        { name: 'Our app', role: 'code', x: 120 },
        { name: 'Ticketing', role: 'external', x: 360 },
      ]}
      rows={[
        { from: 1, to: 0, label: 'API key, once' },
        { gap: 'On every call after that' },
        { from: 0, to: 1, label: 'Key in the header' },
        { from: 1, label: 'Looks up the key', numbered: true },
        { from: 1, to: 0, label: '201: ticket opened', reply: true },
      ]}
      tag="Same key until rotated"
      tagStep={4}
    />
  );
}

function ClientCredentials({ id }: { id: string }) {
  return (
    <Sequence
      id={id}
      label={DESCRIPTIONS['client-credentials']}
      lanes={[
        { name: 'Our app', role: 'code', x: 72 },
        { name: 'Auth server', role: 'external', x: 240 },
        { name: 'CRM API', role: 'external', x: 408 },
      ]}
      rows={[
        { from: 0, to: 1, label: 'Client ID + secret' },
        { from: 1, to: 0, label: 'Access token, 1 h', reply: true },
        { from: 0, to: 2, label: 'Bearer access token' },
        { from: 2, to: 1, label: 'Public keys, once' },
        { from: 1, to: 2, label: 'JWKS', reply: true },
        { from: 2, label: 'Checks the JWT', numbered: true },
        { from: 2, to: 0, label: '200: Alex’s account', reply: true },
      ]}
      tag="Reuse the token for the hour"
      tagStep={7}
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
        { name: 'Our app', role: 'code', x: 300 },
        { name: 'Calendar', role: 'external', x: 420 },
      ]}
      rows={[
        { from: 0, to: 2, label: 'Connect calendar' },
        { from: 2, label: 'State, verifier, challenge', numbered: true },
        { from: 2, to: 0, label: 'Redirect: state, challenge', reply: true },
        { from: 0, to: 1, label: 'Log in, consent' },
        { from: 1, to: 2, label: 'Code, via browser' },
        { from: 2, label: 'Checks state', numbered: true },
        { from: 2, to: 1, label: 'Code + verifier' },
        { from: 1, label: 'Checks verifier', numbered: true },
        { from: 1, to: 2, label: 'Access + refresh', reply: true },
        { from: 2, to: 3, label: 'Bearer access token' },
        { gap: 'An hour later, without the advisor' },
        { from: 2, to: 1, label: 'Refresh token' },
        { from: 1, to: 2, label: 'New pair', reply: true },
      ]}
      tag="Store the new refresh token"
      tagStep={12}
    />
  );
}

function SwappedCode({ id }: { id: string }) {
  return (
    <Sequence
      id={id}
      label={DESCRIPTIONS['swapped-code']}
      lanes={[
        { name: 'Attacker', role: 'attacker', x: 60 },
        { name: 'Advisor', role: 'human', x: 180 },
        { name: 'Auth server', role: 'external', x: 300 },
        { name: 'Our app', role: 'code', x: 420 },
      ]}
      rows={[
        { from: 0, to: 2, label: 'Consents, own calendar' },
        { from: 2, to: 0, label: 'Code, kept', reply: true },
        { from: 0, to: 1, label: 'Link with that code' },
        { from: 1, to: 3, label: 'Callback, attacker’s code' },
        { from: 3, label: 'Checks state: no match', numbered: true },
        { from: 3, to: 1, label: 'Login rejected', reply: true },
      ]}
      tag="The advisor’s session stays clean"
      tagStep={6}
    />
  );
}

function StolenCode({ id }: { id: string }) {
  return (
    <Sequence
      id={id}
      label={DESCRIPTIONS['stolen-code']}
      lanes={[
        { name: 'Advisor', role: 'human', x: 60 },
        { name: 'Attacker', role: 'attacker', x: 180 },
        { name: 'Our app', role: 'code', x: 300 },
        { name: 'Auth server', role: 'external', x: 420 },
      ]}
      rows={[
        { from: 0, to: 1, label: 'Code leaks' },
        { from: 1, to: 2, label: 'Connect calendar' },
        { from: 2, to: 1, label: 'Own state, challenge', reply: true },
        { from: 1, to: 2, label: 'Stolen code, own state' },
        { from: 2, label: 'Checks state: match', numbered: true },
        { from: 2, to: 3, label: 'Code + verifier' },
        { from: 3, label: 'Checks verifier: no match', numbered: true },
        { from: 3, to: 2, label: '400: invalid_grant', reply: true },
      ]}
      tag="No tokens for the attacker"
      tagStep={8}
    />
  );
}

function SignIn({ id }: { id: string }) {
  return (
    <Sequence
      id={id}
      label={DESCRIPTIONS['sign-in']}
      lanes={[
        { name: 'Advisor', role: 'human', x: 60 },
        { name: 'Our app', role: 'code', x: 180 },
        { name: 'Keycloak', role: 'external', x: 300 },
        { name: 'Auth server', role: 'external', x: 420 },
      ]}
      rows={[
        { from: 0, to: 1, label: 'Opens the app' },
        { from: 1, to: 0, label: 'Redirect to IdP', reply: true },
        { from: 0, to: 2, label: 'Password, 2nd factor' },
        { from: 2, label: 'Starts IdP session', numbered: true },
        { from: 2, to: 1, label: 'Code, via browser' },
        { from: 1, to: 2, label: 'Code + verifier' },
        { from: 2, to: 1, label: 'ID + access token', reply: true },
        { from: 1, label: 'Checks ID token', numbered: true },
        { gap: 'Later: Connect calendar' },
        { from: 0, to: 3, label: 'Sent there to log in' },
        { from: 3, to: 2, label: 'Login, via browser' },
        { from: 2, label: 'Session found', numbered: true },
        { from: 2, to: 3, label: 'Who it is', reply: true },
        { from: 3, to: 0, label: 'Consent screen only', reply: true },
      ]}
      tag="One login, every app"
      tagStep={13}
    />
  );
}

function ExpiredToken({ id }: { id: string }) {
  return (
    <Sequence
      id={id}
      label={DESCRIPTIONS['expired-token']}
      lanes={[
        { name: 'Our app', role: 'code', x: 72 },
        { name: 'Auth server', role: 'external', x: 240 },
        { name: 'CRM API', role: 'external', x: 408 },
      ]}
      rows={[
        { from: 0, to: 2, label: 'Bearer access token' },
        { from: 2, label: 'Checks exp: passed', numbered: true },
        { from: 2, to: 0, label: '401: invalid_token', reply: true },
        { from: 0, to: 1, label: 'Client ID + secret' },
        { from: 1, to: 0, label: 'New access token', reply: true },
        { from: 0, to: 2, label: 'Retry once' },
        { from: 2, to: 0, label: '200: Alex’s account', reply: true },
      ]}
      tag="One retry fixes it"
      tagStep={7}
    />
  );
}

function MissingScope({ id }: { id: string }) {
  return (
    <Sequence
      id={id}
      label={DESCRIPTIONS['missing-scope']}
      lanes={[
        { name: 'Our app', role: 'code', x: 72 },
        { name: 'Auth server', role: 'external', x: 240 },
        { name: 'CRM API', role: 'external', x: 408 },
      ]}
      rows={[
        { from: 0, to: 2, label: 'Unlock the account' },
        { from: 2, label: 'Checks scope: contacts.read', numbered: true },
        { from: 2, to: 0, label: '403: insufficient_scope', reply: true },
        { from: 0, to: 1, label: 'Client ID + secret' },
        { from: 1, to: 0, label: 'Same scopes again', reply: true },
        { from: 0, to: 2, label: 'Unlock the account' },
        { from: 2, to: 0, label: '403 again', reply: true },
      ]}
      tag="No retry fixes it"
      tagStep={7}
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
      ['sub', 'northstar-support'],
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
    lines: [
      ['input', 'eyJhbGci….eyJpc3Mi…'],
      ['signer', 'auth server, private key crm-2026-10'],
      ['check', 'CRM: same input + public key crm-2026-10'],
      ['edit', 'change one claim → check fails'],
    ],
    note: 'Proves who issued it',
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
  'api-key':
    'API key: the ticketing system issues our app an API key once. On every call after that, our app sends the key in a header; the ticketing system looks it up and opens the ticket. The same key works until someone rotates it.',
  'client-credentials':
    'Client credentials: our app sends the client ID and secret to the CRM’s auth server and get an access token valid for an hour. It sends it as a bearer token to the CRM API, which fetches the auth server’s public keys once, checks the JWT with them and returns Alex’s account.',
  'authorization-code':
    'Authorization code: the advisor clicks Connect calendar in our app. Our app makes a new state, a PKCE verifier and its hash, the challenge, for this login, and redirects the advisor to the auth server with the state and the challenge. The advisor logs in and consents; the auth server sends a code back through the browser, and our app checks the state. It trades code and verifier for an access and a refresh token; the auth server checks the verifier first. Our app then calls the calendar. An hour later it trades the refresh token for a new pair, without the advisor.',
  'swapped-code':
    'A swapped code: the attacker consents to access to their own calendar and keeps the code instead of redeeming it. They get the advisor to open a link to our callback with that code. Our app checks the state against the advisor’s session, finds no match and rejects the login, so the advisor’s session never gets the attacker’s calendar.',
  'stolen-code':
    'A stolen code: the advisor’s code leaks to the attacker. The attacker starts their own Connect calendar flow in our app, gets their own state and challenge, and sends our callback the stolen code with their own state. The state matches, so our app trades the code with the attacker’s verifier. The auth server checks the verifier against the advisor’s challenge, finds no match and answers 400 invalid_grant: no tokens.',
  'expired-token':
    'An expired token: our app calls the CRM, which checks the token’s exp, finds it passed and answers 401 invalid_token. Our app fetches a new access token from the auth server with the client ID and secret, retry once and get Alex’s account.',
  'missing-scope':
    'A missing scope: our app tries to unlock Alex’s account. The CRM checks the token’s scope, finds only contacts.read and answers 403 insufficient_scope. A new token from the auth server has the same scopes, and the retry gets another 403.',
  'sign-in':
    'Logging in: the advisor opens our app, which redirects them to the bank’s identity provider, Keycloak. They log in there with password and second factor, and Keycloak starts a session. It sends a code back through the browser; our app trades it with its verifier for an ID token and an access token, and checks the ID token. Later, when the advisor connects their calendar, the calendar’s auth server sends them to Keycloak to log in. Keycloak finds its session, asks for no password and tells the calendar’s auth server who the advisor is; only the consent screen is left.',
  jwt: 'The CRM’s access token is a JWT in three dot-separated parts. The header names the algorithm and the key; the payload holds the claims iss, sub, aud, scope and exp, readable by anyone; the signature is computed over the first two encoded parts with the auth server’s private key crm-2026-10. The CRM recomputes the check with the matching public key, so changing a single claim makes it fail.',
} as const;

export type FigureName = keyof typeof DESCRIPTIONS;

const FIGURES: Record<FigureName, (props: { id: string }) => ReactNode> = {
  'api-key': ApiKey,
  'client-credentials': ClientCredentials,
  'authorization-code': AuthorizationCode,
  'swapped-code': SwappedCode,
  'stolen-code': StolenCode,
  'expired-token': ExpiredToken,
  'missing-scope': MissingScope,
  'sign-in': SignIn,
  jwt: JwtAnatomy,
};

export default function AuthFigure({ name, id }: { name: FigureName; id: string }) {
  const Figure = FIGURES[name];
  return <Figure id={id} />;
}
