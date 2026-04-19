import { useEffect } from 'react';

function mermaidTheme(): 'dark' | 'default' {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'default';
}

/**
 * Finds Shiki output for ```mermaid fences and replaces it with rendered diagrams.
 * Scoped to article prose so we do not touch other code blocks on the page.
 */
export default function MermaidInit() {
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const mermaid = (await import('mermaid')).default;
      if (cancelled) return;

      mermaid.initialize({
        startOnLoad: false,
        theme: mermaidTheme(),
        securityLevel: 'loose',
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
      });

      const prose = document.querySelector('article .prose');
      if (!prose || cancelled) return;

      const pres = prose.querySelectorAll('pre[data-language="mermaid"]');
      if (!pres.length || cancelled) return;

      const nodes: HTMLElement[] = [];

      pres.forEach((pre) => {
        const code = pre.querySelector('code');
        const source = code?.textContent?.trim() ?? '';
        if (!source) return;

        const wrap = document.createElement('div');
        wrap.className =
          'mermaid-chart not-prose my-8 flex justify-center overflow-x-auto';

        const graph = document.createElement('div');
        graph.className = 'mermaid';
        graph.textContent = source;

        wrap.appendChild(graph);
        pre.replaceWith(wrap);
        nodes.push(graph);
      });

      if (cancelled || nodes.length === 0) return;

      try {
        await mermaid.run({ nodes });
      } catch (err) {
        console.error('Mermaid:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
