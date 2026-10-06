import type { MetadataRoute } from 'next';
import { categories, site } from '@/content/site';
import { getAllPosts } from '@/lib/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  return [
    { url: site.url, lastModified: posts[0]?.date, priority: 1 },
    { url: `${site.url}/blog`, lastModified: posts[0]?.date, priority: 0.7 },
    ...categories.map((c) => ({ url: `${site.url}/category/${c.slug}`, priority: 0.6 })),
    ...posts.map((post) => ({ url: `${site.url}/blog/${post.slug}`, lastModified: post.date, priority: 0.8 })),
  ];
}
