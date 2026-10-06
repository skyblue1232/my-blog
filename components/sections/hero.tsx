import Image from 'next/image';
import { projects } from '@/content/projects';
import { site } from '@/content/site';
import { ButtonLink } from '../ui/button';
import { ArrowRight, FileText, GitHub, MapPin } from '../ui/icons';
import { Container } from '../ui/primitives';

type HeroProps = {
  postCount: number;
};

export function Hero({ postCount }: HeroProps) {
  const stats = [
    { value: `${projects.length}`, label: '팀/개인 프로젝트' },
    { value: `${postCount}`, label: '기술 아티클' },
    { value: '36/250', label: 'SSAFY AI Challenge' },
  ];

  return (
    <section className="relative overflow-hidden pb-8 pt-32 sm:pb-12 sm:pt-40">
      {/* 배경: 그리드 + 인디고 글로우 */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_40%,transparent_100%)]" />
        <div className="absolute left-1/2 top-[-18rem] h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-accent/25 blur-[140px]" />
        <div className="absolute right-[-10rem] top-40 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[110px]" />
      </div>

      <Container className="grid items-center gap-14 lg:grid-cols-[1fr_380px] lg:gap-16">
        <div className="animate-fade-up">
          <p className="inline-flex items-center gap-2.5 rounded-full border border-line bg-white/[0.03] py-1 pl-2.5 pr-3.5 text-[13px] text-muted backdrop-blur">
            <span className="size-2 animate-pulse-dot rounded-full bg-success" />
            {site.availability}
          </p>

          <p className="mt-8 font-mono text-sm tracking-wide text-accent-soft">{site.role}</p>
          <h1 className="mt-3 text-display font-bold text-fg">
            {site.headline[0]}
            <br />
            <span className="text-gradient">{site.headline[1]}</span>
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted sm:text-lg">{site.tagline}</p>

          <div className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href={site.resumeHref} size="lg">
              <FileText />
              이력서 보기
            </ButtonLink>
            <ButtonLink href={site.socials.github} variant="secondary" size="lg">
              <GitHub />
              GitHub
            </ButtonLink>
            <ButtonLink href="/#contact" variant="ghost" size="lg">
              Contact
              <ArrowRight className="transition-transform group-hover/btn:translate-x-0.5" />
            </ButtonLink>
          </div>

          <dl className="mt-14 flex max-w-md divide-x divide-line">
            {stats.map((s) => (
              <div key={s.label} className="flex-1 px-5 first:pl-0">
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-2xl font-bold tracking-tight text-fg tabular-nums sm:text-3xl">{s.value}</dd>
                <dd className="mt-1 text-xs text-subtle sm:text-[13px]">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <ProfileCard />
      </Container>
    </section>
  );
}

/** Behance 프로필 사이드바를 참고한 요약 카드 */
function ProfileCard() {
  const rows = [
    { k: 'Focus', v: 'Monorepo · Design System · Server State' },
    { k: 'Stack', v: 'Next.js · TypeScript · TanStack Query' },
    { k: 'Now', v: 'SSAFY 16기 Java Track' },
  ];

  return (
    <div className="relative mx-auto w-full max-w-sm animate-fade-up [animation-delay:150ms] lg:max-w-none">
      <div aria-hidden className="absolute -inset-px rounded-[22px] bg-gradient-to-b from-white/20 via-white/5 to-transparent" />
      <div className="relative rounded-[21px] bg-surface/90 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Image
            src="/images/profile.jpg"
            alt={`${site.name} 프로필 사진`}
            width={64}
            height={64}
            priority
            className="size-16 rounded-2xl object-cover ring-1 ring-white/15"
          />
          <div>
            <p className="text-lg font-semibold text-fg">
              {site.name} <span className="ml-1 text-sm font-normal text-subtle">{site.nameEn}</span>
            </p>
            <p className="text-sm text-muted">{site.role}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-subtle">
              <MapPin /> {site.location}
            </p>
          </div>
        </div>

        <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
          {rows.map((r) => (
            <div key={r.k} className="grid grid-cols-[56px_1fr] gap-3">
              <dt className="font-mono text-xs leading-5 text-subtle">{r.k}</dt>
              <dd className="leading-5 text-fg/90">{r.v}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 rounded-xl border border-line bg-bg/60 p-4 font-mono text-[12.5px] leading-6">
          <p className="text-subtle">
            <span className="text-accent-soft">const</span> <span className="text-fg">principle</span> = {'{'}
          </p>
          <p className="pl-4 text-muted">
            problem: <span className="text-emerald-300/90">&apos;끝까지 원인 추적&apos;</span>,
          </p>
          <p className="pl-4 text-muted">
            solution: <span className="text-emerald-300/90">&apos;재사용 가능한 구조&apos;</span>,
          </p>
          <p className="text-subtle">{'}'};</p>
        </div>
      </div>
    </div>
  );
}
