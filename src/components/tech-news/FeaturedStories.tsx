"use client";

import Link from "next/link";
import type { NewsArticleDto } from "@/lib/news/types";
import { techNewsArticlePath } from "@/lib/routes";
import { Section } from "@/components/ui";
import { formatNewsTime, NewsCover, newsDateTime } from "@/components/tech-news/shared";
import { cn } from "@/lib/cn";

export function FeaturedStories({
  articles,
}: {
  articles: NewsArticleDto[];
}) {
  if (articles.length === 0) return null;

  const [hero, ...rest] = articles;

  return (
    <Section title="Featured">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <FeaturedCard article={hero} large />
        <div className="flex min-w-0 flex-col gap-4">
          {rest.slice(0, 2).map((a) => (
            <FeaturedCard key={a.id} article={a} />
          ))}
        </div>
      </div>
    </Section>
  );
}

function FeaturedCard({
  article,
  large,
}: {
  article: NewsArticleDto;
  large?: boolean;
}) {
  return (
    <Link
      href={techNewsArticlePath(article.id)}
      aria-label={article.title}
      className={cn(
        "group flex min-w-0 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-xs)]",
        "transition-[border-color,box-shadow] duration-[var(--duration-normal)]",
        "hover:border-primary-border hover:shadow-[var(--shadow-md)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        large ? "flex-col" : "flex-col sm:flex-row",
      )}
    >
      <NewsCover
        src={article.imageUrl}
        zoomOnHover
        className={cn(
          large ? "aspect-video w-full" : "aspect-video w-full sm:aspect-auto sm:w-40 sm:shrink-0",
        )}
      />
      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <p className="type-overline m-0 text-faint">
          {article.category}
          <span aria-hidden> · </span>
          <time dateTime={newsDateTime(article.publishedAt)}>
            {formatNewsTime(article.publishedAt)}
          </time>
        </p>
        <h3
          className={cn(
            "mt-2 mb-0 line-clamp-3 [overflow-wrap:anywhere] text-ink",
            large ? "type-h3" : "type-h4",
          )}
        >
          {article.title}
        </h3>
        {large ? (
          <p className="type-small mt-2 mb-0 line-clamp-3 text-muted">
            {article.summary}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
