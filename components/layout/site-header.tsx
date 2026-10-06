'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { categories, site } from '@/content/site';
import type { SearchEntry } from '@/lib/posts';
import { cn } from '@/lib/utils';
import { LabBot } from '../pixel/sprites';
import { Close, Search } from '../ui/icons';
import { HeaderSearch } from './header-search';
import { ThemeToggle } from './theme-toggle';

export function SiteHeader({ searchIndex }: { searchIndex: SearchEntry[] }) {
  const pathname = usePathname();
  const [mobileSearch, setMobileSearch] = useState(false);
  const [hover, setHover] = useState(false);

  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/90 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        본문으로 건너뛰기
      </a>

      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          aria-label={`${site.name} 홈`}
        >
          <LabBot blink={hover} className="h-7 w-auto" />
          <span className="font-pixel text-[13px] uppercase tracking-wider text-fg">{site.shortName}</span>
        </Link>

        <HeaderSearch index={searchIndex} className="ml-auto hidden w-full max-w-xs md:block" />

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <button
            type="button"
            className="grid size-8 place-items-center rounded-md border border-line text-muted hover:text-fg md:hidden"
            onClick={() => setMobileSearch((v) => !v)}
            aria-expanded={mobileSearch}
            aria-label={mobileSearch ? '검색 닫기' : '검색 열기'}
          >
            {mobileSearch ? <Close /> : <Search />}
          </button>
          <ThemeToggle />
        </div>
      </div>

      {mobileSearch && (
        <div className="px-4 pb-3 md:hidden">
          <HeaderSearch index={searchIndex} />
        </div>
      )}

      <nav aria-label="카테고리" className="mx-auto max-w-6xl px-4 sm:px-6">
        <ul className="-mb-px flex gap-1 overflow-x-auto [scrollbar-width:none]">
          {[{ href: '/', label: 'All' }, ...categories.map((c) => ({ href: `/category/${c.slug}`, label: c.label }))].map(
            (item) => (
              <li key={item.href} className="shrink-0">
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={cn(
                    'block border-b-2 px-3 py-2.5 text-[13px] font-medium transition-colors',
                    isActive(item.href)
                      ? 'border-accent text-fg'
                      : 'border-transparent text-subtle hover:text-fg',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ),
          )}
          <li className="ml-auto shrink-0">
            <Link
              href="/blog"
              aria-current={pathname === '/blog' ? 'page' : undefined}
              className={cn(
                'block border-b-2 px-3 py-2.5 text-[13px] font-medium transition-colors',
                pathname === '/blog' ? 'border-accent text-fg' : 'border-transparent text-subtle hover:text-fg',
              )}
            >
              Archive
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
