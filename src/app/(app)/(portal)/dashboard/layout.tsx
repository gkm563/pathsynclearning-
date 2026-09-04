import type { ReactNode } from "react";

/**
 * Dashboard segment layout — content only.
 *
 * Portal chrome (header/sidebar) lives in `(portal)/layout.tsx`.
 * Never wrap children in PortalShell / DashboardLayout here.
 */
export default function DashboardSegmentLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
