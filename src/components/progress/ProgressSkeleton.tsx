"use client";

import { CardGridSkeleton, HeaderSkeleton, StatGridSkeleton } from "@/components/ui";

export function ProgressSkeleton() {
  return (
    <div role="status" aria-label="Loading progress">
      <span className="sr-only">Loading progress…</span>
      <HeaderSkeleton />
      <StatGridSkeleton className="mb-5" />
      <CardGridSkeleton count={3} />
    </div>
  );
}
