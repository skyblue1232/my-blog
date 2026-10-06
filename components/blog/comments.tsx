'use client';

import { useEffect, useRef } from 'react';
import { site } from '@/content/site';
import { THEME_EVENT } from '../layout/theme-toggle';
import { GitHub } from '../ui/icons';

const giscusTheme = (theme: string | undefined) => (theme === 'light' ? 'light' : 'dark_dimmed');

/**
 * 댓글 섹션. content/site.ts의 giscus 설정이 채워져 있으면 GitHub Discussions 기반 giscus를,
 * 아니면 GitHub 이슈로 의견을 남기는 버튼을 보여줍니다.
 */
export function Comments({ slug, title }: { slug: string; title: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { repo, repoId, category, categoryId } = site.giscus;
  const enabled = Boolean(repo && repoId && categoryId);

  useEffect(() => {
    if (!enabled || !ref.current) return;
    const script = document.createElement('script');
    Object.entries({
      src: 'https://giscus.app/client.js',
      'data-repo': repo,
      'data-repo-id': repoId,
      'data-category': category,
      'data-category-id': categoryId,
      'data-mapping': 'specific',
      'data-term': slug,
      'data-reactions-enabled': '1',
      'data-input-position': 'top',
      'data-lang': 'ko',
      'data-loading': 'lazy',
      'data-theme': giscusTheme(document.documentElement.dataset.theme),
      crossorigin: 'anonymous',
    }).forEach(([k, v]) => script.setAttribute(k, v));
    script.async = true;
    const container = ref.current;
    container.replaceChildren(script);

    const onTheme = (e: Event) => {
      const iframe = container.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
      iframe?.contentWindow?.postMessage(
        { giscus: { setConfig: { theme: giscusTheme((e as CustomEvent<string>).detail) } } },
        'https://giscus.app',
      );
    };
    window.addEventListener(THEME_EVENT, onTheme);
    return () => window.removeEventListener(THEME_EVENT, onTheme);
  }, [enabled, repo, repoId, category, categoryId, slug]);

  return (
    <section aria-labelledby="comments-title" className="mt-16">
      <h2 id="comments-title" className="font-pixel text-xs uppercase tracking-wider text-subtle">
        Comments
      </h2>
      {enabled ? (
        <div ref={ref} className="mt-5 min-h-24" />
      ) : (
        <div className="mt-5 flex flex-col items-start gap-4 rounded-lg border border-dashed border-line-strong p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-relaxed text-muted">
            질문이나 다른 의견이 있다면 남겨주세요. 함께 고민한 내용은 글에 반영합니다.
          </p>
          <a
            href={`https://github.com/${repo}/issues/new?title=${encodeURIComponent(`[comment] ${title}`)}&body=${encodeURIComponent(`${site.url}/blog/${slug}\n\n`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-md border border-line-strong bg-surface px-3.5 py-2 text-sm font-medium text-fg hover:border-subtle"
          >
            <GitHub /> GitHub으로 의견 남기기
          </a>
        </div>
      )}
    </section>
  );
}
