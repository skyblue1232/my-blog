import { ButtonLink } from '@/components/ui/button';
import { Container } from '@/components/ui/primitives';

export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center pt-16 text-center">
      <p className="font-mono text-sm text-accent-soft">404</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-fg sm:text-4xl">페이지를 찾을 수 없습니다</h1>
      <p className="mt-4 text-muted">주소가 바뀌었거나 삭제된 페이지일 수 있어요.</p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/">홈으로</ButtonLink>
        <ButtonLink href="/blog" variant="secondary">
          블로그 보기
        </ButtonLink>
      </div>
    </Container>
  );
}
