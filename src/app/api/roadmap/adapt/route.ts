import { errorResponse, jsonResponse } from "@/lib/api/http";
import { applyRoadmapAdaptation } from "@/lib/ai/roadmap-adapt";
import { requireDbUser } from "@/lib/db/users";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    const url = new URL(request.url);
    const sessionId = url.searchParams.get("sessionId") || undefined;
    const result = await applyRoadmapAdaptation(user.id, sessionId);
    return jsonResponse(result);
  } catch (e) {
    return errorResponse(e);
  }
}
