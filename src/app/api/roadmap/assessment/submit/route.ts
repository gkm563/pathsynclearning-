import { and, desc, eq } from "drizzle-orm";
import crypto from "crypto";
import { errorResponse, jsonResponse, parseJson } from "@/lib/api/http";
import { AppError } from "@/lib/api/errors";
import { getDb } from "@/lib/db/client";
import {
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
import {
  assertDependenciesMet,
  findNodesToUnlock,
  isProgressSatisfied,
} from "@/lib/roadmap/progress";
import { assessmentSubmitSchema } from "@/lib/validation/roadmap-schemas";
import type { RoadmapEdge, RoadmapNode } from "@/types/roadmap";

const MAX_VIOLATIONS = 3;

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
    if (violations.length >= MAX_VIOLATIONS) {
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
        answers: body.answers || {},
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
