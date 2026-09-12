import { errorResponse, jsonResponse } from "@/lib/api/http";
import { listInterviewSessions } from "@/lib/ai/interview-service";
import { isLiveKitConfigured } from "@/lib/ai/interview-livekit";
import { requireDbUser } from "@/lib/db/users";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireDbUser();
    const sessions = await listInterviewSessions(user.id);
    return jsonResponse({
      sessions,
      livekitConfigured: isLiveKitConfigured(),
    });
  } catch (e) {
    return errorResponse(e);
  }
}
