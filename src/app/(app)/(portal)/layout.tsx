import type { ReactNode } from "react";
import { StudentProvider } from "@/components/dashboard/StudentContext";
import { requireStudentPortal } from "@/lib/server-auth";

/**
 * Student portal shell: session + completed-onboarding gate, shared student data.
 * Onboarding lives outside this group so incomplete users can finish stages.
 */
export default async function PortalLayout({ children }: { children: ReactNode }) {
  // Enforce server-side authorization boundary
  await requireStudentPortal();

  return (
    <StudentProvider>
      {children}
    </StudentProvider>
  );
}
