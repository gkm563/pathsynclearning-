import { errorResponse, jsonResponse } from "@/lib/api/http";
import { requireDbUser } from "@/lib/db/users";
import { listNews } from "@/lib/news";
import { newsListQuerySchema } from "@/lib/validation/schemas";

export async function GET(request: Request) {
  try {
    const user = await requireDbUser();
    const url = new URL(request.url);
    const parsed = newsListQuerySchema.parse({
      category: url.searchParams.get("category") || undefined,
      search: url.searchParams.get("search") || undefined,
      sort: url.searchParams.get("sort") || "latest",
      cursor: url.searchParams.get("cursor") || undefined,
      limit: url.searchParams.get("limit") || 18,
      saved: url.searchParams.get("saved") || undefined,
    });

    const payload = await listNews(user.id, {
      category: parsed.category,
      search: parsed.search,
      sort: parsed.sort,
      cursor: parsed.cursor,
      limit: parsed.limit,
      savedOnly: parsed.saved,
    });

    return jsonResponse(payload);
  } catch (e) {
    return errorResponse(e);
  }
}
