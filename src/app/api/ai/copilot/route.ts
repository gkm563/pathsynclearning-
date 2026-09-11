import { errorResponse, jsonResponse, parseJson } from "@/lib/api/http";
import { buildCopilotContext } from "@/lib/ai/copilot-context";
import { runCopilotTurn } from "@/lib/ai/copilot-engine";
import { assertCopilotRateLimit } from "@/lib/ai/copilot-rate-limit";
import {
  classifyCopilotMessage,
  copilotScopeRefusal,
} from "@/lib/ai/copilot-scope";
import { appendCopilotTurn } from "@/lib/ai/copilot-threads";
import { requireDbUser } from "@/lib/db/users";
import { copilotChatSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    assertCopilotRateLimit(user.id);
    const body = await parseJson(request, copilotChatSchema);

    const verdict = classifyCopilotMessage(body.message);
    if (!verdict.ok) {
      const reply = copilotScopeRefusal(verdict.reason);
      const { threadId, assistantMessageId } = await appendCopilotTurn({
        userId: user.id,
        threadId: body.threadId,
        userText: body.message,
        assistantText: reply,
      });
      return jsonResponse({
        reply,
        threadId,
        messageId: assistantMessageId,
        navigate: [],
        proposedWrites: [],
        refused: true,
      });
    }

    const ctx = await buildCopilotContext(user, body.pathname || "/dashboard");
    const result = await runCopilotTurn({
      userId: user.id,
      ctx,
      message: body.message,
      history: body.history || [],
    });

    const { threadId, assistantMessageId } = await appendCopilotTurn({
      userId: user.id,
      threadId: body.threadId,
      userText: body.message,
      assistantText: result.reply,
      navigate: result.navigate,
      proposedWrites: result.proposedWrites,
    });

    return jsonResponse({
      reply: result.reply,
      threadId,
      messageId: assistantMessageId,
      navigate: result.navigate,
      proposedWrites: result.proposedWrites,
      refused: result.refused,
      fallback: result.fallback,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
