import { eq } from "drizzle-orm";
import { pathForOnboarding, type OnboardingRow } from "@/lib/auth-routing";
import { getDb } from "@/lib/db/client";
import { mapOnboarding } from "@/lib/db/mappers";
import { onboarding } from "@/lib/db/schema";
import { requireDbUser, type AppRole } from "@/lib/db/users";
import { routes } from "@/lib/routes";

/**
 * Server-side post-auth destination (no client Clerk hydration race).
 */
export async function resolvePostAuthPathServer(
  roleHint: string = "student",
): Promise<string> {
  try {
    const user = await requireDbUser(
      (roleHint as AppRole) || "student",
    );
    if (user.role !== "student") return routes.home;

    const db = getDb();
    const rows = await db
      .select()
      .from(onboarding)
      .where(eq(onboarding.userId, user.id))
      .limit(1);

    const row = rows[0]
      ? (mapOnboarding(rows[0]) as OnboardingRow)
      : null;
    return pathForOnboarding(row);
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return routes.auth.signIn;
    }
    console.error("resolvePostAuthPathServer:", e);
    return roleHint === "student"
      ? routes.onboarding.stage1
      : routes.home;
  }
}
