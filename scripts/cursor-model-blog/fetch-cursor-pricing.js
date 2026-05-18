/**
 * Fetches Cursor model pricing from https://cursor.com/docs/models#model-pricing via Playwright.
 * Returns array: [{ name, provider, input, cacheWrite, cacheRead, output }] ($ per 1M tokens).
 * Run standalone: node scripts/cursor-model-blog/fetch-cursor-pricing.js
 */

import { fileURLToPath } from "url";
import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const CURSOR_MODELS_URL = "https://cursor.com/docs/models#model-pricing";
const FALLBACK_PRICING = [
  {
    name: "Claude 4 Sonnet",
    provider: "Anthropic",
    input: 3,
    cacheWrite: 3.75,
    cacheRead: 0.3,
    output: 15,
  },
  {
    name: "Claude 4 Sonnet 1M",
    provider: "Anthropic",
    input: 6,
    cacheWrite: 7.5,
    cacheRead: 0.6,
    output: 22.5,
  },
  {
    name: "Claude 4.5 Haiku",
    provider: "Anthropic",
    input: 1,
    cacheWrite: 1.25,
    cacheRead: 0.1,
    output: 5,
  },
  {
    name: "Claude 4.5 Opus",
    provider: "Anthropic",
    input: 5,
    cacheWrite: 6.25,
    cacheRead: 0.5,
    output: 25,
  },
  {
    name: "Claude 4.5 Sonnet",
    provider: "Anthropic",
    input: 3,
    cacheWrite: 3.75,
    cacheRead: 0.3,
    output: 15,
  },
  {
    name: "Claude 4.6 Opus",
    provider: "Anthropic",
    input: 5,
    cacheWrite: 6.25,
    cacheRead: 0.5,
    output: 25,
  },
  {
    name: "Claude 4.6 Opus (Fast mode)",
    provider: "Anthropic",
    input: 30,
    cacheWrite: 37.5,
    cacheRead: 3,
    output: 150,
  },
  {
    name: "Claude 4.6 Sonnet",
    provider: "Anthropic",
    input: 3,
    cacheWrite: 3.75,
    cacheRead: 0.3,
    output: 15,
  },
  {
    name: "Composer 1",
    provider: "Cursor",
    input: 1.25,
    cacheWrite: 0,
    cacheRead: 0.125,
    output: 10,
  },
  {
    name: "Composer 1.5",
    provider: "Cursor",
    input: 3.5,
    cacheWrite: 0,
    cacheRead: 0.35,
    output: 17.5,
  },
  {
    name: "Composer 2",
    provider: "Cursor",
    input: 0.5,
    cacheWrite: 0,
    cacheRead: 0.2,
    output: 2.5,
  },
  {
    name: "Gemini 2.5 Flash",
    provider: "Google",
    input: 0.3,
    cacheWrite: 0,
    cacheRead: 0.03,
    output: 2.5,
  },
  {
    name: "Gemini 3 Flash",
    provider: "Google",
    input: 0.5,
    cacheWrite: 0,
    cacheRead: 0.05,
    output: 3,
  },
  {
    name: "Gemini 3 Pro",
    provider: "Google",
    input: 2,
    cacheWrite: 0,
    cacheRead: 0.2,
    output: 12,
  },
  {
    name: "Gemini 3 Pro Image Preview",
    provider: "Google",
    input: 2,
    cacheWrite: 0,
    cacheRead: 0.2,
    output: 12,
  },
  {
    name: "Gemini 3.1 Pro",
    provider: "Google",
    input: 2,
    cacheWrite: 0,
    cacheRead: 0.2,
    output: 12,
  },
  {
    name: "GPT-5",
    provider: "OpenAI",
    input: 1.25,
    cacheWrite: 0,
    cacheRead: 0.125,
    output: 10,
  },
  {
    name: "GPT-5 Fast",
    provider: "OpenAI",
    input: 2.5,
    cacheWrite: 0,
    cacheRead: 0.25,
    output: 20,
  },
  {
    name: "GPT-5 Mini",
    provider: "OpenAI",
    input: 0.25,
    cacheWrite: 0,
    cacheRead: 0.025,
    output: 2,
  },
  {
    name: "GPT-5-Codex",
    provider: "OpenAI",
    input: 1.25,
    cacheWrite: 0,
    cacheRead: 0.125,
    output: 10,
  },
  {
    name: "GPT-5.1 Codex",
    provider: "OpenAI",
    input: 1.25,
    cacheWrite: 0,
    cacheRead: 0.125,
    output: 10,
  },
  {
    name: "GPT-5.1 Codex Max",
    provider: "OpenAI",
    input: 1.25,
    cacheWrite: 0,
    cacheRead: 0.125,
    output: 10,
  },
  {
    name: "GPT-5.1 Codex Mini",
    provider: "OpenAI",
    input: 0.25,
    cacheWrite: 0,
    cacheRead: 0.025,
    output: 2,
  },
  {
    name: "GPT-5.2",
    provider: "OpenAI",
    input: 1.75,
    cacheWrite: 0,
    cacheRead: 0.175,
    output: 14,
  },
  {
    name: "GPT-5.2 Codex",
    provider: "OpenAI",
    input: 1.75,
    cacheWrite: 0,
    cacheRead: 0.175,
    output: 14,
  },
  {
    name: "GPT-5.3 Codex",
    provider: "OpenAI",
    input: 1.75,
    cacheWrite: 0,
    cacheRead: 0.175,
    output: 14,
  },
  {
    name: "GPT-5.4",
    provider: "OpenAI",
    input: 2.5,
    cacheWrite: 0,
    cacheRead: 0.25,
    output: 15,
  },
  {
    name: "GPT-5.4 Mini",
    provider: "OpenAI",
    input: 0.75,
    cacheWrite: 0,
    cacheRead: 0.075,
    output: 4.5,
  },
  {
    name: "GPT-5.4 Nano",
    provider: "OpenAI",
    input: 0.2,
    cacheWrite: 0,
    cacheRead: 0.02,
    output: 1.25,
  },
  {
    name: "Grok 4.20",
    provider: "xAI",
    input: 2,
    cacheWrite: 0,
    cacheRead: 0.2,
    output: 6,
  },
  {
    name: "Kimi K2.5",
    provider: "Moonshot",
    input: 0.6,
    cacheWrite: 0,
    cacheRead: 0.1,
    output: 3,
  },
];

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
 * @returns {Promise<Array<{ name: string, provider: string, input: number, cacheWrite: number, cacheRead: number, output: number }>>}
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
        let cacheWriteCol = -1;
        let cacheReadCol = -1;
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
            cacheWriteCol = headers.findIndex((h) => h.includes("cache") && h.includes("write"));
            cacheReadCol = headers.findIndex((h) => h.includes("cache") && h.includes("read"));
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
          const cacheWriteRaw = cacheWriteCol >= 0 ? cells[cacheWriteCol]?.textContent?.trim() ?? "" : "";
          const cacheReadRaw = cacheReadCol >= 0 ? cells[cacheReadCol]?.textContent?.trim() ?? "" : "";
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
            cacheWriteRaw,
            cacheReadRaw,
            outputRaw,
          });
        }
        return out;
      });

      const scrapedRows = rows
        .filter((r) => r.name)
        .map((r) => {
          const input = parsePrice(r.inputRaw);
          const cacheWrite = parsePrice(r.cacheWriteRaw);
          const cacheRead = parsePrice(r.cacheReadRaw);
          const output = parsePrice(r.outputRaw);
          return {
            name: r.name.trim(),
            provider: normalizeProvider(r.provider) || inferProvider(r.name),
            input: Number.isFinite(input) ? input : 0,
            cacheWrite: Number.isFinite(cacheWrite) ? cacheWrite : 0,
            cacheRead: Number.isFinite(cacheRead) ? cacheRead : 0,
            output: Number.isFinite(output) ? output : 0,
          };
        })
        .filter((r) => r.input > 0 || r.output > 0);

      const merged = new Map();
      for (const item of FALLBACK_PRICING) {
        merged.set(item.name, item);
      }
      for (const item of scrapedRows) {
        const existing = merged.get(item.name);
        merged.set(item.name, {
          ...existing,
          ...item,
        });
      }
      return Array.from(merged.values());
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error("Cursor pricing scraping failed:", error);
    console.log("Continuing with hardcoded pricing fallback");
    return [...FALLBACK_PRICING];
  }
}

function inferProvider(modelName) {
  if (/claude/i.test(modelName)) return "Anthropic";
  if (/gpt|codex/i.test(modelName)) return "OpenAI";
  if (/gemini/i.test(modelName)) return "Google";
  if (/grok/i.test(modelName)) return "xAI";
  if (/kimi/i.test(modelName)) return "Moonshot";
  if (/composer/i.test(modelName)) return "Cursor";
  return "";
}

if (process.argv[1] === __filename) {
  fetchCursorPricing().then((rows) => {
    console.log(`Fetched ${rows.length} Cursor pricing rows`);
    console.log(JSON.stringify(rows.slice(0, 5), null, 2));
  });
}
