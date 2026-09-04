import { and, desc, eq, gte, sql } from "drizzle-orm";
import { listCatalog } from "@/lib/challenges/catalog";
import {
  dateKeyNow,
  normalizeProgressState,
} from "@/lib/challenges/progress";
import type { ChallengeType } from "@/lib/challenges/types";
import { getDb } from "@/lib/db/client";
import {
  challengeAttempts,
  challengeProgress,
  memories,
  projectRuns,
  roadmaps,
  roadmapAssessmentAttempts,
  roadmapProgress,
} from "@/lib/db/schema";
import {
  averageScore,
  bestScoresByKey,
  buildJourneyMilestones,
  buildPerformanceSeries,
  completionPct,
  deriveAssessmentStatus,
  deriveOverallStatus,
  inRange,
  rangeStart,
} from "@/lib/progress/calculate";
import type {
  ProgressActivityItem,
  ProgressAssessment,
  ProgressNextAction,
  ProgressPayload,
  ProgressRange,
} from "@/lib/progress/types";
import { isAssessableNode } from "@/lib/roadmap/assessment";
import { routes } from "@/lib/routes";
import type { RoadmapNode } from "@/types/roadmap";

const TRACK_META: Record<
  ChallengeType,
  { name: string; description: string }
> = {
  coding: {
    name: "Coding Assessments",
    description: "Algorithm and implementation challenges from the catalog.",
  },
  mcq: {
    name: "MCQ Assessments",
    description: "Concept checks and knowledge quizzes.",
  },
  project: {
    name: "Project Assessments",
    description: "Guided projects with rubrics and evidence.",
  },
};

function asNodes(raw: unknown): RoadmapNode[] {
  return Array.isArray(raw) ? (raw as RoadmapNode[]) : [];
}

export async function getProgressPayload(
  userId: string,
  range: ProgressRange = "all",
): Promise<ProgressPayload> {
  const db = getDb();
  const now = new Date();
  const start = rangeStart(range, now);

  const [
    progressRow,
    attemptRows,
    projectRows,
    activeRoadmap,
    memoryRows,
  ] = await Promise.all([
    db
      .select()
      .from(challengeProgress)
      .where(eq(challengeProgress.userId, userId))
      .limit(1)
      .then((r) => r[0] ?? null),
    db
      .select({
        questionId: challengeAttempts.questionId,
        challengeType: challengeAttempts.challengeType,
        passed: challengeAttempts.passed,
        score: challengeAttempts.score,
        createdAt: challengeAttempts.createdAt,
      })
      .from(challengeAttempts)
      .where(
        start
          ? and(
              eq(challengeAttempts.userId, userId),
              gte(challengeAttempts.createdAt, start),
            )
          : eq(challengeAttempts.userId, userId),
      )
      .orderBy(desc(challengeAttempts.createdAt))
      .limit(500),
    db
      .select()
      .from(projectRuns)
      .where(eq(projectRuns.userId, userId))
      .orderBy(desc(projectRuns.updatedAt))
      .limit(100),
    db
      .select()
      .from(roadmaps)
      .where(and(eq(roadmaps.userId, userId), eq(roadmaps.isActive, true)))
      .orderBy(desc(roadmaps.createdAt))
      .limit(1)
      .then((r) => r[0] ?? null),
    db
      .select({
        id: memories.id,
        type: memories.type,
        title: memories.title,
        description: memories.description,
        occurredAt: memories.occurredAt,
        sourceType: memories.sourceType,
        sourceId: memories.sourceId,
      })
      .from(memories)
      .where(
        start
          ? and(eq(memories.userId, userId), gte(memories.occurredAt, start))
          : eq(memories.userId, userId),
      )
      .orderBy(desc(memories.occurredAt))
      .limit(40),
  ]);

  // All-time attempts for authoritative completion (not range-filtered)
  const allAttempts =
    range === "all"
      ? attemptRows
      : await db
          .select({
            questionId: challengeAttempts.questionId,
            challengeType: challengeAttempts.challengeType,
            passed: challengeAttempts.passed,
            score: challengeAttempts.score,
            createdAt: challengeAttempts.createdAt,
          })
          .from(challengeAttempts)
          .where(eq(challengeAttempts.userId, userId))
          .orderBy(desc(challengeAttempts.createdAt))
          .limit(2000);

  let nodeProgress: Array<{
    nodeId: string;
    status: string;
    completedAt: Date | null;
    updatedAt: Date;
  }> = [];
  let assessmentAttemptRows: Array<{
    nodeId: string;
    type: string;
    passed: boolean;
    score: number;
    createdAt: Date;
  }> = [];

  if (activeRoadmap) {
    const [rp, ra] = await Promise.all([
      db
        .select({
          nodeId: roadmapProgress.nodeId,
          status: roadmapProgress.status,
          completedAt: roadmapProgress.completedAt,
          updatedAt: roadmapProgress.updatedAt,
        })
        .from(roadmapProgress)
        .where(
          and(
            eq(roadmapProgress.userId, userId),
            eq(roadmapProgress.roadmapId, activeRoadmap.id),
          ),
        ),
      db
        .select({
          nodeId: roadmapAssessmentAttempts.nodeId,
          type: roadmapAssessmentAttempts.type,
          passed: roadmapAssessmentAttempts.passed,
          score: roadmapAssessmentAttempts.score,
          createdAt: roadmapAssessmentAttempts.createdAt,
        })
        .from(roadmapAssessmentAttempts)
        .where(
          and(
            eq(roadmapAssessmentAttempts.userId, userId),
            eq(roadmapAssessmentAttempts.roadmapId, activeRoadmap.id),
          ),
        )
        .orderBy(desc(roadmapAssessmentAttempts.createdAt))
        .limit(500),
    ]);
    nodeProgress = rp;
    assessmentAttemptRows = ra;
  }

  const catalog = listCatalog();
  const state = normalizeProgressState(progressRow?.state, dateKeyNow());
  const solvedSet = new Set(state.solvedIds);
  const attemptStatus = new Map(
    state.attempts.map((a) => [a.questionId, a.status]),
  );

  // Latest + best challenge attempt per question (all-time ledger + JSON state)
  const latestByQuestion = new Map<
    string,
    { passed: boolean; score: number; createdAt: Date; type: string }
  >();
  for (const row of allAttempts) {
    if (!latestByQuestion.has(row.questionId)) {
      latestByQuestion.set(row.questionId, {
        passed: row.passed,
        score: row.score,
        createdAt: row.createdAt,
        type: row.challengeType,
      });
    }
    if (row.passed) solvedSet.add(row.questionId);
  }
  for (const a of state.attempts) {
    if (a.status === "solved") solvedSet.add(a.questionId);
    const at = a.at ? new Date(a.at) : new Date(0);
    const existing = latestByQuestion.get(a.questionId);
    if (!existing || at > existing.createdAt) {
      latestByQuestion.set(a.questionId, {
        passed: a.status === "solved",
        score: Math.max(0, Math.floor(Number(a.score) || 0)),
        createdAt: at,
        type: catalog.find((q) => q.id === a.questionId)?.type || "coding",
      });
    }
  }

  const bestChallengeScores = bestScoresByKey([
    ...allAttempts
      .filter((a) => a.passed || a.score > 0)
      .map((a) => ({
        key: a.questionId,
        score: a.score,
        passed: a.passed,
      })),
    ...state.attempts
      .filter((a) => a.status === "solved" || (a.score ?? 0) > 0)
      .map((a) => ({
        key: a.questionId,
        score: Math.max(0, Math.floor(Number(a.score) || 0)),
        passed: a.status === "solved",
      })),
  ]);

  // Only average scores for questions that are actually completed/solved
  const completedChallengeScores: number[] = [];
  for (const q of catalog) {
    if (!solvedSet.has(q.id) && attemptStatus.get(q.id) !== "solved") continue;
    const sc = bestChallengeScores.get(q.id);
    if (sc !== undefined) completedChallengeScores.push(sc);
  }

  // ── Challenge tracks as assessments ──────────────────────────────
  const assessments: ProgressAssessment[] = [];
  const types: ChallengeType[] = ["coding", "mcq", "project"];

  for (const type of types) {
    const questions = catalog.filter((q) => q.type === type);
    const totalTasks = questions.length;
    if (totalTasks === 0) continue;

    let completedTasks = 0;
    let attempted = false;
    let lastAttemptAt: string | null = null;
    let lastPassed: boolean | null = null;
    let lastFailed: boolean | null = null;
    const scores: number[] = [];

    for (const q of questions) {
      const solved =
        solvedSet.has(q.id) || attemptStatus.get(q.id) === "solved";
      const latest = latestByQuestion.get(q.id);
      const status = attemptStatus.get(q.id);
      if (solved) {
        completedTasks += 1;
        const sc = bestChallengeScores.get(q.id);
        if (sc !== undefined) scores.push(sc);
        else if (latest) scores.push(latest.score);
      } else if (status === "attempted" || latest) {
        attempted = true;
      }
      if (latest) {
        const iso = latest.createdAt.toISOString();
        if (!lastAttemptAt || iso > lastAttemptAt) {
          lastAttemptAt = iso;
          lastPassed = latest.passed;
          lastFailed = !latest.passed;
        }
      }
    }

    const meta = TRACK_META[type];
    assessments.push({
      id: `track_${type}`,
      name: meta.name,
      description: meta.description,
      kind: type === "project" ? "project" : "challenge_track",
      completion: completionPct(completedTasks, totalTasks),
      score: averageScore(scores),
      status: deriveAssessmentStatus({
        completedTasks,
        totalTasks,
        attempted,
        lastPassed,
        lastFailed,
      }),
      completedTasks,
      totalTasks,
      lastAttemptAt,
      href: routes.app.challenges,
    });
  }

  // ── Roadmap assessable nodes ─────────────────────────────────────
  const nodes = activeRoadmap ? asNodes(activeRoadmap.nodes) : [];
  const progressByNode = new Map(nodeProgress.map((p) => [p.nodeId, p]));
  const latestAssessmentByNode = new Map<
    string,
    { passed: boolean; score: number; createdAt: Date }
  >();
  for (const a of assessmentAttemptRows) {
    if (!latestAssessmentByNode.has(a.nodeId)) {
      latestAssessmentByNode.set(a.nodeId, {
        passed: a.passed,
        score: a.score,
        createdAt: a.createdAt,
      });
    }
  }
  const bestNodeScores = bestScoresByKey(
    assessmentAttemptRows.map((a) => ({
      key: a.nodeId,
      score: a.score,
      passed: a.passed,
    })),
  );

  const assessableNodes = nodes.filter(
    (n) =>
      n.type === "skill" ||
      n.type === "topic" ||
      n.type === "project" ||
      n.type === "checkpoint",
  );

  for (const node of assessableNodes) {
    const prog = progressByNode.get(node.id);
    const latest = latestAssessmentByNode.get(node.id);
    const statusRaw = prog?.status ?? "locked";
    const completed =
      statusRaw === "completed" || statusRaw === "skipped" || Boolean(latest?.passed);
    const inProg =
      statusRaw === "in_progress" ||
      statusRaw === "available" ||
      Boolean(latest && !latest.passed);
    const attempted = Boolean(latest) || statusRaw === "in_progress";

    let status = deriveAssessmentStatus({
      completedTasks: completed ? 1 : 0,
      totalTasks: 1,
      attempted,
      lastPassed: latest ? latest.passed : null,
      lastFailed: latest ? !latest.passed : null,
    });
    if (statusRaw === "locked" && !latest) status = "not_started";
    if (completed && latest?.passed) status = "passed";
    if (completed && !latest) status = "completed";
    if (!completed && latest && !latest.passed) status = "failed";
    if (!completed && inProg && status === "not_started") status = "in_progress";

    assessments.push({
      id: `roadmap_${node.id}`,
      name: node.title,
      description:
        node.description ||
        (isAssessableNode(node)
          ? `${node.type} assessment on your roadmap`
          : `Roadmap ${node.type}`),
      kind: node.type === "project" ? "project" : "roadmap_node",
      completion: completed ? 100 : attempted || inProg ? 40 : 0,
      score: completed
        ? (bestNodeScores.get(node.id) ?? latest?.score ?? null)
        : latest
          ? latest.score
          : null,
      status,
      completedTasks: completed ? 1 : 0,
      totalTasks: 1,
      lastAttemptAt:
        latest?.createdAt.toISOString() ??
        prog?.completedAt?.toISOString() ??
        prog?.updatedAt?.toISOString() ??
        null,
      href: routes.app.roadmap,
    });
  }

  // Sort: in progress first, then not started with some activity, then completed
  const statusOrder: Record<string, number> = {
    in_progress: 0,
    failed: 1,
    not_started: 2,
    passed: 3,
    completed: 4,
  };
  assessments.sort((a, b) => {
    const d = (statusOrder[a.status] ?? 9) - (statusOrder[b.status] ?? 9);
    if (d !== 0) return d;
    return (b.lastAttemptAt || "").localeCompare(a.lastAttemptAt || "");
  });

  // ── Task totals (authoritative) ──────────────────────────────────
  const challengeTotal = catalog.length;
  const challengeCompleted = catalog.filter(
    (q) =>
      solvedSet.has(q.id) || attemptStatus.get(q.id) === "solved",
  ).length;

  const roadmapTotal = assessableNodes.length;
  const roadmapCompleted = assessableNodes.filter((n) => {
    const s = progressByNode.get(n.id)?.status;
    return s === "completed" || s === "skipped" || latestAssessmentByNode.get(n.id)?.passed;
  }).length;

  const totalTasks = challengeTotal + roadmapTotal;
  const completedTasks = challengeCompleted + roadmapCompleted;

  // Status counts across assessment cards
  let completedCount = 0;
  let inProgressCount = 0;
  let pendingCount = 0;
  for (const a of assessments) {
    if (a.status === "completed" || a.status === "passed") completedCount += 1;
    else if (a.status === "in_progress" || a.status === "failed")
      inProgressCount += 1;
    else pendingCount += 1;
  }

  const scorePool: number[] = [
    ...completedChallengeScores,
    ...[...bestNodeScores.entries()]
      .filter(([nodeId]) => {
        const s = progressByNode.get(nodeId)?.status;
        return (
          s === "completed" ||
          s === "skipped" ||
          latestAssessmentByNode.get(nodeId)?.passed
        );
      })
      .map(([, score]) => score),
  ];
  // Also include passed project run scores
  for (const run of projectRows) {
    if (run.status === "passed" || run.status === "completed" || run.passedAt) {
      if (run.score > 0) scorePool.push(run.score);
    }
  }

  const avg = averageScore(scorePool);
  const completion = completionPct(completedTasks, totalTasks);
  const overallStatus = deriveOverallStatus({
    completion,
    completed: completedCount,
    inProgress: inProgressCount,
    pending: pendingCount,
    averageScore: avg,
    totalTasks,
  });

  // Current focus
  const focusAssessment =
    assessments.find((a) => a.status === "in_progress") ||
    assessments.find((a) => a.status === "failed") ||
    null;

  const lastActivityCandidates: string[] = [];
  for (const a of allAttempts.slice(0, 1)) {
    lastActivityCandidates.push(a.createdAt.toISOString());
  }
  for (const m of memoryRows.slice(0, 1)) {
    lastActivityCandidates.push(m.occurredAt.toISOString());
  }
  for (const p of projectRows.slice(0, 1)) {
    lastActivityCandidates.push(
      (p.submittedAt ?? p.updatedAt ?? p.createdAt).toISOString(),
    );
  }
  lastActivityCandidates.sort((a, b) => b.localeCompare(a));
  const lastActivityAt = lastActivityCandidates[0] ?? null;

  // ── Performance series ───────────────────────────────────────────
  const perfAttempts: Array<{ at: Date; score: number; passed?: boolean }> = [
    ...allAttempts.map((a) => ({
      at: a.createdAt,
      score: a.score,
      passed: a.passed,
    })),
    ...assessmentAttemptRows.map((a) => ({
      at: a.createdAt,
      score: a.score,
      passed: a.passed,
    })),
    ...state.attempts
      .filter((a) => a.at)
      .map((a) => ({
        at: new Date(a.at),
        score: Math.max(0, Math.floor(Number(a.score) || 0)),
        passed: a.status === "solved",
      })),
  ];
  const performance = buildPerformanceSeries(perfAttempts, range, now);

  // ── Activity ─────────────────────────────────────────────────────
  const activity: ProgressActivityItem[] = memoryRows
    .filter((m) => inRange(m.occurredAt, start))
    .map((m) => ({
      id: m.id,
      type: m.type,
      title: m.title,
      description: m.description,
      occurredAt: m.occurredAt.toISOString(),
      href: memoryHref(m.type, m.sourceType),
    }));

  // Fallback activity from attempts if no memories yet
  if (activity.length === 0) {
    for (const a of attemptRows.slice(0, 20)) {
      const q = catalog.find((c) => c.id === a.questionId);
      activity.push({
        id: `attempt_${a.questionId}_${a.createdAt.toISOString()}`,
        type: a.passed ? "CHALLENGE_COMPLETED" : "CHALLENGE_ATTEMPTED",
        title: a.passed
          ? `${q?.title ?? a.questionId} completed`
          : `${q?.title ?? a.questionId} attempted`,
        description: q?.description ?? null,
        occurredAt: a.createdAt.toISOString(),
        href: routes.app.challenges,
      });
    }
    for (const a of assessmentAttemptRows.slice(0, 10)) {
      if (!inRange(a.createdAt, start)) continue;
      const node = nodes.find((n) => n.id === a.nodeId);
      activity.push({
        id: `ra_${a.nodeId}_${a.createdAt.toISOString()}`,
        type: a.passed ? "ASSESSMENT_PASSED" : "ASSESSMENT_FAILED",
        title: a.passed
          ? `${node?.title ?? "Assessment"} passed`
          : `${node?.title ?? "Assessment"} failed`,
        description: null,
        occurredAt: a.createdAt.toISOString(),
        href: routes.app.roadmap,
      });
    }
    activity.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  }

  // ── Milestones ───────────────────────────────────────────────────
  const milestones = buildJourneyMilestones(completion);

  // ── Next action ──────────────────────────────────────────────────
  const nextAction = resolveNextAction({
    assessments,
    projectRows,
    catalogSolved: solvedSet,
    catalog,
    attemptStatus,
  });

  return {
    range,
    summary: {
      completion,
      completedTasks,
      totalTasks,
      completed: completedCount,
      inProgress: inProgressCount,
      pending: pendingCount,
      averageScore: avg,
      status: overallStatus,
      currentFocus: focusAssessment?.name ?? null,
      lastActivityAt,
    },
    assessments,
    performance,
    activity: activity.slice(0, 30),
    milestones,
    nextAction,
  };
}

function memoryHref(type: string, sourceType: string | null): string | null {
  if (
    type.includes("CHALLENGE") ||
    sourceType === "challenge" ||
    sourceType === "project"
  ) {
    return routes.app.challenges;
  }
  if (type.includes("ROADMAP") || type.includes("LEARNING")) {
    return routes.app.roadmap;
  }
  if (type.includes("MILESTONE") || type.includes("ACHIEVEMENT")) {
    return routes.app.memoryLane;
  }
  return routes.app.memoryLane;
}

function resolveNextAction(input: {
  assessments: ProgressAssessment[];
  projectRows: Array<{
    status: string;
    source: string;
    refId: string;
    checklistPct: number;
  }>;
  catalogSolved: Set<string>;
  catalog: ReturnType<typeof listCatalog>;
  attemptStatus: Map<string, string>;
}): ProgressNextAction {
  const { assessments, projectRows, catalogSolved, catalog, attemptStatus } =
    input;

  const inProgressAssessment = assessments.find(
    (a) => a.status === "in_progress" && a.kind !== "project",
  );
  if (inProgressAssessment) {
    const remaining = Math.max(
      0,
      inProgressAssessment.totalTasks - inProgressAssessment.completedTasks,
    );
    return {
      kind: "assessment",
      title: inProgressAssessment.name,
      subtitle:
        remaining > 0
          ? `${remaining} task${remaining === 1 ? "" : "s"} remaining`
          : "Continue where you left off",
      href: inProgressAssessment.href,
      remainingTasks: remaining,
    };
  }

  const inProgressProject =
    assessments.find(
      (a) => a.kind === "project" && a.status === "in_progress",
    ) ||
    projectRows.find(
      (p) => p.status === "in_progress" || p.status === "submitted",
    );

  if (inProgressProject && "name" in inProgressProject) {
    const remaining = Math.max(
      0,
      inProgressProject.totalTasks - inProgressProject.completedTasks,
    );
    return {
      kind: "project",
      title: inProgressProject.name,
      subtitle:
        remaining > 0
          ? `${remaining} step${remaining === 1 ? "" : "s"} remaining`
          : "Continue your project",
      href: inProgressProject.href,
      remainingTasks: remaining,
    };
  }

  if (inProgressProject && "refId" in inProgressProject) {
    const q = catalog.find((c) => c.id === inProgressProject.refId);
    return {
      kind: "project",
      title: q?.title ?? "Project in progress",
      subtitle: `${Math.max(0, 100 - (inProgressProject.checklistPct || 0))}% remaining`,
      href: routes.app.challenges,
      remainingTasks: null,
    };
  }

  const pendingAssessment = assessments.find(
    (a) => a.status === "not_started" && a.kind !== "project",
  );
  if (pendingAssessment) {
    return {
      kind: "assessment",
      title: pendingAssessment.name,
      subtitle: "Next up on your path",
      href: pendingAssessment.href,
      remainingTasks: pendingAssessment.totalTasks,
    };
  }

  const nextChallenge = catalog.find(
    (q) =>
      !catalogSolved.has(q.id) && attemptStatus.get(q.id) !== "solved",
  );
  if (nextChallenge) {
    return {
      kind: "challenge",
      title: nextChallenge.title,
      subtitle: nextChallenge.description.slice(0, 120),
      href: routes.app.challenges,
      remainingTasks: 1,
    };
  }

  const pendingProject = assessments.find(
    (a) => a.kind === "project" && a.status === "not_started",
  );
  if (pendingProject) {
    return {
      kind: "project",
      title: pendingProject.name,
      subtitle: "Ready when you are",
      href: pendingProject.href,
      remainingTasks: pendingProject.totalTasks,
    };
  }

  return {
    kind: "caught_up",
    title: "You're all caught up!",
    subtitle: "You've completed all available assessments.",
    href: null,
    remainingTasks: 0,
  };
}

/** Lightweight health query used by smoke tests. */
export async function countUserAttempts(userId: string): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(challengeAttempts)
    .where(eq(challengeAttempts.userId, userId));
  return Number(row?.count ?? 0);
}
