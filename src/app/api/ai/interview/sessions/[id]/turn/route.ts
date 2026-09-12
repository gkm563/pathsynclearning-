import { errorResponse, jsonResponse, parseJson } from "@/lib/api/http";
import { assertInterviewTurnLimit } from "@/lib/ai/interview-rate-limit";
import { studentInterviewTurn } from "@/lib/ai/interview-service";
import { requireDbUser } from "@/lib/db/users";
import { interviewTurnSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireDbUser();
    assertInterviewTurnLimit(user.id);
    const { id } = await ctx.params;
    const body = await parseJson(request, interviewTurnSchema);
    const result = await studentInterviewTurn({
      userId: user.id,
      sessionId: id,
      message: body.message,
      source: body.source,
    });
    return jsonResponse(result);
  } catch (e) {
    return errorResponse(e);
  }
}
