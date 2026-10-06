import Link from 'next/link';
import type { PostMeta } from '@/lib/posts';
import { ClearedBadge } from '../game/badges';
import { LabBot, PixelStar } from '../pixel/sprites';
import { ArrowRight } from '../ui/icons';
import { CategoryLabel, PostMetaLine } from './post-card';

/** 메인 상단의 대표 기술 글. 오른쪽 패널은 퀘스트 정보창처럼 난이도와 보상(EXP)을 보여줍니다. */
export function FeaturedPost({ post }: { post: PostMeta }) {
  return (
    <article className="group relative grid overflow-hidden rounded-lg border border-line-strong bg-surface md:grid-cols-[1fr_260px]">
      <div className="p-6 sm:p-9">
        <p className="flex items-center gap-2 font-pixel text-[11px] uppercase tracking-wider text-subtle">
          <PixelStar className="h-3 w-auto" />
          Featured
          <span className="text-line-strong">/</span>
          <CategoryLabel slug={post.category} />
        </p>
        <h2 className="mt-5 text-2xl font-bold leading-[1.3] tracking-[-0.025em] text-fg sm:text-[32px]">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0 group-hover:text-accent">
            {post.title}
          </Link>
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted sm:text-[17px]">{post.description}</p>
        <ul className="mt-6 flex flex-wrap gap-1.5">
          {post.tags.slice(0, 5).map((tag) => (
            <li key={tag} className="rounded border border-line px-1.5 py-0.5 text-xs text-subtle">
              {tag}
            </li>
          ))}
        </ul>
        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
          <span className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-bg">
            읽기 시작 <ArrowRight />
          </span>
          <PostMetaLine post={post} />
          <ClearedBadge slug={post.slug} />
        </div>
      </div>

      <aside aria-hidden className="hidden flex-col justify-between border-l border-line bg-surface-2 p-6 md:flex">
        <div>
          <p className="font-pixel text-[11px] uppercase tracking-wider text-subtle">Main quest</p>
          <dl className="mt-5 space-y-3 font-pixel text-[11px] uppercase tracking-wider">
            <div className="flex justify-between">
              <dt className="text-subtle">Level</dt>
              <dd className="flex gap-0.5">
                {[1, 2, 3].map((n) => (
                  <span key={n} className={n <= post.level ? 'size-2.5 bg-accent' : 'size-2.5 bg-line-strong'} />
                ))}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-subtle">Time</dt>
              <dd className="text-fg">{post.readingMinutes} min</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-subtle">Reward</dt>
              <dd className="text-fg">+{post.readingMinutes} xp</dd>
            </div>
          </dl>
        </div>
        <LabBot className="mt-8 h-20 w-auto self-end" />
      </aside>
    </article>
  );
}
