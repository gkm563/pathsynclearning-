import { requireDbUser, type AppRole } from "@/lib/db/users";
import { routes } from "@/lib/routes";

/**
 * Server-side post-auth destination (no client Clerk hydration race).
 * Students go straight to the dashboard.
 */
export async function resolvePostAuthPathServer(
  roleHint: string = "student",
): Promise<string> {
  try {
    const user = await requireDbUser(
      (roleHint as AppRole) || "student",
    );
    if (user.role !== "student") return routes.home;
    return routes.app.dashboard;
  } catch (e) {
    if (e instanceof Error && e.message === "UNAUTHORIZED") {
      return routes.auth.signIn;
    }
    console.error("resolvePostAuthPathServer:", e);
    return roleHint === "student"
      ? routes.app.dashboard
      : routes.home;
  }
}
