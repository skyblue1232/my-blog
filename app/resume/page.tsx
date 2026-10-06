import type { Metadata } from 'next';
import Link from 'next/link';
import { PrintButton } from '@/components/resume/print-button';
import { ArrowLeft } from '@/components/ui/icons';
import { skillGroups, timeline } from '@/content/profile';
import { featuredProjects } from '@/content/projects';
import { site } from '@/content/site';

export const metadata: Metadata = {
  title: 'Resume',
  description: `${site.name} — ${site.role} 이력서`,
  alternates: { canonical: '/resume' },
};

/**
 * 포트폴리오와 같은 데이터(content/*)로 만드는 한 장짜리 이력서.
 * 화면에서는 종이 카드로 보이고, 인쇄(PDF 저장) 시에는 A4 흑백 레이아웃으로 출력됩니다.
 */
export default function ResumePage() {
  return (
    <div className="px-4 pb-24 pt-24 sm:pt-32 print:p-0">
      <div className="no-print mx-auto mb-6 flex max-w-[820px] items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-subtle hover:text-fg">
          <ArrowLeft /> 포트폴리오로
        </Link>
        <PrintButton />
      </div>

      <article className="mx-auto max-w-[820px] rounded-2xl bg-white px-7 py-10 text-[13.5px] leading-relaxed text-neutral-700 shadow-[0_40px_120px_-40px_rgb(99_102_241/0.45)] sm:px-14 sm:py-14 print:max-w-none print:rounded-none print:p-0 print:shadow-none">
        <header className="flex flex-col gap-4 border-b border-neutral-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-950">
              {site.name} <span className="text-lg font-medium text-neutral-400">{site.nameEn}</span>
            </h1>
            <p className="mt-1 text-[15px] font-semibold text-indigo-600">{site.role}</p>
          </div>
          <ul className="space-y-0.5 text-[12.5px] text-neutral-500 sm:text-right">
            <li>{site.email}</li>
            <li>github.com/skyblue1232</li>
            <li>{site.url.replace('https://', '')}</li>
          </ul>
        </header>

        <ResumeSection title="Summary">
          <p>{site.tagline}</p>
        </ResumeSection>

        <ResumeSection title="Projects">
          <div className="space-y-6">
            {featuredProjects.map((p) => (
              <div key={p.slug} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="text-[15px] font-bold text-neutral-950">
                    {p.title} <span className="font-medium text-neutral-500">— {p.subtitle}</span>
                  </h3>
                  <span className="font-mono text-xs text-neutral-400">{p.period}</span>
                </div>
                <p className="mt-0.5 text-xs text-neutral-500">
                  {p.team} · {p.roles.join(', ')}
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-4 marker:text-neutral-300">
                  {p.troubleshooting.map((t) => (
                    <li key={t.title}>
                      <span className="font-semibold text-neutral-800">{t.title}</span> — {t.result}
                    </li>
                  ))}
                  <li>
                    {p.metrics
                      .slice(0, 2)
                      .map((m) => `${m.label} ${m.value}`)
                      .join(' · ')}
                  </li>
                </ul>
                <p className="mt-1.5 font-mono text-[11px] text-neutral-400">{p.stack.join(' · ')}</p>
              </div>
            ))}
          </div>
        </ResumeSection>

        <ResumeSection title="Skills">
          <dl className="grid gap-1.5">
            {skillGroups.map((g) => (
              <div key={g.category} className="grid grid-cols-[120px_1fr] gap-3">
                <dt className="font-semibold text-neutral-800">{g.category}</dt>
                <dd>{g.items.join(', ')}</dd>
              </div>
            ))}
          </dl>
        </ResumeSection>

        <ResumeSection title="Experience · Education · Awards">
          <ul className="space-y-2">
            {timeline.map((t) => (
              <li key={t.title} className="grid grid-cols-[120px_1fr] gap-3">
                <span className="font-mono text-xs leading-6 text-neutral-400">{t.period}</span>
                <span>
                  <span className="font-semibold text-neutral-800">{t.title}</span> · {t.org}
                </span>
              </li>
            ))}
          </ul>
        </ResumeSection>
      </article>
    </div>
  );
}

function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-7 break-inside-avoid-page">
      <h2 className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">{title}</h2>
      {children}
    </section>
  );
}
