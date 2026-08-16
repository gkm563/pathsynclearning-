import { requireDbUser, jsonResponse, errorResponse } from "@/lib/db/users";

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
    try {
      const body = await request.json();
      if (body?.role) role = body.role;
    } catch {
      // empty body ok
    }
    const user = await requireDbUser(role);
    return jsonResponse({ user });
  } catch (e) {
    return errorResponse(e);
  }
}
