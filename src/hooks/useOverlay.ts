"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";

/**
 * Behavioural primitives shared by every overlay (Dialog, Drawer, Menu,
 * Popover). Keeping them here means accessibility is implemented once instead
 * of being re-derived — usually incorrectly — in each component.
 */

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "summary",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function focusableWithin(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (el) =>
      el.offsetWidth > 0 ||
      el.offsetHeight > 0 ||
      el === document.activeElement,
  );
}

/**
 * Locks body scroll while an overlay is open.
 *
 * Compensates for the disappearing scrollbar with padding so the page behind
 * the overlay doesn't shift horizontally. Reference-counted, so nested
 * overlays (a confirm dialog opened from a drawer) don't unlock early.
 */
let lockCount = 0;
let previousPaddingRight = "";
let previousOverflow = "";

export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;

    if (lockCount === 0) {
      const { body } = document;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      previousOverflow = body.style.overflow;
      previousPaddingRight = body.style.paddingRight;
      body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        const current = parseFloat(getComputedStyle(body).paddingRight) || 0;
        body.style.paddingRight = `${current + scrollbarWidth}px`;
      }
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        document.body.style.overflow = previousOverflow;
        document.body.style.paddingRight = previousPaddingRight;
      }
    };
  }, [active]);
}

/**
 * Traps Tab focus inside `ref` while active and restores focus to whatever was
 * focused beforehand on close — the behaviour screen-reader and keyboard users
 * expect from a modal.
 */
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean,
): void {
  const restoreTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;

    restoreTo.current = document.activeElement as HTMLElement | null;

    // Prefer an explicitly marked element, else the first focusable, else the
    // container itself so the dialog is announced rather than the page behind.
    const initial =
      node.querySelector<HTMLElement>("[data-autofocus]") ??
      focusableWithin(node)[0] ??
      node;
    initial.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusableWithin(node);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const activeEl = document.activeElement;

      if (event.shiftKey && (activeEl === first || !node.contains(activeEl))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeEl === last) {
        event.preventDefault();
        first.focus();
      }
    };

    node.addEventListener("keydown", onKeyDown);
    return () => {
      node.removeEventListener("keydown", onKeyDown);
      restoreTo.current?.focus?.({ preventScroll: true });
    };
  }, [ref, active]);
}

/**
 * Dismisses an overlay on Escape or on a pointer press outside of it.
 *
 * Uses `pointerdown` rather than `click` so dragging out of the overlay
 * doesn't dismiss it, and checks `composedPath` so clicks inside portalled
 * children still count as "inside".
 */
export function useDismiss({
  ref,
  active,
  onDismiss,
  closeOnEscape = true,
  closeOnOutside = true,
}: {
  ref: RefObject<HTMLElement | null>;
  active: boolean;
  onDismiss: () => void;
  closeOnEscape?: boolean;
  closeOnOutside?: boolean;
}): void {
  const dismiss = useCallback(onDismiss, [onDismiss]);

  useEffect(() => {
    if (!active) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === "Escape") {
        event.stopPropagation();
        dismiss();
      }
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!closeOnOutside) return;
      const node = ref.current;
      if (!node) return;
      const path = event.composedPath();
      if (!path.includes(node)) dismiss();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [ref, active, dismiss, closeOnEscape, closeOnOutside]);
}