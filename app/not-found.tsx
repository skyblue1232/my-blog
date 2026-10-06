import Link from 'next/link';
import { LabBotBroken } from '@/components/pixel/sprites';
import { Container } from '@/components/ui/primitives';

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <LabBotBroken className="h-20 w-auto" title="고장 난 Lab Bot" />
      <p className="mt-8 font-pixel text-sm uppercase tracking-widest text-subtle">Error 404</p>
      <h1 className="mt-3 font-pixel text-2xl uppercase tracking-wider text-fg">Page not found</h1>
      <p className="mt-4 text-muted">주소가 바뀌었거나 아직 쓰지 않은 글이에요.</p>
      <div className="mt-8 flex items-center gap-3 font-pixel text-xs uppercase tracking-wider">
        <span className="text-subtle">Continue?</span>
        <Link href="/" className="rounded-md bg-accent px-3 py-2 text-bg">
          ▶ Home
        </Link>
        <Link href="/blog" className="rounded-md border border-line-strong px-3 py-2 text-fg">
          Archive
        </Link>
      </div>
    </Container>
  );
}
