import { ImageResponse } from 'next/og';
import { site } from '@/content/site';

export const alt = `${site.nameEn} — ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// 기본 내장 폰트가 라틴 문자만 지원하므로 공유 카드 문구는 영문으로 구성합니다.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 80,
          background: 'radial-gradient(circle at 50% -20%, rgba(99,102,241,0.45), #0b0f19 60%)',
          color: '#eceef4',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'linear-gradient(135deg,#8b8ff8,#6366f1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              fontWeight: 700,
              color: '#fff',
            }}
          >
            M
          </div>
          <div style={{ fontSize: 28, color: '#a3a9b8' }}>{site.url.replace('https://', '')}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 30, color: '#8b8ff8', marginBottom: 16 }}>{site.role}</div>
          <div style={{ fontSize: 84, fontWeight: 700, letterSpacing: -3, lineHeight: 1.05 }}>{site.nameEn}</div>
          <div style={{ fontSize: 34, color: '#a3a9b8', marginTop: 24 }}>
            Monorepo · Design System · Server State · Performance
          </div>
        </div>
      </div>
    ),
    size,
  );
}
