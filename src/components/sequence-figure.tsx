/**
 * The sequence figure shared by the posts on authentication (AuthFigures.tsx,
 * McpAuthFigures.tsx): a box per party along the top, a dashed lifeline under
 * each, and a numbered row per message. Same palette, box style and outlines
 * as the section maps: grey for our code, orange for someone else's system,
 * teal for a person, red for an attacker.
 *
 * Each row carries the step it belongs to as data-step, so AuthSteps.astro can
 * highlight the step the reader is at and grey out the rest. A note and the
 * bottom tag belong to the step they comment on, a gap row to the step after it.
 */
import { color } from '../remotion/shared';
import { ArrowMarker, Badge, Tag } from './map-parts';

export type Role = 'code' | 'external' | 'human' | 'attacker';

export const STROKE: Record<Role, string> = {
  code: color('node-border'),
  external: color('other'),
  human: color('ok'),
  attacker: color('bad'),
};

export const W = 480;
export const LABEL = 15;
export const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

export interface Lane {
  name: string;
  role: Role;
  x: number;
}

/** A call from one lane to another, or, without `to`, a note on the `from` lane. */
export interface Message {
  from: number;
  to?: number;
  label: string;
  /** Answers are dashed, as in a sequence diagram. */
  reply?: boolean;
  /** A note that is a step of its own gets a number, like a message. */
  numbered?: boolean;
}

/** One row of a sequence: a message, or a line of text across the figure that marks time passing. */
export type Row = (Message & { step?: number }) | { gap: string };

const HEAD = { y: 12, h: 44 };
const ROW = 58;

/**
 * A sequence diagram drawn in the map's style: a box per party along the top,
 * a dashed lifeline under each, and a numbered row per message.
 */
export function Sequence({ id, lanes, rows, tag, tagStep, label }: { id: string; lanes: Lane[]; rows: Row[]; tag?: string; tagStep?: number; label: string }) {
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
            <text key={i} data-step={n + 1} x={W / 2} y={y} dy="0.35em" textAnchor="middle" fontSize={LABEL} fontWeight={600} fontStyle="italic" fill={color('muted')}>
              {r.gap}
            </text>
          );
        }
        const from = lanes[r.from].x;
        if (r.to === undefined) {
          if (r.numbered) n += 1;
          // A two-digit badge is wider, so its note leaves it more room on the left.
          const pad = r.numbered && n > 9 ? 16 : 0;
          const w = r.label.length * LABEL * 0.56 + 28 + pad;
          const x = Math.min(Math.max(from - w / 2, 16), W - 4 - w);
          return (
            <g key={i} data-step={r.step ?? n}>
              <rect x={x} y={y - 17} width={w} height={34} rx={9} fill={color('node-bg')} stroke={STROKE[lanes[r.from].role]} strokeWidth={2} />
              <text x={x + (w + pad) / 2} y={y} dy="0.35em" textAnchor="middle" fontSize={LABEL} fontWeight={600} fill={color('text')}>
                {r.label}
              </text>
              {r.numbered && <Badge x={x} y={y} text={String(n)} />}
            </g>
          );
        }
        n += 1;
        const to = lanes[r.to].x;
        const dir = Math.sign(to - from);
        const mid = (from + to) / 2;
        const w = r.label.length * LABEL * 0.56 + 12;
        return (
          <g key={i} data-step={n}>
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
      {tag && (
        <g data-step={tagStep}>
          <Tag x={W / 2} y={bottom + 30} text={tag} size={15} />
        </g>
      )}
    </svg>
  );
}
