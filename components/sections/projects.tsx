import { featuredProjects, otherProjects } from '@/content/projects';
import { FeaturedProject } from '../projects/featured-project';
import { ProjectTile } from '../projects/project-tile';
import { Container, Section, SectionHeader } from '../ui/primitives';
import { Reveal } from '../ui/reveal';

export function Projects() {
  return (
    <Section id="projects" className="border-t border-line">
      <Container>
        <SectionHeader
          index="02"
          label="Featured Projects"
          title="문제를 정의하고, 구조로 풀어낸 프로젝트"
          description="각 프로젝트의 수치는 저장소의 커밋·PR·README 기록에서 확인할 수 있는 값입니다. 카드를 펼치면 주요 트러블슈팅을, 케이스 스터디에서 전체 과정을 볼 수 있습니다."
        />

        <div className="flex flex-col gap-8">
          {featuredProjects.map((project, i) => (
            <Reveal key={project.slug}>
              <FeaturedProject project={project} index={i} />
            </Reveal>
          ))}
        </div>

        {otherProjects.length > 0 && (
          <Reveal className="mt-24">
            <h3 className="mb-8 text-lg font-semibold text-fg">More Projects</h3>
            <div className="grid gap-x-8 gap-y-12 md:grid-cols-2">
              {otherProjects.map((project) => (
                <ProjectTile key={project.slug} project={project} />
              ))}
            </div>
          </Reveal>
        )}
      </Container>
    </Section>
  );
}
