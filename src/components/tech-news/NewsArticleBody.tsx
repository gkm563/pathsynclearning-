"use client";

import { renderNewsContent } from "@/lib/news/render-markdown";

export function NewsArticleBody({ content }: { content: string }) {
  const html = renderNewsContent(content);
  if (!html) return null;
  return (
    <div
      className="news-article-body"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
