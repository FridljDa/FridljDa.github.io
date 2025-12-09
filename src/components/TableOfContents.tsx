import { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  className?: string;
}

export default function TableOfContents({ className = '' }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Extract all headings with IDs from the page
    const headingElements = Array.from(
      document.querySelectorAll('article h2[id], article h3[id], article h4[id]')
    ) as HTMLElement[];

    if (headingElements.length === 0) {
      return;
    }

    const extractedHeadings: Heading[] = headingElements.map((el) => ({
      id: el.id,
      text: el.textContent || '',
      level: parseInt(el.tagName.charAt(1), 10),
    }));

    setHeadings(extractedHeadings);

    // Set up IntersectionObserver to track which heading is in view
    // rootMargin accounts for sticky header (80px) plus some buffer
    const observerOptions = {
      rootMargin: '-100px 0% -66% 0%', // 100px from top (header + buffer), 66% from bottom
      threshold: 0,
    };

    // Track all observed entries to determine the best active heading
    const entryMap = new Map<string, IntersectionObserverEntry>();

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Update the entry map with latest intersection data
      entries.forEach((entry) => {
        entryMap.set(entry.target.id, entry);
      });

      // Find the best active heading:
      // 1. Prefer headings currently intersecting
      // 2. Among intersecting, pick the one closest to the top of the viewport
      // 3. If none intersecting, use the last heading that passed the threshold
      const intersectingEntries = Array.from(entryMap.values()).filter(
        (entry) => entry.isIntersecting
      );

      let activeEntry: IntersectionObserverEntry | null = null;

      if (intersectingEntries.length > 0) {
        // Sort by position in viewport (closest to top wins)
        intersectingEntries.sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
        );
        activeEntry = intersectingEntries[0];
      } else {
        // No headings intersecting - find the last one that passed the threshold
        // (i.e., the one that's above the viewport but closest to it)
        const allEntries = Array.from(entryMap.values());
        const aboveViewport = allEntries.filter(
          (entry) => entry.boundingClientRect.top < 100
        );
        if (aboveViewport.length > 0) {
          // Sort by distance from top (closest to threshold wins)
          aboveViewport.sort(
            (a, b) => b.boundingClientRect.top - a.boundingClientRect.top
          );
          activeEntry = aboveViewport[0];
        }
      }

      if (activeEntry) {
        setActiveId(activeEntry.target.id);
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    headingElements.forEach((heading) => {
      observer.observe(heading);
      // Initialize entry map with all headings
      const initialEntry = {
        target: heading,
        boundingClientRect: heading.getBoundingClientRect(),
        intersectionRatio: 0,
        intersectionRect: {} as DOMRectReadOnly,
        isIntersecting: false,
        rootBounds: null,
        time: 0,
      } as IntersectionObserverEntry;
      entryMap.set(heading.id, initialEntry);
    });

    // Set initial active heading based on current scroll position
    // This ensures correct state on mount without conflicting with observer
    const setInitialActiveHeading = () => {
      for (let i = headingElements.length - 1; i >= 0; i--) {
        const heading = headingElements[i];
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) {
          setActiveId(heading.id);
          break;
        }
      }
    };

    // Set initial state (will be refined by IntersectionObserver on first scroll)
    setInitialActiveHeading();

    return () => {
      observer.disconnect();
      entryMap.clear();
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 80; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      // Update active ID immediately for better UX
      setActiveId(id);
    }
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <div className={`toc-container ${className}`}>
      <nav className="toc-sidebar" aria-label="Table of contents">
        <div className="toc-title">Contents</div>
        <ul className="toc-list">
          {headings.map((heading) => (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                onClick={(e) => handleClick(e, heading.id)}
                className={`toc-item toc-item-level-${heading.level} ${
                  activeId === heading.id ? 'active' : ''
                }`}
                aria-current={activeId === heading.id ? 'location' : undefined}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

