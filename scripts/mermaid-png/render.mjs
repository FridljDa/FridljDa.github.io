/**
 * Renders every ```mermaid fence in an MDX/Markdown file to a PNG.
 *
 * Useful for republishing a post somewhere that cannot render mermaid
 * (Confluence, Google Docs, slides): upload the PNGs and drop them in
 * where the fences were.
 *
 *   node scripts/mermaid-png/render.mjs [file] [--out dir] [--scale n] [--theme default|dark|neutral|forest]
 *
 * Defaults to src/content/blog/workflow-vs-agent.mdx, writing to
 * diagrams/<slug>/<slug>-01.png ...
 */

import { readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import { basename, extname, join, resolve } from 'node:path';
import { chromium } from 'playwright';

const DEFAULT_FILE = 'src/content/blog/workflow-vs-agent.mdx';
const MERMAID_BUNDLE = 'node_modules/mermaid/dist/mermaid.min.js';

function parseArgs(argv) {
  const opts = { file: null, out: null, scale: 3, theme: 'default' };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--out') opts.out = argv[++i];
    else if (arg === '--scale') opts.scale = Number(argv[++i]);
    else if (arg === '--theme') opts.theme = argv[++i];
    else if (arg.startsWith('--')) throw new Error(`Unknown flag: ${arg}`);
    else if (!opts.file) opts.file = arg;
    else throw new Error(`Unexpected argument: ${arg}`);
  }

  opts.file = opts.file ?? DEFAULT_FILE;
  if (!Number.isFinite(opts.scale) || opts.scale <= 0) {
    throw new Error('--scale must be a positive number');
  }
  return opts;
}

/** Pulls the source of each ```mermaid fence, in document order. */
function extractDiagrams(markdown) {
  const diagrams = [];
  const lines = markdown.split('\n');
  let current = null;

  for (const [index, line] of lines.entries()) {
    if (current) {
      if (/^\s*```\s*$/.test(line)) {
        diagrams.push({ line: current.line, code: current.body.join('\n').trim() });
        current = null;
      } else {
        current.body.push(line);
      }
      continue;
    }
    if (/^\s*```\s*mermaid\s*$/.test(line)) {
      current = { line: index + 1, body: [] };
    }
  }

  if (current) throw new Error(`Unclosed mermaid fence starting at line ${current.line}`);
  return diagrams.filter((d) => d.code.length > 0);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const filePath = resolve(opts.file);
  const slug = basename(filePath, extname(filePath));
  const outDir = resolve(opts.out ?? join('diagrams', slug));

  const markdown = await readFile(filePath, 'utf8');
  const diagrams = extractDiagrams(markdown);

  if (diagrams.length === 0) {
    console.log(`No mermaid diagrams found in ${opts.file}`);
    return;
  }

  const mermaidSource = await readFile(resolve(MERMAID_BUNDLE), 'utf8');

  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: opts.scale });

  await page.setContent(
    `<body style="margin:0;background:#fff">
       <div id="stage" style="display:inline-block;padding:24px;background:#fff"></div>
     </body>`,
  );
  await page.addScriptTag({ content: mermaidSource });
  await page.evaluate((theme) => {
    window.mermaid.initialize({
      startOnLoad: false,
      theme,
      securityLevel: 'loose',
      fontFamily:
        'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    });
  }, opts.theme);

  const written = [];

  for (const [index, diagram] of diagrams.entries()) {
    const name = `${slug}-${String(index + 1).padStart(2, '0')}.png`;

    const error = await page.evaluate(async ({ code, id }) => {
      const stage = document.getElementById('stage');
      stage.innerHTML = '';
      try {
        const { svg } = await window.mermaid.render(id, code);
        stage.innerHTML = svg;
        // Screenshot the intrinsic size, not mermaid's responsive 100% width.
        const el = stage.querySelector('svg');
        const box = el.getBBox();
        el.style.width = `${Math.ceil(box.width)}px`;
        el.style.height = `${Math.ceil(box.height)}px`;
        el.style.maxWidth = 'none';
        return null;
      } catch (err) {
        return String(err?.message ?? err);
      }
    }, { code: diagram.code, id: `diagram-${index + 1}` });

    if (error) {
      await browser.close();
      throw new Error(`Diagram at line ${diagram.line} failed to render: ${error}`);
    }

    const png = await page.locator('#stage').screenshot();
    await writeFile(join(outDir, name), png);
    written.push({ name, line: diagram.line });
  }

  await browser.close();

  console.log(`Rendered ${written.length} diagram(s) from ${opts.file} into ${outDir}:`);
  for (const { name, line } of written) {
    console.log(`  ${name}  (fence at line ${line})`);
  }
}

await main();
