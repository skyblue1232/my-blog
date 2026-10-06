export type Principle = {
  title: string;
  description: string;
};

export type SkillGroup = {
  category: string;
  caption: string;
  items: string[];
};

export type TimelineItem = {
  period: string;
  title: string;
  org: string;
  description: string;
  kind: 'education' | 'training' | 'award' | 'competition';
  /** 관련 글이나 결과 링크 */
  href?: string;
};

export const principles: Principle[] = [
  {
    title: 'Reusable Structure',
    description:
      '반복되는 UI와 설정은 공통 패키지와 Storybook으로 정리해, 다음 기능이 더 적은 코드로 만들어지게 합니다.',
  },
  {
    title: 'State & Data Flow',
    description:
      'TanStack Query 팩토리와 Zustand로 서버 상태와 화면 상태의 경계를 나누고, 캐시 규칙을 도메인 단위로 설계합니다.',
  },
  {
    title: 'Performance',
    description:
      'S3 · CloudFront 기반 전달 구조와 로딩 전략을 개선해, 네트워크 환경과 무관하게 일정한 경험을 목표로 합니다.',
  },
  {
    title: 'Team Contribution',
    description:
      '요구사항·우선순위·작업 기준을 문서와 컨벤션으로 정리해, 팀이 같은 방향으로 빠르게 움직일 수 있는 상태를 만듭니다.',
  },
];

export const skillGroups: SkillGroup[] = [
  {
    category: 'Frontend',
    caption: '주력 · 실서비스 경험',
    items: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'PWA'],
  },
  {
    category: 'State & Data',
    caption: '서버/클라이언트 상태',
    items: ['TanStack Query', 'Zustand', 'React Hook Form', 'Zod', 'Axios'],
  },
  {
    category: 'Architecture',
    caption: '구조 · 개발 환경',
    items: ['Turborepo', 'pnpm Workspace', 'Storybook', 'Design System', 'Vite'],
  },
  {
    category: 'API & Realtime',
    caption: '백엔드 협업 영역',
    items: ['REST API 연동', 'JWT 토큰 재발급', 'OAuth 2.0', 'WebSocket (STOMP)', 'FCM'],
  },
  {
    category: 'DevOps & Infra',
    caption: '배포 · 전달',
    items: ['AWS S3', 'CloudFront', 'ACM', 'Vercel', 'GitHub Actions'],
  },
  {
    category: 'Collaboration',
    caption: '협업 · 도구',
    items: ['Git / GitHub Flow', 'Figma', 'Notion', 'AI Agent Workflow'],
  },
];

export const timeline: TimelineItem[] = [
  {
    period: '2026.09',
    title: 'SSAFY AI Challenge 250팀 중 36위',
    org: 'SSAFY 내부 대회 · 팀 민균단',
    description:
      '이미지 기반 객관식 VQA에서 Qwen3.5-35B-A3B LoRA, 정답 토큰 목표 정렬, Holdout 검증, 제한된 블렌딩으로 Private Accuracy 0.97408을 기록했습니다.',
    kind: 'competition',
    href: '/blog/ssafy-ai-challenge-retrospective',
  },
  {
    period: '2026.06 — 현재',
    title: 'SSAFY 16기 Java Track',
    org: '삼성 청년 SW·AI 아카데미 · 서울 11반',
    description:
      'Java · 알고리즘 · SQL과 함께 생성형 AI · RAG · Agent를 학습하며 Soulrip(팀장)과 윷토피아를 개발했습니다.',
    kind: 'training',
  },
  {
    period: '2022.03 — 2026.08',
    title: '컴퓨터정보공학 학사 졸업',
    org: '가톨릭대학교 컴퓨터정보공학부',
    description: '택시 동승 매칭(CATXI), 대학가 마감 할인(Compasser)처럼 학교 주변의 문제를 서비스로 풀어보는 프로젝트를 이어왔습니다.',
    kind: 'education',
  },
  {
    period: '2025',
    title: '전공역량 경진대회 최우수상 (팀)',
    org: '가톨릭대학교 · 글다',
    description: '부천시 모바일 스탬프 투어 · AI 코스 추천 플랫폼 「글다」로 팀 수상했습니다.',
    kind: 'award',
  },
  {
    period: '2024',
    title: 'GGUM 해커톤 최우수상 (팀)',
    org: 'EGG',
    description: '대학생 졸업 요건 · 학점 관리 서비스 「EGG」로 팀 수상했습니다.',
    kind: 'award',
  },
];
