'use client';

import { useEffect, useState } from 'react';
import type { Heading } from '@/lib/markdown';
import { cn } from '@/lib/utils';

function useActiveHeading(headings: Heading[]) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-120px 0px -65% 0px' },
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  return activeId;
}

function TocList({ headings, activeId }: { headings: Heading[]; activeId: string | null }) {
  return (
    <ul className="space-y-0.5 border-l border-line text-[13px]">
      {headings.map((h) => (
        <li key={h.id}>
          <a
            href={`#${h.id}`}
            aria-current={activeId === h.id ? 'location' : undefined}
            className={cn(
              '-ml-px block border-l-2 py-1 leading-snug transition-colors',
              h.depth === 3 ? 'pl-6' : 'pl-3.5',
              activeId === h.id ? 'border-accent text-fg' : 'border-transparent text-subtle hover:text-muted',
            )}
          >
            {h.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

/** 데스크톱: 스크롤을 따라오는 우측 목차 */
export function TableOfContents({ headings }: { headings: Heading[] }) {
  const activeId = useActiveHeading(headings);
  if (headings.length === 0) return null;
  return (
    <nav aria-label="목차">
      <p className="mb-3 font-pixel text-[11px] uppercase tracking-wider text-subtle">Contents</p>
      <TocList headings={headings} activeId={activeId} />
    </nav>
  );
}

/** 모바일·태블릿: 본문 위에서 펼치는 목차 */
export function MobileToc({ headings }: { headings: Heading[] }) {
  const activeId = useActiveHeading(headings);
  if (headings.length === 0) return null;
  return (
    <details className="group rounded-lg border border-line bg-surface xl:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-pixel text-[11px] uppercase tracking-wider text-muted [&::-webkit-details-marker]:hidden">
        Contents
        <span className="text-subtle transition-transform group-open:rotate-90">▶</span>
      </summary>
      <div className="px-4 pb-4">
        <TocList headings={headings} activeId={activeId} />
      </div>
    </details>
  );
}
