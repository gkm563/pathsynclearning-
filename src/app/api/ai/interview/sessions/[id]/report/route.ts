import { errorResponse, jsonResponse } from "@/lib/api/http";
import { getInterviewReport } from "@/lib/ai/interview-service";
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
    const report = await getInterviewReport(user.id, id);
    return jsonResponse({ report });
  } catch (e) {
    return errorResponse(e);
  }
}
