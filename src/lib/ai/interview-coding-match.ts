import "server-only";
import { getChallengeBySlug, listCatalog } from "@/lib/challenges/catalog";
import { codingProblemFromCatalog } from "./interview-plan";
import type { InterviewCodingProblem } from "./interview-types";

const TOPIC_ALIASES: Array<{ keys: string[]; slug: string }> = [
  { keys: ["rate limit", "rate limiter", "throttl", "api request"], slug: "sliding-window-rate-limit" },
  { keys: ["buy and sell", "max profit", "stock price"], slug: "best-time-to-buy-sell-stock" },
  { keys: ["search insert"], slug: "search-insert-position" },
  { keys: ["two sum"], slug: "two-sum" },
  { keys: ["contains duplicate"], slug: "contains-duplicate" },
  { keys: ["valid parentheses", "balanced paren"], slug: "valid-parentheses" },
  { keys: ["reverse string"], slug: "reverse-string" },
  { keys: ["climbing stair"], slug: "climbing-stairs" },
];

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function catalogMatch(blob: string): InterviewCodingProblem | null {
  for (const alias of TOPIC_ALIASES) {
    if (!alias.keys.some((key) => blob.includes(key))) continue;
    const hit = getChallengeBySlug(alias.slug);
    if (hit?.type === "coding") return codingProblemFromCatalog(hit);
  }

  let best: InterviewCodingProblem | null = null;
  let bestScore = 0;
  for (const item of listCatalog().filter((q) => q.type === "coding" && q.prompt)) {
    const title = normalize(item.title);
    if (title.length < 4) continue;
    let score = 0;
    if (blob.includes(title)) score += 10;
    for (const word of title.split(" ").filter((part) => part.length > 3)) {
      if (blob.includes(word)) score += 2;
    }
    if (score > bestScore) {
      bestScore = score;
      best = codingProblemFromCatalog(item);
    }
  }
  return bestScore >= 6 ? best : null;
}

function titleFromInvite(text: string): string | null {
  const patterns = [
    /write (?:a |an |the )?(?:simple |tiny |basic |small )?([^,.?!]+?)(?: that| which| using| to |,|\.|$)/i,
    /implement (?:a |an |the )?(?:simple |tiny |basic )?([^,.?!]+?)(?: that| which| using| to |,|\.|$)/i,
    /code (?:up |out )?(?:a |an |the )?([^,.?!]{4,80})/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    const raw = match?.[1]?.replace(/\s+/g, " ").trim();
    if (raw && raw.length >= 4 && raw.length <= 80) return titleCase(raw);
  }
  return null;
}

function titleCase(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function camelName(title: string) {
  const words = title.replace(/[^a-zA-Z0-9]+/g, " ").trim().split(" ").filter(Boolean);
  if (!words.length) return "solve";
  return words
    .map((word, i) =>
      i === 0 ? word.toLowerCase() : word[0].toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join("");
}

function adHocProblem(title: string, reply: string): InterviewCodingProblem {
  const fn = camelName(title);
  return {
    slug: `live-${fn}`,
    title,
    difficulty: "medium",
    prompt: reply.replace(/\s+/g, " ").trim().slice(0, 800),
    starterCode: `function ${fn}() {\n  \n}\n`,
  };
}

export function resolveInterviewCodingProblem(input: {
  reply: string;
  history: Array<{ role: string; content: string }>;
  fallback: InterviewCodingProblem | null;
}): InterviewCodingProblem | null {
  const recent = [
    ...input.history.slice(-10).map((turn) => turn.content),
    input.reply,
  ].join("\n");
  const blob = normalize(recent);
  const fallbackTitle = input.fallback?.title ? normalize(input.fallback.title) : "";
  if (fallbackTitle && fallbackTitle.length > 4 && blob.includes(fallbackTitle)) {
    return input.fallback;
  }

  const matched = catalogMatch(blob);
  if (matched) return matched;

  const named = titleFromInvite(input.reply);
  if (named) {
    const namedMatch = catalogMatch(normalize(named));
    return namedMatch ?? adHocProblem(named, input.reply);
  }

  return input.fallback;
}
