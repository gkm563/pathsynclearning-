/** Challenge catalog domain types (phase 1 + extras). */

export type ChallengeType = "coding" | "mcq" | "project" | "system_design";
export type ChallengeDifficulty = "easy" | "medium" | "hard";
export type AttemptStatus = "todo" | "attempted" | "solved";
export type ChallengeIconKey =
  | "code"
  | "tree"
  | "link"
  | "cpu"
  | "globe"
  | "book"
  | "database"
  | "wrench"
  | "trophy"
  | "bolt"
  | "network";

export type ChallengeMcqItem = {
  id: number | string;
  q: string;
  opts: string[];
  correct: number;
  explanation?: string;
};

export type ChallengeTestCase = {
  id: number | string;
  name: string;
  input: string;
  expected: string;
};

export type ChallengeSolution = {
  editorial: string;
  complexity: string;
  notes?: string;
};

export type ChallengeQuestion = {
  id: string;
  /** URL slug — same as id for new problems; legacy rows keep old ids */
  slug: string;
  number: number;
  type: ChallengeType;
  difficulty: ChallengeDifficulty;
  title: string;
  description: string;
  topics: string[];
  careerTags: string[];
  companyTags: string[];
  hints: string[];
  solution?: ChallengeSolution;
  xp: number;
  coins: number;
  estMinutes: number;
  /** Lucide icon key — never emoji */
  icon: ChallengeIconKey;
  category: string;
  prompt: string;
  examples?: string;
  starterCode?: string;
  testCases?: ChallengeTestCase[];
  /** Real Judge0 / in-browser harness (coding challenges) */
  coding?: import("@/lib/challenges/coding-harness").ChallengeCodingHarness;
  /** Guided project assessment (steps + rubric) */
  project?: import("@/lib/projects/types").ProjectAssessmentSpec;
  /** Structured system-design rubric (no code judge) */
  design?: ChallengeDesignSpec;
  questions?: ChallengeMcqItem[];
  weeklyBossEligible?: boolean;
  monthlyEligible?: boolean;
  /** Legacy runner type used by existing Pro IDE / MCQ UI */
  legacyType: "CODE" | "MCQ" | "PROJECT" | "MILESTONE";
};

export type ChallengeDesignDimension = {
  id: string;
  label: string;
  weight: number;
  prompt: string;
};

export type ChallengeDesignSpec = {
  passScore: number;
  requirements: string[];
  nonFunctional: string[];
  apiSketch: string;
  dimensions: ChallengeDesignDimension[];
};

export type ChallengeAttemptPayload = {
  answers?: Record<string, number>;
  code?: string;
  language?: string;
  /** Project assessment submission */
  stepsDone?: string[];
  evidence?: unknown[];
  repoUrl?: string;
  reflection?: string;
  breakdown?: unknown[];
  /** System design writeup */
  writeup?: string;
  dimensionIds?: string[];
};

export type ChallengeAttempt = {
  questionId: string;
  status: AttemptStatus;
  score?: number;
  at: string;
  /** Last submission payload for Review */
  payload?: ChallengeAttemptPayload;
};

export type ChallengeDailyPack = {
  dateKey: string;
  featuredId: string;
  sideIds: string[];
  completedIds: string[];
};

export type ChallengeWeeklyBoss = {
  weekKey: string;
  bossId: string;
  partIds: string[];
  completedIds: string[];
};

export type ChallengeSyncPrefs = {
  enabled: boolean;
  pinnedNodeIds: string[];
  lastSyncedAt?: string;
};

export type ChallengeGamification = {
  xp: number;
  coins: number;
  streak: number;
  level: number;
  lastSolveDateKey?: string;
  streakShields: number;
  cotdClears: number;
  badges: string[];
};

export type HintUnlock = {
  questionId: string;
  levels: number;
};

export type TopicFailStat = {
  topic: string;
  fails: number;
};

export type ChallengeProgressState = {
  version: 1;
  daily: ChallengeDailyPack;
  weekly: ChallengeWeeklyBoss;
  sync: ChallengeSyncPrefs;
  attempts: ChallengeAttempt[];
  gamification: ChallengeGamification;
  solvedIds: string[];
  unlockedSolutions: string[];
  hintUnlocks: HintUnlock[];
  topicFails: TopicFailStat[];
  arenaBestScore: number;
  lastArenaAt?: string;
  duelCode?: string;
};

export type ChallengeSummary = ChallengeQuestion & {
  status: AttemptStatus;
  score?: number;
  relevance: number;
  linkedNodeId?: string;
  linkedNodeTitle?: string;
  hintsUnlocked: number;
  solutionUnlocked: boolean;
  /** Last attempt payload — powers Review UI after solve/attempt */
  lastAttempt?: ChallengeAttemptPayload;
};

export type WeaknessCoach = {
  topic: string;
  fails: number;
  suggestedNodeId?: string;
  suggestedNodeTitle?: string;
  drillIds: string[];
};

export type MilestoneInfo = {
  id: string;
  title: string;
  description: string;
  requirement: number;
  unlocked: boolean;
};

export type ChallengesApiResponse = {
  careerGoal: string | null;
  roadmapTopics: string[];
  sync: ChallengeSyncPrefs;
  daily: {
    dateKey: string;
    featured: ChallengeSummary | null;
    side: ChallengeSummary[];
    refreshInSeconds: number;
    cleared: boolean;
  };
  weekly: {
    weekKey: string;
    boss: ChallengeSummary | null;
    parts: ChallengeSummary[];
    progress: number;
    refreshInSeconds: number;
    cleared: boolean;
  };
  monthly: {
    monthKey: string;
    featured: ChallengeSummary | null;
    refreshInSeconds: number;
    cleared: boolean;
  };
  /** Referenced pack items only — full catalog lives on /problems */
  questions: ChallengeSummary[];
  forYou: ChallengeSummary[];
  gamification: ChallengeGamification;
  catalogMeta: {
    total: number;
    byType: Record<ChallengeType, number>;
    companies: string[];
  };
  weakness: WeaknessCoach | null;
  milestones: MilestoneInfo[];
  arena: {
    bestScore: number;
    lastPlayedAt?: string;
    packIds: string[];
  };
  duelCode: string;
  companies: string[];
};
