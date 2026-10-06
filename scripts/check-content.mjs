// 콘텐츠 하네스 검증: frontmatter, 카테고리, 이미지 경로, featured 글을 확인합니다.
// 실행: npm run check
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const root = process.cwd();
const postsDir = path.join(root, 'content', 'posts');
const publicDir = path.join(root, 'public');
const errors = [];
const report = (file, message) => errors.push(`${path.relative(root, file)}: ${message}`);

const siteSrc = fs.readFileSync(path.join(root, 'content', 'site.ts'), 'utf8');
const categorySlugs = new Set([...siteSrc.matchAll(/slug: '([a-z-]+)'/g)].map((m) => m[1]));
let featuredCount = 0;

const slugs = new Set();
const titles = new Map();

for (const name of fs.readdirSync(postsDir).filter((f) => f.endsWith('.md'))) {
  const file = path.join(postsDir, name);
  const { data, content } = matter(fs.readFileSync(file, 'utf8'));
  slugs.add(name.replace(/\.md$/, ''));

  if (!data.title) report(file, 'frontmatter에 title이 없습니다');
  if (!data.description) report(file, 'frontmatter에 description이 없습니다');
  const date = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date ?? '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) report(file, `date는 YYYY-MM-DD 형식이어야 합니다 (현재: ${date || '없음'})`);
  if (!Array.isArray(data.tags) || data.tags.length === 0) report(file, 'tags 배열이 비어 있습니다');
  if (!categorySlugs.has(data.category)) report(file, `category는 ${[...categorySlugs].join(' | ')} 중 하나여야 합니다 (현재: ${data.category ?? '없음'})`);
  if (data.featured) featuredCount++;
  if (titles.has(data.title)) report(file, `제목이 ${titles.get(data.title)}와 중복됩니다`);
  titles.set(data.title, name);

  if (/^# /m.test(content.replace(/```[\s\S]*?```/g, ''))) report(file, '본문에 # 제목이 있습니다. ##부터 시작하세요');

  const imageRefs = [
    ...content.matchAll(/!\[([^\]]*)\]\((\/[^)\s]+)\)/g),
    ...[...content.matchAll(/<img\s[^>]*src="(\/[^"]+)"[^>]*>/g)].map((m) => [m[0], /alt="([^"]*)"/.exec(m[0])?.[1] ?? '', m[1]]),
  ];
  for (const [, alt, src] of imageRefs) {
    if (!fs.existsSync(path.join(publicDir, decodeURIComponent(src)))) report(file, `이미지가 없습니다: ${src}`);
    if (!alt.trim()) report(file, `이미지 alt가 비어 있습니다: ${src}`);
  }
}

if (featuredCount === 0) errors.push('content/posts: featured: true인 글이 없습니다 (가장 최신 글이 대신 노출됩니다)');

if (errors.length) {
  console.error(`콘텐츠 검증 실패 (${errors.length}건)\n` + errors.map((e) => `  - ${e}`).join('\n'));
  process.exit(1);
}
console.log(`콘텐츠 검증 통과 · 글 ${slugs.size}개`);
