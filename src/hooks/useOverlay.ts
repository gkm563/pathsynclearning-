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
 * Locks page scroll while an overlay is open.
 *
 * Body `overflow: hidden` is not enough: nested panes (`overflow: auto` on
 * the dashboard, IDE, roadmap) still wheel-scroll underneath. We also block
 * wheel/touch outside the top overlay and freeze `[data-app-overlay]` while a
 * modal/drawer (`isolate`) is open so the layer below cannot move.
 *
 * Reference-counted, so nested overlays don't unlock early.
 */
let lockCount = 0;
let isolateCount = 0;
let previousPaddingRight = "";
let previousOverflow = "";
let previousHtmlOverflow = "";
let previousHtmlOverscroll = "";

function allowOverlayScroll(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  if (target.closest("[data-overlay-scroll]")) return true;
  if (isolateCount === 0 && target.closest("[data-app-overlay]")) return true;
  return false;
}

function onLockedScroll(event: WheelEvent | TouchEvent) {
  if (allowOverlayScroll(event.target)) return;
  event.preventDefault();
}

function syncOverlayLockAttrs() {
  const html = document.documentElement;
  if (lockCount > 0) html.setAttribute("data-overlay-lock", "");
  else html.removeAttribute("data-overlay-lock");
  if (isolateCount > 0) html.setAttribute("data-modal-open", "");
  else html.removeAttribute("data-modal-open");
}

export function useScrollLock(active: boolean, isolate = false): void {
  useEffect(() => {
    if (!active) return;

    if (lockCount === 0) {
      const { body } = document;
      const html = document.documentElement;
      const scrollbarWidth = window.innerWidth - html.clientWidth;
      previousOverflow = body.style.overflow;
      previousHtmlOverflow = html.style.overflow;
      previousHtmlOverscroll = html.style.overscrollBehavior;
      previousPaddingRight = body.style.paddingRight;
      body.style.overflow = "hidden";
      html.style.overflow = "hidden";
      html.style.overscrollBehavior = "none";
      if (scrollbarWidth > 0) {
        const current = parseFloat(getComputedStyle(body).paddingRight) || 0;
        body.style.paddingRight = `${current + scrollbarWidth}px`;
      }
      document.addEventListener("wheel", onLockedScroll, { passive: false });
      document.addEventListener("touchmove", onLockedScroll, { passive: false });
    }
    lockCount += 1;
    if (isolate) isolateCount += 1;
    syncOverlayLockAttrs();

    return () => {
      if (isolate) isolateCount -= 1;
      lockCount -= 1;
      if (lockCount === 0) {
        document.body.style.overflow = previousOverflow;
        document.body.style.paddingRight = previousPaddingRight;
        document.documentElement.style.overflow = previousHtmlOverflow;
        document.documentElement.style.overscrollBehavior = previousHtmlOverscroll;
        document.removeEventListener("wheel", onLockedScroll);
        document.removeEventListener("touchmove", onLockedScroll);
      }
      syncOverlayLockAttrs();
    };
  }, [active, isolate]);
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