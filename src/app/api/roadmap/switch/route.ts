import { requireDbUser } from "@/lib/db/users";
import { getDb } from "@/lib/db/client";
import { errorResponse, jsonResponse } from "@/lib/api/http";
import { AppError } from "@/lib/api/errors";
import { setActiveRoadmap } from "@/lib/roadmap/active";

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    const body = (await request.json().catch(() => ({}))) as {
      roadmapId?: string;
    };

    if (!body.roadmapId || typeof body.roadmapId !== "string") {
      throw new AppError("BAD_REQUEST", "roadmapId is required.");
    }

    const db = await getDb();
    const roadmap = await setActiveRoadmap(db, user.id, body.roadmapId);

    return jsonResponse({ roadmap });
  } catch (e) {
    return errorResponse(e);
  }
}
