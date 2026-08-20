import type { ReactNode } from "react";
import { requireStudentOnboarding } from "@/lib/server-auth";

/** Onboarding stages — eject users who already completed. */
export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  // Enforce server-side authorization boundary
  await requireStudentOnboarding();

  return (
    <>
      {children}
    </>
  );
}
