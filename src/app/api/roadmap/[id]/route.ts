import { requireDbUser } from "@/lib/db/users";
import { getDb } from "@/lib/db/client";
import { roadmaps } from "@/lib/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { errorResponse, jsonResponse } from "@/lib/api/http";
import { AppError } from "@/lib/api/errors";
import { setActiveRoadmap } from "@/lib/roadmap/active";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const user = await requireDbUser();
    const { id } = await ctx.params;
    const body = (await request.json().catch(() => ({}))) as { title?: string };

    if (!body.title || typeof body.title !== "string" || !body.title.trim()) {
      throw new AppError("BAD_REQUEST", "title is required.");
    }

    const db = await getDb();
    const [updated] = await db
      .update(roadmaps)
      .set({ title: body.title.trim().slice(0, 120) })
      .where(and(eq(roadmaps.id, id), eq(roadmaps.userId, user.id)))
      .returning({
        id: roadmaps.id,
        title: roadmaps.title,
        isActive: roadmaps.isActive,
      });

    if (!updated) {
      throw new AppError("NOT_FOUND", "Roadmap not found.");
    }

    return jsonResponse({ roadmap: updated });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  try {
    const user = await requireDbUser();
    const { id } = await ctx.params;
    const db = await getDb();

    const [owned] = await db
      .select()
      .from(roadmaps)
      .where(and(eq(roadmaps.id, id), eq(roadmaps.userId, user.id)))
      .limit(1);

    if (!owned) {
      throw new AppError("NOT_FOUND", "Roadmap not found.");
    }

    const wasActive = owned.isActive;

    await db
      .delete(roadmaps)
      .where(and(eq(roadmaps.id, id), eq(roadmaps.userId, user.id)));

    let activeId: string | null = null;
    if (wasActive) {
      const [next] = await db
        .select({ id: roadmaps.id })
        .from(roadmaps)
        .where(eq(roadmaps.userId, user.id))
        .orderBy(desc(roadmaps.createdAt))
        .limit(1);

      if (next) {
        await setActiveRoadmap(db, user.id, next.id);
        activeId = next.id;
      }
    } else {
      const [active] = await db
        .select({ id: roadmaps.id })
        .from(roadmaps)
        .where(and(eq(roadmaps.userId, user.id), eq(roadmaps.isActive, true)))
        .limit(1);
      activeId = active?.id ?? null;
    }

    return jsonResponse({ success: true, activeRoadmapId: activeId });
  } catch (e) {
    return errorResponse(e);
  }
}
