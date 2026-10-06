import Link from 'next/link';
import { site } from '@/content/site';
import { ButtonLink } from '../ui/button';
import { CopyButton } from '../ui/copy-button';
import { ArrowUpRight, FileText, GitHub, LinkedIn, Mail } from '../ui/icons';
import { Container, Eyebrow, Section } from '../ui/primitives';
import { Reveal } from '../ui/reveal';

const channels = [
  { label: 'GitHub', handle: '@skyblue1232', href: site.socials.github, Icon: GitHub },
  { label: 'Tech Blog', handle: '기술 아티클 모음', href: site.socials.blog, Icon: FileText },
  { label: 'LinkedIn', handle: '고민균', href: site.socials.linkedin, Icon: LinkedIn },
];

export function Contact() {
  return (
    <Section id="contact" className="border-t border-line">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-line bg-surface px-6 py-14 sm:px-14 sm:py-20">
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="bg-grid absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_60%_80%_at_100%_0%,#000,transparent)]" />
              <div className="absolute -right-24 -top-24 size-96 rounded-full bg-accent/20 blur-[100px]" />
            </div>

            <div className="relative grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-end">
              <div>
                <Eyebrow>05 — Contact</Eyebrow>
                <h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.03em] text-fg sm:text-5xl">
                  함께 문제를 풀
                  <br />
                  팀을 찾고 있습니다.
                </h2>
                <p className="mt-5 max-w-md leading-relaxed text-muted">
                  채용, 협업, 프로젝트 관련 이야기라면 언제든 편하게 연락 주세요.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    href={`mailto:${site.email}`}
                    className="group flex h-12 items-center gap-3 rounded-full border border-line-strong bg-bg/60 pl-5 pr-4 font-mono text-[15px] text-fg transition-colors hover:border-accent/60"
                  >
                    <Mail className="text-accent-soft" />
                    {site.email}
                    <ArrowUpRight className="text-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                  <CopyButton value={site.email} label="이메일 복사" copiedLabel="복사되었어요" className="h-12 justify-center" />
                </div>
              </div>

              <ul className="divide-y divide-line rounded-2xl border border-line bg-bg/40">
                {channels.map(({ label, handle, href, Icon }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.03]"
                    >
                      <span className="grid size-10 place-items-center rounded-xl border border-line bg-surface-2 text-lg text-fg">
                        <Icon />
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-fg">{label}</span>
                        <span className="block text-xs text-subtle">{handle}</span>
                      </span>
                      <ArrowUpRight className="ml-auto text-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <div className="mt-10 flex justify-center">
          <ButtonLink href={site.resumeHref} variant="ghost">
            <FileText /> 한 장짜리 이력서로 보기
          </ButtonLink>
        </div>
      </Container>
    </Section>
  );
}
