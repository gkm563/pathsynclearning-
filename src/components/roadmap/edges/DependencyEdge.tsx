"use client";

import { BaseEdge, getBezierPath, type EdgeProps } from "@xyflow/react";

export default function DependencyEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const status = (data as { status?: string } | undefined)?.status || "locked";

  const stroke =
    status === "completed"
      ? "var(--success)"
      : status === "in_progress"
        ? "var(--primary)"
        : "var(--roadmap-edge)";

  return (
    <BaseEdge
      path={edgePath}
      markerEnd={markerEnd}
      style={{
        ...style,
        fill: "none",
        stroke,
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeDasharray: status === "in_progress" ? "8 6" : undefined,
      }}
    />
  );
}
