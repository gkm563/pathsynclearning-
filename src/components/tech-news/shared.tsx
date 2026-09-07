"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { isGeneratedSocialCard, nonemptyUrl } from "@/lib/news/normalize";

/**
 * Presentation helpers shared by the Tech News feed, saved list and article.
 *
 * Everything here is Tailwind-on-tokens; the old hand-written `.news-*` CSS
 * block that used to own these styles has been removed from `globals.css`.
 */

/** Relative age for feed cards ("3h ago"), falling back to a short date. */
export function formatNewsTime(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "";
  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 14) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** Machine-readable value for `<time dateTime>`; empty when unparseable. */
export function newsDateTime(iso: string): string | undefined {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/** Full date for the article byline. */
export function formatNewsDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Cover image with a reserved aspect box so the grid never reflows once the
 * photo decodes. Dev.to "social card" images and load failures fall back to a
 * branded placeholder rather than a broken image.
 */
export function NewsCover({
  src,
  alt = "",
  className,
  zoomOnHover = false,
  fallback = "placeholder",
}: {
  src: string | null;
  alt?: string;
  className?: string;
  /** Applies a subtle scale when an ancestor marked `group` is hovered. */
  zoomOnHover?: boolean;
  /** `hidden` omits the block when there is no real photograph. */
  fallback?: "placeholder" | "hidden";
}) {
  const [failed, setFailed] = useState(false);
  const photo = nonemptyUrl(src);
  const showPhoto = Boolean(photo) && !isGeneratedSocialCard(photo) && !failed;

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!showPhoto && fallback === "hidden") return null;

  const motionClass = zoomOnHover
    ? "transition-transform duration-[var(--duration-normal)] ease-[var(--ease-standard)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
    : undefined;

  return (
    <div
      className={cn(
        "relative isolate w-full overflow-hidden bg-sunken",
        className ?? "aspect-video",
      )}
    >
      {showPhoto ? (
        <img
          src={photo ?? undefined}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className={cn("absolute inset-0 h-full w-full object-cover", motionClass)}
        />
      ) : (
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-primary-soft",
            motionClass,
          )}
        >
          <img
            src="/favicon.svg"
            alt=""
            loading="lazy"
            decoding="async"
            className="h-10 w-10 rounded-[var(--radius-md)] object-contain shadow-[var(--shadow-sm)] sm:h-12 sm:w-12"
          />
          <span className="type-label text-ink">PathEd</span>
        </div>
      )}
    </div>
  );
}

/**
 * Dot-separated metadata row (source, author, age, reading time).
 * Each entry is `min-w-0` so a long source name wraps instead of widening
 * the card.
 */
export function NewsMeta({
  items,
  className,
}: {
  items: Array<string | { key: string; node: ReactNode }>;
  className?: string;
}) {
  const entries = items.filter(Boolean);
  if (entries.length === 0) return null;

  return (
    <p className={cn("type-caption m-0 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-faint", className)}>
      {entries.map((entry, index) => {
        const key = typeof entry === "string" ? `${entry}-${index}` : entry.key;
        return (
          <span key={key} className="flex min-w-0 items-center gap-1.5">
            {index > 0 ? (
              <span aria-hidden className="opacity-55">
                ·
              </span>
            ) : null}
            <span className="min-w-0">
              {typeof entry === "string" ? entry : entry.node}
            </span>
          </span>
        );
      })}
    </p>
  );
}
