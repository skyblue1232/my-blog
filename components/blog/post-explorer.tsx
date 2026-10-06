'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import type { PostMeta } from '@/lib/posts';
import { cn } from '@/lib/utils';
import { LabBot } from '../pixel/sprites';
import { Search } from '../ui/icons';
import { PostRow } from './post-row';

type PostExplorerProps = {
  posts: PostMeta[];
  tags: [string, number][];
};

/** 아카이브: 검색어(?q=)와 태그(?tag=)로 거르고 연도별로 묶습니다. 두 값 모두 URL에 남아 공유할 수 있습니다. */
export function PostExplorer({ posts, tags }: PostExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const activeTag = searchParams.get('tag');
  const [text, setText] = useState(query);

  // 헤더 검색에서 ?q=로 들어오면 입력값도 맞춥니다.
  useEffect(() => setText(query), [query]);

  function setParam(key: 'q' | 'tag', value: string | null) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const filtered = useMemo(() => {
    const q = text.trim().toLowerCase();
    return posts.filter((post) => {
      if (activeTag && !post.tags.includes(activeTag)) return false;
      if (!q) return true;
      return `${post.title} ${post.description} ${post.tags.join(' ')} ${post.category}`.toLowerCase().includes(q);
    });
  }, [posts, activeTag, text]);

  const byYear = useMemo(() => {
    const groups = new Map<string, PostMeta[]>();
    for (const post of filtered) {
      const year = post.date.slice(0, 4);
      groups.set(year, [...(groups.get(year) ?? []), post]);
    }
    return [...groups.entries()];
  }, [filtered]);

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
        <input
          type="search"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setParam('q', e.target.value || null);
          }}
          placeholder="제목, 내용, 태그로 검색"
          aria-label="글 검색"
          className="h-11 w-full rounded-md border border-line bg-surface pl-10 pr-4 text-[15px] text-fg placeholder:text-subtle focus:border-accent-line focus:outline-none"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="태그 필터">
        {tags.map(([tag, count]) => (
          <button
            key={tag}
            type="button"
            aria-pressed={activeTag === tag}
            onClick={() => setParam('tag', activeTag === tag ? null : tag)}
            className={cn(
              'rounded border px-2 py-0.5 text-xs transition-colors',
              activeTag === tag
                ? 'border-accent-line bg-accent-soft text-accent'
                : 'border-line text-subtle hover:border-line-strong hover:text-fg',
            )}
          >
            {tag} <span className="opacity-60">{count}</span>
          </button>
        ))}
      </div>

      <p className="mt-10 font-pixel text-[11px] uppercase tracking-wider text-subtle" aria-live="polite">
        {filtered.length} posts found
      </p>

      {byYear.map(([year, list]) => (
        <section key={year} className="mt-6">
          <h2 className="border-b border-line-strong pb-2 font-pixel text-sm text-fg">{year}</h2>
          <ul>
            {list.map((post) => (
              <li key={post.slug}>
                <PostRow post={post} />
              </li>
            ))}
          </ul>
        </section>
      ))}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center py-20 text-center">
          <LabBot className="h-14 w-auto opacity-70" />
          <p className="mt-5 text-muted">조건에 맞는 글을 찾지 못했어요.</p>
          <button
            type="button"
            className="mt-3 text-sm text-accent underline underline-offset-4"
            onClick={() => {
              setText('');
              router.replace(pathname, { scroll: false });
            }}
          >
            필터 초기화
          </button>
        </div>
      )}
    </div>
  );
}
