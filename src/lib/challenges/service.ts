import { and, desc, eq } from "drizzle-orm";
import { getChallengeById, listCatalog, listCompanies } from "@/lib/challenges/catalog";
import {
  generateDailyPack,
  mergeDailyPack,
} from "@/lib/challenges/daily-pack";
import {
  buildArenaPack,
  buildMilestones,
  buildWeaknessCoach,
  isDailyCleared,
  mergeWeekly,
} from "@/lib/challenges/extras";
import {
  attemptMap,
  dateKeyNow,
  levelFromXp,
  normalizeProgressState,
} from "@/lib/challenges/progress";
import { findLinkedNode, toSummary } from "@/lib/challenges/relevance";
import type {
  ChallengeProgressState,
  ChallengeQuestion,
  ChallengeSummary,
  ChallengesApiResponse,
  ChallengeType,
} from "@/lib/challenges/types";
import { getDb } from "@/lib/db/client";
import {
  challengeProgress,
  profiles,
  roadmapProfiles,
  roadmaps,
  wallets,
} from "@/lib/db/schema";
import { toPublicSummary } from "@/lib/problems/public";
import {
  featuredIds,
  loadGlobalWindows,
  type ChallengeWindow,
} from "@/lib/problems/schedule";
import type { RoadmapNode } from "@/types/roadmap";

/**
 * Source of truth for economy (never localStorage):
 * - profiles.xp / level / streak / streakShields / lastSolveDateKey
 * - wallets.coins
 * challenge_progress.state holds packs/attempts; gamification is loaded from DB columns.
 */
function ledgerFingerprint(state: ChallengeProgressState): string {
  const { gamification: _economy, ...ledger } = state;
  return JSON.stringify(ledger);
}

/** Packs/attempts/sync changed — economy lives on profiles/wallets and is ignored. */
function challengeLedgerChanged(
  previous: unknown,
  next: ChallengeProgressState,
): boolean {
  if (!previous || typeof previous !== "object") return true;
  try {
    return (
      ledgerFingerprint(previous as ChallengeProgressState) !==
      ledgerFingerprint(next)
    );
  } catch {
    return true;
  }
}

export async function loadChallengeContext(userId: string) {
  const db = getDb();
  const dateKey = dateKeyNow();

  const [progressRows, profileRows, userProfileRows, walletRows, roadmapRows] =
    await Promise.all([
      db
        .select()
        .from(challengeProgress)
        .where(eq(challengeProgress.userId, userId))
        .limit(1),
      db
        .select()
        .from(roadmapProfiles)
        .where(eq(roadmapProfiles.userId, userId))
        .limit(1),
      db
        .select()
        .from(profiles)
        .where(eq(profiles.userId, userId))
        .limit(1),
      db
        .select()
        .from(wallets)
        .where(eq(wallets.userId, userId))
        .limit(1),
      db
        .select()
        .from(roadmaps)
        .where(and(eq(roadmaps.userId, userId), eq(roadmaps.isActive, true)))
        .orderBy(desc(roadmaps.createdAt))
        .limit(1),
    ]);

  const progressRow = progressRows[0];
  const profile = profileRows[0];
  const userProfile = userProfileRows[0];
  const wallet = walletRows[0];
  const activeRoadmap = roadmapRows[0];

  const nodes = (activeRoadmap?.nodes || []) as RoadmapNode[];
  const unfinished = nodes.filter(
    (n) => n.status !== "completed" && n.status !== "skipped",
  );
  const roadmapTopics = [
    ...new Set(
      unfinished.flatMap((n) => [
        ...(n.skills || []),
        ...(n.topics || []),
        n.title,
      ]),
    ),
  ];

  let state = normalizeProgressState(progressRow?.state, dateKey);
  const careerGoal = profile?.careerGoal || profile?.targetRole || null;

  const profileXp = Number(userProfile?.xp) || 0;
  const profileLevel = Number(userProfile?.level) || levelFromXp(profileXp);
  const profileStreak = Number(userProfile?.streak) || 0;
  const profileShields =
    userProfile?.streakShields !== undefined && userProfile?.streakShields !== null
      ? Number(userProfile.streakShields)
      : Math.max(1, Number(state.gamification.streakShields) || 1);
  const lastSolve =
    userProfile?.lastSolveDateKey || state.gamification.lastSolveDateKey;
  const walletCoins = Number(wallet?.coins) || 0;

  state = {
    ...state,
    gamification: {
      ...state.gamification,
      xp: profileXp,
      level: profileLevel || levelFromXp(profileXp),
      streak: profileStreak,
      streakShields: profileShields,
      lastSolveDateKey: lastSolve,
      coins: walletCoins,
    },
  };

  const windows = await loadGlobalWindows();
  const generated = generateDailyPack({
    userId,
    dateKey,
    careerGoal,
    roadmapTopics,
    syncEnabled: state.sync.enabled,
    excludeIds: featuredIds(windows),
    sideCount: 4,
  });

  const nextDaily = {
    dateKey: windows.daily.periodKey,
    featuredId: windows.daily.problem.id,
    sideIds: generated.sideIds,
    completedIds: [] as string[],
  };

  state = {
    ...state,
    daily: mergeDailyPack(state.daily, nextDaily),
    weekly: mergeWeekly(state.weekly, {
      weekKey: windows.weekly.periodKey,
      bossId: windows.weekly.problem.id,
      partIds: [],
      completedIds: [],
    }),
    duelCode:
      state.duelCode ||
      `duel_${userId.slice(0, 6)}_${dateKey.replace(/-/g, "")}`,
  };

  const progressExists = Boolean(progressRow);
  const needsPersist =
    !progressExists || challengeLedgerChanged(progressRow?.state, state);

  return {
    db,
    dateKey,
    state,
    careerGoal,
    roadmapTopics,
    unfinishedNodes: unfinished,
    progressExists,
    needsPersist,
    windows,
  };
}

export async function persistChallengeState(
  userId: string,
  state: ChallengeProgressState,
  exists: boolean,
) {
  const db = getDb();
  if (exists) {
    await db
      .update(challengeProgress)
      .set({ state, updatedAt: new Date() })
      .where(eq(challengeProgress.userId, userId));
  } else {
    await db.insert(challengeProgress).values({
      userId,
      state,
      updatedAt: new Date(),
    });
  }
}

/** Write XP / level / streak / shields to profiles. Coins live on wallets. */
export async function persistChallengeEconomy(
  userId: string,
  state: ChallengeProgressState,
) {
  const db = getDb();
  const xp = Math.max(0, Math.floor(Number(state.gamification.xp) || 0));
  await db
    .update(profiles)
    .set({
      xp,
      level: levelFromXp(xp),
      streak: Math.max(0, Math.floor(Number(state.gamification.streak) || 0)),
      streakShields: Math.max(
        0,
        Math.floor(Number(state.gamification.streakShields) || 0),
      ),
      lastSolveDateKey: state.gamification.lastSolveDateKey || null,
      updatedAt: new Date(),
    })
    .where(eq(profiles.userId, userId));
}

export function buildChallengesResponse(ctx: {
  state: ChallengeProgressState;
  careerGoal: string | null;
  roadmapTopics: string[];
  unfinishedNodes: RoadmapNode[];
  userId?: string;
  windows: {
    daily: ChallengeWindow;
    weekly: ChallengeWindow;
    monthly: ChallengeWindow;
  };
}): ChallengesApiResponse {
  const attempts = attemptMap(ctx.state);
  const catalog = listCatalog();
  const nodeOpts = ctx.unfinishedNodes.map((n) => ({
    id: n.id,
    title: n.title,
    skills: n.skills,
    topics: n.topics,
  }));
  const hintMap = new Map(
    ctx.state.hintUnlocks.map((h) => [h.questionId, h.levels]),
  );

  const summarize = (q: ChallengeQuestion | undefined): ChallengeSummary | null => {
    if (!q) return null;
    const linked = findLinkedNode(q, nodeOpts);
    const attempt =
      attempts.get(q.id) || attempts.get(q.slug);
    return toPublicSummary(
      toSummary(q, attempt, {
        careerGoal: ctx.careerGoal,
        roadmapTopics: ctx.roadmapTopics,
        unfinishedBoostTopics: ctx.roadmapTopics,
        linkedNodeId: linked?.id,
        linkedNodeTitle: linked?.title,
        hintsUnlocked: hintMap.get(q.id) || hintMap.get(q.slug) || 0,
        solutionUnlocked:
          attempt?.status === "solved" ||
          ctx.state.solvedIds.includes(q.id) ||
          ctx.state.solvedIds.includes(q.slug),
      }),
    );
  };

  const byId = new Map<string, ChallengeQuestion>();
  for (const q of catalog) {
    byId.set(q.id, q);
    byId.set(q.slug, q);
  }

  const featured = summarize(ctx.windows.daily.problem);
  const featuredKeys = new Set(
    [
      ctx.windows.daily.problem.id,
      ctx.windows.daily.problem.slug,
      ctx.windows.weekly.problem.id,
      ctx.windows.weekly.problem.slug,
      ctx.windows.monthly.problem.id,
      ctx.windows.monthly.problem.slug,
    ].filter(Boolean),
  );
  const side = ctx.state.daily.sideIds
    .map((id) => summarize(byId.get(id)))
    .filter((item): item is ChallengeSummary => {
      if (!item) return false;
      return !featuredKeys.has(item.id) && !featuredKeys.has(item.slug);
    })
    .sort((a, b) => b.relevance - a.relevance);

  const boss = summarize(ctx.windows.weekly.problem);
  const monthly = summarize(ctx.windows.monthly.problem);

  const dailyCleared =
    Boolean(featured) &&
    (featured!.status === "solved" ||
      isDailyCleared({
        ...ctx.state,
        daily: { ...ctx.state.daily, featuredId: ctx.windows.daily.problem.id },
      }) ||
      ctx.state.solvedIds.includes(ctx.windows.daily.problem.slug));

  const weeklyCleared =
    Boolean(boss) &&
    (boss!.status === "solved" ||
      ctx.state.solvedIds.includes(ctx.windows.weekly.problem.id) ||
      ctx.state.solvedIds.includes(ctx.windows.weekly.problem.slug));

  const monthlyCleared =
    Boolean(monthly) &&
    (monthly!.status === "solved" ||
      ctx.state.solvedIds.includes(ctx.windows.monthly.problem.id) ||
      ctx.state.solvedIds.includes(ctx.windows.monthly.problem.slug));

  const byType: Record<ChallengeType, number> = {
    coding: 0,
    mcq: 0,
    project: 0,
    system_design: 0,
  };
  for (const q of catalog) byType[q.type] += 1;

  const companies = listCompanies();
  const arenaIds = buildArenaPack({
    userId: ctx.userId || "anon",
    dateKey: ctx.state.daily.dateKey,
  });
  const weakness = buildWeaknessCoach(ctx.state, nodeOpts);

  const referenced = [
    featured,
    ...side,
    boss,
    monthly,
    ...arenaIds.map((id) => summarize(byId.get(id))),
    ...(weakness?.drillIds || []).map((id) => summarize(byId.get(id))),
  ].filter(Boolean) as ChallengeSummary[];

  const questions = [
    ...new Map(referenced.map((q) => [q.id, q])).values(),
  ];

  return {
    careerGoal: ctx.careerGoal,
    roadmapTopics: ctx.roadmapTopics,
    sync: ctx.state.sync,
    daily: {
      dateKey: ctx.windows.daily.periodKey,
      featured,
      side,
      refreshInSeconds: ctx.windows.daily.refreshInSeconds,
      cleared: dailyCleared,
    },
    weekly: {
      weekKey: ctx.windows.weekly.periodKey,
      boss,
      parts: [],
      progress: weeklyCleared ? 100 : 0,
      refreshInSeconds: ctx.windows.weekly.refreshInSeconds,
      cleared: weeklyCleared,
    },
    monthly: {
      monthKey: ctx.windows.monthly.periodKey,
      featured: monthly,
      refreshInSeconds: ctx.windows.monthly.refreshInSeconds,
      cleared: monthlyCleared,
    },
    questions,
    forYou: side,
    gamification: ctx.state.gamification,
    catalogMeta: { total: catalog.length, byType, companies },
    weakness,
    milestones: buildMilestones(
      ctx.state.gamification.cotdClears,
      ctx.state.gamification.badges,
    ),
    arena: {
      bestScore: ctx.state.arenaBestScore,
      lastPlayedAt: ctx.state.lastArenaAt,
      packIds: arenaIds,
    },
    duelCode: ctx.state.duelCode || `duel_${ctx.state.daily.dateKey}`,
    companies,
  };
}

export { getChallengeById };
