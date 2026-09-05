"use client";

import React from "react";

export function MemoryLaneHeader({
  onOpenSettings,
  onExport,
}: {
  onOpenSettings: () => void;
  onExport: () => void;
}) {
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
              maxWidth: 480,
            }}
          >
            Three lanes for your journey: Roadmap, Challenges, and General Memory Lane.
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
