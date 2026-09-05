"use client";

import React from "react";
import { motion } from "framer-motion";
import { Map, Clock } from "lucide-react";

export default function RoadmapStartChoice({
  onCreate,
  onSkip,
}: {
  onCreate: () => void;
  onSkip: () => void;
}) {
  const card: React.CSSProperties = {
    flex: 1,
    minWidth: 240,
    padding: 24,
    borderRadius: 16,
    border: "2px solid var(--border-light)",
    backgroundColor: "var(--bg-alt)",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: "Outfit",
    color: "var(--text-main)",
    transition: "all 0.2s",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        backgroundColor: "var(--bg-card)",
        padding: 32,
        borderRadius: 16,
        border: "1px solid var(--border-light)",
      }}
    >
      <div>
        <div
          style={{
            fontSize: 24,
            fontWeight: "bold",
            fontFamily: "Outfit",
            color: "var(--text-main)",
          }}
        >
          Create a roadmap now?
        </div>
        <p
          style={{
            fontFamily: "Outfit",
            fontSize: 15,
            color: "var(--text-muted)",
            margin: "8px 0 0",
          }}
        >
          You can build a personalized path now, or skip and come back whenever you are ready.
        </p>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <button type="button" style={card} onClick={onCreate}>
          <Map size={28} color="#6c63ff" />
          <div style={{ fontWeight: 700, fontSize: 18, marginTop: 12 }}>Create a roadmap</div>
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.45 }}>
            Choose a company and role, or a general path, then answer a few questions so we can generate it.
          </div>
        </button>
        <button type="button" style={card} onClick={onSkip}>
          <Clock size={28} color="#00c9a7" />
          <div style={{ fontWeight: 700, fontSize: 18, marginTop: 12 }}>Skip for later</div>
          <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.45 }}>
            Explore the rest of PathEd first. You can start a roadmap from this page anytime.
          </div>
        </button>
      </div>
    </motion.div>
  );
}
