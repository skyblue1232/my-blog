/**
 * 포트폴리오 프로젝트 데이터.
 * 케이스 스터디 구성은 Behance의 프로젝트 페이지 관례를 따릅니다:
 * Cover → Overview(Role / Period / Team / Tools) → Problem → Troubleshooting → Outcome.
 * 수치는 저장소 기록(커밋·PR·README)에서 확인 가능한 값만 사용합니다.
 */

export type ProjectCover =
  | { kind: 'image'; src: string; alt: string; position?: string }
  | { kind: 'device'; src: string; alt: string; background: string };

export type Metric = { value: string; label: string };

export type Troubleshooting = {
  title: string;
  problem: string;
  approach: string[];
  result: string;
  /** 근거가 되는 PR/문서 링크 */
  reference?: { label: string; href: string };
};

export type Project = {
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  period: string;
  team: string;
  roles: string[];
  stack: string[];
  cover: ProjectCover;
  links: { live?: string; github?: string };
  metrics: Metric[];
  overview: string[];
  troubleshooting: Troubleshooting[];
  relatedPosts?: string[];
  featured: boolean;
};

export const projects: Project[] = [
  {
    slug: 'compasser',
    title: 'Compasser',
    subtitle: '대학교 주변 마감 할인 랜덤박스 플랫폼',
    summary:
      '고객용·점주용 두 앱을 하나의 Turborepo 모노레포로 설계하고, UI·API·설정을 공통 패키지로 분리해 앱별 반복 구현을 약 50% 줄인 프론트엔드 1인 개발 프로젝트.',
    period: '2026.01 — 2026.08',
    team: 'FE 1 · BE 3 · Design 1',
    roles: ['프론트엔드 1인 개발', '모노레포 아키텍처 설계', '디자인 시스템 구축', '배포'],
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'TanStack Query', 'Zustand', 'Turborepo', 'pnpm', 'Storybook', 'Vercel'],
    cover: { kind: 'image', src: '/images/projects/compasser.webp', alt: 'Compasser 고객용 앱 화면', position: '70% 50%' },
    links: { live: 'https://compasser-customer.vercel.app', github: 'https://github.com/CUK-Compasser/FE' },
    metrics: [
      { value: '~50%', label: '앱별 반복 구현 축소' },
      { value: '2 + 4', label: '앱 · 공통 패키지' },
      { value: '237', label: '커밋 (FE 전체의 99%)' },
      { value: '67', label: 'Pull Requests' },
    ],
    overview: [
      'Compasser는 사용자가 주변 카페를 탐색하고 랜덤박스를 구매한 뒤, 매장에서 QR로 상품을 확인하고 스탬프를 적립하는 서비스입니다.',
      '서비스 이용 주체에 따라 고객용 앱과 점주용 앱을 분리하되, 두 앱에서 반복되는 UI·API·설정은 공통 패키지로 관리하도록 설계했습니다. 설계부터 기능 구현, API 연동, 배포까지 프론트엔드 전 과정을 혼자 담당했습니다.',
    ],
    troubleshooting: [
      {
        title: '두 앱에 흩어진 UI와 설정을 디자인 시스템으로 통합',
        problem:
          '고객용·점주용 앱이 같은 버튼·카드·모달을 각자 구현하고, Tailwind·TypeScript·ESLint 설정도 앱마다 따로 관리되어 작은 UI 수정도 두 곳을 고쳐야 했습니다.',
        approach: [
          'packages/design-system으로 공통 컴포넌트를 분리하고 Storybook으로 상태별 UI를 독립 검증',
          '아이콘 생성·export를 자동화해 이름 규칙과 import 방식을 통일',
          'tailwind-config(디자인 토큰)·typescript-config를 내부 패키지로 분리하고 Turbo로 빌드 파이프라인 일원화',
        ],
        result: 'UI·API·설정 패키지 통합으로 앱별 반복 구현 범위를 약 50% 축소하고, 새 앱이 추가돼도 패키지만 조합하면 되는 구조를 확보했습니다.',
        reference: { label: '설계 과정 글', href: '/blog/monorepo-design-system' },
      },
      {
        title: '화면마다 달랐던 서버 상태 규칙을 Query Factory로 단일화',
        problem:
          'queryKey가 화면 단위로 임의 생성되고, mutation 이후 캐시 갱신(refetch·invalidate)이 페이지마다 달라 같은 데이터를 다른 화면에서 다르게 보여주는 불일치가 반복됐습니다.',
        approach: [
          'packages/api에 public/private axios 인스턴스, 토큰 자동 주입, 401 시 refresh 재요청을 공통화',
          '도메인마다 keys → requests → queries → mutations → invalidate 레이어를 갖는 팩토리 구조 도입',
          'queryKey를 ["stores", "detail", id]처럼 도메인 prefix 계층으로 통일하고, mutation 후 set / invalidate / remove를 선언형 helper로 처리',
        ],
        result: '컴포넌트는 정의된 query·mutation을 조합만 하도록 바뀌어, 화면 코드에서 데이터 요청·캐시 로직이 빠지고 캐시 무효화 범위를 예측할 수 있게 됐습니다.',
        reference: { label: '설계 과정 글', href: '/blog/query-factory' },
      },
    ],
    relatedPosts: ['monorepo-design-system', 'query-factory'],
    featured: true,
  },
  {
    slug: 'loopy',
    title: 'LOOPy',
    subtitle: '동네 카페를 위한 디지털 스탬프 · 리워드 PWA',
    summary:
      "종이 스탬프를 디지털로 통합해 '우연한 방문'을 '단골 루틴'으로 바꾸는 서비스. 고객 앱(PWA)과 사장님 웹을 함께 만들며 팀 커밋의 76%를 담당했습니다.",
    period: '2025.06 — 2026.02',
    team: 'FE 3인 팀',
    roles: ['프론트엔드 개발 (커밋 기여 1위)', 'PWA · FCM 푸시', 'QR 적립 흐름', '이미지 CDN 구축'],
    stack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'TanStack Query', 'Zustand', 'React Hook Form', 'Zod', 'PWA', 'FCM', 'AWS CloudFront'],
    cover: { kind: 'device', src: '/images/projects/loopy-screen.webp', alt: 'LOOPy 로그인 화면', background: 'linear-gradient(140deg,#6d6ff3 0%,#5450d6 55%,#2b2a7a 100%)' },
    links: { live: 'https://loopyapp-gomgumas-projects.vercel.app', github: 'https://github.com/Organization-LOOPy/LOOPy-FE' },
    metrics: [
      { value: '76%', label: '팀 커밋 기여도 (795건)' },
      { value: '238', label: 'Pull Requests' },
      { value: '42 → 15', label: 'PWA 캐시 설정 코드 (줄)' },
      { value: '31', label: 'Funnel 통합 리팩터링 파일' },
    ],
    overview: [
      'LOOPy는 QR 기반 스탬프 적립, FCM 푸시 알림, 카카오맵 기반 카페 탐색을 제공하는 디지털 리워드 플랫폼입니다. 고객은 앱(PWA)으로, 사장님은 웹으로 각자의 화면을 사용합니다.',
      '초기 세팅과 배포부터 QR 상호작용 API 연동, PWA·푸시, 인증 흐름, 정적 리소스 CDN까지 서비스 전반의 프론트엔드를 맡았습니다.',
    ],
    troubleshooting: [
      {
        title: '재배포해도 설치된 PWA가 옛 화면을 보여주던 문제',
        problem:
          '새 버전을 배포해도 이미 설치된 PWA에서는 Workbox 런타임 캐시가 유지되어, 사용자가 캐시를 지우거나 앱을 재설치해야만 최신 코드가 반영됐습니다.',
        approach: [
          'Workbox runtimeCaching의 cacheName을 빌드 시점 기반으로 버저닝',
          '머지·재배포 시 새 캐시 네임스페이스가 생성되도록 하여 이전 캐시를 자연스럽게 교체',
          '설치 상태 → 재배포 → 앱 재실행 시나리오로 회귀 검증',
        ],
        result: '캐시 삭제나 재설치 없이 재배포만으로 최신 버전이 반영되도록 바꿨고, 관련 설정 코드는 오히려 42줄에서 15줄로 줄었습니다.',
        reference: { label: 'PR #481', href: 'https://github.com/Organization-LOOPy/LOOPy-FE/pull/481' },
      },
      {
        title: '외부 Funnel 라이브러리로 생긴 단계 초기화·상태 꼬임',
        problem:
          '@use-funnel 기반 다단계 설정 화면에서 Provider가 재마운트되면 step이 초기화되고, URL query와 내부 상태가 서로 덮어쓰며 단계가 꼬이는 문제가 있었습니다.',
        approach: [
          '라이브러리를 제거하고 useCreateFunnel / useFunnelWithOptions 커스텀 추상화로 재구성',
          'step 전환의 단일 기준을 Funnel 상태로 통합하고, URL은 Funnel → URL 단방향 동기화만 수행',
          'Funnel 인스턴스를 Zustand store에 보관해 재마운트에도 상태가 유지되도록 처리',
        ],
        result: '마이페이지·사장님 설정 화면 31개 파일을 하나의 Funnel 구조로 통합하고, 외부 의존성 없이 guard·history까지 직접 제어할 수 있게 됐습니다.',
        reference: { label: 'PR #464', href: 'https://github.com/Organization-LOOPy/LOOPy-FE/pull/464' },
      },
      {
        title: 'S3 직접 조회로 생긴 이미지 로딩 편차',
        problem: '이미지를 S3에서 직접 내려받는 구조라 사용자 위치·네트워크에 따라 로딩 속도 편차가 컸습니다.',
        approach: [
          'CloudFront Distribution을 S3 앞단에 두고 CachingOptimized 정책 적용',
          'ACM 인증서 + 커스텀 도메인(cdn.loo-py.xyz)으로 HTTPS 전송 통일',
        ],
        result: '엣지 캐싱으로 재요청 응답을 CDN에서 처리하는 전달 구조를 만들었고, 이후 「글다」 영상 CDN에도 같은 구성을 재사용했습니다.',
        reference: { label: '구축 과정 글', href: '/blog/cloud-front' },
      },
    ],
    relatedPosts: ['cloud-front', 'use-form'],
    featured: true,
  },
  {
    slug: 'geulda',
    title: '글다',
    subtitle: '부천시 모바일 스탬프 투어 · AI 코스 추천 플랫폼',
    summary:
      '만화 속 부천 명소 10곳을 탐험하고 엽서를 모으는 관광 서비스. CI/CD 구축, AI 코스 추천·지도 페이지, 영상 CDN, 웹 접근성 개선과 Next.js 보안 패치 대응을 맡았습니다.',
    period: '2025.10 — 2025.12',
    team: 'FE 3 · 기획/디자인/BE 협업',
    roles: ['CI/CD 파이프라인 구축', '코스 추천 · 지도 페이지', '영상 CDN', '웹 접근성'],
    stack: ['Next.js', 'TypeScript', 'TanStack Query', 'Axios', 'Tailwind CSS v4', 'Kakao Map', 'AWS CloudFront', 'GitHub Actions', 'Vercel'],
    cover: { kind: 'image', src: '/images/projects/geulda.webp', alt: '글다 서비스 화면', position: '30% 50%' },
    links: { live: 'https://www.geulda.kr', github: 'https://github.com/geulDa/FE' },
    metrics: [
      { value: '1년', label: '영상 CDN 캐시 수명 (max-age)' },
      { value: '30', label: '접근성 개선 파일 수' },
      { value: '15 → 16', label: 'CVE 대응 Next.js 업그레이드' },
      { value: '34', label: 'Pull Requests' },
    ],
    overview: [
      '글다는 부천의 명소·행사·코스를 한 번에 즐기는 AI 기반 관광 플랫폼입니다. 사용자는 스탬프 투어를 진행하며 장소별 엽서를 수집하고, AI가 추천한 코스를 지도에서 확인합니다.',
      'FE 3인 중 한 명으로 개발 환경(CI/CD·코드리뷰 봇·브랜치 규칙)을 먼저 세팅하고, 코스 설정 → 결과 → 지도 흐름과 영상 시청 페이지를 구현했습니다.',
    ],
    troubleshooting: [
      {
        title: '영상 AccessDenied와 모바일 재생 끊김',
        problem:
          '장소 소개 영상을 S3 URL로 직접 재생하면서 권한 오류(AccessDenied)와 느린 초기 재생, iOS에서 강제 전체화면 전환 문제가 발생했습니다.',
        approach: [
          'cdn.geulda.kr을 CloudFront에 연결하고 ACM(us-east-1) 인증서로 HTTPS 적용',
          'Origin Access Control로 S3 접근 권한을 CloudFront 중심으로 재구성하고 영상 전용 경로(/upload/video) 분리',
          'Content-Type: video/mp4 메타데이터와 Cache-Control: max-age=31536000 적용, playsInline·건너뛰기 버튼으로 모바일 UX 보완',
        ],
        result: '모든 영상 링크를 CDN 주소로 통일해 권한 오류를 해소하고, 업로드 규칙만 지키면 자동으로 캐싱·HTTPS가 적용되는 운영 흐름을 문서화했습니다.',
        reference: { label: 'PR #144', href: 'https://github.com/geulDa/FE/pull/144' },
      },
      {
        title: 'React 서버 컴포넌트 보안 취약점(CVE) 긴급 대응',
        problem: 'React/Next.js 보안 취약점이 공개되어 운영 중인 서비스의 프레임워크 버전을 즉시 올려야 하는 상황이었습니다.',
        approach: [
          'Next.js 15.5.4 → 16.0.7로 업그레이드하고 빌드 설정 호환성 점검',
          '업그레이드 과정에서 PWA 서비스 워커 캐싱 전략을 함께 정비',
        ],
        result: '취약점 공개 직후 패치 PR을 올려, 운영 중인 서비스를 보안 패치가 적용된 버전으로 전환했습니다.',
        reference: { label: 'PR #157', href: 'https://github.com/geulDa/FE/pull/157' },
      },
    ],
    relatedPosts: ['cloud-front', 'csr-ssr-ssg-isr'],
    featured: true,
  },
  {
    slug: 'soulrip',
    title: 'Soulrip',
    subtitle: '서울 혼행 관광 커뮤니티 가이드',
    summary:
      '3인 팀장으로 3일 만에 만든 MVP를 다시 설계해, 키워드 검색 챗봇을 RAG로 바꾸고 프론트·백엔드에 AI 코딩 하네스(Global · Domain · Local · Workflow)를 적용했습니다. (SSAFY StartCamp)',
    period: '2026.07 — 2026.09',
    team: '3인 팀 · 팀장 · 전원 FE/BE 참여',
    roles: ['팀장 · 기획', 'Vue 3 프론트엔드', 'FastAPI 백엔드', 'RAG · AI 인사이트', '하네스 설계'],
    stack: ['Vue 3', 'TypeScript', 'FastAPI', 'SQLite', 'OpenAI', 'RAG', 'LangSmith'],
    cover: { kind: 'image', src: '/images/posts/soulrip/home.webp', alt: 'Soulrip 홈 화면', position: 'top' },
    links: { live: 'https://soulrip.netlify.app/', github: 'https://github.com/skyblue1232/soulrip-backend' },
    metrics: [],
    overview: [],
    troubleshooting: [],
    relatedPosts: ['soulrip-rag-harness'],
    featured: false,
  },
  {
    slug: 'catxi',
    title: 'CATXI',
    subtitle: '가톨릭대 택시 동승자 매칭 서비스',
    summary: '같은 방향 학생끼리 택시를 함께 타도록 매칭하고, 실시간 채팅으로 출발을 조율하는 PWA. WebSocket(STOMP) 채팅방, 방장 강퇴·신고, FCM 알림, 토큰 재발급을 개발했습니다.',
    period: '2025.05 — 2026.03',
    team: 'FE 3인 팀',
    roles: ['프론트엔드 개발 (커밋 기여 1위)', '실시간 채팅 (WebSocket · STOMP)', 'FCM 알림', '토큰 재발급'],
    stack: ['React', 'TypeScript', 'Vite', 'TanStack Query', 'WebSocket (STOMP)', 'FCM', 'PWA'],
    cover: { kind: 'image', src: '/images/projects/catxi.webp', alt: 'CATXI 서비스 화면', position: '60% 50%' },
    links: { github: 'https://github.com/Team-Catxi/Catxi_FrontEnd' },
    metrics: [
      { value: '347', label: '커밋' },
      { value: '118', label: 'Pull Requests' },
    ],
    overview: [],
    troubleshooting: [],
    featured: false,
  },
  {
    slug: 'yutopia',
    title: '윷토피아',
    subtitle: '윷을 던지며 떠나는 국내 여행 보드게임',
    summary: 'TourAPI·기상청 단기예보·카카오맵을 엮은 놀이형 여행 계획 서비스. 프레임워크 없이 Vanilla JS 해시 라우터와 스토어를 직접 구현했습니다. (SSAFY 관통 프로젝트)',
    period: '2026',
    team: 'SSAFY 관통 프로젝트 팀',
    roles: ['프론트엔드 개발'],
    stack: ['Vanilla JS', 'Vite', 'TourAPI', 'Kakao Map', 'i18n', 'GitLab CI'],
    cover: { kind: 'image', src: '/images/projects/yutopia.webp', alt: '윷토피아 윷판 화면' },
    links: { live: 'https://yutopia-zeta.vercel.app', github: 'https://github.com/skyblue1232/yutopia' },
    metrics: [],
    overview: [],
    troubleshooting: [],
    featured: false,
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
export const otherProjects = projects.filter((p) => !p.featured);

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}
