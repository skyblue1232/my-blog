import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // 정적 HTML 시절의 URL을 새 라우트로 영구 이동시켜 외부 링크/검색 유입을 보존합니다.
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/posts/:slug.html', destination: '/blog/:slug', permanent: true },
      { source: '/posts/:slug', destination: '/blog/:slug', permanent: true },
    ];
  },
};

export default nextConfig;
