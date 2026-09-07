"use client";

import {
  useCallback,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

export type TabItem<T extends string = string> = {
  id: T;
  label: string;
  icon?: ReactNode;
  /** Rendered as a count pill after the label. */
  badge?: number | string;
  disabled?: boolean;
};

/**
 * Keyboard handling shared by Tabs and Segmented.
 *
 * Implements the WAI-ARIA roving-tabindex pattern: arrows move between tabs,
 * Home/End jump to the ends, and disabled tabs are skipped. Without this,
 * tablists are unusable by keyboard.
 */
function useRovingTabs<T extends string>(
  items: TabItem<T>[],
  value: T,
  onChange: (id: T) => void,
) {
  const listRef = useRef<HTMLDivElement>(null);

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
      if (!keys.includes(event.key)) return;
      event.preventDefault();

      const enabled = items.filter((i) => !i.disabled);
      if (enabled.length === 0) return;

      const current = enabled.findIndex((i) => i.id === value);
      let nextIndex: number;

      if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = enabled.length - 1;
      else {
        const delta = event.key === "ArrowRight" ? 1 : -1;
        nextIndex = (current + delta + enabled.length) % enabled.length;
      }

      const next = enabled[nextIndex];
      onChange(next.id);
      listRef.current
        ?.querySelector<HTMLButtonElement>(`[data-tab-id="${next.id}"]`)
        ?.focus();
    },
    [items, value, onChange],
  );

  return { listRef, onKeyDown };
}

/**
 * Primary in-page section switcher.
 *
 * Underline treatment, horizontally scrollable when the labels outgrow the
 * viewport — the tab strip scrolls rather than wrapping into a second row,
 * which keeps the underline aligned to a single baseline.
 */
export function Tabs<const T extends string>({
  items,
  value,
  onChange,
  className,
  ariaLabel = "Sections",
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
  ariaLabel?: string;
}) {
  const { listRef, onKeyDown } = useRovingTabs(items, value, onChange);
  const baseId = useId();

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn(
        "hide-scrollbar flex w-full min-w-0 max-w-full gap-1 overflow-x-auto border-b border-line",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`${baseId}-tab-${item.id}`}
            data-tab-id={item.id}
            aria-selected={active}
            aria-controls={`${baseId}-panel-${item.id}`}
            tabIndex={active ? 0 : -1}
            disabled={item.disabled}
            onClick={() => onChange(item.id)}
            className={cn(
              "type-label relative inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap px-3 pt-2 pb-2.5 transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              "disabled:pointer-events-none disabled:opacity-40",
              active ? "text-primary" : "text-muted hover:text-ink",
            )}
          >
            {item.icon}
            {item.label}
            {item.badge !== undefined ? (
              <span
                className={cn(
                  "type-caption rounded-full px-1.5 py-px",
                  active
                    ? "bg-primary-soft text-primary"
                    : "bg-sunken text-muted",
                )}
              >
                {item.badge}
              </span>
            ) : null}
            {/* Underline is a child rather than a border so it can sit flush
                on top of the strip's own bottom border. */}
            <span
              aria-hidden
              className={cn(
                "absolute inset-x-1.5 -bottom-px h-0.5 rounded-full transition-opacity",
                active ? "bg-primary opacity-100" : "opacity-0",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

/**
 * Compact filled switch for 2–4 mutually exclusive options (range pickers,
 * sort order, view mode). Use `Tabs` when the options change page content
 * wholesale; use this when they refine what's already shown.
 */
export function Segmented<const T extends string>({
  items,
  value,
  onChange,
  size = "md",
  className,
  ariaLabel = "View",
  fullWidth = false,
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  size?: "sm" | "md";
  className?: string;
  ariaLabel?: string;
  fullWidth?: boolean;
}) {
  const { listRef, onKeyDown } = useRovingTabs(items, value, onChange);

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-[var(--radius-md)] border border-line bg-sunken p-1",
        fullWidth && "w-full",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            data-tab-id={item.id}
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            disabled={item.disabled}
            onClick={() => onChange(item.id)}
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] font-semibold whitespace-nowrap transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              "disabled:pointer-events-none disabled:opacity-40",
              size === "sm"
                ? "h-7 px-2.5 text-[12px]"
                : "h-8 px-3 text-[13px]",
              active
                ? "bg-surface text-ink shadow-[var(--shadow-xs)]"
                : "text-muted hover:text-ink",
            )}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/** Panel paired with `Tabs`; keeps the aria wiring in one place. */
export function TabPanel({
  active,
  children,
  className,
}: {
  active: boolean;
  children: ReactNode;
  className?: string;
}) {
  if (!active) return null;
  return (
    <div role="tabpanel" tabIndex={0} className={cn("outline-none", className)}>
      {children}
    </div>
  );
}
