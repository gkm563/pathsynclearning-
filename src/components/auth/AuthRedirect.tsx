"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { resolvePostAuthPath } from "@/lib/auth-routing";
import { authContinueWithRole, routes } from "@/lib/routes";

type Props = {
  /** Role hint when syncing / resolving destination */
  role?: string;
  /** If true, only redirect when already signed in (sign-in/sign-up pages) */
  whenSignedIn?: boolean;
  /** If true, send incomplete onboarding away from dashboard/platform */
  requireCompletedOnboarding?: boolean;
  /** If true, send completed users away from onboarding screens */
  requireIncompleteOnboarding?: boolean;
};

/**
 * Client-side auth destination guard.
 * - Signed-in on /sign-in|/sign-up → /auth/continue (resolver lives there)
 * - Incomplete onboarding on portal → onboarding stage
 * - Completed onboarding on stage pages → dashboard
 */
export default function AuthRedirect({
  role = "student",
  whenSignedIn = false,
  requireCompletedOnboarding = false,
  requireIncompleteOnboarding = false,
}: Props) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [checking, setChecking] = useState(
    whenSignedIn || requireCompletedOnboarding || requireIncompleteOnboarding,
  );

  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;

    (async () => {
      if (whenSignedIn) {
        if (!isSignedIn) {
          if (!cancelled) setChecking(false);
          return;
        }
        // Server /auth/continue owns destination (avoids client session races).
        window.location.replace(authContinueWithRole(role));
        return;
      }

      if (!isSignedIn) {
        if (requireCompletedOnboarding || requireIncompleteOnboarding) {
          router.replace(routes.auth.signIn);
          return;
        }
        if (!cancelled) setChecking(false);
        return;
      }

      const path = await resolvePostAuthPath(role);
      if (cancelled) return;

      if (requireCompletedOnboarding && path.startsWith(routes.onboarding.root)) {
        router.replace(path);
        return;
      }

      if (requireIncompleteOnboarding && path === routes.app.dashboard) {
        router.replace(routes.app.dashboard);
        return;
      }

      setChecking(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [
    isLoaded,
    isSignedIn,
    role,
    whenSignedIn,
    requireCompletedOnboarding,
    requireIncompleteOnboarding,
    router,
  ]);

  if (!checking) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-[var(--bg-main)]">
      <p className="font-sans text-sm text-[var(--text-muted)]">Redirecting…</p>
    </div>
  );
}
