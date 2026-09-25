"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (reducedMotion || !mounted) {
    return as === "li" ? (
      <li className={className}>{children}</li>
    ) : (
      <div className={className}>{children}</div>
    );
  }

  const transition = { duration: 0.28, delay, ease: ENTRANCE_EASE };

  return as === "li" ? (
    <motion.li
      className={className}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={transition}
    >
      {children}
    </motion.li>
  ) : (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
