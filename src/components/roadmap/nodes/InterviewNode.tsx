"use client";

import { Handle, Position } from "@xyflow/react";
import { Check, Lock, Mic } from "lucide-react";

export default function InterviewNode({ data }: { data: any }) {
  const label = data.label ?? data.title;
  const status = data.status || "locked";
  const onClick = data.onClick;
  const isCompleted = status === "completed" || status === "skipped";
  const isLocked = status === "locked";

  return (
    <div
      onClick={() => onClick?.()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border-2 p-3"
      style={{
        width: 240,
        minHeight: 92,
        background: isCompleted ? "var(--success-soft)" : "var(--surface)",
        borderColor: isLocked ? "var(--border-light)" : "var(--primary)",
        cursor: "pointer",
        opacity: isLocked ? 0.75 : 1,
        boxShadow: isLocked ? undefined : "0 0 28px var(--primary-soft)",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ visibility: "hidden" }} />
      <div className="mb-1 flex items-center gap-2 text-primary">
        {isCompleted ? <Check size={16} /> : isLocked ? <Lock size={16} /> : <Mic size={16} />}
        <span className="type-overline">Final interview</span>
      </div>
      <div className="type-label text-center text-ink">{label}</div>
      <div className="type-caption mt-1 text-center text-muted">
        {isLocked ? "Finish the path first" : isCompleted ? "Certified" : "Test if you are ready"}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ visibility: "hidden" }} />
    </div>
  );
}
