import type { MetadataRoute } from 'next';
import { featuredProjects } from '@/content/projects';
import { site } from '@/content/site';
import { getAllPosts } from '@/lib/posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  return [
    { url: site.url, lastModified: posts[0]?.date, priority: 1 },
    { url: `${site.url}/blog`, lastModified: posts[0]?.date, priority: 0.8 },
    { url: `${site.url}/resume`, priority: 0.6 },
    ...featuredProjects.map((p) => ({ url: `${site.url}/projects/${p.slug}`, priority: 0.8 })),
    ...posts.map((post) => ({ url: `${site.url}/blog/${post.slug}`, lastModified: post.date, priority: 0.6 })),
  ];
}
