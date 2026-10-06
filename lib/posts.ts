import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { cache } from 'react';
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
  tags: string[];
  readingMinutes: number;
};

type Frontmatter = {
  title: string;
  description: string;
  date: string | Date;
  tags?: string[];
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

function readPostFile(slug: string) {
  const raw = fs.readFileSync(path.join(POSTS_DIR, `${slug}.md`), 'utf8');
  const { data, content } = matter(raw);
  const fm = data as Frontmatter;
  const meta: PostMeta = {
    slug,
    title: fm.title,
    description: fm.description,
    date: toISODate(fm.date),
    tags: fm.tags ?? [],
    readingMinutes: readingMinutes(content),
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

export function getAllTags() {
  const counts = new Map<string, number>();
  for (const post of getAllPosts()) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export function getAdjacentPosts(slug: string) {
  const posts = getAllPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  return { newer: posts[index - 1] ?? null, older: posts[index + 1] ?? null };
}
