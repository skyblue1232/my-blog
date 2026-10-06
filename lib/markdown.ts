import type { Element, Root } from 'hast';
import { toString } from 'hast-util-to-string';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

export type Heading = { id: string; text: string; depth: 2 | 3 };

/** h2·h3을 수집해 목차(TOC)로 사용합니다. rehype-slug 이후에 실행되어야 id가 존재합니다. */
function rehypeCollectHeadings(headings: Heading[]) {
  return () => (tree: Root) => {
    visit(tree, 'element', (node: Element) => {
      if ((node.tagName === 'h2' || node.tagName === 'h3') && typeof node.properties.id === 'string') {
        headings.push({ id: node.properties.id, text: toString(node), depth: node.tagName === 'h2' ? 2 : 3 });
      }
    });
  };
}

/** 본문 이미지 지연 로딩, 외부 링크 새 탭 열기, 표 가로 스크롤 래퍼를 적용합니다. */
function rehypeEnhance() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName === 'img') {
        node.properties.loading = 'lazy';
        node.properties.decoding = 'async';
      }
      if (node.tagName === 'a' && typeof node.properties.href === 'string' && /^https?:\/\//.test(node.properties.href)) {
        node.properties.target = '_blank';
        node.properties.rel = ['noopener', 'noreferrer'];
      }
      if (node.tagName === 'table' && parent && typeof index === 'number') {
        parent.children[index] = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['table-wrap'] },
          children: [node],
        };
      }
    });
  };
}

export async function renderMarkdown(markdown: string) {
  const headings: Heading[] = [];
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypeCollectHeadings(headings))
    .use(rehypePrettyCode, { theme: 'github-dark-default', keepBackground: false, defaultLang: 'text' })
    .use(rehypeEnhance)
    .use(rehypeStringify)
    .process(markdown);

  return { html: String(file), headings };
}
