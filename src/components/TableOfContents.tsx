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
    const observerOptions = {
      rootMargin: '-20% 0% -35% 0%',
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      // Find the most recently intersected heading
      const intersectingEntries = entries.filter((entry) => entry.isIntersecting);
      if (intersectingEntries.length > 0) {
        // Sort by position in document and take the first one
        const sorted = intersectingEntries.sort(
          (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
        );
        setActiveId(sorted[0].target.id);
      }
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    headingElements.forEach((heading) => {
      observer.observe(heading);
    });

    // Set initial active heading based on scroll position
    const updateActiveHeading = () => {
      for (let i = headingElements.length - 1; i >= 0; i--) {
        const heading = headingElements[i];
        const rect = heading.getBoundingClientRect();
        if (rect.top <= 100) {
          setActiveId(heading.id);
          break;
        }
      }
    };

    // Set initial state
    updateActiveHeading();

    // Update on scroll
    window.addEventListener('scroll', updateActiveHeading, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateActiveHeading);
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

