import { errorResponse, jsonResponse } from "@/lib/api/http";
import { getInterviewSession } from "@/lib/ai/interview-service";
import { issueInterviewToken, isLiveKitConfigured } from "@/lib/ai/interview-livekit";
import { requireDbUser } from "@/lib/db/users";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireDbUser();
    const { id } = await ctx.params;
    const session = await getInterviewSession(user.id, id);
    if (!isLiveKitConfigured() || !session.livekitRoom) {
      return jsonResponse({ token: null, url: null, configured: false });
    }
    const token = await issueInterviewToken({
      identity: user.id,
      name: user.full_name || "Student",
      roomName: session.livekitRoom,
    });
    return jsonResponse({
      token,
      url: session.livekitUrl,
      configured: true,
      room: session.livekitRoom,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
