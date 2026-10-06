'use client';

import { useEffect, useState } from 'react';
import type { Heading } from '@/lib/markdown';
import { cn } from '@/lib/utils';

/** 스크롤 위치에 따라 현재 읽는 섹션을 강조하는 목차 */
export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -70% 0px' },
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="목차">
      <p className="mb-4 font-mono text-xs uppercase tracking-wider text-subtle">On this page</p>
      <ul className="space-y-1 border-l border-line text-[13px]">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={cn(
                '-ml-px block border-l py-1 leading-snug transition-colors',
                h.depth === 3 ? 'pl-7' : 'pl-4',
                activeId === h.id ? 'border-accent-soft text-fg' : 'border-transparent text-subtle hover:text-muted',
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
