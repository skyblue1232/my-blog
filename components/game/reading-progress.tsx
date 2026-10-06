'use client';

import { useEffect, useRef, useState } from 'react';
import { markCleared } from './cleared-store';

type ReadingProgressProps = {
  slug: string;
  minutes: number;
  /** 본문 요소 id — 이 요소의 끝까지 스크롤하면 CLEAR로 기록합니다. */
  targetId: string;
};

/**
 * 헤더 아래에 붙는 독서 진행 바.
 * 본문 끝에 도달하면 한 번만 "QUEST CLEAR" 토스트를 띄우고 읽음으로 기록합니다.
 */
export function ReadingProgress({ slug, minutes, targetId }: ReadingProgressProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    let frame = 0;
    let done = false;

    const update = () => {
      frame = 0;
      const rect = target.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      const progress = Math.min(1, Math.max(0, -rect.top / Math.max(total, 1)));
      if (barRef.current) barRef.current.style.transform = `scaleX(${progress})`;
      if (!done && progress >= 0.98) {
        done = true;
        if (markCleared(slug)) setToast(true);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [slug, targetId]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(false), 3200);
    return () => clearTimeout(id);
  }, [toast]);

  return (
    <>
      <div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent">
        <div ref={barRef} className="h-full origin-left scale-x-0 bg-accent" />
      </div>
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 transition-opacity duration-300 ${toast ? 'opacity-100' : 'opacity-0'}`}
      >
        {toast && (
          <div className="pixel-border flex items-center gap-3 bg-surface px-4 py-2.5 font-pixel text-xs uppercase tracking-wider text-fg">
            <span className="text-success">Quest clear!</span>
            <span className="text-subtle">+{minutes} xp</span>
          </div>
        )}
      </div>
    </>
  );
}
