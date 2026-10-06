'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Check, Copy } from './icons';

type CopyButtonProps = {
  value: string;
  label?: ReactNode;
  copiedLabel?: ReactNode;
  className?: string;
};

export function CopyButton({ value, label = '복사', copiedLabel = '복사됨', className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(id);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // clipboard API를 쓸 수 없는 환경(비보안 컨텍스트 등) 대비
      const input = document.createElement('textarea');
      input.value = value;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    setCopied(true);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-line-strong bg-white/[0.03] px-4 text-sm font-medium text-fg transition-colors hover:border-white/25 hover:bg-white/[0.07]',
        className,
      )}
    >
      {copied ? <Check className="text-success" /> : <Copy className="text-muted" />}
      <span>{copied ? copiedLabel : label}</span>
      <span className="sr-only" aria-live="polite">
        {copied ? '클립보드에 복사되었습니다' : ''}
      </span>
    </button>
  );
}
