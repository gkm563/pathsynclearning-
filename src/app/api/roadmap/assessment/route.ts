import { and, desc, eq } from "drizzle-orm";
import { errorResponse, jsonResponse } from "@/lib/api/http";
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
  isAssessableNode,
  stripAssessmentSecrets,
} from "@/lib/roadmap/assessment";
import type { RoadmapNode } from "@/types/roadmap";

export async function GET(request: Request) {
  try {
    const user = await requireDbUser();
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const nodeId = searchParams.get("nodeId");
    if (!nodeId) throw AppError.badRequest("nodeId is required");

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
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) throw AppError.notFound("Node not found");
    if (!node.assessment || !isAssessableNode(node)) {
      throw AppError.badRequest("This node has no assessment");
    }

    const attempts = await db
      .select({
        id: roadmapAssessmentAttempts.id,
        passed: roadmapAssessmentAttempts.passed,
        score: roadmapAssessmentAttempts.score,
        type: roadmapAssessmentAttempts.type,
        answers: roadmapAssessmentAttempts.answers,
        createdAt: roadmapAssessmentAttempts.createdAt,
      })
      .from(roadmapAssessmentAttempts)
      .where(
        and(
          eq(roadmapAssessmentAttempts.userId, user.id),
          eq(roadmapAssessmentAttempts.roadmapId, activeRoadmap.id),
          eq(roadmapAssessmentAttempts.nodeId, nodeId),
        ),
      )
      .orderBy(desc(roadmapAssessmentAttempts.createdAt))
      .limit(10);

    const [progress] = await db
      .select()
      .from(roadmapProgress)
      .where(
        and(
          eq(roadmapProgress.userId, user.id),
          eq(roadmapProgress.roadmapId, activeRoadmap.id),
          eq(roadmapProgress.nodeId, nodeId),
        ),
      )
      .limit(1);

    const hasPassed = attempts.some((a) => a.passed);
    const passedAttempt = attempts.find((a) => a.passed);
    let answerReview: unknown = null;
    if (hasPassed && node.assessment.type === "mcq") {
      const answers =
        passedAttempt?.answers &&
        typeof passedAttempt.answers === "object" &&
        !Array.isArray(passedAttempt.answers)
          ? (passedAttempt.answers as Record<string, number>)
          : {};
      answerReview = {
        type: "mcq",
        questions: buildMcqAnswerReview(node.assessment, answers),
      };
    } else if (hasPassed && node.assessment.type === "coding" && node.assessment.coding) {
      const coding = node.assessment.coding;
      answerReview = {
        type: "coding",
        functionName: coding.functionName,
        examples: coding.examples,
        publicTests: coding.publicTests,
        hiddenTests: coding.hiddenTests || [],
      };
    }

    return jsonResponse({
      nodeId,
      title: node.title,
      status: progress?.status || node.status,
      assessment: stripAssessmentSecrets(node.assessment),
      attempts: attempts.map(({ answers: _a, ...rest }) => rest),
      hasPassed,
      answerReview,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
