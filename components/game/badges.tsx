'use client';

import { cn } from '@/lib/utils';
import { PixelCheck } from '../pixel/sprites';
import { useCleared } from './cleared-store';

/** 읽는 시간으로 정한 난이도. LV.1 < 5분, LV.2 < 10분, LV.3 ≥ 10분 */
export function LevelBadge({ level, className }: { level: 1 | 2 | 3; className?: string }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 font-pixel text-[10px] uppercase tracking-wider text-subtle', className)}
      title={`난이도 LV.${level} (읽는 시간 기준)`}
    >
      LV.{level}
      <span aria-hidden className="flex gap-px">
        {[1, 2, 3].map((n) => (
          <span key={n} className={cn('size-1.5', n <= level ? 'bg-accent' : 'bg-line-strong')} />
        ))}
      </span>
    </span>
  );
}

/** 끝까지 읽은 글에만 나타나는 CLEAR 표시 */
export function ClearedBadge({ slug, className }: { slug: string; className?: string }) {
  const cleared = useCleared();
  if (!cleared.includes(slug)) return null;
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 font-pixel text-[10px] uppercase tracking-wider text-success', className)}
      title="끝까지 읽은 글"
    >
      <PixelCheck className="h-2.5 w-auto [--px-accent:var(--success)]" />
      Clear
    </span>
  );
}
