"use client";

import { Check, Plus, Star, Users } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import type { Mentor } from "./types";

/**
 * Directory card for the browse grid.
 *
 * Rendered as an `<li>` because the grid is a real list — a screen reader
 * should be able to hear how many mentors matched the current filters.
 */
export function MentorCard({
  mentor,
  added,
  onAdd,
  onOpenProfile,
}: {
  mentor: Mentor;
  added: boolean;
  onAdd: (id: string) => void;
  onOpenProfile: (mentor: Mentor) => void;
}) {
  return (
    <li className="flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)] hover:border-line-strong hover:shadow-[var(--shadow-sm)] motion-reduce:transition-none">
      <div className="aspect-[4/3] w-full overflow-hidden bg-sunken">
        <img
          src={mentor.image}
          alt={`Portrait of ${mentor.name}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="type-h4 m-0 min-w-0 text-ink">{mentor.name}</h3>
            <span className="type-caption type-numeric inline-flex shrink-0 items-center gap-1 text-muted">
              <Star size={12} aria-hidden className="text-accent" />
              {mentor.rating}
              <span className="sr-only">out of 5</span>
            </span>
          </div>
          <p className="type-small mt-0.5 mb-0 text-muted">
            {mentor.role} · {mentor.company}
          </p>
        </div>

        <ul className="flex list-none flex-wrap gap-1.5 p-0">
          {mentor.skills.slice(0, 3).map((skill) => (
            <li key={skill}>
              <Badge tone="neutral">{skill}</Badge>
            </li>
          ))}
        </ul>

        <p className="type-caption type-numeric m-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-faint">
          <span>{mentor.exp} yrs experience</span>
          <span className="inline-flex items-center gap-1">
            <Users size={12} aria-hidden />
            {mentor.students} coached
          </span>
        </p>

        <div className="mt-auto flex gap-2 pt-1">
          <Button
            variant="secondary"
            size="sm"
            className="min-h-11 flex-1"
            onClick={() => onOpenProfile(mentor)}
          >
            View profile
          </Button>
          <Button
            size="sm"
            className="min-h-11 flex-1"
            disabled={added}
            onClick={() => onAdd(mentor.id)}
          >
            {added ? <Check size={14} aria-hidden /> : <Plus size={14} aria-hidden />}
            {added ? "Added" : "Add mentor"}
          </Button>
        </div>
      </div>
    </li>
  );
}
