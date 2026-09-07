"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Card } from "@/components/ui";

export const PROGRESS_COLS = {
  primary: "var(--primary)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--error)",
  info: "var(--info)",
  muted: "var(--muted)",
} as const;

/** @deprecated Prefer Card + Tailwind. Kept for remaining progress widgets. */
export const cardStyle = {
  background: "var(--surface)",
  border: "1px solid var(--line)",
  borderRadius: "var(--radius-lg)",
  padding: 22,
} as const;

export function SkeletonBlock({
  height = 16,
  width = "100%",
  radius = 10,
  className,
}: {
  height?: number | string;
  width?: number | string;
  radius?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-[shShimmer_1.4s_ease-in-out_infinite] bg-[linear-gradient(90deg,var(--line)_25%,var(--bg-alt)_50%,var(--line)_75%)] bg-[length:200%_100%]",
        className,
      )}
      style={{
        height,
        width,
        borderRadius: radius,
      }}
    />
  );
}

export function ProgressSection({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("min-w-0", className)}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="type-h4 m-0 text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </Card>
  );
}
