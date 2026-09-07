"use client";

import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import {
  Button,
  EmptyState,
  SearchInput,
  Segmented,
  Toolbar,
} from "@/components/ui";
import { MENTOR_CATEGORIES } from "./data";
import { MentorCard } from "./MentorCard";
import type { Mentor, MentorCategoryFilter } from "./types";

const CATEGORY_TABS = [
  { id: "all" as const, label: "All" },
  ...MENTOR_CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
  })),
];

function matches(mentor: Mentor, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    mentor.name.toLowerCase().includes(q) ||
    mentor.role.toLowerCase().includes(q) ||
    mentor.company.toLowerCase().includes(q) ||
    mentor.category.toLowerCase().includes(q) ||
    mentor.skills.some((skill) => skill.toLowerCase().includes(q)) ||
    mentor.roadmaps.some((roadmap) => roadmap.toLowerCase().includes(q))
  );
}

/**
 * Mentor marketplace: search, category filter and a reflowing card grid.
 *
 * The original design used three horizontally scrolling rows, which forced a
 * sideways drag on every viewport. A single grid with a category filter shows
 * the same segmentation while reflowing 1 → 2 → 3 columns.
 */
export function MentorBrowser({
  mentors,
  activeIds,
  onAdd,
  onOpenProfile,
}: {
  mentors: Mentor[];
  activeIds: string[];
  onAdd: (id: string) => void;
  onOpenProfile: (mentor: Mentor) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<MentorCategoryFilter>("all");

  const results = useMemo(
    () =>
      mentors.filter(
        (mentor) =>
          (category === "all" || mentor.category === category) &&
          matches(mentor, query),
      ),
    [mentors, category, query],
  );

  const filtered = query.trim().length > 0 || category !== "all";
  const activeCategory = MENTOR_CATEGORIES.find((item) => item.id === category);

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
  };

  return (
    <div className="min-w-0">
      <Toolbar>
        <SearchInput
          value={query}
          onValueChange={setQuery}
          placeholder="Search by name, skill, company or roadmap…"
          aria-label="Search mentors"
          className="w-full sm:w-auto sm:min-w-64 sm:flex-1"
        />
        <Segmented<MentorCategoryFilter>
          items={CATEGORY_TABS}
          value={category}
          onChange={setCategory}
          ariaLabel="Mentor category"
        />
      </Toolbar>

      <p aria-live="polite" className="type-small mb-4 text-muted">
        {results.length} {results.length === 1 ? "mentor" : "mentors"}
        {activeCategory ? ` in ${activeCategory.label}` : ""}
        {activeCategory ? ` — ${activeCategory.blurb}` : ""}
      </p>

      {results.length === 0 ? (
        <EmptyState
          icon={<SearchX size={20} aria-hidden />}
          title="No mentors match these filters"
          description="Try a broader skill, a different category, or clear the filters to see the full directory."
          action={
            filtered ? (
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((mentor) => (
            <MentorCard
              key={mentor.id}
              mentor={mentor}
              added={activeIds.includes(mentor.id)}
              onAdd={onAdd}
              onOpenProfile={onOpenProfile}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
