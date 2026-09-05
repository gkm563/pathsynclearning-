import "server-only";

import { env } from "@/lib/env";
import type { RoadmapNode, RoadmapNodeResource } from "@/types/roadmap";
import { curatedResourcesForNode } from "@/lib/roadmap/resource-library";

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
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4500);
  try {
    const res = await fetch(`${OEMBED}${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    return res.ok;
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

type YtSearchHit = { title: string; url: string; channel: string };

async function youtubeSearch(query: string, max = 5): Promise<YtSearchHit[]> {
  const key = env.youtubeApiKey;
  if (!key) return [];
  const params = new URLSearchParams({
    part: "snippet",
    q: query,
    type: "video",
    maxResults: String(Math.min(10, max * 2)),
    videoEmbeddable: "true",
    videoSyndicated: "true",
    safeSearch: "strict",
    relevanceLanguage: "en",
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
    }>;
  };

  const seenChannels = new Set<string>();
  const hits: YtSearchHit[] = [];
  const twoYearsAgo = Date.now() - 1000 * 60 * 60 * 24 * 800;

  for (const item of details.items || []) {
    const status = item.status;
    const snippet = item.snippet;
    if (status?.privacyStatus !== "public") continue;
    if (status?.embeddable === false) continue;
    if (status?.uploadStatus && status.uploadStatus !== "processed") continue;
    if (snippet?.liveBroadcastContent && snippet.liveBroadcastContent !== "none") continue;
    const published = snippet?.publishedAt ? Date.parse(snippet.publishedAt) : Date.now();
    if (Number.isFinite(published) && published < twoYearsAgo && hits.length >= 2) {
      // Prefer fresher videos after we already have a couple of classics.
      continue;
    }
    const channelId = snippet?.channelId || snippet?.channelTitle || item.id;
    if (seenChannels.has(channelId) && hits.length >= 2) continue;
    seenChannels.add(channelId);
    hits.push({
      title: snippet?.title || "YouTube lesson",
      url: `https://www.youtube.com/watch?v=${item.id}`,
      channel: snippet?.channelTitle || "YouTube",
    });
    if (hits.length >= max) break;
  }
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

export async function enrichNodeResources(nodes: RoadmapNode[]): Promise<RoadmapNode[]> {
  return mapPool(nodes, 4, async (node) => {
    if (!["skill", "topic", "project", "checkpoint", "resource"].includes(node.type)) {
      return node;
    }

    const hay = `${node.title} ${node.skills?.join(" ") || ""} ${node.topics?.join(" ") || ""}`;
    const curated = curatedResourcesForNode(hay).map((r) => ({ ...r, suggested: true as const }));
    const existing = (node.resources || []).map((r) => ({
      ...r,
      suggested: r.suggested === true,
    }));
    const merged = uniqueResources([...existing, ...curated]).slice(0, 10);

    const playableChecks = await mapPool(merged, 5, async (r) => ({ r, ok: await isHttpOk(r.url) }));
    let kept = playableChecks.filter((x) => x.ok).map((x) => x.r);

    const videoCount = kept.filter((r) => r.type === "video").length;
    if (videoCount < 3) {
      const query = `${node.title} tutorial programming`;
      try {
        const extra = await youtubeSearch(query, 4);
        for (const hit of extra) {
          kept.push({
            title: `${hit.title} (${hit.channel})`,
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

    kept = uniqueResources(kept).slice(0, 8);
    if (kept.length === 0 && curated.length) {
      kept = curated.slice(0, 4);
    }

    return { ...node, resources: kept };
  });
}
