import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { Prose } from "@/components/ui";
import { cn } from "@/lib/cn";

/**
 * Shared chrome for the public marketing site.
 *
 * Everything here is server-safe (no `"use client"`), so static marketing
 * routes stay out of the client bundle. The doc sidebar is intentionally
 * JS-free: a `<details>` disclosure below `lg`, a sticky list above it.
 */

/* -------------------------------------------------------------------------
   Page + hero
------------------------------------------------------------------------- */

/** Outer wrapper owning the bottom rhythm of a marketing page. */
export function MarketingPage({ children }: { children: ReactNode }) {
  return <div className="min-w-0 pb-16 sm:pb-24">{children}</div>;
}

export function MarketingHero({
  kicker,
  title,
  description,
  align = "center",
  children,
}: {
  kicker?: string;
  title: ReactNode;
  description?: string;
  align?: "center" | "left";
  children?: ReactNode;
}) {
  const centered = align === "center";
  return (
    <header
      className={cn(
        "mx-auto w-full min-w-0 px-4 pt-10 pb-8 sm:px-6 sm:pt-16 sm:pb-12 lg:px-8",
        centered
          ? "max-w-[56rem] text-center"
          : "max-w-[var(--measure-content)]",
      )}
    >
      {kicker ? <p className="type-overline m-0 text-primary">{kicker}</p> : null}
      <h1
        className={cn(
          "mt-3 mb-0 text-ink",
          centered ? "type-display" : "type-h1",
        )}
      >
        {title}
      </h1>
      {description ? (
        <p
          className={cn(
            "type-body-lg mt-4 mb-0 max-w-[54ch] text-muted",
            centered && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
      {children ? (
        <div className={cn("mt-7", centered && "flex justify-center")}>
          {children}
        </div>
      ) : null}
    </header>
  );
}

/* -------------------------------------------------------------------------
   Long-form copy
------------------------------------------------------------------------- */

/**
 * `Prose` with the trailing flow margin removed, so blocks can be spaced by
 * their parent instead of fighting the last paragraph's `margin-bottom`.
 */
export function DocProse({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Prose className={cn("[&>*:last-child]:mb-0", className)}>{children}</Prose>
  );
}

/* -------------------------------------------------------------------------
   Documentation shell
------------------------------------------------------------------------- */

export interface DocsNavItem {
  /** Must match the `id` of the section it points at. */
  id: string;
  label: string;
}

export interface DocsNavGroup {
  label: string;
  items: readonly DocsNavItem[];
}

function DocsNavList({ nav }: { nav: readonly DocsNavGroup[] }) {
  return (
    <div className="flex min-w-0 flex-col gap-6">
      {nav.map((group) => (
        <div key={group.label} className="min-w-0">
          <p className="type-overline m-0 mb-1.5 text-faint">{group.label}</p>
          <ul className="m-0 flex list-none flex-col p-0">
            {group.items.map((item) => (
              <li key={item.id} className="min-w-0">
                <a
                  href={`#${item.id}`}
                  className="type-body flex min-h-11 items-center rounded-[var(--radius-sm)] px-2.5 text-muted transition-colors duration-[var(--duration-fast)] hover:bg-primary-soft/60 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/**
 * Two-column documentation layout.
 *
 * The same link list is rendered twice — once inside a mobile `<details>`
 * disclosure, once in the sticky desktop rail — because a `<details>` cannot
 * be forced open with CSS reliably. Only one is ever displayed.
 */
export function DocsShell({
  nav,
  children,
}: {
  nav: readonly DocsNavGroup[];
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full min-w-0 max-w-[var(--measure-content)] px-4 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
        <nav
          aria-label="On this page"
          className="min-w-0 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto lg:pt-2"
        >
          <details className="group min-w-0 rounded-[var(--radius-md)] border border-line bg-surface lg:hidden">
            <summary className="type-label flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
              On this page
              <ChevronDown
                size={16}
                aria-hidden
                className="shrink-0 text-muted transition-transform duration-[var(--duration-fast)] group-open:rotate-180 motion-reduce:transition-none"
              />
            </summary>
            <div className="border-t border-line px-2.5 py-3">
              <DocsNavList nav={nav} />
            </div>
          </details>
          <div className="hidden lg:block">
            <DocsNavList nav={nav} />
          </div>
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   Legal article
------------------------------------------------------------------------- */

export type LegalBlock =
  | { kind: "p"; text: ReactNode }
  | { kind: "list"; items: readonly { term?: string; text: ReactNode }[] }
  | { kind: "note"; label: string; text: ReactNode }
  | { kind: "contact"; label: string; email: string };

export interface LegalSection {
  title: string;
  blocks: readonly LegalBlock[];
}

function LegalBlockView({ block }: { block: LegalBlock }) {
  switch (block.kind) {
    case "p":
      return <p>{block.text}</p>;
    case "list":
      return (
        <ul>
          {block.items.map((item, index) => (
            <li key={index}>
              {item.term ? <strong>{item.term}</strong> : null}
              {item.term ? " " : null}
              {item.text}
            </li>
          ))}
        </ul>
      );
    case "note":
      return (
        <div className="type-small mb-4 rounded-[var(--radius-md)] border border-primary-border bg-primary-soft/50 px-4 py-3 text-muted">
          <strong>{block.label}</strong> {block.text}
        </div>
      );
    case "contact":
      return (
        <address className="mb-4 flex flex-col gap-1 rounded-[var(--radius-md)] border border-line bg-sunken px-4 py-3 not-italic">
          <span className="type-caption text-faint">{block.label}</span>
          <a
            href={`mailto:${block.email}`}
            className="type-label inline-flex min-h-11 items-center self-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {block.email}
          </a>
        </address>
      );
  }
}

/**
 * Shared layout for the four legal pages.
 *
 * Sections are a real `<ol>` so the numbering is structural rather than typed
 * into each heading; the visible index is decorative and hidden from AT.
 */
export function LegalArticle({
  title,
  updated,
  summary,
  sections,
}: {
  title: string;
  updated: string;
  summary: string;
  sections: readonly LegalSection[];
}) {
  return (
    <article className="mx-auto w-full min-w-0 max-w-[46rem] px-4 pt-10 pb-16 sm:px-6 sm:pt-14 sm:pb-24">
      <header className="border-b border-line pb-8">
        <p className="type-overline m-0 text-primary">Legal</p>
        <h1 className="type-h1 mt-3 mb-0 text-ink">{title}</h1>
        <p className="type-body-lg mt-4 mb-0 max-w-[54ch] text-muted">
          {summary}
        </p>
        <p className="type-caption mt-6 mb-0 text-faint">
          Last updated: {updated}
        </p>
      </header>

      <ol className="m-0 mt-10 flex list-none flex-col gap-10 p-0 sm:gap-12">
        {sections.map((section, index) => (
          <li key={section.title} className="min-w-0">
            <div className="flex items-baseline gap-3">
              <span
                aria-hidden
                className="type-numeric type-label shrink-0 text-primary"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h2 className="type-h3 m-0 min-w-0 text-ink">{section.title}</h2>
            </div>
            <DocProse className="mt-3">
              {section.blocks.map((block, blockIndex) => (
                <LegalBlockView key={blockIndex} block={block} />
              ))}
            </DocProse>
          </li>
        ))}
      </ol>
    </article>
  );
}
