"use client";

import React from "react";
import { ArrowRight, Lock, Maximize2 } from "lucide-react";
import { MEMORY_TYPE_META } from "@/lib/memory/constants";
import type { TimelineItem } from "@/lib/memory/types";
import { RichStudyText } from "@/components/ai/RichStudyText";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function metaLine(item: TimelineItem): string[] {
  const m = item.metadata || {};
  const lines: string[] = [];
  if (typeof m.score === "number") lines.push(`Score: ${m.score}%`);
  if (typeof m.difficulty === "string") lines.push(`Difficulty: ${m.difficulty}`);
  if (typeof m.previousBest === "number") lines.push(`Previous Best: ${m.previousBest}%`);
  if (typeof m.checklistPct === "number") lines.push(`Checklist: ${m.checklistPct}%`);
  if (typeof m.newGoal === "string") lines.push(`New Goal: ${m.newGoal}`);
  if (typeof m.previousGoal === "string") lines.push(`Previous: ${m.previousGoal}`);
  if (m.personalBestLabel) lines.push(String(m.personalBestLabel));
  return lines.slice(0, 3);
}

export function MemoryCard({
  item,
  onOpen,
}: {
  item: TimelineItem;
  onOpen: (item: TimelineItem) => void;
}) {
  const meta = MEMORY_TYPE_META[item.type] || {
    label: item.type,
    emoji: "✦",
    color: "var(--purple)",
  };
  const isNote = item.kind === "note" || item.type === "PERSONAL_NOTE";
  const lines = metaLine(item);

  return (
    <article
      onClick={() => onOpen(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen(item);
      }}
      role="button"
      tabIndex={0}
      style={{
        borderRadius: 16,
        border: isNote
          ? "1.5px dashed rgba(100,116,139,0.4)"
          : "1.5px solid var(--border-light)",
        background: isNote ? "rgba(100,116,139,0.05)" : "var(--bg-card)",
        padding: 16,
        cursor: "pointer",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
          color: meta.color,
          fontSize: 12,
          fontWeight: 800,
          fontFamily: "Outfit, sans-serif",
        }}
      >
        <span aria-hidden>{meta.emoji}</span>
        <span>{meta.label}</span>
        {item.visibility === "private" ? (
          <Lock size={12} style={{ marginLeft: "auto", color: "var(--text-light)" }} />
        ) : null}
      </div>
      <h3
        style={{
          margin: 0,
          fontFamily: "Outfit, sans-serif",
          fontSize: 16,
          fontWeight: 800,
          color: "var(--text-main)",
        }}
      >
        {item.title}
      </h3>
      {item.description ? (
        <div
          style={{
            margin: "8px 0 0",
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          <RichStudyText text={item.description} compact />
        </div>
      ) : null}
      <div
        style={{
          marginTop: 10,
          fontSize: 12,
          color: "var(--text-light)",
          display: "grid",
          gap: 2,
        }}
      >
        <span>{formatDate(item.occurredAt)}</span>
        {lines.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onOpen(item);
        }}
        style={{
          marginTop: 12,
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          color: "var(--purple)",
          fontSize: 12,
          fontWeight: 700,
          fontFamily: "Outfit, sans-serif",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
      >
        {isNote ? <Maximize2 size={13} /> : null}
        {isNote ? "Open full note" : "View Details"} <ArrowRight size={13} />
      </button>
    </article>
  );
}
