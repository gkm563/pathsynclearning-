"use client";

import React from "react";
import { Search } from "lucide-react";
import type { MemoryFilter } from "@/lib/memory/types";
import { MEMORY_FILTERS } from "@/lib/memory/types";

const FILTER_LABELS: Record<MemoryFilter, string> = {
  all: "All",
  learning: "Learning",
  skills: "Skills",
  projects: "Projects",
  challenges: "Challenges",
  mentorship: "Mentorship",
  collaboration: "Collaboration",
  achievements: "Achievements",
  events: "Events",
  career: "Career",
  certifications: "Certifications",
  notes: "Notes",
  milestones: "Milestones",
};

export function MemorySearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
      <Search
        size={16}
        style={{
          position: "absolute",
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--text-light)",
        }}
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search memories..."
        aria-label="Search memories"
        style={{
          width: "100%",
          padding: "11px 12px 11px 36px",
          borderRadius: 12,
          border: "1.5px solid var(--border-light)",
          background: "var(--bg-card)",
          color: "var(--text-main)",
          fontFamily: "Outfit, sans-serif",
          fontSize: 14,
        }}
      />
    </div>
  );
}

export function MemoryFilters({
  value,
  onChange,
}: {
  value: MemoryFilter;
  onChange: (v: MemoryFilter) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 12,
      }}
      role="tablist"
      aria-label="Memory filters"
    >
      {MEMORY_FILTERS.map((f) => {
        const active = f === value;
        return (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(f)}
            style={{
              borderRadius: 999,
              border: active
                ? "1.5px solid var(--purple)"
                : "1.5px solid var(--border-light)",
              background: active ? "rgba(108,99,255,0.1)" : "var(--bg-card)",
              color: active ? "var(--purple)" : "var(--text-muted)",
              padding: "7px 12px",
              fontFamily: "Outfit, sans-serif",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {FILTER_LABELS[f]}
          </button>
        );
      })}
    </div>
  );
}
