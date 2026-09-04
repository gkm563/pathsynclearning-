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
import { EmptyState } from "@/components/ui/primitives";
import { ProgressSection, PROGRESS_COLS } from "@/components/progress/shared";

function iconFor(type: string) {
  const t = type.toUpperCase();
  if (t.includes("FAIL") || t.includes("REJECT")) {
    return { Icon: XCircle, color: PROGRESS_COLS.danger };
  }
  if (t.includes("START") || t.includes("ATTEMPT")) {
    return { Icon: Play, color: PROGRESS_COLS.primary };
  }
  if (t.includes("MILESTONE") || t.includes("ACHIEVEMENT")) {
    return { Icon: Sparkles, color: PROGRESS_COLS.warning };
  }
  if (t.includes("PASS") || t.includes("COMPLETE") || t.includes("SUBMIT")) {
    return { Icon: CheckCircle2, color: PROGRESS_COLS.success };
  }
  return { Icon: ArrowRight, color: PROGRESS_COLS.info };
}

export function ActivityTimeline({
  activity,
}: {
  activity: ProgressActivityItem[];
}) {
  const router = useRouter();

  return (
    <ProgressSection title="Recent Activity">
      {activity.length === 0 ? (
        <EmptyState
          title="No activity yet"
          description="Your assessment attempts, submissions, and milestones will appear here."
        />
      ) : (
        <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {activity.map((item, idx) => {
            const { Icon, color } = iconFor(item.type);
            return (
              <li
                key={item.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "28px 1fr",
                  gap: 12,
                  paddingBottom: idx === activity.length - 1 ? 0 : 16,
                  position: "relative",
                }}
              >
                {idx < activity.length - 1 ? (
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: 13,
                      top: 24,
                      bottom: 0,
                      width: 2,
                      background: "var(--border-light)",
                    }}
                  />
                ) : null}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    display: "grid",
                    placeItems: "center",
                    background: `${color}18`,
                    color,
                    zIndex: 1,
                  }}
                >
                  <Icon size={14} />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (item.href) router.push(item.href);
                  }}
                  style={{
                    textAlign: "left",
                    border: "none",
                    background: "transparent",
                    padding: 0,
                    cursor: item.href ? "pointer" : "default",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      color: "var(--text-main)",
                      fontFamily: "Outfit, sans-serif",
                      fontSize: 14,
                    }}
                  >
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                    {formatRelativeTime(item.occurredAt)}
                  </div>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </ProgressSection>
  );
}
