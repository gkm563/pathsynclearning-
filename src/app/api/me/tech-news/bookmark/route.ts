import { errorResponse, jsonResponse, parseJson } from "@/lib/api/http";
import { AppError } from "@/lib/api/errors";
import { requireDbUser } from "@/lib/db/users";
import { setBookmark } from "@/lib/news";
import { newsBookmarkSchema } from "@/lib/validation/schemas";

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, newsBookmarkSchema);
    const article = await setBookmark(user.id, body.articleId, body.bookmarked);
    if (!article) throw AppError.notFound("Article not found");
    return jsonResponse({ article });
  } catch (e) {
    return errorResponse(e);
  }
}
