'use client';

import { useEffect } from 'react';

/**
 * 본문 HTML의 코드 블록 헤더(lib/markdown.ts에서 렌더링)에 있는 Copy 버튼을 동작시킵니다.
 * 버튼은 서버에서 이미 그려져 있으므로 레이아웃 이동 없이 이벤트 위임만 연결합니다.
 */
export function CodeCopy({ containerId }: { containerId: string }) {
  useEffect(() => {
    const root = document.getElementById(containerId);
    if (!root) return;

    async function onClick(e: MouseEvent) {
      const button = (e.target as HTMLElement).closest<HTMLButtonElement>('.code-copy');
      if (!button) return;
      const code = button.closest('figure')?.querySelector('pre code') as HTMLElement | null;
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code.innerText);
        button.textContent = 'Copied';
        button.dataset.copied = '';
      } catch {
        button.textContent = 'Failed';
      }
      setTimeout(() => {
        button.textContent = 'Copy';
        delete button.dataset.copied;
      }, 1500);
    }

    root.addEventListener('click', onClick);
    return () => root.removeEventListener('click', onClick);
  }, [containerId]);

  return null;
}
