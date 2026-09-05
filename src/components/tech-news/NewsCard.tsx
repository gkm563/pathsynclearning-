"use client";

import { Bookmark, Clock, ExternalLink, Share2 } from "lucide-react";
import Link from "next/link";
import type { NewsArticleDto } from "@/lib/news/types";
import { techNewsArticlePath } from "@/lib/routes";
import {
  CATEGORY_COLOR,
  formatNewsTime,
  NewsCover,
} from "@/components/tech-news/shared";

export function NewsCard({
  article,
  onToggleBookmark,
}: {
  article: NewsArticleDto;
  onToggleBookmark?: (article: NewsArticleDto) => void;
}) {
  const color = CATEGORY_COLOR[article.category] || "#6c63ff";
  const meta = [
    article.sourceName,
    article.author,
    formatNewsTime(article.publishedAt),
  ].filter(Boolean);

  return (
    <article className={`news-card${article.read ? " is-read" : ""}`}>
      {onToggleBookmark ? (
        <button
          type="button"
          className={`news-bookmark${article.bookmarked ? " is-on" : ""}`}
          aria-label={article.bookmarked ? "Remove bookmark" : "Bookmark article"}
          aria-pressed={article.bookmarked}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleBookmark(article);
          }}
        >
          <Bookmark
            size={18}
            fill={article.bookmarked ? "currentColor" : "none"}
            aria-hidden
          />
        </button>
      ) : null}

      <Link
        href={techNewsArticlePath(article.id)}
        className="news-card-hit"
        aria-label={article.title}
      >
        <NewsCover src={article.imageUrl} tint={color} />
        <div className="news-card-body">
          <p className="news-card-cat">{article.category}</p>
          <h3 className="news-card-heading">{article.title}</h3>
          <p className="news-card-summary">{article.summary}</p>
          <div className="news-card-meta">
            {meta.map((item, i) => (
              <span key={`${item}-${i}`}>
                {i > 0 ? <span className="sep" aria-hidden> · </span> : null}
                {item}
              </span>
            ))}
            <span>
              <span className="sep" aria-hidden> · </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Clock size={12} aria-hidden />
                {article.readingMinutes} min
              </span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function ShareButton({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
    } catch {
      /* user cancelled */
    }
  };

  return (
    <button
      type="button"
      onClick={() => void share()}
      aria-label="Share article"
      className="news-toolbar-btn"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        minHeight: 40,
        border: "1px solid var(--border-light)",
        background: "var(--bg-card)",
        color: "var(--text-main)",
        borderRadius: 10,
        padding: "8px 12px",
        fontWeight: 650,
        fontSize: 13,
        cursor: "pointer",
      }}
    >
      <Share2 size={14} aria-hidden /> Share
    </button>
  );
}

export function ExternalSourceLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="news-toolbar-btn"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        minHeight: 40,
        border: "1px solid var(--border-light)",
        background: "var(--bg-card)",
        color: "var(--text-main)",
        borderRadius: 10,
        padding: "8px 12px",
        fontWeight: 650,
        fontSize: 13,
        textDecoration: "none",
      }}
    >
      <ExternalLink size={14} aria-hidden /> Original
    </a>
  );
}
