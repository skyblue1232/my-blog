import Link from 'next/link';
import { FeaturedPost } from '@/components/blog/featured-post';
import { PostGrid } from '@/components/blog/post-card';
import { LabProgress } from '@/components/game/lab-progress';
import { LabBot } from '@/components/pixel/sprites';
import { ArrowRight } from '@/components/ui/icons';
import { Container, SectionTitle } from '@/components/ui/primitives';
import { site } from '@/content/site';
import { getAllPosts, getFeaturedPost } from '@/lib/posts';

const LATEST_COUNT = 8;

export default function HomePage() {
  const posts = getAllPosts();
  const featured = getFeaturedPost();
  const latest = posts.filter((p) => p.slug !== featured.slug).slice(0, LATEST_COUNT);

  return (
    <Container className="pt-10 sm:pt-14">
      {/* 연구실 상태 바: 블로그 소개 한 줄 + 끝까지 읽은 글 경험치 */}
      <section className="flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-4">
          <LabBot className="h-12 w-auto" title="Lab Bot" />
          <div>
            <h1 className="font-pixel text-lg uppercase tracking-wider text-fg sm:text-xl">{site.name}</h1>
            <p className="mt-1 text-[15px] text-muted">{site.tagline}</p>
          </div>
        </div>
        <LabProgress posts={posts.map((p) => ({ slug: p.slug, minutes: p.readingMinutes }))} />
      </section>

      <section className="mt-10" aria-label="대표 글">
        <FeaturedPost post={featured} />
      </section>

      <section className="mt-16" aria-labelledby="latest">
        <SectionTitle
          action={
            <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-subtle hover:text-fg">
              전체 {posts.length}개 <ArrowRight />
            </Link>
          }
        >
          <span id="latest">Latest articles</span>
        </SectionTitle>
        <PostGrid posts={latest} />
      </section>
    </Container>
  );
}
