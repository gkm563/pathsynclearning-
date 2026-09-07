"use client";

import type { ReactNode } from "react";
import { Clock, ExternalLink, Share2 } from "lucide-react";
import Link from "next/link";
import type { NewsArticleDto } from "@/lib/news/types";
import { techNewsArticlePath } from "@/lib/routes";
import { Button } from "@/components/ui";
import { BookmarkToggle } from "@/components/tech-news/BookmarkToggle";
import {
  formatNewsTime,
  NewsCover,
  NewsMeta,
  newsDateTime,
} from "@/components/tech-news/shared";
import { cn } from "@/lib/cn";

/** One story in the feed grid. */
export function NewsCard({
  article,
  onToggleBookmark,
}: {
  article: NewsArticleDto;
  onToggleBookmark?: (article: NewsArticleDto) => void;
}) {
  const meta: Array<string | { key: string; node: React.ReactNode }> = [
    article.sourceName,
    ...(article.author ? [article.author] : []),
    {
      key: "published",
      node: (
        <time dateTime={newsDateTime(article.publishedAt)}>
          {formatNewsTime(article.publishedAt)}
        </time>
      ),
    },
    {
      key: "reading",
      node: (
        <span className="inline-flex items-center gap-1">
          <Clock size={12} aria-hidden />
          {article.readingMinutes} min
        </span>
      ),
    },
  ];

  return (
    <article
      className={cn(
        "group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-xs)]",
        "transition-[border-color,box-shadow] duration-[var(--duration-normal)] ease-[var(--ease-standard)] motion-reduce:transition-none",
        "hover:border-primary-border hover:shadow-[var(--shadow-md)]",
        "focus-within:border-primary-border focus-within:shadow-[var(--shadow-md)]",
      )}
    >
      <Link
        href={techNewsArticlePath(article.id)}
        className="flex min-w-0 flex-1 flex-col rounded-[var(--radius-lg)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
      >
        <NewsCover src={article.imageUrl} zoomOnHover />

        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
          <p className="type-overline m-0 text-faint">{article.category}</p>

          <h3
            className={cn(
              "type-h4 mt-2 mb-0 line-clamp-3 [overflow-wrap:anywhere]",
              article.read ? "text-muted" : "text-ink",
            )}
          >
            {article.title}
          </h3>

          <p className="type-small mt-2 mb-0 line-clamp-3 flex-1 text-muted">
            {article.summary}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1">
            <NewsMeta items={meta} className="min-w-0 flex-1" />
            {article.read ? (
              <span className="type-caption rounded-full bg-sunken px-2 py-0.5 font-semibold text-faint">
                Read
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      {onToggleBookmark ? (
        <BookmarkToggle
          floating
          bookmarked={article.bookmarked}
          title={article.title}
          onToggle={() => onToggleBookmark(article)}
        />
      ) : null}
    </article>
  );
}

/** Share via the Web Share sheet, falling back to copying the URL. */
export function ShareButton({
  title,
  url,
  onCopied,
}: {
  title: string;
  url: string;
  onCopied?: () => void;
}) {
  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      onCopied?.();
    } catch {
      /* user cancelled */
    }
  };

  return (
    <Button variant="secondary" onClick={() => void share()} className="min-h-11">
      <Share2 size={15} aria-hidden /> Share
    </Button>
  );
}

/** Link out to the publisher's original story. */
export function ExternalSourceLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="type-label inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] border border-line-strong bg-surface px-4 text-ink transition-colors duration-[var(--duration-fast)] hover:bg-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
    >
      <ExternalLink size={15} aria-hidden /> Original
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
