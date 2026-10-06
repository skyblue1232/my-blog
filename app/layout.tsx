import type { Metadata, Viewport } from 'next';
import { Geist_Mono, Silkscreen } from 'next/font/google';
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { site } from '@/content/site';
import { getSearchIndex } from '@/lib/posts';
import './globals.css';

const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' });
const silkscreen = Silkscreen({ subsets: ['latin'], weight: '400', variable: '--font-silkscreen', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
  authors: [{ name: site.author }],
  openGraph: { type: 'website', locale: 'ko_KR', siteName: site.name, title: site.name, description: site.description },
  twitter: { card: 'summary_large_image' },
  alternates: {
    canonical: '/',
    types: { 'application/rss+xml': [{ url: '/feed.xml', title: site.name }] },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0d0e11' },
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
  ],
};

/** 첫 페인트 전에 저장된 테마를 적용해 깜빡임을 막습니다. 기본값은 dark입니다. */
const themeScript = `try{document.documentElement.dataset.theme=localStorage.getItem('theme')==='light'?'light':'dark'}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-theme="dark" className={`${geistMono.variable} ${silkscreen.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh">
        <SiteHeader searchIndex={getSearchIndex()} />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
