import type { RoadmapNode } from "@/types/roadmap";

const STOP = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "into",
  "your",
  "this",
  "that",
  "full",
  "free",
  "easy",
  "course",
  "crash",
  "guide",
  "intro",
  "introduction",
  "basics",
  "beginner",
  "beginners",
  "advanced",
  "complete",
  "tutorial",
  "tutorials",
  "essentials",
  "fundamentals",
  "overview",
  "learn",
  "learning",
  "video",
  "youtube",
  "watch",
  "part",
  "hour",
  "hours",
  "minute",
  "minutes",
]);

const SYNONYMS: Record<string, string[]> = {
  dsa: ["structures", "algorithms", "leetcode", "arrays"],
  structures: ["dsa", "algorithms"],
  algorithms: ["dsa", "structures"],
  leetcode: ["dsa", "neetcode"],
  cryptography: ["encryption", "crypto", "cipher", "hashing"],
  crypto: ["cryptography", "encryption"],
  encryption: ["cryptography", "aes", "cipher"],
  hashing: ["hash", "sha", "digest"],
  arrays: ["array", "dsa"],
  networking: ["network", "tcp", "http"],
  network: ["networking", "tcp"],
};

const TRUSTED_CHANNELS = [
  "freecodecamp",
  "traversy media",
  "fireship",
  "computerphile",
  "crashcourse",
  "crash course",
  "3blue1brown",
  "networkchuck",
  "neetcode",
  "abdul bari",
  "statquest",
  "bytebytego",
  "techworld with nana",
  "mit opencourseware",
  "cs50",
  "harvard",
  "khan academy",
  "neso academy",
  "gate smashers",
  "liveoverflow",
  "professor messer",
  "powercert",
  "hussein nasser",
  "programming with mosh",
  "bro code",
];

/** Topic words that must not leak into unrelated lessons. */
const DOMAIN_MARKERS: Array<{ re: RegExp; tokens: string[] }> = [
  { re: /\b(data structures?|dsa|leetcode|neetcode)\b/, tokens: ["dsa", "leetcode", "structures"] },
  { re: /\b(react|next\.?js|jsx)\b/, tokens: ["react", "nextjs", "jsx"] },
  { re: /\b(kubernetes|docker|k8s)\b/, tokens: ["kubernetes", "docker"] },
  { re: /\bmachine learning|pytorch|tensorflow\b/, tokens: ["pytorch", "tensorflow"] },
];

export const MIN_VIDEO_RELEVANCE = 2;
export const MIN_SEARCH_VIDEO_RELEVANCE = 3;

export function topicTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#]+/g, " ")
    .split(/\s+/)
    .map((t) => (t === "js" ? "javascript" : t === "ts" ? "typescript" : t === "k8s" ? "kubernetes" : t))
    .filter((t) => t.length > 2 && !STOP.has(t) && !/^\d+$/.test(t));
}

export function nodeSearchHaystack(
  node: Pick<RoadmapNode, "title" | "skills" | "topics" | "description" | "subtopics">,
  parentTitle?: string,
): string {
  return [
    parentTitle,
    node.title,
    ...(node.skills || []),
    ...(node.topics || []),
    ...((node.subtopics || []).map((s) => s.title)),
  ]
    .filter(Boolean)
    .join(" ");
}

export function youtubeSearchQuery(node: Pick<RoadmapNode, "title" | "skills" | "topics">): string {
  const title = (node.title || "").replace(/\s+[—|:].*$/, "").trim();
  const extra = [...(node.skills || []), ...(node.topics || [])]
    .map((s) => s.trim())
    .find((s) => s.length > 2 && !new RegExp(title, "i").test(s));
  const hay = `${title} ${extra || ""}`.toLowerCase();
  const negatives: string[] = [];
  if (!/\b(dsa|data structures?|leetcode|array|graph|tree)\b/.test(hay)) {
    negatives.push('-"data structures"', "-leetcode");
  }
  if (!/\breact\b/.test(hay)) negatives.push("-react");
  const core = extra && extra.length < 40 ? `${title} ${extra}` : title;
  return `${core} tutorial explained ${negatives.join(" ")}`.trim().slice(0, 120);
}

export function parseIsoDuration(iso?: string): number {
  if (!iso) return 0;
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i);
  if (!m) return 0;
  return Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0);
}

function trustedChannelBonus(channel?: string): number {
  if (!channel) return 0;
  const c = channel.toLowerCase();
  return TRUSTED_CHANNELS.some((name) => c.includes(name)) ? 1.2 : 0;
}

function domainLeakPenalty(nodeHay: string, videoTitle: string): number {
  const hay = nodeHay.toLowerCase();
  const title = videoTitle.toLowerCase();
  let penalty = 0;
  for (const marker of DOMAIN_MARKERS) {
    if (marker.re.test(title) && !marker.re.test(hay)) {
      penalty += 4;
    }
  }
  return penalty;
}

export function videoRelevanceScore(nodeHay: string, videoTitle: string, channel?: string): number {
  const nodeToks = topicTokens(nodeHay);
  const titleToks = topicTokens(`${videoTitle} ${channel || ""}`);
  if (!nodeToks.length) return 0;

  let score = trustedChannelBonus(channel);
  const titleSet = new Set(titleToks);
  for (const tok of nodeToks) {
    if (titleSet.has(tok)) {
      score += tok.length >= 6 ? 3 : 2;
      continue;
    }
    if ((SYNONYMS[tok] || []).some((s) => titleSet.has(s))) {
      score += 1.6;
      continue;
    }
    const partial = titleToks.some(
      (t) => t.length >= 5 && tok.length >= 5 && (t.includes(tok) || tok.includes(t)),
    );
    if (partial) score += 1.4;
  }

  const titleWeight = topicTokens(nodeHay.split(" ").slice(0, 8).join(" "));
  if (titleWeight.some((t) => titleSet.has(t))) score += 1.5;

  score -= domainLeakPenalty(nodeHay, videoTitle);
  return score;
}

export function isVideoOnTopic(nodeHay: string, videoTitle: string, channel?: string): boolean {
  return videoRelevanceScore(nodeHay, videoTitle, channel) >= MIN_VIDEO_RELEVANCE;
}

export function durationFitsLesson(seconds: number, role: "core" | "any" = "any"): boolean {
  if (!seconds) return true;
  if (seconds < 90) return false;
  if (seconds > 8 * 3600) return false;
  if (role === "core" && seconds < 4 * 60) return false;
  return true;
}
