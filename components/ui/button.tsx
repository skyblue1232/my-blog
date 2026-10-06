import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn, isExternal } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const base =
  'group/btn inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50';

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.2),0_8px_24px_-8px_rgb(99_102_241/0.7)] hover:bg-accent-strong',
  secondary: 'border border-line-strong bg-white/[0.03] text-fg hover:border-white/25 hover:bg-white/[0.07]',
  ghost: 'text-muted hover:bg-white/[0.06] hover:text-fg',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3.5 text-[13px]',
  md: 'h-10 px-4.5 text-sm',
  lg: 'h-12 px-6 text-[15px]',
};

export function buttonStyles({ variant = 'primary', size = 'md', className }: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

/** 내부 경로는 next/link로, 외부 URL은 새 탭으로 엽니다. */
export function ButtonLink({ href, variant, size, className, children, ...props }: ButtonLinkProps) {
  const external = isExternal(href);
  return (
    <Link
      href={href}
      className={buttonStyles({ variant, size, className })}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...props}
    >
      {children}
    </Link>
  );
}
