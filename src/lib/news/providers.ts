import {
  NEWS_CATEGORIES,
  NEWSAPI_CATEGORY_QUERY,
  type NewsCategory,
} from "@/lib/news/constants";
import { normalizeDevTo, normalizeNewsApi } from "@/lib/news/normalize";
import type { NormalizedArticle } from "@/lib/news/types";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

const DEVTO_BASE = "https://dev.to/api/articles";

async function fetchJson<T>(
  url: string,
  init?: RequestInit,
): Promise<{ ok: true; data: T } | { ok: false; status: number; message: string }> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init?.headers || {}),
      },
      next: { revalidate: 0 },
    });
    if (res.status === 429) {
      return { ok: false, status: 429, message: "Upstream rate limited" };
    }
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        message: `Upstream error ${res.status}`,
      };
    }
    const data = (await res.json()) as T;
    return { ok: true, data };
  } catch (e) {
    return {
      ok: false,
      status: 0,
      message: e instanceof Error ? e.message : "Network error",
    };
  }
}

/** Fetch recent Dev.to articles across tech tags. */
export async function fetchDevToArticles(): Promise<{
  articles: NormalizedArticle[];
  error: string | null;
}> {
  const tagQueries = [
    "ai",
    "javascript",
    "webdev",
    "security",
    "cloud",
    "opensource",
    "startup",
    "programming",
  ];

  const results = await Promise.all(
    tagQueries.map((tag) =>
      fetchJson<unknown[]>(`${DEVTO_BASE}?per_page=12&tag=${encodeURIComponent(tag)}`),
    ),
  );

  const byExternal = new Map<string, NormalizedArticle>();
  let lastError: string | null = null;
  let anyOk = false;

  for (const result of results) {
    if (result.ok === false) {
      lastError = result.message;
      continue;
    }
    anyOk = true;
    for (const raw of result.data) {
      const normalized = normalizeDevTo(raw as Parameters<typeof normalizeDevTo>[0]);
      if (!normalized) continue;
      const prev = byExternal.get(normalized.externalId);
      if (!prev || normalized.popularity > prev.popularity) {
        byExternal.set(normalized.externalId, normalized);
      }
    }
  }

  // Also pull top/popular without tag for broader coverage
  const top = await fetchJson<unknown[]>(`${DEVTO_BASE}?per_page=20&top=7`);
  if (top.ok === true) {
    anyOk = true;
    for (const raw of top.data) {
      const normalized = normalizeDevTo(raw as Parameters<typeof normalizeDevTo>[0]);
      if (!normalized) continue;
      const prev = byExternal.get(normalized.externalId);
      if (!prev || normalized.popularity > prev.popularity) {
        byExternal.set(normalized.externalId, {
          ...normalized,
          featured: normalized.featured || normalized.popularity >= 25,
        });
      }
    }
  } else if (!anyOk) {
    lastError = top.message;
  }

  return {
    articles: [...byExternal.values()],
    error: anyOk ? null : lastError,
  };
}

/** Optional NewsAPI.org enrichment when NEWS_API_KEY is set. */
export async function fetchNewsApiArticles(): Promise<{
  articles: NormalizedArticle[];
  error: string | null;
}> {
  const key = env.newsApiKey;
  if (!key) return { articles: [], error: null };

  const byUrl = new Map<string, NormalizedArticle>();
  let lastError: string | null = null;
  let anyOk = false;

  // Limit to a subset of categories to stay within free-tier quotas
  const cats = NEWS_CATEGORIES.slice(0, 4) as NewsCategory[];

  for (const category of cats) {
    const q = NEWSAPI_CATEGORY_QUERY[category];
    const url =
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}` +
      `&language=en&sortBy=publishedAt&pageSize=8`;
    const result = await fetchJson<{ articles?: unknown[] }>(url, {
      headers: { "X-Api-Key": key },
    });
    if (result.ok === false) {
      lastError = result.message;
      if (result.status === 429) break;
      continue;
    }
    anyOk = true;
    for (const raw of result.data.articles || []) {
      const normalized = normalizeNewsApi(
        raw as Parameters<typeof normalizeNewsApi>[0],
        category,
      );
      if (!normalized) continue;
      if (!byUrl.has(normalized.canonicalUrl)) {
        byUrl.set(normalized.canonicalUrl, normalized);
      }
    }
  }

  return {
    articles: [...byUrl.values()],
    error: anyOk ? null : lastError,
  };
}

export async function fetchAllProviders(): Promise<{
  articles: NormalizedArticle[];
  error: string | null;
}> {
  const [devto, newsapi] = await Promise.all([
    fetchDevToArticles(),
    fetchNewsApiArticles(),
  ]);

  const byCanonical = new Map<string, NormalizedArticle>();
  for (const a of [...devto.articles, ...newsapi.articles]) {
    const prev = byCanonical.get(a.canonicalUrl);
    if (!prev || a.popularity > prev.popularity) {
      byCanonical.set(a.canonicalUrl, a);
    }
  }

  const articles = [...byCanonical.values()];
  if (articles.length === 0) {
    const err = devto.error || newsapi.error || "No articles from upstream";
    logger.warn("Tech news upstream empty", { error: err });
    return { articles: [], error: err };
  }

  return { articles, error: null };
}

/** Single-article payload includes body_markdown / body_html; the list API does not. */
export async function fetchDevToFullArticle(
  externalId: string,
  sourceUrl?: string | null,
): Promise<NormalizedArticle | null> {
  const numericId = externalId.match(/^devto:(\d+)$/)?.[1];
  const urls: string[] = [];
  if (numericId) urls.push(`${DEVTO_BASE}/${numericId}`);

  if (sourceUrl) {
    try {
      const u = new URL(sourceUrl);
      if (u.hostname.replace(/^www\./, "") === "dev.to") {
        const parts = u.pathname.split("/").filter(Boolean);
        if (parts.length >= 2) {
          urls.push(
            `${DEVTO_BASE}/${encodeURIComponent(parts[0])}/${encodeURIComponent(parts[1])}`,
          );
        }
      }
    } catch {
      /* ignore */
    }
  }

  for (const url of urls) {
    const result = await fetchJson<Parameters<typeof normalizeDevTo>[0]>(url);
    if (result.ok === false) continue;
    const normalized = normalizeDevTo(result.data);
    if (normalized?.content) return normalized;
  }
  return null;
}
