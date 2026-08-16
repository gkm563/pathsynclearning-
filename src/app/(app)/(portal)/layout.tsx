"use client";

import type { ReactNode } from "react";
import AuthRedirect from "@/components/auth/AuthRedirect";
import { StudentProvider } from "@/components/dashboard/StudentContext";

/**
 * Student portal shell: session + completed-onboarding gate, shared student data.
 * Onboarding lives outside this group so incomplete users can finish stages.
 */
export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <StudentProvider>
      <AuthRedirect role="student" requireCompletedOnboarding />
      {children}
    </StudentProvider>
  );
}
