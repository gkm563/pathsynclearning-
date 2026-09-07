"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Target, Check, Lock, Play } from "lucide-react";

export default function GoalNode({ data }: { data: any }) {
  const label = data.label ?? data.title;
  const status = data.status || "available";
  const onClick = data.onClick;

  const isCompleted = status === "completed" || status === "skipped";
  const isLocked = status === "locked";
  const isInProgress = status === "in_progress";

  return (
    <div
      onClick={() => onClick?.()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] p-3"
      style={{
        width: 280,
        minHeight: 100,
        border: "2px solid transparent",
        backgroundImage: isCompleted
          ? "linear-gradient(var(--bg-card), var(--bg-card)), linear-gradient(var(--success), var(--success))"
          : "linear-gradient(var(--bg-card), var(--bg-card)), linear-gradient(var(--primary), var(--primary))",
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
        boxShadow: "0 8px 24px var(--primary-soft)",
        cursor: "pointer",
        opacity: isLocked ? 0.7 : 1,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ visibility: "hidden" }} />
      <div className="mb-1 flex items-center gap-2">
        {isCompleted ? (
          <Check size={20} color="var(--success)" />
        ) : isLocked ? (
          <Lock size={18} color="var(--text-muted)" />
        ) : isInProgress ? (
          <Play size={18} color="var(--primary)" />
        ) : (
          <Target size={20} color="var(--success)" />
        )}
        <span className="type-overline text-success">Your career goal</span>
      </div>
      <div className="type-h3 text-center text-ink">{label}</div>
      <div className="type-overline mt-1.5 text-muted">
        {isLocked ? "Locked — click for details" : "Click to open · Mark complete to unlock next"}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ visibility: "hidden" }} />
    </div>
  );
}
