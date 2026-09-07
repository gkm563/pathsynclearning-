import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Skeleton } from "./primitives";

/**
 * The unified loading / empty / error vocabulary.
 *
 * The rule this file encodes: a loading state should occupy the same shape as
 * the content it's replacing. A centred spinner tells the user "wait" but
 * throws the layout away and then snaps it back, which reads as a flash of
 * broken page. Skeletons that mirror the final structure keep the page stable
 * and make the wait feel shorter, so they're the default and the spinner is
 * reserved for small in-place operations.
 */

/**
 * Skeleton matching the standard page header (`PageHeader`), so route-level
 * loading states line up with the content that replaces them.
 */
export function HeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("mb-7 flex flex-col gap-3 sm:mb-8", className)}>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-[min(20rem,70%)]" />
      <Skeleton className="h-4 w-[min(32rem,90%)]" />
    </div>
  );
}

/** Grid of metric-card skeletons. Mirrors `StatCard` dimensions. */
export function StatGridSkeleton({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4",
        className,
      )}
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-[var(--radius-lg)] border border-line bg-surface p-4 sm:p-5"
        >
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-3 h-7 w-20" />
          <Skeleton className="mt-2.5 h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

/** Grid of content-card skeletons, for feeds and catalogues. */
export function CardGridSkeleton({
  count = 6,
  withMedia = false,
  className,
}: {
  count?: number;
  withMedia?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface"
        >
          {withMedia ? <Skeleton className="aspect-video w-full rounded-none" /> : null}
          <div className="p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-5 w-full" />
            <Skeleton className="mt-2 h-5 w-4/5" />
            <Skeleton className="mt-3.5 h-3 w-full" />
            <Skeleton className="mt-1.5 h-3 w-3/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Stacked row skeletons, for lists and tables. */
export function ListSkeleton({
  count = 5,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 rounded-[var(--radius-md)] border border-line bg-surface p-3.5"
        >
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-4 w-[min(16rem,60%)]" />
            <Skeleton className="mt-2 h-3 w-[min(24rem,85%)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Route-level loading skeleton: header + stats + content.
 * Used by `loading.tsx` boundaries so the shell never shows a bare spinner.
 */
export function PageSkeleton({
  stats = true,
  variant = "cards",
}: {
  stats?: boolean;
  variant?: "cards" | "list";
}) {
  return (
    <div role="status" aria-label="Loading page">
      <span className="sr-only">Loading…</span>
      <HeaderSkeleton />
      {stats ? <StatGridSkeleton className="mb-6" /> : null}
      {variant === "cards" ? <CardGridSkeleton /> : <ListSkeleton />}
    </div>
  );
}

/**
 * Small in-place spinner for refreshes, search and filtering — operations
 * where the existing content stays on screen and only needs a busy hint.
 */
export function InlineLoader({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      role="status"
      className={cn("inline-flex items-center gap-2 text-muted", className)}
    >
      <span
        aria-hidden
        className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-line border-t-primary motion-reduce:animate-none"
      />
      {label ? <span className="type-small">{label}</span> : null}
      <span className="sr-only">{label ?? "Loading"}</span>
    </span>
  );
}

/**
 * Wraps content that is being refreshed in place.
 *
 * Dims and un-clicks the stale content and floats a status pill above it,
 * rather than unmounting it — the user keeps their reading position and the
 * page height doesn't jump.
 */
export function RefreshOverlay({
  busy,
  label = "Updating…",
  children,
}: {
  busy: boolean;
  label?: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-24">
      <div
        aria-busy={busy}
        className={cn(
          "transition-opacity duration-200 motion-reduce:transition-none",
          busy && "pointer-events-none opacity-40",
        )}
      >
        {children}
      </div>
      {busy ? (
        <div className="pointer-events-none absolute inset-x-0 top-16 flex justify-center">
          <span className="type-small inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-2 font-semibold text-ink shadow-[var(--shadow-md)]">
            <span
              aria-hidden
              className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-line border-t-primary motion-reduce:animate-none"
            />
            {label}
          </span>
        </div>
      ) : null}
    </div>
  );
}
