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
  buildMcqAnswerReview,
  gradeMcq,
  isAssessableNode,
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

const MAX_VIOLATIONS = 3;
const PROCTORING_ENABLED =
  process.env.NEXT_PUBLIC_ASSESSMENT_PROCTORING === "true" ||
  process.env.ASSESSMENT_PROCTORING === "true";

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

    const nodes = (Array.isArray(activeRoadmap.nodes)
      ? activeRoadmap.nodes
      : []) as RoadmapNode[];
    const edges = (Array.isArray(activeRoadmap.edges)
      ? activeRoadmap.edges
      : []) as RoadmapEdge[];

    const node = nodes.find((n) => n.id === body.nodeId);
    if (!node?.assessment || !isAssessableNode(node)) {
      throw AppError.badRequest("Node assessment not found");
    }
    if (node.assessment.type !== body.type) {
      throw AppError.badRequest("Assessment type mismatch");
    }

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
          answers: body.answers || {},
          code: body.code || null,
        })
        .returning();

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
      const graded = gradeMcq(node.assessment, body.answers || {});
      score = graded.score;
      passed = graded.passed;
      details = { correct: graded.correct, total: graded.total };
      if (passed) {
        answerReview = {
          type: "mcq",
          questions: buildMcqAnswerReview(node.assessment, body.answers || {}),
        };
      }
    } else if (body.type === "project") {
      const projectPart = node.assessment.project;
      const spec: ProjectAssessmentSpec = projectPart
        ? {
            type: "project",
            passScore: node.assessment.passScore,
            timeLimitMinutes: node.assessment.timeLimitMinutes,
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
        node.assessment,
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
      if (passed && node.assessment.coding) {
        const coding = node.assessment.coding;
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
        answers:
          body.type === "project"
            ? {
                stepsDone: body.stepsDone || [],
                evidence: body.evidence || [],
                repoUrl: body.repoUrl,
                reflection: body.reflection,
                ...(details && typeof details === "object" ? details : {}),
              }
            : body.answers || {},
        code: body.code || null,
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
      return jsonResponse({
        passed: false,
        score,
        details,
        message: "Assessment not passed. Review resources and try again.",
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

    return jsonResponse({
      passed: true,
      score,
      details,
      answerReview,
      unlockedNodeIds,
      message: unlockedNodeIds.length
        ? "Assessment passed. Starting next learning…"
        : "Assessment passed. Roadmap complete for this path.",
      attempt,
      allProgress: Array.from(progressMap.values()),
    });
  } catch (e) {
    return errorResponse(e);
  }
}
