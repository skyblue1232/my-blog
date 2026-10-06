import { timeline, type TimelineItem } from '@/content/profile';
import { cn } from '@/lib/utils';
import { Container, Section, SectionHeader } from '../ui/primitives';
import { Reveal } from '../ui/reveal';

const kindLabel: Record<TimelineItem['kind'], string> = {
  education: 'Education',
  training: 'Training',
  award: 'Award',
};

const kindStyle: Record<TimelineItem['kind'], string> = {
  education: 'border-sky-400/25 bg-sky-400/10 text-sky-200',
  training: 'border-accent/30 bg-accent/10 text-accent-fg',
  award: 'border-amber-300/25 bg-amber-300/10 text-amber-200',
};

export function Experience() {
  return (
    <Section id="experience" className="border-t border-line">
      <Container>
        <SectionHeader index="03" label="Experience & Education" title="배우고, 만들고, 인정받은 기록" />

        <ol className="relative">
          {timeline.map((item, i) => (
            <Reveal as="li" key={item.title} delay={i * 60} className="group grid gap-2 border-t border-line py-7 md:grid-cols-[180px_1fr_auto] md:gap-10">
              <p className="font-mono text-sm text-subtle">{item.period}</p>
              <div>
                <h3 className="text-lg font-semibold text-fg">{item.title}</h3>
                <p className="mt-0.5 text-sm text-muted">{item.org}</p>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{item.description}</p>
              </div>
              <span
                className={cn(
                  'h-fit w-fit rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider',
                  kindStyle[item.kind],
                )}
              >
                {kindLabel[item.kind]}
              </span>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
