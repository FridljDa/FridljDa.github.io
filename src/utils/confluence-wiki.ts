// HTML to Confluence wiki markup, for the Insert markup dialog. Unlike
// Markdown, wiki markup can size an image (!url|width=760!), so pasted
// figures don't come in at full resolution.

import TurndownService from 'turndown';

/** Widest an image is inserted at, in pixels: about the width of a Confluence page. */
export const MAX_IMAGE_WIDTH = 760;

// Characters that start formatting somewhere in wiki markup. A backslash
// escapes any of them; escaping one that wouldn't format is harmless. A hyphen
// only strikes through at a word's edge, so one inside a word stays as is.
const SPECIAL = /([*_+^~{}[\]!|#]|(?<!\w)-|-(?!\w))/g;

function listPrefix(li: HTMLElement): string {
  let prefix = '';
  for (let el = li.parentElement; el; el = el.parentElement) {
    if (el.nodeName === 'UL') prefix = '*' + prefix;
    else if (el.nodeName === 'OL') prefix = '#' + prefix;
  }
  return prefix;
}

function inList(node: HTMLElement): boolean {
  return node.parentElement?.closest('li') != null;
}

export function htmlToConfluenceWiki(input: HTMLElement): string {
  const service = new TurndownService();
  service.escape = (text: string) => text.replace(SPECIAL, '\\$1');
  const inline = (el: Element) => service.turndown(el.innerHTML).replace(/\s*\n\s*/g, ' ').trim();

  service.addRule('heading', {
    filter: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    replacement: (content, node) => `\n\n${node.nodeName.toLowerCase()}. ${content.trim()}\n\n`,
  });
  service.addRule('strong', { filter: ['strong', 'b'], replacement: (c) => (c.trim() ? `*${c}*` : c) });
  service.addRule('emphasis', { filter: ['em', 'i'], replacement: (c) => (c.trim() ? `_${c}_` : c) });
  service.addRule('strikethrough', { filter: ['del', 's'], replacement: (c) => (c.trim() ? `-${c}-` : c) });
  service.addRule('code', {
    filter: (node) => node.nodeName === 'CODE' && node.parentNode?.nodeName !== 'PRE',
    replacement: (_c, node) => `{{${node.textContent}}}`,
  });
  service.addRule('codeBlock', {
    filter: 'pre',
    replacement: (_c, node) => {
      const language = (node as HTMLElement).querySelector('code')?.className.match(/language-(\w+)/)?.[1];
      const text = (node.textContent ?? '').replace(/\n$/, '');
      return `\n\n{code${language ? `:language=${language}` : ''}}\n${text}\n{code}\n\n`;
    },
  });
  service.addRule('link', {
    filter: (node) => node.nodeName === 'A' && !!(node as HTMLElement).getAttribute('href'),
    replacement: (content, node) => {
      const href = (node as HTMLElement).getAttribute('href')!;
      return content.trim() ? `[${content.trim()}|${href}]` : `[${href}]`;
    },
  });
  service.addRule('image', {
    filter: 'img',
    replacement: (_c, node) => {
      const img = node as HTMLImageElement;
      const natural = Number(img.dataset.width) || MAX_IMAGE_WIDTH;
      return `!${img.getAttribute('src')}|width=${Math.min(natural, MAX_IMAGE_WIDTH)}!`;
    },
  });
  service.addRule('list', {
    filter: ['ul', 'ol'],
    replacement: (content, node) => (inList(node as HTMLElement) ? `\n${content}` : `\n\n${content}\n\n`),
  });
  service.addRule('listItem', {
    filter: 'li',
    replacement: (content, node) => {
      const prefix = listPrefix(node as HTMLElement);
      // Nested items come back as lines with a longer prefix; the rest is this item's text.
      const lines = content.split('\n').map((line) => line.trim()).filter(Boolean);
      const nested = lines.filter((line) => /^[*#]+ /.test(line));
      const text = lines.filter((line) => !/^[*#]+ /.test(line)).join(' ');
      return [`${prefix} ${text}`, ...nested].join('\n') + '\n';
    },
  });
  service.addRule('blockquote', {
    filter: 'blockquote',
    replacement: (content) => `\n\n{quote}\n${content.trim()}\n{quote}\n\n`,
  });
  service.addRule('hr', { filter: 'hr', replacement: () => '\n\n----\n\n' });
  service.addRule('table', {
    filter: 'table',
    replacement: (_c, node) => {
      const rows = [...(node as HTMLTableElement).rows].map((row) =>
        [...row.cells]
          .map((cell) => {
            const sep = cell.nodeName === 'TH' ? '||' : '|';
            return `${sep}${inline(cell) || ' '}`;
          })
          .join('') + (row.cells[row.cells.length - 1]?.nodeName === 'TH' ? '||' : '|'),
      );
      return `\n\n${rows.join('\n')}\n\n`;
    },
  });

  return service.turndown(input).replace(/\n{3,}/g, '\n\n').trim();
}
