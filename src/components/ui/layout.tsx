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
                "flex items-center gap-1",
                // Collapse everything except parent + current on phones.
                !isLast && !isParent && "hidden sm:flex",
                // Parent keeps its label; current crumb is the one that ellipsizes.
                isLast ? "min-w-0 flex-1" : "shrink-0",
              )}
            >
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="type-caption rounded-[var(--radius-sm)] text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    "type-caption",
                    isLast ? "min-w-0 truncate font-semibold text-ink" : "text-muted",
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
  variant = "default",
}: {
  children: ReactNode;
  className?: string;
  /** `article` uses a dedicated reading scale — smaller on phones, 16px from sm up. */
  variant?: "default" | "article";
}) {
  const article = variant === "article";
  return (
    <div
      className={cn(
        "max-w-[var(--measure-prose)] text-ink",
        ...(article
          ? [
              "text-[0.875rem] leading-[1.65] sm:text-[1rem] sm:leading-[1.7]",
              "[&_h2]:mt-7 [&_h2]:mb-2 [&_h2]:text-[1.0625rem] [&_h2]:leading-snug [&_h2]:font-semibold [&_h2]:tracking-[-0.03em] [&_h2]:text-ink sm:[&_h2]:mt-9 sm:[&_h2]:mb-3 sm:[&_h2]:text-[1.25rem]",
              "[&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-[0.9375rem] [&_h3]:font-semibold [&_h3]:text-ink sm:[&_h3]:mt-7 sm:[&_h3]:text-[1.0625rem]",
              "[&_h4]:mt-5 [&_h4]:mb-1.5 [&_h4]:text-[0.875rem] [&_h4]:font-semibold [&_h4]:text-ink sm:[&_h4]:mt-6 sm:[&_h4]:text-[1rem]",
              "[&_p]:mt-0 [&_p]:mb-4 [&_p]:text-[length:inherit] [&_p]:leading-[inherit] [&_p]:text-ink sm:[&_p]:mb-5",
              "[&_ul]:mt-0 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-[length:inherit] [&_ul]:text-ink sm:[&_ul]:mb-5",
              "[&_ol]:mt-0 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:text-[length:inherit] [&_ol]:text-ink sm:[&_ol]:mb-5",
              "[&_li]:mb-1.5 [&_li]:leading-[1.6] sm:[&_li]:mb-2 sm:[&_li]:leading-[1.7]",
              "[&_blockquote]:my-5 [&_blockquote]:rounded-[var(--radius-md)] [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:bg-sunken [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:text-ink",
              "[&_pre]:my-5 [&_pre]:overflow-x-auto [&_pre]:rounded-[var(--radius-md)] [&_pre]:bg-sunken [&_pre]:p-4",
              "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
              "[&_img]:my-5 [&_img]:h-auto [&_img]:w-full [&_img]:rounded-[var(--radius-md)]",
              "[&_hr]:my-8 [&_hr]:border-0 [&_hr]:border-t [&_hr]:border-line",
            ]
          : [
              "type-body",
              "[&_h2]:type-h2 [&_h2]:mt-10 [&_h2]:mb-3",
              "[&_h3]:type-h3 [&_h3]:mt-8 [&_h3]:mb-2",
              "[&_p]:mt-0 [&_p]:mb-4 [&_p]:text-muted",
              "[&_ul]:mt-0 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-muted",
              "[&_ol]:mt-0 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:text-muted",
              "[&_li]:mb-1.5",
            ]),
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
