import { routes } from "@/lib/routes";

/**
 * Ensure DB user exists, then return where a signed-in user should land.
 * Teachers/recruiters go home; students go to optional onboarding when pending.
 */
export async function resolvePostAuthPath(
  roleHint: string = "student",
): Promise<string> {
  let role = roleHint;

  try {
    const res = await fetch(routes.api.me, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: roleHint }),
    });
    if (res.ok) {
      const body = await res.json();
      if (body?.user?.role) role = body.user.role;
    } else if (res.status === 401) {
      return routes.auth.signIn;
    }
  } catch {
    // continue with role hint
  }

  if (role !== "student") return routes.home;

  try {
    const onboarding = await fetch("/api/me/onboarding", {
      credentials: "include",
    });
    if (onboarding.ok) {
      const body = (await onboarding.json()) as { completed?: boolean };
      if (!body.completed) return routes.app.onboarding;
    }
  } catch {
    // dashboard is a safe fallback
  }

  return routes.app.dashboard;
}