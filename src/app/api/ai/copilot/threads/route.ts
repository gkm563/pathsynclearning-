import { errorResponse, jsonResponse, parseJson } from "@/lib/api/http";
import {
  createCopilotThread,
  listCopilotThreads,
} from "@/lib/ai/copilot-threads";
import { requireDbUser } from "@/lib/db/users";
import { copilotThreadCreateSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await requireDbUser();
    const threads = await listCopilotThreads(user.id);
    return jsonResponse({ threads });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, copilotThreadCreateSchema);
    const thread = await createCopilotThread(user.id, body.title || "New chat");
    return jsonResponse({ thread }, 201);
  } catch (e) {
    return errorResponse(e);
  }
}
