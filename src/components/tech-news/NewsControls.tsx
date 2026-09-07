"use client";

import type { ReactNode } from "react";
import { Bookmark, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { NEWS_CATEGORIES, type NewsSort } from "@/lib/news/constants";
import { routes } from "@/lib/routes";
import { Button, SearchInput, Segmented, Toolbar } from "@/components/ui";
import { cn } from "@/lib/cn";

export function TechNewsHeader({
  actions,
}: {
  actions?: ReactNode;
}) {
  const router = useRouter();
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="type-overline m-0 text-primary">Developer briefing</p>
        <h1 className="type-h2 mt-1.5 mb-0 text-ink">Tech News</h1>
        <p className="type-small mt-1.5 mb-0 max-w-xl text-muted">
          Engineering, AI, and startup stories that matter for your career —
          without the noise.
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {actions}
        <Button
          variant="secondary"
          onClick={() => router.push(routes.app.techNewsSaved)}
          aria-label="Open saved news"
        >
          <Bookmark size={16} aria-hidden /> Saved
        </Button>
      </div>
    </div>
  );
}

export function CategoryNav({
  active,
  preferred,
  onChange,
}: {
  active: string | "all";
  preferred: string[];
  onChange: (category: string | "all") => void;
}) {
  const preferredSet = new Set(preferred);
  const ordered = [
    ...NEWS_CATEGORIES.filter((c) => preferredSet.has(c)),
    ...NEWS_CATEGORIES.filter((c) => !preferredSet.has(c)),
  ];

  return (
    <nav aria-label="News categories" className="mb-4">
      <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
        <Chip
          label="All"
          active={active === "all"}
          onClick={() => onChange("all")}
        />
        {ordered.map((cat) => (
          <Chip
            key={cat}
            label={cat}
            active={active === cat}
            preferred={preferredSet.has(cat)}
            onClick={() => onChange(cat)}
          />
        ))}
      </div>
    </nav>
  );
}

function Chip({
  label,
  active,
  preferred,
  onClick,
}: {
  label: string;
  active: boolean;
  preferred?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "type-label inline-flex h-9 shrink-0 items-center rounded-full border px-3 transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        active
          ? "border-primary-border bg-primary-soft text-primary"
          : preferred
            ? "border-line bg-sunken text-ink"
            : "border-line bg-surface text-muted hover:bg-sunken hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}

export function NewsControls({
  search,
  sort,
  busy,
  onSearchChange,
  onSortChange,
  onOpenPrefs,
}: {
  search: string;
  sort: NewsSort;
  busy?: boolean;
  onSearchChange: (v: string) => void;
  onSortChange: (v: NewsSort) => void;
  onOpenPrefs: () => void;
}) {
  return (
    <Toolbar className="mb-6">
      <SearchInput
        value={search}
        onValueChange={onSearchChange}
        placeholder="Search headlines, sources…"
        aria-label="Search news"
        busy={busy}
      />
      <Segmented
        items={[
          { id: "latest", label: "Latest" },
          { id: "popular", label: "Popular" },
        ]}
        value={sort}
        onChange={onSortChange}
        ariaLabel="Sort news"
      />
      <Button variant="secondary" onClick={onOpenPrefs} aria-label="Category preferences">
        <Settings2 size={15} aria-hidden /> Preferences
      </Button>
    </Toolbar>
  );
}
