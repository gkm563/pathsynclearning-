"use client";

import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ArrowRight,
  XCircle,
  Sparkles,
  Play,
} from "lucide-react";
import { formatRelativeTime } from "@/lib/progress/calculate";
import type { ProgressActivityItem } from "@/lib/progress/types";
import { EmptyState } from "@/components/ui";
import { ProgressSection } from "@/components/progress/shared";
import { cn } from "@/lib/cn";

function iconFor(type: string) {
  const t = type.toUpperCase();
  if (t.includes("FAIL") || t.includes("REJECT")) {
    return { Icon: XCircle, className: "bg-danger-soft text-danger" };
  }
  if (t.includes("START") || t.includes("ATTEMPT")) {
    return { Icon: Play, className: "bg-primary-soft text-primary" };
  }
  if (t.includes("MILESTONE") || t.includes("ACHIEVEMENT")) {
    return { Icon: Sparkles, className: "bg-[var(--warning-soft)] text-warning" };
  }
  if (t.includes("PASS") || t.includes("COMPLETE") || t.includes("SUBMIT")) {
    return { Icon: CheckCircle2, className: "bg-success-soft text-success" };
  }
  return { Icon: ArrowRight, className: "bg-info-soft text-info" };
}

export function ActivityTimeline({
  activity,
}: {
  activity: ProgressActivityItem[];
}) {
  const router = useRouter();

  return (
    <ProgressSection title="Recent activity">
      {activity.length === 0 ? (
        <EmptyState
          compact
          title="No activity yet"
          description="Your assessment attempts, submissions, and milestones will appear here."
        />
      ) : (
        <ol className="m-0 flex list-none flex-col p-0">
          {activity.map((item, idx) => {
            const { Icon, className } = iconFor(item.type);
            const clickable = Boolean(item.href);
            return (
              <li
                key={item.id}
                className={cn(
                  "relative grid grid-cols-[28px_minmax(0,1fr)] gap-3",
                  idx < activity.length - 1 && "pb-4",
                )}
              >
                {idx < activity.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute top-7 bottom-0 left-[13px] w-px bg-line"
                  />
                ) : null}
                <span
                  className={cn(
                    "relative z-[1] grid h-7 w-7 place-items-center rounded-full",
                    className,
                  )}
                >
                  <Icon size={14} aria-hidden />
                </span>
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => {
                    if (item.href) router.push(item.href);
                  }}
                  className={cn(
                    "rounded-[var(--radius-sm)] text-left",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    clickable ? "cursor-pointer" : "cursor-default",
                  )}
                >
                  <p className="type-label m-0 text-ink">{item.title}</p>
                  <p className="type-caption mt-1 mb-0 text-muted">
                    {formatRelativeTime(item.occurredAt)}
                  </p>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </ProgressSection>
  );
}
