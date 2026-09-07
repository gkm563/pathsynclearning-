"use client";

import {
  cloneElement,
  isValidElement,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

type Side = "top" | "bottom" | "left" | "right";

const sideClass: Record<Side, string> = {
  top: "bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2",
  bottom: "top-[calc(100%+6px)] left-1/2 -translate-x-1/2",
  left: "right-[calc(100%+6px)] top-1/2 -translate-y-1/2",
  right: "left-[calc(100%+6px)] top-1/2 -translate-y-1/2",
};

/**
 * Supplementary hint on hover or keyboard focus.
 *
 * Tooltips are never the only source of a control's accessible name — the
 * label is also wired via `aria-describedby`, and icon-only buttons should
 * still carry their own `aria-label`. Touch devices never fire hover, so this
 * must not hold information required to complete a task.
 */
export function Tooltip({
  label,
  side = "top",
  children,
  className,
}: {
  label: string;
  side?: Side;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReducedMotion();
  const id = useId();

  const show = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(true), 260);
  };

  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(false);
  };

  const child = isValidElement(children)
    ? cloneElement(children as ReactElement<{ "aria-describedby"?: string }>, {
        "aria-describedby": open ? id : undefined,
      })
    : children;

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocusCapture={show}
      onBlurCapture={hide}
    >
      {child}
      <AnimatePresence>
        {open ? (
          <motion.span
            role="tooltip"
            id={id}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.12 }}
            style={{ zIndex: "var(--z-popover)" }}
            className={cn(
              "type-caption pointer-events-none absolute w-max max-w-[16rem] rounded-[var(--radius-sm)] bg-inverse px-2 py-1 text-center font-medium text-on-inverse shadow-[var(--shadow-md)]",
              sideClass[side],
            )}
          >
            {label}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}
