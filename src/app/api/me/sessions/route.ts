import { auth, clerkClient } from "@clerk/nextjs/server";
import { parseJson, errorResponse, jsonResponse } from "@/lib/api/http";
import { AppError } from "@/lib/api/errors";
import { requireDbUser } from "@/lib/db/users";
import { sessionsRevokeSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const user = await requireDbUser();
    const { sessionId: currentSessionId } = await auth();
    const clerk = await clerkClient();

    const result = await clerk.sessions.getSessionList({
      userId: user.clerk_id,
      status: "active",
    });

    const sessions = (result.data || []).map((s) => ({
      id: s.id,
      status: s.status,
      last_active_at: s.lastActiveAt
        ? new Date(s.lastActiveAt).toISOString()
        : null,
      expire_at: s.expireAt ? new Date(s.expireAt).toISOString() : null,
      client_id: s.clientId,
      is_current: s.id === currentSessionId,
    }));

    return jsonResponse({ sessions, current_session_id: currentSessionId });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, sessionsRevokeSchema);
    const { sessionId: currentSessionId } = await auth();
    const clerk = await clerkClient();

    if (body.revokeOthers) {
      const result = await clerk.sessions.getSessionList({
        userId: user.clerk_id,
        status: "active",
      });
      const others = (result.data || []).filter((s) => s.id !== currentSessionId);
      await Promise.all(
        others.map((s) => clerk.sessions.revokeSession(s.id)),
      );
      return jsonResponse({ revoked: others.length });
    }

    if (!body.sessionId) {
      throw AppError.badRequest("sessionId required");
    }
    if (body.sessionId === currentSessionId) {
      throw AppError.badRequest("Cannot revoke the current session here");
    }

    const target = await clerk.sessions.getSession(body.sessionId);
    if (target.userId !== user.clerk_id) {
      throw AppError.forbidden("Session does not belong to this user");
    }

    await clerk.sessions.revokeSession(body.sessionId);
    return jsonResponse({ revoked: 1 });
  } catch (e) {
    return errorResponse(e);
  }
}
