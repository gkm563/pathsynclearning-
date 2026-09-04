import type {
  AssessmentStatus,
  ConsistencyHeatmap,
  HeatmapDay,
  HeatmapMonthLabel,
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

function utcDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfUtcDay(d: Date): Date {
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

/** Align to Monday of the UTC week containing `d`. */
function startOfUtcWeek(d: Date): Date {
  const day = startOfUtcDay(d);
  const dow = day.getUTCDay(); // 0 Sun … 6 Sat
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  day.setUTCDate(day.getUTCDate() + mondayOffset);
  return day;
}

function intensityLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 6) return 3;
  return 4;
}

function streakFromDaySet(
  daySet: Set<string>,
  fromKey: string,
): number {
  let streak = 0;
  const cursor = new Date(`${fromKey}T00:00:00.000Z`);
  while (daySet.has(utcDateKey(cursor))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
}

function bestStreakFromDaySet(daySet: Set<string>): number {
  if (daySet.size === 0) return 0;
  const sorted = [...daySet].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(`${sorted[i - 1]}T00:00:00.000Z`);
    const cur = new Date(`${sorted[i]}T00:00:00.000Z`);
    const gap =
      (cur.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000);
    if (gap === 1) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

function monthShort(dateKey: string): string {
  return new Date(`${dateKey}T00:00:00.000Z`).toLocaleDateString("en-US", {
    month: "short",
    timeZone: "UTC",
  });
}

function weekdayLabelsMonSun(): string[] {
  // Monday-aligned week; show Mon / Wed / Fri only to keep the axis readable.
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.UTC(2024, 0, 1 + i)); // 2024-01-01 is Monday
    if (i % 2 !== 0) return "";
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      timeZone: "UTC",
    });
  });
}

function availableYearsFrom(
  yearsWithActivity: Set<number>,
  currentYear: number,
  selectedYear: number,
): number[] {
  const years = new Set(yearsWithActivity);
  years.add(currentYear);
  years.add(selectedYear);
  return [...years].sort((a, b) => b - a);
}

/**
 * Build a 12-month consistency heatmap from real activity timestamps.
 * Current year: rolling window (today back 12 months).
 * Past year: that calendar year Jan–Dec.
 * Empty cells are calendar days with count 0 — never invented activity.
 */
export function buildConsistencyHeatmap(
  timestamps: Date[],
  selectedYear: number = new Date().getUTCFullYear(),
  now = new Date(),
): ConsistencyHeatmap {
  const year = Math.max(2000, Math.min(2100, Math.floor(selectedYear)));
  const counts = new Map<string, number>();
  const yearsWithActivity = new Set<number>();

  for (const ts of timestamps) {
    if (!(ts instanceof Date) || Number.isNaN(ts.getTime())) continue;
    const key = utcDateKey(ts);
    counts.set(key, (counts.get(key) || 0) + 1);
    yearsWithActivity.add(ts.getUTCFullYear());
  }

  const currentYear = now.getUTCFullYear();
  const availableYears = availableYearsFrom(
    yearsWithActivity,
    currentYear,
    year,
  );

  const today = startOfUtcDay(now);
  const rolling = year === currentYear;
  const windowStart = rolling
    ? new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 11, 1))
    : new Date(Date.UTC(year, 0, 1));
  const windowEnd = rolling
    ? today
    : new Date(Date.UTC(year, 11, 31));
  const windowStartKey = utcDateKey(windowStart);
  const windowEndKey = utcDateKey(windowEnd);

  const gridStart = startOfUtcWeek(windowStart);
  const gridEnd = startOfUtcWeek(windowEnd);
  gridEnd.setUTCDate(gridEnd.getUTCDate() + 6);

  const days: HeatmapDay[] = [];
  const cursor = new Date(gridStart);
  while (cursor.getTime() <= gridEnd.getTime()) {
    const date = utcDateKey(cursor);
    const inWindow =
      date >= windowStartKey &&
      date <= windowEndKey &&
      cursor.getTime() <= today.getTime();
    const raw = counts.get(date) || 0;
    const count = inWindow ? raw : 0;
    days.push({
      date,
      count,
      level: intensityLevel(count),
      inYear: inWindow,
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const weeks = Math.ceil(days.length / 7);
  const monthLabels: HeatmapMonthLabel[] = [];
  let lastMonthKey = "";
  for (let w = 0; w < weeks; w++) {
    const slice = days.slice(w * 7, w * 7 + 7);
    const anchor = slice.find((d) => d.inYear) || slice[0];
    if (!anchor || !anchor.inYear) continue;
    const monthKey = anchor.date.slice(0, 7);
    if (monthKey !== lastMonthKey) {
      monthLabels.push({ label: monthShort(anchor.date), weekIndex: w });
      lastMonthKey = monthKey;
    }
  }

  const activeKeys = new Set<string>();
  for (const day of days) {
    if (day.inYear && day.count > 0) activeKeys.add(day.date);
  }

  const todayKey = utcDateKey(now);
  const yesterday = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1),
  );
  const yesterdayKey = utcDateKey(yesterday);
  const windowIncludesToday =
    todayKey >= windowStartKey && todayKey <= windowEndKey;
  const currentStreak = !windowIncludesToday
    ? 0
    : activeKeys.has(todayKey)
      ? streakFromDaySet(activeKeys, todayKey)
      : activeKeys.has(yesterdayKey)
        ? streakFromDaySet(activeKeys, yesterdayKey)
        : 0;

  const refMonth = rolling ? today.getUTCMonth() : 11;
  const refYear = rolling ? today.getUTCFullYear() : year;
  const monthDayCount = rolling
    ? today.getUTCDate()
    : new Date(Date.UTC(year, 12, 0)).getUTCDate();
  let monthActiveDays = 0;
  for (let d = 1; d <= monthDayCount; d++) {
    const key = utcDateKey(new Date(Date.UTC(refYear, refMonth, d)));
    if (activeKeys.has(key)) monthActiveDays += 1;
  }

  let totalEvents = 0;
  let activeDays = 0;
  for (const day of days) {
    if (!day.inYear) continue;
    totalEvents += day.count;
    if (day.count > 0) activeDays += 1;
  }

  const startLabel = windowStart.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  const endLabel = windowEnd.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  const rangeLabel = rolling
    ? `${startLabel} – ${endLabel}`
    : String(year);

  return {
    year,
    windowStart: windowStartKey,
    windowEnd: windowEndKey,
    rolling,
    rangeLabel,
    availableYears,
    weeks,
    days,
    monthLabels,
    weekdayLabels: weekdayLabelsMonSun(),
    activeDays,
    totalEvents,
    currentStreak,
    bestStreak: bestStreakFromDaySet(activeKeys),
    monthActiveDays,
    monthDayCount,
  };
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
