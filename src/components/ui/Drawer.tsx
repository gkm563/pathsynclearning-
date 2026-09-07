"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useDismiss, useFocusTrap, useScrollLock } from "@/hooks/useOverlay";

type Side = "left" | "right" | "bottom";

const sideClass: Record<Side, string> = {
  left: "inset-y-0 left-0 h-full w-[min(21rem,88vw)] border-r rounded-r-[var(--radius-xl)]",
  right:
    "inset-y-0 right-0 h-full w-[min(28rem,92vw)] border-l rounded-l-[var(--radius-xl)]",
  bottom:
    "inset-x-0 bottom-0 max-h-[88dvh] w-full border-t rounded-t-[var(--radius-xl)]",
};

const offscreen: Record<Side, { x?: string; y?: string }> = {
  left: { x: "-100%" },
  right: { x: "100%" },
  bottom: { y: "100%" },
};

/**
 * Side/bottom panel for secondary flows: navigation, filters, preference
 * panels. Same accessibility contract as `Dialog` (focus trap, scroll lock,
 * Escape, focus restore) but slides from an edge and doesn't dim as heavily,
 * since drawers usually keep the underlying page relevant.
 */
export function Drawer({
  open,
  onClose,
  title,
  description,
  side = "right",
  children,
  footer,
  className,
  hideHeader = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  side?: Side;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  hideHeader?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => setTarget(document.body), []);

  useScrollLock(open, true);
  useFocusTrap(panelRef, open);
  useDismiss({ ref: panelRef, active: open, onDismiss: onClose });

  if (!target) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0" style={{ zIndex: "var(--z-overlay)" }}>
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-[color-mix(in_srgb,var(--bg-inverse)_46%,transparent)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.15 }}
          />

          <motion.aside
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            className={cn(
              "absolute flex flex-col overflow-hidden border-line bg-surface shadow-[var(--shadow-xl)] outline-none",
              sideClass[side],
              className,
            )}
            initial={reduceMotion ? { opacity: 0 } : offscreen[side]}
            animate={reduceMotion ? { opacity: 1 } : { x: 0, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : offscreen[side]}
            transition={{
              duration: reduceMotion ? 0 : 0.26,
              ease: [0.05, 0.7, 0.1, 1],
            }}
          >
            <div
              className={cn(
                "flex shrink-0 items-start justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5",
                hideHeader && "sr-only",
              )}
            >
              <div className="min-w-0">
                <h2 id={titleId} className="type-h4 m-0 text-ink">
                  {title}
                </h2>
                {description ? (
                  <p
                    id={descriptionId}
                    className="type-caption mt-0.5 mb-0 text-muted"
                  >
                    {description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close panel"
                className="-mt-0.5 -mr-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-muted transition-colors hover:bg-sunken hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <X size={18} aria-hidden />
              </button>
            </div>

            <div
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5"
              data-overlay-scroll
            >
              {children}
            </div>

            {footer ? (
              <div className="shrink-0 border-t border-line bg-sunken px-4 py-3 sm:px-5">
                {footer}
              </div>
            ) : null}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>,
    target,
  );
}
