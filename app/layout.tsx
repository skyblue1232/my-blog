import type { Metadata, Viewport } from 'next';
import { Geist_Mono } from 'next/font/google';
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import { CommandMenu, type CommandItem } from '@/components/layout/command-menu';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { projects } from '@/content/projects';
import { navItems, site } from '@/content/site';
import { getAllPosts } from '@/lib/posts';
import './globals.css';

const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
  authors: [{ name: site.name, url: site.url }],
  keywords: ['프론트엔드', 'Frontend Engineer', 'React', 'Next.js', 'TypeScript', '포트폴리오', '기술 블로그', site.name],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    siteName: `${site.name} · ${site.role}`,
    title: `${site.name} — ${site.role}`,
    description: site.description,
  },
  twitter: { card: 'summary_large_image' },
  alternates: {
    canonical: '/',
    types: { 'application/rss+xml': [{ url: '/feed.xml', title: `${site.name} 기술 블로그` }] },
  },
};

export const viewport: Viewport = {
  themeColor: '#0b0f19',
  colorScheme: 'dark',
};

function buildCommandItems(): CommandItem[] {
  return [
    ...navItems.map((n) => ({ group: 'Navigate' as const, label: n.label, href: n.href })),
    { group: 'Navigate', label: '이력서', hint: 'Resume', href: site.resumeHref },
    ...projects.map((p) => ({
      group: 'Projects' as const,
      label: p.title,
      hint: p.subtitle,
      href: p.featured ? `/projects/${p.slug}` : (p.links.live ?? p.links.github ?? '/#projects'),
      keywords: p.stack.join(' '),
    })),
    ...getAllPosts().map((post) => ({
      group: 'Posts' as const,
      label: post.title,
      hint: post.date.slice(0, 7).replace('-', '.'),
      href: `/blog/${post.slug}`,
      keywords: post.tags.join(' '),
    })),
    { group: 'Links', label: 'GitHub', hint: '@skyblue1232', href: site.socials.github },
    { group: 'Links', label: 'LinkedIn', href: site.socials.linkedin },
    { group: 'Links', label: '이메일 보내기', hint: site.email, href: `mailto:${site.email}` },
  ];
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={geistMono.variable}>
      <body className="min-h-dvh">
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <CommandMenu items={buildCommandItems()} />
      </body>
    </html>
  );
}
