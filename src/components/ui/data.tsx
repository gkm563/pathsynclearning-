"use client";

import { useId, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Button, Skeleton } from "./primitives";

/**
 * Data-display primitives: responsive table, pagination, progress, metrics.
 */

export type Column<Row> = {
  id: string;
  header: string;
  /** Cell content for the desktop table and the card body on mobile. */
  cell: (row: Row) => ReactNode;
  align?: "start" | "end";
  sortable?: boolean;
  /**
   * Controls what survives the collapse to cards on small screens:
   * - `primary`   → card title (exactly one column should use this)
   * - `secondary` → shown under the title as a label/value pair
   * - `meta`      → shown in the card footer
   * - `hidden`    → desktop only
   */
  priority?: "primary" | "secondary" | "meta" | "hidden";
  width?: string;
};

export type SortState = { columnId: string; direction: "asc" | "desc" } | null;

/**
 * One table component that renders as a real `<table>` on wide viewports and
 * as a stacked card list below `md`.
 *
 * Squeezing a multi-column table into a phone either clips data or forces a
 * horizontal scroll that hides the columns that matter. Collapsing to cards
 * keeps every value reachable without scrolling sideways, and the `priority`
 * field on each column decides the resulting hierarchy — so the same data is
 * available at every size, just arranged for the space available.
 */
export function DataTable<Row>({
  columns,
  rows,
  rowKey,
  caption,
  sort,
  onSortChange,
  onRowClick,
  loading = false,
  loadingRows = 5,
  empty,
  className,
}: {
  columns: Column<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  /** Accessible description of the table's contents. */
  caption: string;
  sort?: SortState;
  onSortChange?: (next: SortState) => void;
  onRowClick?: (row: Row) => void;
  loading?: boolean;
  loadingRows?: number;
  empty?: ReactNode;
  className?: string;
}) {
  const desktopColumns = columns.filter((c) => c.priority !== "hidden" || true);
  const primary =
    columns.find((c) => c.priority === "primary") ?? columns[0];
  const secondary = columns.filter((c) => c.priority === "secondary");
  const meta = columns.filter((c) => c.priority === "meta");

  const toggleSort = (column: Column<Row>) => {
    if (!column.sortable || !onSortChange) return;
    if (sort?.columnId !== column.id) {
      onSortChange({ columnId: column.id, direction: "asc" });
    } else if (sort.direction === "asc") {
      onSortChange({ columnId: column.id, direction: "desc" });
    } else {
      onSortChange(null);
    }
  };

  if (loading) {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        {Array.from({ length: loadingRows }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (rows.length === 0 && empty) {
    return <div className={className}>{empty}</div>;
  }

  return (
    <div className={className}>
      {/* Desktop: real table semantics. */}
      <div className="hidden overflow-x-auto rounded-[var(--radius-lg)] border border-line bg-surface md:block">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-line bg-sunken">
              {desktopColumns.map((column) => {
                const active = sort?.columnId === column.id;
                const ariaSort = !column.sortable
                  ? undefined
                  : active
                    ? sort?.direction === "asc"
                      ? "ascending"
                      : "descending"
                    : "none";
                return (
                  <th
                    key={column.id}
                    scope="col"
                    aria-sort={ariaSort}
                    style={column.width ? { width: column.width } : undefined}
                    className={cn(
                      "type-caption px-4 py-2.5 font-semibold tracking-[0.04em] text-muted uppercase",
                      column.align === "end" && "text-right",
                    )}
                  >
                    {column.sortable && onSortChange ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-[var(--radius-sm)] transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                          active && "text-ink",
                        )}
                      >
                        {column.header}
                        {active ? (
                          sort?.direction === "asc" ? (
                            <ArrowUp size={12} aria-hidden />
                          ) : (
                            <ArrowDown size={12} aria-hidden />
                          )
                        ) : (
                          <ChevronsUpDown
                            size={12}
                            aria-hidden
                            className="opacity-50"
                          />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                className={cn(
                  "border-b border-line last:border-0",
                  onRowClick &&
                    "cursor-pointer transition-colors hover:bg-sunken focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                )}
              >
                {desktopColumns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      "type-small px-4 py-3 text-ink",
                      column.align === "end" && "text-right",
                    )}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: same rows as cards, ordered by column priority. */}
      <ul
        aria-label={caption}
        className="flex list-none flex-col gap-2 p-0 md:hidden"
      >
        {rows.map((row) => (
          <li
            key={rowKey(row)}
            className={cn(
              "rounded-[var(--radius-md)] border border-line bg-surface p-3.5",
              onRowClick && "cursor-pointer transition-colors active:bg-sunken",
            )}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
          >
            <div className="type-label text-ink">{primary?.cell(row)}</div>

            {secondary.length > 0 ? (
              <dl className="mt-2.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                {secondary.map((column) => (
                  <div key={column.id} className="col-span-2 flex gap-2">
                    <dt className="type-caption min-w-24 shrink-0 text-muted">
                      {column.header}
                    </dt>
                    <dd className="type-small m-0 min-w-0 text-ink">
                      {column.cell(row)}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}

            {meta.length > 0 ? (
              <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-2.5">
                {meta.map((column) => (
                  <span key={column.id} className="type-caption text-muted">
                    {column.cell(row)}
                  </span>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Page-based pagination.
 *
 * Shows a windowed range with ellipses so the control stays a fixed width
 * regardless of total page count. Collapses to prev/next plus a positional
 * readout on phones, where numbered buttons are too small to hit reliably.
 */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  className,
  ariaLabel = "Pagination",
}: {
  page: number;
  pageCount: number;
  onPageChange: (next: number) => void;
  className?: string;
  ariaLabel?: string;
}) {
  if (pageCount <= 1) return null;

  const window: (number | "gap")[] = [];
  const push = (n: number | "gap") => window.push(n);

  push(1);
  if (page > 3) push("gap");
  for (let p = Math.max(2, page - 1); p <= Math.min(pageCount - 1, page + 1); p += 1) {
    push(p);
  }
  if (page < pageCount - 2) push("gap");
  if (pageCount > 1) push(pageCount);

  const btn =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-[var(--radius-sm)] px-2 type-label transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav aria-label={ariaLabel} className={cn("flex items-center justify-between gap-2 sm:justify-center", className)}>
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={cn(btn, "border border-line text-ink hover:bg-sunken")}
      >
        <ChevronLeft size={15} aria-hidden />
        <span className="ml-1 hidden sm:inline">Previous</span>
      </button>

      <span className="type-small text-muted sm:hidden">
        Page {page} of {pageCount}
      </span>

      <ol className="hidden list-none items-center gap-1 p-0 sm:flex">
        {window.map((entry, i) =>
          entry === "gap" ? (
            <li key={`gap-${i}`} className="px-1 text-faint" aria-hidden>
              …
            </li>
          ) : (
            <li key={entry}>
              <button
                type="button"
                onClick={() => onPageChange(entry)}
                aria-current={entry === page ? "page" : undefined}
                className={cn(
                  btn,
                  entry === page
                    ? "bg-primary text-on-primary"
                    : "text-muted hover:bg-sunken hover:text-ink",
                )}
              >
                {entry}
              </button>
            </li>
          ),
        )}
      </ol>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pageCount}
        className={cn(btn, "border border-line text-ink hover:bg-sunken")}
      >
        <span className="mr-1 hidden sm:inline">Next</span>
        <ChevronRight size={15} aria-hidden />
      </button>
    </nav>
  );
}

/** Cursor-style "load more" used by the feeds that paginate by cursor. */
export function LoadMore({
  onClick,
  loading,
  hasMore,
  label = "Load more",
  exhaustedLabel = "You've reached the end",
}: {
  onClick: () => void;
  loading: boolean;
  hasMore: boolean;
  label?: string;
  exhaustedLabel?: string;
}) {
  if (!hasMore) {
    return (
      <p className="type-small py-6 text-center text-faint">{exhaustedLabel}</p>
    );
  }
  return (
    <div className="flex justify-center py-6">
      <Button variant="secondary" onClick={onClick} loading={loading}>
        {loading ? "Loading…" : label}
      </Button>
    </div>
  );
}

/**
 * Linear progress bar.
 *
 * Always exposes the value to assistive tech via `role="progressbar"`; the
 * visible percentage label is optional so it can also sit inside dense cards.
 */
export function Progress({
  value,
  max = 100,
  label,
  showValue = false,
  tone = "primary",
  size = "md",
  className,
}: {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  tone?: "primary" | "success" | "warning" | "danger" | "accent";
  size?: "sm" | "md";
  className?: string;
}) {
  const pct = max <= 0 ? 0 : Math.max(0, Math.min(100, (value / max) * 100));
  const toneClass = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    accent: "bg-accent",
  }[tone];

  return (
    <div className={className}>
      {label || showValue ? (
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          {label ? <span className="type-small text-muted">{label}</span> : null}
          {showValue ? (
            <span className="type-small type-numeric font-semibold text-ink">
              {Math.round(pct)}%
            </span>
          ) : null}
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label ?? "Progress"}
        className={cn(
          "w-full overflow-hidden rounded-full bg-sunken",
          size === "sm" ? "h-1.5" : "h-2",
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none",
            toneClass,
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Single headline metric.
 *
 * Deliberately quiet: the number carries the weight, and the optional delta
 * uses colour plus a sign so it doesn't rely on colour alone.
 */
export function StatCard({
  label,
  value,
  hint,
  icon,
  delta,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
  delta?: { value: number; label?: string };
  className?: string;
}) {
  const positive = (delta?.value ?? 0) >= 0;
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col rounded-[var(--radius-lg)] border border-line bg-surface p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="type-caption m-0 font-semibold tracking-[0.06em] text-muted uppercase">
          {label}
        </p>
        {icon ? (
          <span className="shrink-0 text-faint" aria-hidden>
            {icon}
          </span>
        ) : null}
      </div>
      <p className="type-numeric mt-2 mb-0 text-[clamp(1.5rem,1.2rem+1vw,1.875rem)] leading-none font-semibold tracking-[-0.035em] text-ink">
        {value}
      </p>
      {delta || hint ? (
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
          {delta ? (
            <span
              className={cn(
                "type-caption type-numeric font-semibold",
                positive ? "text-success" : "text-danger",
              )}
            >
              {positive ? "+" : "−"}
              {Math.abs(delta.value)}
              {delta.label ? ` ${delta.label}` : ""}
            </span>
          ) : null}
          {hint ? <span className="type-caption text-muted">{hint}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

/** Key/value list. Used for detail pages where a table would be overkill. */
export function DescriptionList({
  items,
  className,
}: {
  items: Array<{ label: string; value: ReactNode }>;
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "grid gap-x-6 gap-y-3 sm:grid-cols-[minmax(8rem,auto)_1fr]",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="sm:col-span-2 sm:grid sm:grid-cols-subgrid">
          <dt className="type-small text-muted">{item.label}</dt>
          <dd className="type-small m-0 min-w-0 text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Avatar with initials fallback. */
export function Avatar({
  src,
  name,
  size = "md",
  className,
}: {
  src?: string | null;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizeClass = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-[11px]",
    md: "h-10 w-10 text-[13px]",
    lg: "h-14 w-14 text-base",
    xl: "h-20 w-20 text-xl",
  }[size];

  const initials =
    (name ?? "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-sunken font-semibold text-muted select-none",
        sizeClass,
        className,
      )}
    >
      {src ? (
        // Clerk/CDN avatars are already sized; next/image adds no value here.
        <img
          src={src}
          alt={name ? `${name}'s avatar` : ""}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </span>
  );
}
