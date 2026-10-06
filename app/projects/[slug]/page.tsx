import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PostRow } from '@/components/blog/post-row';
import { MetricGrid } from '@/components/projects/metric-grid';
import { ProjectCover } from '@/components/projects/project-cover';
import { ButtonLink } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, ArrowUpRight, GitHub } from '@/components/ui/icons';
import { Container, Eyebrow, Tag } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/reveal';
import { featuredProjects, getProject } from '@/content/projects';
import { getAllPosts } from '@/lib/posts';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return featuredProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: `${project.title} — Case Study`,
    description: project.summary,
    alternates: { canonical: `/projects/${slug}` },
  };
}

/** Behance 프로젝트 페이지 구성을 따른 케이스 스터디: 커버 → 개요 사이드바 → 문제 해결 → 관련 글 */
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project || !project.featured) notFound();

  const index = featuredProjects.findIndex((p) => p.slug === slug);
  const next = featuredProjects[(index + 1) % featuredProjects.length];
  const posts = getAllPosts().filter((post) => project.relatedPosts?.includes(post.slug));

  const facts = [
    { k: 'Period', v: project.period },
    { k: 'Team', v: project.team },
    { k: 'Role', v: project.roles.join(', ') },
  ];

  return (
    <div className="pb-24 pt-28 sm:pt-36">
      <Container>
        <Link href="/#projects" className="inline-flex items-center gap-2 text-sm text-subtle transition-colors hover:text-fg">
          <ArrowLeft /> 모든 프로젝트
        </Link>

        <header className="mt-8 max-w-3xl animate-fade-up">
          <Eyebrow>Case Study · {String(index + 1).padStart(2, '0')}</Eyebrow>
          <h1 className="mt-4 text-4xl font-bold tracking-[-0.035em] text-fg sm:text-6xl">{project.title}</h1>
          <p className="mt-3 text-lg font-medium text-muted sm:text-xl">{project.subtitle}</p>
        </header>

        <ProjectCover
          cover={project.cover}
          priority
          sizes="(min-width: 1152px) 1088px, 100vw"
          className="mt-12 aspect-[16/9] animate-fade-up rounded-3xl border border-line [animation-delay:120ms]"
        />

        <div className="mt-16 grid gap-14 lg:grid-cols-[300px_1fr] lg:gap-20">
          {/* 개요 사이드바 (Behance의 'Tools used' 패널) */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <dl className="space-y-5 text-sm">
              {facts.map((f) => (
                <div key={f.k}>
                  <dt className="font-mono text-xs uppercase tracking-wider text-subtle">{f.k}</dt>
                  <dd className="mt-1.5 leading-relaxed text-fg/90">{f.v}</dd>
                </div>
              ))}
              <div>
                <dt className="font-mono text-xs uppercase tracking-wider text-subtle">Tools used</dt>
                <dd className="mt-2.5 flex flex-wrap gap-1.5">
                  {project.stack.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-2 border-t border-line pt-6">
              {project.links.live && (
                <ButtonLink href={project.links.live} size="sm">
                  Live Demo <ArrowUpRight />
                </ButtonLink>
              )}
              {project.links.github && (
                <ButtonLink href={project.links.github} variant="secondary" size="sm">
                  <GitHub /> GitHub
                </ButtonLink>
              )}
            </div>
          </aside>

          <div className="min-w-0 max-w-3xl">
            <section aria-labelledby="overview">
              <h2 id="overview" className="text-2xl font-bold tracking-tight text-fg">
                Overview
              </h2>
              <div className="mt-5 space-y-4 text-[17px] leading-[1.85] text-muted">
                {project.overview.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <MetricGrid metrics={project.metrics} className="mt-10 sm:grid-cols-4" />
            </section>

            <section aria-labelledby="troubleshooting" className="mt-20">
              <h2 id="troubleshooting" className="text-2xl font-bold tracking-tight text-fg">
                Troubleshooting
              </h2>
              <ol className="mt-8 space-y-6">
                {project.troubleshooting.map((t, i) => (
                  <Reveal as="li" key={t.title}>
                    <article className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
                      <p className="font-mono text-xs text-accent-soft">Issue {String(i + 1).padStart(2, '0')}</p>
                      <h3 className="mt-2 text-xl font-semibold leading-snug text-fg">{t.title}</h3>

                      <div className="mt-6 grid gap-6 text-[15px] leading-relaxed">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-rose-300/90">Problem</p>
                          <p className="mt-2 text-muted">{t.problem}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-accent-fg">Approach</p>
                          <ol className="mt-2 space-y-2">
                            {t.approach.map((step, j) => (
                              <li key={step} className="flex gap-3 text-muted">
                                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full border border-line-strong font-mono text-[10px] text-subtle">
                                  {j + 1}
                                </span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                        <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.05] p-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300/90">Result</p>
                          <p className="mt-2 text-fg/90">{t.result}</p>
                        </div>
                      </div>

                      {t.reference && (
                        <Link
                          href={t.reference.href}
                          {...(t.reference.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                          className="mt-6 inline-flex items-center gap-1.5 text-sm text-subtle transition-colors hover:text-fg"
                        >
                          근거: {t.reference.label} <ArrowUpRight />
                        </Link>
                      )}
                    </article>
                  </Reveal>
                ))}
              </ol>
            </section>

            {posts.length > 0 && (
              <section aria-labelledby="related" className="mt-20">
                <h2 id="related" className="text-2xl font-bold tracking-tight text-fg">
                  관련 글
                </h2>
                <ul className="mt-6 border-t border-line">
                  {posts.map((post) => (
                    <li key={post.slug}>
                      <PostRow post={post} />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>

        {next && next.slug !== project.slug && (
          <Link
            href={`/projects/${next.slug}`}
            className="group mt-24 grid items-center gap-6 rounded-3xl border border-line bg-surface p-6 transition-colors hover:border-line-strong sm:grid-cols-[1fr_280px] sm:p-8"
          >
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-subtle">Next Project</p>
              <p className="mt-3 text-2xl font-bold tracking-tight text-fg sm:text-3xl">{next.title}</p>
              <p className="mt-1 text-muted">{next.subtitle}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm text-accent-fg">
                케이스 스터디 보기 <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </span>
            </div>
            <ProjectCover cover={next.cover} sizes="280px" className="aspect-[16/10] rounded-xl border border-line" />
          </Link>
        )}
      </Container>
    </div>
  );
}
