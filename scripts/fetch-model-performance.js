/**
 * Fetches model performance (BigCodeBench, Arena-Hard-Auto) and merges with
 * Cursor pricing to produce public/data/model-performance.json.
 * Run: node scripts/fetch-model-performance.js
 */

import { writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_PATH = join(ROOT, "public", "data", "model-performance.json");

// Cursor model pricing ($ per 1M tokens): input, output. Source: cursor.com/docs/models
// Weighted cost = input * 0.7 + output * 0.3 (planning-heavy mix).
const CURSOR_PRICING = [
  { name: "Claude 4.5 Opus", provider: "Anthropic", input: 5, output: 25 },
  { name: "Claude 4.5 Sonnet", provider: "Anthropic", input: 3, output: 15 },
  { name: "Claude 4.5 Haiku", provider: "Anthropic", input: 1, output: 5 },
  { name: "Claude 4.6 Opus", provider: "Anthropic", input: 5, output: 25 },
  { name: "Composer 1", provider: "Cursor", input: 1.25, output: 10 },
  { name: "Gemini 2.5 Flash", provider: "Google", input: 0.3, output: 2.5 },
  { name: "Gemini 3 Flash", provider: "Google", input: 0.5, output: 3 },
  { name: "Gemini 3 Pro", provider: "Google", input: 2, output: 12 },
  { name: "GPT-5", provider: "OpenAI", input: 1.25, output: 10 },
  { name: "GPT-5.2", provider: "OpenAI", input: 1.75, output: 14 },
  { name: "GPT-5.2 Codex", provider: "OpenAI", input: 1.75, output: 14 },
  { name: "GPT-5 Mini", provider: "OpenAI", input: 0.25, output: 2 },
  { name: "Grok Code", provider: "xAI", input: 0.2, output: 1.5 },
];

// Map Cursor display name -> possible benchmark identifiers (LMSYS Arena / BigCodeBench).
// Most specific / newest keys first to avoid matching older model data by mistake.
const CURSOR_TO_BENCHMARK_KEYS = {
  "Claude 4.6 Opus": [
    "claude-opus-4-6",
    "claude-4.6-opus",
  ],
  "Claude 4.5 Opus": [
    "claude-opus-4-5-20251101",
    "claude-opus-4-5",
    "claude-4.5-opus",
  ],
  "Claude 4.5 Sonnet": [
    "claude-sonnet-4-5-20250929",
    "claude-sonnet-4-5",
    "claude-4-5-sonnet",
    "claude-4.5-sonnet",
  ],
  "Claude 4.5 Haiku": [
    "claude-haiku-4-5",
    "claude-3-5-haiku",
    "claude-3.5-haiku",
  ],
  "Claude 4.6 Opus": [
    "claude-opus-4-6",
    "claude-4-6-opus",
    "claude-4-5-opus",
  ],
  "Composer 1": [],
  "Gemini 3 Pro": [
    "gemini-3-pro",
    "gemini-3-pro-preview",
  ],
  "Gemini 3 Flash": [
    "gemini-3-flash",
    "gemini-3-flash-thinking",
    "gemini-3-flash-grounding",
  ],
  "Gemini 2.5 Flash": [
    "gemini-2-5-flash",
    "gemini-2.5-flash",
    "gemini-2-flash",
  ],
  "GPT-5.2": [
    "gpt-5.2-high",
    "gpt-5.2",
    "gpt-5-2",
  ],
  "GPT-5": [
    "gpt-5.1-high",
    "gpt-5.1",
    "gpt-5",
    "gpt-5-preview",
  ],
  "GPT-5.2 Codex": [
    "gpt-5.2-codex",
    "gpt-5-2-codex",
  ],
  "GPT-5 Mini": [
    "gpt-5-mini",
    "gpt-4.1-mini",
    "gpt-4o-mini",
  ],
  "Grok Code": [
    "grok-code-fast-1",
    "grok-code-fast",
    "grok-code",
  ],
};

function normalizeForMatch(s) {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[._]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\d{4}-\d{2}-\d{2}$/, "")
    .trim();
}

function parseCsv(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const parseLine = (line) => {
    const values = [];
    let i = 0;
    while (i < line.length) {
      if (line[i] === '"') {
        i += 1;
        let v = "";
        while (i < line.length && line[i] !== '"') {
          v += line[i++];
        }
        if (line[i] === '"') i += 1;
        values.push(v);
        if (line[i] === ",") i += 1;
      } else {
        let v = "";
        while (i < line.length && line[i] !== ",") {
          v += line[i++];
        }
        values.push(v.trim());
        if (line[i] === ",") i += 1;
      }
    }
    return values;
  };
  const header = parseLine(lines[0]).map((h) => h.trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    const row = {};
    header.forEach((h, idx) => {
      row[h] = (values[idx] ?? "").trim();
    });
    rows.push(row);
  }
  return rows;
}

async function fetchBigCodeBench() {
  const out = [];
  let offset = 0;
  const pageSize = 100;
  while (true) {
    const url = `https://datasets-server.huggingface.co/rows?dataset=bigcode/bigcodebench-results&config=default&split=train&offset=${offset}&length=${pageSize}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`BigCodeBench fetch failed: ${res.status}`);
    const data = await res.json();
    for (const r of data.rows ?? []) {
      const row = r.row ?? r;
      const model = row.model;
      const score = row.instruct != null ? row.instruct : row.complete;
      if (model != null && score != null) {
        out.push({
          model: String(model),
          modelNorm: normalizeForMatch(String(model)),
          score: Number(score),
          benchmark: "BigCodeBench",
        });
      }
    }
    if (!data.rows?.length || data.rows.length < pageSize) break;
    offset += pageSize;
  }
  return out;
}

async function fetchArenaHard() {
  const url =
    "https://huggingface.co/spaces/lmarena-ai/lmarena-leaderboard/raw/main/arena_hard_auto_leaderboard_v0.1.csv";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Arena-Hard fetch failed: ${res.status}`);
  const text = await res.text();
  const rows = parseCsv(text);
  return rows.map((r) => {
    const raw = String(r.model ?? "").trim();
    const norm = normalizeForMatch(raw)
      .replace(/-?\d{4}-\d{2}-\d{2}$/, "")
      .replace(/-?\d{8}$/, "")
      .replace(/-+/g, "-")
      .replace(/-$/, "");
    const parsedScore = Number(r.score);
    const safeScore = Number.isFinite(parsedScore) ? parsedScore : 0;
    return {
      model: raw,
      modelNorm: norm,
      score: safeScore,
      benchmark: "Arena-Hard-Auto",
    };
  });
}

function findBenchmarkScore(cursorName, bigCodeRows, arenaRows) {
  const keys = CURSOR_TO_BENCHMARK_KEYS[cursorName] ?? [];
  const cursorNorm = normalizeForMatch(cursorName);

  const matchIn = (rows, getNorm) => {
    for (const row of rows) {
      const n = getNorm(row);
      if (cursorNorm.includes(n) || n.includes(cursorNorm)) return row;
      for (const k of keys) {
        if (n.includes(k) || k.includes(n)) return row;
      }
    }
    return null;
  };

  const inBigCode = matchIn(bigCodeRows, (r) => r.modelNorm);
  if (inBigCode) return { score: inBigCode.score, benchmark: "BigCodeBench" };

  const inArena = matchIn(arenaRows, (r) => r.modelNorm);
  if (inArena) return { score: inArena.score, benchmark: "Arena-Hard-Auto" };

  return null;
}

function main() {
  return (async () => {
    const [bigCodeRows, arenaRows] = await Promise.all([fetchBigCodeBench(), fetchArenaHard()]);

    const models = [];
    const recommendedPlanning = ["Claude 4.5 Sonnet", "Claude 4.5 Opus", "GPT-5.2", "GPT-5.2 Codex"];
    const recommendedExecution = ["Gemini 3 Flash", "Gemini 2.5 Flash", "GPT-5 Mini", "Grok Code"];

    for (const p of CURSOR_PRICING) {
      const weightedCost = p.input * 0.7 + p.output * 0.3;
      const bench = findBenchmarkScore(p.name, bigCodeRows, arenaRows);
      models.push({
        name: p.name,
        provider: p.provider,
        inputCost: p.input,
        outputCost: p.output,
        weightedCost: Math.round(weightedCost * 100) / 100,
        benchmarkScore: bench ? bench.score : null,
        benchmarkName: bench ? bench.benchmark : null,
        recommended: recommendedPlanning.includes(p.name)
          ? "planning"
          : recommendedExecution.includes(p.name)
            ? "execution"
            : null,
      });
    }

    const payload = {
      lastUpdated: new Date().toISOString(),
      models: models.filter((m) => m.benchmarkScore != null),
    };

    mkdirSync(join(ROOT, "public", "data"), { recursive: true });
    writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2), "utf8");
    console.log(`Wrote ${payload.models.length} models to ${OUT_PATH}`);
  })();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
