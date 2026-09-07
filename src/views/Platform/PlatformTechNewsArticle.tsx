"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Bookmark, CheckCheck } from "lucide-react";
import { apiGet, apiSend } from "@/lib/api";
import type { NewsArticleDto } from "@/lib/news/types";
import { routes } from "@/lib/routes";
import {
  Badge,
  Breadcrumb,
  Button,
  ErrorState,
  PageSkeleton,
} from "@/components/ui";
import {
  ExternalSourceLink,
  ShareButton,
} from "@/components/tech-news/NewsCard";
import { formatNewsTime, NewsCover, newsDateTime } from "@/components/tech-news/shared";
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
    return <PageSkeleton stats={false} variant="list" />;
  }

  if (error || !article) {
    return (
      <ErrorState
        title="Unable to open article"
        description={error || "This story may have been removed."}
        action={
          <Button onClick={() => router.push(routes.app.techNews)}>
            Back to Tech News
          </Button>
        }
      />
    );
  }

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
    <article className="mx-auto max-w-[var(--measure-prose)]">
      <Breadcrumb
        items={[
          { label: "Tech News", href: routes.app.techNews },
          { label: article.title },
        ]}
        className="mb-5"
      />

      <div className="mb-6 overflow-hidden rounded-[var(--radius-lg)] border border-line">
        <NewsCover src={article.imageUrl} alt="" />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge tone="accent">{article.category}</Badge>
        <span className="type-caption text-faint">{article.sourceName}</span>
        <span className="type-caption text-faint" aria-hidden>
          ·
        </span>
        <time
          className="type-caption text-faint"
          dateTime={newsDateTime(article.publishedAt)}
        >
          {formatNewsTime(article.publishedAt)}
        </time>
        <span className="type-caption text-faint" aria-hidden>
          ·
        </span>
        <span className="type-caption text-faint">
          {article.readingMinutes} min read
        </span>
        {article.read ? (
          <span className="type-caption inline-flex items-center gap-1 text-muted">
            <CheckCheck size={14} aria-hidden /> Read
          </span>
        ) : null}
      </div>

      <h1 className="type-h2 mt-0 mb-3 text-ink">{article.title}</h1>

      {article.author ? (
        <p className="type-small mt-0 mb-4 text-muted">By {article.author}</p>
      ) : null}

      <div className="mb-6 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => void toggleBookmark()}>
          <Bookmark
            size={16}
            aria-hidden
            className={article.bookmarked ? "fill-current" : undefined}
          />
          {article.bookmarked ? "Saved" : "Save"}
        </Button>
        <ShareButton title={article.title} url={shareUrl} />
        {article.canonicalUrl || article.sourceUrl ? (
          <ExternalSourceLink href={article.sourceUrl || article.canonicalUrl} />
        ) : null}
      </div>

      {showDek ? (
        <p className="type-body mt-0 mb-5 text-muted">{article.summary}</p>
      ) : null}

      {article.content ? (
        <NewsArticleBody content={article.content} />
      ) : (
        <p className="type-body text-muted">
          Full story is available on the original source.
        </p>
      )}
    </article>
  );
}
