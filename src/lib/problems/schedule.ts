import { getChallengeById, listCatalog } from "@/lib/challenges/catalog";
import {
  dateKeyNow,
  secondsUntilNextUtcMidnight,
  weekKeyNow,
} from "@/lib/challenges/progress";
import type { ChallengeQuestion } from "@/lib/challenges/types";
import { getDb } from "@/lib/db/client";
import { challengeSchedule, problems } from "@/lib/db/schema";
import { isProblemRunnable } from "@/lib/problems/public";
import { and, eq } from "drizzle-orm";

export type SchedulePeriod = "daily" | "weekly" | "monthly";

export type ChallengeWindow = {
  period: SchedulePeriod;
  periodKey: string;
  startsAt: Date;
  endsAt: Date;
  refreshInSeconds: number;
  problem: ChallengeQuestion;
};

export function monthKeyNow(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick(
  pool: ChallengeQuestion[],
  seed: string,
  exclude: Set<string>,
): ChallengeQuestion {
  const filtered = pool.filter(
    (q) => !exclude.has(q.id) && !exclude.has(q.slug),
  );
  const list = filtered.length ? filtered : pool;
  return list[hashString(seed) % list.length] || pool[0];
}

function dailyBounds(now: Date) {
  const startsAt = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const endsAt = new Date(startsAt.getTime() + 86400000);
  return { startsAt, endsAt };
}

function weeklyBounds(now: Date) {
  const tmp = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const day = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 1 - day);
  const startsAt = tmp;
  const endsAt = new Date(startsAt.getTime() + 7 * 86400000);
  return { startsAt, endsAt };
}

function monthlyBounds(now: Date) {
  const startsAt = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const endsAt = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
  );
  return { startsAt, endsAt };
}

function secondsUntil(end: Date, now = new Date()): number {
  return Math.max(0, Math.floor((end.getTime() - now.getTime()) / 1000));
}

function pools() {
  const all = listCatalog().filter(isProblemRunnable);
  const daily = all.filter(
    (q) =>
      (q.type === "coding" || q.type === "mcq") && q.legacyType !== "MILESTONE",
  );
  const weekly = all.filter(
    (q) =>
      q.weeklyBossEligible ||
      q.type === "system_design" ||
      q.difficulty === "hard",
  );
  const monthly = all.filter(
    (q) =>
      q.monthlyEligible || q.type === "project" || q.legacyType === "MILESTONE",
  );
  return {
    daily: daily.length ? daily : all,
    weekly: weekly.length ? weekly : all,
    monthly: monthly.length ? monthly : all,
  };
}

export function computeGlobalWindows(now = new Date()): {
  daily: ChallengeWindow;
  weekly: ChallengeWindow;
  monthly: ChallengeWindow;
} {
  const p = pools();
  const dailyKey = dateKeyNow(now);
  const weekKey = weekKeyNow(now);
  const monthKey = monthKeyNow(now);
  const dBound = dailyBounds(now);
  const wBound = weeklyBounds(now);
  const mBound = monthlyBounds(now);

  const monthlyQ = pick(p.monthly, `monthly|${monthKey}`, new Set());
  const weeklyQ = pick(
    p.weekly,
    `weekly|${weekKey}`,
    new Set([monthlyQ.id, monthlyQ.slug]),
  );
  const dailyQ = pick(
    p.daily,
    `daily|${dailyKey}`,
    new Set([monthlyQ.id, monthlyQ.slug, weeklyQ.id, weeklyQ.slug]),
  );

  return {
    daily: {
      period: "daily",
      periodKey: dailyKey,
      ...dBound,
      refreshInSeconds: secondsUntil(dBound.endsAt, now),
      problem: dailyQ,
    },
    weekly: {
      period: "weekly",
      periodKey: weekKey,
      ...wBound,
      refreshInSeconds: secondsUntil(wBound.endsAt, now),
      problem: weeklyQ,
    },
    monthly: {
      period: "monthly",
      periodKey: monthKey,
      ...mBound,
      refreshInSeconds: secondsUntil(mBound.endsAt, now),
      problem: monthlyQ,
    },
  };
}

async function persistWindow(window: ChallengeWindow) {
  try {
    const db = getDb();
    const [row] = await db
      .select({ id: problems.id, slug: problems.slug })
      .from(problems)
      .where(eq(problems.slug, window.problem.slug))
      .limit(1);
    if (!row) return;
    const existing = await db
      .select({ id: challengeSchedule.id })
      .from(challengeSchedule)
      .where(
        and(
          eq(challengeSchedule.period, window.period),
          eq(challengeSchedule.periodKey, window.periodKey),
        ),
      )
      .limit(1);
    if (existing[0]) return;
    await db.insert(challengeSchedule).values({
      period: window.period,
      periodKey: window.periodKey,
      problemId: row.id,
      problemSlug: window.problem.slug,
      startsAt: window.startsAt,
      endsAt: window.endsAt,
    });
  } catch {
    // Catalog still works if schedule table is not migrated yet.
  }
}

export async function loadGlobalWindows(now = new Date()) {
  const computed = computeGlobalWindows(now);
  await Promise.all([
    persistWindow(computed.daily),
    persistWindow(computed.weekly),
    persistWindow(computed.monthly),
  ]);
  return computed;
}

export function windowBonus(baseXp: number, baseCoins: number) {
  return {
    xp: Math.max(10, Math.round(baseXp * 0.15)),
    coins: Math.max(1, Math.round(baseCoins * 0.15)),
  };
}

export { secondsUntilNextUtcMidnight };

export function featuredIds(windows: {
  daily: ChallengeWindow;
  weekly: ChallengeWindow;
  monthly: ChallengeWindow;
}): string[] {
  return [
    windows.daily.problem.id,
    windows.daily.problem.slug,
    windows.weekly.problem.id,
    windows.weekly.problem.slug,
    windows.monthly.problem.id,
    windows.monthly.problem.slug,
  ];
}

export function resolveWindowProblem(
  windows: Awaited<ReturnType<typeof loadGlobalWindows>>,
  questionId: string,
): SchedulePeriod | null {
  if (
    windows.daily.problem.id === questionId ||
    windows.daily.problem.slug === questionId
  ) {
    return "daily";
  }
  if (
    windows.weekly.problem.id === questionId ||
    windows.weekly.problem.slug === questionId
  ) {
    return "weekly";
  }
  if (
    windows.monthly.problem.id === questionId ||
    windows.monthly.problem.slug === questionId
  ) {
    return "monthly";
  }
  return null;
}

export function lookupChallenge(idOrSlug: string) {
  return getChallengeById(idOrSlug);
}
