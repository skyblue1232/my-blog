import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('mx-auto w-full max-w-6xl px-5 sm:px-8', className)}>{children}</div>;
}

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-line bg-white/[0.03] px-2 py-0.5 text-xs font-medium text-muted',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('font-mono text-xs font-medium uppercase tracking-[0.14em] text-accent-soft', className)}>
      {children}
    </p>
  );
}

type SectionHeaderProps = {
  index: string;
  label: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
};

/** 섹션 공통 헤더: `01 — About` 형태의 인덱스 + 제목 + 설명 */
export function SectionHeader({ index, label, title, description, action }: SectionHeaderProps) {
  return (
    <div className="mb-12 flex flex-col gap-6 sm:mb-14 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <Eyebrow>
          <span className="text-subtle">{index}</span>
          <span className="mx-2 text-subtle/60">—</span>
          {label}
        </Eyebrow>
        <h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.03em] text-fg sm:text-4xl">{title}</h2>
        {description && <p className="mt-4 text-base leading-relaxed text-muted sm:text-[17px]">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Section({ id, className, children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={cn('relative scroll-mt-20 py-24 sm:py-32', className)}>
      {children}
    </section>
  );
}
