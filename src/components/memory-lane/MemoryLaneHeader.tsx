"use client";

import React from "react";
import type { MemoryStats } from "@/lib/memory/types";

export function MemoryLaneHeader({
  stats,
  onOpenSettings,
  onExport,
}: {
  stats: MemoryStats | null;
  onOpenSettings: () => void;
  onExport: () => void;
}) {
  const cards = [
    { label: "Milestones", value: stats?.milestones ?? 0 },
    { label: "Skills", value: stats?.skills ?? 0 },
    { label: "Projects", value: stats?.projects ?? 0 },
    { label: "Achievements", value: stats?.achievements ?? 0 },
  ];

  return (
    <header style={{ marginBottom: 28 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "flex-end",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--purple)",
            }}
          >
            PathEd Journey
          </p>
          <h1
            style={{
              margin: "6px 0 0",
              fontFamily: "Outfit, sans-serif",
              fontSize: "clamp(28px, 4vw, 40px)",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--text-main)",
            }}
          >
            My Memory Lane
          </h1>
          <p
            style={{
              margin: "8px 0 0",
              color: "var(--text-muted)",
              fontSize: 15,
              maxWidth: 420,
            }}
          >
            Your journey, remembered.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={onExport}
            style={ghostBtn}
          >
            Export My Journey
          </button>
          <button type="button" onClick={onOpenSettings} style={ghostBtn}>
            Memory Settings
          </button>
        </div>
      </div>

      <div
        style={{
          marginTop: 20,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 12,
        }}
      >
        {cards.map((c) => (
          <div
            key={c.label}
            style={{
              borderRadius: 14,
              border: "1.5px solid var(--border-light)",
              background: "var(--bg-card)",
              padding: "14px 16px",
            }}
          >
            <div
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: 24,
                fontWeight: 800,
                color: "var(--text-main)",
              }}
            >
              {c.value}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
              {c.label}
            </div>
          </div>
        ))}
      </div>
    </header>
  );
}

const ghostBtn: React.CSSProperties = {
  borderRadius: 10,
  border: "1.5px solid var(--border-light)",
  background: "var(--bg-card)",
  color: "var(--text-main)",
  padding: "8px 12px",
  fontFamily: "Outfit, sans-serif",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
};
