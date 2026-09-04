"use client";

import { useRouter } from "next/navigation";
import type { NewsArticleDto } from "@/lib/news/types";
import { techNewsArticlePath } from "@/lib/routes";
import {
  CATEGORY_COLOR,
  formatNewsTime,
  NewsSection,
} from "@/components/tech-news/shared";

export function FeaturedStories({
  articles,
}: {
  articles: NewsArticleDto[];
}) {
  const router = useRouter();
  if (articles.length === 0) return null;

  const [hero, ...rest] = articles;

  return (
    <NewsSection title="Featured stories">
      <div
        className="news-featured"
        style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 14,
        }}
      >
        <FeaturedCard
          article={hero}
          large
          onOpen={() => router.push(techNewsArticlePath(hero.id))}
        />
        <div style={{ display: "grid", gap: 14 }}>
          {rest.slice(0, 2).map((a) => (
            <FeaturedCard
              key={a.id}
              article={a}
              onOpen={() => router.push(techNewsArticlePath(a.id))}
            />
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 860px) {
          .news-featured { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </NewsSection>
  );
}

function FeaturedCard({
  article,
  large,
  onOpen,
}: {
  article: NewsArticleDto;
  large?: boolean;
  onOpen: () => void;
}) {
  const color = CATEGORY_COLOR[article.category] || "#6c63ff";
  return (
    <button
      type="button"
      onClick={onOpen}
      style={{
        textAlign: "left",
        border: "1.5px solid var(--border-light)",
        borderRadius: 16,
        overflow: "hidden",
        background: "var(--bg-card)",
        cursor: "pointer",
        padding: 0,
        display: "grid",
        gridTemplateColumns: large ? "1fr" : "120px 1fr",
        minHeight: large ? 280 : 110,
      }}
    >
      <div
        style={{
          minHeight: large ? 160 : 110,
          backgroundColor: "var(--bg-alt)",
          backgroundImage: article.imageUrl
            ? `url(${article.imageUrl}), linear-gradient(135deg, ${color}33, var(--bg-alt))`
            : `linear-gradient(135deg, ${color}33, var(--bg-alt))`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div style={{ padding: large ? 18 : 14 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color,
            marginBottom: 6,
          }}
        >
          {article.category} · {formatNewsTime(article.publishedAt)}
        </div>
        <div
          style={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 800,
            fontSize: large ? 22 : 15,
            color: "var(--text-main)",
            lineHeight: 1.3,
          }}
        >
          {article.title}
        </div>
        {large ? (
          <p
            style={{
              margin: "10px 0 0",
              color: "var(--text-muted)",
              fontSize: 14,
              lineHeight: 1.45,
            }}
          >
            {article.summary}
          </p>
        ) : null}
      </div>
    </button>
  );
}
