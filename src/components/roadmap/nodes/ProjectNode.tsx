"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Rocket } from "lucide-react";

export default function ProjectNode({ data }: { data: any }) {
  const { onClick } = data;
  const label = data.label ?? data.title;
  const borderColor = "var(--accent)";

  return (
    <div
      onClick={() => onClick && onClick()}
      className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border-2 bg-surface p-3"
      style={{
        width: 240,
        height: 90,
        borderColor,
        cursor: "pointer",
        boxShadow: "0 4px 16px var(--accent-soft)",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ visibility: "hidden" }} />

      <div className="mb-2 flex items-center gap-2">
        <Rocket size={18} color={borderColor} />
        <span className="type-overline" style={{ color: borderColor }}>
          Project
        </span>
      </div>

      <div className="type-h4 text-center text-ink">{label}</div>

      <Handle type="source" position={Position.Bottom} style={{ visibility: "hidden" }} />
    </div>
  );
}
