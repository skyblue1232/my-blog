'use client';

import type { MouseEvent, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** 커서 위치를 CSS 변수로 넘겨 은은한 하이라이트를 그리는 카드 (Linear 스타일). */
export function SpotlightCard({ className, children }: { className?: string; children: ReactNode }) {
  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`);
  }

  return (
    <div
      onMouseMove={handleMove}
      className={cn(
        'spotlight relative rounded-2xl border border-line bg-surface transition-colors duration-300 hover:border-line-strong',
        className,
      )}
    >
      {children}
    </div>
  );
}
