import { auth, currentUser } from "@clerk/nextjs/server";
import { getDb } from "@/lib/db/client";

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
  await db`
    INSERT INTO profiles (user_id) VALUES (${userId}::uuid)
    ON CONFLICT (user_id) DO NOTHING
  `;
  await db`
    INSERT INTO onboarding (user_id) VALUES (${userId}::uuid)
    ON CONFLICT (user_id) DO NOTHING
  `;
  await db`
    INSERT INTO user_settings (user_id) VALUES (${userId}::uuid)
    ON CONFLICT (user_id) DO NOTHING
  `;
  await db`
    INSERT INTO wallets (user_id) VALUES (${userId}::uuid)
    ON CONFLICT (user_id) DO NOTHING
  `;
  await db`
    INSERT INTO challenge_progress (user_id) VALUES (${userId}::uuid)
    ON CONFLICT (user_id) DO NOTHING
  `;
}

export async function requireDbUser(roleHint?: AppRole): Promise<DbUser> {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    throw new Error("UNAUTHORIZED");
  }

  const db = getDb();
  const existing = await db`
    SELECT id, clerk_id, email, role, full_name, image_url
    FROM users WHERE clerk_id = ${clerkId}
    LIMIT 1
  `;

  if (existing[0]) {
    await ensureRelatedRows(existing[0].id as string);
    return existing[0] as DbUser;
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

  const inserted = await db`
    INSERT INTO users (clerk_id, email, role, full_name, image_url)
    VALUES (${clerkId}, ${email}, ${role}, ${fullName}, ${imageUrl})
    ON CONFLICT (clerk_id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, users.full_name),
      image_url = COALESCE(EXCLUDED.image_url, users.image_url),
      updated_at = NOW()
    RETURNING id, clerk_id, email, role, full_name, image_url
  `;

  const user = inserted[0] as DbUser;
  await ensureRelatedRows(user.id);
  return user;
}

export function jsonResponse(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function errorResponse(error: unknown, fallback = "Server error") {
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  console.error(error);
  return Response.json(
    { error: error instanceof Error ? error.message : fallback },
    { status: 500 },
  );
}
