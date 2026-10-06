import Image from 'next/image';
import type { ProjectCover as Cover } from '@/content/projects';
import { cn } from '@/lib/utils';

type ProjectCoverProps = {
  cover: Cover;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

/**
 * Behance 썸네일처럼 커버를 고정 비율 프레임에 담습니다.
 * - image: 서비스 대표 이미지를 object-cover로 채움
 * - device: 모바일 화면 캡처를 그라디언트 배경 위 단말 프레임에 배치
 */
export function ProjectCover({ cover, className, priority, sizes = '(min-width: 1024px) 560px, 100vw' }: ProjectCoverProps) {
  return (
    <div className={cn('relative overflow-hidden bg-surface-2', className)}>
      {cover.kind === 'image' ? (
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          style={{ objectPosition: cover.position ?? 'center' }}
        />
      ) : (
        <div className="absolute inset-0" style={{ background: cover.background }}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgb(255_255_255/0.22),transparent_55%)]" />
          <div className="absolute left-1/2 top-[12%] w-[min(34%,230px)] min-w-[120px] -translate-x-1/2 rounded-[1.6rem] border-[5px] border-[#14151c] bg-[#14151c] shadow-[0_40px_80px_-20px_rgb(0_0_0/0.6)] transition-transform duration-700 ease-out group-hover:-translate-y-2">
            <div className="relative aspect-[390/844] overflow-hidden rounded-[1.25rem]">
              <Image src={cover.src} alt={cover.alt} fill priority={priority} sizes="240px" className="object-cover object-top" />
            </div>
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10" />
    </div>
  );
}
