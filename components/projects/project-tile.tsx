import Link from 'next/link';
import type { Project } from '@/content/projects';
import { isExternal } from '@/lib/utils';
import { ArrowUpRight } from '../ui/icons';
import { ProjectCover } from './project-cover';

/** Behance 갤러리 그리드 스타일의 보조 프로젝트 카드. 회고 글이 있으면 글로, 없으면 서비스로 연결합니다. */
export function ProjectTile({ project }: { project: Project }) {
  const post = project.relatedPosts?.[0];
  const href = post ? `/blog/${post}` : (project.links.live ?? project.links.github ?? '#');
  return (
    <Link
      href={href}
      {...(isExternal(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="group block"
    >
      <ProjectCover
        cover={project.cover}
        className="aspect-[16/10] rounded-2xl border border-line"
        sizes="(min-width: 768px) 540px, 100vw"
      />
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-fg transition-colors group-hover:text-accent-fg">
            {project.title}
            <span className="ml-2 text-sm font-normal text-subtle">{project.subtitle}</span>
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{project.summary}</p>
          <p className="mt-2 font-mono text-xs text-subtle">{project.stack.slice(0, 4).join(' · ')}</p>
        </div>
        <ArrowUpRight className="mt-1 shrink-0 text-lg text-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
      </div>
    </Link>
  );
}
