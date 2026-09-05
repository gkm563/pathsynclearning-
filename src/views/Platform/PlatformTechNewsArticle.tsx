"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Bookmark, CheckCheck } from "lucide-react";
import { apiGet, apiSend } from "@/lib/api";
import type { NewsArticleDto } from "@/lib/news/types";
import { routes } from "@/lib/routes";
import { Button, EmptyState, PageSpinner } from "@/components/ui/primitives";
import {
  ExternalSourceLink,
  ShareButton,
} from "@/components/tech-news/NewsCard";
import {
  CATEGORY_COLOR,
  formatNewsTime,
  NewsCover,
} from "@/components/tech-news/shared";
import { NewsArticleBody } from "@/components/tech-news/NewsArticleBody";

export default function PlatformTechNewsArticle() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;
  const [article, setArticle] = useState<NewsArticleDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiGet<{ article: NewsArticleDto }>(
          `/api/me/tech-news/${id}`,
        );
        if (cancelled) return;
        setArticle(res.article);
        await apiSend("/api/me/tech-news/read", "POST", { articleId: id });
        if (!cancelled) {
          setArticle((a) => (a ? { ...a, read: true } : a));
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Article not found");
          setArticle(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const toggleBookmark = async () => {
    if (!article) return;
    const next = !article.bookmarked;
    setArticle({ ...article, bookmarked: next });
    try {
      await apiSend("/api/me/tech-news/bookmark", "POST", {
        articleId: article.id,
        bookmarked: next,
      });
    } catch {
      setArticle({ ...article, bookmarked: !next });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <PageSpinner label="Loading article…" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="tech-news">
        <EmptyState
          title="Unable to open article"
          description={error || "This story may have been removed."}
          action={
            <Button onClick={() => router.push(routes.app.techNews)}>
              Back to Tech News
            </Button>
          }
        />
      </div>
    );
  }

  const color = CATEGORY_COLOR[article.category] || "#6c63ff";
  const shareUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `${routes.app.techNews}/${article.id}`;
  const showDek =
    Boolean(article.summary) &&
    !(article.content || "")
      .replace(/\s+/g, " ")
      .toLowerCase()
      .includes(article.summary.replace(/\s+/g, " ").toLowerCase().slice(0, 80));

  return (
    <article className="tech-news" style={{ maxWidth: 760 }}>
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
          marginBottom: 18,
          minHeight: 40,
          padding: 0,
        }}
      >
        <ArrowLeft size={16} aria-hidden /> Back to Tech News
      </button>

      <div
        style={{
          borderRadius: 16,
          border: "1px solid var(--border-light)",
          overflow: "hidden",
          marginBottom: 22,
        }}
      >
        <NewsCover src={article.imageUrl} alt="" tint={color} />
      </div>

      <div className="news-card-meta" style={{ marginTop: 0, paddingTop: 0, marginBottom: 14 }}>
        <span>{article.category}</span>
        <span className="sep" aria-hidden>
          ·
        </span>
        <span>{article.sourceName}</span>
        <span className="sep" aria-hidden>
          ·
        </span>
        <span>{formatNewsTime(article.publishedAt)}</span>
        <span className="sep" aria-hidden>
          ·
        </span>
        <span>{article.readingMinutes} min read</span>
        {article.read ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <CheckCheck size={14} aria-hidden /> Read
          </span>
        ) : null}
      </div>

      <h1 className="tech-news-title" style={{ marginBottom: 12 }}>
        {article.title}
      </h1>

      {article.author ? (
        <p style={{ margin: "0 0 16px", color: "var(--text-muted)", fontSize: 14 }}>
          By {article.author}
        </p>
      ) : null}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
        <Button variant="secondary" onClick={() => void toggleBookmark()} style={{ minHeight: 40 }} className="news-toolbar-btn">
          <Bookmark
            size={16}
            fill={article.bookmarked ? "currentColor" : "none"}
          />
          {article.bookmarked ? "Saved" : "Save"}
        </Button>
        <ShareButton title={article.title} url={shareUrl} />
        {article.canonicalUrl || article.sourceUrl ? (
          <ExternalSourceLink href={article.sourceUrl || article.canonicalUrl} />
        ) : null}
      </div>

      {showDek ? (
        <p className="news-article-dek">{article.summary}</p>
      ) : null}

      {article.content ? (
        <NewsArticleBody content={article.content} />
      ) : (
        <p className="news-article-fallback">
          Full story is available on the original source.
        </p>
      )}
    </article>
  );
}
