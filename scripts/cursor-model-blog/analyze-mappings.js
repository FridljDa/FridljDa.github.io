/**
 * Analyzes CURSOR_TO_BENCHMARK_KEYS mapping against actual benchmark data
 */

import { readFileSync } from "fs";

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

const bigCode = JSON.parse(readFileSync("bigcode-all.json", "utf8"));
const arena = JSON.parse(readFileSync("arena-all.json", "utf8"));

console.log("=== ANALYSIS OF CURSOR_TO_BENCHMARK_KEYS ===\n");

// For each Cursor model, check if any of its keys match actual benchmark data
for (const [cursorName, keys] of Object.entries(CURSOR_TO_BENCHMARK_KEYS)) {
  console.log(`\n${cursorName}:`);
  console.log(`  Keys: ${keys.length === 0 ? "(empty)" : keys.join(", ")}`);
  
  if (keys.length === 0) {
    console.log(`  ⚠️  No benchmark keys defined`);
    continue;
  }
  
  // Normalize Cursor name
  const cursorNorm = normalizeForMatch(cursorName);
  console.log(`  Normalized: ${cursorNorm}`);
  
  // Check BigCodeBench
  const bigCodeMatches = [];
  for (const row of bigCode) {
    const n = row.modelNorm;
    const matched = keys.some(k => n.includes(k) || k.includes(n));
    const cursorMatched = cursorNorm.includes(n) || n.includes(cursorNorm);
    if (matched || cursorMatched) {
      bigCodeMatches.push({ model: row.model, norm: row.modelNorm, score: row.score, matchType: matched ? 'key' : 'name' });
    }
  }
  
  // Check Arena
  const arenaMatches = [];
  for (const row of arena) {
    const n = row.modelNorm;
    const matched = keys.some(k => n.includes(k) || k.includes(n));
    const cursorMatched = cursorNorm.includes(n) || n.includes(cursorNorm);
    if (matched || cursorMatched) {
      arenaMatches.push({ model: row.model, norm: row.modelNorm, score: row.score, matchType: matched ? 'key' : 'name' });
    }
  }
  
  if (bigCodeMatches.length > 0) {
    console.log(`  ✅ BigCodeBench matches: ${bigCodeMatches.length}`);
    bigCodeMatches.forEach(m => {
      console.log(`     - ${m.model} (${m.norm}) [${m.matchType}] - score: ${m.score}`);
    });
  } else {
    console.log(`  ❌ No BigCodeBench matches`);
  }
  
  if (arenaMatches.length > 0) {
    console.log(`  ✅ Arena-Hard matches: ${arenaMatches.length}`);
    arenaMatches.forEach(m => {
      console.log(`     - ${m.model} (${m.norm}) [${m.matchType}] - score: ${m.score}`);
    });
  } else {
    console.log(`  ❌ No Arena-Hard matches`);
  }
  
  if (bigCodeMatches.length === 0 && arenaMatches.length === 0) {
    console.log(`  ⚠️  NO MATCHES IN ANY BENCHMARK!`);
  }
}

// Summary
console.log("\n\n=== SUMMARY ===\n");

const withMatches = [];
const withoutMatches = [];

for (const [cursorName, keys] of Object.entries(CURSOR_TO_BENCHMARK_KEYS)) {
  const cursorNorm = normalizeForMatch(cursorName);
  
  const hasMatch = bigCode.some(row => {
    const n = row.modelNorm;
    return keys.some(k => n.includes(k) || k.includes(n)) || cursorNorm.includes(n) || n.includes(cursorNorm);
  }) || arena.some(row => {
    const n = row.modelNorm;
    return keys.some(k => n.includes(k) || k.includes(n)) || cursorNorm.includes(n) || n.includes(cursorNorm);
  });
  
  if (hasMatch) {
    withMatches.push(cursorName);
  } else {
    withoutMatches.push(cursorName);
  }
}

console.log(`✅ Models with benchmark data: ${withMatches.length}`);
withMatches.forEach(m => console.log(`   - ${m}`));

console.log(`\n❌ Models WITHOUT benchmark data: ${withoutMatches.length}`);
withoutMatches.forEach(m => console.log(`   - ${m}`));
