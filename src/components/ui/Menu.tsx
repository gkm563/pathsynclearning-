"use client";

import {
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { useDismiss } from "@/hooks/useOverlay";

export type MenuItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  onSelect?: () => void;
  href?: string;
  tone?: "default" | "danger";
  disabled?: boolean;
  /** Renders a check mark — for single-select menus like sort order. */
  selected?: boolean;
};

export type MenuGroup = { id: string; label?: string; items: MenuItem[] };

/**
 * Dropdown menu anchored to a trigger.
 *
 * The trigger is supplied as a render prop so callers keep control of its
 * appearance (avatar, icon button, text button) while this component owns the
 * open/close state, outside-press dismissal, Escape and arrow-key navigation.
 */
export function Menu({
  trigger,
  groups,
  align = "end",
  className,
  ariaLabel = "Menu",
}: {
  trigger: (props: {
    open: boolean;
    toggle: () => void;
    ref: React.Ref<HTMLButtonElement>;
  }) => ReactNode;
  groups: MenuGroup[];
  align?: "start" | "end";
  className?: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useDismiss({
    ref: wrapperRef,
    active: open,
    onDismiss: () => {
      setOpen(false);
      triggerRef.current?.focus({ preventScroll: true });
    },
  });

  const flatItems = groups.flatMap((g) => g.items).filter((i) => !i.disabled);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();

    const nodes = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>("[data-menu-item]") ?? [],
    );
    if (nodes.length === 0) return;

    const current = nodes.indexOf(document.activeElement as HTMLElement);
    let next: number;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = nodes.length - 1;
    else if (event.key === "ArrowDown")
      next = current < 0 ? 0 : (current + 1) % nodes.length;
    else next = current <= 0 ? nodes.length - 1 : current - 1;

    nodes[next]?.focus();
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      {trigger({
        open,
        toggle: () => setOpen((v) => !v),
        ref: triggerRef,
      })}

      <AnimatePresence>
        {open ? (
          <motion.div
            ref={listRef}
            role="menu"
            aria-label={ariaLabel}
            onKeyDown={onKeyDown}
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.99 }
            }
            transition={{ duration: reduceMotion ? 0 : 0.14 }}
            style={{ zIndex: "var(--z-dropdown)" }}
            className={cn(
              "absolute top-[calc(100%+6px)] max-h-[min(24rem,70vh)] w-[min(15rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-[var(--radius-md)] border border-line bg-surface p-1 shadow-[var(--shadow-lg)]",
              align === "end" ? "right-0" : "left-0",
            )}
          >
            {groups.map((group, groupIndex) => (
              <div key={group.id}>
                {groupIndex > 0 ? (
                  <div
                    role="separator"
                    className="my-1 h-px bg-line"
                    aria-hidden
                  />
                ) : null}
                {group.label ? (
                  <p className="type-overline px-2.5 pt-2 pb-1 text-faint">
                    {group.label}
                  </p>
                ) : null}
                {group.items.map((item) => {
                  const content = (
                    <>
                      {item.icon ? (
                        <span className="shrink-0" aria-hidden>
                          {item.icon}
                        </span>
                      ) : null}
                      <span className="min-w-0 flex-1 truncate text-left">
                        {item.label}
                      </span>
                      {item.selected ? (
                        <Check size={14} className="shrink-0" aria-hidden />
                      ) : null}
                    </>
                  );

                  const itemClass = cn(
                    "type-label flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2.5 py-2 transition-colors",
                    "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                    item.disabled && "pointer-events-none opacity-40",
                    item.tone === "danger"
                      ? "text-danger hover:bg-danger-soft"
                      : "text-ink hover:bg-sunken",
                  );

                  const close = () => {
                    setOpen(false);
                    item.onSelect?.();
                  };

                  return item.href ? (
                    <a
                      key={item.id}
                      href={item.href}
                      role="menuitem"
                      data-menu-item
                      tabIndex={-1}
                      className={itemClass}
                      onClick={close}
                    >
                      {content}
                    </a>
                  ) : (
                    <button
                      key={item.id}
                      type="button"
                      role="menuitem"
                      data-menu-item
                      tabIndex={-1}
                      disabled={item.disabled}
                      className={itemClass}
                      onClick={close}
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            ))}
            {flatItems.length === 0 ? (
              <p className="type-small px-2.5 py-3 text-center text-muted">
                Nothing available
              </p>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
