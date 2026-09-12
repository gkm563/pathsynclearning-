import { errorResponse, jsonResponse, parseJson } from "@/lib/api/http";
import { AppError } from "@/lib/api/errors";
import { env } from "@/lib/env";
import { appendInternalTurn } from "@/lib/ai/interview-service";
import { interviewInternalTurnSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function assertAgentSecret(request: Request) {
  const secret = env.interviewAgentSecret;
  const header = request.headers.get("x-interview-agent-secret");
  if (!secret || header !== secret) throw AppError.unauthorized();
}

export async function POST(request: Request) {
  try {
    assertAgentSecret(request);
    const body = await parseJson(request, interviewInternalTurnSchema);
    await appendInternalTurn(body);
    return jsonResponse({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
