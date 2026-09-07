"use client";

import Link from "next/link";
import { ArrowUpRight, Newspaper } from "lucide-react";
import type { NewsArticleDto } from "@/lib/news/types";
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  ListSkeleton,
} from "@/components/ui";
import { routes, techNewsArticlePath } from "@/lib/routes";
import { homeUi } from "./tokens";

type Props = {
  news: NewsArticleDto[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

/** "What's new" — the three latest tech-news items, as a teaser. */
export function NewsTeaser({ news, loading, error, onRetry }: Props) {
  return (
    <div className={homeUi.card}>
      <div className={homeUi.cardHead}>
        <div className="min-w-0">
          <h3 className={homeUi.cardTitle}>Latest in tech</h3>
          <p className={homeUi.cardHint}>
            Picked for the stack you’re learning
          </p>
        </div>
        <Link href={routes.app.techNews} className={homeUi.link}>
          Browse all
          <ArrowUpRight size={14} aria-hidden />
        </Link>
      </div>

      {loading ? (
        <ListSkeleton count={3} />
      ) : error ? (
        <ErrorState
          compact
          title="Couldn’t load the news feed"
          description="The tech-news service didn’t respond."
          detail={error}
          action={
            <Button variant="secondary" onClick={onRetry}>
              Try again
            </Button>
          }
        />
      ) : news.length === 0 ? (
        <EmptyState
          compact
          icon={<Newspaper size={17} aria-hidden />}
          title="No articles yet"
          description="Nothing has been published for your interests today. Set your topics to widen the feed."
          action={
            <Link href={routes.app.techNews} className={homeUi.link}>
              Open tech news
              <ArrowUpRight size={14} aria-hidden />
            </Link>
          }
        />
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {news.map((item) => (
            <li key={item.id} className="min-w-0">
              <Link
                href={techNewsArticlePath(item.id)}
                className="flex min-w-0 flex-col gap-1.5 rounded-[var(--radius-md)] border border-line bg-sunken px-3.5 py-3 transition-colors duration-[var(--duration-fast)] hover:border-primary-border hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <Badge tone="neutral" className="self-start">
                  {String(item.category || "tech")}
                </Badge>
                <span className="type-label text-ink">{item.title}</span>
                <span className="type-caption text-muted">
                  {item.sourceName}
                  {item.readingMinutes ? ` · ${item.readingMinutes} min read` : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
