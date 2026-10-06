'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { navItems, site } from '@/content/site';
import { cn } from '@/lib/utils';
import { buttonStyles } from '../ui/button';
import { Close, Menu, Search } from '../ui/icons';
import { OPEN_COMMAND_MENU } from './command-menu';

const sectionIds = navItems.filter((i) => i.href.startsWith('/#')).map((i) => i.href.slice(2));

/** 홈에서는 현재 보이는 섹션을, 그 외에는 경로를 기준으로 활성 메뉴를 표시합니다. */
function useActiveNav(pathname: string) {
  const [section, setSection] = useState<string | null>(null);

  useEffect(() => {
    if (pathname !== '/') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setSection(entry.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [pathname]);

  return (href: string) => {
    if (href.startsWith('/#')) return pathname === '/' && section === href.slice(2);
    return pathname.startsWith(href);
  };
}

export function SiteHeader() {
  const pathname = usePathname();
  const isActive = useActiveNav(pathname);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [shortcut, setShortcut] = useState('⌘K');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!/Mac|iPhone|iPad/.test(navigator.userAgent)) setShortcut('Ctrl K');
  }, []);

  const openSearch = () => window.dispatchEvent(new Event(OPEN_COMMAND_MENU));

  return (
    <header
      className={cn(
        'no-print fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300',
        scrolled || menuOpen
          ? 'border-b border-line bg-bg/75 backdrop-blur-xl backdrop-saturate-150'
          : 'border-b border-transparent',
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-sm focus:text-white"
      >
        본문으로 건너뛰기
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5 font-semibold tracking-tight text-fg" aria-label="홈으로">
          <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-accent-soft to-accent text-[13px] font-bold text-white shadow-[0_0_0_1px_rgb(255_255_255/0.12)_inset]">
            M
          </span>
          <span className="text-[15px]">{site.nameEn}</span>
        </Link>

        <nav aria-label="주요 메뉴" className="ml-auto hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-sm transition-colors',
                isActive(item.href) ? 'bg-white/[0.07] text-fg' : 'text-muted hover:text-fg',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <button
            type="button"
            onClick={openSearch}
            className="flex h-8 items-center gap-2 rounded-full border border-line bg-white/[0.03] pl-3 pr-2 text-[13px] text-subtle transition-colors hover:border-line-strong hover:text-muted"
            aria-label="검색 열기 (Ctrl+K)"
          >
            <Search />
            <span className="hidden lg:inline">검색</span>
            <kbd className="hidden rounded border border-line px-1 font-mono text-[10px] sm:inline">{shortcut}</kbd>
          </button>
          <Link href={site.resumeHref} className={buttonStyles({ size: 'sm', className: 'hidden sm:inline-flex' })}>
            이력서
          </Link>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-full text-lg text-muted hover:bg-white/[0.06] hover:text-fg md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? '메뉴 닫기' : '메뉴 열기'}
          >
            {menuOpen ? <Close /> : <Menu />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-nav" aria-label="모바일 메뉴" className="border-t border-line px-5 pb-6 pt-2 md:hidden">
          <ul className="flex flex-col">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between border-b border-line py-4 text-lg font-medium text-fg"
                >
                  {item.label}
                  <span className="text-subtle">→</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link href={site.resumeHref} className={buttonStyles({ size: 'lg', className: 'mt-6 w-full' })}>
            이력서 보기
          </Link>
        </nav>
      )}
    </header>
  );
}
