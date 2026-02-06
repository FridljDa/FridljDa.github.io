import React, { useState, useEffect } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

export interface ModelDatum {
  name: string;
  provider: string;
  inputCost: number;
  outputCost: number;
  weightedCost: number;
  benchmarkScore: number;
  benchmarkName: string;
  recommended: "planning" | "execution" | null;
}

export interface ModelPerformanceData {
  lastUpdated: string;
  models: ModelDatum[];
}

const PLANNING_COLOR = "#8b5cf6";
const EXECUTION_COLOR = "#22c55e";
const NEUTRAL_COLOR = "#64748b";

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ModelDatum }>;
}) {
  if (!active || !payload?.length) return null;
  const m = payload[0].payload;
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
      <div className="font-semibold">{m.name}</div>
      <div className="text-sm text-neutral-500 dark:text-neutral-400">{m.provider}</div>
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <span>Input (per 1M tok):</span>
        <span>${m.inputCost}</span>
        <span>Output (per 1M tok):</span>
        <span>${m.outputCost}</span>
        <span>Weighted cost:</span>
        <span>${m.weightedCost}</span>
        <span>Score ({m.benchmarkName}):</span>
        <span>{m.benchmarkScore}</span>
      </div>
      {m.recommended && (
        <div className="mt-2 text-xs font-medium text-neutral-600 dark:text-neutral-300">
          Recommended for: {m.recommended}
        </div>
      )}
    </div>
  );
}

export default function ModelPerformanceChart() {
  const [data, setData] = useState<ModelPerformanceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetch("/data/model-performance.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, [mounted]);

  if (error) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
        <p className="text-amber-800 dark:text-amber-200">Failed to load model data: {error}</p>
      </div>
    );
  }

  if (!mounted) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700">
        <p className="text-neutral-500">Loading chart…</p>
      </div>
    );
  }

  if (!data?.models?.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-700">
        <p className="text-neutral-500">Loading model data…</p>
      </div>
    );
  }

  const points = data.models.map((m) => ({
    ...m,
    x: m.benchmarkScore,
    y: m.weightedCost,
  }));

  const scoreRange = points.reduce(
    (acc, p) => ({
      min: Math.min(acc.min, p.x),
      max: Math.max(acc.max, p.x),
    }),
    { min: Infinity, max: -Infinity }
  );
  const costRange = points.reduce(
    (acc, p) => ({
      min: Math.min(acc.min, p.y),
      max: Math.max(acc.max, p.y),
    }),
    { min: Infinity, max: -Infinity }
  );
  const scorePadding = (scoreRange.max - scoreRange.min) * 0.1 || 5;
  const costPadding = (costRange.max - costRange.min) * 0.15 || 0.5;

  return (
    <figure className="my-6 w-full">
      <p id="model-performance-chart-description" className="sr-only">
        Scatter plot comparing model benchmark score (x-axis, higher is better) against weighted cost per 1M tokens (y-axis, lower is better). Dashed lines show the average score and average cost, dividing the chart into four quadrants.
      </p>
      <div
        className="h-[400px] w-full"
        role="img"
        aria-label="Model performance versus cost scatter plot"
        aria-describedby="model-performance-chart-description"
      >
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            style={{ fontFamily: "inherit" }}
          >
            <XAxis
              type="number"
              dataKey="x"
              name="Performance"
              unit=""
              domain={[scoreRange.min - scorePadding, scoreRange.max + scorePadding]}
              tickFormatter={(v) => String(Math.round(v))}
              label={{ value: "Benchmark score (higher = better)", position: "bottom", offset: 0 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Cost"
              unit="$"
              domain={[Math.max(0, costRange.min - costPadding), costRange.max + costPadding]}
              tickFormatter={(v) => `$${v}`}
              label={{
                value: "Weighted cost ($/1M tokens)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <ZAxis type="number" dataKey="weightedCost" range={[120, 400]} />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
            <ReferenceLine
              x={(scoreRange.min + scoreRange.max) / 2}
              stroke="currentColor"
              strokeOpacity={0.2}
              strokeDasharray="4 4"
            />
            <ReferenceLine
              y={(costRange.min + costRange.max) / 2}
              stroke="currentColor"
              strokeOpacity={0.2}
              strokeDasharray="4 4"
            />
            <Scatter name="Models" data={points} fill="var(--scatter-fill, #64748b)">
              {points.map((entry, i) => (
                <Cell
                  key={entry.name}
                  fill={
                    entry.recommended === "planning"
                      ? PLANNING_COLOR
                      : entry.recommended === "execution"
                        ? EXECUTION_COLOR
                        : NEUTRAL_COLOR
                  }
                  stroke="currentColor"
                  strokeWidth={1}
                  strokeOpacity={0.5}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="mt-2 flex flex-wrap items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
        <span>
          <span
            className="mr-1 inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: PLANNING_COLOR }}
          />
          Planning
        </span>
        <span>
          <span
            className="mr-1 inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: EXECUTION_COLOR }}
          />
          Execution
        </span>
        <span>
          <span
            className="mr-1 inline-block h-3 w-3 rounded-full"
            style={{ backgroundColor: NEUTRAL_COLOR }}
          />
          Other
        </span>
        <span className="ml-auto">Data updated: {new Date(data.lastUpdated).toLocaleDateString()}</span>
      </figcaption>
    </figure>
  );
}
