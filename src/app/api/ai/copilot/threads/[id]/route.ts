import { errorResponse, jsonResponse } from "@/lib/api/http";
import {
  deleteCopilotThread,
  getCopilotThread,
} from "@/lib/ai/copilot-threads";
import { requireDbUser } from "@/lib/db/users";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireDbUser();
    const { id } = await context.params;
    const data = await getCopilotThread(user.id, id);
    return jsonResponse(data);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireDbUser();
    const { id } = await context.params;
    await deleteCopilotThread(user.id, id);
    return jsonResponse({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
