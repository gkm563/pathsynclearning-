import type { NewsCategory, NewsSort } from "@/lib/news/constants";

export type NewsArticleDto = {
  id: string;
  title: string;
  summary: string;
  content: string | null;
  imageUrl: string | null;
  sourceName: string;
  sourceUrl: string | null;
  canonicalUrl: string;
  author: string | null;
  category: NewsCategory | string;
  tags: string[];
  publishedAt: string;
  readingMinutes: number;
  popularity: number;
  featured: boolean;
  bookmarked: boolean;
  read: boolean;
};

export type NewsListResponse = {
  items: NewsArticleDto[];
  featured: NewsArticleDto[];
  nextCursor: string | null;
  total: number;
  stale: boolean;
  categories: string[];
};

export type NewsPreferencesDto = {
  categories: string[];
};

export type NormalizedArticle = {
  externalId: string;
  canonicalUrl: string;
  title: string;
  summary: string;
  content: string | null;
  imageUrl: string | null;
  sourceName: string;
  sourceUrl: string | null;
  author: string | null;
  category: NewsCategory;
  tags: string[];
  publishedAt: Date;
  readingMinutes: number;
  popularity: number;
  featured: boolean;
  provider: string;
  raw: Record<string, unknown>;
};

export type NewsListQuery = {
  category?: string;
  search?: string;
  sort?: NewsSort;
  cursor?: string;
  limit?: number;
  savedOnly?: boolean;
};
