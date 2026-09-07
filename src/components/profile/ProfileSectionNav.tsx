"use client";

import { cn } from "@/lib/cn";
import { Tabs } from "@/components/ui";
import type { ProfileSectionId } from "@/lib/profile/types";
import { PROFILE_SECTIONS } from "./types";

/**
 * Section switcher for the profile.
 *
 * A vertical list from `lg` up (where there's room for a persistent rail) and
 * a scrollable tab strip below it. Both drive the same `?section=` state.
 */
export function ProfileSectionNav({
  section,
  onSelect,
}: {
  section: ProfileSectionId;
  onSelect: (id: ProfileSectionId) => void;
}) {
  return (
    <>
      <nav
        aria-label="Profile sections"
        className="hidden lg:sticky lg:top-4 lg:block lg:self-start"
      >
        <ul className="flex list-none flex-col gap-1 p-0">
          {PROFILE_SECTIONS.map((item) => {
            const active = item.id === section;
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "type-label flex min-h-11 w-full items-center gap-2.5 rounded-[var(--radius-md)] px-3 text-left transition-colors duration-[var(--duration-fast)]",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    active
                      ? "bg-primary-soft text-primary"
                      : "text-muted hover:bg-sunken hover:text-ink",
                  )}
                >
                  <Icon size={16} aria-hidden className="shrink-0" />
                  <span className="min-w-0 truncate">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="min-w-0 max-w-full lg:hidden">
        <Tabs
          ariaLabel="Profile sections"
          value={section}
          onChange={onSelect}
          items={PROFILE_SECTIONS.map((item) => ({
            id: item.id,
            label: item.label,
          }))}
        />
      </div>
    </>
  );
}
