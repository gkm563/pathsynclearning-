"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Trophy, Flag } from "lucide-react";

export default function MilestoneNode({ data }: { data: any }) {
  const { status, onClick } = data;
  const label = data.label ?? data.title;

  const isCompleted = status === "completed";
  const color = isCompleted ? "var(--warning)" : "var(--text-muted)";

  return (
    <div
      onClick={() => onClick && onClick()}
      className="flex items-center justify-center rounded-full border-2 bg-surface px-4"
      style={{
        width: 180,
        height: 70,
        borderColor: isCompleted ? color : "var(--border-strong)",
        cursor: "pointer",
        boxShadow: isCompleted
          ? "0 4px 16px var(--warning-soft)"
          : "var(--shadow-xs)",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ visibility: "hidden" }} />

      <div className="flex items-center gap-2">
        {isCompleted ? <Trophy size={16} color={color} /> : <Flag size={16} color={color} />}
        <span className="type-label truncate text-ink">{label}</span>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ visibility: "hidden" }} />
    </div>
  );
}
