import { errorResponse, jsonResponse } from "@/lib/api/http";
import { requireDbUser } from "@/lib/db/users";
import { getProgressPayload } from "@/lib/progress";
import { progressQuerySchema } from "@/lib/validation/schemas";

/**
 * Authenticated student progress aggregate.
 * User identity always comes from the session — never from query params.
 */
export async function GET(request: Request) {
  try {
    const user = await requireDbUser();
    const url = new URL(request.url);
    const parsed = progressQuerySchema.parse({
      range: url.searchParams.get("range") || "all",
      year: url.searchParams.get("year") || undefined,
    });

    const payload = await getProgressPayload(
      user.id,
      parsed.range,
      parsed.year,
    );
    return jsonResponse(payload);
  } catch (e) {
    return errorResponse(e);
  }
}
