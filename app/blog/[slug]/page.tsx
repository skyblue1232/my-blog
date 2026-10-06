import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CodeCopy } from '@/components/blog/code-copy';
import { Comments } from '@/components/blog/comments';
import { CategoryLabel, PostCard, PostMetaLine } from '@/components/blog/post-card';
import { MobileToc, TableOfContents } from '@/components/blog/table-of-contents';
import { ClearedBadge, LevelBadge } from '@/components/game/badges';
import { ReadingProgress } from '@/components/game/reading-progress';
import { ArrowLeft, ArrowRight } from '@/components/ui/icons';
import { Container } from '@/components/ui/primitives';
import { getCategory, site } from '@/content/site';
import { getAdjacentPosts, getAllPosts, getPost, getRelatedPosts } from '@/lib/posts';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getAllPosts().find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: { type: 'article', title: post.title, description: post.description, publishedTime: post.date, tags: post.tags },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const { meta, html, headings } = post;
  const { newer, older } = getAdjacentPosts(slug);
  const related = getRelatedPosts(slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: meta.title,
    description: meta.description,
    datePublished: meta.date,
    keywords: meta.tags.join(', '),
    author: { '@type': 'Person', name: site.author },
  };

  return (
    <>
      <ReadingProgress slug={slug} minutes={meta.readingMinutes} targetId="post-body" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Container className="pt-10 sm:pt-14">
        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_220px] xl:gap-16">
          <div className="mx-auto w-full min-w-0 max-w-[720px] xl:mx-0 xl:max-w-none">
            <nav aria-label="경로" className="flex items-center gap-2 text-[13px] text-subtle">
              <Link href="/" className="hover:text-fg">
                Home
              </Link>
              <span aria-hidden>/</span>
              <Link href={`/category/${meta.category}`} className="hover:text-fg">
                {getCategory(meta.category)?.label}
              </Link>
            </nav>

            <header className="mt-6 border-b border-line pb-8">
              <div className="flex items-center gap-4">
                <CategoryLabel slug={meta.category} />
                <LevelBadge level={meta.level} />
                <ClearedBadge slug={slug} />
              </div>
              <h1 className="mt-4 text-[28px] font-bold leading-[1.3] tracking-[-0.03em] text-fg sm:text-[38px]">
                {meta.title}
              </h1>
              <p className="mt-4 text-[17px] leading-relaxed text-muted">{meta.description}</p>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <PostMetaLine post={meta} />
                <ul className="flex flex-wrap gap-1.5">
                  {meta.tags.map((tag) => (
                    <li key={tag}>
                      <Link
                        href={`/blog?tag=${encodeURIComponent(tag)}`}
                        className="rounded border border-line px-1.5 py-0.5 text-xs text-subtle hover:border-line-strong hover:text-fg"
                      >
                        {tag}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </header>

            <div className="mt-8">
              <MobileToc headings={headings} />
            </div>

            <article id="post-body" className="article mt-8 max-w-[720px]" dangerouslySetInnerHTML={{ __html: html }} />
            <CodeCopy containerId="post-body" />

            <div className="mt-16 flex items-center gap-3 border-y border-line py-4 font-pixel text-[11px] uppercase tracking-wider text-subtle">
              <span className="size-2 bg-accent" aria-hidden />
              End of article
              <span className="font-sans text-xs normal-case tracking-normal">· 끝까지 읽으면</span>
              <span className="text-fg">+{meta.readingMinutes} xp</span>
            </div>

            <nav aria-label="이전/다음 글" className="mt-10 grid gap-3 sm:grid-cols-2">
              {older ? (
                <Link href={`/blog/${older.slug}`} className="group rounded-lg border border-line p-4 hover:border-line-strong">
                  <p className="flex items-center gap-1.5 text-xs text-subtle">
                    <ArrowLeft /> 이전 글
                  </p>
                  <p className="mt-1.5 text-sm font-medium leading-snug text-fg group-hover:text-accent">{older.title}</p>
                </Link>
              ) : (
                <span className="hidden sm:block" />
              )}
              {newer && (
                <Link
                  href={`/blog/${newer.slug}`}
                  className="group rounded-lg border border-line p-4 text-right hover:border-line-strong"
                >
                  <p className="flex items-center justify-end gap-1.5 text-xs text-subtle">
                    다음 글 <ArrowRight />
                  </p>
                  <p className="mt-1.5 text-sm font-medium leading-snug text-fg group-hover:text-accent">{newer.title}</p>
                </Link>
              )}
            </nav>

            {related.length > 0 && (
              <section aria-labelledby="related" className="mt-16">
                <h2 id="related" className="font-pixel text-xs uppercase tracking-wider text-subtle">
                  Related posts
                </h2>
                <ul className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {related.map((p) => (
                    <li key={p.slug}>
                      <PostCard post={p} />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <Comments slug={slug} title={meta.title} />
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-32">
              <TableOfContents headings={headings} />
            </div>
          </aside>
        </div>
      </Container>
    </>
  );
}
