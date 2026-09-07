"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  HeaderSkeleton,
  Section,
  Skeleton,
  StatGridSkeleton,
} from "@/components/ui";

/**
 * Pieces shared by the student-home widgets: the section wrapper that owns the
 * page rhythm, the animated metric, and the boot skeleton.
 */

/**
 * A titled band on the home page.
 *
 * Delegates the heading, spacing and `aria-labelledby` wiring to the design
 * system `Section` and adds only a short entrance fade, staggered by `delay`
 * so the page settles top-to-bottom instead of appearing all at once.
 */
export function HomeSection({
  title,
  description,
  actions,
  delay = 0,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  /** Stagger index — multiplied by 40ms. */
  delay?: number;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <Section title={title} description={description} actions={actions}>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reduceMotion ? 0 : 0.24,
          delay: reduceMotion ? 0 : delay * 0.04,
          ease: [0.05, 0.7, 0.1, 1],
        }}
      >
        {children}
      </motion.div>
    </Section>
  );
}

/**
 * A metric that counts up to its value on mount.
 *
 * The animated digits are `aria-hidden` and the authoritative value is
 * mirrored into a polite live region, so assistive tech reads the final
 * number once rather than every intermediate frame — and reads the new one
 * after a refresh. Under reduced motion the value renders immediately.
 */
export function CountUp({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const safe = Number.isFinite(value) ? Math.round(value) : 0;
  const [display, setDisplay] = useState(safe);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(safe);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 320);
      setDisplay(Math.round(safe * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [safe, reduceMotion]);

  return (
    <span className={className}>
      <span aria-hidden>
        {display.toLocaleString()}
        {suffix}
      </span>
      <span className="sr-only" aria-live="polite">
        {safe.toLocaleString()}
        {suffix}
      </span>
    </span>
  );
}

/**
 * Boot skeleton for `/dashboard`.
 *
 * Mirrors the real layout — header, four metrics, the primary-action pair,
 * the trend row, the calendar and the briefing row — so the page doesn't
 * reflow when data lands.
 */
export function HomeSkeleton() {
  return (
    <div role="status" aria-label="Loading your dashboard">
      <span className="sr-only">Loading your dashboard…</span>

      <HeaderSkeleton />
      <StatGridSkeleton />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 lg:grid-cols-12">
        <Skeleton className="h-52 lg:col-span-5" />
        <Skeleton className="h-52 lg:col-span-7" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 lg:grid-cols-12">
        <Skeleton className="h-64 lg:col-span-4" />
        <Skeleton className="h-64 lg:col-span-8" />
      </div>

      <Skeleton className="mt-8 h-56 w-full sm:mt-10" />

      <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 lg:grid-cols-12">
        <Skeleton className="h-60 lg:col-span-5" />
        <Skeleton className="h-60 lg:col-span-7" />
      </div>
    </div>
  );
}
