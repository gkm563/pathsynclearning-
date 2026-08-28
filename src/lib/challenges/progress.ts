import type {
  ChallengeAttempt,
  ChallengeDailyPack,
  ChallengeGamification,
  ChallengeProgressState,
  ChallengeSyncPrefs,
  ChallengeWeeklyBoss,
  HintUnlock,
  TopicFailStat,
} from "@/lib/challenges/types";

export const HINT_COST = 12;
export const SHIELD_COST = 40;
export const ARENA_DURATION_SEC = 25 * 60;

export function dateKeyNow(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

export function weekKeyNow(d = new Date()): string {
  const tmp = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${tmp.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function secondsUntilNextUtcMidnight(now = new Date()): number {
  const next = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0,
  ));
  return Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000));
}

export function defaultGamification(): ChallengeGamification {
  return {
    xp: 0,
    coins: 0,
    streak: 0,
    level: 1,
    streakShields: 1,
    cotdClears: 0,
    badges: [],
  };
}

export function defaultSync(): ChallengeSyncPrefs {
  return { enabled: true, pinnedNodeIds: [] };
}

export function emptyDaily(dateKey: string): ChallengeDailyPack {
  return { dateKey, featuredId: "", sideIds: [], completedIds: [] };
}

export function emptyWeekly(weekKey: string): ChallengeWeeklyBoss {
  return { weekKey, bossId: "", partIds: [], completedIds: [] };
}

/** XP floor required to be at each level (index 0 unused; level 1 starts at 0). */
export const LEVEL_XP_FLOOR = [0, 0, 800, 1500, 3000, 5000, 8000, 12000] as const;

export function levelFromXp(xp: number): number {
  const safe = Math.max(0, Math.floor(Number(xp) || 0));
  let level = 1;
  for (let i = 2; i < LEVEL_XP_FLOOR.length; i++) {
    if (safe >= LEVEL_XP_FLOOR[i]) level = i;
  }
  return level;
}

/** XP needed to reach `level` (floor). */
export function xpForLevel(level: number): number {
  const n = Math.max(1, Math.floor(level));
  if (n >= LEVEL_XP_FLOOR.length) {
    return LEVEL_XP_FLOOR[LEVEL_XP_FLOOR.length - 1];
  }
  return LEVEL_XP_FLOOR[n];
}

/** Progress toward the next level for UI bars. */
export function xpProgress(xp: number): {
  level: number;
  xp: number;
  floor: number;
  next: number;
  intoLevel: number;
  span: number;
  pct: number;
} {
  const safe = Math.max(0, Math.floor(Number(xp) || 0));
  const level = levelFromXp(safe);
  const floor = xpForLevel(level);
  const next =
    level + 1 < LEVEL_XP_FLOOR.length
      ? LEVEL_XP_FLOOR[level + 1]
      : floor + 2000;
  const intoLevel = Math.max(0, safe - floor);
  const span = Math.max(1, next - floor);
  return {
    level,
    xp: safe,
    floor,
    next,
    intoLevel,
    span,
    pct: Math.min(100, Math.round((intoLevel / span) * 100)),
  };
}

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

/** Migrate legacy array state or partial objects into v1 state. */
export function normalizeProgressState(
  raw: unknown,
  dateKey: string,
): ChallengeProgressState {
  const weekKey = weekKeyNow();

  if (Array.isArray(raw)) {
    const solvedIds = raw
      .filter((c): c is { id?: string; done?: boolean } => !!c && typeof c === "object")
      .filter((c) => c.done && typeof c.id === "string")
      .map((c) => c.id as string);
    const attempts: ChallengeAttempt[] = solvedIds.map((questionId) => ({
      questionId,
      status: "solved",
      score: 100,
      at: new Date().toISOString(),
    }));
    return {
      version: 1,
      daily: emptyDaily(dateKey),
      weekly: emptyWeekly(weekKey),
      sync: defaultSync(),
      attempts,
      gamification: defaultGamification(),
      solvedIds,
      unlockedSolutions: [...solvedIds],
      hintUnlocks: [],
      topicFails: [],
      arenaBestScore: 0,
      duelCode: `duel_${dateKey.replace(/-/g, "")}`,
    };
  }

  if (raw && typeof raw === "object") {
    const o = raw as Partial<ChallengeProgressState> & {
      gamification?: Partial<ChallengeGamification>;
      sync?: Partial<ChallengeSyncPrefs>;
      daily?: Partial<ChallengeDailyPack>;
      weekly?: Partial<ChallengeWeeklyBoss>;
    };
    const gamification: ChallengeGamification = {
      ...defaultGamification(),
      ...(o.gamification || {}),
    };
    gamification.streakShields = Number(gamification.streakShields) || 0;
    gamification.cotdClears = Number(gamification.cotdClears) || 0;
    gamification.badges = Array.isArray(gamification.badges)
      ? gamification.badges
      : [];
    gamification.level = levelFromXp(gamification.xp);
    return {
      version: 1,
      daily: {
        ...emptyDaily(dateKey),
        ...(o.daily || {}),
        dateKey: o.daily?.dateKey || dateKey,
      },
      weekly: {
        ...emptyWeekly(weekKey),
        ...(o.weekly || {}),
        weekKey: o.weekly?.weekKey || weekKey,
      },
      sync: { ...defaultSync(), ...(o.sync || {}) },
      attempts: asArray<ChallengeAttempt>(o.attempts),
      gamification,
      solvedIds: asArray<string>(o.solvedIds),
      unlockedSolutions: asArray<string>(o.unlockedSolutions),
      hintUnlocks: asArray<HintUnlock>(o.hintUnlocks),
      topicFails: asArray<TopicFailStat>(o.topicFails),
      arenaBestScore: Number(o.arenaBestScore) || 0,
      lastArenaAt: o.lastArenaAt,
      duelCode: o.duelCode || `duel_${dateKey.replace(/-/g, "")}`,
    };
  }

  return {
    version: 1,
    daily: emptyDaily(dateKey),
    weekly: emptyWeekly(weekKey),
    sync: defaultSync(),
    attempts: [],
    gamification: defaultGamification(),
    solvedIds: [],
    unlockedSolutions: [],
    hintUnlocks: [],
    topicFails: [],
    arenaBestScore: 0,
    duelCode: `duel_${dateKey.replace(/-/g, "")}`,
  };
}

export function attemptMap(state: ChallengeProgressState) {
  const map = new Map<string, ChallengeAttempt>();
  for (const a of state.attempts) map.set(a.questionId, a);
  for (const id of state.solvedIds) {
    if (!map.has(id)) {
      map.set(id, {
        questionId: id,
        status: "solved",
        score: 100,
        at: new Date().toISOString(),
      });
    }
  }
  return map;
}

function maybeUseShield(
  streak: number,
  shields: number,
  last: string | undefined,
  today: string,
): { streak: number; shields: number } {
  if (!last || last === today) return { streak, shields };
  const yesterday = dateKeyNow(new Date(Date.now() - 86400000));
  if (last === yesterday) return { streak: streak + 1, shields };
  if (shields > 0) {
    // Missed exactly one day — consume shield and continue
    const dayBefore = dateKeyNow(new Date(Date.now() - 2 * 86400000));
    if (last === dayBefore) return { streak: streak + 1, shields: shields - 1 };
  }
  return { streak: 1, shields };
}

export function applySolve(
  state: ChallengeProgressState,
  questionId: string,
  xp: number,
  coins: number,
  score = 100,
  opts?: {
    topics?: string[];
    isDailyItem?: boolean;
    payload?: ChallengeAttempt["payload"];
  },
): ChallengeProgressState {
  const today = dateKeyNow();
  const attempts = [
    ...state.attempts.filter((a) => a.questionId !== questionId),
    {
      questionId,
      status: "solved" as const,
      score,
      at: new Date().toISOString(),
      payload: opts?.payload,
    },
  ];
  const solvedIds = [...new Set([...state.solvedIds, questionId])];
  const dailyCompleted = state.daily.completedIds.includes(questionId)
    ? state.daily.completedIds
    : [...state.daily.completedIds, questionId];

  const weeklyCompleted =
    state.weekly.bossId === questionId || state.weekly.partIds.includes(questionId)
      ? state.weekly.completedIds.includes(questionId)
        ? state.weekly.completedIds
        : [...state.weekly.completedIds, questionId]
      : state.weekly.completedIds;

  const streakInfo = maybeUseShield(
    state.gamification.streak,
    state.gamification.streakShields,
    state.gamification.lastSolveDateKey,
    today,
  );

  const dailyClearedNow =
    Boolean(state.daily.featuredId) &&
    [state.daily.featuredId, ...state.daily.sideIds].filter(Boolean).every((id) =>
      id === questionId ? true : dailyCompleted.includes(id) || solvedIds.includes(id),
    );

  const packDone =
    Boolean(state.daily.featuredId) &&
    [state.daily.featuredId, ...state.daily.sideIds].every(
      (id) => solvedIds.includes(id) || dailyCompleted.includes(id),
    );
  void dailyClearedNow;

  let cotdClears = state.gamification.cotdClears;
  const wasPackDone = [state.daily.featuredId, ...state.daily.sideIds]
    .filter(Boolean)
    .every((id) => state.solvedIds.includes(id) || state.daily.completedIds.includes(id));
  if (packDone && !wasPackDone) cotdClears += 1;

  const badges = new Set(state.gamification.badges);
  if (cotdClears >= 1) badges.add("cotd_first");
  if (cotdClears >= 7) badges.add("cotd_week");
  if (cotdClears >= 30) badges.add("cotd_month");
  if (streakInfo.streak >= 7) badges.add("streak_7");
  if (weeklyCompleted.length >= 1 + state.weekly.partIds.length && state.weekly.bossId) {
    badges.add("weekly_boss");
  }

  const nextXp = state.gamification.xp + xp;

  return {
    ...state,
    attempts,
    solvedIds,
    unlockedSolutions: [...new Set([...state.unlockedSolutions, questionId])],
    daily: { ...state.daily, completedIds: dailyCompleted },
    weekly: { ...state.weekly, completedIds: weeklyCompleted },
    gamification: {
      xp: nextXp,
      coins: state.gamification.coins + coins,
      streak: streakInfo.streak,
      streakShields: streakInfo.shields,
      level: levelFromXp(nextXp),
      lastSolveDateKey: today,
      cotdClears,
      badges: [...badges],
    },
  };
}

export function applyFail(
  state: ChallengeProgressState,
  questionId: string,
  topics: string[],
  score = 0,
  payload?: ChallengeAttempt["payload"],
): ChallengeProgressState {
  const attempts = [
    ...state.attempts.filter((a) => a.questionId !== questionId),
    {
      questionId,
      status: "attempted" as const,
      score,
      at: new Date().toISOString(),
      payload,
    },
  ];
  const topicFails = [...state.topicFails];
  for (const topic of topics.slice(0, 3)) {
    const idx = topicFails.findIndex((t) => t.topic === topic);
    if (idx >= 0) topicFails[idx] = { topic, fails: topicFails[idx].fails + 1 };
    else topicFails.push({ topic, fails: 1 });
  }
  return { ...state, attempts, topicFails };
}

export function unlockHint(
  state: ChallengeProgressState,
  questionId: string,
  maxHints: number,
): ChallengeProgressState | { error: string } {
  if (state.gamification.coins < HINT_COST) {
    return { error: `Need ${HINT_COST} coins for a hint` };
  }
  const existing = state.hintUnlocks.find((h) => h.questionId === questionId);
  const levels = existing?.levels || 0;
  if (levels >= maxHints) return { error: "All hints already unlocked" };
  const hintUnlocks = existing
    ? state.hintUnlocks.map((h) =>
        h.questionId === questionId ? { ...h, levels: levels + 1 } : h,
      )
    : [...state.hintUnlocks, { questionId, levels: 1 }];
  return {
    ...state,
    hintUnlocks,
    gamification: {
      ...state.gamification,
      coins: state.gamification.coins - HINT_COST,
    },
  };
}

export function buyStreakShield(
  state: ChallengeProgressState,
): ChallengeProgressState | { error: string } {
  if (state.gamification.coins < SHIELD_COST) {
    return { error: `Need ${SHIELD_COST} coins for a streak shield` };
  }
  return {
    ...state,
    gamification: {
      ...state.gamification,
      coins: state.gamification.coins - SHIELD_COST,
      streakShields: state.gamification.streakShields + 1,
    },
  };
}
