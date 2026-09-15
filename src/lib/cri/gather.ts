import "server-only";

import { and, eq } from "drizzle-orm";
import { getChallengeById } from "@/lib/challenges/catalog";
import { getDb } from "@/lib/db/client";
import {
  challengeAttempts,
  interviewReports,
  interviewSessions,
  problems,
  profiles,
  projectRuns,
  roadmapAssessmentAttempts,
  roadmapProfiles,
  roadmapProgress,
  roadmaps,
  users,
} from "@/lib/db/schema";
import { getActiveRoadmap } from "@/lib/roadmap/active";
import {
  allTrackableNodesSatisfied,
  computeRoadmapStats,
} from "@/lib/roadmap/stats";
import type { RoadmapNode } from "@/types/roadmap";
import type { CriFacts } from "@/lib/cri/types";

function asNodes(raw: unknown): RoadmapNode[] {
  return Array.isArray(raw) ? (raw as RoadmapNode[]) : [];
}

function filled(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function ms(value: Date | string | null | undefined): number {
  if (!value) return 0;
  const t = value instanceof Date ? value.getTime() : new Date(value).getTime();
  return Number.isFinite(t) ? t : 0;
}

function integrityCount(raw: unknown): number {
  return Array.isArray(raw) ? raw.length : 0;
}

export async function gatherCriFacts(userId: string): Promise<CriFacts> {
  const db = getDb();
  const [
    [userRow],
    [profile],
    [roadmapProf],
    attemptRows,
    projectRows,
    interviewRows,
  ] = await Promise.all([
    db
      .select({ fullName: users.fullName })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1),
    db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1),
    db
      .select({
        targetRole: roadmapProfiles.targetRole,
        careerGoal: roadmapProfiles.careerGoal,
      })
      .from(roadmapProfiles)
      .where(eq(roadmapProfiles.userId, userId))
      .limit(1),
    db
      .select({
        id: challengeAttempts.id,
        questionId: challengeAttempts.questionId,
        problemId: challengeAttempts.problemId,
        challengeType: challengeAttempts.challengeType,
        passed: challengeAttempts.passed,
        score: challengeAttempts.score,
        durationMs: challengeAttempts.durationMs,
        createdAt: challengeAttempts.createdAt,
        problemDifficulty: problems.difficulty,
        problemKind: problems.kind,
        careerTags: problems.careerTags,
        topics: problems.topics,
        estMinutes: problems.estMinutes,
      })
      .from(challengeAttempts)
      .leftJoin(problems, eq(problems.id, challengeAttempts.problemId))
      .where(eq(challengeAttempts.userId, userId)),
    db.select().from(projectRuns).where(eq(projectRuns.userId, userId)),
    db
      .select({
        reportId: interviewReports.id,
        overall: interviewReports.overall,
        scores: interviewReports.scores,
        targetRole: interviewSessions.targetRole,
        integrity: interviewSessions.integrity,
        endedAt: interviewSessions.endedAt,
        startedAt: interviewSessions.startedAt,
      })
      .from(interviewReports)
      .innerJoin(
        interviewSessions,
        eq(interviewSessions.id, interviewReports.sessionId),
      )
      .where(eq(interviewSessions.userId, userId)),
  ]);

  const targetRole = roadmapProf?.targetRole || roadmapProf?.careerGoal || null;
  const active = await getActiveRoadmap(db, userId);

  const dsa: CriFacts["dsa"] = [];
  const knowledge: CriFacts["knowledge"] = [];
  const activityAtMs: number[] = [];
  const rollingAccuracy: CriFacts["consistency"]["rollingAccuracy"] = [];

  for (const row of attemptRows) {
    const catalog = getChallengeById(row.questionId);
    const kind = (row.problemKind || catalog?.type || row.challengeType || "").toLowerCase();
    const difficulty = row.problemDifficulty || catalog?.difficulty || "easy";
    const careerTags = (row.careerTags?.length ? row.careerTags : catalog?.careerTags) || [];
    const topics = (row.topics?.length ? row.topics : catalog?.topics) || [];
    const estMinutes = row.estMinutes ?? catalog?.estMinutes ?? null;
    const createdAtMs = ms(row.createdAt);
    activityAtMs.push(createdAtMs);
    rollingAccuracy.push({ atMs: createdAtMs, score: row.score });

    const base = {
      id: row.id,
      passed: row.passed,
      score: row.score,
      difficulty,
      careerTags,
      durationMs: row.durationMs,
      createdAtMs,
    };

    if (kind === "coding" || kind === "dsa") {
      dsa.push({
        ...base,
        problemKey: row.problemId || row.questionId,
        topics,
        estMinutes,
      });
    } else if (kind === "mcq" || kind === "system_design") {
      knowledge.push({
        ...base,
        itemKey: row.problemId || row.questionId,
      });
    }
  }

  let roadmap: CriFacts["roadmap"] = null;
  if (active) {
    const nodes = asNodes(active.nodes);
    const progressRows = await db
      .select({
        nodeId: roadmapProgress.nodeId,
        status: roadmapProgress.status,
      })
      .from(roadmapProgress)
      .where(
        and(
          eq(roadmapProgress.userId, userId),
          eq(roadmapProgress.roadmapId, active.id),
        ),
      );
    const progressByNodeId = new Map(progressRows.map((p) => [p.nodeId, p.status]));
    const stats = computeRoadmapStats(nodes, progressByNodeId);
    const assessmentRows = await db
      .select({
        id: roadmapAssessmentAttempts.id,
        nodeId: roadmapAssessmentAttempts.nodeId,
        type: roadmapAssessmentAttempts.type,
        passed: roadmapAssessmentAttempts.passed,
        score: roadmapAssessmentAttempts.score,
        durationMs: roadmapAssessmentAttempts.durationMs,
        createdAt: roadmapAssessmentAttempts.createdAt,
      })
      .from(roadmapAssessmentAttempts)
      .where(
        and(
          eq(roadmapAssessmentAttempts.userId, userId),
          eq(roadmapAssessmentAttempts.roadmapId, active.id),
        ),
      );

    const passedAssessmentScores: number[] = [];
    for (const row of assessmentRows) {
      const createdAtMs = ms(row.createdAt);
      activityAtMs.push(createdAtMs);
      rollingAccuracy.push({ atMs: createdAtMs, score: row.score });
      const node = nodes.find((n) => n.id === row.nodeId);
      const tags = [...(node?.skills || []), ...(node?.topics || [])];
      if (row.passed) passedAssessmentScores.push(row.score);
      if (row.type === "mcq") {
        knowledge.push({
          id: row.id,
          itemKey: `${active.id}:${row.nodeId}:mcq`,
          passed: row.passed,
          score: row.score,
          difficulty: node?.priority === "critical" ? "hard" : "medium",
          careerTags: tags,
          createdAtMs,
        });
      } else if (row.type === "coding") {
        dsa.push({
          id: row.id,
          problemKey: `${active.id}:${row.nodeId}:coding`,
          passed: row.passed,
          score: row.score,
          difficulty: node?.priority === "critical" ? "hard" : "medium",
          careerTags: tags,
          topics: node?.topics || [],
          durationMs: row.durationMs,
          estMinutes: node?.estimatedHours ? node.estimatedHours * 60 : 30,
          createdAtMs,
        });
      }
    }

    roadmap = {
      targetRole: active.targetRole || targetRole,
      trackable: stats.totalNodes,
      completed: stats.completedNodes,
      prerequisitesMet: allTrackableNodesSatisfied(nodes, progressByNodeId),
      passedAssessmentScores,
    };
  }

  const projects: CriFacts["projects"] = projectRows.map((row) => {
    const catalog = getChallengeById(row.refId);
    const specHours = catalog?.project?.overview?.estimatedHours;
    const hours =
      specHours && specHours > 0
        ? specHours
        : catalog?.estMinutes
          ? Math.max(1, Math.round(catalog.estMinutes / 60))
          : 8;
    if (row.submittedAt) activityAtMs.push(ms(row.submittedAt));
    return {
      id: row.id,
      score: row.score,
      checklistPct: row.checklistPct,
      hasRepo: Boolean(row.repoUrl?.trim()),
      hasReflection: Boolean(row.reflection?.trim()),
      estimatedHours: hours,
      passed: row.status === "passed" || Boolean(row.passedAt),
    };
  });

  const interviews: CriFacts["interviews"] = interviewRows.map((row) => {
    const scores = (row.scores || {}) as Record<string, number>;
    const ended = ms(row.endedAt) || ms(row.startedAt);
    if (ended) activityAtMs.push(ended);
    return {
      id: row.reportId,
      targetRole: row.targetRole,
      overall: row.overall,
      communication: Number(scores.communication) || 0,
      problemSolving: Number(scores.problemSolving) || 0,
      codeQuality: Number(scores.codeQuality) || 0,
      depth: Number(scores.depth) || 0,
      integrityCount: integrityCount(row.integrity),
      endedAtMs: ended,
    };
  });

  const skills = Array.isArray(profile?.skills) ? profile.skills : [];
  const projectsJson = Array.isArray(profile?.projects) ? profile.projects : [];

  return {
    targetRole,
    dsa,
    knowledge,
    projects,
    interviews,
    roadmap,
    consistency: {
      streak: profile?.streak ?? 0,
      activityAtMs,
      rollingAccuracy,
    },
    profile: {
      fullName: filled(userRow?.fullName),
      username: filled(profile?.username),
      bio: filled(profile?.bio),
      institute: filled(profile?.institute),
      degree: filled(profile?.degree),
      github: filled(profile?.github),
      linkedin: filled(profile?.linkedin),
      skills: skills.length >= 3,
      projects: projectsJson.length >= 1 || projectRows.length >= 1,
      additionalCompleted: profile?.additionalCompleted === true,
    },
  };
}
