import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { mapUser } from "@/lib/db/mappers";
import {
  challengeProgress,
  onboarding,
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

async function ensureRelatedRows(userId: string) {
  const db = getDb();
  await db.insert(profiles).values({ userId }).onConflictDoNothing();
  await db.insert(onboarding).values({ userId }).onConflictDoNothing();
  await db.insert(userSettings).values({ userId }).onConflictDoNothing();
  await db.insert(wallets).values({ userId }).onConflictDoNothing();
  await db.insert(challengeProgress).values({ userId }).onConflictDoNothing();
}

export async function requireDbUser(roleHint?: AppRole): Promise<DbUser> {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    throw new Error("UNAUTHORIZED");
  }

  const db = getDb();
  const existing = await db
    .select({
      id: users.id,
      clerkId: users.clerkId,
      email: users.email,
      role: users.role,
      fullName: users.fullName,
      imageUrl: users.imageUrl,
    })
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (existing[0]) {
    await ensureRelatedRows(existing[0].id);
    return mapUser(existing[0]) as DbUser;
  }

  const clerkUser = await currentUser();
  const email =
    clerkUser?.primaryEmailAddress?.emailAddress ||
    clerkUser?.emailAddresses?.[0]?.emailAddress ||
    `${clerkId}@users.pathed.local`;
  const fullName =
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
    clerkUser?.username ||
    null;
  const imageUrl = clerkUser?.imageUrl || null;
  const role = (roleHint ||
    (clerkUser?.unsafeMetadata?.role as AppRole) ||
    "student") as AppRole;

  const inserted = await db
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

  const user = mapUser(inserted[0]) as DbUser;
  await ensureRelatedRows(user.id);
  return user;
}

export {
  jsonResponse,
  errorResponse,
} from "@/lib/api/http";
