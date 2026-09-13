import { errorResponse, jsonResponse, parseJson } from "@/lib/api/http";
import { assertInterviewStartLimit } from "@/lib/ai/interview-rate-limit";
import { createInterviewSession } from "@/lib/ai/interview-service";
import { requireDbUser } from "@/lib/db/users";
import { interviewCreateSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    assertInterviewStartLimit(user.id);
    const body = await parseJson(request, interviewCreateSchema);
    const session = await createInterviewSession({
      userId: user.id,
      studentName: user.full_name || "Candidate",
      track: body.track,
      mode: body.mode,
      targetRole: body.targetRole,
      targetCompany: body.targetCompany,
      durationMinutes: body.durationMinutes,
      difficulty: body.difficulty,
      style: body.style,
      focus: body.focus,
      purpose: body.purpose,
      roadmapId: body.roadmapId,
    });
    return jsonResponse({ session }, 201);
  } catch (e) {
    return errorResponse(e);
  }
}
