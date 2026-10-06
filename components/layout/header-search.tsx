'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { getCategory } from '@/content/site';
import type { SearchEntry } from '@/lib/posts';
import { cn } from '@/lib/utils';
import { Search } from '../ui/icons';

const MAX_RESULTS = 6;

/**
 * 헤더 검색 바. 입력하는 즉시 제목 · 설명 · 태그에서 찾아 드롭다운으로 보여주고,
 * Enter로 선택하거나(결과가 없으면 전체 글 검색 페이지로) `/` 키로 바로 포커스할 수 있습니다.
 */
export function HeaderSearch({ index, className }: { index: SearchEntry[]; className?: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return index
      .filter((p) => `${p.title} ${p.description} ${p.tags.join(' ')} ${p.category}`.toLowerCase().includes(q))
      .slice(0, MAX_RESULTS);
  }, [index, query]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const typing = e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
      if ((e.key === '/' && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function go(href: string) {
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
    router.push(href);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[active]) go(`/blog/${results[active].slug}`);
      else if (query.trim()) go(`/blog?q=${encodeURIComponent(query.trim())}`);
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  }

  const showList = open && query.trim().length > 0;

  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-subtle" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={onKeyDown}
        placeholder="글 검색"
        aria-label="글 검색"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={showList && results[active] ? `${listId}-${active}` : undefined}
        className="h-9 w-full rounded-md border border-line bg-surface-2 pl-9 pr-10 text-sm text-fg placeholder:text-subtle focus:border-accent-line focus:bg-surface focus:outline-none"
      />
      <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-line px-1.5 font-mono text-[10px] text-subtle">
        /
      </kbd>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-md border border-line-strong bg-surface py-1 shadow-[0_16px_40px_-12px_rgb(0_0_0/0.35)]"
        >
          {results.length === 0 ? (
            <li className="px-3 py-3 text-sm text-subtle">
              결과가 없어요. <span className="text-muted">Enter로 전체 검색</span>
            </li>
          ) : (
            results.map((p, i) => (
              <li
                key={p.slug}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  go(`/blog/${p.slug}`);
                }}
                onMouseMove={() => setActive(i)}
                className={cn('cursor-pointer px-3 py-2', i === active && 'bg-surface-2')}
              >
                <p className="truncate text-sm text-fg">{p.title}</p>
                <p className="mt-0.5 font-pixel text-[10px] uppercase tracking-wider text-subtle">
                  {getCategory(p.category)?.label} · {p.date.replaceAll('-', '.')}
                </p>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
