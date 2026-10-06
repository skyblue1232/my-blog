import { site } from '@/content/site';
import { getAllPosts } from '@/lib/posts';

export const dynamic = 'force-static';

function escape(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function GET() {
  const items = getAllPosts()
    .map(
      (post) => `
    <item>
      <title>${escape(post.title)}</title>
      <link>${site.url}/blog/${post.slug}</link>
      <guid>${site.url}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escape(post.description)}</description>
      ${post.tags.map((t) => `<category>${escape(t)}</category>`).join('')}
    </item>`,
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escape(`${site.name} 기술 블로그`)}</title>
    <link>${site.url}/blog</link>
    <description>${escape(site.description)}</description>
    <language>ko</language>${items}
  </channel>
</rss>`;

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
