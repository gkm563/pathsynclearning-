"use client";

import { useRouter } from "next/navigation";
import type { KeyboardEvent } from "react";
import type { NewsArticleDto } from "@/lib/news/types";
import { techNewsArticlePath } from "@/lib/routes";
import {
  CATEGORY_COLOR,
  formatNewsTime,
  NewsCover,
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
    <NewsSection title="Featured">
      <div className="news-featured">
        <FeaturedCard
          article={hero}
          large
          onOpen={() => router.push(techNewsArticlePath(hero.id))}
        />
        <div className="news-featured-side">
          {rest.slice(0, 2).map((a) => (
            <FeaturedCard
              key={a.id}
              article={a}
              onOpen={() => router.push(techNewsArticlePath(a.id))}
            />
          ))}
        </div>
      </div>
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

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  };

  return (
    <button
      type="button"
      onClick={onOpen}
      onKeyDown={onKey}
      className={`news-featured-card ${large ? "news-featured-card--hero" : "news-featured-card--row"}`}
      aria-label={article.title}
    >
      <NewsCover src={article.imageUrl} tint={color} />
      <div className="news-featured-copy">
        <p className="news-card-cat" style={{ marginBottom: 6 }}>
          {article.category}
          <span className="sep" aria-hidden>
            {" "}
            ·{" "}
          </span>
          {formatNewsTime(article.publishedAt)}
        </p>
        <h3 className="news-featured-title">{article.title}</h3>
        {large ? <p className="news-featured-summary">{article.summary}</p> : null}
      </div>
    </button>
  );
}
