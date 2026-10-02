/**
 * Renders an HTML mockup to a PNG for a blog post.
 *
 *   node scripts/mockups/render.mjs [file.html] [--out file.png] [--scale n] [--selector css]
 *
 * Screenshots only the element matching --selector (default #mockup), with a
 * transparent background outside it, so rounded corners sit cleanly on both
 * light and dark themes.
 *
 * With no arguments, renders scripts/mockups/sme-review-screen.html twice: the
 * whole screen to sme-review-screen.png and the customer's message on its own
 * to customer-message.png, both in src/assets/images/blog/the-missing-compiler/.
 * Any other file without --out is written next to its HTML source.
 */

import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const DEFAULT_FILE = 'scripts/mockups/sme-review-screen.html';
const DEFAULT_DIR = 'src/assets/images/blog/the-missing-compiler';
const DEFAULT_TARGETS = [
  { selector: '#mockup', out: `${DEFAULT_DIR}/sme-review-screen.png` },
  { selector: '#customer-message', out: `${DEFAULT_DIR}/customer-message.png` },
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
    return { file: DEFAULT_FILE, scale: opts.scale, targets: DEFAULT_TARGETS };
  }
  opts.file ??= DEFAULT_FILE;
  opts.out ??= opts.file.replace(/\.html?$/, '') + '.png';
  opts.selector ??= '#mockup';
  return {
    file: opts.file,
    scale: opts.scale,
    targets: [{ selector: opts.selector, out: opts.out }],
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
    for (const { selector, out } of opts.targets) {
      await page.goto(pathToFileURL(resolve(opts.file)).href);
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
