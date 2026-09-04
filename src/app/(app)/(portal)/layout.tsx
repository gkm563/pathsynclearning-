import type { ReactNode } from "react";
import { StudentProvider } from "@/components/dashboard/StudentContext";
import PortalShell from "@/components/dashboard/PortalShell";
import { requireStudentPortal } from "@/lib/server-auth";

/**
 * Student portal root layout.
 *
 * THIS is the single owner of product chrome (header / sidebar / main).
 * Do not mount PortalShell / DashboardLayout again in nested layouts or views.
 */
export default async function PortalLayout({ children }: { children: ReactNode }) {
  await requireStudentPortal();

  return (
    <StudentProvider>
      <PortalShell>{children}</PortalShell>
    </StudentProvider>
  );
}
