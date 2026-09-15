import { AppError } from "@/lib/api/errors";
import { errorResponse, jsonResponse, parseJson } from "@/lib/api/http";
import { applyCareerChange, loadCareerPayload } from "@/lib/career/apply-change";
import { requireDbUser } from "@/lib/db/users";
import { careerChangeSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const user = await requireDbUser();
    if (user.role !== "student") throw AppError.forbidden();
    const career = await loadCareerPayload(user.id);
    return jsonResponse({ career });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    if (user.role !== "student") throw AppError.forbidden();
    const body = await parseJson(request, careerChangeSchema);
    const career = await applyCareerChange(user.id, body.targetRole);
    return jsonResponse({ career });
  } catch (e) {
    return errorResponse(e);
  }
}
