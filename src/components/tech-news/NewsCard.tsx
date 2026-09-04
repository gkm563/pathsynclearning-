"use client";

import { Bookmark, Clock, ExternalLink, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import type { NewsArticleDto } from "@/lib/news/types";
import { techNewsArticlePath } from "@/lib/routes";
import {
  CATEGORY_COLOR,
  formatNewsTime,
  newsCardStyle,
} from "@/components/tech-news/shared";

export function NewsCard({
  article,
  onToggleBookmark,
  compact,
}: {
  article: NewsArticleDto;
  onToggleBookmark?: (article: NewsArticleDto) => void;
  compact?: boolean;
}) {
  const router = useRouter();
  const color = CATEGORY_COLOR[article.category] || "#6c63ff";

  const open = () => router.push(techNewsArticlePath(article.id));

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  };

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={open}
      onKeyDown={onKey}
      aria-label={article.title}
      style={{
        ...newsCardStyle,
        cursor: "pointer",
        opacity: article.read ? 0.82 : 1,
        display: "flex",
        flexDirection: "column",
        transition: "border-color 0.15s ease, transform 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${color}66`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-light)";
      }}
    >
      <div
        style={{
          height: compact ? 110 : 150,
          backgroundColor: "var(--bg-alt)",
          backgroundImage: article.imageUrl
            ? `url(${article.imageUrl}), linear-gradient(135deg, ${color}22, var(--bg-alt))`
            : `linear-gradient(135deg, ${color}22, var(--bg-alt))`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          position: "relative",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            fontSize: 11,
            fontWeight: 700,
            color,
            background: "var(--bg-card)",
            border: `1px solid ${color}44`,
            borderRadius: 999,
            padding: "3px 10px",
          }}
        >
          {article.category}
        </span>
        {onToggleBookmark ? (
          <button
            type="button"
            aria-label={article.bookmarked ? "Remove bookmark" : "Bookmark"}
            aria-pressed={article.bookmarked}
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(article);
            }}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              width: 34,
              height: 34,
              borderRadius: 10,
              border: "1.5px solid var(--border-light)",
              background: "var(--bg-card)",
              color: article.bookmarked ? color : "var(--text-muted)",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            <Bookmark
              size={16}
              fill={article.bookmarked ? "currentColor" : "none"}
            />
          </button>
        ) : null}
      </div>

      <div style={{ padding: 16, display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <h3
          style={{
            margin: 0,
            fontFamily: "Outfit, sans-serif",
            fontSize: compact ? 15 : 16,
            fontWeight: 800,
            color: "var(--text-main)",
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {article.title}
        </h3>
        <p
          style={{
            margin: "8px 0 0",
            color: "var(--text-muted)",
            fontSize: 13,
            lineHeight: 1.45,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            flexGrow: 1,
          }}
        >
          {article.summary}
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            alignItems: "center",
            marginTop: 12,
            fontSize: 12,
            color: "var(--text-muted)",
            fontWeight: 600,
          }}
        >
          <span>{article.sourceName}</span>
          <span aria-hidden>·</span>
          <span>{formatNewsTime(article.publishedAt)}</span>
          <span aria-hidden>·</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            <Clock size={12} /> {article.readingMinutes} min
          </span>
        </div>
      </div>
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
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        border: "1.5px solid var(--border-light)",
        background: "var(--bg-card)",
        color: "var(--text-main)",
        borderRadius: 10,
        padding: "8px 12px",
        fontWeight: 700,
        fontSize: 13,
        cursor: "pointer",
        fontFamily: "Outfit, sans-serif",
      }}
    >
      <Share2 size={14} /> Share
    </button>
  );
}

export function ExternalSourceLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        border: "1.5px solid var(--border-light)",
        background: "var(--bg-card)",
        color: "var(--text-main)",
        borderRadius: 10,
        padding: "8px 12px",
        fontWeight: 700,
        fontSize: 13,
        textDecoration: "none",
        fontFamily: "Outfit, sans-serif",
      }}
    >
      <ExternalLink size={14} /> Original
    </a>
  );
}
