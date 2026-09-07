import "server-only";
import { cache } from "react";
import { after } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { AppError } from "@/lib/api/errors";
import { getDb } from "@/lib/db/client";
import { mapUser } from "@/lib/db/mappers";
import {
  challengeProgress,
  profiles,
  userSettings,
  users,
  wallets,
} from "@/lib/db/schema";

export type AppRole = "student" | "teacher" | "recruiter";

export interface DbUser {
  id: string;
  clerk_id: string;
  email: string;
  role: AppRole;
  full_name: string | null;
  image_url: string | null;
}

export type RequireDbUserOptions = {
  /**
   * Wait for Clerk email/avatar to be written before returning.
   * Use on session bootstrap (POST /api/me) so the client sees fresh identity.
   */
  syncFromClerk?: boolean;
};

type ClerkIdentity = {
  email: string | null;
  imageUrl: string | null;
  fullName: string | null;
  role?: AppRole;
};

function roleFromUnknown(value: unknown): AppRole | undefined {
  if (value === "student" || value === "teacher" || value === "recruiter") {
    return value;
  }
  return undefined;
}

type UserRow = {
  id: string;
  clerkId: string;
  email: string;
  role: string;
  fullName: string | null;
  imageUrl: string | null;
};

const CLERK_SYNC_TTL_MS = 10 * 60 * 1000;
const MEMO_LIMIT = 500;
const PLACEHOLDER_EMAIL_SUFFIX = "@users.pathed.local";

const identityCache = new Map<string, { at: number; value: ClerkIdentity }>();
const identityInflight = new Map<string, Promise<ClerkIdentity | null>>();
const dbSyncAt = new Map<string, number>();
const dbSyncInflight = new Set<string>();

function pruneMemo<V>(map: Map<string, V>) {
  if (map.size < MEMO_LIMIT) return;
  const first = map.keys().next().value;
  if (first !== undefined) map.delete(first);
}

function rememberIdentity(clerkId: string, value: ClerkIdentity) {
  pruneMemo(identityCache);
  identityCache.set(clerkId, { at: Date.now(), value });
}

function rememberDbSync(clerkId: string) {
  pruneMemo(dbSyncAt);
  dbSyncAt.set(clerkId, Date.now());
}

function toDbUser(row: UserRow): DbUser {
  return mapUser(row) as DbUser;
}

function isPlaceholderEmail(email: string) {
  return email.endsWith(PLACEHOLDER_EMAIL_SUFFIX);
}

async function fetchClerkIdentity(): Promise<ClerkIdentity | null> {
  const clerkUser = await currentUser().catch(() => null);
  if (!clerkUser) return null;
  return {
    email:
      clerkUser.primaryEmailAddress?.emailAddress ||
      clerkUser.emailAddresses?.[0]?.emailAddress ||
      null,
    imageUrl: clerkUser.imageUrl || null,
    fullName:
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      clerkUser.username ||
      null,
    role: roleFromUnknown(clerkUser.unsafeMetadata?.role),
  };
}

async function loadClerkIdentity(clerkId: string): Promise<ClerkIdentity | null> {
  const cached = identityCache.get(clerkId);
  if (cached && Date.now() - cached.at < CLERK_SYNC_TTL_MS) {
    return cached.value;
  }
  const pending = identityInflight.get(clerkId);
  if (pending) return pending;

  const request = fetchClerkIdentity()
    .then((identity) => {
      if (identity) rememberIdentity(clerkId, identity);
      return identity;
    })
    .finally(() => {
      identityInflight.delete(clerkId);
    });

  identityInflight.set(clerkId, request);
  return request;
}

/** Live Clerk email/avatar when already fetched in this process; never starts a new Clerk round trip. */
export async function getCachedClerkIdentity(): Promise<ClerkIdentity | null> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;
  const cached = identityCache.get(clerkId);
  if (cached && Date.now() - cached.at < CLERK_SYNC_TTL_MS) return cached.value;
  const pending = identityInflight.get(clerkId);
  return pending ?? null;
}

async function applyClerkIdentity(
  row: UserRow,
  identity: ClerkIdentity,
): Promise<UserRow> {
  const email = identity.email || row.email;
  const imageUrl = identity.imageUrl || row.imageUrl;
  if (email === row.email && imageUrl === row.imageUrl) {
    rememberDbSync(row.clerkId);
    return row;
  }

  const db = getDb();
  const [updated] = await db
    .update(users)
    .set({
      email,
      imageUrl,
      updatedAt: new Date(),
    })
    .where(eq(users.id, row.id))
    .returning({
      id: users.id,
      clerkId: users.clerkId,
      email: users.email,
      role: users.role,
      fullName: users.fullName,
      imageUrl: users.imageUrl,
    });

  rememberDbSync(row.clerkId);
  return updated ?? { ...row, email, imageUrl };
}

async function syncClerkIdentity(row: UserRow): Promise<UserRow> {
  const identity = await loadClerkIdentity(row.clerkId);
  if (!identity) return row;
  return applyClerkIdentity(row, identity);
}

function recentlySynced(clerkId: string) {
  const at = dbSyncAt.get(clerkId);
  return Boolean(at && Date.now() - at < CLERK_SYNC_TTL_MS);
}

/** Refresh email/avatar after the response is sent. Never blocks the request. */
function scheduleBackgroundClerkSync(row: UserRow) {
  if (recentlySynced(row.clerkId) || dbSyncInflight.has(row.clerkId)) return;
  dbSyncInflight.add(row.clerkId);
  try {
    after(async () => {
      try {
        await syncClerkIdentity(row);
      } catch {
        dbSyncAt.delete(row.clerkId);
      } finally {
        dbSyncInflight.delete(row.clerkId);
      }
    });
  } catch {
    dbSyncInflight.delete(row.clerkId);
  }
}

async function ensureMissingRelatedRows(
  userId: string,
  present: {
    profile: boolean;
    settings: boolean;
    wallet: boolean;
    challenge: boolean;
  },
) {
  if (
    present.profile &&
    present.settings &&
    present.wallet &&
    present.challenge
  ) {
    return;
  }

  const db = getDb();
  const jobs: Promise<unknown>[] = [];
  if (!present.profile) {
    jobs.push(db.insert(profiles).values({ userId }).onConflictDoNothing());
  }
  if (!present.settings) {
    jobs.push(
      db.insert(userSettings).values({ userId }).onConflictDoNothing(),
    );
  }
  if (!present.wallet) {
    jobs.push(db.insert(wallets).values({ userId }).onConflictDoNothing());
  }
  if (!present.challenge) {
    jobs.push(
      db.insert(challengeProgress).values({ userId }).onConflictDoNothing(),
    );
  }
  if (jobs.length) await Promise.all(jobs);
}

async function createUserFromClerk(
  clerkId: string,
  roleHint?: AppRole,
): Promise<UserRow> {
  const identity = await loadClerkIdentity(clerkId);
  const email =
    identity?.email || `${clerkId}${PLACEHOLDER_EMAIL_SUFFIX}`;
  const fullName = identity?.fullName || null;
  const imageUrl = identity?.imageUrl || null;
  const role = roleHint || identity?.role || "student";

  const db = getDb();
  const [inserted] = await db
    .insert(users)
    .values({
      clerkId,
      email,
      role,
      fullName,
      imageUrl,
    })
    .onConflictDoUpdate({
      target: users.clerkId,
      set: {
        email,
        ...(fullName ? { fullName } : {}),
        ...(imageUrl ? { imageUrl } : {}),
        updatedAt: new Date(),
      },
    })
    .returning({
      id: users.id,
      clerkId: users.clerkId,
      email: users.email,
      role: users.role,
      fullName: users.fullName,
      imageUrl: users.imageUrl,
    });

  rememberDbSync(clerkId);
  await ensureMissingRelatedRows(inserted.id, {
    profile: false,
    settings: false,
    wallet: false,
    challenge: false,
  });
  return inserted;
}

/**
 * Resolve the signed-in Clerk user to a PathEd row.
 * Deduped within a single request via React cache().
 * Related profile/settings/wallet/challenge rows are inserted only when missing.
 */
const resolveAuthenticatedUser = cache(async (roleHint: string): Promise<UserRow> => {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    throw AppError.unauthorized();
  }

  const db = getDb();
  const [row] = await db
    .select({
      id: users.id,
      clerkId: users.clerkId,
      email: users.email,
      role: users.role,
      fullName: users.fullName,
      imageUrl: users.imageUrl,
      profileUserId: profiles.userId,
      settingsUserId: userSettings.userId,
      walletUserId: wallets.userId,
      challengeUserId: challengeProgress.userId,
    })
    .from(users)
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .leftJoin(userSettings, eq(userSettings.userId, users.id))
    .leftJoin(wallets, eq(wallets.userId, users.id))
    .leftJoin(challengeProgress, eq(challengeProgress.userId, users.id))
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (!row) {
    return createUserFromClerk(
      clerkId,
      roleHint ? (roleHint as AppRole) : undefined,
    );
  }

  await ensureMissingRelatedRows(row.id, {
    profile: Boolean(row.profileUserId),
    settings: Boolean(row.settingsUserId),
    wallet: Boolean(row.walletUserId),
    challenge: Boolean(row.challengeUserId),
  });

  return {
    id: row.id,
    clerkId: row.clerkId,
    email: row.email,
    role: row.role,
    fullName: row.fullName,
    imageUrl: row.imageUrl,
  };
});

export async function requireDbUser(
  roleHint?: AppRole,
  opts?: RequireDbUserOptions,
): Promise<DbUser> {
  const row = await resolveAuthenticatedUser(roleHint ?? "");
  const mustBlock =
    Boolean(opts?.syncFromClerk) || isPlaceholderEmail(row.email);

  if (mustBlock) {
    const synced = await syncClerkIdentity(row);
    return toDbUser(synced);
  }

  scheduleBackgroundClerkSync(row);
  return toDbUser(row);
}
