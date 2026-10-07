/**
 * 블로그 전역 설정. 이름 · 카테고리 · 댓글 설정을 바꿀 때는 이 파일만 수정합니다.
 */
export const site = {
  name: 'Tech Study Lab',
  shortName: 'STUDY LAB',
  tagline: '공부하고, 실험하고, 기록하는 기술 연구실(by.고민균)',
  description:
    '개발하며 부딪힌 문제와 실험 과정을 기록하는 기술 블로그. AI, 프론트엔드, 백엔드, 클라우드/인프라, 협업에 대한 딥다이브 노트를 모읍니다.',
  url: 'https://my-blog-min.vercel.app',
  /** 메타데이터(작성자 표기)에만 사용합니다. 화면에는 노출하지 않습니다. */
  author: '고민균',
  repo: 'skyblue1232/my-blog',
  github: 'https://github.com/skyblue1232',
  /**
   * giscus 댓글 설정. GitHub 저장소에서 Discussions를 켜고 giscus 앱을 설치한 뒤
   * https://giscus.app 에서 발급되는 categoryId를 채우면 댓글이 활성화됩니다.
   * 비어 있으면 GitHub 이슈로 의견을 남기는 버튼이 대신 표시됩니다.
   */
  giscus: {
    repo: 'skyblue1232/my-blog',
    repoId: 'R_kgDORiBKHA',
    category: 'Comments',
    categoryId: '',
  },
} as const;

export const categories = [
  { slug: 'ai', label: 'AI', description: 'LLM · RAG · 모델 실험과 회고' },
  { slug: 'frontend', label: 'Frontend', description: 'React · Next.js · 상태 관리 · 아키텍처' },
  { slug: 'backend', label: 'Backend', description: 'HTTP · API · 서버와 데이터' },
  { slug: 'cloud', label: 'Cloud/Infra', description: 'AWS · CDN · 배포와 운영' },
  { slug: 'career', label: 'Career', description: '협업 방식 · 일하는 법 · 성장 기록' },
] as const;

export type CategorySlug = (typeof categories)[number]['slug'];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
