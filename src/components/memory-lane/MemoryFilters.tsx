"use client";

import type { MemoryFilter } from "@/lib/memory/types";
import { MEMORY_FILTERS } from "@/lib/memory/types";
import { SearchInput } from "@/components/ui";
import { cn } from "@/lib/cn";

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
    <SearchInput
      value={value}
      onValueChange={onChange}
      placeholder="Search memories…"
      aria-label="Search memories"
    />
  );
}

export function MemoryFilters({
  value,
  onChange,
  filters = MEMORY_FILTERS,
}: {
  value: MemoryFilter;
  onChange: (v: MemoryFilter) => void;
  filters?: readonly MemoryFilter[];
}) {
  return (
    <div
      className="mt-3 flex flex-wrap gap-2"
      role="tablist"
      aria-label="Memory filters"
    >
      {filters.map((f) => {
        const active = f === value;
        return (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(f)}
            className={cn(
              "type-label inline-flex h-8 items-center rounded-full border px-3 transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              active
                ? "border-primary-border bg-primary-soft text-primary"
                : "border-line bg-surface text-muted hover:bg-sunken hover:text-ink",
            )}
          >
            {FILTER_LABELS[f]}
          </button>
        );
      })}
    </div>
  );
}
