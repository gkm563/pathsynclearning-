"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { homeUi } from "./tokens";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      delay: Number(i) * 0.06,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

export function HomeSection({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.section
      className={`${homeUi.section} ${className}`.trim()}
      custom={delay}
      variants={fadeUp}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.section>
  );
}

const LABEL_TONE = {
  teal: "text-[#0f766e]",
  ocean: "text-[#0369a1]",
  amber: "text-[#d97706]",
  muted: "text-[var(--text-muted)]",
} as const;

export function SectionLabel({
  children,
  tone = "teal",
}: {
  children: ReactNode;
  tone?: "teal" | "ocean" | "amber" | "muted";
}) {
  return (
    <div
      className={`mb-2 font-['Fira_Code',monospace] text-[11px] font-bold tracking-[0.12em] uppercase ${LABEL_TONE[tone]}`}
    >
      {children}
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div className={homeUi.page} aria-busy="true" aria-label="Loading dashboard">
      <div className={`${homeUi.skel} h-[240px]`} />
      <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1 min-[901px]:grid-cols-4">
        <div className={`${homeUi.skel} h-40`} />
        <div className={`${homeUi.skel} h-40`} />
        <div className={`${homeUi.skel} h-40`} />
        <div className={`${homeUi.skel} h-40`} />
      </div>
      <div className="grid grid-cols-1 gap-3.5 min-[901px]:grid-cols-2">
        <div className={`${homeUi.skel} h-[280px]`} />
        <div className={`${homeUi.skel} h-[280px]`} />
      </div>
    </div>
  );
}
