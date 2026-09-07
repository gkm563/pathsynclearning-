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
