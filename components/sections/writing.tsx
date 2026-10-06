import type { PostMeta } from '@/lib/posts';
import { PostRow } from '../blog/post-row';
import { ButtonLink } from '../ui/button';
import { ArrowRight } from '../ui/icons';
import { Container, Section, SectionHeader } from '../ui/primitives';
import { Reveal } from '../ui/reveal';

export function Writing({ posts, total }: { posts: PostMeta[]; total: number }) {
  return (
    <Section id="writing" className="border-t border-line">
      <Container>
        <SectionHeader
          index="04"
          label="Writing"
          title="문제를 풀며 정리한 글"
          description="프로젝트에서 마주한 문제와 설계 결정을 기록합니다."
          action={
            <ButtonLink href="/blog" variant="secondary">
              전체 글 {total}개 <ArrowRight />
            </ButtonLink>
          }
        />
        <Reveal>
          <ul className="border-t border-line">
            {posts.map((post) => (
              <li key={post.slug}>
                <PostRow post={post} />
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </Section>
  );
}
