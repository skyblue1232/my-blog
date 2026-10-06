import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CodeCopy } from '@/components/blog/code-copy';
import { TableOfContents } from '@/components/blog/table-of-contents';
import { ArrowLeft, ArrowRight } from '@/components/ui/icons';
import { Container, Tag } from '@/components/ui/primitives';
import { projects } from '@/content/projects';
import { site } from '@/content/site';
import { getAdjacentPosts, getAllPosts, getPost } from '@/lib/posts';
import { formatDate } from '@/lib/utils';

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
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      authors: [site.name],
      tags: post.tags,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const { meta, html, headings } = post;
  const { newer, older } = getAdjacentPosts(slug);
  const relatedProject = projects.find((p) => p.relatedPosts?.includes(slug) && p.featured);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: meta.title,
    description: meta.description,
    datePublished: meta.date,
    author: { '@type': 'Person', name: site.name, url: site.url },
    keywords: meta.tags.join(', '),
  };

  return (
    <Container className="pb-24 pt-28 sm:pt-36">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <div className="mx-auto max-w-3xl xl:max-w-none">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-subtle transition-colors hover:text-fg">
          <ArrowLeft /> 모든 글
        </Link>

        <header className="mt-8 max-w-3xl border-b border-line pb-10">
          <div className="flex flex-wrap gap-1.5">
            {meta.tags.map((tag) => (
              <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                <Tag className="transition-colors hover:border-line-strong hover:text-fg">#{tag}</Tag>
              </Link>
            ))}
          </div>
          <h1 className="mt-5 text-3xl font-bold leading-[1.25] tracking-[-0.03em] text-fg sm:text-[42px]">{meta.title}</h1>
          <p className="mt-5 text-[17px] leading-relaxed text-muted">{meta.description}</p>
          <p className="mt-6 flex items-center gap-3 text-sm text-subtle">
            <span className="font-medium text-fg/90">{site.name}</span>
            <span aria-hidden>·</span>
            <time dateTime={meta.date}>{formatDate(meta.date)}</time>
            <span aria-hidden>·</span>
            <span>{meta.readingMinutes}분 읽기</span>
          </p>
        </header>

        <div className="mt-12 xl:grid xl:grid-cols-[minmax(0,48rem)_220px] xl:justify-between xl:gap-16">
          <div className="min-w-0">
            <article id="post-body" className="article" dangerouslySetInnerHTML={{ __html: html }} />
            <CodeCopy containerId="post-body" />

            {relatedProject && (
              <Link
                href={`/projects/${relatedProject.slug}`}
                className="group mt-16 flex items-center justify-between gap-6 rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-line-strong"
              >
                <div>
                  <p className="font-mono text-xs uppercase tracking-wider text-accent-soft">Related Project</p>
                  <p className="mt-2 font-semibold text-fg">{relatedProject.title}</p>
                  <p className="mt-1 text-sm text-muted">{relatedProject.subtitle}</p>
                </div>
                <ArrowRight className="shrink-0 text-subtle transition-transform group-hover:translate-x-1 group-hover:text-fg" />
              </Link>
            )}

            <nav aria-label="이전/다음 글" className="mt-16 grid gap-4 border-t border-line pt-10 sm:grid-cols-2">
              {older ? (
                <Link href={`/blog/${older.slug}`} className="group rounded-xl border border-line p-5 transition-colors hover:border-line-strong">
                  <p className="flex items-center gap-1.5 text-xs text-subtle">
                    <ArrowLeft /> 이전 글
                  </p>
                  <p className="mt-2 font-medium leading-snug text-fg group-hover:text-accent-fg">{older.title}</p>
                </Link>
              ) : (
                <span />
              )}
              {newer && (
                <Link
                  href={`/blog/${newer.slug}`}
                  className="group rounded-xl border border-line p-5 text-right transition-colors hover:border-line-strong"
                >
                  <p className="flex items-center justify-end gap-1.5 text-xs text-subtle">
                    다음 글 <ArrowRight />
                  </p>
                  <p className="mt-2 font-medium leading-snug text-fg group-hover:text-accent-fg">{newer.title}</p>
                </Link>
              )}
            </nav>
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-28">
              <TableOfContents headings={headings} />
            </div>
          </aside>
        </div>
      </div>
    </Container>
  );
}
