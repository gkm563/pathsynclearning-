import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Layout primitives. These are server-safe (no "use client") so pages can
 * compose page structure without pulling everything into a client bundle.
 */

/**
 * A titled content region inside a page.
 *
 * Owns the vertical rhythm between sections so pages don't sprinkle one-off
 * `mt-*` values, and renders a real `<section>` with an `aria-labelledby`
 * heading so the page outline is navigable by screen reader.
 */
export function Section({
  title,
  description,
  actions,
  children,
  as: Heading = "h2",
  className,
  contentClassName,
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  as?: "h2" | "h3";
  className?: string;
  contentClassName?: string;
}) {
  const headingId = title
    ? `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`
    : undefined;

  return (
    <section
      aria-labelledby={headingId}
      className={cn("mt-8 first:mt-0 sm:mt-10", className)}
    >
      {title ? (
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <Heading
              id={headingId}
              className={cn(
                "m-0 text-ink",
                Heading === "h2" ? "type-h3" : "type-h4",
              )}
            >
              {title}
            </Heading>
            {description ? (
              <p className="type-small mt-1 mb-0 max-w-prose text-muted">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {actions}
            </div>
          ) : null}
        </div>
      ) : null}
      <div className={contentClassName}>{children}</div>
    </section>
  );
}

/**
 * Breadcrumb trail for nested routes.
 *
 * The current page is rendered as plain text with `aria-current="page"` rather
 * than a link — linking to where you already are is a dead control. On phones
 * only the parent and current crumb are shown, since the full trail wraps into
 * an unreadable block.
 */
export function Breadcrumb({
  items,
  className,
}: {
  items: Array<{ label: string; href?: string }>;
  className?: string;
}) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn("min-w-0", className)}>
      <ol className="flex list-none flex-wrap items-center gap-1 p-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isParent = index === items.length - 2;
          return (
            <li
              key={`${item.label}-${index}`}
              className={cn(
                "flex min-w-0 items-center gap-1",
                // Collapse everything except parent + current on phones.
                !isLast && !isParent && "hidden sm:flex",
              )}
            >
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="type-caption truncate rounded-[var(--radius-sm)] text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    "type-caption truncate",
                    isLast ? "font-semibold text-ink" : "text-muted",
                  )}
                >
                  {item.label}
                </span>
              )}
              {!isLast ? (
                <ChevronRight
                  size={13}
                  aria-hidden
                  className="shrink-0 text-faint"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * Horizontal control bar for search / filters / sort above a data view.
 *
 * Wraps rather than scrolls, and each child is `min-w-0`, which is what stops
 * a long filter set from pushing the page wider than the viewport.
 */
export function Toolbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-5 flex flex-wrap items-center gap-2 [&>*]:min-w-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Constrains long-form content (legal pages, docs, articles) to a readable
 * measure and applies consistent flow spacing to raw markup.
 */
export function Prose({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "type-body max-w-[var(--measure-prose)] text-ink",
        "[&_h2]:type-h2 [&_h2]:mt-10 [&_h2]:mb-3",
        "[&_h3]:type-h3 [&_h3]:mt-8 [&_h3]:mb-2",
        "[&_p]:mt-0 [&_p]:mb-4 [&_p]:text-muted",
        "[&_ul]:mt-0 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-muted",
        "[&_ol]:mt-0 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:text-muted",
        "[&_li]:mb-1.5",
        "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4",
        "[&_strong]:font-semibold [&_strong]:text-ink",
        "[&_code]:type-code [&_code]:rounded [&_code]:bg-sunken [&_code]:px-1.5 [&_code]:py-0.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Divider with an optional inline label.
 * Decorative by default so it isn't announced as a meaningless separator.
 */
export function Divider({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  if (!label) {
    return (
      <hr className={cn("my-6 h-px border-0 bg-line", className)} aria-hidden />
    );
  }
  return (
    <div className={cn("my-6 flex items-center gap-3", className)}>
      <span className="h-px flex-1 bg-line" aria-hidden />
      <span className="type-caption font-semibold tracking-[0.06em] text-faint uppercase">
        {label}
      </span>
      <span className="h-px flex-1 bg-line" aria-hidden />
    </div>
  );
}
