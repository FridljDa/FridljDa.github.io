/**
 * The theory of constraints on the feedback loop of the-missing-compiler:
 * work items circle through four stations (experts grade, I translate, the
 * code gets written, evals run) and pile up in front of the slowest one.
 *
 * At first that is the code. Then a coding agent takes over the code station,
 * which gets several times faster, its pile drains, and a new one builds in
 * front of the experts: the bottleneck moved instead of going away.
 *
 * The loop is a small closed queueing simulation, stepped once per frame and
 * cached, so every frame renders the same way every time. The last frame is
 * the resting state: the pile at the experts, an arrow from where it was.
 */
import { useCurrentFrame, useVideoConfig, spring, AbsoluteFill } from 'remotion';
import { color, PALETTE, progress, lerp, Expert, Person, Developer, Agent, Evals, Label, type Point } from './shared';

// The track: a stadium, traced clockwise from the left end of its top straight.
const CX = 480;
const CY = 282;
const R = 150;
const HALF = 170;
const STRAIGHT = 2 * HALF;
const ARC = Math.PI * R;
const LENGTH = 2 * STRAIGHT + 2 * ARC;

function at(s: number): Point {
  let d = ((s % LENGTH) + LENGTH) % LENGTH;
  if (d < STRAIGHT) return { x: CX - HALF + d, y: CY - R };
  d -= STRAIGHT;
  if (d < ARC) {
    const a = -Math.PI / 2 + d / R;
    return { x: CX + HALF + R * Math.cos(a), y: CY + R * Math.sin(a) };
  }
  d -= ARC;
  if (d < STRAIGHT) return { x: CX + HALF - d, y: CY + R };
  d -= STRAIGHT;
  const a = Math.PI / 2 + d / R;
  return { x: CX - HALF + R * Math.cos(a), y: CY + R * Math.sin(a) };
}

const TRACK = `M${CX - HALF},${CY - R} h${STRAIGHT} a${R},${R} 0 0 1 0,${2 * R} h${-STRAIGHT} a${R},${R} 0 0 1 0,${-2 * R} Z`;

type StationId = 'experts' | 'me' | 'code' | 'evals';

/** Stations at the middle of each straight and the apex of each end, in loop order. */
const STATIONS: { id: StationId; s: number; label: string }[] = [
  { id: 'experts', s: HALF, label: 'Experts' },
  { id: 'me', s: STRAIGHT + ARC / 2, label: 'Me' },
  { id: 'code', s: STRAIGHT + ARC + HALF, label: 'Code' },
  { id: 'evals', s: 2 * STRAIGHT + ARC * 1.5, label: 'Evals' },
];

// Frames per item at each station; the coding agent arrives at AGENT_AT.
const SERVICE_BEFORE: Record<StationId, number> = { experts: 30, me: 16, code: 84, evals: 12 };
const SERVICE_AFTER: Record<StationId, number> = { ...SERVICE_BEFORE, code: 10 };
const AGENT_AT = 270;
export const BOTTLENECK_FRAMES = 660;

const ITEMS = 11;
const SPEED = 14;
const SPACING = 24;
const STATION_R = 42;

interface ItemState {
  s: number;
  hidden: boolean;
}
interface Frame {
  items: ItemState[];
  /** Service progress (0–1) at each station, or null when idle. */
  busy: (number | null)[];
  queues: number[];
}

type Mode =
  | { kind: 'travel'; to: number }
  | { kind: 'queue'; at: number }
  | { kind: 'service'; at: number; left: number; total: number };

function simulate(): Frame[] {
  // Items start spread over the track, each heading for the next station ahead of it.
  const items = Array.from({ length: ITEMS }, (_, i) => {
    const s = (i * LENGTH) / ITEMS;
    const to = STATIONS.findIndex((st) => st.s > s);
    return { s, shown: s, mode: { kind: 'travel', to: to === -1 ? 0 : to } as Mode };
  });
  const queues: number[][] = STATIONS.map(() => []);
  const serving: (number | null)[] = STATIONS.map(() => null);
  const frames: Frame[] = [];

  const distance = (from: number, to: number) => (((to - from) % LENGTH) + LENGTH) % LENGTH;

  for (let f = 0; f < BOTTLENECK_FRAMES; f++) {
    const service = f < AGENT_AT ? SERVICE_BEFORE : SERVICE_AFTER;

    STATIONS.forEach((station, k) => {
      if (serving[k] === null && queues[k].length) {
        const i = queues[k].shift()!;
        const total = service[station.id];
        items[i].mode = { kind: 'service', at: k, left: total, total };
        items[i].s = station.s;
        serving[k] = i;
      }
    });

    items.forEach((item, i) => {
      const mode = item.mode;
      if (mode.kind === 'service') {
        mode.left -= 1;
        if (mode.left <= 0) {
          serving[mode.at] = null;
          item.mode = { kind: 'travel', to: (mode.at + 1) % STATIONS.length };
        }
      } else if (mode.kind === 'travel') {
        const station = STATIONS[mode.to];
        // Stop at the back of the station's queue.
        const back = SPACING * (queues[mode.to].length + (serving[mode.to] === null ? 0 : 1));
        const stopAt = station.s - back;
        // Also when the queue has grown back past the item.
        if (distance(item.s, station.s) <= back + SPEED) {
          item.s = stopAt;
          queues[mode.to].push(i);
          item.mode = { kind: 'queue', at: mode.to };
        } else {
          item.s += SPEED;
        }
      }
    });

    // Queued items close up on the station as the ones ahead of them leave.
    queues.forEach((queue, k) => {
      queue.forEach((i, place) => {
        items[i].s = STATIONS[k].s - SPACING * (place + 1);
      });
    });

    items.forEach((item) => {
      const gap = distance(item.shown, item.s);
      item.shown = gap > LENGTH / 2 ? item.s : item.shown + Math.min(gap, gap * 0.35 + 1);
    });

    frames.push({
      items: items.map((item) => ({ s: item.shown, hidden: item.mode.kind === 'service' })),
      busy: serving.map((i) => {
        if (i === null) return null;
        const mode = items[i].mode as Extract<Mode, { kind: 'service' }>;
        return 1 - mode.left / mode.total;
      }),
      queues: queues.map((q) => q.length),
    });
  }
  return frames;
}

let cache: Frame[] | undefined;
const frames = () => (cache ??= simulate());

/** The station with the longest queue, switching only once another is clearly longer. */
function constraints(): { station: number; since: number }[] {
  const out: { station: number; since: number }[] = [];
  let current = -1;
  frames().forEach((frame, f) => {
    const longest = frame.queues.indexOf(Math.max(...frame.queues));
    if (frame.queues[longest] < 3) return;
    if (current === -1 || frame.queues[longest] >= frame.queues[current] + 2) {
      if (longest !== current) out.push({ station: longest, since: f });
      current = longest;
    }
  });
  return out;
}

let constraintCache: ReturnType<typeof constraints> | undefined;
const constraintTimeline = () => (constraintCache ??= constraints());

/** Unit vector from the track's center out through a station. */
const outward = (p: Point): Point => {
  const dx = p.x < CX - HALF ? p.x - (CX - HALF) : p.x > CX + HALF ? p.x - (CX + HALF) : 0;
  const dy = p.y - CY;
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
};

export const BottleneckMoves = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const state = frames()[Math.min(frame, BOTTLENECK_FRAMES - 1)];
  const timeline = constraintTimeline();
  const now = timeline.filter((c) => c.since <= frame);
  const current = now[now.length - 1];
  const previous = now[now.length - 2];

  const agent = progress(frame, AGENT_AT - 10, AGENT_AT + 10);
  const agentPop = frame < AGENT_AT ? 0 : spring({ frame: frame - AGENT_AT, fps, config: { damping: 10, mass: 0.5 } });

  const tagAt = (k: number): Point => {
    const p = at(STATIONS[k].s);
    const n = outward(p);
    return { x: p.x + n.x * 86, y: p.y + n.y * 86 };
  };

  return (
    <AbsoluteFill style={{ background: color('surface') }}>
      <svg viewBox="0 0 960 540" width="100%" height="100%" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <defs>
          <marker id="bottleneck-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 Z" fill={color('warn')} />
          </marker>
        </defs>

        <path d={TRACK} fill="none" stroke={color('edge')} strokeWidth={14} strokeLinejoin="round" />
        {/* Direction of travel */}
        {[0.5, 1.5, 2.5, 3.5].map((q) => {
          const s = STATIONS[0].s + (q * LENGTH) / 4;
          const p = at(s);
          const ahead = at(s + 6);
          const angle = (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI;
          return (
            <path
              key={q}
              d="M-5,-6 L3,0 L-5,6"
              transform={`translate(${p.x} ${p.y}) rotate(${angle})`}
              fill="none"
              stroke={color('surface')}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {/* Where the bottleneck was, once it has moved */}
        {previous && current && (() => {
          const from = at(STATIONS[previous.station].s);
          const to = at(STATIONS[current.station].s);
          const drawn = progress(frame, current.since, current.since + 30);
          // Through the inside of the loop, bowed to the left so it clears the station labels.
          const mid = { x: (from.x + to.x) / 2 - 150, y: (from.y + to.y) / 2 };
          const shrink = (p: Point, q: Point, by: number): Point => {
            const len = Math.hypot(q.x - p.x, q.y - p.y);
            return { x: p.x + ((q.x - p.x) * by) / len, y: p.y + ((q.y - p.y) * by) / len };
          };
          const a = shrink(from, mid, STATION_R + 14);
          const b = shrink(to, mid, STATION_R + 16);
          return (
            <path
              d={`M${a.x},${a.y} Q${mid.x},${mid.y} ${b.x},${b.y}`}
              fill="none"
              stroke={color('warn')}
              strokeWidth={3}
              strokeDasharray="1"
              pathLength={1}
              strokeDashoffset={1 - drawn}
              markerEnd={drawn > 0.95 ? 'url(#bottleneck-arrow)' : undefined}
              opacity={0.85}
            />
          );
        })()}

        {/* Work items */}
        {state.items.map((item, i) =>
          item.hidden ? null : (() => {
            const p = at(item.s);
            return <circle key={i} cx={p.x} cy={p.y} r={9} fill={PALETTE[i % PALETTE.length]} stroke={color('surface')} strokeWidth={2} />;
          })()
        )}

        {/* Stations */}
        {STATIONS.map((station, k) => {
          const p = at(station.s);
          const busy = state.busy[k];
          const isConstraint = current?.station === k;
          const glow = isConstraint ? progress(frame, current.since, current.since + 20) : 0;
          const n = outward(p);
          // Top and bottom stations are labelled inside the loop, the ends outside it.
          const label =
            n.y < -0.5
              ? { x: p.x, y: p.y + STATION_R + 26, anchor: 'middle' }
              : n.y > 0.5
                ? { x: p.x, y: p.y - STATION_R - 14, anchor: 'middle' }
                : { x: p.x + n.x * (STATION_R + 14), y: p.y + 6, anchor: n.x < 0 ? 'end' : 'start' };
          return (
            <g key={station.id}>
              <circle cx={p.x} cy={p.y} r={STATION_R} fill={color('surface')} stroke={glow > 0 ? color('warn') : color('node-border')} strokeWidth={lerp(2, 4, glow)} />
              {busy !== null && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={STATION_R}
                  fill="none"
                  stroke={color('added')}
                  strokeWidth={4}
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1 - busy}
                  transform={`rotate(-90 ${p.x} ${p.y})`}
                />
              )}
              {station.id === 'experts' && <Expert x={p.x} y={p.y + 2} scale={1.25} />}
              {station.id === 'me' && <Person x={p.x} y={p.y + 2} scale={1.25} fill={color('text')} />}
              {station.id === 'code' && (
                <>
                  <Developer x={p.x} y={p.y + 2} scale={1.2} opacity={1 - agent} />
                  <Agent x={p.x} y={p.y} scale={lerp(0.6, 1.05, agentPop)} opacity={agent} typing={busy ?? 1} />
                </>
              )}
              {station.id === 'evals' && <Evals x={p.x} y={p.y} scale={1.2} />}
              <Label x={label.x} y={label.y} anchor={label.anchor as 'middle' | 'start' | 'end'}>
                {station.label}
              </Label>
            </g>
          );
        })}

        {/* The tag follows the constraint */}
        {current && (() => {
          const to = tagAt(current.station);
          const from = previous ? tagAt(previous.station) : to;
          const t = progress(frame, current.since, current.since + 30);
          const appear = previous ? 1 : progress(frame, current.since, current.since + 12);
          const x = lerp(from.x, to.x, t);
          const y = lerp(from.y, to.y, t);
          return (
            <g transform={`translate(${x} ${y})`} opacity={appear}>
              <rect x={-62} y={-17} width={124} height={34} rx={17} fill={color('warn')} />
              <text y={0} dy="0.35em" textAnchor="middle" fontSize={18} fontWeight={600} fill="#1f2937">
                Bottleneck
              </text>
            </g>
          );
        })()}
      </svg>
    </AbsoluteFill>
  );
};
