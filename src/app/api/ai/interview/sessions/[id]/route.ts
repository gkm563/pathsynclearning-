import { errorResponse, jsonResponse } from "@/lib/api/http";
import { getInterviewSession } from "@/lib/ai/interview-service";
import { requireDbUser } from "@/lib/db/users";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireDbUser();
    const { id } = await ctx.params;
    const session = await getInterviewSession(user.id, id);
    return jsonResponse({ session });
  } catch (e) {
    return errorResponse(e);
  }
}
