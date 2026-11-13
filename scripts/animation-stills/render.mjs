/**
 * Renders the last frame of every animated figure (LoopAnimation) to a PNG,
 * which the figure shows when JavaScript is off.
 *
 *   node scripts/animation-stills/render.mjs [base-url]
 *
 * Screenshots each figure from the running site (default http://localhost:4321,
 * so start the dev server first) in light mode on a white background. Figures
 * are every element in a post that names its PNG in a data-still attribute (a
 * /images/... URL, as its <img> uses).
 */

import { mkdir, readdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { chromium } from 'playwright';

const BLOG = 'src/content/blog';

// The posts that embed an animation.
async function animatedPosts() {
  const posts = [];
  for (const file of await readdir(BLOG)) {
    if (!/\.mdx?$/.test(file)) continue;
    if ((await readFile(`${BLOG}/${file}`, 'utf8')).includes('<LoopAnimation')) {
      posts.push(file.replace(/\.mdx?$/, ''));
    }
  }
  return posts;
}

// Figures are drawn at 720px wide; the rest is the white margin around them.
const FIGURE_WIDTH = 768;
const SCALE = 3;

async function open(page, base, post) {
  // Wait for hydration, so no island renders over the figure afterwards.
  await page.goto(new URL(`/post/${post}`, base).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
}

async function discover(page, base) {
  const figures = new Map();
  for (const post of await animatedPosts()) {
    await open(page, base, post);
    const pngs = await page
      .locator('[data-still]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('data-still')));
    // The same animation in several posts is rendered once.
    for (const png of pngs) {
      if (!figures.has(png)) figures.set(png, { post, selector: `[data-still="${png}"]`, out: `src/assets${png}` });
    }
  }
  // public/images is a symlink to src/assets/images.
  return [...figures.values()];
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
    for (const { post, selector, out } of await discover(page, base)) {
      await open(page, base, post);

      const figure = page.locator(selector);
      if ((await figure.count()) !== 1) {
        throw new Error(`Expected exactly one element matching ${selector} on /post/${post}`);
      }
      // The island is ready once it marks itself so.
      await figure.locator('[data-ready]').waitFor();

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
