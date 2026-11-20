/**
 * The design one-agent-many-teams proposes, as one map: a customer's message
 * goes to one agent loop. The platform team owns the loop, the MCP gateway
 * the loop calls tools through, and the eval gate every change has to pass.
 * The feature teams (Accounts, Cards, Payments) each contribute a skill the
 * loop loads, an MCP server behind the gateway, and eval cases for the gate.
 *
 * The section on the design opens with the whole map, and each of its
 * subsections with the same map, its row highlighted and the rest greyed
 * out, like DecisionMap.tsx does for workflow-vs-agent. Static: rendered on
 * the server, no JavaScript.
 */
import { color, Agent, Envelope, Evals, Reply, type Point } from '../remotion/shared';
import { Dim, ArrowMarker } from './map-parts';
import { TEAMS } from './TeamFigures';

type Row = 'skills' | 'tools' | 'evals';
type NodeId = 'message' | 'loop' | 'gateway' | 'gate';
type EdgeId = 'toLoop' | 'loopGateway' | Row;
type Part = NodeId | EdgeId | Row;

export interface Preset {
  /** Parts drawn at full strength; everything else is greyed out. Empty means everything. */
  focus: Part[];
  /** Only shows where a subsection sits in the design, so wide screens get it smaller. */
  small?: boolean;
  description: string;
}

export const PRESETS = {
  overview: {
    focus: [],
    description:
      'The design as one map. A message goes to one agent loop. The platform team owns the agent loop, the MCP gateway and the eval gate. The feature teams, Accounts, Cards and Payments, each contribute a skill the loop loads, an MCP server behind the gateway, and eval cases for the gate.',
  },
  skills: {
    focus: ['message', 'toLoop', 'loop', 'skills'],
    small: true,
    description: 'Highlighted: the skills. Each feature team writes its own, and the agent loop loads one when a message needs it.',
  },
  tools: {
    focus: ['loop', 'loopGateway', 'gateway', 'tools'],
    small: true,
    description: 'Highlighted: the tools. Each feature team runs its own MCP server behind the platform’s gateway, which the loop calls tools through.',
  },
  evals: {
    focus: ['gate', 'evals'],
    small: true,
    description: 'Highlighted: the evals. Each feature team contributes eval cases, and the platform’s eval gate runs them all against every change.',
  },
} satisfies Record<string, Preset>;

export type PresetName = keyof typeof PRESETS;

const ROWS: Row[] = ['skills', 'tools', 'evals'];
const ROW_NAMES: Record<Row, string> = { skills: 'Skills', tools: 'Tools', evals: 'Evals' };
const NAMES: Record<Exclude<NodeId, 'message'>, string> = { loop: 'Agent loop', gateway: 'MCP gateway', gate: 'Eval gate' };

interface Frame {
  x: number;
  y: number;
  w: number;
  h: number;
  title: Point;
}

interface Layout {
  width: number;
  height: number;
  size: number;
  message: Point & { label: Point & { anchor?: 'start' | 'middle' } };
  toLoop: string;
  platform: Frame;
  teams: Frame;
  /** The platform's three boxes share an x; the rows share their y. */
  nodeX: number;
  box: { w: number; h: number };
  rowY: Record<Row, number>;
  /** Where the teams' columns are, and where their names go. */
  cols: number[];
  teamNameY: number;
  /** Where the rows' names go; unset on phones, where the icons say it. */
  rowLabelX?: number;
  cell: { w: number; h: number };
  /** The teams' names, smaller than the rest on phones so the three fit side by side. */
  teamNameSize?: number;
}

const WIDE: Layout = {
  width: 1080,
  height: 450,
  size: 20,
  message: { x: 90, y: 160, label: { x: 90, y: 228 } },
  toLoop: 'M130,160 H302',
  platform: { x: 290, y: 40, w: 260, h: 390, title: { x: 420, y: 80 } },
  teams: { x: 620, y: 40, w: 440, h: 390, title: { x: 840, y: 80 } },
  nodeX: 420,
  box: { w: 224, h: 62 },
  rowY: { skills: 160, tools: 266, evals: 372 },
  cols: [790, 900, 1010],
  teamNameY: 120,
  rowLabelX: 640,
  cell: { w: 76, h: 56 },
};

/** Bigger type for the small subsection maps, drawn at about two thirds of the column. */
const WIDE_SMALL: Layout = {
  ...WIDE,
  size: 23,
  toLoop: 'M130,160 H292',
  platform: { ...WIDE.platform, x: 276, w: 288 },
  box: { w: 252, h: 62 },
};

/** For phones: the message on top, the frames side by side, their titles at the bottom. */
const TALL: Layout = {
  width: 560,
  height: 520,
  size: 22,
  teamNameSize: 16,
  message: { x: 150, y: 46, label: { x: 196, y: 53, anchor: 'start' } },
  toLoop: 'M150,78 V160',
  platform: { x: 16, y: 100, w: 268, h: 404, title: { x: 150, y: 488 } },
  teams: { x: 300, y: 100, w: 248, h: 404, title: { x: 424, y: 488 } },
  nodeX: 150,
  box: { w: 220, h: 62 },
  rowY: { skills: 200, tools: 306, evals: 412 },
  cols: [344, 424, 504],
  teamNameY: 140,
  cell: { w: 66, h: 54 },
};

const Box = ({ x, y, w, h, stroke = color('node-border') }: Point & { w: number; h: number; stroke?: string }) => (
  <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={12} fill={color('node-bg')} stroke={stroke} strokeWidth={2.5} />
);

/** A wrench, as DecisionMap.tsx draws the tools, centred on (x, y). */
const Wrench = ({ x, y, scale = 1, stroke = color('node-border') }: Point & { scale?: number; stroke?: string }) => (
  <g transform={`translate(${x - 2} ${y + 2}) rotate(-40) scale(${scale})`}>
    <rect x={-4} y={-6} width={34} height={12} rx={6} fill={color('node-bg')} stroke={stroke} strokeWidth={2.5} />
    <circle cx={-12} cy={0} r={14} fill={color('node-bg')} stroke={stroke} strokeWidth={2.5} />
    <rect x={-28} y={-5} width={15} height={10} fill={color('node-bg')} />
    <path d="M-25,-5 H-13 V5 H-25" fill="none" stroke={stroke} strokeWidth={2.5} strokeLinejoin="round" />
  </g>
);

function RowIcon({ row, at, stroke }: { row: Row; at: Point; stroke: string }) {
  switch (row) {
    case 'skills':
      return <Reply x={at.x} y={at.y} scale={1.35} stroke={stroke} />;
    case 'tools':
      return <Wrench x={at.x} y={at.y} scale={0.8} stroke={stroke} />;
    case 'evals':
      return <Evals x={at.x} y={at.y} scale={0.85} />;
  }
}

function PlatformIcon({ id, at }: { id: Exclude<NodeId, 'message'>; at: Point }) {
  switch (id) {
    case 'loop':
      return <Agent x={at.x} y={at.y} scale={0.95} typing={1} />;
    case 'gateway':
      return <Wrench x={at.x} y={at.y} scale={0.8} />;
    case 'gate':
      return <Evals x={at.x} y={at.y} scale={0.9} />;
  }
}

function FrameBox({ frame, title, size }: { frame: Frame; title: string; size: number }) {
  return (
    <g>
      <rect x={frame.x} y={frame.y} width={frame.w} height={frame.h} rx={18} fill="none" stroke={color('edge')} strokeWidth={2} strokeDasharray="8 6" />
      <text x={frame.title.x} y={frame.title.y} textAnchor="middle" fontSize={size} fontWeight={700} fill={color('muted')}>
        {title}
      </text>
    </g>
  );
}

function MapSvg({ layout, preset, id, className }: { layout: Layout; preset: Preset; id: string; className: string }) {
  const L = layout;
  const all = preset.focus.length === 0;
  const on = (part: Part) => all || preset.focus.includes(part);
  const marker = `${id}-arrow`;
  const line = { fill: 'none', stroke: color('node-border'), strokeWidth: 2.5 } as const;
  const boxRight = L.nodeX + L.box.w / 2;
  const nodeY: Record<Exclude<NodeId, 'message'>, number> = { loop: L.rowY.skills, gateway: L.rowY.tools, gate: L.rowY.evals };

  return (
    <svg className={className} viewBox={`0 0 ${L.width} ${L.height}`} role="img" aria-label={preset.description} style={{ width: '100%', height: 'auto', fontFamily: 'inherit' }}>
      <defs>
        <ArrowMarker id={marker} />
      </defs>

      <FrameBox frame={L.platform} title="Platform team" size={L.size} />
      <FrameBox frame={L.teams} title="Feature teams" size={L.size} />

      {/* The conversation: messages in, replies out. */}
      <Dim on={on('toLoop')}>
        <path d={L.toLoop} {...line} markerEnd={`url(#${marker})`} markerStart={`url(#${marker})`} />
      </Dim>
      <Dim on={on('message')}>
        <circle cx={L.message.x} cy={L.message.y} r={34} fill={color('node-bg')} stroke={color('node-border')} strokeWidth={2.5} />
        <Envelope x={L.message.x} y={L.message.y} scale={1.4} />
        <text x={L.message.label.x} y={L.message.label.y} textAnchor={L.message.label.anchor ?? 'middle'} fontSize={L.size} fontWeight={600} fill={color('text')}>
          Message
        </text>
      </Dim>

      {/* The loop calls tools through the gateway, and gets their results back. */}
      <Dim on={on('loopGateway')}>
        <path d={`M${L.nodeX},${nodeY.loop + L.box.h / 2 + 2} V${nodeY.gateway - L.box.h / 2 - 4}`} {...line} markerEnd={`url(#${marker})`} markerStart={`url(#${marker})`} />
      </Dim>

      {(Object.keys(nodeY) as (keyof typeof nodeY)[]).map((n) => (
        <Dim key={n} on={on(n)}>
          <Box x={L.nodeX} y={nodeY[n]} w={L.box.w} h={L.box.h} />
          <PlatformIcon id={n} at={{ x: L.nodeX - L.box.w / 2 + 38, y: nodeY[n] }} />
          <text x={L.nodeX - L.box.w / 2 + 74} y={nodeY[n]} dy="0.35em" fontSize={L.size} fontWeight={600} fill={color('text')}>
            {NAMES[n]}
          </text>
        </Dim>
      ))}

      {TEAMS.map((t, j) => (
        <text key={t.name} x={L.cols[j]} y={L.teamNameY} textAnchor="middle" fontSize={L.teamNameSize ?? L.size - 2} fontWeight={650} fill={t.color}>
          {t.name}
        </text>
      ))}

      {ROWS.map((row) => {
        const y = L.rowY[row];
        // Tools run both ways, as calls and results; skills and evals only go in.
        const twoWay = row === 'tools';
        return (
          <g key={row}>
            <Dim on={on(row)}>
              <path d={`M${L.teams.x - 2},${y} H${boxRight + 4}`} {...line} markerEnd={`url(#${marker})`} markerStart={twoWay ? `url(#${marker})` : undefined} />
            </Dim>
            <Dim on={on(row)}>
              {L.rowLabelX !== undefined && (
                <text x={L.rowLabelX} y={y} dy="0.35em" fontSize={L.size} fontWeight={600} fill={color('text')}>
                  {ROW_NAMES[row]}
                </text>
              )}
              {TEAMS.map((t, j) => (
                <g key={t.name}>
                  <Box x={L.cols[j]} y={y} w={L.cell.w} h={L.cell.h} stroke={t.color} />
                  <RowIcon row={row} at={{ x: L.cols[j], y }} stroke={t.color} />
                </g>
              ))}
            </Dim>
          </g>
        );
      })}
    </svg>
  );
}

/** Both layouts; TeamMap.astro shows the one that fits the figure's width. */
export default function TeamMap({ preset, id }: { preset: PresetName; id: string }) {
  const p: Preset = PRESETS[preset];
  return (
    <>
      <MapSvg layout={p.small ? WIDE_SMALL : WIDE} preset={p} id={`${id}-wide`} className="map-wide" />
      <MapSvg layout={TALL} preset={p} id={`${id}-tall`} className="map-tall" />
    </>
  );
}
