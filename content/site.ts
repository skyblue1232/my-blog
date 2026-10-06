/**
 * 사이트 전역에서 쓰는 프로필 정보.
 * 문구·링크를 바꿀 때는 이 파일만 수정하면 Hero, Contact, Footer, 메타데이터, 이력서 페이지에 함께 반영됩니다.
 */
export const site = {
  name: '고민균',
  nameEn: 'MinGyun Ko',
  role: 'Frontend Engineer',
  url: 'https://my-blog-min.vercel.app',
  email: 'skybluekmg@gmail.com',
  location: 'Seoul, KR',
  availability: '신입 프론트엔드 포지션 지원 중',
  headline: ['집요하게 파고들어,', '구조로 해결합니다.'],
  tagline:
    '사용자 흐름이 끊기지 않는 화면을 만들고, 팀이 같은 기준으로 개발할 수 있는 구조를 설계하는 프론트엔드 엔지니어 고민균입니다.',
  description:
    '프론트엔드 엔지니어 고민균의 포트폴리오와 기술 블로그. 모노레포·디자인 시스템·서버 상태 구조화와 문제 해결 과정을 기록합니다.',
  /** PDF 이력서를 public/에 추가하면 '/resume.pdf'로 바꿔도 됩니다. */
  resumeHref: '/resume',
  socials: {
    github: 'https://github.com/skyblue1232',
    linkedin: 'https://www.linkedin.com/in/%EB%AF%BC%EA%B7%A0-%EA%B3%A0-ab28ab360/',
    blog: '/blog',
  },
} as const;

export const navItems = [
  { href: '/#about', label: 'About' },
  { href: '/#projects', label: 'Projects' },
  { href: '/#experience', label: 'Experience' },
  { href: '/blog', label: 'Blog' },
  { href: '/#contact', label: 'Contact' },
] as const;
