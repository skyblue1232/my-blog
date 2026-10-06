'use client';

import { useEffect } from 'react';

const COPY_ICON =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2.5"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/></svg>';

/**
 * 서버에서 렌더링된 본문 HTML의 코드 블록에 복사 버튼을 붙입니다.
 * 본문은 dangerouslySetInnerHTML로 들어오므로 마운트 후 DOM을 보강하는 방식을 사용합니다.
 */
export function CodeCopy({ containerId }: { containerId: string }) {
  useEffect(() => {
    const root = document.getElementById(containerId);
    if (!root) return;
    const buttons: HTMLButtonElement[] = [];

    root.querySelectorAll<HTMLElement>('figure[data-rehype-pretty-code-figure] > pre').forEach((pre) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className =
        'absolute right-2.5 top-2 flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-[#9aa1b2] transition-colors hover:text-white';
      button.innerHTML = `${COPY_ICON}<span>Copy</span>`;
      button.setAttribute('aria-label', '코드 복사');
      button.addEventListener('click', async () => {
        await navigator.clipboard.writeText(pre.querySelector('code')?.innerText ?? '');
        button.querySelector('span')!.textContent = 'Copied';
        setTimeout(() => (button.querySelector('span')!.textContent = 'Copy'), 1500);
      });
      pre.parentElement?.appendChild(button);
      buttons.push(button);
    });

    return () => buttons.forEach((b) => b.remove());
  }, [containerId]);

  return null;
}
