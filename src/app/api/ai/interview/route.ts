import { errorResponse, jsonResponse } from "@/lib/api/http";
import { listInterviewSessions } from "@/lib/ai/interview-service";
import { isLiveKitConfigured } from "@/lib/ai/interview-livekit";
import { getDb } from "@/lib/db/client";
import { requireDbUser } from "@/lib/db/users";
import { getActiveRoadmap } from "@/lib/roadmap/active";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireDbUser();
    const sessions = await listInterviewSessions(user.id);
    const roadmap = await getActiveRoadmap(await getDb(), user.id);
    return jsonResponse({
      sessions,
      livekitConfigured: isLiveKitConfigured(),
      defaults: {
        targetRole: roadmap?.targetRole || "",
        targetCompany: roadmap?.targetCompany || "",
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
