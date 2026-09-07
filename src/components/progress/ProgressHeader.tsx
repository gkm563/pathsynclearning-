"use client";

import { PageHeader, Segmented } from "@/components/ui";
import type { ProgressRange } from "@/lib/progress/types";

const OPTIONS: { id: ProgressRange; label: string }[] = [
  { id: "week", label: "This week" },
  { id: "month", label: "This month" },
  { id: "all", label: "All time" },
];

export function ProgressHeader({
  range,
  onRangeChange,
}: {
  range: ProgressRange;
  onRangeChange: (range: ProgressRange) => void;
}) {
  return (
    <PageHeader
      eyebrow="Overview"
      title="Progress"
      description="How far you've come — assessments, milestones and the next move worth making."
      actions={
        <Segmented
          items={OPTIONS}
          value={range}
          onChange={onRangeChange}
          ariaLabel="Time range"
        />
      }
    />
  );
}
