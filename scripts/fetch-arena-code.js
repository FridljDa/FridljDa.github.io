/**
 * Fetches Arena Code leaderboard data from arena.ai/leaderboard/code via Playwright.
 * Returns rows compatible with fetch-model-performance.js: { model, modelNorm, score, benchmark }.
 * Run standalone: node scripts/fetch-arena-code.js
 */

import { fileURLToPath } from "url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);

function normalizeForMatch(s) {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[._]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\d{4}-\d{2}-\d{2}$/, "")
    .trim();
}

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
        const tableRows = Array.from(document.querySelectorAll("table tbody tr"));
        return tableRows.map((row) => {
          const cells = row.querySelectorAll("td");
          const modelCell = cells[2];
          const scoreCell = cells[3];
          const link = modelCell?.querySelector("a");
          const modelRaw = (link?.textContent?.trim() || modelCell?.textContent?.trim() || "").trim();
          const scoreRaw = scoreCell?.textContent?.trim() || "";
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
