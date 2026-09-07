import {
  DEVTO_TAG_CATEGORY,
  NEWS_CATEGORIES,
  type NewsCategory,
} from "@/lib/news/constants";
import type { NormalizedArticle } from "@/lib/news/types";

export function isNewsCategory(value: string): value is NewsCategory {
  return (NEWS_CATEGORIES as readonly string[]).includes(value);
}

export function estimateReadingMinutes(text: string | null | undefined): number {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  if (words <= 0) return 3;
  return Math.max(1, Math.min(30, Math.ceil(words / 200)));
}

export function nonemptyUrl(value: string | null | undefined): string | null {
  const t = (value || "").trim();
  return t ? t : null;
}

/** Dev.to social_image is a generated title card, not a photo. */
export function isGeneratedSocialCard(url: string | null | undefined): boolean {
  if (!url) return true;
  const u = url.toLowerCase();
  return (
    u.includes("social_previews") ||
    u.includes("article_social") ||
    u.includes("social-preview") ||
    u.includes("social_preview") ||
    u.includes("/dynamic/screenshots") ||
    u.includes("opengraph") ||
    u.includes("og-image") ||
    u.includes("/og/")
  );
}

export function pickDevToImage(
  coverImage: string | null | undefined,
  _socialImage?: string | null,
): string | null {
  return nonemptyUrl(coverImage);
}

/** Prefer a real cover photo; drop cached Dev.to title-card images. */
export function resolveNewsImageUrl(
  imageUrl: string | null | undefined,
  raw?: Record<string, unknown> | null,
): string | null {
  if (raw && "cover_image" in raw) {
    const cover = nonemptyUrl(typeof raw.cover_image === "string" ? raw.cover_image : null);
    if (cover && !isGeneratedSocialCard(cover)) return cover;
    return null;
  }
  const stored = nonemptyUrl(imageUrl);
  if (!stored || isGeneratedSocialCard(stored)) return null;
  return stored;
}

export function canonicalizeUrl(raw: string): string {
  try {
    const u = new URL(raw.trim());
    u.hash = "";
    // Strip common tracking params
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref"].forEach(
      (k) => u.searchParams.delete(k),
    );
    let path = u.pathname.replace(/\/+$/, "") || "/";
    return `${u.protocol}//${u.host.toLowerCase()}${path}${u.search}`;
  } catch {
    return raw.trim().toLowerCase();
  }
}

export function categoryFromTags(tags: string[]): NewsCategory {
  for (const tag of tags) {
    const key = tag.toLowerCase().replace(/\s+/g, "");
    const mapped = DEVTO_TAG_CATEGORY[key];
    if (mapped) return mapped;
  }
  return "Programming";
}

export function categoryFromText(title: string, summary: string): NewsCategory {
  const blob = `${title} ${summary}`.toLowerCase();
  if (/ai|machine learning|llm|openai|gpt|neural/.test(blob)) return "AI";
  if (/cyber|security|breach|ransomware|malware/.test(blob)) return "Cybersecurity";
  if (/startup|funding|venture|series [a-c]/.test(blob)) return "Startups";
  if (/cloud|aws|azure|kubernetes|devops/.test(blob)) return "Cloud";
  if (/open.?source|github/.test(blob)) return "Open Source";
  if (/gadget|iphone|android|smartphone|hardware/.test(blob)) return "Gadgets";
  if (/react|next\.?js|css|frontend|web dev|javascript|typescript/.test(blob)) {
    return "Web Development";
  }
  return "Programming";
}

type DevToArticle = {
  id: number;
  title: string;
  description?: string;
  url: string;
  cover_image?: string | null;
  social_image?: string | null;
  published_at?: string;
  readable_publish_date?: string;
  tag_list?: string[] | string;
  user?: { name?: string; username?: string };
  public_reactions_count?: number;
  comments_count?: number;
  reading_time_minutes?: number;
  body_markdown?: string;
  body_html?: string;
};

function tagList(raw: DevToArticle["tag_list"]): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  if (typeof raw === "string" && raw.trim()) {
    return raw.split(",").map((t) => t.trim()).filter(Boolean);
  }
  return [];
}

export function normalizeDevTo(article: DevToArticle): NormalizedArticle | null {
  if (!article?.id || !article.title || !article.url) return null;
  const tags = tagList(article.tag_list);
  const summary = (article.description || "").trim() || article.title;
  const category = categoryFromTags(tags) || categoryFromText(article.title, summary);
  const publishedAt = article.published_at
    ? new Date(article.published_at)
    : new Date();
  if (Number.isNaN(publishedAt.getTime())) return null;

  const popularity =
    Math.max(0, Number(article.public_reactions_count) || 0) * 3 +
    Math.max(0, Number(article.comments_count) || 0);

  return {
    externalId: `devto:${article.id}`,
    canonicalUrl: canonicalizeUrl(article.url),
    title: article.title.trim(),
    summary,
    content: article.body_markdown?.trim() || article.body_html?.trim() || null,
    imageUrl: pickDevToImage(article.cover_image, article.social_image),
    sourceName: "DEV Community",
    sourceUrl: article.url,
    author: article.user?.name || article.user?.username || null,
    category,
    tags,
    publishedAt,
    readingMinutes:
      Number(article.reading_time_minutes) ||
      estimateReadingMinutes(article.body_markdown || article.body_html || summary),
    popularity,
    featured: popularity >= 40,
    provider: "devto",
    raw: article as unknown as Record<string, unknown>,
  };
}

type NewsApiArticle = {
  title?: string;
  description?: string | null;
  content?: string | null;
  url?: string;
  urlToImage?: string | null;
  publishedAt?: string;
  source?: { id?: string | null; name?: string | null };
  author?: string | null;
};

export function normalizeNewsApi(
  article: NewsApiArticle,
  categoryHint?: NewsCategory,
): NormalizedArticle | null {
  if (!article?.title || !article.url) return null;
  const canonicalUrl = canonicalizeUrl(article.url);
  const summary = (article.description || article.content || "").trim() || article.title;
  const category =
    categoryHint || categoryFromText(article.title, summary);
  const publishedAt = article.publishedAt
    ? new Date(article.publishedAt)
    : new Date();
  if (Number.isNaN(publishedAt.getTime())) return null;

  const externalSeed = `${canonicalUrl}|${article.title}`;
  const hash = simpleHash(externalSeed);

  return {
    externalId: `newsapi:${hash}`,
    canonicalUrl,
    title: article.title.trim(),
    summary: summary.slice(0, 600),
    content: article.content?.trim() || null,
    imageUrl: article.urlToImage || null,
    sourceName: article.source?.name?.trim() || "News",
    sourceUrl: article.url,
    author: article.author || null,
    category,
    tags: [category],
    publishedAt,
    readingMinutes: estimateReadingMinutes(summary),
    popularity: 10,
    featured: false,
    provider: "newsapi",
    raw: article as unknown as Record<string, unknown>,
  };
}

function simpleHash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}
