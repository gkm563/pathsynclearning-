"use client";

import Link from "next/link";
import {
  Flame,
  Gauge,
  Map as MapIcon,
  Radio,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Chip, SkillBar } from "../../../components/ui/Shared";
import { routes } from "@/lib/routes";

type Pillar = {
  icon: LucideIcon;
  stat: string;
  label: string;
  sub: string;
};

const PILLARS: readonly Pillar[] = [
  {
    icon: MapIcon,
    stat: "4yr",
    label: "Visual roadmap",
    sub: "Day 1 → placement",
  },
  { icon: Gauge, stat: "2×", label: "Dual metrics", sub: "CGPA + CRI live" },
  { icon: Zap, stat: "∞", label: "Daily challenges", sub: "Gamified XP engine" },
  { icon: Users, stat: "24/7", label: "Teacher connect", sub: "Beat every plateau" },
];

type NewsItem = {
  headline: string;
  tag: string;
  tone: "success" | "primary" | "info";
  time: string;
};

const NEWS: readonly NewsItem[] = [
  {
    headline: "OpenAI releases o3 API for enterprise developers",
    tag: "AI nodes updated",
    tone: "success",
    time: "2h ago",
  },
  {
    headline: "Google plans 2,000 DevOps hires in Q2 2025",
    tag: "CRI DevOps ↑12%",
    tone: "primary",
    time: "5h ago",
  },
  {
    headline: "Meta open-sources new LLaMA 4 architecture",
    tag: "ML roadmap refreshed",
    tone: "info",
    time: "1d ago",
  },
];

/** Deterministic so the heatmap is identical on the server and the client. */
const pseudoRandom = (seed: number) => {
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const HEAT_STEPS = [
  "bg-primary/10",
  "bg-primary/25",
  "bg-primary/45",
  "bg-primary/70",
];

const heatClass = (i: number) => {
  const v = pseudoRandom(i);
  if (v < 0.3) return HEAT_STEPS[0];
  if (v < 0.55) return HEAT_STEPS[1];
  if (v < 0.8) return HEAT_STEPS[2];
  return HEAT_STEPS[3];
};

export default function WhyPathEd() {
  return (
    <section
      aria-labelledby="why-heading"
      className="px-4 py-16 sm:px-6 sm:py-20 lg:py-24"
    >
      <div className="mx-auto grid max-w-[var(--measure-content)] gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="min-w-0">
          <p className="type-overline text-primary">Why PathEd</p>
          <h2 id="why-heading" className="type-h1 mt-3 text-ink">
            One platform. Infinite directions.
          </h2>
          <p className="type-body-lg type-prose mt-4 text-muted">
            The only platform that simultaneously optimizes your CGPA and Career
            Readiness Index. No compromises.
          </p>

          <div className="mt-8 rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-xs)] sm:p-6">
            <p className="type-overline text-faint">
              Consistency heatmap — 12 weeks
            </p>
            <div
              aria-hidden
              className="mt-4 grid grid-cols-[repeat(14,minmax(0,1fr))] gap-[3px]"
            >
              {Array.from({ length: 98 }, (_, i) => (
                <span
                  key={i}
                  className={`aspect-square rounded-[2px] ${heatClass(i)}`}
                />
              ))}
            </div>
            <p className="type-caption mt-3 text-faint">
              98 tracked days · darker cells are higher-output days.
            </p>
          </div>

          <div className="mt-5 rounded-[var(--radius-lg)] border border-warning/25 bg-warning-soft p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="type-overline inline-flex items-center gap-1.5 text-warning">
                <Zap size={13} aria-hidden />
                Today’s challenge
              </p>
              <Chip tone="warning">+150 XP</Chip>
            </div>
            <h3 className="type-h4 mt-3 text-ink">
              Implement Binary Search Tree
            </h3>
            <p className="type-small mt-1 text-muted">
              DSA · Medium · 45 min estimated
            </p>
            <div className="mt-4">
              <SkillBar pct={68} tone="warning" delay={200} />
            </div>
            <p className="type-caption mt-3 inline-flex items-center gap-1.5 font-semibold text-warning">
              <Flame size={13} aria-hidden />
              7-day streak
            </p>
          </div>
        </div>

        <div className="min-w-0">
          <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2">
            {PILLARS.map((pillar) => (
              <li
                key={pillar.label}
                className="min-w-0 rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] duration-[var(--duration-normal)] hover:border-line-strong hover:shadow-[var(--shadow-sm)] motion-reduce:transition-none"
              >
                <span
                  aria-hidden
                  className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-primary-soft text-primary"
                >
                  <pillar.icon size={17} strokeWidth={1.75} />
                </span>
                <p className="type-h2 type-numeric mt-3 text-ink">
                  {pillar.stat}
                </p>
                <p className="type-h4 mt-1 text-ink">{pillar.label}</p>
                <p className="type-small mt-1 text-muted">{pillar.sub}</p>
              </li>
            ))}
          </ul>

          <div className="mt-4 rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-xs)] sm:p-6">
            <p className="type-overline inline-flex items-center gap-1.5 text-accent">
              <Radio size={13} aria-hidden />
              Tech news — live
            </p>
            <ul className="mt-4 list-none divide-y divide-line p-0">
              {NEWS.map((item) => (
                <li key={item.headline} className="min-w-0 py-3 first:pt-0">
                  <p className="type-body font-medium text-ink">
                    {item.headline}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Chip tone={item.tone}>{item.tag}</Chip>
                    <span className="type-caption text-faint">{item.time}</span>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              href={routes.marketing.blog}
              className="type-label mt-4 inline-flex min-h-11 items-center rounded-[var(--radius-sm)] text-primary transition-colors duration-[var(--duration-fast)] hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
            >
              Read the feed
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
