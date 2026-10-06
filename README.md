# 고민균 — Frontend Engineer Portfolio & Blog

원페이지 포트폴리오 + 기술 블로그입니다. **Next.js 16 (App Router) · TypeScript · Tailwind CSS v4**로 만들었고, 모든 페이지는 빌드 시 정적으로 생성됩니다.

- 홈: Hero → About(개발 철학 · 기술 스택) → Featured Projects → Experience → Writing → Contact
- `/projects/[slug]`: Behance 프로젝트 페이지 구성을 따른 케이스 스터디 (Overview · Tools used · Troubleshooting)
- `/blog`, `/blog/[slug]`: 태그/검색 필터, 목차, 코드 하이라이팅(Shiki), 코드 복사
- `/resume`: 같은 데이터로 만든 한 장짜리 이력서 (브라우저 인쇄 → PDF 저장)
- `⌘K / Ctrl K`: 섹션 · 프로젝트 · 글 검색 팔레트
- SEO: 메타데이터, Open Graph 이미지, `sitemap.xml`, `robots.txt`, RSS(`/feed.xml`), JSON-LD

## 시작하기

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # 프로덕션 빌드
npm run typecheck
```

## 폴더 구조

```text
app/                    라우트 (layout, page, blog, projects, resume, sitemap, feed …)
components/
  layout/               SiteHeader, SiteFooter, CommandMenu
  sections/             홈 섹션 (Hero, About, Projects, Experience, Writing, Contact)
  projects/             ProjectCover, FeaturedProject, ProjectTile, MetricGrid
  blog/                 PostRow, PostExplorer, TableOfContents, CodeCopy
  ui/                   Button, Tag, SectionHeader, Reveal, SpotlightCard, CopyButton, Icons
content/
  site.ts               이름 · 연락처 · 소셜 링크 · 내비게이션
  profile.ts            개발 철학, 기술 스택, 경력/학력/수상
  projects.ts           프로젝트 · 성과 지표 · 트러블슈팅
  posts/*.md            블로그 글 (frontmatter + Markdown)
lib/                    Markdown 렌더링, 글 로더, 유틸
public/images/          프로필, 프로젝트 커버, 글 이미지
```

## 콘텐츠 수정

**글 추가** — `content/posts/<slug>.md` 파일을 만들면 목록 · 태그 · RSS · 사이트맵에 자동 반영됩니다.

```md
---
title: "글 제목"
description: "목록과 메타데이터에 쓰일 한두 문장 요약"
date: 2026-10-06
tags: ["React", "Performance"]
draft: false
---

본문은 GitHub Flavored Markdown을 지원합니다. 이미지는 `public/images/posts/`에 두고 `/images/posts/파일명`으로 참조하세요.
```

**프로젝트 추가** — `content/projects.ts`의 `projects` 배열에 항목을 추가합니다. `featured: true`면 홈 상단 카드와 케이스 스터디 페이지가 생성되고, `false`면 More Projects 그리드에 표시됩니다.

**프로필 · 링크** — `content/site.ts`, `content/profile.ts`만 수정하면 홈, 이력서, 메타데이터에 함께 반영됩니다. PDF 이력서를 쓰려면 `public/resume.pdf`를 추가하고 `site.resumeHref`를 `'/resume.pdf'`로 바꾸세요.

## 배포

Vercel에 연결되어 있으며 `vercel.json`에서 프레임워크를 `nextjs`로 지정합니다. 정적 HTML 시절의 주소(`/posts/*.html`)는 `next.config.ts`에서 `/blog/*`로 영구 리다이렉트됩니다.
