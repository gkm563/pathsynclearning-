import { getDb } from "@/lib/db/client";
import { requireDbUser, jsonResponse, errorResponse } from "@/lib/db/users";

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
    meta: { teamName: "CodeBlox" },
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

export async function GET() {
  try {
    const user = await requireDbUser();
    const db = getDb();
    let rows = await db`
      SELECT * FROM notifications
      WHERE user_id = ${user.id}::uuid
      ORDER BY created_at DESC
      LIMIT 50
    `;

    if (rows.length === 0) {
      for (const n of DEFAULT_NOTIFICATIONS) {
        await db`
          INSERT INTO notifications (
            user_id, type, title, body, icon, color, bg, bdr, actionable, meta
          ) VALUES (
            ${user.id}::uuid, ${n.type}, ${n.title}, ${n.body}, ${n.icon},
            ${n.color}, ${n.bg}, ${n.bdr}, ${Boolean(n.actionable)},
            ${JSON.stringify(n.meta || {})}::jsonb
          )
        `;
      }
      rows = await db`
        SELECT * FROM notifications
        WHERE user_id = ${user.id}::uuid
        ORDER BY created_at DESC
        LIMIT 50
      `;
    }

    return jsonResponse({
      notifications: rows.map((n) => ({
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
        time: n.created_at,
        ...(typeof n.meta === "object" && n.meta ? n.meta : {}),
      })),
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await request.json();
    const db = getDb();

    if (body.markAllRead) {
      await db`
        UPDATE notifications SET read = TRUE
        WHERE user_id = ${user.id}::uuid
      `;
    } else if (body.id) {
      await db`
        UPDATE notifications SET read = COALESCE(${body.read ?? true}, TRUE)
        WHERE id = ${body.id}::uuid AND user_id = ${user.id}::uuid
      `;
    }

    const rows = await db`
      SELECT * FROM notifications
      WHERE user_id = ${user.id}::uuid
      ORDER BY created_at DESC
      LIMIT 50
    `;
    return jsonResponse({
      notifications: rows.map((n) => ({
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
        time: n.created_at,
        ...(typeof n.meta === "object" && n.meta ? n.meta : {}),
      })),
    });
  } catch (e) {
    return errorResponse(e);
  }
}
