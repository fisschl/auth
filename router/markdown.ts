import rehypeShiki from "@shikijs/rehype";
import { LRUCache } from "lru-cache";
import { hash } from "ohash";
import rehypeKatex from "rehype-katex";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import TurndownService from "turndown";
import { createError, defineEventHandler, readBody } from "h3";

const BracketsPattern =
  /(```[\s\S]*?```|`.*?`)|\\\[([\s\S]*?[^\\])\\\]|\\\((.*?)\\\)/g;

export const parseMarkdown = async (text: string) => {
  const input = text.replaceAll(
    BracketsPattern,
    (match, codeBlock, squareBracket, roundBracket) => {
      // 匹配代码块是为了避免其内部的代码被替换
      if (codeBlock) return codeBlock;
      // 将 \[ \] 替换成 $$ $$
      if (squareBracket) return `$$${squareBracket}$$`;
      // 将 \( \) 替换成 $ $
      if (roundBracket) return `$${roundBracket}$`;
      return match;
    }
  );
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeShiki, {
      theme: "catppuccin-mocha",
    })
    .use(rehypeStringify)
    .process(input);
  return file.toString();
};

export const markdown_cache = new LRUCache<string, string>({
  max: 64 * 1024,
});

export const parseMarkdownCache = async (text: string) => {
  const key = hash(text);
  const cache_result = markdown_cache.get(key);
  if (cache_result) return cache_result;
  const result = await parseMarkdown(text);
  markdown_cache.set(key, result);
  return result;
};

const turndownService = new TurndownService();

export const htmlToMarkdown = (html?: string) => {
  if (!html?.trim()) return "";
  return turndownService.turndown(html);
};

export const handleMarkdownToHtml = defineEventHandler(async (event) => {
  const { markdown, cache } = await readBody(event);
  if (!markdown)
    throw createError({ status: 400, message: "markdown is required" });
  if (cache) {
    const result = await parseMarkdownCache(markdown);
    return { html: result };
  } else {
    const result = await parseMarkdown(markdown);
    return { html: result };
  }
});

export const handleHtmlToMarkdown = defineEventHandler(async (event) => {
  const { html } = await readBody(event);
  if (!html) throw createError({ status: 400, message: "html is required" });
  const result = htmlToMarkdown(html);
  return { markdown: result };
});
