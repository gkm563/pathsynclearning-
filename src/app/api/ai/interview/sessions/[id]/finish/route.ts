import { errorResponse, jsonResponse } from "@/lib/api/http";
import {
  abortInterviewSession,
  finishInterviewSession,
} from "@/lib/ai/interview-service";
import { requireDbUser } from "@/lib/db/users";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireDbUser();
    const { id } = await ctx.params;
    const url = new URL(request.url);
    if (url.searchParams.get("abort") === "1") {
      const session = await abortInterviewSession(user.id, id);
      return jsonResponse({ session });
    }
    const report = await finishInterviewSession(user.id, id);
    return jsonResponse({ report });
  } catch (e) {
    return errorResponse(e);
  }
}
