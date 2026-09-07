import { errorResponse, jsonResponse } from "@/lib/api/http";
import { AppError } from "@/lib/api/errors";
import { requireDbUser } from "@/lib/db/users";
import { meUpsertSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const user = await requireDbUser();
    return jsonResponse({ user });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(request: Request) {
  try {
    let role: "student" | "teacher" | "recruiter" | undefined;
    const text = await request.text();
    if (text.trim()) {
      let raw: unknown;
      try {
        raw = JSON.parse(text);
      } catch {
        throw AppError.badRequest("Invalid JSON body");
      }
      const parsed = meUpsertSchema.parse(raw);
      role = parsed.role;
    }
    const user = await requireDbUser(role, { syncFromClerk: true });
    return jsonResponse({ user });
  } catch (e) {
    return errorResponse(e);
  }
}
