import "server-only";

import { eq } from "drizzle-orm";
import { env } from "@/lib/env";
import { getDb } from "@/lib/db/client";
import { youtubeOembedCache, youtubeSearchCache } from "@/lib/db/schema";

export type YoutubeSearchHit = {
  title: string;
  url: string;
  channel: string;
  seconds: number;
};

const EMPTY_TTL_MS = 24 * 60 * 60 * 1000;
const OEMBED_TTL_MS = 14 * 24 * 60 * 60 * 1000;

export function youtubeQueryCacheKey(query: string): string {
  return query.toLowerCase().replace(/\s+/g, " ").trim().slice(0, 240);
}

function searchTtlMs() {
  return env.youtubeCacheTtlDays * 24 * 60 * 60 * 1000;
}

export async function readYoutubeSearchCache(query: string): Promise<YoutubeSearchHit[] | null> {
  const queryKey = youtubeQueryCacheKey(query);
  if (!queryKey) return null;
  try {
    const db = getDb();
    const [row] = await db
      .select()
      .from(youtubeSearchCache)
      .where(eq(youtubeSearchCache.queryKey, queryKey))
      .limit(1);
    if (!row) return null;
    const age = Date.now() - row.fetchedAt.getTime();
    const ttl = row.hits.length ? searchTtlMs() : EMPTY_TTL_MS;
    if (age > ttl) return null;
    return Array.isArray(row.hits) ? row.hits : [];
  } catch (err) {
    console.warn("[youtube-cache] read search failed", err);
    return null;
  }
}

export async function writeYoutubeSearchCache(query: string, hits: YoutubeSearchHit[]): Promise<void> {
  const queryKey = youtubeQueryCacheKey(query);
  if (!queryKey) return;
  try {
    const db = getDb();
    await db
      .insert(youtubeSearchCache)
      .values({ queryKey, hits, fetchedAt: new Date() })
      .onConflictDoUpdate({
        target: youtubeSearchCache.queryKey,
        set: { hits, fetchedAt: new Date() },
      });
  } catch (err) {
    console.warn("[youtube-cache] write search failed", err);
  }
}

export async function readYoutubePlayableCache(videoId: string): Promise<boolean | null> {
  if (!videoId) return null;
  try {
    const db = getDb();
    const [row] = await db
      .select()
      .from(youtubeOembedCache)
      .where(eq(youtubeOembedCache.videoId, videoId))
      .limit(1);
    if (!row) return null;
    if (Date.now() - row.checkedAt.getTime() > OEMBED_TTL_MS) return null;
    return row.playable;
  } catch {
    return null;
  }
}

export async function writeYoutubePlayableCache(videoId: string, playable: boolean): Promise<void> {
  if (!videoId) return;
  try {
    const db = getDb();
    await db
      .insert(youtubeOembedCache)
      .values({ videoId, playable, checkedAt: new Date() })
      .onConflictDoUpdate({
        target: youtubeOembedCache.videoId,
        set: { playable, checkedAt: new Date() },
      });
  } catch (err) {
    console.warn("[youtube-cache] write oembed failed", err);
  }
}
