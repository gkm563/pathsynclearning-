import { parseJson, errorResponse, jsonResponse } from "@/lib/api/http";
import { requireDbUser } from "@/lib/db/users";
import {
  deleteNotifications,
  getNotificationSummary,
  listNotifications,
  markNotifications,
} from "@/lib/notifications/service";
import {
  notificationDeleteSchema,
  notificationPatchSchema,
} from "@/lib/validation/schemas";

function withEtag(data: unknown, etag: string, request: Request) {
  const incoming = request.headers.get("if-none-match");
  if (incoming && incoming === etag) {
    return new Response(null, {
      status: 304,
      headers: {
        ETag: etag,
        "Cache-Control": "private, no-cache",
      },
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ETag: etag,
      "Cache-Control": "private, no-cache",
    },
  });
}

export async function GET(request: Request) {
  try {
    const user = await requireDbUser();
    const view = new URL(request.url).searchParams.get("view");

    if (view === "summary") {
      const summary = await getNotificationSummary(user.id);
      return withEtag(
        {
          unreadCount: summary.unreadCount,
          latestAt: summary.latestAt,
          preferences: {
            push_notifications: summary.preferences.pushOn,
            product_updates: summary.preferences.productOn,
            email_notifications: summary.preferences.emailOn,
          },
        },
        summary.etag,
        request,
      );
    }

    const listed = await listNotifications(user.id);
    return withEtag(
      {
        notifications: listed.notifications,
        unreadCount: listed.unreadCount,
        latestAt: listed.latestAt,
        preferences: {
          push_notifications: listed.preferences.pushOn,
          product_updates: listed.preferences.productOn,
          email_notifications: listed.preferences.emailOn,
        },
      },
      listed.etag,
      request,
    );
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, notificationPatchSchema);
    const listed = await markNotifications(user.id, body);
    return jsonResponse(listed);
  } catch (e) {
    return errorResponse(e);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, notificationDeleteSchema);
    const listed = await deleteNotifications(user.id, body);
    return jsonResponse(listed);
  } catch (e) {
    return errorResponse(e);
  }
}
