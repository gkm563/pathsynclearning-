import { listCatalog } from "@/lib/challenges/catalog";
import { weekKeyNow } from "@/lib/challenges/progress";
import type {
  ChallengeProgressState,
  ChallengeQuestion,
  ChallengeWeeklyBoss,
  MilestoneInfo,
  WeaknessCoach,
} from "@/lib/challenges/types";

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function generateWeeklyBoss(opts: {
  userId: string;
  weekKey?: string;
  careerGoal: string | null;
}): ChallengeWeeklyBoss {
  const weekKey = opts.weekKey || weekKeyNow();
  const catalog = listCatalog();
  const bosses = catalog.filter((q) => q.weeklyBossEligible || q.difficulty === "hard");
  const pool = bosses.length ? bosses : catalog.filter((q) => q.type === "project");
  const seed = hashString(`${opts.userId}|${weekKey}|boss|${opts.careerGoal || ""}`);
  const boss = pool[seed % pool.length] || catalog[0];
  const parts = catalog
    .filter((q) => q.id !== boss?.id && q.difficulty !== "hard")
    .sort((a, b) => {
      const ha = hashString(`${seed}|${a.id}`);
      const hb = hashString(`${seed}|${b.id}`);
      return ha - hb;
    })
    .slice(0, 2);

  return {
    weekKey,
    bossId: boss?.id || "",
    partIds: parts.map((p) => p.id),
    completedIds: [],
  };
}

export function mergeWeekly(
  existing: ChallengeWeeklyBoss | undefined,
  next: ChallengeWeeklyBoss,
): ChallengeWeeklyBoss {
  if (existing && existing.weekKey === next.weekKey && existing.bossId) {
    return {
      ...existing,
      completedIds: existing.completedIds || [],
    };
  }
  return next;
}

export function buildArenaPack(opts: {
  userId: string;
  dateKey: string;
  count?: number;
}): string[] {
  const count = opts.count ?? 5;
  const catalog = listCatalog();
  const seed = hashString(`${opts.userId}|arena|${opts.dateKey}`);
  return [...catalog]
    .sort((a, b) => hashString(`${seed}|${a.id}`) - hashString(`${seed}|${b.id}`))
    .slice(0, count)
    .map((q) => q.id);
}

export function buildMilestones(clears: number, badges: string[]): MilestoneInfo[] {
  const defs = [
    {
      id: "cotd_first",
      title: "First Clear",
      description: "Clear one Challenge of the Day pack",
      requirement: 1,
    },
    {
      id: "cotd_week",
      title: "Week Warrior",
      description: "Clear 7 CotD packs",
      requirement: 7,
    },
    {
      id: "cotd_month",
      title: "Monthly Master",
      description: "Clear 30 CotD packs",
      requirement: 30,
    },
    {
      id: "streak_7",
      title: "Seven-Day Flame",
      description: "Maintain a 7-day solve streak",
      requirement: 7,
    },
    {
      id: "weekly_boss",
      title: "Boss Slayer",
      description: "Complete a weekly boss challenge",
      requirement: 1,
    },
  ];
  return defs.map((d) => ({
    ...d,
    unlocked:
      badges.includes(d.id) ||
      (d.id.startsWith("cotd_") && clears >= d.requirement),
  }));
}

export function buildWeaknessCoach(
  state: ChallengeProgressState,
  unfinishedNodes: { id: string; title: string; skills?: string[]; topics?: string[] }[],
): WeaknessCoach | null {
  const worst = [...state.topicFails].sort((a, b) => b.fails - a.fails)[0];
  if (!worst || worst.fails < 5) return null;

  const drills = listCatalog()
    .filter((q) =>
      q.topics.some(
        (t) =>
          t.includes(worst.topic) ||
          worst.topic.includes(t) ||
          q.category.toLowerCase().includes(worst.topic),
      ),
    )
    .filter((q) => !state.solvedIds.includes(q.id))
    .slice(0, 3)
    .map((q) => q.id);

  const node = unfinishedNodes.find((n) => {
    const bag = [n.title, ...(n.skills || []), ...(n.topics || [])]
      .join(" ")
      .toLowerCase();
    return bag.includes(worst.topic.toLowerCase());
  });

  return {
    topic: worst.topic,
    fails: worst.fails,
    suggestedNodeId: node?.id,
    suggestedNodeTitle: node?.title,
    drillIds: drills,
  };
}

export function isIdSolved(
  state: ChallengeProgressState,
  id: string,
  extra?: string,
): boolean {
  const keys = [id, extra].filter(Boolean) as string[];
  return keys.some(
    (k) =>
      state.solvedIds.includes(k) || state.daily.completedIds.includes(k),
  );
}

export function isDailyCleared(state: ChallengeProgressState): boolean {
  const featured = state.daily.featuredId;
  if (!featured) return false;
  return (
    state.solvedIds.includes(featured) ||
    state.daily.completedIds.includes(featured)
  );
}

export function pickQuestions(ids: string[]): ChallengeQuestion[] {
  const map = new Map(listCatalog().map((q) => [q.id, q]));
  return ids.map((id) => map.get(id)).filter(Boolean) as ChallengeQuestion[];
}
