import { apiGet, apiSend } from "@/lib/api";
import { routes, STUDENT_PORTAL_PREFIXES } from "@/lib/routes";

export type OnboardingRow = {
  completed?: boolean;
  current_stage?: number | null;
  selected_career?: string | null;
  stage1?: Record<string, unknown>;
  stage2?: Record<string, unknown>;
  stage3?: Record<string, unknown>;
  stage4?: Record<string, unknown>;
} | null;

/** Map onboarding progress to the correct app path for students. */
export function pathForOnboarding(onboarding: OnboardingRow): string {
  if (onboarding?.completed) return routes.app.dashboard;

  const stage = Number(onboarding?.current_stage) || 1;
  if (stage <= 1) return routes.onboarding.stage1;
  if (stage === 2) return routes.onboarding.stage2;
  if (stage === 3) return routes.onboarding.stage3;
  return routes.onboarding.stage4;
}

/**
 * Ensure DB user exists, then return where a signed-in user should land.
 * Teachers/recruiters go home; students go dashboard or unfinished onboarding.
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
    const data = await apiGet<{ onboarding: OnboardingRow }>(
      `${routes.api.me}/onboarding`,
    );
    return pathForOnboarding(data.onboarding);
  } catch {
    return routes.onboarding.stage1;
  }
}

export async function markOnboardingComplete(stage4?: Record<string, unknown>) {
  await apiSend(`${routes.api.me}/onboarding`, "PUT", {
    stage4: stage4 || { finished: true },
    currentStage: 4,
    completed: true,
  });
}

/** @deprecated Prefer STUDENT_PORTAL_PREFIXES from `@/lib/routes`. */
export const STUDENT_APP_PREFIXES = STUDENT_PORTAL_PREFIXES;
