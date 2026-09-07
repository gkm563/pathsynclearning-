"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Scroll reveal used across the /company sections.
 *
 * Fires once, moves a short distance and finishes inside the design-system
 * motion budget. When the visitor asks for reduced motion the wrapper degrades
 * to a plain element so nothing animates at all.
 */

type RevealTag = "div" | "li";

const ENTRANCE_EASE: [number, number, number, number] = [0.05, 0.7, 0.1, 1];

export function Reveal({
  as = "div",
  children,
  className,
  delay = 0,
}: {
  as?: RevealTag;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return as === "li" ? (
      <li className={className}>{children}</li>
    ) : (
      <div className={className}>{children}</div>
    );
  }

  const transition = { duration: 0.28, delay, ease: ENTRANCE_EASE };
  const initial = { opacity: 0, y: 10 };
  const whileInView = { opacity: 1, y: 0 };
  const viewport = { once: true, amount: 0.2 };

  return as === "li" ? (
    <motion.li
      className={className}
      initial={initial}
      whileInView={whileInView}
      viewport={viewport}
      transition={transition}
    >
      {children}
    </motion.li>
  ) : (
    <motion.div
      className={className}
      initial={initial}
      whileInView={whileInView}
      viewport={viewport}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
