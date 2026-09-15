import type { CriComponentId } from "@/lib/cri/formula";

export type CriEvidenceStatus = "ok" | "missing" | "not_scored";

export type CriEvidenceDraft = {
  component: CriComponentId;
  sourceType: string;
  sourceId: string;
  metric: string;
  valueMilli: number;
  weightMilli: number;
};

export type CriComponentResult = {
  id: CriComponentId;
  publishedWeightPct: number;
  liveWeightMilli: number;
  scoreMilli: number;
  contributionMilli: number;
  status: CriEvidenceStatus;
};

export type CriComputation = {
  formulaId: string;
  criMilli: number;
  targetRole: string | null;
  components: CriComponentResult[];
  evidence: CriEvidenceDraft[];
};

export type DsaAttemptFact = {
  id: string;
  problemKey: string;
  passed: boolean;
  score: number;
  difficulty: string;
  careerTags: string[];
  topics: string[];
  durationMs: number | null;
  estMinutes: number | null;
  createdAtMs: number;
};

export type KnowledgeAttemptFact = {
  id: string;
  itemKey: string;
  passed: boolean;
  score: number;
  difficulty: string;
  careerTags: string[];
  createdAtMs: number;
};

export type ProjectFact = {
  id: string;
  score: number;
  checklistPct: number;
  hasRepo: boolean;
  hasReflection: boolean;
  estimatedHours: number;
  passed: boolean;
};

export type InterviewFact = {
  id: string;
  targetRole: string;
  overall: number;
  communication: number;
  problemSolving: number;
  codeQuality: number;
  depth: number;
  integrityCount: number;
  endedAtMs: number;
};

export type RoadmapFact = {
  targetRole: string | null;
  trackable: number;
  completed: number;
  prerequisitesMet: boolean;
  passedAssessmentScores: number[];
};

export type ConsistencyFact = {
  streak: number;
  activityAtMs: number[];
  rollingAccuracy: Array<{ atMs: number; score: number }>;
};

export type ProfileFact = {
  fullName: boolean;
  username: boolean;
  bio: boolean;
  institute: boolean;
  degree: boolean;
  github: boolean;
  linkedin: boolean;
  skills: boolean;
  projects: boolean;
  additionalCompleted: boolean;
};

export type CriFacts = {
  targetRole: string | null;
  dsa: DsaAttemptFact[];
  knowledge: KnowledgeAttemptFact[];
  projects: ProjectFact[];
  interviews: InterviewFact[];
  roadmap: RoadmapFact | null;
  consistency: ConsistencyFact;
  profile: ProfileFact;
};

export type CriTrigger =
  | "assessment"
  | "challenge"
  | "project"
  | "interview"
  | "profile"
  | "career"
  | "manual";
