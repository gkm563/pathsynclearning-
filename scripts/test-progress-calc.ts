/**
 * Unit-style smoke tests for progress calculation (no DB required).
 * Run: npx tsx scripts/test-progress-calc.ts
 */
import assert from "node:assert/strict";
import {
  averageScore,
  bestScoresByKey,
  buildJourneyMilestones,
  buildPerformanceSeries,
  completionPct,
  deriveAssessmentStatus,
  deriveOverallStatus,
  roundPct,
} from "../src/lib/progress/calculate";

function section(name: string) {
  console.log(`\n✓ ${name}`);
}

section("completion & rounding");
assert.equal(completionPct(0, 0), 0);
assert.equal(completionPct(0, 10), 0);
assert.equal(completionPct(10, 10), 100);
assert.equal(completionPct(1, 3), 33);
assert.equal(roundPct(99.4), 99);
assert.equal(roundPct(99.5), 100);

section("average score + best-of attempts");
assert.equal(averageScore([]), null);
assert.equal(averageScore([80, 90, 100]), 90);
const best = bestScoresByKey([
  { key: "a", score: 40 },
  { key: "a", score: 90 },
  { key: "b", score: 70 },
]);
assert.equal(best.get("a"), 90);
assert.equal(best.get("b"), 70);

section("assessment status");
assert.equal(
  deriveAssessmentStatus({
    completedTasks: 0,
    totalTasks: 5,
    attempted: false,
    lastPassed: null,
    lastFailed: null,
  }),
  "not_started",
);
assert.equal(
  deriveAssessmentStatus({
    completedTasks: 2,
    totalTasks: 5,
    attempted: true,
    lastPassed: null,
    lastFailed: null,
  }),
  "in_progress",
);
assert.equal(
  deriveAssessmentStatus({
    completedTasks: 5,
    totalTasks: 5,
    attempted: true,
    lastPassed: true,
    lastFailed: false,
  }),
  "passed",
);
assert.equal(
  deriveAssessmentStatus({
    completedTasks: 5,
    totalTasks: 5,
    attempted: true,
    lastPassed: false,
    lastFailed: true,
  }),
  "failed",
);

section("overall status");
assert.equal(
  deriveOverallStatus({
    completion: 0,
    completed: 0,
    inProgress: 0,
    pending: 3,
    averageScore: null,
    totalTasks: 10,
  }),
  "getting-started",
);
assert.equal(
  deriveOverallStatus({
    completion: 100,
    completed: 5,
    inProgress: 0,
    pending: 0,
    averageScore: 88,
    totalTasks: 10,
  }),
  "completed",
);
assert.equal(
  deriveOverallStatus({
    completion: 50,
    completed: 3,
    inProgress: 1,
    pending: 1,
    averageScore: 40,
    totalTasks: 10,
  }),
  "needs-attention",
);
assert.equal(
  deriveOverallStatus({
    completion: 50,
    completed: 3,
    inProgress: 1,
    pending: 1,
    averageScore: 80,
    totalTasks: 10,
  }),
  "on-track",
);

section("milestones");
const empty = buildJourneyMilestones(0);
assert.equal(empty[0].achieved, true);
assert.equal(empty.filter((m) => m.achieved).length, 1);
const mid = buildJourneyMilestones(50);
assert.deepEqual(
  mid.filter((m) => m.achieved).map((m) => m.id),
  ["started", "fundamentals", "development"],
);
const full = buildJourneyMilestones(100);
assert.equal(full.every((m) => m.achieved), true);

section("performance series");
const now = new Date("2026-09-04T12:00:00.000Z");
const series = buildPerformanceSeries(
  [
    { at: new Date("2026-08-10T12:00:00.000Z"), score: 60, passed: true },
    { at: new Date("2026-08-20T12:00:00.000Z"), score: 75, passed: true },
    { at: new Date("2026-09-01T12:00:00.000Z"), score: 90, passed: true },
  ],
  "month",
  now,
);
assert.ok(series.length >= 1);
assert.ok(series.every((p) => p.attempts > 0));

const emptySeries = buildPerformanceSeries([], "all", now);
assert.equal(emptySeries.length, 0);

console.log("\nAll progress calculation tests passed.\n");
