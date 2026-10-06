import { ImageResponse } from 'next/og';
import { site } from '@/content/site';

export const alt = site.name;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const BOT = [
  '.......a.......',
  '.......k.......',
  '...kkkkkkkkk...',
  '..kbbbbbbbbbk..',
  '..kbaaaaaaabk..',
  '..kbaeaaaeabk..',
  '..kbaaaaaaabk..',
  '..kbbbbbbbbbk..',
  '..kssssssssskk.',
  '...kkkkkkkkk...',
  '....kbbbbbk....',
  '...kbbbabbbk...',
  '...kbbbbbbbk...',
  '....kk...kk....',
];
const COLORS: Record<string, string> = { k: '#3a3f48', b: '#d6d9df', s: '#9ca3af', a: '#8b9dff', e: '#0d0e11' };
const PX = 18;

// 기본 내장 폰트가 라틴 문자만 지원하므로 공유 카드 문구는 영문으로 구성합니다.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', gap: 80, padding: 96, background: '#0d0e11', color: '#e7e8eb' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {BOT.map((row, y) => (
            <div key={y} style={{ display: 'flex' }}>
              {row.split('').map((ch, x) => (
                <div key={x} style={{ width: PX, height: PX, background: COLORS[ch] ?? 'transparent' }} />
              ))}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 28, color: '#8b9dff', letterSpacing: 4 }}>TECH BLOG</div>
          <div style={{ fontSize: 88, fontWeight: 700, letterSpacing: -2, marginTop: 12 }}>{site.name}</div>
          <div style={{ fontSize: 32, color: '#a3a7b0', marginTop: 20 }}>AI · Frontend · Backend · DevOps · Career</div>
        </div>
      </div>
    ),
    size,
  );
}
