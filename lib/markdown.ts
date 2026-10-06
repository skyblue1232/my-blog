import type { Element, Root } from 'hast';
import { toString } from 'hast-util-to-string';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkCjkFriendly from 'remark-cjk-friendly';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

export type Heading = { id: string; text: string; depth: 2 | 3 };

const h = (tagName: string, properties: Element['properties'], children: Element['children'] = []): Element => ({
  type: 'element',
  tagName,
  properties,
  children,
});

/** h2·h3을 수집해 목차(TOC)로 사용합니다. rehype-slug 이후, 앵커를 붙이기 전에 실행되어야 합니다. */
function rehypeCollectHeadings(headings: Heading[]) {
  return () => (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if ((node.tagName === 'h2' || node.tagName === 'h3') && typeof node.properties.id === 'string') {
        headings.push({ id: node.properties.id, text: toString(node), depth: node.tagName === 'h2' ? 2 : 3 });
      }
    });
  };
}

/**
 * 본문 보강
 * - 제목 옆 `#` 앵커 링크
 * - 코드 블록 상단 헤더(언어 라벨 + 복사 버튼). 복사 동작은 components/blog/code-copy.tsx가 위임 방식으로 처리합니다.
 * - 이미지 지연 로딩, 외부 링크 새 탭, 표 가로 스크롤 래퍼
 */
function rehypeEnhance() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if ((node.tagName === 'h2' || node.tagName === 'h3') && typeof node.properties.id === 'string') {
        node.children.push(
          h('a', { href: `#${node.properties.id}`, className: ['heading-anchor'], ariaLabel: '이 섹션 링크' }, [
            { type: 'text', value: '#' },
          ]),
        );
      }
      const props = node.properties as Record<string, unknown>;
      if (node.tagName === 'figure' && ('dataRehypePrettyCodeFigure' in props || 'data-rehype-pretty-code-figure' in props)) {
        const pre = node.children.find((c): c is Element => c.type === 'element' && c.tagName === 'pre');
        const preProps = (pre?.properties ?? {}) as Record<string, unknown>;
        const lang = String(preProps.dataLanguage ?? preProps['data-language'] ?? 'text');
        node.children.unshift(
          h('div', { className: ['code-header'] }, [
            h('span', { className: ['code-lang'] }, [{ type: 'text', value: lang === 'text' ? 'plain text' : lang }]),
            h('button', { type: 'button', className: ['code-copy'], ariaLabel: '코드 복사' }, [{ type: 'text', value: 'Copy' }]),
          ]),
        );
      }
      if (node.tagName === 'img') {
        node.properties.loading = 'lazy';
        node.properties.decoding = 'async';
      }
      if (node.tagName === 'a' && typeof node.properties.href === 'string' && /^https?:\/\//.test(node.properties.href)) {
        node.properties.target = '_blank';
        node.properties.rel = ['noopener', 'noreferrer'];
      }
      if (node.tagName === 'table' && parent && typeof index === 'number') {
        parent.children[index] = h('div', { className: ['table-wrap'] }, [node]);
      }
    });
  };
}

export async function renderMarkdown(markdown: string) {
  const headings: Heading[] = [];
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    // 한글 조사 바로 앞의 **"강조"**처럼 CommonMark에서 깨지는 CJK 강조를 처리합니다.
    .use(remarkCjkFriendly)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeCollectHeadings(headings))
    // 라이트/다크 두 테마의 색을 CSS 변수로 함께 출력하고, globals.css에서 테마에 맞게 고릅니다.
    .use(rehypePrettyCode, {
      theme: { light: 'github-light-default', dark: 'github-dark-default' },
      keepBackground: false,
      defaultLang: 'text',
    })
    .use(rehypeEnhance)
    .use(rehypeStringify)
    .process(markdown);

  return { html: String(file), headings };
}
