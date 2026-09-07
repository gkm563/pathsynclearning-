import { getChallengeById, listCatalog } from "@/lib/challenges/catalog";
import type {
  ChallengeDailyPack,
  ChallengeDifficulty,
  ChallengeQuestion,
  ChallengeType,
} from "@/lib/challenges/types";

/** Capstones belong in Weekly Boss / Milestones, not the daily pack. */
function isDailyEligible(q: ChallengeQuestion): boolean {
  return q.legacyType !== "MILESTONE";
}

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

class SeededRng {
  private s: number;
  constructor(seed: number) {
    this.s = seed || 1;
  }
  next(): number {
    this.s = (Math.imul(this.s, 1664525) + 1013904223) >>> 0;
    return this.s / 0xffffffff;
  }
  pick<T>(arr: T[]): T | undefined {
    if (!arr.length) return undefined;
    return arr[Math.floor(this.next() * arr.length)];
  }
  shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}

function normalizeGoal(goal: string | null | undefined): string {
  return (goal || "").trim().toLowerCase();
}

function matchesCareer(q: ChallengeQuestion, goal: string): boolean {
  if (!goal) return true;
  return q.careerTags.some((t) => {
    const x = t.toLowerCase();
    return x.includes(goal) || goal.includes(x) || goal.split(/\s+/).some((w) => w.length > 3 && x.includes(w));
  });
}

function matchesTopics(q: ChallengeQuestion, topics: string[]): boolean {
  if (!topics.length) return true;
  const set = topics.map((t) => t.toLowerCase());
  return q.topics.some((t) =>
    set.some((s) => t.includes(s) || s.includes(t)),
  );
}

function weightedDifficulty(rng: SeededRng): ChallengeDifficulty {
  const r = rng.next();
  if (r < 0.3) return "easy";
  if (r < 0.7) return "medium";
  return "hard";
}

function rotateType(rng: SeededRng, dayIndex: number): ChallengeType {
  const order: ChallengeType[] = ["coding", "mcq", "project"];
  const offset = Math.floor(rng.next() * order.length);
  return order[(dayIndex + offset) % order.length];
}

export function filterEligible(
  goal: string | null,
  roadmapTopics: string[],
  syncEnabled: boolean,
): ChallengeQuestion[] {
  const daily = listCatalog().filter(isDailyEligible);
  const catalog = daily.length >= 3 ? daily : listCatalog();
  const g = normalizeGoal(goal);

  let pool = catalog.filter((q) => matchesCareer(q, g));
  if (syncEnabled && roadmapTopics.length) {
    const synced = pool.filter((q) => matchesTopics(q, roadmapTopics));
    if (synced.length >= 3) pool = synced;
  }
  if (pool.length < 3) pool = catalog.filter((q) => matchesCareer(q, g));
  if (pool.length < 3) pool = catalog;
  return pool;
}

export function generateDailyPack(opts: {
  userId: string;
  dateKey: string;
  careerGoal: string | null;
  roadmapTopics: string[];
  syncEnabled: boolean;
  sideCount?: number;
}): ChallengeDailyPack {
  const sideCount = opts.sideCount ?? 4;
  const seed = hashString(
    `${opts.userId}|${opts.dateKey}|${opts.careerGoal || "none"}|sync:${opts.syncEnabled ? 1 : 0}`,
  );
  const rng = new SeededRng(seed);
  const dayIndex = Number(opts.dateKey.replace(/-/g, "")) || 0;
  const pool = filterEligible(
    opts.careerGoal,
    opts.roadmapTopics,
    opts.syncEnabled,
  );

  const wantType = rotateType(rng, dayIndex);
  const wantDiff = weightedDifficulty(rng);

  let featuredPool = pool.filter((q) => q.type === wantType);
  if (!featuredPool.length) featuredPool = pool;
  let featuredDiffPool = featuredPool.filter((q) => q.difficulty === wantDiff);
  if (!featuredDiffPool.length) featuredDiffPool = featuredPool;

  const featured = rng.pick(featuredDiffPool) || pool[0];
  const rest = rng
    .shuffle(pool.filter((q) => q.id !== featured?.id))
    .slice(0, sideCount);

  return {
    dateKey: opts.dateKey,
    featuredId: featured?.id || "",
    sideIds: rest.map((q) => q.id),
    completedIds: [],
  };
}

/** Keep completedIds when refreshing same-day pack identity. */
export function mergeDailyPack(
  existing: ChallengeDailyPack | undefined,
  next: ChallengeDailyPack,
): ChallengeDailyPack {
  if (existing && existing.dateKey === next.dateKey && existing.featuredId) {
    const featured = getChallengeById(existing.featuredId);
    if (featured && isDailyEligible(featured)) {
      return {
        ...existing,
        // keep chosen pack stable for the day
        completedIds: existing.completedIds || [],
      };
    }
  }
  return next;
}
