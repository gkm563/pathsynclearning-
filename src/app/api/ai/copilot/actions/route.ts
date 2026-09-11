import { errorResponse, jsonResponse, parseJson } from "@/lib/api/http";
import { AppError } from "@/lib/api/errors";
import { markCopilotWriteStatus } from "@/lib/ai/copilot-threads";
import { createNote } from "@/lib/memory/notes";
import { setBookmark } from "@/lib/news";
import { requireDbUser } from "@/lib/db/users";
import { copilotActionSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, copilotActionSchema);

    if (body.type === "create_note") {
      const note = await createNote({
        userId: user.id,
        title: body.title,
        content: body.content,
        visibility: "private",
        sourceType: "copilot",
        sourceId: body.threadId ?? null,
      });
      if (body.threadId && body.messageId) {
        await markCopilotWriteStatus(user.id, body.threadId, body.messageId, "done");
      }
      return jsonResponse({ ok: true, note: { id: note.id, title: note.title } }, 201);
    }

    const article = await setBookmark(
      user.id,
      body.articleId,
      body.bookmarked ?? true,
    );
    if (!article) throw AppError.notFound("Article not found");
    if (body.threadId && body.messageId) {
      await markCopilotWriteStatus(user.id, body.threadId, body.messageId, "done");
    }
    return jsonResponse({
      ok: true,
      article: { id: article.id, title: article.title, bookmarked: article.bookmarked },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
