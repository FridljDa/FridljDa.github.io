/**
 * Temporary script to inspect actual benchmark data
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const OUTPUT_DIR = join(__dirname, ".tmp");

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
    };
  });
}

(async () => {
  console.log("Fetching BigCodeBench...");
  const bigCode = await fetchBigCodeBench();
  console.log(`BigCodeBench: ${bigCode.length} entries`);
  
  console.log("\nFetching Arena-Hard-Auto...");
  const arena = await fetchArenaHard();
  console.log(`Arena-Hard-Auto: ${arena.length} entries`);
  
  // Filter for models containing relevant keywords
  const keywords = [
    "claude", "sonnet", "opus", "haiku",
    "gemini", "flash", "pro",
    "gpt", "mini", "codex",
    "grok", "composer"
  ];
  
  const relevantBigCode = bigCode.filter(m => 
    keywords.some(k => m.modelNorm.includes(k))
  );
  
  const relevantArena = arena.filter(m => 
    keywords.some(k => m.modelNorm.includes(k))
  );
  
  console.log("\n=== BIGCODEBENCH RELEVANT MODELS ===");
  console.log("Total:", relevantBigCode.length);
  relevantBigCode.sort((a, b) => b.score - a.score).forEach(m => {
    console.log(`  ${m.model} (norm: ${m.modelNorm}) - score: ${m.score}`);
  });
  
  console.log("\n=== ARENA-HARD-AUTO RELEVANT MODELS ===");
  console.log("Total:", relevantArena.length);
  relevantArena.sort((a, b) => b.score - a.score).forEach(m => {
    console.log(`  ${m.model} (norm: ${m.modelNorm}) - score: ${m.score}`);
  });
  
  // Save to files for inspection
  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(join(OUTPUT_DIR, "bigcode-all.json"), JSON.stringify(bigCode, null, 2));
  writeFileSync(join(OUTPUT_DIR, "arena-all.json"), JSON.stringify(arena, null, 2));
  writeFileSync(join(OUTPUT_DIR, "bigcode-relevant.json"), JSON.stringify(relevantBigCode, null, 2));
  writeFileSync(join(OUTPUT_DIR, "arena-relevant.json"), JSON.stringify(relevantArena, null, 2));
  
  console.log(`\n✓ Saved data to ${OUTPUT_DIR}`);
})();
