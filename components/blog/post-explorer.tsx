'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import type { PostMeta } from '@/lib/posts';
import { cn } from '@/lib/utils';
import { Search } from '../ui/icons';
import { PostRow } from './post-row';

type PostExplorerProps = {
  posts: PostMeta[];
  tags: [string, number][];
};

/** 태그(?tag=) + 키워드로 글을 필터링합니다. 태그는 URL에 반영되어 공유·뒤로가기가 가능합니다. */
export function PostExplorer({ posts, tags }: PostExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get('tag');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (activeTag && !post.tags.includes(activeTag)) return false;
      if (!q) return true;
      return `${post.title} ${post.description} ${post.tags.join(' ')}`.toLowerCase().includes(q);
    });
  }, [posts, activeTag, query]);

  function selectTag(tag: string | null) {
    const params = new URLSearchParams(searchParams);
    if (tag && tag !== activeTag) params.set('tag', tag);
    else params.delete('tag');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제목, 내용, 태그로 검색"
          aria-label="글 검색"
          className="h-12 w-full rounded-xl border border-line bg-surface pl-11 pr-4 text-[15px] text-fg placeholder:text-subtle transition-colors focus:border-accent/60 focus:outline-none"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="태그 필터">
        <TagButton active={!activeTag} onClick={() => selectTag(null)}>
          전체 <span className="text-subtle">{posts.length}</span>
        </TagButton>
        {tags.map(([tag, count]) => (
          <TagButton key={tag} active={activeTag === tag} onClick={() => selectTag(tag)}>
            {tag} <span className="text-subtle">{count}</span>
          </TagButton>
        ))}
      </div>

      <p className="mt-10 text-sm text-subtle" aria-live="polite">
        {activeTag && <span className="text-fg">#{activeTag} · </span>}
        {filtered.length}개의 글
      </p>
      <ul className="mt-2 border-t border-line">
        {filtered.map((post) => (
          <li key={post.slug}>
            <PostRow post={post} />
          </li>
        ))}
      </ul>
      {filtered.length === 0 && (
        <p className="py-20 text-center text-muted">
          조건에 맞는 글이 없습니다.{' '}
          <button
            type="button"
            className="text-accent-fg underline underline-offset-4"
            onClick={() => {
              setQuery('');
              selectTag(null);
            }}
          >
            필터 초기화
          </button>
        </p>
      )}
    </div>
  );
}

function TagButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-3 py-1 text-[13px] transition-colors',
        active
          ? 'border-accent/60 bg-accent/15 text-fg'
          : 'border-line bg-white/[0.02] text-muted hover:border-line-strong hover:text-fg',
      )}
    >
      {children}
    </button>
  );
}
