import { and, desc, eq, inArray, not, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { notifications, userSettings } from "@/lib/db/schema";
import type {
  AppNotification,
  NotificationListPayload,
  NotificationPreferences,
  NotificationSummary,
} from "./types";

type NotificationRow = typeof notifications.$inferSelect;

function toIso(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

export function serializeNotification(row: NotificationRow): AppNotification {
  const meta =
    typeof row.meta === "object" && row.meta ? (row.meta as Record<string, unknown>) : {};
  const teamName = typeof meta.teamName === "string" ? meta.teamName : undefined;
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    desc: row.body,
    message: row.body,
    icon: row.icon,
    color: row.color,
    bg: row.bg,
    bdr: row.bdr,
    actionable: row.actionable,
    read: row.read,
    time: toIso(row.createdAt) ?? new Date().toISOString(),
    ...(teamName ? { teamName } : {}),
  };
}

async function loadPreferences(userId: string): Promise<NotificationPreferences> {
  const db = getDb();
  const settingsRows = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);
  const settings = settingsRows[0];
  return {
    pushOn: settings?.pushNotifications !== false,
    productOn: settings?.productUpdates !== false,
    emailOn: settings?.emailNotifications !== false,
  };
}

function deliveryWhere(userId: string, prefs: NotificationPreferences) {
  const parts = [eq(notifications.userId, userId)];
  if (!prefs.pushOn) {
    parts.push(inArray(notifications.type, ["system", "mentor"]));
  }
  if (!prefs.productOn) {
    parts.push(not(inArray(notifications.type, ["event", "invite"])));
  }
  return and(...parts);
}

function etagFrom(unreadCount: number, latestAt: string | null, total = 0): string {
  return `"n-${unreadCount}-${latestAt ?? "none"}-${total}"`;
}

async function loadSummaryFor(
  userId: string,
  prefs: NotificationPreferences,
): Promise<NotificationSummary & { etag: string }> {
  const db = getDb();
  const where = deliveryWhere(userId, prefs);
  const [row] = await db
    .select({
      unreadCount: sql<number>`coalesce(count(*) filter (where ${notifications.read} = false), 0)::int`,
      latestAt: sql<Date | null>`max(${notifications.createdAt})`,
    })
    .from(notifications)
    .where(where);

  const unreadCount = Number(row?.unreadCount ?? 0);
  const latestAt = toIso(row?.latestAt ?? null);
  return {
    unreadCount,
    latestAt,
    etag: etagFrom(unreadCount, latestAt),
  };
}

export async function getNotificationSummary(userId: string): Promise<
  NotificationSummary & { etag: string; preferences: NotificationPreferences }
> {
  const preferences = await loadPreferences(userId);
  const summary = await loadSummaryFor(userId, preferences);
  return { ...summary, preferences };
}

export async function listNotifications(
  userId: string,
  limit = 50,
): Promise<NotificationListPayload & { etag: string; preferences: NotificationPreferences }> {
  const db = getDb();
  const preferences = await loadPreferences(userId);
  const where = deliveryWhere(userId, preferences);
  const rows = await db
    .select()
    .from(notifications)
    .where(where)
    .orderBy(desc(notifications.createdAt))
    .limit(limit);

  const serialized = rows.map(serializeNotification);
  const unreadCount = serialized.filter((item) => !item.read).length;
  const latestAt = serialized[0]?.time ?? null;

  return {
    notifications: serialized,
    unreadCount,
    latestAt,
    etag: etagFrom(unreadCount, latestAt, serialized.length),
    preferences,
  };
}

export async function markNotifications(
  userId: string,
  body: { markAllRead?: boolean; id?: string; read?: boolean },
): Promise<NotificationListPayload> {
  const db = getDb();

  if (body.markAllRead) {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));
  } else if (body.id) {
    await db
      .update(notifications)
      .set({ read: body.read ?? true })
      .where(and(eq(notifications.id, body.id), eq(notifications.userId, userId)));
  }

  const listed = await listNotifications(userId);
  return {
    notifications: listed.notifications,
    unreadCount: listed.unreadCount,
    latestAt: listed.latestAt,
  };
}

export async function deleteNotifications(
  userId: string,
  body: { clearAll?: boolean; id?: string },
): Promise<NotificationListPayload> {
  const db = getDb();

  if (body.clearAll) {
    await db.delete(notifications).where(eq(notifications.userId, userId));
  } else if (body.id) {
    await db
      .delete(notifications)
      .where(and(eq(notifications.id, body.id), eq(notifications.userId, userId)));
  }

  const listed = await listNotifications(userId);
  return {
    notifications: listed.notifications,
    unreadCount: listed.unreadCount,
    latestAt: listed.latestAt,
  };
}
