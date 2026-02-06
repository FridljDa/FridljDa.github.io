/**
 * Fetches Cursor model pricing from https://cursor.com/docs/models#model-pricing via Playwright.
 * Returns array: [{ name, provider, input, output }] ($ per 1M tokens).
 * Run standalone: node scripts/cursor-model-blog/fetch-cursor-pricing.js
 */

import { fileURLToPath } from "url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const CURSOR_MODELS_URL = "https://cursor.com/docs/models#model-pricing";

/**
 * Parse price string like "$3" or "$0.3" to number.
 */
function parsePrice(str) {
  if (str == null || typeof str !== "string") return NaN;
  const n = parseFloat(str.replace(/[$,]/g, "").trim());
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Normalize provider label from page (e.g. "Anthropic provider" -> "Anthropic").
 */
function normalizeProvider(label) {
  if (!label || typeof label !== "string") return "";
  return label.replace(/\s+provider$/i, "").trim();
}

/**
 * @returns {Promise<Array<{ name: string, provider: string, input: number, output: number }>>}
 */
export async function fetchCursorPricing() {
  try {
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.goto(CURSOR_MODELS_URL, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      // Wait for main content and any table.
      await page.waitForSelector("table", { timeout: 15000 });
      await new Promise((r) => setTimeout(r, 2000));

      // Scroll to pricing section and click "Show more models" until expanded.
      const pricingSection = page.locator("#model-pricing").first();
      if ((await pricingSection.count()) > 0) {
        await pricingSection.scrollIntoViewIfNeeded();
        await new Promise((r) => setTimeout(r, 500));
        let showMore = page.getByRole("button", { name: /show more models/i });
        const MAX_SHOW_MORE_CLICKS = 20;
        for (let i = 0; i < MAX_SHOW_MORE_CLICKS; i++) {
          const count = await showMore.count();
          if (count === 0) {
            break;
          }
          await showMore.first().click();
          await new Promise((r) => setTimeout(r, 800));
        }
      }

      const rows = await page.evaluate(() => {
        const tables = Array.from(document.querySelectorAll("table"));
        let pricingTable = null;
        let nameCol = 0;
        let inputCol = 1;
        let outputCol = 4;

        for (const t of tables) {
          const headers = Array.from(t.querySelectorAll("thead th")).map((th) =>
            (th.textContent ?? "").toLowerCase().trim()
          );
          const inputIdx = headers.findIndex((h) => h.includes("input"));
          const outputIdx = headers.findIndex((h) => h.includes("output"));
          if (inputIdx >= 0 && outputIdx >= 0) {
            pricingTable = t;
            nameCol = 0;
            inputCol = inputIdx;
            outputCol = outputIdx;
            break;
          }
        }
        if (!pricingTable) return [];

        const out = [];
        const trs = pricingTable.querySelectorAll("tbody tr");
        for (const tr of trs) {
          const cells = tr.querySelectorAll("td");
          const maxCol = Math.max(nameCol, inputCol, outputCol);
          if (cells.length <= maxCol) continue;

          const nameCell = cells[nameCol];
          const inputRaw = cells[inputCol]?.textContent?.trim() ?? "";
          const outputRaw = cells[outputCol]?.textContent?.trim() ?? "";

          let provider = "";
          const providerBtn = nameCell?.querySelector('[aria-label*="provider" i]');
          if (providerBtn) {
            const label = providerBtn.getAttribute("aria-label") ?? "";
            provider = label.replace(/\s+provider$/i, "").trim();
          }

          let name = (nameCell?.textContent ?? "").trim();
          if (provider && name.startsWith(provider)) {
            name = name.slice(provider.length).trim();
          }
          name = name.replace(/\s+/g, " ").trim();

          if (!name) continue;

          out.push({
            name,
            provider,
            inputRaw,
            outputRaw,
          });
        }
        return out;
      });

      return rows
        .filter((r) => r.name)
        .map((r) => {
          const input = parsePrice(r.inputRaw);
          const output = parsePrice(r.outputRaw);
          return {
            name: r.name.trim(),
            provider: normalizeProvider(r.provider) || inferProvider(r.name),
            input: Number.isFinite(input) ? input : 0,
            output: Number.isFinite(output) ? output : 0,
          };
        })
        .filter((r) => r.input > 0 || r.output > 0);
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error("Cursor pricing scraping failed:", error);
    console.log("Continuing with hardcoded pricing fallback");
    return [];
  }
}

function inferProvider(modelName) {
  if (/claude/i.test(modelName)) return "Anthropic";
  if (/gpt|codex/i.test(modelName)) return "OpenAI";
  if (/gemini/i.test(modelName)) return "Google";
  if (/grok/i.test(modelName)) return "xAI";
  if (/composer/i.test(modelName)) return "Cursor";
  return "";
}

if (process.argv[1] === __filename) {
  fetchCursorPricing().then((rows) => {
    console.log(`Fetched ${rows.length} Cursor pricing rows`);
    console.log(JSON.stringify(rows.slice(0, 5), null, 2));
  });
}
