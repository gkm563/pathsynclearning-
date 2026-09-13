import { requireStudentPortal } from "@/lib/server-auth";
import type { ReactNode } from "react";

export default async function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireStudentPortal();
  return children;
}
