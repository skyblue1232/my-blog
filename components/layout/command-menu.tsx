'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn, isExternal } from '@/lib/utils';
import { ArrowRight, ArrowUpRight, FileText, Hash, Layers, Search } from '../ui/icons';

export type CommandItem = {
  group: 'Navigate' | 'Projects' | 'Posts' | 'Links';
  label: string;
  hint?: string;
  href: string;
  keywords?: string;
};

export const OPEN_COMMAND_MENU = 'command-menu:open';

const groupIcon = {
  Navigate: Hash,
  Projects: Layers,
  Posts: FileText,
  Links: ArrowUpRight,
} as const;

/** ⌘K / Ctrl+K로 여는 사이트 전역 검색·이동 팔레트 */
export function CommandMenu({ items }: { items: CommandItem[] }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => `${item.label} ${item.hint ?? ''} ${item.keywords ?? ''}`.toLowerCase().includes(q));
  }, [items, query]);

  const open = useCallback(() => {
    setQuery('');
    setActive(0);
    dialogRef.current?.showModal();
  }, []);

  const close = useCallback(() => dialogRef.current?.close(), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (dialogRef.current?.open) close();
        else open();
      }
    }
    window.addEventListener('keydown', onKey);
    window.addEventListener(OPEN_COMMAND_MENU, open);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(OPEN_COMMAND_MENU, open);
    };
  }, [open, close]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  function go(item: CommandItem) {
    close();
    if (isExternal(item.href)) window.open(item.href, '_blank', 'noopener,noreferrer');
    else router.push(item.href);
  }

  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      go(results[active]);
    }
  }

  let lastGroup = '';

  return (
    <dialog
      ref={dialogRef}
      aria-label="사이트 검색"
      onClick={(e) => e.target === dialogRef.current && close()}
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-black/60 backdrop:backdrop-blur-sm open:flex open:items-start open:justify-center"
    >
      <div className="mx-4 mt-[12vh] w-full max-w-xl overflow-hidden rounded-2xl border border-line-strong bg-surface-2/95 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.8)] backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="text-lg text-subtle" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            placeholder="프로젝트, 글, 섹션 검색…"
            aria-label="검색어"
            aria-controls="command-results"
            aria-activedescendant={results[active] ? `cmd-${active}` : undefined}
            className="h-14 flex-1 bg-transparent text-[15px] text-fg placeholder:text-subtle focus:outline-none"
          />
          <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-[11px] text-subtle">ESC</kbd>
        </div>

        <ul ref={listRef} id="command-results" role="listbox" className="max-h-[min(60vh,420px)] overflow-y-auto p-2">
          {results.length === 0 && <li className="px-3 py-10 text-center text-sm text-subtle">검색 결과가 없습니다.</li>}
          {results.map((item, index) => {
            const Icon = groupIcon[item.group];
            const showGroup = item.group !== lastGroup;
            lastGroup = item.group;
            return (
              <li key={`${item.group}-${item.href}`} role="presentation">
                {showGroup && (
                  <p className="px-3 pb-1.5 pt-3 font-mono text-[11px] uppercase tracking-wider text-subtle">{item.group}</p>
                )}
                <button
                  id={`cmd-${index}`}
                  role="option"
                  aria-selected={index === active}
                  data-index={index}
                  onMouseMove={() => setActive(index)}
                  onClick={() => go(item)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                    index === active ? 'bg-white/[0.07] text-fg' : 'text-muted',
                  )}
                >
                  <Icon className="shrink-0 text-base text-subtle" />
                  <span className="truncate">{item.label}</span>
                  {item.hint && <span className="ml-auto shrink-0 text-xs text-subtle">{item.hint}</span>}
                  {index === active && <ArrowRight className="shrink-0 text-accent-soft" />}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </dialog>
  );
}
