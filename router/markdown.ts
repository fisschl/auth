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
import type { Request, Response } from "express";
import TurndownService from "turndown";

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

export const handleMarkdownToHtml = async (req: Request, res: Response) => {
  const { markdown, cache } = req.body;
  if (!markdown) {
    res.status(400).send("markdown is required");
    return;
  }
  if (cache) {
    const result = await parseMarkdownCache(markdown);
    res.json({ html: result });
  } else {
    const result = await parseMarkdown(markdown);
    res.json({ html: result });
  }
};

export const handleHtmlToMarkdown = (req: Request, res: Response) => {
  const { html } = req.body;
  if (!html) {
    res.status(400).send("html is required");
    return;
  }
  const result = htmlToMarkdown(html);
  res.json({ markdown: result });
};
