"use client";

import { Check, Circle } from "lucide-react";
import type { ProgressMilestone } from "@/lib/progress/types";
import { ProgressSection } from "@/components/progress/shared";
import { cn } from "@/lib/cn";

export function MilestoneTracker({
  milestones,
}: {
  milestones: ProgressMilestone[];
}) {
  return (
    <ProgressSection title="Milestones">
      <ol className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-1">
        {milestones.map((m, idx) => {
          const achieved = m.achieved;
          const next =
            !achieved && milestones.slice(0, idx).every((x) => x.achieved);
          return (
            <li key={m.id} className="flex items-center gap-3">
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-full border",
                  achieved
                    ? "border-transparent bg-success text-on-primary"
                    : next
                      ? "border-transparent bg-primary text-on-primary"
                      : "border-line bg-sunken text-muted",
                )}
                title={`${m.title} (${m.threshold}%)`}
              >
                {achieved ? <Check size={16} aria-hidden /> : <Circle size={14} aria-hidden />}
              </span>
              <div className="min-w-0">
                <p className="type-label m-0 text-ink">{m.title}</p>
                <p className="type-caption mt-0.5 mb-0 text-muted">
                  {m.threshold}%
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </ProgressSection>
  );
}
