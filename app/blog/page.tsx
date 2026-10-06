import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PostExplorer } from '@/components/blog/post-explorer';
import { PostRow } from '@/components/blog/post-row';
import { Container, Eyebrow } from '@/components/ui/primitives';
import { getAllPosts, getAllTags } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Blog',
  description: '프로젝트에서 마주한 문제와 설계 결정, 프론트엔드 기본기를 정리한 기술 블로그입니다.',
  alternates: { canonical: '/blog' },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const tags = getAllTags();

  return (
    <Container className="max-w-4xl pb-28 pt-32 sm:pt-40">
      <Eyebrow>Blog</Eyebrow>
      <h1 className="mt-4 text-4xl font-bold tracking-[-0.035em] text-fg sm:text-5xl">기술 아티클</h1>
      <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-muted">
        프로젝트에서 마주한 문제와 설계 결정, 그리고 프론트엔드 기본기를 기록합니다.
      </p>

      <div className="mt-12">
        {/* useSearchParams를 쓰는 필터는 Suspense 경계 안에서 렌더링하고, 폴백으로 전체 목록을 보여줍니다. */}
        <Suspense
          fallback={
            <ul className="border-t border-line">
              {posts.map((post) => (
                <li key={post.slug}>
                  <PostRow post={post} />
                </li>
              ))}
            </ul>
          }
        >
          <PostExplorer posts={posts} tags={tags} />
        </Suspense>
      </div>
    </Container>
  );
}
