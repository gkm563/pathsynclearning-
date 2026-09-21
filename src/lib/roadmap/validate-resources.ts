import "server-only";

import { env } from "@/lib/env";
import type { RoadmapNode, RoadmapNodeResource } from "@/types/roadmap";
import { curatedResourcesForNode } from "@/lib/roadmap/resource-library";
import {
  durationFitsLesson,
  isVideoOnTopic,
  MIN_VIDEO_RELEVANCE,
  MIN_SEARCH_VIDEO_RELEVANCE,
  nodeSearchHaystack,
  parseIsoDuration,
  videoRelevanceScore,
  youtubeSearchQuery,
} from "@/lib/roadmap/video-recommend";
import {
  readYoutubePlayableCache,
  readYoutubeSearchCache,
  writeYoutubePlayableCache,
  writeYoutubeSearchCache,
  type YoutubeSearchHit,
} from "@/lib/roadmap/youtube-cache";

const OEMBED = "https://www.youtube.com/oembed?format=json&url=";

export function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }
    if (u.hostname.includes("youtube.com")) {
      if (u.searchParams.get("v")) return u.searchParams.get("v");
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts[0] === "embed" || parts[0] === "shorts") return parts[1] || null;
    }
  } catch {
    return null;
  }
  return null;
}

async function isYoutubePlayable(url: string): Promise<boolean> {
  const id = extractYoutubeId(url);
  if (!id || id.length < 8) return false;
  const cached = await readYoutubePlayableCache(id);
  if (cached !== null) return cached;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4500);
  try {
    const res = await fetch(`${OEMBED}${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    const ok = res.ok;
    await writeYoutubePlayableCache(id, ok);
    return ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function isHttpOk(url: string): Promise<boolean> {
  if (/youtube\.com|youtu\.be/i.test(url)) return isYoutubePlayable(url);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  try {
    const head = await fetch(url, { method: "HEAD", redirect: "follow", signal: controller.signal });
    if (head.ok) return true;
    const get = await fetch(url, { method: "GET", redirect: "follow", signal: controller.signal });
    return get.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

type YtSearchHit = YoutubeSearchHit;

async function youtubeSearchLive(query: string, max = 5): Promise<YtSearchHit[]> {
  const key = env.youtubeApiKey;
  if (!key) return [];
  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: String(Math.min(12, Math.max(8, max * 2))),
    videoEmbeddable: "true",
    videoSyndicated: "true",
    safeSearch: "strict",
    relevanceLanguage: "en",
    videoDefinition: "any",
    key,
  });
  const searchRes = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`);
  if (!searchRes.ok) return [];
  const searchJson = (await searchRes.json()) as {
    items?: Array<{ id?: { videoId?: string }; snippet?: { title?: string; channelTitle?: string; channelId?: string; publishedAt?: string } }>;
  };
  const ids = (searchJson.items || [])
    .map((i) => i.id?.videoId)
    .filter((id): id is string => Boolean(id));
  if (!ids.length) return [];

  const detailsParams = new URLSearchParams({
    part: "status,snippet,contentDetails",
    id: ids.join(","),
    key,
  });
  const detailsRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?${detailsParams.toString()}`);
  if (!detailsRes.ok) return [];
  const details = (await detailsRes.json()) as {
    items?: Array<{
      id: string;
      status?: { privacyStatus?: string; embeddable?: boolean; uploadStatus?: string };
      snippet?: { title?: string; channelTitle?: string; channelId?: string; publishedAt?: string; liveBroadcastContent?: string };
      contentDetails?: { duration?: string };
    }>;
  };

  const seenChannels = new Set<string>();
  const hits: YtSearchHit[] = [];
  const twoYearsAgo = Date.now() - 1000 * 60 * 60 * 24 * 1200;

  for (const item of details.items || []) {
    const status = item.status;
    const snippet = item.snippet;
    if (status?.privacyStatus !== "public") continue;
    if (status?.embeddable === false) continue;
    if (status?.uploadStatus && status.uploadStatus !== "processed") continue;
    if (snippet?.liveBroadcastContent && snippet.liveBroadcastContent !== "none") continue;
    const seconds = parseIsoDuration(item.contentDetails?.duration);
    if (!durationFitsLesson(seconds, "any")) continue;
    const published = snippet?.publishedAt ? Date.parse(snippet.publishedAt) : Date.now();
    if (Number.isFinite(published) && published < twoYearsAgo && hits.length >= 3) {
      continue;
    }
    const channelId = snippet?.channelId || snippet?.channelTitle || item.id;
    if (seenChannels.has(channelId) && hits.length >= 2) continue;
    seenChannels.add(channelId);
    hits.push({
      title: snippet?.title || "YouTube lesson",
      url: `https://www.youtube.com/watch?v=${item.id}`,
      channel: snippet?.channelTitle || "YouTube",
      seconds,
    });
    if (hits.length >= max) break;
  }
  return hits;
}

async function youtubeSearch(query: string, max = 5): Promise<YtSearchHit[]> {
  const cached = await readYoutubeSearchCache(query);
  if (cached) return cached.slice(0, max);
  const hits = await youtubeSearchLive(query, max);
  await writeYoutubeSearchCache(query, hits);
  return hits;
}

function uniqueResources(list: RoadmapNodeResource[]): RoadmapNodeResource[] {
  const seen = new Set<string>();
  const out: RoadmapNodeResource[] = [];
  for (const r of list) {
    const key = (r.url || "").split("&")[0].trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

function rankVideos(hay: string, videos: RoadmapNodeResource[]): RoadmapNodeResource[] {
  return videos
    .map((r) => ({ r, score: videoRelevanceScore(hay, r.title, r.channel) }))
    .filter((row) => row.score >= MIN_VIDEO_RELEVANCE)
    .sort((a, b) => b.score - a.score)
    .map(({ r }, i) => ({ ...r, suggested: i > 0 }));
}

export async function enrichNodeResources(nodes: RoadmapNode[]): Promise<RoadmapNode[]> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return mapPool(nodes, 4, async (node) => {
    if (!["skill", "topic", "project", "checkpoint", "resource"].includes(node.type)) {
      return node;
    }

    const parentTitle = node.parentId ? byId.get(node.parentId)?.title : undefined;
    const hay = nodeSearchHaystack(node, parentTitle);
    const curated = curatedResourcesForNode(hay);
    const existing = (node.resources || []).filter((r) => {
      if (r.type !== "video") return true;
      return isVideoOnTopic(hay, r.title, r.channel);
    });

    const merged = uniqueResources([...existing, ...curated]).slice(0, 12);
    const playableChecks = await mapPool(merged, 5, async (r) => ({ r, ok: await isHttpOk(r.url) }));
    let kept = playableChecks.filter((x) => x.ok).map((x) => x.r);
    kept = kept.filter((r) => r.type !== "video" || isVideoOnTopic(hay, r.title, r.channel));

    const videoCount = kept.filter((r) => r.type === "video").length;
    if (videoCount < 2) {
      try {
        const extra = await youtubeSearch(youtubeSearchQuery(node), 8);
        const ranked = extra
          .map((hit) => ({
            hit,
            score: videoRelevanceScore(hay, hit.title, hit.channel),
          }))
          .filter((row) => row.score >= MIN_SEARCH_VIDEO_RELEVANCE)
          .sort((a, b) => b.score - a.score);
        for (const { hit } of ranked) {
          kept.push({
            title: hit.title,
            url: hit.url,
            type: "video",
            channel: hit.channel,
            suggested: true,
          });
        }
      } catch {
        // keep curated/validated only
      }
    }

    const videos = rankVideos(
      hay,
      uniqueResources(kept).filter((r) => r.type === "video"),
    );
    const others = uniqueResources(kept)
      .filter((r) => r.type !== "video")
      .map((r) => ({ ...r, suggested: true as const }));

    let resources = [...videos, ...others].slice(0, 8);
    if (resources.length === 0 && curated.length) {
      resources = curated.slice(0, 4).map((r, i) => ({
        ...r,
        suggested: r.type === "video" ? i > 0 : true,
      }));
    }

    return { ...node, resources };
  });
}
