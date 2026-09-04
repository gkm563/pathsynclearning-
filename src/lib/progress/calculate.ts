import type {
  AssessmentStatus,
  ProgressMilestone,
  ProgressRange,
  ProgressStatus,
} from "@/lib/progress/types";

/** Configurable journey milestones driven by overall completion %. */
export const JOURNEY_MILESTONE_DEFS: ReadonlyArray<{
  id: string;
  title: string;
  description: string;
  threshold: number;
}> = [
  {
    id: "started",
    title: "Started",
    description: "Began your PathEd journey.",
    threshold: 0,
  },
  {
    id: "fundamentals",
    title: "Fundamentals",
    description: "Completed at least 25% of available tasks.",
    threshold: 25,
  },
  {
    id: "development",
    title: "Development",
    description: "Reached the halfway mark of your path.",
    threshold: 50,
  },
  {
    id: "final_project",
    title: "Final Project",
    description: "Pushed past 75% completion.",
    threshold: 75,
  },
  {
    id: "certification",
    title: "Certification",
    description: "Finished all available assessments and tasks.",
    threshold: 100,
  },
];

export function roundPct(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0;
  if (value >= 100) return 100;
  return Math.round(value);
}

export function completionPct(completed: number, total: number): number {
  if (total <= 0) return 0;
  return roundPct((completed / total) * 100);
}

export function averageScore(scores: number[]): number | null {
  const clean = scores.filter((s) => Number.isFinite(s));
  if (clean.length === 0) return null;
  const sum = clean.reduce((a, b) => a + b, 0);
  return Math.round(sum / clean.length);
}

/** Prefer best score per assessment key (multiple attempts). */
export function bestScoresByKey(
  rows: Array<{ key: string; score: number; passed?: boolean }>,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of rows) {
    const score = Math.max(0, Math.min(100, Math.floor(Number(row.score) || 0)));
    const prev = map.get(row.key);
    if (prev === undefined || score > prev) map.set(row.key, score);
  }
  return map;
}

export function deriveAssessmentStatus(input: {
  completedTasks: number;
  totalTasks: number;
  attempted: boolean;
  lastPassed: boolean | null;
  lastFailed: boolean | null;
}): AssessmentStatus {
  const { completedTasks, totalTasks, attempted, lastPassed, lastFailed } =
    input;
  if (totalTasks <= 0) return "not_started";
  if (completedTasks >= totalTasks) {
    if (lastPassed === false && lastFailed === true) return "failed";
    if (lastPassed === true) return "passed";
    return "completed";
  }
  if (completedTasks > 0 || attempted) {
    if (
      lastFailed === true &&
      lastPassed !== true &&
      completedTasks === 0
    ) {
      return "failed";
    }
    return "in_progress";
  }
  return "not_started";
}

export function deriveOverallStatus(input: {
  completion: number;
  completed: number;
  inProgress: number;
  pending: number;
  averageScore: number | null;
  totalTasks: number;
}): ProgressStatus {
  const { completion, completed, inProgress, averageScore, totalTasks } =
    input;
  if (totalTasks <= 0) return "getting-started";
  if (completion >= 100) return "completed";
  if (completed === 0 && inProgress === 0) return "getting-started";
  if (averageScore !== null && averageScore < 50 && completed > 0) {
    return "needs-attention";
  }
  if (
    (averageScore !== null && averageScore >= 70 && completion >= 15) ||
    (completion >= 40 && (averageScore === null || averageScore >= 60))
  ) {
    return "on-track";
  }
  if (inProgress > 0 || completed > 0) return "in-progress";
  return "getting-started";
}

export function buildJourneyMilestones(
  completion: number,
  achievedAtById?: Map<string, string | null>,
): ProgressMilestone[] {
  return JOURNEY_MILESTONE_DEFS.map((def) => {
    const achieved =
      def.threshold === 0 ? completion >= 0 : completion >= def.threshold;
    return {
      id: def.id,
      title: def.title,
      description: def.description,
      threshold: def.threshold,
      achieved,
      achievedAt: achieved
        ? (achievedAtById?.get(def.id) ?? null)
        : null,
    };
  });
}

export function rangeStart(range: ProgressRange, now = new Date()): Date | null {
  if (range === "all") return null;
  const d = new Date(now);
  if (range === "week") {
    d.setUTCDate(d.getUTCDate() - 7);
    return d;
  }
  d.setUTCDate(d.getUTCDate() - 30);
  return d;
}

export function inRange(isoOrDate: Date | string | null | undefined, start: Date | null): boolean {
  if (!start) return true;
  if (!isoOrDate) return false;
  const t = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(t.getTime())) return false;
  return t.getTime() >= start.getTime();
}

/** Bucket attempts into weekly (or daily for week range) performance points. */
export function buildPerformanceSeries(
  attempts: Array<{ at: Date; score: number; passed?: boolean }>,
  range: ProgressRange,
  now = new Date(),
): Array<{
  label: string;
  date: string;
  averageScore: number | null;
  completionPct: number;
  attempts: number;
}> {
  const start = rangeStart(range, now);
  const filtered = attempts
    .filter((a) => inRange(a.at, start))
    .sort((a, b) => a.at.getTime() - b.at.getTime());

  if (filtered.length === 0) return [];

  type Bucket = {
    label: string;
    date: string;
    scores: number[];
    passed: number;
    attempts: number;
  };

  const buckets = new Map<string, Bucket>();

  const bucketKey = (d: Date): { key: string; label: string; date: string } => {
    if (range === "week") {
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("en-US", {
        weekday: "short",
        timeZone: "UTC",
      });
      return { key, label, date: `${key}T00:00:00.000Z` };
    }
    // month / all → ISO week buckets
    const tmp = new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
    );
    const day = tmp.getUTCDay() || 7;
    tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(tmp.getUTCFullYear(), 0, 1));
    const week = Math.ceil(
      ((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
    );
    const key = `${tmp.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
    const weekStart = new Date(d);
    weekStart.setUTCDate(weekStart.getUTCDate() - ((weekStart.getUTCDay() + 6) % 7));
    const date = weekStart.toISOString().slice(0, 10) + "T00:00:00.000Z";
    return { key, label: `W${week}`, date };
  };

  for (const a of filtered) {
    const { key, label, date } = bucketKey(a.at);
    let b = buckets.get(key);
    if (!b) {
      b = { label, date, scores: [], passed: 0, attempts: 0 };
      buckets.set(key, b);
    }
    b.attempts += 1;
    b.scores.push(a.score);
    if (a.passed) b.passed += 1;
  }

  const ordered = [...buckets.values()].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  // Cap points for chart readability
  const capped =
    range === "all" && ordered.length > 12
      ? ordered.slice(ordered.length - 12)
      : ordered;

  let cumulativePassed = 0;
  const totalInSeries = capped.reduce((s, b) => s + b.attempts, 0) || 1;

  return capped.map((b) => {
    cumulativePassed += b.passed;
    return {
      label: b.label,
      date: b.date,
      averageScore: averageScore(b.scores),
      completionPct: roundPct((cumulativePassed / totalInSeries) * 100),
      attempts: b.attempts,
    };
  });
}

export function formatRelativeTime(
  iso: string,
  now = new Date(),
): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diff = Math.max(0, now.getTime() - t);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 14) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function statusLabel(status: ProgressStatus): string {
  switch (status) {
    case "on-track":
      return "On Track";
    case "needs-attention":
      return "Needs Attention";
    case "in-progress":
      return "In Progress";
    case "completed":
      return "Completed";
    default:
      return "Getting Started";
  }
}

export function assessmentStatusLabel(status: AssessmentStatus): string {
  switch (status) {
    case "not_started":
      return "Not Started";
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
    case "passed":
      return "Passed";
    default:
      return status;
  }
}
