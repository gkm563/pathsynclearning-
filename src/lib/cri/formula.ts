import { CRI_FULL_MILLI, mulDivRound } from "@/lib/cri/milli";

export const CRI_FORMULA_ID = "cri.v1";

export const CRI_DISCLAIMER =
  "CRI measures demonstrated readiness for this career. It does not guarantee a job or tell a recruiter to hire.";

export type CriComponentId =
  | "knowledge"
  | "dsa"
  | "projects"
  | "interview"
  | "roadmap"
  | "consistency"
  | "profile"
  | "opensource"
  | "hackathons"
  | "certifications";

export const CRI_COMPONENT_LABEL: Record<CriComponentId, string> = {
  knowledge: "Technical / CS knowledge",
  dsa: "DSA and problem solving",
  projects: "Projects and engineering",
  interview: "Interview readiness",
  roadmap: "Roadmap skill mastery",
  consistency: "Consistency / retention",
  profile: "Resume / profile",
  opensource: "Open source",
  hackathons: "Hackathons / competitions",
  certifications: "Certifications",
};

/** Published full-model weights (percent of 100). Sum = 100. */
export const PUBLISHED_WEIGHT_PCT: Record<CriComponentId, number> = {
  knowledge: 15,
  dsa: 20,
  projects: 15,
  interview: 15,
  roadmap: 10,
  consistency: 10,
  profile: 2,
  opensource: 5,
  hackathons: 5,
  certifications: 3,
};

export const PHASE1_LIVE = [
  "knowledge",
  "dsa",
  "projects",
  "interview",
  "roadmap",
  "consistency",
  "profile",
] as const;

export const PHASE1_RESERVED = [
  "opensource",
  "hackathons",
  "certifications",
] as const;

const LIVE_PUBLISHED_SUM = PHASE1_LIVE.reduce(
  (sum, id) => sum + PUBLISHED_WEIGHT_PCT[id],
  0,
);

/** Live v1 weights in milli of overall CRI. Sum = 100_000. Remainder on profile. */
export const LIVE_WEIGHT_MILLI: Record<(typeof PHASE1_LIVE)[number], number> =
  (() => {
    const out = {} as Record<(typeof PHASE1_LIVE)[number], number>;
    let used = 0;
    PHASE1_LIVE.forEach((id, index) => {
      if (index === PHASE1_LIVE.length - 1) {
        out[id] = CRI_FULL_MILLI - used;
        return;
      }
      const w = Math.trunc(
        (PUBLISHED_WEIGHT_PCT[id] * CRI_FULL_MILLI) / LIVE_PUBLISHED_SUM,
      );
      out[id] = w;
      used += w;
    });
    return out;
  })();

export const DSA_SUBWEIGHT = {
  accuracy: 30,
  difficulty: 25,
  unseen: 15,
  time: 15,
  consistency: 10,
  retention: 5,
} as const;

export const KNOWLEDGE_SUBWEIGHT = {
  accuracy: 50,
  difficulty: 25,
  consistency: 25,
} as const;

export const PROJECT_SUBWEIGHT = {
  rubric: 50,
  checklist: 20,
  testsDocs: 15,
  reflection: 10,
  complexity: 5,
} as const;

export const INTERVIEW_SUBWEIGHT = {
  overall: 40,
  communication: 15,
  problemSolving: 15,
  codeQuality: 15,
  depth: 15,
} as const;

export const ROADMAP_SUBWEIGHT = {
  completion: 50,
  prerequisites: 20,
  assessments: 30,
} as const;

export const CONSISTENCY_SUBWEIGHT = {
  activeDays: 40,
  streak: 30,
  improvement: 30,
} as const;

/** Profile checklist points. Sum = 100. */
export const PROFILE_POINTS = {
  fullName: 10,
  username: 10,
  bio: 10,
  institute: 10,
  degree: 10,
  github: 15,
  linkedin: 10,
  skills: 10,
  projects: 10,
  additionalCompleted: 5,
} as const;

export const DIFFICULTY_MILLI = {
  easy: 40_000,
  medium: 70_000,
  hard: 100_000,
} as const;

/** Interview recency: lose 333 milli per day, floor 50_000. */
export const INTERVIEW_DECAY_PER_DAY = 333;
export const INTERVIEW_DECAY_FLOOR = 50_000;
export const INTERVIEW_INTEGRITY_SOFT_CAP = 80_000;
export const INTERVIEW_INTEGRITY_HARD_CAP = 40_000;
export const INTERVIEW_INTEGRITY_HARD_COUNT = 3;

export const DSA_WINDOW_DAYS = 28;
export const CONSISTENCY_WINDOW_DAYS = 56;
export const RETENTION_MIN_GAP_DAYS = 7;

export function contributionMilli(
  liveWeightMilli: number,
  scoreMilli: number,
): number {
  return mulDivRound(liveWeightMilli * scoreMilli, CRI_FULL_MILLI);
}
