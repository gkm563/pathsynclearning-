import { errorResponse, jsonResponse, parseJson } from "@/lib/api/http";
import { saveInterviewCode } from "@/lib/ai/interview-service";
import { requireDbUser } from "@/lib/db/users";
import { interviewCodeSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireDbUser();
    const { id } = await ctx.params;
    const body = await parseJson(request, interviewCodeSchema);
    await saveInterviewCode(user.id, id, body.code);
    return jsonResponse({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
