"use client";

import type { ReactNode } from "react";
import { ArrowUpDown } from "lucide-react";
import { Button, Menu, SearchInput, Toolbar } from "@/components/ui";
import { SORT_LABELS, type OpportunitySort } from "./helpers";

const SORT_ORDER: OpportunitySort[] = ["featured", "deadline", "seats"];

/**
 * Search + sort bar above an opportunity grid.
 *
 * Wraps rather than scrolls (see `Toolbar`), so at 360px the search box takes
 * a full row and the controls stack beneath it instead of pushing the page
 * wider than the viewport.
 */
export function OpportunityToolbar({
  query,
  onQueryChange,
  placeholder,
  sort,
  onSortChange,
  children,
}: {
  query: string;
  onQueryChange: (next: string) => void;
  placeholder: string;
  sort?: OpportunitySort;
  onSortChange?: (next: OpportunitySort) => void;
  /** Extra controls — mode switches, applied filters. */
  children?: ReactNode;
}) {
  return (
    <Toolbar>
      <SearchInput
        value={query}
        onValueChange={onQueryChange}
        placeholder={placeholder}
        aria-label={placeholder}
        className="basis-full sm:basis-64"
      />

      {children}

      {sort && onSortChange ? (
        <Menu
          ariaLabel="Sort opportunities"
          groups={[
            {
              id: "sort",
              label: "Sort by",
              items: SORT_ORDER.map((id) => ({
                id,
                label: SORT_LABELS[id],
                selected: id === sort,
                onSelect: () => onSortChange(id),
              })),
            },
          ]}
          trigger={({ open, toggle, ref }) => (
            <Button
              ref={ref}
              variant="secondary"
              onClick={toggle}
              aria-haspopup="menu"
              aria-expanded={open}
              className="min-h-11"
            >
              <ArrowUpDown size={15} aria-hidden />
              <span className="truncate">{SORT_LABELS[sort]}</span>
            </Button>
          )}
        />
      ) : null}
    </Toolbar>
  );
}
