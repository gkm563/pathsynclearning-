/** Progress page domain types — shared client/server. */

export type ProgressRange = "week" | "month" | "all";

export type ProgressStatus =
  | "getting-started"
  | "in-progress"
  | "on-track"
  | "needs-attention"
  | "completed";

export type AssessmentStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "failed"
  | "passed";

export type ProgressAssessmentKind =
  | "challenge_track"
  | "roadmap_node"
  | "project";

export type NextActionKind =
  | "assessment"
  | "project"
  | "challenge"
  | "caught_up";

export type ProgressSummary = {
  completion: number;
  completedTasks: number;
  totalTasks: number;
  completed: number;
  inProgress: number;
  pending: number;
  averageScore: number | null;
  status: ProgressStatus;
  currentFocus: string | null;
  lastActivityAt: string | null;
};

export type ProgressAssessment = {
  id: string;
  name: string;
  description: string;
  kind: ProgressAssessmentKind;
  completion: number;
  score: number | null;
  status: AssessmentStatus;
  completedTasks: number;
  totalTasks: number;
  lastAttemptAt: string | null;
  href: string;
};

export type PerformancePoint = {
  /** Bucket label, e.g. W1 / Mar 1 / All */
  label: string;
  /** ISO start of bucket */
  date: string;
  averageScore: number | null;
  completionPct: number;
  attempts: number;
};

export type ProgressActivityItem = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  occurredAt: string;
  href: string | null;
};

export type ProgressMilestone = {
  id: string;
  title: string;
  description: string;
  threshold: number;
  achieved: boolean;
  achievedAt: string | null;
};

export type ProgressNextAction = {
  kind: NextActionKind;
  title: string;
  subtitle: string;
  href: string | null;
  remainingTasks: number | null;
};

export type ProgressPayload = {
  range: ProgressRange;
  summary: ProgressSummary;
  assessments: ProgressAssessment[];
  performance: PerformancePoint[];
  activity: ProgressActivityItem[];
  milestones: ProgressMilestone[];
  nextAction: ProgressNextAction;
};
