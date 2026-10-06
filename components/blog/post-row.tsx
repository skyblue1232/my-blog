import Link from 'next/link';
import type { PostMeta } from '@/lib/posts';
import { formatDate } from '@/lib/utils';
import { ClearedBadge, LevelBadge } from '../game/badges';
import { CategoryLabel } from './post-card';

/** 아카이브용 한 줄 행: 날짜 · 카테고리 · 제목 · 레벨 */
export function PostRow({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1 border-b border-line py-4 sm:grid-cols-[96px_84px_1fr_auto]"
    >
      <time dateTime={post.date} className="font-mono text-[13px] tabular-nums text-subtle">
        {formatDate(post.date).slice(5)}
      </time>
      <CategoryLabel slug={post.category} className="hidden sm:block" />
      <span className="col-span-2 text-[15px] font-medium leading-snug text-fg group-hover:text-accent sm:col-span-1">
        {post.title}
      </span>
      <span className="hidden items-center gap-3 sm:flex">
        <ClearedBadge slug={post.slug} />
        <LevelBadge level={post.level} />
      </span>
    </Link>
  );
}
