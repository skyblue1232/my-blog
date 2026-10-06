import Link from 'next/link';
import { site } from '@/content/site';
import { Container } from '../ui/primitives';
import { GitHub, LinkedIn, Mail, Rss } from '../ui/icons';

const socials = [
  { href: site.socials.github, label: 'GitHub', Icon: GitHub },
  { href: site.socials.linkedin, label: 'LinkedIn', Icon: LinkedIn },
  { href: `mailto:${site.email}`, label: 'Email', Icon: Mail },
  { href: '/feed.xml', label: 'RSS', Icon: Rss },
];

export function SiteFooter() {
  return (
    <footer className="no-print border-t border-line">
      <Container className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-subtle">
          <p>
            © {new Date().getFullYear()} {site.name} · {site.nameEn}
          </p>
          <p className="mt-1">Next.js · Tailwind CSS로 만들고 Vercel에 배포했습니다.</p>
        </div>
        <ul className="flex items-center gap-1">
          {socials.map(({ href, label, Icon }) => (
            <li key={label}>
              <Link
                href={href}
                aria-label={label}
                {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="grid size-9 place-items-center rounded-full text-lg text-subtle transition-colors hover:bg-white/[0.06] hover:text-fg"
              >
                <Icon />
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </footer>
  );
}
