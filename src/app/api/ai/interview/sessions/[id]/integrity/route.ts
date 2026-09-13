import { errorResponse, jsonResponse, parseJson } from "@/lib/api/http";
import { recordIntegrity } from "@/lib/ai/interview-service";
import { requireDbUser } from "@/lib/db/users";
import { interviewIntegritySchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireDbUser();
    const { id } = await ctx.params;
    const body = await parseJson(request, interviewIntegritySchema);
    const result = await recordIntegrity(user.id, id, body.type);
    return jsonResponse({ ok: true, ...result });
  } catch (e) {
    return errorResponse(e);
  }
}
