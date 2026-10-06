import Link from 'next/link';
import { site } from '@/content/site';
import { LabBot } from '../pixel/sprites';
import { GitHub, Rss } from '../ui/icons';

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <LabBot className="h-6 w-auto opacity-80" />
          <div>
            <p className="font-pixel text-[11px] uppercase tracking-wider text-fg">{site.name}</p>
            <p className="mt-0.5 text-xs text-subtle">{site.tagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-subtle">
          <Link href="/feed.xml" className="inline-flex items-center gap-1.5 hover:text-fg">
            <Rss /> RSS
          </Link>
          <Link href={site.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-fg">
            <GitHub /> GitHub
          </Link>
          <span className="text-xs">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
