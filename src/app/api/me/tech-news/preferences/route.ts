import { errorResponse, jsonResponse, parseJson } from "@/lib/api/http";
import { requireDbUser } from "@/lib/db/users";
import { getNewsPreferences, updateNewsPreferences } from "@/lib/news";
import { newsPreferencesUpdateSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const user = await requireDbUser();
    const preferences = await getNewsPreferences(user.id);
    return jsonResponse({ preferences });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, newsPreferencesUpdateSchema);
    const preferences = await updateNewsPreferences(user.id, body.categories);
    return jsonResponse({ preferences });
  } catch (e) {
    return errorResponse(e);
  }
}
