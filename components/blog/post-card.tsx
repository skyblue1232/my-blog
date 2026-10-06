import Link from 'next/link';
import { getCategory } from '@/content/site';
import type { PostMeta } from '@/lib/posts';
import { cn, formatDate } from '@/lib/utils';
import { ClearedBadge, LevelBadge } from '../game/badges';

export function CategoryLabel({ slug, className }: { slug: string; className?: string }) {
  return (
    <span className={cn('font-pixel text-[11px] uppercase tracking-wider text-accent', className)}>
      {getCategory(slug)?.label ?? slug}
    </span>
  );
}

export function PostMetaLine({ post, className }: { post: PostMeta; className?: string }) {
  return (
    <p className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-subtle', className)}>
      <time dateTime={post.date} className="font-mono tabular-nums">
        {formatDate(post.date)}
      </time>
      <span aria-hidden>·</span>
      <span>{post.readingMinutes}분 읽기</span>
    </p>
  );
}

/** 메인 2열 그리드용 아티클 카드 */
export function PostCard({ post }: { post: PostMeta }) {
  return (
    <article className="group relative flex h-full flex-col rounded-lg border border-line bg-surface p-6 transition-colors hover:border-line-strong">
      <div className="flex items-center justify-between gap-3">
        <CategoryLabel slug={post.category} />
        <div className="flex items-center gap-3">
          <ClearedBadge slug={post.slug} />
          <LevelBadge level={post.level} />
        </div>
      </div>
      <h3 className="mt-4 text-lg font-semibold leading-snug tracking-[-0.015em] text-fg">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 group-hover:text-accent">
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-2 text-[15px] leading-relaxed text-muted">{post.description}</p>
      <div className="mt-auto pt-5">
        <ul className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 3).map((tag) => (
            <li key={tag} className="rounded border border-line px-1.5 py-0.5 text-xs text-subtle">
              {tag}
            </li>
          ))}
        </ul>
        <PostMetaLine post={post} className="mt-3" />
      </div>
    </article>
  );
}

export function PostGrid({ posts }: { posts: PostMeta[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {posts.map((post) => (
        <li key={post.slug}>
          <PostCard post={post} />
        </li>
      ))}
    </ul>
  );
}
