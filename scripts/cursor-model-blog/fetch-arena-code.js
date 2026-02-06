/**
 * Fetches Arena Code leaderboard data from arena.ai/leaderboard/code via Playwright.
 * Returns rows compatible with fetch-model-performance.js: { model, modelNorm, score, benchmark }.
 * Run standalone: node scripts/cursor-model-blog/fetch-arena-code.js
 */

import { fileURLToPath } from "url";
import { chromium } from "playwright";
import { normalizeForMatch } from "./utils/normalize.js";

const __filename = fileURLToPath(import.meta.url);

/**
 * @returns {Promise<Array<{ model: string, modelNorm: string, score: number, benchmark: string }>>}
 */
export async function fetchArenaCode() {
  try {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.goto("https://arena.ai/leaderboard/code", {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      await page.waitForSelector("table tbody tr", { timeout: 15000 });

      const rows = await page.evaluate(() => {
        const table = document.querySelector("table");
        if (!table) {
          return [];
        }

        const headerCells = Array.from(table.querySelectorAll("thead th"));
        const headerTexts = headerCells.map((th) => th.textContent?.trim().toLowerCase() || "");

        let modelIndex = headerTexts.findIndex((text) => /model/.test(text));
        let scoreIndex = headerTexts.findIndex((text) => /(score|elo)/.test(text));

        // Fallback to previous hard-coded indices if headers are not found.
        // Historically, the Arena Code table has the "Model" column at index 2 and the "Score/Elo"
        // column at index 3 (0-based), so we use these as backward-compatible defaults if the
        // header-based lookup fails.
        if (modelIndex === -1) modelIndex = 2;
        if (scoreIndex === -1) scoreIndex = 3;

        const tableRows = Array.from(table.querySelectorAll("tbody tr"));
        return tableRows.map((row) => {
          const cells = row.querySelectorAll("td");
          const modelCell = cells[modelIndex];
          const scoreCell = cells[scoreIndex];

          if (!modelCell || !scoreCell) {
            return { model: "", score: "" };
          }

          const link = modelCell.querySelector("a");
          const modelRaw = (link?.textContent?.trim() || modelCell.textContent?.trim() || "").trim();
          const scoreRaw = scoreCell.textContent?.trim() || "";
          return { model: modelRaw, score: scoreRaw };
        });
      });

      return rows
        .filter((r) => r.model && r.score)
        .map((r) => {
          const scoreNum = Number(r.score.replace(/,/g, ""));
          return {
            model: r.model,
            modelNorm: normalizeForMatch(r.model),
            score: Number.isFinite(scoreNum) ? scoreNum : 0,
            benchmark: "Arena-Code",
          };
        });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error("Arena Code scraping failed:", error);
    console.log("Continuing with BigCodeBench only");
    return [];
  }
}

if (process.argv[1] === __filename) {
  fetchArenaCode().then((rows) => {
    console.log(`Fetched ${rows.length} Arena Code rows`);
    console.log(JSON.stringify(rows.slice(0, 5), null, 2));
  });
}
