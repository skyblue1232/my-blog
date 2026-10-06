import { principles, skillGroups } from '@/content/profile';
import { Container, Section, SectionHeader, Tag } from '../ui/primitives';
import { Reveal } from '../ui/reveal';
import { SpotlightCard } from '../ui/spotlight-card';

export function About() {
  return (
    <Section id="about">
      <Container>
        <SectionHeader
          index="01"
          label="About"
          title={
            <>
              화면 너머의 구조까지
              <br className="hidden sm:block" /> 책임지는 개발자
            </>
          }
          description="문제를 단순히 해결하는 데서 멈추지 않고, 같은 문제가 다시 생기지 않는 구조를 만듭니다. 팀원 모두가 같은 기준으로 개발할 수 있을 때 제품이 가장 빠르게 성장한다고 믿습니다."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {principles.map((p, i) => (
            <Reveal key={p.title} delay={i * 70}>
              <SpotlightCard className="h-full p-6">
                <p className="font-mono text-xs text-subtle">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-6 font-semibold text-fg">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.description}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-20">
          <div className="flex items-baseline justify-between gap-4 border-b border-line pb-4">
            <h3 className="text-lg font-semibold text-fg">Tech Stack</h3>
            <p className="text-sm text-subtle">프로젝트에서 실제로 사용한 기술만 적었습니다.</p>
          </div>
          <dl className="divide-y divide-line">
            {skillGroups.map((group) => (
              <div key={group.category} className="grid gap-3 py-5 md:grid-cols-[220px_1fr] md:gap-8">
                <dt>
                  <p className="font-medium text-fg">{group.category}</p>
                  <p className="mt-0.5 text-xs text-subtle">{group.caption}</p>
                </dt>
                <dd className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <Tag key={item} className="px-2.5 py-1 text-[13px] text-fg/85">
                      {item}
                    </Tag>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </Section>
  );
}
