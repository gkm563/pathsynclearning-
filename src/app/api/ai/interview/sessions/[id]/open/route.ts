import { errorResponse, jsonResponse } from "@/lib/api/http";
import { beginInterviewOpening } from "@/lib/ai/interview-service";
import { requireDbUser } from "@/lib/db/users";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireDbUser();
    const { id } = await ctx.params;
    const session = await beginInterviewOpening(user.id, id);
    const opening = session.turns.find((turn) => turn.role === "interviewer");
    return jsonResponse({ session, reply: opening?.content ?? "" });
  } catch (e) {
    return errorResponse(e);
  }
}
