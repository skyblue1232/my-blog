import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { cache } from 'react';
import { categories, type CategorySlug } from '@/content/site';
import { renderMarkdown } from './markdown';

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

/** 한국어 본문은 분당 약 500자, 코드는 훑어 읽는 속도(분당 약 1,200자)로 읽기 시간을 계산합니다. */
const CHARS_PER_MINUTE = 500;
const CODE_CHARS_PER_MINUTE = 1200;

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: CategorySlug;
  tags: string[];
  featured: boolean;
  readingMinutes: number;
  /** 읽는 시간으로 정한 난이도 레벨 (1~3) */
  level: 1 | 2 | 3;
};

type Frontmatter = {
  title: string;
  description: string;
  date: string | Date;
  category: string;
  tags?: string[];
  featured?: boolean;
  draft?: boolean;
};

function toISODate(value: string | Date) {
  return (value instanceof Date ? value.toISOString() : value).slice(0, 10);
}

function readingMinutes(markdown: string) {
  const code = (markdown.match(/```[\s\S]*?```/g) ?? []).join('').replace(/\s+/g, '');
  const text = markdown.replace(/```[\s\S]*?```/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, '');
  return Math.max(1, Math.round(text.length / CHARS_PER_MINUTE + code.length / CODE_CHARS_PER_MINUTE));
}

function levelOf(minutes: number): PostMeta['level'] {
  if (minutes >= 10) return 3;
  if (minutes >= 5) return 2;
  return 1;
}

function readPostFile(slug: string) {
  const raw = fs.readFileSync(path.join(POSTS_DIR, `${slug}.md`), 'utf8');
  const { data, content } = matter(raw);
  const fm = data as Frontmatter;
  const minutes = readingMinutes(content);
  const category = (categories.some((c) => c.slug === fm.category) ? fm.category : 'frontend') as CategorySlug;
  const meta: PostMeta = {
    slug,
    title: fm.title,
    description: fm.description,
    date: toISODate(fm.date),
    category,
    tags: fm.tags ?? [],
    featured: Boolean(fm.featured),
    readingMinutes: minutes,
    level: levelOf(minutes),
  };
  return { meta, content, draft: Boolean(fm.draft) };
}

/** content/posts의 모든 글을 최신순으로 반환합니다. `draft: true`인 글은 제외됩니다. */
export const getAllPosts = cache((): PostMeta[] => {
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => readPostFile(file.replace(/\.md$/, '')))
    .filter((post) => !post.draft)
    .map((post) => post.meta)
    .sort((a, b) => b.date.localeCompare(a.date));
});

export const getPost = cache(async (slug: string) => {
  if (!getAllPosts().some((p) => p.slug === slug)) return null;
  const { meta, content } = readPostFile(slug);
  const { html, headings } = await renderMarkdown(content);
  return { meta, html, headings };
});

/** `featured: true`인 글 중 가장 최신 글. 없으면 가장 최신 글. */
export function getFeaturedPost() {
  const posts = getAllPosts();
  return posts.find((p) => p.featured) ?? posts[0];
}

export function getPostsByCategory(slug: string) {
  return getAllPosts().filter((p) => p.category === slug);
}

export function getCategoryCounts() {
  const counts = new Map<string, number>();
  for (const post of getAllPosts()) counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
  return counts;
}

export function getAllTags() {
  const counts = new Map<string, number>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

/** 같은 카테고리와 겹치는 태그 수로 점수를 매겨 관련 글을 고릅니다. */
export function getRelatedPosts(slug: string, limit = 3) {
  const posts = getAllPosts();
  const current = posts.find((p) => p.slug === slug);
  if (!current) return [];
  return posts
    .filter((p) => p.slug !== slug)
    .map((p) => ({
      post: p,
      score: (p.category === current.category ? 2 : 0) + p.tags.filter((t) => current.tags.includes(t)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date))
    .slice(0, limit)
    .map((x) => x.post);
}

export function getAdjacentPosts(slug: string) {
  const posts = getAllPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  return { newer: posts[index - 1] ?? null, older: posts[index + 1] ?? null };
}

/** 클라이언트 검색용 최소 인덱스 */
export function getSearchIndex() {
  return getAllPosts().map(({ slug, title, description, tags, category, date }) => ({
    slug,
    title,
    description,
    tags,
    category,
    date,
  }));
}

export type SearchEntry = ReturnType<typeof getSearchIndex>[number];
