/**
 * Renders an HTML mockup to a PNG for a blog post.
 *
 *   node scripts/mockups/render.mjs [file.html] [--out file.png] [--scale n] [--selector css]
 *
 * Screenshots only the element matching --selector (default #mockup), with a
 * transparent background outside it, so rounded corners sit cleanly on both
 * light and dark themes.
 *
 * With no arguments, renders every mockup in DEFAULT_TARGETS:
 * scripts/mockups/sme-review-screen.html at each stage of the loop to
 * review-screen-<stage>.png, and the customer's message on its own to
 * customer-message.png, both in src/assets/images/blog/the-missing-compiler/,
 * plus the whole screen, light only, for the post's LinkedIn repost; and
 * scripts/mockups/support-message.html, its customer message and the
 * extraction figure, to src/assets/images/blog/first-level-support-automation/.
 * Any other file without --out is written next to its HTML source.
 *
 * A target's stage is set as the class stage-<stage> on <html>. Each target
 * is also rendered with html.dark to <name>-dark.png, which ThemedImage.astro
 * shows instead when the site is in dark mode, unless it is lightOnly.
 */

import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const DEFAULT_FILE = 'scripts/mockups/sme-review-screen.html';
const COMPILER_DIR = 'src/assets/images/blog/the-missing-compiler';
const SUPPORT_FILE = 'scripts/mockups/support-message.html';
const SUPPORT_DIR = 'src/assets/images/blog/first-level-support-automation';
const DEFAULT_TARGETS = [
  ...['reply', 'graded', 'fix'].map((stage) => ({
    file: DEFAULT_FILE,
    selector: '#mockup',
    stage,
    out: `${COMPILER_DIR}/review-screen-${stage}.png`,
  })),
  { file: DEFAULT_FILE, selector: '#mockup', out: `${COMPILER_DIR}/linkedin/review-screen.png`, lightOnly: true },
  { file: DEFAULT_FILE, selector: '#customer-message', out: `${COMPILER_DIR}/customer-message.png` },
  { file: SUPPORT_FILE, selector: '#customer-message', out: `${SUPPORT_DIR}/customer-message.png` },
  { file: SUPPORT_FILE, selector: '#extraction', out: `${SUPPORT_DIR}/extraction.png` },
];

function parseArgs(argv) {
  const opts = { file: null, out: null, scale: 3, selector: null };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--out') opts.out = argv[++i];
    else if (arg === '--scale') opts.scale = Number(argv[++i]);
    else if (arg === '--selector') opts.selector = argv[++i];
    else if (arg.startsWith('--')) throw new Error(`Unknown flag: ${arg}`);
    else if (!opts.file) opts.file = arg;
    else throw new Error(`Unexpected argument: ${arg}`);
  }

  if (!Number.isFinite(opts.scale) || opts.scale <= 0) {
    throw new Error('--scale must be a positive number');
  }
  if (!opts.file && !opts.out && !opts.selector) {
    return { scale: opts.scale, targets: DEFAULT_TARGETS };
  }
  opts.file ??= DEFAULT_FILE;
  opts.out ??= opts.file.replace(/\.html?$/, '') + '.png';
  opts.selector ??= '#mockup';
  return {
    scale: opts.scale,
    targets: [{ file: opts.file, selector: opts.selector, out: opts.out }],
  };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1200, height: 800 },
      deviceScaleFactor: opts.scale,
    });
    const shots = opts.targets.flatMap(({ file, selector, stage, out, lightOnly }) => [
      { file, selector, stage, out, dark: false },
      ...(lightOnly ? [] : [{ file, selector, stage, out: out.replace(/\.png$/, '-dark.png'), dark: true }]),
    ]);
    for (const { file, selector, stage, out, dark } of shots) {
      await page.goto(pathToFileURL(resolve(file)).href);
      await page.evaluate(
        ({ stage, dark }) => {
          const { classList } = document.documentElement;
          if (stage) classList.add(`stage-${stage}`);
          classList.toggle('dark', dark);
        },
        { stage, dark },
      );
      await page.evaluate(() => document.fonts.ready);

      const element = page.locator(selector);
      if ((await element.count()) !== 1) {
        throw new Error(`Expected exactly one element matching ${selector}`);
      }

      // A nested element's rounded corners would otherwise show its ancestors'
      // backgrounds; clear them so only the element itself is painted.
      await element.evaluate((el) => {
        for (let node = el.parentElement; node; node = node.parentElement) {
          node.style.background = 'transparent';
        }
      });

      await mkdir(dirname(resolve(out)), { recursive: true });
      await element.screenshot({ path: resolve(out), omitBackground: true });
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
