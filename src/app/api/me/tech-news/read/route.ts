import { errorResponse, jsonResponse, parseJson } from "@/lib/api/http";
import { AppError } from "@/lib/api/errors";
import { requireDbUser } from "@/lib/db/users";
import { markRead } from "@/lib/news";
import { newsReadSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, newsReadSchema);
    const article = await markRead(user.id, body.articleId);
    if (!article) throw AppError.notFound("Article not found");
    return jsonResponse({ article });
  } catch (e) {
    return errorResponse(e);
  }
}
