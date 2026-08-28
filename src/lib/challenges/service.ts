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
  generateWeeklyBoss,
  isDailyCleared,
  mergeWeekly,
} from "@/lib/challenges/extras";
import {
  attemptMap,
  dateKeyNow,
  levelFromXp,
  normalizeProgressState,
  secondsUntilNextUtcMidnight,
} from "@/lib/challenges/progress";
import { findLinkedNode, toSummary } from "@/lib/challenges/relevance";
import type {
  ChallengeProgressState,
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
import type { RoadmapNode } from "@/types/roadmap";

/**
 * Source of truth for economy (never localStorage):
 * - profiles.xp / level / streak / streakShields / lastSolveDateKey
 * - wallets.coins
 * challenge_progress.state holds packs/attempts; gamification is loaded from DB columns.
 */
export async function loadChallengeContext(userId: string) {
  const db = getDb();
  const dateKey = dateKeyNow();

  const [progressRow] = await db
    .select()
    .from(challengeProgress)
    .where(eq(challengeProgress.userId, userId))
    .limit(1);

  const [profile] = await db
    .select()
    .from(roadmapProfiles)
    .where(eq(roadmapProfiles.userId, userId))
    .limit(1);

  const [userProfile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);

  const [wallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, userId))
    .limit(1);

  const [activeRoadmap] = await db
    .select()
    .from(roadmaps)
    .where(and(eq(roadmaps.userId, userId), eq(roadmaps.isActive, true)))
    .orderBy(desc(roadmaps.createdAt))
    .limit(1);

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

  const generated = generateDailyPack({
    userId,
    dateKey,
    careerGoal,
    roadmapTopics,
    syncEnabled: state.sync.enabled,
  });
  const weekly = generateWeeklyBoss({ userId, careerGoal });

  state = {
    ...state,
    daily: mergeDailyPack(state.daily, generated),
    weekly: mergeWeekly(state.weekly, weekly),
    duelCode:
      state.duelCode ||
      `duel_${userId.slice(0, 6)}_${dateKey.replace(/-/g, "")}`,
  };

  return {
    db,
    dateKey,
    state,
    careerGoal,
    roadmapTopics,
    unfinishedNodes: unfinished,
    progressExists: Boolean(progressRow),
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

  const questions = catalog
    .map((q) => {
      const linked = findLinkedNode(q, nodeOpts);
      return toSummary(q, attempts.get(q.id), {
        careerGoal: ctx.careerGoal,
        roadmapTopics: ctx.roadmapTopics,
        unfinishedBoostTopics: ctx.roadmapTopics,
        linkedNodeId: linked?.id,
        linkedNodeTitle: linked?.title,
        hintsUnlocked: hintMap.get(q.id) || 0,
        solutionUnlocked:
          attempts.get(q.id)?.status === "solved" ||
          ctx.state.solvedIds.includes(q.id),
      });
    })
    .sort((a, b) => b.relevance - a.relevance);

  const byId = new Map(questions.map((q) => [q.id, q]));
  const featured = ctx.state.daily.featuredId
    ? byId.get(ctx.state.daily.featuredId) || null
    : null;
  const side = ctx.state.daily.sideIds
    .map((id) => byId.get(id))
    .filter(Boolean) as typeof questions;

  const boss = ctx.state.weekly.bossId
    ? byId.get(ctx.state.weekly.bossId) || null
    : null;
  const parts = ctx.state.weekly.partIds
    .map((id) => byId.get(id))
    .filter(Boolean) as typeof questions;
  const weeklyTotal = 1 + parts.length;
  const weeklyDone = ctx.state.weekly.completedIds.length;

  const byType: Record<ChallengeType, number> = {
    coding: 0,
    mcq: 0,
    project: 0,
  };
  for (const q of catalog) byType[q.type] += 1;

  const companies = listCompanies();
  const arenaIds = buildArenaPack({
    userId: ctx.userId || "anon",
    dateKey: ctx.state.daily.dateKey,
  });

  return {
    careerGoal: ctx.careerGoal,
    roadmapTopics: ctx.roadmapTopics,
    sync: ctx.state.sync,
    daily: {
      dateKey: ctx.state.daily.dateKey,
      featured,
      side,
      refreshInSeconds: secondsUntilNextUtcMidnight(),
      cleared: isDailyCleared(ctx.state),
    },
    weekly: {
      weekKey: ctx.state.weekly.weekKey,
      boss,
      parts,
      progress: weeklyTotal ? Math.round((weeklyDone / weeklyTotal) * 100) : 0,
    },
    questions,
    gamification: ctx.state.gamification,
    catalogMeta: { total: catalog.length, byType, companies },
    weakness: buildWeaknessCoach(ctx.state, nodeOpts),
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
