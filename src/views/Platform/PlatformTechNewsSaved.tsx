"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { apiGet, apiSend } from "@/lib/api";
import type { NewsArticleDto, NewsListResponse } from "@/lib/news/types";
import { routes } from "@/lib/routes";
import {
  Breadcrumb,
  Button,
  CardGridSkeleton,
  EmptyState,
  ErrorState,
  LoadMore,
  PageHeader,
} from "@/components/ui";
import { NewsCard } from "@/components/tech-news/NewsCard";

export default function PlatformTechNewsSaved() {
  const router = useRouter();
  const [items, setItems] = useState<NewsArticleDto[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (cursor?: string | null, append = false) => {
    if (append) setLoadingMore(true);
    else setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams({ saved: "1", limit: "18", sort: "latest" });
      if (cursor) qs.set("cursor", cursor);
      const data = await apiGet<NewsListResponse>(
        `/api/me/tech-news?${qs.toString()}`,
      );
      setNextCursor(data.nextCursor);
      setItems((prev) => (append ? [...prev, ...data.items] : data.items));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load saved news");
      if (!append) setItems([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    void load(null, false);
  }, [load]);

  const toggleBookmark = async (article: NewsArticleDto) => {
    setItems((prev) => prev.filter((a) => a.id !== article.id));
    try {
      await apiSend("/api/me/tech-news/bookmark", "POST", {
        articleId: article.id,
        bookmarked: false,
      });
    } catch {
      setItems((prev) => [article, ...prev]);
    }
  };

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Home", href: routes.app.dashboard },
          { label: "Tech News", href: routes.app.techNews },
          { label: "Saved articles" },
        ]}
        className="mb-4"
      />
      <PageHeader
        eyebrow="Your library"
        title="Saved articles"
        description="Stories you bookmarked to read later."
        actions={
          <Button
            variant="secondary"
            onClick={() => router.push(routes.app.techNews)}
          >
            Back to Tech News
          </Button>
        }
      />

      {loading ? <CardGridSkeleton count={6} withMedia /> : null}

      {!loading && error ? (
        <ErrorState
          title="Unable to load saved news"
          description="We couldn't reach your library. Try again."
          detail={error}
          action={
            <Button variant="secondary" onClick={() => void load(null, false)}>
              Try again
            </Button>
          }
        />
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState
          icon={<Bookmark size={20} aria-hidden />}
          title="No saved articles yet"
          description="Bookmark stories from Tech News to find them here."
          action={
            <Button onClick={() => router.push(routes.app.techNews)}>
              Browse Tech News
            </Button>
          }
        />
      ) : null}

      {items.length > 0 ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                onToggleBookmark={(a) => void toggleBookmark(a)}
              />
            ))}
          </div>
          {nextCursor ? (
            <LoadMore
              hasMore
              loading={loadingMore}
              onClick={() => void load(nextCursor, true)}
            />
          ) : null}
        </>
      ) : null}
    </>
  );
}
