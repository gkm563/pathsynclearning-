"use client";

import { CheckCircle2, CircleDashed, Loader2, Percent } from "lucide-react";
import type { ProgressSummary } from "@/lib/progress/types";
import { StatCard } from "@/components/ui";

export function ProgressStats({ summary }: { summary: ProgressSummary }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard
        label="Completed"
        value={summary.completed}
        hint="Finished tasks"
        icon={<CheckCircle2 size={16} aria-hidden />}
      />
      <StatCard
        label="In progress"
        value={summary.inProgress}
        hint="Currently open"
        icon={<Loader2 size={16} aria-hidden />}
      />
      <StatCard
        label="Pending"
        value={summary.pending}
        hint="Not started"
        icon={<CircleDashed size={16} aria-hidden />}
      />
      <StatCard
        label="Average score"
        value={
          summary.averageScore === null || summary.averageScore === undefined
            ? "—"
            : `${summary.averageScore}%`
        }
        hint="Across assessments"
        icon={<Percent size={16} aria-hidden />}
      />
    </div>
  );
}
