/**
 * Renders figures the site draws with CSS or SVG to PNGs, for the Confluence
 * copy of their post (/post/<slug>/confluence): a paste into Confluence keeps
 * images but drops inline SVG and the CSS that lays out HTML figures.
 *
 *   node scripts/confluence/render-figures.mjs [base-url]
 *
 * Screenshots each figure from the running site (default http://localhost:4321,
 * so start the dev server first) in light mode on a white background, which
 * stays readable when Confluence itself is in dark mode.
 *
 * Figures come from FIGURES, plus every element in POSTS that names its PNG in
 * a data-confluence-png attribute (a /images/... URL, as its <img> uses).
 */

import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { chromium } from 'playwright';

const FIGURES = [
  {
    post: 'the-missing-compiler',
    selector: '.shadow-timeline',
    out: 'src/assets/images/blog/the-missing-compiler/shadow-timeline.png',
  },
];

const POSTS = ['the-missing-compiler', 'first-level-support-automation'];

// Figures are drawn at 720px wide; the rest is the white margin around them.
const FIGURE_WIDTH = 768;
const SCALE = 3;

async function open(page, base, post) {
  // Wait for hydration, so no island renders over the figure afterwards.
  await page.goto(new URL(`/post/${post}`, base).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
}

async function discover(page, base) {
  const figures = [];
  for (const post of POSTS) {
    await open(page, base, post);
    const pngs = await page
      .locator('[data-confluence-png]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('data-confluence-png')));
    for (const png of pngs) {
      figures.push({
        post,
        selector: `[data-confluence-png="${png}"]`,
        // public/images is a symlink to src/assets/images.
        out: `src/assets${png}`,
      });
    }
  }
  return figures;
}

async function main() {
  const base = process.argv[2] ?? 'http://localhost:4321';

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1000, height: 800 },
      deviceScaleFactor: SCALE,
      colorScheme: 'light',
      // Animated figures skip to their final state, so the PNG doesn't catch one mid-way.
      reducedMotion: 'reduce',
    });
    for (const { post, selector, out } of [...FIGURES, ...(await discover(page, base))]) {
      await open(page, base, post);

      const figure = page.locator(selector);
      if ((await figure.count()) !== 1) {
        throw new Error(`Expected exactly one element matching ${selector} on /post/${post}`);
      }
      // A figure drawn by a client-side island is ready once the island marks itself so.
      if (await figure.locator('astro-island').count()) {
        await figure.locator('[data-ready]').waitFor();
      }

      // Alone on the page, so the sticky header and the chat widget stay out of it.
      await figure.evaluate((el, width) => {
        document.body.replaceChildren(el);
        Object.assign(el.style, {
          width: `${width}px`,
          margin: '0',
          padding: '24px',
          boxSizing: 'border-box',
          background: '#ffffff',
        });
      }, FIGURE_WIDTH);

      await mkdir(dirname(resolve(out)), { recursive: true });
      await figure.screenshot({ path: resolve(out) });
      console.log(`Wrote ${out}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
