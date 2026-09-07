"use client";

import type { ReactNode } from "react";
import { BookOpen, Map, Trophy } from "lucide-react";
import type { MemorySection } from "@/lib/memory/types";
import { MEMORY_SECTION_META } from "@/lib/memory/sections";
import { Tabs } from "@/components/ui";

const ICONS: Record<MemorySection, ReactNode> = {
  roadmap: <Map size={15} aria-hidden />,
  challenges: <Trophy size={15} aria-hidden />,
  general: <BookOpen size={15} aria-hidden />,
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
    <div className="mb-5">
      <Tabs
        items={sections.map((id) => ({
          id,
          label: MEMORY_SECTION_META[id].label,
          icon: ICONS[id],
          badge: counts?.[id] ?? 0,
        }))}
        value={value}
        onChange={onChange}
        ariaLabel="Memory Lane sections"
      />
      <p className="type-small mt-3 mb-0 text-muted">
        {MEMORY_SECTION_META[value].description}
      </p>
    </div>
  );
}
