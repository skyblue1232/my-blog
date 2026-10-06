import Link from 'next/link';
import type { Project } from '@/content/projects';
import { ButtonLink } from '../ui/button';
import { ArrowRight, ArrowUpRight, GitHub } from '../ui/icons';
import { Tag } from '../ui/primitives';
import { SpotlightCard } from '../ui/spotlight-card';
import { MetricGrid } from './metric-grid';
import { ProjectCover } from './project-cover';

type FeaturedProjectProps = {
  project: Project;
  index: number;
};

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-subtle">{children}</p>;
}

/**
 * 홈 Featured Projects 카드.
 * Behance 갤러리처럼 와이드 커버를 위에 두고, 아래에 요약·성과(좌) / 역할·트러블슈팅·스택(우)을 배치합니다.
 */
export function FeaturedProject({ project, index }: FeaturedProjectProps) {
  return (
    <SpotlightCard className="overflow-hidden">
      <article>
        <Link href={`/projects/${project.slug}`} className="group block" aria-label={`${project.title} 케이스 스터디 보기`}>
          <ProjectCover
            cover={project.cover}
            priority={index === 0}
            sizes="(min-width: 1152px) 1088px, 100vw"
            className="aspect-[16/10] border-b border-line sm:aspect-[2/1] lg:aspect-[21/9]"
          />
        </Link>

        <div className="grid gap-10 p-6 sm:p-9 lg:grid-cols-[1fr_1.15fr] lg:gap-14 lg:p-10">
          <div className="flex flex-col gap-7">
            <header>
              <p className="flex items-center gap-3 font-mono text-xs text-subtle">
                <span className="text-accent-soft">{String(index + 1).padStart(2, '0')}</span>
                <span className="h-px w-6 bg-line-strong" />
                {project.period}
                <span className="h-px w-6 bg-line-strong" />
                {project.team}
              </p>
              <h3 className="mt-3 text-2xl font-bold tracking-[-0.025em] text-fg sm:text-[30px]">
                <Link href={`/projects/${project.slug}`} className="transition-colors hover:text-accent-fg">
                  {project.title}
                </Link>
              </h3>
              <p className="mt-1 text-[15px] font-medium text-muted">{project.subtitle}</p>
              <p className="mt-4 leading-relaxed text-muted">{project.summary}</p>
            </header>

            <MetricGrid metrics={project.metrics} />

            <div className="flex flex-wrap gap-2">
              <ButtonLink href={`/projects/${project.slug}`}>
                케이스 스터디
                <ArrowRight className="transition-transform group-hover/btn:translate-x-0.5" />
              </ButtonLink>
              {project.links.live && (
                <ButtonLink href={project.links.live} variant="secondary">
                  Live Demo <ArrowUpRight className="text-subtle" />
                </ButtonLink>
              )}
              {project.links.github && (
                <ButtonLink href={project.links.github} variant="ghost" aria-label={`${project.title} GitHub 저장소`}>
                  <GitHub /> GitHub
                </ButtonLink>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-7">
            <div>
              <Label>Role</Label>
              <p className="text-[15px] leading-relaxed text-fg/90">{project.roles.join(' · ')}</p>
            </div>

            {project.troubleshooting.length > 0 && (
              <div>
                <Label>Troubleshooting</Label>
                <ul className="divide-y divide-line rounded-xl border border-line bg-bg/30">
                  {project.troubleshooting.map((item, i) => (
                    <li key={item.title}>
                      <details className="group/ts" open={i === 0}>
                        <summary className="flex cursor-pointer list-none items-start gap-3 px-4 py-3.5 text-sm font-medium text-fg transition-colors hover:bg-white/[0.02] [&::-webkit-details-marker]:hidden">
                          <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full border border-line-strong text-[10px] leading-none text-subtle transition-transform group-open/ts:rotate-45">
                            +
                          </span>
                          {item.title}
                        </summary>
                        <div className="space-y-3 px-4 pb-4 pl-11 text-sm leading-relaxed text-muted">
                          <p>
                            <span className="mr-2 font-semibold text-rose-300/90">Problem</span>
                            {item.problem}
                          </p>
                          <div>
                            <span className="font-semibold text-accent-fg">Solution</span>
                            <ul className="mt-1.5 space-y-1">
                              {item.approach.map((step) => (
                                <li
                                  key={step}
                                  className="relative pl-3.5 before:absolute before:left-0 before:top-[0.62em] before:size-1 before:rounded-full before:bg-accent-soft/70"
                                >
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <p>
                            <span className="mr-2 font-semibold text-emerald-300/90">Result</span>
                            {item.result}
                          </p>
                        </div>
                      </details>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <Label>Tech Stack</Label>
              <div className="flex flex-wrap gap-1.5">
                {project.stack.map((tech) => (
                  <Tag key={tech}>{tech}</Tag>
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>
    </SpotlightCard>
  );
}
