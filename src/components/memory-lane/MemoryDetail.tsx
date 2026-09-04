"use client";

import React from "react";
import { ExternalLink, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { MEMORY_TYPE_META } from "@/lib/memory/constants";
import type { TimelineItem } from "@/lib/memory/types";
import { Button } from "@/components/ui/primitives";

export function MemoryDetail({
  item,
  onClose,
  onEditNote,
  onDeleteNote,
}: {
  item: TimelineItem & { note?: { id: string; content: string; updatedAt?: string } | null };
  onClose: () => void;
  onEditNote?: () => void;
  onDeleteNote?: () => void;
}) {
  const router = useRouter();
  const meta = MEMORY_TYPE_META[item.type] || {
    label: item.type,
    emoji: "✦",
    color: "var(--purple)",
  };
  const m = item.metadata || {};
  const isNote = item.kind === "note" || item.type === "PERSONAL_NOTE";

  const rows: Array<[string, string]> = [];
  if (typeof m.score === "number") rows.push(["Score", `${m.score}%`]);
  if (typeof m.difficulty === "string") rows.push(["Difficulty", String(m.difficulty)]);
  if (typeof m.previousBest === "number") rows.push(["Previous Best", `${m.previousBest}%`]);
  if (typeof m.checklistPct === "number") rows.push(["Checklist", `${m.checklistPct}%`]);
  if (typeof m.assessmentType === "string") rows.push(["Assessment", String(m.assessmentType)]);
  if (typeof m.category === "string") rows.push(["Category", String(m.category)]);
  if (typeof m.repository === "string") rows.push(["Repository", String(m.repository)]);
  if (typeof m.previousGoal === "string") rows.push(["Previous Goal", String(m.previousGoal)]);
  if (typeof m.newGoal === "string") rows.push(["New Goal", String(m.newGoal)]);
  if (Array.isArray(m.topics) && m.topics.length) rows.push(["Topics", m.topics.join(", ")]);
  if (Array.isArray(m.skills) && m.skills.length) rows.push(["Skills", m.skills.join(", ")]);
  if (m.personalBestLabel) rows.push(["Highlight", String(m.personalBestLabel)]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        background: "rgba(15,23,42,0.4)",
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <aside
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(440px, 100%)",
          height: "100%",
          background: "var(--bg-card)",
          borderLeft: "1px solid var(--border-light)",
          boxShadow: "-12px 0 40px rgba(15,23,42,0.18)",
          padding: 24,
          overflowY: "auto",
          fontFamily: "Outfit, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div style={{ color: meta.color, fontWeight: 800, fontSize: 13 }}>
            {meta.emoji} {meta.label}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close detail"
            style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text-muted)" }}
          >
            <X size={18} />
          </button>
        </div>

        <h2 style={{ margin: "12px 0 0", fontSize: 24, fontWeight: 800 }}>{item.title}</h2>
        <p style={{ margin: "8px 0 0", color: "var(--text-light)", fontSize: 13 }}>
          {new Date(item.occurredAt).toLocaleString()}
        </p>

        {item.description ? (
          <p
            style={{
              marginTop: 16,
              color: "var(--text-muted)",
              lineHeight: 1.6,
              fontStyle: isNote ? "italic" : "normal",
              fontFamily: isNote ? "Inter, sans-serif" : "Outfit, sans-serif",
            }}
          >
            {isNote ? `“${item.description}”` : item.description}
          </p>
        ) : null}

        {rows.length ? (
          <dl style={{ marginTop: 20, display: "grid", gap: 10 }}>
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt style={{ fontSize: 11, fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase" }}>
                  {k}
                </dt>
                <dd style={{ margin: "2px 0 0", fontSize: 14, color: "var(--text-main)" }}>{v}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <div style={{ marginTop: 16, fontSize: 13, color: "var(--text-muted)" }}>
          Visibility: {item.visibility === "public" ? "Public" : "Private"}
        </div>

        <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {item.href ? (
            <Button
              onClick={() => {
                router.push(item.href!);
                onClose();
              }}
            >
              Open Related Activity <ExternalLink size={14} />
            </Button>
          ) : null}
          {isNote && onEditNote ? (
            <Button variant="secondary" onClick={onEditNote}>
              Edit
            </Button>
          ) : null}
          {isNote && onDeleteNote ? (
            <Button variant="danger" onClick={onDeleteNote}>
              Delete
            </Button>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
