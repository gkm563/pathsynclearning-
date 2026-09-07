"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useDismiss, useFocusTrap, useScrollLock } from "@/hooks/useOverlay";
import { Button } from "./primitives";

type DialogSize = "sm" | "md" | "lg" | "xl" | "full";

const sizeClass: Record<DialogSize, string> = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
  full: "sm:max-w-[min(1200px,calc(100vw-4rem))]",
};

/** Portals into `document.body`, but only after mount so SSR stays happy. */
function usePortalTarget(): HTMLElement | null {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => setTarget(document.body), []);
  return target;
}

/**
 * The single modal in the product.
 *
 * Handles scroll lock, focus trap, focus restore, Escape, backdrop dismissal,
 * reduced motion and mobile layout. On viewports below `sm` it presents as a
 * bottom sheet — a full-width centred card is uncomfortable to reach on a
 * phone, and sheets give the close affordance a predictable position.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  size = "md",
  footer,
  children,
  className,
  dismissible = true,
  hideHeader = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  size?: DialogSize;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Set false for destructive/in-flight work that must not be dismissed by accident. */
  dismissible?: boolean;
  /** Hides the visual header but keeps the accessible name. */
  hideHeader?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const target = usePortalTarget();
  const reduceMotion = useReducedMotion();
  const titleId = useId();
  const descriptionId = useId();

  useScrollLock(open, true);
  useFocusTrap(panelRef, open);
  useDismiss({
    ref: panelRef,
    active: open && dismissible,
    onDismiss: onClose,
  });

  if (!target) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 flex items-end justify-center p-0 sm:items-center sm:p-6"
          style={{ zIndex: "var(--z-modal)" }}
        >
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-[color-mix(in_srgb,var(--bg-inverse)_58%,transparent)] backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.15 }}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            tabIndex={-1}
            className={cn(
              "relative flex max-h-[92dvh] w-full flex-col overflow-hidden bg-surface shadow-[var(--shadow-xl)] outline-none",
              // Bottom sheet on phones, centred card from `sm` up.
              "rounded-t-[var(--radius-xl)] sm:rounded-[var(--radius-lg)]",
              "border border-line",
              sizeClass[size],
              className,
            )}
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.99 }
            }
            transition={{
              duration: reduceMotion ? 0 : 0.22,
              ease: [0.05, 0.7, 0.1, 1],
            }}
          >
            {/* Grab affordance for the mobile sheet presentation. */}
            <div
              aria-hidden
              className="mx-auto mt-2.5 h-1 w-9 shrink-0 rounded-full bg-line-strong sm:hidden"
            />

            <div
              className={cn(
                "flex items-start justify-between gap-4 px-5 pt-4 pb-3 sm:px-6 sm:pt-5",
                hideHeader && "sr-only",
              )}
            >
              <div className="min-w-0">
                <h2 id={titleId} className="type-h3 m-0 text-ink">
                  {title}
                </h2>
                {description ? (
                  <p
                    id={descriptionId}
                    className="type-small mt-1 mb-0 text-muted"
                  >
                    {description}
                  </p>
                ) : null}
              </div>
              {dismissible ? (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="-mt-1 -mr-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-muted transition-colors hover:bg-sunken hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <X size={18} aria-hidden />
                </button>
              ) : null}
            </div>

            <div
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 sm:px-6"
              data-overlay-scroll
            >
              {children}
            </div>

            {footer ? (
              <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-line bg-sunken px-5 py-3.5 sm:flex-row sm:justify-end sm:px-6">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    target,
  );
}

/**
 * Confirmation for irreversible actions. Keeps the confirm button in a loading
 * state and blocks dismissal while the action is in flight, so a slow request
 * can't be double-submitted.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "primary",
  loading = false,
  confirmDisabled = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "primary" | "danger";
  loading?: boolean;
  confirmDisabled?: boolean;
  children?: ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  const pending = busy || loading;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      dismissible={!pending}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            loading={pending}
            disabled={confirmDisabled}
            data-autofocus
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
              } finally {
                setBusy(false);
              }
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Dialog>
  );
}
