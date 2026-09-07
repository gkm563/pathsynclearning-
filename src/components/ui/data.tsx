"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./primitives";

/**
 * Data-display primitives: load-more, progress, metrics, lists, and avatars.
 */

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
