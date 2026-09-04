import { and, desc, eq } from "drizzle-orm";
import { parseJson, errorResponse, jsonResponse } from "@/lib/api/http";
import { getDb } from "@/lib/db/client";
import { notifications, userSettings } from "@/lib/db/schema";
import { requireDbUser } from "@/lib/db/users";
import { notificationPatchSchema } from "@/lib/validation/schemas";

const DEFAULT_NOTIFICATIONS = [
  {
    type: "challenge",
    title: "Daily SDE Challenge Dropped",
    body: "Solve 'Subarray Sum Equals K' using Prefix Sum before midnight to preserve your 7-day streak!",
    icon: "⚡",
    color: "#6c63ff",
    bg: "rgba(108,99,255,0.08)",
    bdr: "rgba(108,99,255,0.25)",
  },
  {
    type: "invite",
    title: "HackSquad Invitation Received",
    body: "Siddharth (IIT-K) invited you to join team 'CodeBlox' for HackAttack '26.",
    icon: "⚔️",
    color: "#e040fb",
    bg: "rgba(224,64,251,0.08)",
    bdr: "rgba(224,64,251,0.25)",
    actionable: true,
    meta: { teamName: "CodeBlox" } as Record<string, unknown>,
  },
  {
    type: "mentor",
    title: "Code Review Comments",
    body: "Aarav Mehta (SDE 2 @ Google) left 3 suggestions on your Distributed Chat App socket connector logic.",
    icon: "🧑‍🏫",
    color: "#00c9a7",
    bg: "rgba(0,201,167,0.08)",
    bdr: "rgba(0,201,167,0.25)",
  },
  {
    type: "event",
    title: "RSVP Confirmed: System Design Masterclass",
    body: "Your session with Sophia Vance on high-concurrency database partitioned scale starts tomorrow at 6 PM.",
    icon: "📅",
    color: "#f7971e",
    bg: "rgba(247,151,30,0.08)",
    bdr: "rgba(247,151,30,0.25)",
  },
];

function serialize(rows: (typeof notifications.$inferSelect)[]) {
  return rows.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    desc: n.body,
    icon: n.icon,
    color: n.color,
    bg: n.bg,
    bdr: n.bdr,
    actionable: n.actionable,
    read: n.read,
    time: n.createdAt,
    ...(typeof n.meta === "object" && n.meta ? n.meta : {}),
  }));
}

export async function GET() {
  try {
    const user = await requireDbUser();
    const db = getDb();

    const settingsRows = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, user.id))
      .limit(1);
    const settings = settingsRows[0];
    const pushOn = settings?.pushNotifications !== false;
    const productOn = settings?.productUpdates !== false;

    let rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    if (rows.length === 0) {
      await db.insert(notifications).values(
        DEFAULT_NOTIFICATIONS.map((n) => ({
          userId: user.id,
          type: n.type,
          title: n.title,
          body: n.body,
          icon: n.icon,
          color: n.color,
          bg: n.bg,
          bdr: n.bdr,
          actionable: Boolean(n.actionable),
          meta: ("meta" in n && n.meta ? n.meta : {}) as Record<string, unknown>,
        })),
      );
      rows = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, user.id))
        .orderBy(desc(notifications.createdAt))
        .limit(50);
    }

    // Honor notification preferences for in-app delivery
    let filtered = rows;
    if (!pushOn) {
      filtered = filtered.filter((n) => n.type === "system" || n.type === "mentor");
    }
    if (!productOn) {
      filtered = filtered.filter(
        (n) => n.type !== "event" && n.type !== "invite",
      );
    }

    return jsonResponse({
      notifications: serialize(filtered),
      preferences: {
        push_notifications: pushOn,
        product_updates: productOn,
        email_notifications: settings?.emailNotifications !== false,
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, notificationPatchSchema);
    const db = getDb();

    if (body.markAllRead) {
      await db
        .update(notifications)
        .set({ read: true })
        .where(eq(notifications.userId, user.id));
    } else if (body.id) {
      await db
        .update(notifications)
        .set({ read: body.read ?? true })
        .where(
          and(eq(notifications.id, body.id), eq(notifications.userId, user.id)),
        );
    }

    const rows = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(50);

    return jsonResponse({ notifications: serialize(rows) });
  } catch (e) {
    return errorResponse(e);
  }
}
