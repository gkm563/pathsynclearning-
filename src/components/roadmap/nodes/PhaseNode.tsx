"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Check, Lock, Play } from "lucide-react";
import { cn } from "@/lib/cn";

export default function PhaseNode({ data }: { data: any }) {
  const label = data.label ?? data.title;
  const phaseNumber = data.phaseNumber;
  const status = data.status || "locked";
  const onClick = data.onClick;

  const isCompleted = status === "completed" || status === "skipped";
  const isLocked = status === "locked";
  const isInProgress = status === "in_progress";
  const isAvailable = status === "available";

  let border = "2px dashed var(--border-strong)";
  if (isCompleted) border = "2px solid var(--success)";
  else if (isInProgress || isAvailable) border = "2px solid var(--primary)";

  return (
    <div
      onClick={() => onClick?.()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      className="flex flex-col items-center rounded-[var(--radius-md)] px-3 py-2"
      style={{
        width: 240,
        background: isCompleted ? "var(--success-soft)" : "var(--bg-card)",
        border,
        cursor: "pointer",
        opacity: isLocked ? 0.75 : 1,
        boxShadow: data.expanded
          ? "0 0 0 3px var(--primary-soft), var(--shadow-md)"
          : isAvailable || isInProgress
            ? "0 0 0 3px var(--primary-soft)"
            : undefined,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ visibility: "hidden" }} />

      <div className="mb-1 flex items-center gap-1.5">
        {isCompleted ? (
          <Check size={12} color="var(--success)" />
        ) : isLocked ? (
          <Lock size={12} color="var(--text-muted)" />
        ) : (
          <Play size={12} color="var(--primary)" />
        )}
        <span
          className={cn(
            "type-overline",
            isCompleted ? "text-success" : isLocked ? "text-muted" : "text-primary",
          )}
        >
          Phase {phaseNumber || ""} · {String(status).replace("_", " ")}
        </span>
      </div>

      <div className="type-h4 text-center text-ink">{label}</div>
      {data.childCount ? (
        <div className="type-caption mt-1 text-center text-muted">
          {data.expanded ? "Click to collapse" : `${data.childCount} topics — click to expand`}
        </div>
      ) : (
        <div className="type-caption mt-1.5 text-center text-muted">
          {isLocked
            ? "Complete the node above first"
            : isCompleted
              ? "Completed"
              : "Click → Mark Complete to unlock skills"}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ visibility: "hidden" }} />
    </div>
  );
}
