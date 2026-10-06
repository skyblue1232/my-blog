import Link from 'next/link';
import type { PostMeta } from '@/lib/posts';
import { formatDate } from '@/lib/utils';
import { ArrowRight } from '../ui/icons';

/** Vercel 블로그 목록처럼 날짜 · 제목 · 태그를 한 줄에 정렬한 행 */
export function PostRow({ post }: { post: PostMeta }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid gap-2 border-b border-line py-6 transition-colors md:grid-cols-[120px_1fr_auto] md:items-baseline md:gap-8"
    >
      <time dateTime={post.date} className="font-mono text-sm text-subtle tabular-nums">
        {formatDate(post.date)}
      </time>
      <div className="min-w-0">
        <h3 className="text-[17px] font-semibold leading-snug text-fg transition-colors group-hover:text-accent-fg">
          {post.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{post.description}</p>
        <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-subtle">
          {post.tags.slice(0, 4).map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
          <span className="text-subtle/70">· {post.readingMinutes}분</span>
        </p>
      </div>
      <ArrowRight className="hidden text-subtle transition-transform group-hover:translate-x-1 group-hover:text-fg md:block" />
    </Link>
  );
}
