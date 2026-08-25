import { and, desc, eq } from "drizzle-orm";
import { errorResponse, jsonResponse, parseJson } from "@/lib/api/http";
import { AppError } from "@/lib/api/errors";
import { getDb } from "@/lib/db/client";
import { roadmaps } from "@/lib/db/schema";
import { requireDbUser } from "@/lib/db/users";
import { isAssessableNode } from "@/lib/roadmap/assessment";
import { gradeCodingMulti } from "@/lib/roadmap/code-runner";
import { runPublicTestsInBrowser } from "@/lib/roadmap/coding-client";
import type { CodingLanguageId } from "@/lib/roadmap/coding-languages";
import type { RoadmapNode } from "@/types/roadmap";
import { z } from "zod";

const bodySchema = z.object({
  nodeId: z.string().min(1),
  code: z.string().max(50000),
  language: z.enum(["javascript", "python", "java", "c", "cpp"]),
});

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    const db = getDb();
    const body = await parseJson(request, bodySchema);

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
    const node = nodes.find((n) => n.id === body.nodeId);
    if (!node?.assessment || !isAssessableNode(node) || node.assessment.type !== "coding") {
      throw AppError.badRequest("Coding assessment not found");
    }

    const coding = node.assessment.coding!;
    const language = body.language as CodingLanguageId;
    const publicTests = coding.publicTests || [];

    // Fast path: JS can run in-process
    if (language === "javascript") {
      const graded = runPublicTestsInBrowser(
        body.code,
        coding.functionName,
        publicTests,
      );
      return jsonResponse({
        ...graded,
        language,
        scope: "public",
      });
    }

    const graded = await gradeCodingMulti(
      language,
      body.code,
      coding.functionName,
      publicTests,
      node.assessment.passScore ?? 100,
    );

    return jsonResponse({
      ...graded,
      language,
      scope: "public",
    });
  } catch (e) {
    return errorResponse(e);
  }
}
