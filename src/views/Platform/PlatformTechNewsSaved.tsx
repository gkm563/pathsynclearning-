"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { apiGet, apiSend } from "@/lib/api";
import type { NewsArticleDto, NewsListResponse } from "@/lib/news/types";
import { routes } from "@/lib/routes";
import { Button, EmptyState } from "@/components/ui/primitives";
import { NewsCard } from "@/components/tech-news/NewsCard";
import { NewsSkeletonGrid } from "@/components/tech-news/shared";

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
    <div className="tech-news">
      <button
        type="button"
        onClick={() => router.push(routes.app.techNews)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          border: "none",
          background: "transparent",
          color: "var(--text-muted)",
          fontWeight: 650,
          fontSize: 13,
          cursor: "pointer",
          marginBottom: 16,
          minHeight: 40,
          padding: "0 4px",
        }}
        className="news-toolbar-btn"
      >
        <ArrowLeft size={16} aria-hidden /> Back to Tech News
      </button>

      <p className="tech-news-kicker">Your library</p>
      <h1 className="tech-news-title">Saved News</h1>
      <p className="tech-news-lead" style={{ marginBottom: 24 }}>
        Stories you bookmarked to read later.
      </p>

      {loading ? <NewsSkeletonGrid /> : null}

      {!loading && error ? (
        <EmptyState
          title="Unable to load saved news"
          description={error}
          action={<Button onClick={() => void load(null, false)}>Try Again</Button>}
        />
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState
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
          <div className="tech-news-grid">
            {items.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                onToggleBookmark={(a) => void toggleBookmark(a)}
              />
            ))}
          </div>
          {nextCursor ? (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 24 }}>
              <Button
                variant="secondary"
                disabled={loadingMore}
                onClick={() => void load(nextCursor, true)}
              >
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
