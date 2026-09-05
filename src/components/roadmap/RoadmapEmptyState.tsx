"use client";

import React from "react";
import { Map } from "lucide-react";

export default function RoadmapEmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div
      style={{
        maxWidth: 560,
        margin: "0 auto",
        padding: "80px 24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: "rgba(108,99,255,0.12)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <Map size={28} color="#6c63ff" />
      </div>
      <h1
        style={{
          fontFamily: "Outfit",
          fontSize: 28,
          fontWeight: 800,
          color: "var(--text-main)",
          margin: 0,
        }}
      >
        No roadmap yet
      </h1>
      <p
        style={{
          fontFamily: "Outfit",
          fontSize: 16,
          color: "var(--text-muted)",
          margin: 0,
          lineHeight: 1.5,
          maxWidth: 420,
        }}
      >
        You skipped this for later. Create a company-specific or general roadmap whenever you are ready.
      </p>
      <button
        type="button"
        onClick={onCreate}
        style={{
          marginTop: 8,
          padding: "12px 24px",
          borderRadius: 10,
          border: "none",
          background: "#6c63ff",
          color: "#fff",
          fontFamily: "Outfit",
          fontWeight: 700,
          fontSize: 16,
          cursor: "pointer",
        }}
      >
        Create a roadmap
      </button>
    </div>
  );
}
