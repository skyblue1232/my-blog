import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('mx-auto w-full max-w-6xl px-4 sm:px-6', className)}>{children}</div>;
}

/** 섹션 제목: 픽셀 폰트 라벨 + 오른쪽 액션 */
export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <h2 className="font-pixel text-xs uppercase tracking-wider text-subtle">{children}</h2>
      {action}
    </div>
  );
}
