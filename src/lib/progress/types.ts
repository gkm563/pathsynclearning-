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

/** One day cell in the consistency heatmap (weeks × weekdays). */
export type HeatmapDay = {
  /** UTC date key YYYY-MM-DD */
  date: string;
  /** Activity events that day (attempts, assessments, etc.) */
  count: number;
  /** 0 idle … 4 peak — derived from count */
  level: 0 | 1 | 2 | 3 | 4;
  /** False for padding days from adjacent years in first/last weeks */
  inYear: boolean;
};

export type HeatmapMonthLabel = {
  /** Short month name, e.g. Jan */
  label: string;
  /** Week column index (0-based) */
  weekIndex: number;
};

export type ConsistencyHeatmap = {
  /** Anchor year (current year = rolling 12 months ending today) */
  year: number;
  /** Inclusive window start YYYY-MM-DD */
  windowStart: string;
  /** Inclusive window end YYYY-MM-DD */
  windowEnd: string;
  /** True when the window slides with today (not a closed calendar year) */
  rolling: boolean;
  rangeLabel: string;
  /** Years with recorded activity, plus the current calendar year */
  availableYears: number[];
  weeks: number;
  days: HeatmapDay[];
  monthLabels: HeatmapMonthLabel[];
  /** 7 weekday labels (Mon→Sun); blank entries hide the row label */
  weekdayLabels: string[];
  activeDays: number;
  totalEvents: number;
  currentStreak: number;
  bestStreak: number;
  monthActiveDays: number;
  monthDayCount: number;
};

export type ProgressPayload = {
  range: ProgressRange;
  summary: ProgressSummary;
  assessments: ProgressAssessment[];
  performance: PerformancePoint[];
  activity: ProgressActivityItem[];
  milestones: ProgressMilestone[];
  nextAction: ProgressNextAction;
  heatmap: ConsistencyHeatmap;
};
