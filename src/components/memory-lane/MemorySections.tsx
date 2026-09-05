"use client";

import React from "react";
import { Map, Trophy, BookOpen } from "lucide-react";
import type { MemorySection } from "@/lib/memory/types";
import { MEMORY_SECTION_META } from "@/lib/memory/sections";

const ICONS: Record<MemorySection, React.ReactNode> = {
  roadmap: <Map size={18} />,
  challenges: <Trophy size={18} />,
  general: <BookOpen size={18} />,
};

export function MemorySections({
  value,
  counts,
  onChange,
}: {
  value: MemorySection;
  counts?: { roadmap: number; challenges: number; general: number };
  onChange: (section: MemorySection) => void;
}) {
  const sections: MemorySection[] = ["roadmap", "challenges", "general"];

  return (
    <div
      role="tablist"
      aria-label="Memory Lane sections"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 10,
        margin: "4px 0 4px",
      }}
    >
      {sections.map((id) => {
        const active = id === value;
        const meta = MEMORY_SECTION_META[id];
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            style={{
              textAlign: "left",
              borderRadius: 16,
              border: active
                ? "1.5px solid var(--purple)"
                : "1.5px solid var(--border-light)",
              background: active ? "rgba(108,99,255,0.1)" : "var(--bg-card)",
              color: "var(--text-main)",
              padding: "14px 16px",
              cursor: "pointer",
              fontFamily: "Outfit, sans-serif",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                color: active ? "var(--purple)" : "var(--text-muted)",
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontWeight: 800,
                  fontSize: 14,
                }}
              >
                {ICONS[id]}
                {meta.label}
              </span>
              <span style={{ fontWeight: 800, fontSize: 16 }}>
                {counts?.[id] ?? 0}
              </span>
            </div>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 12,
                lineHeight: 1.45,
                color: "var(--text-muted)",
                fontWeight: 500,
              }}
            >
              {meta.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
