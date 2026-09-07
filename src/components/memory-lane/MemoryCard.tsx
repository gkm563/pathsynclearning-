"use client";

import { ArrowRight, Lock, Maximize2 } from "lucide-react";
import { MEMORY_TYPE_META } from "@/lib/memory/constants";
import type { TimelineItem } from "@/lib/memory/types";
import { RichStudyText } from "@/components/ai/RichStudyText";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";

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
  if (typeof m.previousBest === "number")
    lines.push(`Previous Best: ${m.previousBest}%`);
  if (typeof m.checklistPct === "number")
    lines.push(`Checklist: ${m.checklistPct}%`);
  if (typeof m.newGoal === "string") lines.push(`New Goal: ${m.newGoal}`);
  if (typeof m.previousGoal === "string")
    lines.push(`Previous: ${m.previousGoal}`);
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
    emoji: "",
    color: "var(--primary)",
  };
  const isNote = item.kind === "note" || item.type === "PERSONAL_NOTE";
  const lines = metaLine(item);

  return (
    <article
      onClick={() => onOpen(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(item);
        }
      }}
      role="button"
      tabIndex={0}
      className={cn(
        "rounded-[var(--radius-lg)] border border-line bg-surface p-4 shadow-[var(--shadow-sm)] sm:p-5",
        "cursor-pointer transition-[border-color,box-shadow] duration-[var(--duration-fast)]",
        "hover:border-primary-border hover:shadow-[var(--shadow-md)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        isNote && "border-dashed",
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <Badge>{meta.label}</Badge>
        {item.visibility === "private" ? (
          <Lock size={12} className="ml-auto text-faint" aria-label="Private" />
        ) : null}
      </div>
      <h3 className="type-h4 m-0 text-ink">{item.title}</h3>
      {item.description ? (
        <div className="type-small mt-2 text-muted">
          <RichStudyText text={item.description} compact />
        </div>
      ) : null}
      <div className="type-caption mt-2.5 grid gap-0.5 text-faint">
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
        className="type-label mt-3 inline-flex items-center gap-1 text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {isNote ? <Maximize2 size={13} aria-hidden /> : null}
        {isNote ? "Open full note" : "View Details"}{" "}
        <ArrowRight size={13} aria-hidden />
      </button>
    </article>
  );
}
