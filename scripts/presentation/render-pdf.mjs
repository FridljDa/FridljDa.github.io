/**
 * Prints the slides of a talk (/post/<slug>/presentation) to PDF: the slides,
 * one 1280×720 page each, and a notes version with each slide and its speaker
 * notes on an A4 page.
 *
 *   node scripts/presentation/render-pdf.mjs [slug ...] [--base http://localhost:4321]
 *
 * Renders every deck in src/content/reposts/presentation/ when no slug is
 * given. Prints from the running site (default http://localhost:4321, so
 * start the dev server first) and writes <slug>.pdf and <slug>-notes.pdf next
 * to the deck's source.
 *
 * Set CHROMIUM_PATH to print with a Chromium other than Playwright's own.
 */

import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const DECKS = 'src/content/reposts/presentation';

async function main() {
  const args = process.argv.slice(2);
  const baseAt = args.indexOf('--base');
  const base = baseAt === -1 ? 'http://localhost:4321' : args.splice(baseAt, 2)[1];
  const slugs = args.length
    ? args
    : (await readdir(DECKS)).filter((f) => f.endsWith('.mdx')).map((f) => f.replace(/\.mdx$/, ''));

  // CHROMIUM_PATH points at a browser other than Playwright's own, if needed.
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  try {
    const page = await browser.newPage({
      colorScheme: 'light',
      // Animated figures skip to their final state.
      reducedMotion: 'reduce',
    });
    for (const slug of slugs) {
      for (const [query, suffix] of [
        ['', ''],
        ['?notes', '-notes'],
      ]) {
        const url = new URL(`/post/${slug}/presentation${query}`, base).href;
        const response = await page.goto(url, { waitUntil: 'networkidle' });
        if (!response?.ok()) throw new Error(`${url} answered ${response?.status()}`);
        await page.evaluate(async () => {
          await document.fonts.ready;
          await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
        });

        const out = resolve(DECKS, `${slug}${suffix}.pdf`);
        // Page sizes come from the page's @page rules.
        await page.pdf({ path: out, preferCSSPageSize: true, printBackground: true });
        console.log(`Wrote ${out}`);
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
