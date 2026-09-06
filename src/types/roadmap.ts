/**
 * Roadmap domain types.
 * Shared between client and server — do NOT import server-only modules here.
 */

/* ─── Node Types ──────────────────────────────────────────────────── */

export type RoadmapNodeType =
  | "goal"
  | "milestone"
  | "phase"
  | "skill"
  | "topic"
  | "project"
  | "resource"
  | "checkpoint"
  | "career";

export type RoadmapNodeStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "completed"
  | "skipped";

export type RoadmapNodePriority = "low" | "medium" | "high" | "critical";

export interface RoadmapNodeResource {
  title: string;
  url: string;
  type: "documentation" | "video" | "course" | "practice" | "article" | "project";
  channel?: string;
  /** Extra videos/docs from other channels — not the core lesson. */
  suggested?: boolean;
}

export interface McqQuestion {
  id: string;
  prompt: string;
  options: string[];
  /** Server-only — stripped from public GET */
  correctIndex: number;
}

export interface CodingTestCase {
  args: unknown[];
  expected: unknown;
}

export type CodingDifficulty = "easy" | "medium" | "hard";

export interface CodingAssessment {
  prompt: string;
  starterCode: string;
  functionName: string;
  examples: { input: string; output: string; explanation?: string }[];
  publicTests: CodingTestCase[];
  /** Server-only — stripped from public GET */
  hiddenTests?: CodingTestCase[];
  /** LeetCode-style problem title (defaults to functionName). */
  title?: string;
  difficulty?: CodingDifficulty;
  /** Full problem statement; falls back to prompt. */
  statement?: string;
  constraints?: string[];
  hints?: string[];
  followUp?: string;
}

export interface ProjectStepSpec {
  id: string;
  title: string;
  instructions: string;
  acceptance: string[];
  resources?: { label: string; url: string }[];
  requiredEvidence?: Array<"repo_url" | "screenshot_url" | "demo_url" | "notes">;
}

export interface ProjectRubricSpec {
  id: string;
  label: string;
  weight: number;
  check:
    | "evidence_present"
    | "checklist_complete"
    | "keyword_notes"
    | "manual"
    | "github_readme"
    | "github_structure"
    | "github_commits";
  keywords?: string[];
  requiredPaths?: string[];
}

export interface ProjectAssessment {
  overview: {
    goal: string;
    stack: string[];
    deliverables: string[];
    estimatedHours: number;
  };
  steps: ProjectStepSpec[];
  rubric: ProjectRubricSpec[];
}

export interface NodeAssessment {
  /** Stable id within the node — required when a node has multiple assessments. */
  id?: string;
  /** Short label for the picker (e.g. "Two Sum", "Concept quiz"). */
  title?: string;
  type: "mcq" | "coding" | "project";
  passScore: number;
  timeLimitMinutes: number;
  mcq?: { questions: McqQuestion[] };
  coding?: CodingAssessment;
  project?: ProjectAssessment;
}

export interface RoadmapNode {
  id: string;
  type: RoadmapNodeType;
  title: string;
  description: string;
  status: RoadmapNodeStatus;
  priority: RoadmapNodePriority;
  estimatedHours: number;
  dependencies: string[];
  skills: string[];
  topics: string[];
  resources: RoadmapNodeResource[];
  project: string | null;
  whyLearn: string;
  learningOutcomes?: string[];
  interviewFocus?: string;
  /** Primary / first assessment (kept for older roadmaps). */
  assessment?: NodeAssessment;
  /** Extra assessments on the same node. Pass all to complete the node. */
  assessments?: NodeAssessment[];
  /** Position — set by auto-layout, not by AI */
  position?: { x: number; y: number };
}

export interface RoadmapEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

/* ─── Roadmap ─────────────────────────────────────────────────────── */

export interface Roadmap {
  id: string;
  userId: string;
  version: number;
  title: string;
  targetRole: string;
  targetCompany: string | null;
  estimatedWeeks: number | null;
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  generatedFromProfile: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
}

/** Lightweight row for roadmap list / switcher. */
export interface RoadmapSummary {
  id: string;
  title: string;
  targetRole: string;
  targetCompany: string | null;
  version: number;
  estimatedWeeks: number | null;
  isActive: boolean;
  createdAt: string;
  completionPercent: number;
  nodeCount: number;
  completedNodes?: number;
  remainingHours?: number;
}

/* ─── Progress ────────────────────────────────────────────────────── */

export interface RoadmapNodeProgress {
  nodeId: string;
  status: RoadmapNodeStatus;
  completedAt: string | null;
}

/* ─── Student Profile for Roadmap ─────────────────────────────────── */

export interface SkillConfidence {
  skill: string;
  confidence: "never_used" | "beginner" | "basic" | "intermediate" | "advanced" | "very_confident";
}

export interface ProjectEntry {
  name: string;
  technologies: string[];
  difficulty: "easy" | "medium" | "hard";
  deployed: boolean;
  solo: boolean;
}

export interface RoadmapProfile {
  // Education
  currentStudy: string | null;
  yearSemester: string | null;
  academicBackground: string | null;
  enjoyedSubjects: string[];
  struggledSubjects: string[];
  // Career
  careerGoal: string | null;
  targetRole: string | null;
  targetCompany: string | null;
  // Skills
  knownSkills: SkillConfidence[];
  // Projects
  hasProjects: boolean;
  projects: ProjectEntry[];
  experienceLevel: string | null;
  // Learning
  wantToLearn: string[];
  learningMotivation: string | null;
  // Time
  weeklyHours: string | null;
  projectVsLearning: string | null;
  // Preferences
  learningStyles: string[];
  targetTimeline: string | null;
  topPriority: string | null;
  // AI follow-ups
  aiFollowUpAnswers: Record<string, unknown>;
  //
  completed: boolean;
}

/* ─── AI Follow-Up Questions ──────────────────────────────────────── */

export type FollowUpQuestionType = "single_choice" | "multi_choice" | "text" | "rating";

export interface FollowUpQuestion {
  id: string;
  question: string;
  type: FollowUpQuestionType;
  options: string[];
  reason: string;
  required: boolean;
}

export interface FollowUpQuestionsResponse {
  needsMoreInformation: boolean;
  questions: FollowUpQuestion[];
}

/* ─── Canvas Filter ───────────────────────────────────────────────── */

export type RoadmapFilter =
  | "all"
  | "skill"
  | "project"
  | "milestone"
  | "completed"
  | "in_progress"
  | "locked"
  | "high_priority";
