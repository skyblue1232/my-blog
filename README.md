# Tech Study Lab

공부하고, 실험하고, 기록하는 기술 블로그입니다. **Next.js 16 (App Router) · TypeScript · Tailwind CSS v4**로 만들었고, 모든 페이지는 빌드 시 정적으로 생성됩니다.

- **메인**: Featured 글 + 최신 아티클 2열 그리드
- **글 상세**: 스크롤을 따라오는 목차, 언어 라벨 · 복사 버튼이 있는 코드 블록(Shiki, 라이트/다크 대응), 관련 글, 댓글
- **헤더**: 즉시 검색(`/` 또는 `Ctrl K`), 카테고리(AI · Frontend · Backend · DevOps · Career), 다크/라이트 토글
- **Archive** (`/blog`): 검색어 · 태그 필터, 연도별 목록
- **작은 게임 요소**: 픽셀 마스코트 Lab Bot, 읽는 시간 기반 LV 배지, 끝까지 읽은 글의 CLEAR 표시와 EXP 바(브라우저에만 저장), 404 화면
- SEO: 메타데이터, OG 이미지, `sitemap.xml`, `robots.txt`, RSS(`/feed.xml`), JSON-LD

## 시작하기

```bash
npm install
npm run dev        # http://localhost:3000
npm run check      # 콘텐츠 검증 + 타입 검사
npm run build
```

## 폴더 구조

```text
app/                    라우트 (홈, /blog, /blog/[slug], /category/[slug], feed, sitemap …)
components/
  layout/               헤더(검색 · 카테고리 · 테마 토글), 푸터
  blog/                 FeaturedPost, PostCard, PostRow, 목차, 코드 복사, 댓글
  game/                 읽음 기록 스토어, LV/CLEAR 배지, EXP 바, 독서 진행 바
  pixel/                PixelSprite 렌더러와 Lab Bot · 아이콘 스프라이트
content/
  site.ts               블로그 이름 · 카테고리 · 댓글 설정
  posts/*.md            글 (frontmatter + Markdown)
lib/                    Markdown 렌더링, 글 로더
scripts/check-content.mjs  콘텐츠 하네스 검증
AGENTS.md               AI 코딩 에이전트용 하네스
```

## 글 쓰기

`content/posts/<slug>.md`를 만들면 메인 · 카테고리 · Archive · 검색 · RSS · 사이트맵에 자동 반영됩니다.

```md
---
title: "글 제목"
description: "목록과 메타데이터에 쓰일 한두 문장 요약"
date: 2026-10-07
category: frontend        # ai | frontend | backend | devops | career
tags: ["React", "Performance"]
featured: false           # true면 메인 상단 Featured 카드로 노출
---

## 본문은 ##부터

> **핵심 포인트!** 인용 블록은 콜아웃 카드로 보입니다.
```

## 댓글 켜기 (giscus)

1. 저장소 Settings → General → Features에서 **Discussions** 활성화
2. [giscus 앱](https://github.com/apps/giscus)을 이 저장소에 설치
3. [giscus.app](https://giscus.app)에서 저장소와 Discussion 카테고리를 고르고 발급된 `data-category-id`를 `content/site.ts`의 `giscus.categoryId`에 입력

설정 전에는 글 하단에 "GitHub으로 의견 남기기"(이슈 생성) 버튼이 표시됩니다.

## 배포

Vercel에 연결되어 있으며 `vercel.json`에서 프레임워크를 `nextjs`로 지정합니다. 예전 주소(`/posts/*.html`, `/projects/*`, `/resume`)는 `next.config.ts`에서 영구 리다이렉트됩니다.
