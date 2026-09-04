import {
  and,
  desc,
  eq,
  ilike,
  inArray,
  lt,
  or,
  sql,
} from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  newsArticles,
  newsBookmarks,
  newsPreferences,
  newsReads,
} from "@/lib/db/schema";
import {
  DEFAULT_CACHE_TTL_MS,
  NEWS_CATEGORIES,
  STALE_CACHE_MAX_MS,
  type NewsCategory,
  type NewsSort,
} from "@/lib/news/constants";
import { isNewsCategory } from "@/lib/news/normalize";
import { fetchAllProviders } from "@/lib/news/providers";
import type {
  NewsArticleDto,
  NewsListQuery,
  NewsListResponse,
  NewsPreferencesDto,
  NormalizedArticle,
} from "@/lib/news/types";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

function cacheTtlMs(): number {
  const mins = Number(env.newsCacheTtlMinutes);
  if (Number.isFinite(mins) && mins > 0) return mins * 60 * 1000;
  return DEFAULT_CACHE_TTL_MS;
}

function toDto(
  row: typeof newsArticles.$inferSelect,
  flags: { bookmarked: boolean; read: boolean },
): NewsArticleDto {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary || "",
    content: row.content,
    imageUrl: row.imageUrl,
    sourceName: row.sourceName,
    sourceUrl: row.sourceUrl,
    canonicalUrl: row.canonicalUrl,
    author: row.author,
    category: row.category,
    tags: Array.isArray(row.tags) ? row.tags : [],
    publishedAt: row.publishedAt.toISOString(),
    readingMinutes: row.readingMinutes,
    popularity: row.popularity,
    featured: row.featured,
    bookmarked: flags.bookmarked,
    read: flags.read,
  };
}

async function upsertArticles(articles: NormalizedArticle[]) {
  if (articles.length === 0) return;
  const db = getDb();
  const now = new Date();

  // Batch upserts — conflict on external_id and canonical_url
  for (const a of articles) {
    try {
      await db
        .insert(newsArticles)
        .values({
          externalId: a.externalId,
          canonicalUrl: a.canonicalUrl,
          title: a.title,
          summary: a.summary,
          content: a.content,
          imageUrl: a.imageUrl,
          sourceName: a.sourceName,
          sourceUrl: a.sourceUrl,
          author: a.author,
          category: a.category,
          tags: a.tags,
          publishedAt: a.publishedAt,
          readingMinutes: a.readingMinutes,
          popularity: a.popularity,
          featured: a.featured,
          provider: a.provider,
          raw: a.raw,
          fetchedAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: newsArticles.externalId,
          set: {
            title: a.title,
            summary: a.summary,
            content: a.content,
            imageUrl: a.imageUrl,
            sourceName: a.sourceName,
            sourceUrl: a.sourceUrl,
            author: a.author,
            category: a.category,
            tags: a.tags,
            publishedAt: a.publishedAt,
            readingMinutes: a.readingMinutes,
            popularity: a.popularity,
            featured: a.featured,
            raw: a.raw,
            fetchedAt: now,
            updatedAt: now,
          },
        });
    } catch (e) {
      // Canonical URL conflict with different external id — skip duplicate
      logger.warn("News upsert skipped", {
        url: a.canonicalUrl,
        message: e instanceof Error ? e.message : String(e),
      });
    }
  }
}

let syncInFlight: Promise<{ stale: boolean; error: string | null }> | null =
  null;

/** Refresh cache if stale. Concurrent callers share one in-flight sync. */
export async function ensureNewsCache(): Promise<{
  stale: boolean;
  error: string | null;
}> {
  if (syncInFlight) return syncInFlight;

  syncInFlight = (async () => {
    const db = getDb();
    const [newest] = await db
      .select({ fetchedAt: newsArticles.fetchedAt })
      .from(newsArticles)
      .orderBy(desc(newsArticles.fetchedAt))
      .limit(1);

    const age = newest
      ? Date.now() - newest.fetchedAt.getTime()
      : Number.POSITIVE_INFINITY;

    if (age < cacheTtlMs()) {
      return { stale: false, error: null };
    }

    const { articles, error } = await fetchAllProviders();
    if (articles.length > 0) {
      await upsertArticles(articles);
      // Mark top popularity as featured
      const top = [...articles]
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 6);
      for (const a of top) {
        await db
          .update(newsArticles)
          .set({ featured: true, updatedAt: new Date() })
          .where(eq(newsArticles.externalId, a.externalId));
      }
      return { stale: false, error: null };
    }

    // Upstream failed — serve stale if we have anything recent enough
    if (newest && age < STALE_CACHE_MAX_MS) {
      return { stale: true, error: error || "Serving cached news" };
    }

    return {
      stale: true,
      error: error || "Unable to load tech news right now",
    };
  })().finally(() => {
    syncInFlight = null;
  });

  return syncInFlight;
}

async function userFlags(userId: string, articleIds: string[]) {
  const bookmarked = new Set<string>();
  const read = new Set<string>();
  if (articleIds.length === 0) return { bookmarked, read };

  const db = getDb();
  const [bRows, rRows] = await Promise.all([
    db
      .select({ articleId: newsBookmarks.articleId })
      .from(newsBookmarks)
      .where(
        and(
          eq(newsBookmarks.userId, userId),
          inArray(newsBookmarks.articleId, articleIds),
        ),
      ),
    db
      .select({ articleId: newsReads.articleId })
      .from(newsReads)
      .where(
        and(eq(newsReads.userId, userId), inArray(newsReads.articleId, articleIds)),
      ),
  ]);
  for (const r of bRows) bookmarked.add(r.articleId);
  for (const r of rRows) read.add(r.articleId);
  return { bookmarked, read };
}

function decodeCursor(cursor: string | undefined): {
  publishedAt: Date;
  id: string;
} | null {
  if (!cursor) return null;
  try {
    const raw = Buffer.from(cursor, "base64url").toString("utf8");
    const [iso, id] = raw.split("|");
    if (!iso || !id) return null;
    const publishedAt = new Date(iso);
    if (Number.isNaN(publishedAt.getTime())) return null;
    return { publishedAt, id };
  } catch {
    return null;
  }
}

function encodeCursor(publishedAt: Date, id: string): string {
  return Buffer.from(`${publishedAt.toISOString()}|${id}`, "utf8").toString(
    "base64url",
  );
}

export async function listNews(
  userId: string,
  query: NewsListQuery,
): Promise<NewsListResponse> {
  const sync = await ensureNewsCache();
  const db = getDb();
  const limit = Math.min(40, Math.max(1, query.limit ?? 18));
  const sort: NewsSort = query.sort === "popular" ? "popular" : "latest";
  const category =
    query.category && isNewsCategory(query.category) ? query.category : undefined;
  const search = query.search?.trim() || undefined;
  const cursor = decodeCursor(query.cursor);

  const conditions = [];

  if (category) {
    conditions.push(eq(newsArticles.category, category));
  }
  if (search) {
    const pattern = `%${search.replace(/[%_]/g, "")}%`;
    conditions.push(
      or(
        ilike(newsArticles.title, pattern),
        ilike(newsArticles.summary, pattern),
        ilike(newsArticles.sourceName, pattern),
      )!,
    );
  }

  if (query.savedOnly) {
    const saved = await db
      .select({ articleId: newsBookmarks.articleId })
      .from(newsBookmarks)
      .where(eq(newsBookmarks.userId, userId));
    const ids = saved.map((s) => s.articleId);
    if (ids.length === 0) {
      return {
        items: [],
        featured: [],
        nextCursor: null,
        total: 0,
        stale: sync.stale,
        categories: [...NEWS_CATEGORIES],
      };
    }
    conditions.push(inArray(newsArticles.id, ids));
  }

  if (cursor) {
    if (sort === "latest") {
      conditions.push(
        or(
          lt(newsArticles.publishedAt, cursor.publishedAt),
          and(
            eq(newsArticles.publishedAt, cursor.publishedAt),
            lt(newsArticles.id, cursor.id),
          ),
        )!,
      );
    } else {
      // popularity cursor uses publishedAt+id as tie-breaker only; simpler offset via id
      conditions.push(lt(newsArticles.id, cursor.id));
    }
  }

  const where = conditions.length ? and(...conditions) : undefined;

  const orderBy =
    sort === "popular"
      ? [desc(newsArticles.popularity), desc(newsArticles.publishedAt)]
      : [desc(newsArticles.publishedAt), desc(newsArticles.id)];

  const rows = await db
    .select()
    .from(newsArticles)
    .where(where)
    .orderBy(...orderBy)
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const flags = await userFlags(
    userId,
    page.map((r) => r.id),
  );

  const items = page.map((r) =>
    toDto(r, {
      bookmarked: flags.bookmarked.has(r.id),
      read: flags.read.has(r.id),
    }),
  );

  const last = page[page.length - 1];
  const nextCursor =
    hasMore && last ? encodeCursor(last.publishedAt, last.id) : null;

  // Featured (ignore cursor / saved filter for homepage feel)
  let featured: NewsArticleDto[] = [];
  if (!query.cursor && !query.savedOnly) {
    const featuredRows = await db
      .select()
      .from(newsArticles)
      .where(
        category
          ? and(eq(newsArticles.featured, true), eq(newsArticles.category, category))
          : eq(newsArticles.featured, true),
      )
      .orderBy(desc(newsArticles.popularity), desc(newsArticles.publishedAt))
      .limit(4);

    const fFlags = await userFlags(
      userId,
      featuredRows.map((r) => r.id),
    );
    featured = featuredRows.map((r) =>
      toDto(r, {
        bookmarked: fFlags.bookmarked.has(r.id),
        read: fFlags.read.has(r.id),
      }),
    );
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(newsArticles)
    .where(where);

  return {
    items,
    featured,
    nextCursor,
    total: Number(count) || items.length,
    stale: sync.stale,
    categories: [...NEWS_CATEGORIES],
  };
}

export async function getArticle(
  userId: string,
  articleId: string,
): Promise<NewsArticleDto | null> {
  await ensureNewsCache();
  const db = getDb();
  const [row] = await db
    .select()
    .from(newsArticles)
    .where(eq(newsArticles.id, articleId))
    .limit(1);
  if (!row) return null;
  const flags = await userFlags(userId, [row.id]);
  return toDto(row, {
    bookmarked: flags.bookmarked.has(row.id),
    read: flags.read.has(row.id),
  });
}

export async function setBookmark(
  userId: string,
  articleId: string,
  bookmarked: boolean,
) {
  const db = getDb();
  const [exists] = await db
    .select({ id: newsArticles.id })
    .from(newsArticles)
    .where(eq(newsArticles.id, articleId))
    .limit(1);
  if (!exists) return null;

  if (bookmarked) {
    await db
      .insert(newsBookmarks)
      .values({ userId, articleId })
      .onConflictDoNothing();
  } else {
    await db
      .delete(newsBookmarks)
      .where(
        and(
          eq(newsBookmarks.userId, userId),
          eq(newsBookmarks.articleId, articleId),
        ),
      );
  }
  return getArticle(userId, articleId);
}

export async function markRead(userId: string, articleId: string) {
  const db = getDb();
  const [exists] = await db
    .select({ id: newsArticles.id })
    .from(newsArticles)
    .where(eq(newsArticles.id, articleId))
    .limit(1);
  if (!exists) return null;

  await db
    .insert(newsReads)
    .values({ userId, articleId, readAt: new Date() })
    .onConflictDoUpdate({
      target: [newsReads.userId, newsReads.articleId],
      set: { readAt: new Date() },
    });

  return getArticle(userId, articleId);
}

export async function getNewsPreferences(
  userId: string,
): Promise<NewsPreferencesDto> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(newsPreferences)
    .where(eq(newsPreferences.userId, userId))
    .limit(1);
  const cats = (row?.categories || []).filter((c) =>
    (NEWS_CATEGORIES as readonly string[]).includes(c),
  );
  return { categories: cats };
}

export async function updateNewsPreferences(
  userId: string,
  categories: string[],
): Promise<NewsPreferencesDto> {
  const db = getDb();
  const clean = [
    ...new Set(
      categories.filter((c) => (NEWS_CATEGORIES as readonly string[]).includes(c)),
    ),
  ];
  await db
    .insert(newsPreferences)
    .values({
      userId,
      categories: clean,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: newsPreferences.userId,
      set: { categories: clean, updatedAt: new Date() },
    });
  return { categories: clean };
}

export { NEWS_CATEGORIES };
export type { NewsCategory };
