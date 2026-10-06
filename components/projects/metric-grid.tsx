import type { Metric } from '@/content/projects';
import { cn } from '@/lib/utils';

export function MetricGrid({ metrics, className }: { metrics: Metric[]; className?: string }) {
  if (metrics.length === 0) return null;
  return (
    <dl className={cn('grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line', className)}>
      {metrics.map((m) => (
        <div key={m.label} className="bg-surface px-4 py-3.5">
          <dt className="sr-only">{m.label}</dt>
          <dd className="text-xl font-bold tracking-tight text-fg tabular-nums sm:text-2xl">{m.value}</dd>
          <dd className="mt-0.5 text-xs leading-snug text-subtle">{m.label}</dd>
        </div>
      ))}
    </dl>
  );
}
