import type { ReactNode } from "react";
import { PageSkeleton } from "@/components/ui";

/**
 * Portal route-transition skeleton.
 *
 * Renders inside `PortalShell`'s `<main>`, which already owns the max-width
 * and padding — the previous version re-applied both and double-padded every
 * navigation, so content visibly shifted left when the real page arrived.
 */
export default function PortalLoading(): ReactNode {
  return <PageSkeleton />;
}
