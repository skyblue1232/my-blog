# Tech Study Lab Agent Guide

AI 코딩 에이전트(Claude Code, Copilot, Codex 등)가 이 저장소에서 작업할 때 따르는 하네스입니다.
규칙은 **Global → Domain → Local → Workflow** 순서로 좁아지며, 아래 계층이 위 계층을 어기지 않습니다.

## 1. Global — 모든 작업의 불변조건

- 이 저장소는 **기술 블로그**입니다. 자기소개 · 학력 · 수상 · 이력서 같은 포트폴리오 요소를 화면에 넣지 않습니다.
- 프레임워크: Next.js 16 App Router · React 19 · TypeScript · Tailwind CSS v4. 모든 페이지는 빌드 시 정적 생성합니다.
- 디자인 원칙: 모노톤 + 차분한 인디고 포인트, 넓은 여백, 타이포그래피 중심. 격자 배경 · 글로우 · 과한 애니메이션을 쓰지 않습니다.
- 픽셀 · 게임 요소는 **양념**입니다. 마스코트(Lab Bot), LV 배지, CLEAR 표시, EXP 바, 404 정도로 제한하고 본문 가독성을 해치지 않습니다.
- 색은 `app/globals.css`의 테마 토큰(`--bg`, `--fg`, `--accent` …)만 씁니다. 라이트/다크 양쪽에서 확인합니다.
- 새 라이브러리는 기존 스택으로 해결이 어려운 명확한 이유가 있을 때만 추가합니다.
- 기존 URL을 바꾸면 `next.config.ts`의 `redirects()`에 영구 리다이렉트를 추가합니다.

## 2. Domain — 글 작성 규칙

- 글은 "내가 어떻게 공부하고, 고민하고, 트러블슈팅하고, 회고했는가"가 드러나게 씁니다.
- 수치는 저장소 기록(커밋 · PR · README), 발표 자료, 직접 측정으로 근거를 댈 수 있는 값만 씁니다.
- 다른 실습의 지표를 다른 프로젝트의 성과로 옮겨 쓰지 않습니다. 측정하지 않은 개선율("속도 n% 향상")을 만들지 않습니다.
- 팀 작업은 팀 작업으로 씁니다. 개인 단독 성과처럼 표현하지 않습니다.
- 카테고리는 `content/site.ts`의 `categories`(ai · frontend · backend · devops · career) 중 하나입니다.

## 3. Local — 경로별 작성 규칙

| 경로 | 규칙 |
| --- | --- |
| `content/posts/*.md` | frontmatter `title` · `description` · `date(YYYY-MM-DD)` · `category` · `tags[]` 필수, 대표 글만 `featured: true`. 본문은 `##`부터 시작합니다. 강조 콜아웃은 `> **라벨!** 내용` 형식을 씁니다. |
| `public/images/posts/<주제>/` | 사진은 WebP(가로 1440~2000px), 다이어그램은 다크 톤 SVG(라이트 테마에서는 CSS가 자동 반전). alt를 반드시 씁니다. |
| `content/site.ts` | 블로그 이름 · 카테고리 · giscus 설정의 단일 출처입니다. |
| `components/pixel/*` | 픽셀 아트는 `PixelSprite`의 문자열 행렬로만 그립니다. 색은 `--px-*` 토큰을 씁니다. |
| `components/game/*` | 읽음 기록은 브라우저 `localStorage`(`lab:cleared`)에만 둡니다. 실패해도 화면이 깨지지 않아야 합니다. |
| `components/blog/*` | 글 목록 · 상세 UI. 데이터는 `lib/posts.ts`에서 받습니다. |
| `lib/markdown.ts` | 파이프라인 순서(remark → rehype-raw → slug → TOC 수집 → pretty-code → enhance)를 유지합니다. 코드 블록 헤더와 복사 버튼은 여기서 렌더링합니다. |

## 4. Workflow — 반복 작업 절차

### 새 글 쓰기
1. `content/posts/<slug>.md` 생성 → frontmatter 작성 (`category` 필수)
2. 이미지는 `public/images/posts/<주제>/`에 저장
3. `npm run check` → `npm run build`
4. 라이트/다크 두 테마에서 본문 · 코드 블록 · 이미지를 확인

### UI 수정
1. 바꾸지 않을 것(URL, frontmatter 형식, 테마 토큰 이름)을 먼저 적기
2. 한 번에 한 컴포넌트 계층만 수정
3. 데스크톱 1440px · 모바일 390px, 라이트 · 다크에서 확인

### 리뷰
- 수정 파일, 사용자에게 보이는 변화, 검증 결과를 함께 요약합니다.

## 5. Verification

```bash
npm run check      # 콘텐츠 검증(frontmatter · 카테고리 · 이미지 경로 · featured) + 타입 검사
npm run build      # 정적 생성까지 포함한 최종 확인
```

존재하지 않는 테스트 명령을 가정하지 않습니다.
