import "server-only";
import { AppError } from "@/lib/api/errors";
import { requireDbUser, type AppRole } from "@/lib/db/users";
import { isStudentOnboardingPending } from "@/lib/onboarding/status";
import { routes } from "@/lib/routes";

/**
 * Server-side post-auth destination (no client Clerk hydration race).
 * Students who have not finished (or skipped) setup go to optional onboarding.
 */
export async function resolvePostAuthPathServer(
  roleHint: string = "student",
): Promise<string> {
  try {
    const user = await requireDbUser(
      (roleHint as AppRole) || "student",
    );
    if (user.role !== "student") return routes.home;
    if (await isStudentOnboardingPending(user.id)) {
      return routes.app.onboarding;
    }
    return routes.app.dashboard;
  } catch (e) {
    if (
      (e instanceof AppError && e.code === "UNAUTHORIZED") ||
      (e instanceof Error && e.message === "UNAUTHORIZED")
    ) {
      return routes.auth.signIn;
    }
    console.error("resolvePostAuthPathServer:", e);
    return roleHint === "student"
      ? routes.app.dashboard
      : routes.home;
  }
}
