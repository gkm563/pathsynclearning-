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
    <div style={{ padding: "8px 4px 40px", maxWidth: 1100, margin: "0 auto" }}>
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
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
          marginBottom: 12,
          fontFamily: "Outfit, sans-serif",
          padding: 0,
        }}
      >
        <ArrowLeft size={16} /> Back to Tech News
      </button>

      <h1
        style={{
          margin: "0 0 8px",
          fontFamily: "Outfit, sans-serif",
          fontSize: 30,
          fontWeight: 800,
          color: "var(--text-main)",
        }}
      >
        Saved News
      </h1>
      <p style={{ margin: "0 0 20px", color: "var(--text-muted)", fontSize: 15 }}>
        Articles you bookmarked for later.
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
          <div
            className="news-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 16,
            }}
          >
            {items.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                onToggleBookmark={(a) => void toggleBookmark(a)}
              />
            ))}
          </div>
          <style>{`
            @media (max-width: 960px) {
              .news-grid { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            }
            @media (max-width: 640px) {
              .news-grid { grid-template-columns: 1fr !important; }
            }
          `}</style>
          {nextCursor ? (
            <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
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
