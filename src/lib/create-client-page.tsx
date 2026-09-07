import type { ComponentType } from "react";
import dynamic from "next/dynamic";
import { PageSkeleton } from "@/components/ui";

/**
 * App Router page helper: keeps the route module a Server Component while
 * code-splitting a heavy Client view. Do not add `"use client"` to pages that
 * only call this helper.
 *
 * The fallback is a full-page skeleton rather than a centred spinner so the
 * chunk load doesn't collapse the layout and then snap it back — see
 * `components/ui/feedback.tsx` for the reasoning.
 */
export function createClientPage(
  loader: () => Promise<{ default: ComponentType }>,
  options?: { skeleton?: "cards" | "list"; stats?: boolean },
) {
  return dynamic(loader, {
    loading: () => (
      <PageSkeleton
        variant={options?.skeleton ?? "cards"}
        stats={options?.stats ?? true}
      />
    ),
  });
}
