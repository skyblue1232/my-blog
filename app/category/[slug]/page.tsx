import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostGrid } from '@/components/blog/post-card';
import { LabBot } from '@/components/pixel/sprites';
import { Container } from '@/components/ui/primitives';
import { categories, getCategory } from '@/content/site';
import { getPostsByCategory } from '@/lib/posts';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = getCategory((await params).slug);
  if (!category) return {};
  return {
    title: category.label,
    description: `${category.label} — ${category.description}`,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  const posts = getPostsByCategory(slug);

  return (
    <Container className="pt-12 sm:pt-16">
      <header className="border-b border-line pb-8">
        <p className="font-pixel text-[11px] uppercase tracking-wider text-subtle">Category · {posts.length} posts</p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-fg">{category.label}</h1>
        <p className="mt-2 text-muted">{category.description}</p>
      </header>

      <div className="mt-10">
        {posts.length > 0 ? (
          <PostGrid posts={posts} />
        ) : (
          <div className="flex flex-col items-center rounded-lg border border-dashed border-line-strong py-20 text-center">
            <LabBot className="h-14 w-auto opacity-70" />
            <p className="mt-5 font-pixel text-xs uppercase tracking-wider text-subtle">Coming soon</p>
            <p className="mt-2 text-muted">이 카테고리의 글을 준비하고 있어요.</p>
          </div>
        )}
      </div>
    </Container>
  );
}
