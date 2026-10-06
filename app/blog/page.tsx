import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PostExplorer } from '@/components/blog/post-explorer';
import { PostRow } from '@/components/blog/post-row';
import { Container } from '@/components/ui/primitives';
import { getAllPosts, getAllTags } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Archive',
  description: '모든 기술 아티클을 검색하고 태그로 모아 봅니다.',
  alternates: { canonical: '/blog' },
};

export default function ArchivePage() {
  const posts = getAllPosts();

  return (
    <Container className="max-w-3xl pt-12 sm:pt-16">
      <p className="font-pixel text-[11px] uppercase tracking-wider text-subtle">Archive</p>
      <h1 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-fg">모든 글</h1>
      <p className="mt-3 text-muted">검색어와 태그로 필요한 글을 찾아보세요.</p>

      <div className="mt-10">
        {/* useSearchParams를 쓰는 필터는 Suspense 안에서 렌더링하고, 폴백으로 전체 목록을 보여줍니다. */}
        <Suspense
          fallback={
            <ul className="mt-16">
              {posts.map((post) => (
                <li key={post.slug}>
                  <PostRow post={post} />
                </li>
              ))}
            </ul>
          }
        >
          <PostExplorer posts={posts} tags={getAllTags()} />
        </Suspense>
      </div>
    </Container>
  );
}
