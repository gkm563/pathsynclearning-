import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { requireDbUser, type DbUser } from "@/lib/db/users";
import { getDb } from "@/lib/db/client";
import { onboarding } from "@/lib/db/schema";
import { routes } from "@/lib/routes";
import { pathForOnboarding, type OnboardingRow } from "@/lib/auth-routing";
import { mapOnboarding } from "@/lib/db/mappers";

export async function requireStudentPortal(): Promise<{ user: DbUser; onboardingData: OnboardingRow }> {
  let user: DbUser;
  try {
    user = await requireDbUser();
  } catch {
    redirect(routes.auth.signIn);
  }

  if (user.role !== "student") {
    redirect(routes.home);
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(onboarding)
    .where(eq(onboarding.userId, user.id))
    .limit(1);

  const onboardingData = rows[0] ? (mapOnboarding(rows[0]) as OnboardingRow) : null;

  if (!onboardingData?.completed) {
    redirect(pathForOnboarding(onboardingData));
  }

  return { user, onboardingData };
}

export async function requireStudentOnboarding(): Promise<{ user: DbUser; onboardingData: OnboardingRow }> {
  let user: DbUser;
  try {
    user = await requireDbUser();
  } catch {
    redirect(routes.auth.signIn);
  }

  if (user.role !== "student") {
    redirect(routes.home);
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(onboarding)
    .where(eq(onboarding.userId, user.id))
    .limit(1);

  const onboardingData = rows[0] ? (mapOnboarding(rows[0]) as OnboardingRow) : null;

  if (onboardingData?.completed) {
    redirect(routes.app.dashboard);
  }

  return { user, onboardingData };
}
