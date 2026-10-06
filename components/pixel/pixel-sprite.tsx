import type { SVGProps } from 'react';

/** 스프라이트 문자 → 색. 색은 globals.css의 --px-* 변수라 테마에 따라 함께 바뀝니다. */
const PALETTE: Record<string, string> = {
  k: 'var(--px-ink)',
  b: 'var(--px-body)',
  s: 'var(--px-shade)',
  a: 'var(--px-accent)',
  e: 'var(--px-eye)',
  f: 'var(--fg)',
  m: 'var(--subtle)',
};

type PixelSpriteProps = Omit<SVGProps<SVGSVGElement>, 'children'> & {
  /** 한 줄이 한 행. `.`은 투명, 나머지 문자는 PALETTE 키 */
  rows: readonly string[];
  title?: string;
};

/**
 * 문자열 행렬로 그리는 픽셀 아트.
 * 같은 색이 이어지는 픽셀은 한 개의 rect로 합쳐 DOM을 가볍게 유지합니다.
 */
export function PixelSprite({ rows, title, ...props }: PixelSpriteProps) {
  const width = Math.max(...rows.map((r) => r.length));
  const rects: { x: number; y: number; w: number; fill: string }[] = [];

  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const ch = row[x];
      if (ch === '.' || !PALETTE[ch]) {
        x++;
        continue;
      }
      let w = 1;
      while (row[x + w] === ch) w++;
      rects.push({ x, y, w, fill: PALETTE[ch] });
      x += w;
    }
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${rows.length}`}
      shapeRendering="crispEdges"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      {...props}
    >
      {title && <title>{title}</title>}
      {rects.map((r) => (
        <rect key={`${r.x}-${r.y}`} x={r.x} y={r.y} width={r.w} height={1} fill={r.fill} />
      ))}
    </svg>
  );
}
