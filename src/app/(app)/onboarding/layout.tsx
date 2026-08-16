"use client";

import type { ReactNode } from "react";
import AuthRedirect from "@/components/auth/AuthRedirect";

/** Onboarding stages — eject users who already completed. */
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AuthRedirect role="student" requireIncompleteOnboarding />
      {children}
    </>
  );
}
