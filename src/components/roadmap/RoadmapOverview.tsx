"use client";

import React from "react";
import type { RoadmapNode } from "@/types/roadmap";
import { computeRoadmapStats } from "@/lib/roadmap/stats";
import RoadmapSwitcher from "./RoadmapSwitcher";

export default function RoadmapOverview({
  roadmapId,
  roadmapTitle,
  targetCompany,
  nodes,
  progress,
  onSwitched,
  onCreateNew,
}: {
  roadmapId: string;
  roadmapTitle: string;
  targetCompany?: string | null;
  nodes: RoadmapNode[];
  progress: Map<string, string>;
  onSwitched?: () => void | Promise<void>;
  onCreateNew?: () => void;
}) {
  const stats = computeRoadmapStats(nodes, progress);

  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
        width: "max-content",
        maxWidth: "calc(100% - 32px)",
        background: "rgba(var(--bg-card-rgb, 255, 255, 255), 0.94)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1.5px solid var(--border-light)",
        borderRadius: 18,
        padding: "12px 18px",
        display: "flex",
        alignItems: "center",
        gap: 0,
        boxShadow: "0 8px 28px rgba(15, 23, 42, 0.08)",
        overflowX: "auto",
        overflowY: "hidden",
        scrollbarWidth: "none",
      }}
    >
      {onSwitched && onCreateNew ? (
        <>
          <div style={colStyle}>
            <RoadmapSwitcher
              activeRoadmapId={roadmapId}
              activeTitle={roadmapTitle}
              onSwitched={onSwitched}
              onCreateNew={onCreateNew}
              embedded
            />
          </div>
          <Divider />
        </>
      ) : null}

      {targetCompany ? (
        <>
          <div style={colStyle}>
            <span style={labelStyle}>COMPANY</span>
            <div style={{ ...valueStyle, marginTop: 4, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis" }}>
              {targetCompany}
            </div>
          </div>
          <Divider />
        </>
      ) : null}

      <div style={{ ...colStyle, minWidth: 148 }}>
        <span style={labelStyle}>PROGRESS</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
          <span
            style={{
              fontFamily: "Outfit",
              fontSize: 18,
              fontWeight: 800,
              color: "#00c9a7",
              lineHeight: 1,
              letterSpacing: "-0.02em",
              minWidth: 40,
            }}
          >
            {stats.completionPercent}%
          </span>
          <div
            style={{
              width: 84,
              height: 7,
              background: "var(--bg-alt)",
              borderRadius: 999,
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: `${stats.completionPercent}%`,
                height: "100%",
                background: "linear-gradient(90deg, #00c9a7, #2dd4bf)",
                borderRadius: 999,
                transition: "width 0.35s ease",
              }}
            />
          </div>
        </div>
      </div>

      <Divider />

      <div style={colStyle}>
        <span style={labelStyle}>NODES</span>
        <div style={{ ...valueStyle, marginTop: 4 }}>
          <span style={{ color: "var(--text-main)" }}>{stats.completedNodes}</span>
          <span style={{ color: "var(--text-muted)", fontWeight: 600 }}>
            {" "}
            / {stats.totalNodes}
          </span>
        </div>
      </div>

      <Divider />

      <div style={colStyle}>
        <span style={labelStyle}>TIME LEFT</span>
        <div style={{ ...valueStyle, marginTop: 4 }}>
          ~{stats.remainingHours}
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>
            {" "}
            hrs
          </span>
        </div>
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div
      aria-hidden
      style={{
        width: 1,
        height: 36,
        background: "var(--border-light)",
        margin: "0 16px",
        flexShrink: 0,
      }}
    />
  );
}

const colStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  flexShrink: 0,
};

const labelStyle: React.CSSProperties = {
  fontFamily: "Fira Code, monospace",
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.06em",
  color: "var(--text-muted)",
  lineHeight: 1,
};

const valueStyle: React.CSSProperties = {
  fontFamily: "Outfit",
  fontSize: 16,
  fontWeight: 700,
  color: "var(--text-main)",
  lineHeight: 1.15,
  whiteSpace: "nowrap",
};
