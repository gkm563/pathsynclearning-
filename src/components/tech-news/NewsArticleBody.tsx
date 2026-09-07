"use client";

import { renderNewsContent } from "@/lib/news/render-markdown";
import { Prose } from "@/components/ui";

export function NewsArticleBody({ content }: { content: string }) {
  const html = renderNewsContent(content);
  if (!html) return null;
  return (
    <Prose variant="article">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </Prose>
  );
}
