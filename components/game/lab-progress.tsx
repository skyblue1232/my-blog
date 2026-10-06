'use client';

import { cn } from '@/lib/utils';
import { useCleared } from './cleared-store';

type LabProgressProps = {
  /** slug → 읽는 시간(분). EXP는 끝까지 읽은 글의 읽는 시간 합계입니다. */
  posts: { slug: string; minutes: number }[];
  className?: string;
};

const SEGMENTS = 20;

/** 홈 상단의 EXP 바: 끝까지 읽은 글 수와 획득 EXP */
export function LabProgress({ posts, className }: LabProgressProps) {
  const cleared = useCleared();
  const done = posts.filter((p) => cleared.includes(p.slug));
  const exp = done.reduce((sum, p) => sum + p.minutes, 0);
  const total = posts.reduce((sum, p) => sum + p.minutes, 0);
  const filled = total ? Math.round((exp / total) * SEGMENTS) : 0;

  return (
    <div className={cn('w-full max-w-xs', className)}>
      <div className="flex items-baseline justify-between font-pixel text-[10px] uppercase tracking-wider text-subtle">
        <span>EXP</span>
        <span>
          <span className="text-fg">{done.length}</span>/{posts.length} clear · {exp} xp
        </span>
      </div>
      <div
        className="mt-1.5 flex gap-[2px]"
        role="progressbar"
        aria-label="끝까지 읽은 글의 경험치"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={exp}
      >
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span key={i} className={cn('h-2 flex-1', i < filled ? 'bg-accent' : 'bg-line-strong/70')} />
        ))}
      </div>
    </div>
  );
}
