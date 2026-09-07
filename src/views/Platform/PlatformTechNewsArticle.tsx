"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Bookmark, CheckCheck, ChevronLeft } from "lucide-react";
import { apiGet, apiSend } from "@/lib/api";
import type { NewsArticleDto } from "@/lib/news/types";
import { routes } from "@/lib/routes";
import { Button, ErrorState, PageSkeleton } from "@/components/ui";
import {
  ExternalSourceLink,
  ShareButton,
} from "@/components/tech-news/NewsCard";
import {
  formatNewsTime,
  NewsCover,
  newsDateTime,
} from "@/components/tech-news/shared";
import { NewsArticleBody } from "@/components/tech-news/NewsArticleBody";
import Link from "next/link";

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
      <Link
        href={routes.app.techNews}
        className="type-label mb-5 inline-flex min-h-11 items-center gap-1 text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ChevronLeft size={18} aria-hidden />
        Tech News
      </Link>

      <p className="type-overline m-0 text-primary">{article.category}</p>

      <h1 className="mt-2 mb-3 text-[1.25rem] leading-[1.25] font-semibold tracking-[-0.035em] text-ink sm:text-[1.85rem] sm:leading-[1.2]">
        {article.title}
      </h1>

      {article.author ? (
        <p className="type-small mt-0 mb-2 text-muted">By {article.author}</p>
      ) : null}

      <div className="mb-5 flex flex-wrap items-center gap-x-2 gap-y-1">
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

      <NewsCover
        src={article.imageUrl}
        alt=""
        fallback="hidden"
        className="mb-6 aspect-[16/9] rounded-[var(--radius-lg)]"
      />

      <div className="mb-6 flex flex-wrap items-center gap-1 border-y border-line py-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void toggleBookmark()}
          className="min-h-11"
        >
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
        <p className="mt-0 mb-4 text-[0.875rem] leading-[1.65] text-muted sm:mb-5 sm:text-[1rem] sm:leading-[1.7]">
          {article.summary}
        </p>
      ) : null}

      {article.content ? (
        <NewsArticleBody content={article.content} />
      ) : (
        <p className="text-[0.875rem] leading-[1.65] text-muted sm:text-[1rem] sm:leading-[1.7]">
          Full story is available on the original source.
        </p>
      )}
    </article>
  );
}
