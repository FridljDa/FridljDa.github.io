/**
 * The figures of mcp-server-authorization other than its section map
 * (McpAuthMap.tsx): sequence figures for discovery from a 401, a client ID
 * that is a URL, the authorization code flow to an MCP server, the mix-up
 * attack the iss check stops, step-up after a 403, the two tokens on either
 * side of the MCP server, and enterprise-managed authorization.
 *
 * Drawn with the sequence figure of api-keys-oauth-jwt (sequence-figure.tsx),
 * with the sides swapped: grey is Northstar's, orange is the AI app or another
 * company's system, teal the advisor, red an attacker. Static: rendered on the
 * server, no JavaScript.
 */
import type { ReactNode } from 'react';
import { Sequence } from './sequence-figure';

function Discovery({ id }: { id: string }) {
  return (
    <Sequence
      id={id}
      label={DESCRIPTIONS.discovery}
      lanes={[
        { name: 'MCP client', role: 'external', x: 72 },
        { name: 'MCP server', role: 'code', x: 240 },
        { name: 'Auth server', role: 'code', x: 408 },
      ]}
      rows={[
        { from: 0, to: 1, label: 'Call, no token' },
        { from: 1, to: 0, label: '401: metadata URL', reply: true },
        { from: 0, to: 1, label: 'GET its metadata' },
        { from: 1, to: 0, label: 'Auth server’s issuer', reply: true },
        { from: 0, to: 2, label: 'GET auth server metadata' },
        { from: 2, to: 0, label: 'Endpoints, issuer', reply: true },
        { from: 0, label: 'Issuer matches the URL?', numbered: true },
      ]}
      tag="Now it knows where to log in"
      tagStep={7}
    />
  );
}

function ClientId({ id }: { id: string }) {
  return (
    <Sequence
      id={id}
      label={DESCRIPTIONS['client-id']}
      lanes={[
        { name: 'MCP client', role: 'external', x: 72 },
        { name: 'Auth server', role: 'code', x: 240 },
        { name: 'Client JSON', role: 'external', x: 408 },
      ]}
      rows={[
        { from: 0, to: 1, label: 'client_id: a URL' },
        { from: 1, to: 2, label: 'GET that URL' },
        { from: 2, to: 1, label: 'Client metadata', reply: true },
        { from: 1, label: 'client_id equals the URL?', numbered: true },
        { from: 1, label: 'redirect_uri listed?', numbered: true },
        { from: 1, label: 'Caches it', numbered: true },
      ]}
      tag="No registration step"
      tagStep={6}
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
        { name: 'MCP client', role: 'external', x: 180 },
        { name: 'Auth server', role: 'code', x: 300 },
        { name: 'MCP server', role: 'code', x: 420 },
      ]}
      rows={[
        { from: 1, label: 'State, verifier, issuer', numbered: true },
        { from: 1, to: 0, label: 'Login URL', reply: true },
        { from: 0, to: 2, label: 'Log in, approve' },
        { from: 2, to: 1, label: 'Code, state, iss' },
        { from: 1, label: 'Checks state and iss', numbered: true },
        { from: 1, to: 2, label: 'Code + verifier' },
        { from: 2, label: 'Checks verifier', numbered: true },
        { from: 2, to: 1, label: 'Token for MCP', reply: true },
        { from: 1, to: 3, label: 'Bearer access token' },
        { from: 3, label: 'Checks aud, scope', numbered: true },
        { from: 3, to: 1, label: '200: Alex’s account', reply: true },
      ]}
      tag="One token, one server"
      tagStep={11}
    />
  );
}

function MixUp({ id }: { id: string }) {
  return (
    <Sequence
      id={id}
      label={DESCRIPTIONS['mix-up']}
      lanes={[
        { name: 'Advisor', role: 'human', x: 60 },
        { name: 'MCP client', role: 'external', x: 180 },
        { name: 'Evil AS', role: 'attacker', x: 300 },
        { name: 'Honest AS', role: 'code', x: 420 },
      ]}
      rows={[
        { from: 1, label: 'Login with Evil AS', numbered: true },
        { from: 0, to: 2, label: 'Authorize request' },
        { from: 2, to: 3, label: 'Same request' },
        { from: 0, to: 3, label: 'Approves, signed in' },
        { from: 3, to: 1, label: 'Code, iss = honest' },
        { from: 1, label: 'iss ≠ Evil AS: stop', numbered: true },
      ]}
      tag="Code and verifier stay home"
      tagStep={6}
    />
  );
}

function StepUp({ id }: { id: string }) {
  return (
    <Sequence
      id={id}
      label={DESCRIPTIONS['step-up']}
      lanes={[
        { name: 'Advisor', role: 'human', x: 60 },
        { name: 'MCP client', role: 'external', x: 180 },
        { name: 'Auth server', role: 'code', x: 300 },
        { name: 'MCP server', role: 'code', x: 420 },
      ]}
      rows={[
        { from: 1, to: 3, label: 'open_case' },
        { from: 3, label: 'Scope: accounts:read', numbered: true },
        { from: 3, to: 1, label: '403: cases:write', reply: true },
        { from: 1, label: 'Union of both scopes', numbered: true },
        { from: 1, to: 2, label: 'Authorize' },
        { from: 0, to: 2, label: 'Approves cases:write' },
        { from: 2, to: 1, label: 'New token', reply: true },
        { from: 1, to: 3, label: 'Retry open_case' },
        { from: 3, to: 1, label: '200: case opened', reply: true },
      ]}
      tag="This 403 can be fixed"
      tagStep={9}
    />
  );
}

function TwoAudiences({ id }: { id: string }) {
  return (
    <Sequence
      id={id}
      label={DESCRIPTIONS['two-audiences']}
      lanes={[
        { name: 'MCP client', role: 'external', x: 60 },
        { name: 'MCP server', role: 'code', x: 180 },
        { name: 'CRM auth', role: 'external', x: 300 },
        { name: 'CRM API', role: 'external', x: 420 },
      ]}
      rows={[
        { from: 0, to: 1, label: 'aud = MCP server' },
        { from: 1, label: 'Checks aud, sub', numbered: true },
        { from: 1, to: 2, label: 'Client ID + secret' },
        { from: 2, to: 1, label: 'aud = CRM', reply: true },
        { from: 1, to: 3, label: 'Its own token' },
        { from: 3, to: 1, label: '200: account', reply: true },
        { from: 1, to: 0, label: 'Advisor’s view', reply: true },
      ]}
      tag="Two tokens, two audiences"
      tagStep={7}
    />
  );
}

function Enterprise({ id }: { id: string }) {
  return (
    <Sequence
      id={id}
      label={DESCRIPTIONS.enterprise}
      lanes={[
        { name: 'MCP client', role: 'external', x: 60 },
        { name: 'Company IdP', role: 'code', x: 180 },
        { name: 'Server’s AS', role: 'external', x: 300 },
        { name: 'MCP server', role: 'external', x: 420 },
      ]}
      rows={[
        { from: 0, to: 1, label: 'SSO sign-in' },
        { from: 1, to: 0, label: 'ID token', reply: true },
        { gap: 'Later, for one MCP server' },
        { from: 0, to: 1, label: 'Exchange it' },
        { from: 1, label: 'Checks policy', numbered: true },
        { from: 1, to: 0, label: 'ID-JAG', reply: true },
        { from: 0, to: 2, label: 'ID-JAG, JWT bearer' },
        { from: 2, to: 0, label: 'Access token', reply: true },
        { from: 0, to: 3, label: 'Bearer access token' },
      ]}
      tag="No consent screen"
      tagStep={8}
    />
  );
}

export const DESCRIPTIONS = {
  discovery:
    'Discovery: the MCP client calls the MCP server without a token and gets a 401 that names the server’s metadata. The metadata names the auth server’s issuer. The client fetches the auth server’s metadata, its endpoints and issuer, and checks that the issuer matches the URL it fetched it from.',
  'client-id':
    'A client ID that is a URL: the MCP client starts the login with a client_id that is a URL. The auth server fetches that URL and gets the client’s metadata. It checks that the client_id in it equals the URL and that the redirect URI is listed, and caches the document.',
  'authorization-code':
    'The authorization code flow to an MCP server: the MCP client makes a state and a PKCE verifier and records the auth server’s issuer, then opens the login URL for the advisor. The advisor logs in and approves; the auth server sends a code, the state and its issuer back. The client checks state and iss, trades code and verifier for an access token meant for the MCP server, and calls it. The MCP server checks the audience and scope and returns Alex’s account.',
  'mix-up':
    'The mix-up attack: the MCP client starts a login with the evil auth server and records it. The evil server passes the same request on to the honest one, where the advisor is signed in and approves. The honest server sends the code back with its own issuer. The client sees that the issuer is not the evil server it started with and stops, so neither the code nor the verifier goes to the attacker.',
  'step-up':
    'Step-up: the MCP client calls open_case. The token only has accounts:read, so the MCP server answers 403 and names cases:write. The client asks for the union of both scopes, the advisor approves cases:write, and with the new token the retry opens the case.',
  'two-audiences':
    'Two tokens, two audiences: the MCP client calls the MCP server with a token whose audience is the MCP server. The MCP server checks it, gets its own token for the CRM with its client ID and secret, calls the CRM with that one, and returns only what this advisor may see.',
  enterprise:
    'Enterprise-managed authorization: the MCP client signs the advisor in through the company’s identity provider and keeps the ID token. For one MCP server, it exchanges the ID token at the IdP, which checks policy and returns an ID-JAG. The server’s own auth server trades the ID-JAG for an access token, and the client calls the MCP server with it. No consent screen.',
} as const;

export type FigureName = keyof typeof DESCRIPTIONS;

const FIGURES: Record<FigureName, (props: { id: string }) => ReactNode> = {
  discovery: Discovery,
  'client-id': ClientId,
  'authorization-code': AuthorizationCode,
  'mix-up': MixUp,
  'step-up': StepUp,
  'two-audiences': TwoAudiences,
  enterprise: Enterprise,
};

export default function McpAuthFigure({ name, id }: { name: FigureName; id: string }) {
  const Figure = FIGURES[name];
  return <Figure id={id} />;
}
