"use client";

import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/cn";

/**
 * Shared marketing helpers, re-skinned onto the design tokens.
 *
 * Exported names and prop signatures are frozen — several marketing views call
 * these. The old per-call colour props (`bg`, `border`, `color`, `c`,
 * `hoverColor`) each carried a hardcoded hex value, so they are still accepted
 * for source compatibility but no longer applied; pass `tone` instead.
 */

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

type ChipTone =
  | "primary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "neutral";

const CHIP_TONE: Record<ChipTone, string> = {
  primary: "border-primary-border bg-primary-soft text-primary",
  accent: "border-accent/25 bg-accent-soft text-accent",
  info: "border-info/25 bg-info-soft text-info",
  success: "border-success/25 bg-success-soft text-success",
  warning: "border-warning/25 bg-warning-soft text-warning",
  neutral: "border-line bg-sunken text-muted",
};

interface ChipProps {
  /** Legacy hex override — ignored. */
  bg?: string;
  /** Legacy hex override — ignored. */
  border?: string;
  /** Legacy hex override — ignored. */
  color?: string;
  tone?: ChipTone;
  children: ReactNode;
  className?: string;
}

export function Chip({ tone = "primary", children, className }: ChipProps) {
  return (
    <span
      className={cn(
        "type-overline inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1",
        CHIP_TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

interface HoverCardProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
}

export function HoverCard({
  children,
  style,
  className,
  onMouseEnter,
  onMouseLeave,
}: HoverCardProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      whileHover={reduced ? undefined : { y: -3 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "min-w-0 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-sm)]",
        className,
      )}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </motion.div>
  );
}

interface InteractiveCardProps {
  children: ReactNode;
  style?: CSSProperties;
  delay?: number;
  /** Legacy hex override — ignored. */
  hoverColor?: string;
  className?: string;
}

export function InteractiveCard({
  children,
  style,
  delay = 0,
  className,
}: InteractiveCardProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? undefined : { opacity: 0, y: 12 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.28, delay }}
      whileHover={reduced ? undefined : { y: -3 }}
      className={cn(
        "min-w-0 rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-xs)]",
        className,
      )}
      style={style}
    >
      {children}
    </motion.div>
  );
}

type BarTone = "primary" | "accent" | "info" | "success" | "warning";

const BAR_TONE: Record<BarTone, string> = {
  primary: "bg-primary",
  accent: "bg-accent",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
};

interface SkillBarProps {
  label?: string;
  pct: number;
  /** Legacy hex override — ignored. */
  c?: string;
  tone?: BarTone;
  delay?: number;
}

/**
 * Proficiency meter. The fill width is the one genuinely computed style here;
 * under reduced motion it lands on its final value with no transition.
 */
export function SkillBar({
  label,
  pct,
  tone = "primary",
  delay = 0,
}: SkillBarProps) {
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (reduced) {
      setWidth(pct);
      return;
    }
    const timer = window.setTimeout(() => setWidth(pct), 260 + delay);
    return () => window.clearTimeout(timer);
  }, [pct, delay, reduced]);

  return (
    <div className={cn("min-w-0", label && "mb-3")}>
      {label ? (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <span className="type-small min-w-0 truncate text-muted">{label}</span>
          <span className="type-caption type-numeric shrink-0 font-semibold text-ink">
            {pct}%
          </span>
        </div>
      ) : (
        <span className="sr-only">{pct}% complete</span>
      )}
      <div className="h-1.5 overflow-hidden rounded-full bg-sunken" aria-hidden>
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-entrance)] motion-reduce:transition-none",
            BAR_TONE[tone],
          )}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

interface RoleCardProps {
  icon: ReactNode;
  title: string;
  tagline: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}

/**
 * One option in the hero's role chooser. Renders as a real `radio` with a
 * roving tab index so the group is a single tab stop and arrow-key navigable —
 * the containing `radiogroup` owns the key handling.
 */
export function RoleCard({
  icon,
  title,
  tagline,
  desc,
  active,
  onClick,
}: RoleCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      tabIndex={active ? 0 : -1}
      onClick={onClick}
      className={cn(
        "group flex min-h-11 min-w-0 flex-col rounded-[var(--radius-lg)] border p-5 text-left",
        "transition-[background-color,border-color,box-shadow,transform] duration-[var(--duration-normal)] ease-[var(--ease-standard)]",
        "hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none",
        FOCUS_RING,
        active
          ? "border-primary bg-surface shadow-[var(--shadow-md)]"
          : "border-line bg-surface/60 shadow-[var(--shadow-xs)] hover:border-line-strong hover:bg-surface",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "mb-4 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] transition-colors duration-[var(--duration-fast)]",
          active
            ? "bg-primary text-on-primary"
            : "bg-sunken text-muted group-hover:text-ink",
        )}
      >
        {icon}
      </span>
      <span className="type-h3 text-ink">{title}</span>
      <span className="type-overline mt-1.5 text-primary">{tagline}</span>
      <span className="type-small mt-2 text-muted">{desc}</span>
      <span
        aria-hidden
        className={cn(
          "mt-4 h-px w-8 transition-colors duration-[var(--duration-fast)]",
          active ? "bg-accent" : "bg-line",
        )}
      />
    </button>
  );
}

interface RecruiterValidationSectionProps {
  tag?: string;
  title?: ReactNode;
  desc1?: string;
  desc2?: string;
  img?: string;
}

export function RecruiterValidationSection({
  tag = "Recruiter verified",
  title = (
    <>
      Transparent skills.
      <br />
      Assured placements.
    </>
  ),
  desc1 = "Your hard work doesn't go unnoticed. PathEd gives authorized recruiters direct visibility into your verified performance, skill roadmap, and CRI scores.",
  desc2 = "By validating your skills through our uncompromising metrics, you bypass traditional hiring friction and connect directly with companies looking for true, demonstrable readiness.",
  img = "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80",
}: RecruiterValidationSectionProps) {
  return (
    <section className="border-y border-line bg-surface px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-[var(--measure-content)] items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="min-w-0">
          <Chip>{tag}</Chip>
          <h2 className="type-h1 mt-5 text-ink">{title}</h2>
          <p className="type-body-lg type-prose mt-5 text-muted">{desc1}</p>
          {desc2 ? (
            <p className="type-body-lg type-prose mt-4 text-muted">{desc2}</p>
          ) : null}
        </div>
        <HoverCard className="relative aspect-[4/3] w-full">
          <Image
            src={img}
            alt="Recruiter reviewing a candidate's verified skill profile"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 560px"
          />
        </HoverCard>
      </div>
    </section>
  );
}

interface QuoteSectionProps {
  quote: string;
  author: string;
  role: string;
}

export function QuoteSection({ quote, author, role }: QuoteSectionProps) {
  return (
    <section className="border-y border-line bg-sunken px-4 py-16 sm:px-6 sm:py-20">
      <figure className="mx-auto max-w-[46rem] text-center">
        <blockquote className="type-h1 m-0 font-medium text-ink">
          {`“${quote}”`}
        </blockquote>
        <figcaption className="mt-8 flex flex-col items-center gap-1.5">
          <span className="type-label text-ink">{author}</span>
          <span className="type-overline text-muted">{role}</span>
        </figcaption>
      </figure>
    </section>
  );
}
