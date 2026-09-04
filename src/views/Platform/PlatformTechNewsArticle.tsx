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
} from "@/components/tech-news/shared";

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
        <PageSpinner />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div style={{ padding: "8px 4px 40px", maxWidth: 800, margin: "0 auto" }}>
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

  return (
    <article style={{ padding: "8px 4px 48px", maxWidth: 800, margin: "0 auto" }}>
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
          marginBottom: 16,
          fontFamily: "Outfit, sans-serif",
          padding: 0,
        }}
      >
        <ArrowLeft size={16} /> Back to Tech News
      </button>

      <div
        style={{
          height: 240,
          borderRadius: 18,
          border: "1.5px solid var(--border-light)",
          backgroundColor: "var(--bg-alt)",
          backgroundImage: article.imageUrl
            ? `url(${article.imageUrl}), linear-gradient(135deg, ${color}33, var(--bg-alt))`
            : `linear-gradient(135deg, ${color}33, var(--bg-alt))`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          marginBottom: 20,
        }}
      />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          alignItems: "center",
          marginBottom: 12,
          fontSize: 13,
          color: "var(--text-muted)",
          fontWeight: 600,
        }}
      >
        <span style={{ color, fontWeight: 800 }}>{article.category}</span>
        <span aria-hidden>·</span>
        <span>{article.sourceName}</span>
        <span aria-hidden>·</span>
        <span>{formatNewsTime(article.publishedAt)}</span>
        <span aria-hidden>·</span>
        <span>{article.readingMinutes} min read</span>
        {article.read ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <CheckCheck size={14} /> Read
          </span>
        ) : null}
      </div>

      <h1
        style={{
          margin: "0 0 12px",
          fontFamily: "Outfit, sans-serif",
          fontSize: "clamp(26px, 4vw, 36px)",
          fontWeight: 800,
          color: "var(--text-main)",
          lineHeight: 1.2,
          letterSpacing: "-0.02em",
        }}
      >
        {article.title}
      </h1>

      {article.author ? (
        <p style={{ margin: "0 0 16px", color: "var(--text-muted)", fontSize: 14 }}>
          By {article.author}
        </p>
      ) : null}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
        <Button variant="secondary" onClick={() => void toggleBookmark()}>
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

      <p
        style={{
          margin: 0,
          fontSize: 17,
          lineHeight: 1.65,
          color: "var(--text-main)",
        }}
      >
        {article.summary}
      </p>

      {article.content ? (
        <div
          style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop: "1.5px solid var(--border-light)",
            whiteSpace: "pre-wrap",
            fontSize: 15,
            lineHeight: 1.7,
            color: "var(--text-main)",
            opacity: 0.92,
          }}
        >
          {article.content.slice(0, 8000)}
          {article.content.length > 8000 ? "…" : ""}
        </div>
      ) : (
        <p style={{ marginTop: 20, color: "var(--text-muted)", fontSize: 14 }}>
          Full story available on the original source.
        </p>
      )}
    </article>
  );
}
