import { and, desc, eq } from "drizzle-orm";
import crypto from "crypto";
import { errorResponse, jsonResponse, parseJson } from "@/lib/api/http";
import { AppError } from "@/lib/api/errors";
import { getDb } from "@/lib/db/client";
import {
  projectRuns,
  roadmapAssessmentAttempts,
  roadmapProgress,
  roadmaps,
} from "@/lib/db/schema";
import { requireDbUser } from "@/lib/db/users";
import {
  allAssessmentsPassed,
  ASSESSMENT_ID_KEY,
  buildMcqAnswerReview,
  getNodeAssessments,
  gradeMcq,
  isAssessableNode,
  passedAssessmentIds,
  resolveNodeAssessment,
} from "@/lib/roadmap/assessment";
import { gradeCoding } from "@/lib/roadmap/coding-judge";
import { gradeProject } from "@/lib/projects/grader";
import {
  getOrCreateProjectRun,
  saveProjectProgress,
} from "@/lib/projects/service";
import {
  assertDependenciesMet,
  findNodesToUnlock,
  isProgressSatisfied,
} from "@/lib/roadmap/progress";
import { assessmentSubmitSchema } from "@/lib/validation/roadmap-schemas";
import type { RoadmapEdge, RoadmapNode } from "@/types/roadmap";
import type { ProjectAssessmentSpec } from "@/lib/projects/types";
import { buildProjectSpecForNode } from "@/lib/projects/specs";
import {
  recordLearningMemory,
  recordProjectMemory,
} from "@/lib/memory/processor";
import { promotePendingInterviewIfReady } from "@/lib/roadmap/certification";
import { recomputeCriSafe } from "@/lib/cri/persist";
import {
  isProctoringEnabled,
  MAX_PROCTOR_VIOLATIONS,
} from "@/lib/proctoring";
import { ensureNodeAssessments } from "@/lib/roadmap/assessment-bank";

const MAX_VIOLATIONS = MAX_PROCTOR_VIOLATIONS;
const PROCTORING_ENABLED = isProctoringEnabled();

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    const db = getDb();
    const body = await parseJson(request, assessmentSubmitSchema);

    const [activeRoadmap] = await db
      .select()
      .from(roadmaps)
      .where(and(eq(roadmaps.userId, user.id), eq(roadmaps.isActive, true)))
      .orderBy(desc(roadmaps.createdAt))
      .limit(1);

    if (!activeRoadmap) throw AppError.notFound("Active roadmap not found");

    const rawNodes = (Array.isArray(activeRoadmap.nodes)
      ? activeRoadmap.nodes
      : []) as RoadmapNode[];
    const nodes = ensureNodeAssessments(rawNodes);
    if (JSON.stringify(rawNodes) !== JSON.stringify(nodes)) {
      await db
        .update(roadmaps)
        .set({ nodes })
        .where(eq(roadmaps.id, activeRoadmap.id));
    }
    const edges = (Array.isArray(activeRoadmap.edges)
      ? activeRoadmap.edges
      : []) as RoadmapEdge[];

    const node = nodes.find((n) => n.id === body.nodeId);
    if (!node || !isAssessableNode(node)) {
      throw AppError.badRequest("Node assessment not found");
    }
    const assessments = getNodeAssessments(node);
    const assessment = resolveNodeAssessment(node, body.assessmentId);
    if (!assessment) {
      throw AppError.badRequest(
        assessments.length > 1
          ? "assessmentId is required when this node has multiple assessments"
          : "Node assessment not found",
      );
    }
    if (assessment.type !== body.type) {
      throw AppError.badRequest("Assessment type mismatch");
    }
    const assessmentId = assessment.id || `${body.nodeId}-${assessment.type}-0`;

    const violations = body.violations || [];
    if (PROCTORING_ENABLED && violations.length >= MAX_VIOLATIONS) {
      const [attempt] = await db
        .insert(roadmapAssessmentAttempts)
        .values({
          id: crypto.randomUUID(),
          userId: user.id,
          roadmapId: activeRoadmap.id,
          nodeId: body.nodeId,
          type: body.type,
          passed: false,
          score: 0,
          violations,
          answers: { ...(body.answers || {}), [ASSESSMENT_ID_KEY]: assessmentId },
          code: body.code || null,
          durationMs: body.durationMs ?? null,
        })
        .returning();

      await recomputeCriSafe(user.id, "assessment");

      return jsonResponse({
        passed: false,
        score: 0,
        reason: "proctoring_failed",
        message: "Assessment failed due to too many proctoring violations. Study again and retry.",
        attempt,
      });
    }

    const allProgress = await db
      .select()
      .from(roadmapProgress)
      .where(eq(roadmapProgress.roadmapId, activeRoadmap.id));
    const progressMap = new Map(allProgress.map((p) => [p.nodeId, p]));

    try {
      assertDependenciesMet(body.nodeId, edges, progressMap);
    } catch (err) {
      throw AppError.badRequest(
        err instanceof Error ? err.message : "Incomplete dependencies",
      );
    }

    let score = 0;
    let passed = false;
    let details: unknown = null;
    let answerReview: unknown = null;

    if (body.type === "mcq") {
      const graded = gradeMcq(assessment, body.answers || {});
      score = graded.score;
      passed = graded.passed;
      details = { correct: graded.correct, total: graded.total };
      if (passed) {
        answerReview = {
          type: "mcq",
          questions: buildMcqAnswerReview(assessment, body.answers || {}),
        };
      }
    } else if (body.type === "project") {
      const projectPart = assessment.project;
      const spec: ProjectAssessmentSpec = projectPart
        ? {
            type: "project",
            passScore: assessment.passScore,
            timeLimitMinutes: assessment.timeLimitMinutes,
            overview: projectPart.overview,
            steps: projectPart.steps,
            rubric: projectPart.rubric,
          }
        : buildProjectSpecForNode(node);

      const refId = `${activeRoadmap.id}:${body.nodeId}`;
      const run = await getOrCreateProjectRun({
        userId: user.id,
        source: "roadmap",
        refId,
      });

      await saveProjectProgress({
        runId: run.id,
        stepsDone: body.stepsDone || [],
        evidence: body.evidence,
        repoUrl: body.repoUrl,
        reflection: body.reflection,
      });

      const graded = await gradeProject(spec, {
        stepsDone: body.stepsDone || [],
        evidence: body.evidence || [],
        repoUrl: body.repoUrl,
        reflection: body.reflection,
      });
      score = graded.score;
      passed = graded.passed;
      details = {
        checklistPct: graded.checklistPct,
        breakdown: graded.breakdown,
      };

      const now = new Date();
      await db
        .update(projectRuns)
        .set({
          status: passed ? "passed" : "failed",
          score,
          checklistPct: graded.checklistPct,
          rubricBreakdown: graded.breakdown,
          repoUrl: body.repoUrl || null,
          reflection: body.reflection || null,
          submittedAt: now,
          passedAt: passed ? now : null,
          updatedAt: now,
        })
        .where(eq(projectRuns.id, run.id));

      if (passed) {
        answerReview = {
          type: "project",
          overview: spec.overview,
          breakdown: graded.breakdown,
        };
      }
    } else {
      const language = (body.language || "javascript") as
        | "javascript"
        | "python"
        | "java"
        | "c"
        | "cpp";
      const graded = await gradeCoding(
        assessment,
        body.code || "",
        language,
      );
      score = graded.score;
      passed = graded.passed;
      details = {
        language,
        passedCount: graded.passedCount,
        total: graded.total,
        results: graded.results.map((r) => ({
          index: r.index,
          ok: r.ok,
          error: r.error,
          args: r.args,
          expected: r.expected,
          actual: r.actual,
        })),
      };
      if (passed && assessment.coding) {
        const coding = assessment.coding;
        answerReview = {
          type: "coding",
          functionName: coding.functionName,
          examples: coding.examples,
          publicTests: coding.publicTests,
          hiddenTests: coding.hiddenTests || [],
        };
      }
    }

    const [attempt] = await db
      .insert(roadmapAssessmentAttempts)
      .values({
        id: crypto.randomUUID(),
        userId: user.id,
        roadmapId: activeRoadmap.id,
        nodeId: body.nodeId,
        type: body.type,
        passed,
        score,
        violations,
        answers: {
          ...(body.type === "project"
            ? {
                stepsDone: body.stepsDone || [],
                evidence: body.evidence || [],
                repoUrl: body.repoUrl,
                reflection: body.reflection,
                ...(details && typeof details === "object" ? details : {}),
              }
            : body.answers || {}),
          [ASSESSMENT_ID_KEY]: assessmentId,
        },
        code: body.code || null,
        durationMs: body.durationMs ?? null,
      })
      .returning();

    if (!passed) {
      const current = progressMap.get(body.nodeId);
      if (current && current.status === "available") {
        await db
          .update(roadmapProgress)
          .set({ status: "in_progress", updatedAt: new Date() })
          .where(eq(roadmapProgress.id, current.id));
      }
      await recomputeCriSafe(user.id, "assessment");
      return jsonResponse({
        passed: false,
        score,
        details,
        assessmentId,
        nodeComplete: false,
        message: "Assessment not passed. Review resources and try again.",
        attempt,
      });
    }

    const priorAttempts = await db
      .select({
        passed: roadmapAssessmentAttempts.passed,
        answers: roadmapAssessmentAttempts.answers,
      })
      .from(roadmapAssessmentAttempts)
      .where(
        and(
          eq(roadmapAssessmentAttempts.userId, user.id),
          eq(roadmapAssessmentAttempts.roadmapId, activeRoadmap.id),
          eq(roadmapAssessmentAttempts.nodeId, body.nodeId),
        ),
      );

    const nodeComplete = allAssessmentsPassed(priorAttempts, assessments);
    const remaining = assessments.filter(
      (a) => a.id && !passedAssessmentIds(priorAttempts, assessments).has(a.id),
    ).length;

    if (!nodeComplete) {
      const current = progressMap.get(body.nodeId);
      if (current && current.status === "available") {
        await db
          .update(roadmapProgress)
          .set({ status: "in_progress", updatedAt: new Date() })
          .where(eq(roadmapProgress.id, current.id));
      }
      await recomputeCriSafe(user.id, "assessment");
      return jsonResponse({
        passed: true,
        score,
        details,
        answerReview,
        assessmentId,
        nodeComplete: false,
        remaining,
        message:
          remaining > 0
            ? `Passed this part. ${remaining} assessment${remaining === 1 ? "" : "s"} left on this node.`
            : "Passed this part. Continue with the remaining assessments.",
        attempt,
      });
    }

    // Mark completed + unlock dependents
    const current = progressMap.get(body.nodeId);
    let updatedProgress;
    if (current) {
      [updatedProgress] = await db
        .update(roadmapProgress)
        .set({
          status: "completed",
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(roadmapProgress.id, current.id))
        .returning();
    } else {
      [updatedProgress] = await db
        .insert(roadmapProgress)
        .values({
          id: crypto.randomUUID(),
          userId: user.id,
          roadmapId: activeRoadmap.id,
          nodeId: body.nodeId,
          status: "completed",
          completedAt: new Date(),
        })
        .returning();
    }
    progressMap.set(body.nodeId, updatedProgress);

    const unlockedNodeIds: string[] = [];
    if (isProgressSatisfied("completed")) {
      const toUnlock = findNodesToUnlock(body.nodeId, edges, progressMap);
      for (const unlockId of toUnlock) {
        unlockedNodeIds.push(unlockId);
        const currentP = progressMap.get(unlockId);
        if (currentP) {
          const [unlocked] = await db
            .update(roadmapProgress)
            .set({ status: "available", updatedAt: new Date() })
            .where(eq(roadmapProgress.id, currentP.id))
            .returning();
          progressMap.set(unlockId, unlocked);
        } else {
          const [unlocked] = await db
            .insert(roadmapProgress)
            .values({
              id: crypto.randomUUID(),
              userId: user.id,
              roadmapId: activeRoadmap.id,
              nodeId: unlockId,
              status: "available",
            })
            .returning();
          progressMap.set(unlockId, unlocked);
        }
      }
    }

    await recordLearningMemory({
      userId: user.id,
      nodeId: body.nodeId,
      roadmapId: activeRoadmap.id,
      title: node.title || body.nodeId,
      description: node.description?.slice(0, 280) || undefined,
      score,
      assessmentType: body.type,
    }).catch(() => null);

    if (body.type === "project") {
      await recordProjectMemory({
        userId: user.id,
        projectId: body.nodeId,
        title: node.title || body.nodeId,
        description: node.description?.slice(0, 280) || undefined,
        score,
        repoUrl: body.repoUrl,
      }).catch(() => null);
    }

    await promotePendingInterviewIfReady({
      roadmapId: activeRoadmap.id,
      nodes,
      progressByNodeId: new Map(
        Array.from(progressMap.entries()).map(([id, row]) => [id, row.status]),
      ),
      certifiedAt: activeRoadmap.certifiedAt,
      certificationStatus: activeRoadmap.certificationStatus,
    });

    await recomputeCriSafe(user.id, "assessment");

    return jsonResponse({
      passed: true,
      score,
      details,
      answerReview,
      assessmentId,
      nodeComplete: true,
      remaining: 0,
      unlockedNodeIds,
      message: unlockedNodeIds.length
        ? "All assessments passed. Starting next learning…"
        : "All assessments passed. Take the final interview to certify this path.",
      attempt,
      allProgress: Array.from(progressMap.values()),
    });
  } catch (e) {
    return errorResponse(e);
  }
}
