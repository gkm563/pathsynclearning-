import { and, desc, eq } from "drizzle-orm";
import { errorResponse, jsonResponse, parseJson } from "@/lib/api/http";
import { AppError } from "@/lib/api/errors";
import { requireDbUser } from "@/lib/db/users";
import { getDb } from "@/lib/db/client";
import { roadmapProfiles, roadmaps } from "@/lib/db/schema";
import {
  completeStudyTask,
  ensureStudyPlan,
  listStudyPlan,
  summarizePlan,
} from "@/lib/roadmap/study-plan";
import { studyTaskCompleteSchema } from "@/lib/validation/roadmap-schemas";
import type { RoadmapNode } from "@/types/roadmap";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireDbUser();
    const db = getDb();
    const [active] = await db
      .select()
      .from(roadmaps)
      .where(and(eq(roadmaps.userId, user.id), eq(roadmaps.isActive, true)))
      .orderBy(desc(roadmaps.createdAt))
      .limit(1);
    if (!active) throw AppError.notFound("Active roadmap not found");

    const [profile] = await db
      .select()
      .from(roadmapProfiles)
      .where(eq(roadmapProfiles.userId, user.id))
      .limit(1);

    const nodes = (Array.isArray(active.nodes) ? active.nodes : []) as RoadmapNode[];
    await ensureStudyPlan({
      userId: user.id,
      roadmapId: active.id,
      nodes,
      weeklyHours: profile?.weeklyHours,
    });
    const tasks = await listStudyPlan(user.id, active.id);
    return jsonResponse({ roadmapId: active.id, ...summarizePlan(tasks), tasks });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, studyTaskCompleteSchema);
    const db = getDb();
    const [active] = await db
      .select()
      .from(roadmaps)
      .where(and(eq(roadmaps.userId, user.id), eq(roadmaps.isActive, true)))
      .orderBy(desc(roadmaps.createdAt))
      .limit(1);
    if (!active) throw AppError.notFound("Active roadmap not found");

    const task = await completeStudyTask({
      userId: user.id,
      roadmapId: active.id,
      taskId: body.taskId,
    });
    if (!task) throw AppError.notFound("Study task not found");

    const tasks = await listStudyPlan(user.id, active.id);
    return jsonResponse({ task, ...summarizePlan(tasks), tasks });
  } catch (e) {
    return errorResponse(e);
  }
}
