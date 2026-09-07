"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Presentation primitives shared by the /platform sections.
 *
 * These own the page's vertical rhythm, content measure and reveal motion so
 * individual sections only describe their content. Every colour, radius and
 * duration reads from the token layer in `globals.css`.
 */

export type SectionTone = "canvas" | "surface" | "sunken" | "inverse";
export type KickerVariant = "primary" | "accent" | "inverse";

const TONE_CLASS: Record<SectionTone, string> = {
  canvas: "bg-canvas text-ink",
  surface: "border-y border-line bg-surface text-ink",
  sunken: "border-y border-line bg-sunken text-ink",
  inverse: "bg-inverse text-on-inverse",
};

/**
 * Body copy on the inverse surface can't use `text-muted` — that token is
 * tuned for light backgrounds. Fading the inverse ink keeps the contrast
 * ratio without introducing a second palette.
 */
export function bodyClass(tone: SectionTone): string {
  return tone === "inverse" ? "text-on-inverse/75" : "text-muted";
}

export function headingClass(tone: SectionTone): string {
  return tone === "inverse" ? "text-on-inverse" : "text-ink";
}

/** Full-bleed band with a centred, measure-constrained content column. */
export function SectionBlock({
  id,
  tone = "canvas",
  labelledBy,
  className,
  children,
}: {
  id?: string;
  tone?: SectionTone;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        // scroll-mt keeps in-page anchors clear of the sticky header.
        "scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24",
        TONE_CLASS[tone],
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[var(--measure-content)]">
        {children}
      </div>
    </section>
  );
}

const KICKER_CLASS: Record<KickerVariant, string> = {
  primary: "border-primary-border bg-primary-soft text-primary",
  accent: "border-accent/25 bg-accent-soft text-accent",
  inverse: "border-on-inverse/20 bg-on-inverse/10 text-on-inverse/80",
};

/** Section eyebrow. Purely typographic — no icons, no gradient pills. */
export function Kicker({
  variant = "primary",
  children,
}: {
  variant?: KickerVariant;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "type-overline inline-flex items-center rounded-full border px-2.5 py-1",
        KICKER_CLASS[variant],
      )}
    >
      {children}
    </span>
  );
}

/**
 * Scroll reveal. Deliberately small and quick; collapses to a no-op when the
 * visitor has asked for reduced motion.
 */
export function Reveal({
  delay = 0,
  className,
  children,
}: {
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{
        duration: reduceMotion ? 0 : 0.28,
        delay: reduceMotion ? 0 : delay,
        ease: [0.05, 0.7, 0.1, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Fixed-ratio image frame. The ratio lives on the wrapper so the space is
 * reserved before the Unsplash asset arrives and nothing shifts on load.
 */
export function MediaFrame({
  src,
  alt,
  ratioClass = "aspect-[16/10]",
  className,
}: {
  src: string;
  alt: string;
  ratioClass?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-lg)] border border-line bg-sunken",
        ratioClass,
        className,
      )}
    >
      <img
        src={src}
        alt={alt}
        width={1600}
        height={1000}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

/** Copy/media pair that stacks below `lg`. Media can lead on wide screens. */
export function SplitRow({
  media,
  mediaFirst = false,
  children,
  className,
}: {
  media: ReactNode;
  mediaFirst?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid items-center gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-14",
        className,
      )}
    >
      <div className={cn("min-w-0", mediaFirst && "lg:order-2")}>{children}</div>
      <div className={cn("min-w-0", mediaFirst && "lg:order-1")}>{media}</div>
    </div>
  );
}

/** Centred section intro for the full-width, non-split bands. */
export function CenteredIntro({
  headingId,
  kicker,
  kickerVariant,
  title,
  lead,
  tone = "canvas",
}: {
  headingId: string;
  kicker: string;
  kickerVariant?: KickerVariant;
  title: string;
  lead: string;
  tone?: SectionTone;
}) {
  return (
    <Reveal className="mx-auto max-w-[46rem] text-center">
      <Kicker variant={kickerVariant}>{kicker}</Kicker>
      <h2 id={headingId} className={cn("type-h1 mt-5", headingClass(tone))}>
        {title}
      </h2>
      <p className={cn("type-body-lg mt-4", bodyClass(tone))}>{lead}</p>
    </Reveal>
  );
}
