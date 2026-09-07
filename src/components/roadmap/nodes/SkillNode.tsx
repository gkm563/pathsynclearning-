"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Lock, BookOpen, Check, Play, SkipForward } from "lucide-react";
import { cn } from "@/lib/cn";

export default function SkillNode({ data }: { data: any }) {
  const { status, estimatedHours, onClick } = data;
  const label = data.label ?? data.title;
  const blurb = typeof data.description === "string" ? data.description : "";
  const outcomes = Array.isArray(data.learningOutcomes) ? data.learningOutcomes.length : 0;
  const resources = Array.isArray(data.resources) ? data.resources.length : 0;

  let borderColor = "var(--border-light)";
  let bg = "var(--surface)";
  let Icon = BookOpen;
  let iconColor = "var(--text-muted)";
  let opacity = 1;

  if (status === "locked") {
    bg = "var(--bg-alt)";
    Icon = Lock;
  } else if (status === "available") {
    borderColor = "var(--primary)";
    iconColor = "var(--primary)";
  } else if (status === "in_progress") {
    borderColor = "var(--primary)";
    Icon = Play;
    iconColor = "var(--primary)";
    bg = "var(--surface)";
  } else if (status === "completed") {
    bg = "var(--success-soft)";
    borderColor = "var(--success)";
    Icon = Check;
    iconColor = "var(--success)";
  } else if (status === "skipped") {
    opacity = 0.6;
    Icon = SkipForward;
  }

  return (
    <div
      onClick={() => onClick && onClick()}
      className={cn(
        "flex flex-col gap-1.5 rounded-[var(--radius-lg)] border-2 p-3 transition-[box-shadow,opacity] duration-200",
        status === "skipped" && "line-through",
      )}
      style={{
        width: 260,
        minHeight: 118,
        background: bg,
        borderColor,
        cursor: "pointer",
        opacity,
        boxShadow:
          status === "in_progress"
            ? "0 0 16px var(--primary-border)"
            : "var(--shadow-sm)",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ visibility: "hidden" }} />

      <div className="flex items-center gap-2">
        <Icon size={16} color={iconColor} />
        <span className="type-label truncate text-ink">{label}</span>
      </div>

      {blurb ? (
        <div className="type-caption line-clamp-2 text-muted">{blurb}</div>
      ) : null}

      <div className="mt-auto flex items-center justify-between">
        <span className="type-caption text-muted">
          {resources ? `${resources} resources` : ""}
          {outcomes ? ` · ${outcomes} outcomes` : ""}
        </span>
        {estimatedHours ? (
          <span className="type-caption type-numeric rounded-full bg-sunken px-1.5 py-0.5 text-muted">
            {estimatedHours}h
          </span>
        ) : null}
      </div>

      <Handle type="source" position={Position.Bottom} style={{ visibility: "hidden" }} />
    </div>
  );
}
