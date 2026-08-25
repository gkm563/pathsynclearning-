import type { ReactNode } from "react";
import { StudentProvider } from "@/components/dashboard/StudentContext";
import { requireStudentPortal } from "@/lib/server-auth";

/**
 * Student portal shell: session + student role, shared student data.
 */
export default async function PortalLayout({ children }: { children: ReactNode }) {
  await requireStudentPortal();

  return (
    <StudentProvider>
      {children}
    </StudentProvider>
  );
}
