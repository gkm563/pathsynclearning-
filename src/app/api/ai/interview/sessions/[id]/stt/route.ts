import { errorResponse, jsonResponse, parseJson } from "@/lib/api/http";
import { AppError } from "@/lib/api/errors";
import { assertInterviewTurnLimit } from "@/lib/ai/interview-rate-limit";
import { studentInterviewTurn } from "@/lib/ai/interview-service";
import { requireDbUser } from "@/lib/db/users";
import { interviewBrowserTranscriptSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireDbUser();
    assertInterviewTurnLimit(user.id);
    const { id } = await ctx.params;
    const body = await parseJson(request, interviewBrowserTranscriptSchema);
    const transcript = body.transcript;
    if (!transcript) throw AppError.badRequest("Could not hear that — try again.");
    const result = await studentInterviewTurn({
      userId: user.id,
      sessionId: id,
      message: transcript,
      source: "voice",
    });
    return jsonResponse({ ...result, transcript });
  } catch (e) {
    return errorResponse(e);
  }
}
