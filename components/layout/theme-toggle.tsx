'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { PixelMoon, PixelSun } from '../pixel/sprites';

type Theme = 'dark' | 'light';
export const THEME_EVENT = 'lab:theme-change';

/** 다크/라이트 토글 스위치. 초기 테마는 layout의 인라인 스크립트가 깜빡임 없이 적용합니다. */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');
  }, []);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {
      // 저장소를 쓸 수 없으면 현재 페이지에서만 적용합니다.
    }
    setTheme(next);
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: next }));
  }

  const dark = theme === 'dark';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="다크 모드"
      onClick={toggle}
      className="group relative flex h-8 w-[60px] shrink-0 items-center rounded-md border border-line-strong bg-surface-2 px-1"
    >
      <span className="flex w-full justify-between px-1.5">
        <PixelSun className={cn('h-3 w-3', dark ? 'opacity-40' : 'opacity-0')} />
        <PixelMoon className={cn('h-3 w-3', dark ? 'opacity-0' : 'opacity-40')} />
      </span>
      <span
        className={cn(
          'absolute top-1 grid size-[22px] place-items-center rounded-[4px] border border-line-strong bg-surface transition-[left] duration-200',
          dark ? 'left-[33px]' : 'left-1',
        )}
      >
        {dark ? <PixelMoon className="h-3 w-3" /> : <PixelSun className="h-3 w-3" />}
      </span>
    </button>
  );
}
