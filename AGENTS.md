# my-blog Agent Guide

AI 코딩 에이전트(Claude Code, Copilot, Codex 등)가 이 저장소에서 작업할 때 따르는 하네스입니다.
규칙은 **Global → Domain → Local → Workflow** 순서로 좁아지며, 아래 계층이 위 계층을 어기지 않습니다.

## 1. Global — 모든 작업의 불변조건

- 프레임워크: Next.js 16 App Router · React 19 · TypeScript · Tailwind CSS v4. 모든 페이지는 빌드 시 정적 생성합니다.
- 새 라이브러리는 기존 스택으로 해결이 어려운 명확한 이유가 있을 때만 추가합니다.
- 콘텐츠(글 · 프로젝트 · 프로필)는 `content/`에만 둡니다. 컴포넌트에 문구나 수치를 하드코딩하지 않습니다.
- 디자인 토큰은 `app/globals.css`의 `@theme`에만 정의합니다. 임의의 hex 색을 새로 만들지 않습니다.
- 기존 URL을 바꾸면 `next.config.ts`의 `redirects()`에 영구 리다이렉트를 추가합니다.
- 비밀값을 커밋하지 않습니다. 이 저장소는 런타임 비밀값이 필요 없습니다.

## 2. Domain — 콘텐츠 사실성 규칙

이 사이트는 채용 담당자가 읽는 포트폴리오입니다. **사실이 아닌 문장은 디자인보다 큰 결함**으로 취급합니다.

- 수치는 저장소 기록(커밋 · PR · README), 발표 자료, 본인 확인으로 근거를 댈 수 있는 값만 씁니다. 근거가 없으면 수치 대신 정성적으로 씁니다.
- 팀 성과를 개인 단독 성과로 쓰지 않습니다. 수상은 "팀 성과"임을 유지합니다.
- 백엔드 · 인프라 숙련도를 과장하지 않습니다. Spring은 기초 실습, FastAPI는 프로젝트 사용 수준입니다.
- 다른 실습의 지표를 다른 프로젝트의 성과로 옮겨 쓰지 않습니다. (예: 기업 보고서 RAG 실습 수치 ≠ Soulrip 성과)
- 측정하지 않은 개선율("속도 n% 향상")을 만들지 않습니다.
- 확인이 필요한 값은 `content/*.ts`에 `// TODO(verify): 이유` 주석을 남기고 사람에게 알립니다.

## 3. Local — 경로별 작성 규칙

| 경로 | 규칙 |
| --- | --- |
| `content/posts/*.md` | frontmatter `title` · `description` · `date(YYYY-MM-DD)` · `tags[]` 필수. 본문은 `##`부터 시작(`#` 금지). 이미지는 글 전용 폴더 `public/images/posts/<주제>/`에 두고 alt를 반드시 씁니다. 강조 콜아웃은 `> **라벨!** 내용` 형식을 씁니다. |
| `content/projects.ts` | `metrics`는 근거가 있는 값만. `relatedPosts`의 slug는 실제 글 파일과 일치해야 합니다. `featured: true`면 케이스 스터디 페이지가 생성됩니다. |
| `content/profile.ts` · `content/site.ts` | 이력 · 연락처 · 링크의 단일 출처입니다. 홈 · 이력서 · 메타데이터에 함께 반영되므로 영향 범위를 확인합니다. |
| `components/ui/*` | 도메인을 모르는 범용 컴포넌트만 둡니다. `content/`를 import하지 않습니다. |
| `components/sections/*` | 홈 섹션 하나당 파일 하나. 데이터는 `content/`에서 가져옵니다. |
| `lib/markdown.ts` | unified 파이프라인 순서(remark → rehype-raw → slug → TOC 수집 → pretty-code → enhance)를 유지합니다. |
| `public/images/**` | 사진은 WebP로 압축(가로 1440~2000px), 다이어그램은 SVG. 원본 대용량 PNG를 그대로 커밋하지 않습니다. |

## 4. Workflow — 반복 작업 절차

### 새 글 쓰기
1. `content/posts/<slug>.md` 생성 → frontmatter 작성
2. 이미지는 `public/images/posts/<주제>/`에 저장 (사진은 WebP, 다이어그램은 SVG)
3. 관련 프로젝트가 있으면 `content/projects.ts`의 `relatedPosts`에 slug 추가
4. `npm run check` → `npm run build`

### 프로젝트 · 이력 수정
1. 바꿀 사실의 근거(저장소 링크, PR, 문서)를 먼저 확인
2. `content/*.ts`만 수정하고 컴포넌트는 건드리지 않음
3. 홈, `/projects/[slug]`, `/resume` 세 곳에서 반영 결과 확인

### 리팩토링
1. 바꾸지 않을 것(URL, 콘텐츠 데이터 형식, 디자인 토큰)을 먼저 적기
2. 한 번에 한 계층만 수정
3. 변경 전후 `npm run build`의 라우트 목록이 같은지 확인

### 리뷰
- 변경 결과를 보고할 때 수정 파일, 사용자에게 보이는 변화, 사실 근거, 검증 결과를 함께 요약합니다.

## 5. Verification

```bash
npm run check      # 콘텐츠 검증(frontmatter · 이미지 경로 · relatedPosts) + 타입 검사
npm run build      # 정적 생성까지 포함한 최종 확인
```

존재하지 않는 테스트 명령을 가정하지 않습니다. UI 변경은 `npm run build && npm start` 후 데스크톱과 390px 너비에서 직접 확인합니다.
