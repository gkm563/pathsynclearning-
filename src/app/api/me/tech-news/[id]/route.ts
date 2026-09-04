import { errorResponse, jsonResponse } from "@/lib/api/http";
import { AppError } from "@/lib/api/errors";
import { requireDbUser } from "@/lib/db/users";
import { getArticle } from "@/lib/news";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  try {
    const user = await requireDbUser();
    const { id } = await ctx.params;
    if (!id) throw AppError.badRequest("Missing article id");

    const article = await getArticle(user.id, id);
    if (!article) throw AppError.notFound("Article not found");

    return jsonResponse({ article });
  } catch (e) {
    return errorResponse(e);
  }
}
