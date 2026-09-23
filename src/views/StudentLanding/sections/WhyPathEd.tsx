"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Flame,
  Gauge,
  Map as MapIcon,
  Radio,
  Users,
  Zap,
  ExternalLink,
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
  url?: string;
};

const INITIAL_NEWS: readonly NewsItem[] = [
  {
    headline: "OpenAI & Anthropic launch next-gen AI developer models",
    tag: "AI & ML",
    tone: "success",
    time: "2h ago",
  },
  {
    headline: "Google & Microsoft announce 5,000+ cloud engineering roles",
    tag: "DEVOPS & CLOUD",
    tone: "primary",
    time: "4h ago",
  },
  {
    headline: "Next.js 15 & React 19 transform full-stack web architecture",
    tag: "WEB DEV",
    tone: "info",
    time: "1d ago",
  },
];

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
  const [news, setNews] = useState<readonly NewsItem[]>(INITIAL_NEWS);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/public/tech-news")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.articles && Array.isArray(data.articles) && data.articles.length > 0) {
          setNews(data.articles);
        }
      })
      .catch(() => {
        // Fallback remains INITIAL_NEWS
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      aria-labelledby="why-heading"
      className="px-4 py-16 sm:px-6 sm:py-20 lg:py-24"
    >
      <div className="mx-auto grid max-w-[var(--measure-content)] gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="min-w-0">
          <p className="type-overline text-primary font-bold tracking-wider">Why PathSync Learning</p>
          <h2 id="why-heading" className="type-h1 mt-3 text-ink font-bold">
            One platform. Infinite directions.
          </h2>
          <p className="type-body-lg type-prose mt-4 text-muted">
            The only platform that simultaneously optimizes your academic performance and real-world Career Readiness Index. No compromises.
          </p>

          <div className="mt-8 rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6">
            <p className="type-overline text-faint font-semibold tracking-wider">
              Consistency Heatmap — 12 Weeks
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

          <div className="mt-5 rounded-2xl border border-warning/30 bg-warning-soft p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="type-overline inline-flex items-center gap-1.5 text-warning font-bold">
                <Zap size={15} aria-hidden />
                Today’s Challenge
              </p>
              <Chip tone="warning">+150 XP</Chip>
            </div>
            <h3 className="type-h4 mt-3 text-ink font-bold">
              Implement Binary Search Tree & Balance Algorithm
            </h3>
            <p className="type-small mt-1 text-muted">
              DSA · Medium · 45 min estimated
            </p>
            <div className="mt-4">
              <SkillBar pct={68} tone="warning" delay={200} />
            </div>
            <p className="type-caption mt-3 inline-flex items-center gap-1.5 font-bold text-warning">
              <Flame size={15} aria-hidden />
              7-day active streak
            </p>
          </div>
        </div>

        <div className="min-w-0">
          <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2">
            {PILLARS.map((pillar) => (
              <li
                key={pillar.label}
                className="min-w-0 rounded-2xl border border-line bg-surface p-5 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-md motion-reduce:transition-none"
              >
                <span
                  aria-hidden
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary"
                >
                  <pillar.icon size={20} strokeWidth={2} />
                </span>
                <p className="type-h2 type-numeric mt-3 text-ink font-bold">
                  {pillar.stat}
                </p>
                <p className="type-h4 mt-1 text-ink font-bold">{pillar.label}</p>
                <p className="type-small mt-1 text-muted">{pillar.sub}</p>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-2xl border border-line bg-surface p-5 shadow-xs sm:p-6">
            <div className="flex items-center justify-between">
              <p className="type-overline inline-flex items-center gap-1.5 text-accent font-bold tracking-wider">
                <Radio size={15} className="animate-pulse" aria-hidden />
                Tech News — Live Stream
              </p>
              <span className="text-xs text-muted font-medium">Real-Time</span>
            </div>

            <ul className="mt-4 list-none divide-y divide-line/60 p-0">
              {news.map((item) => (
                <li key={item.headline} className="min-w-0 py-3.5 first:pt-0">
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="type-body font-semibold text-ink hover:text-primary transition-colors flex items-center justify-between gap-2 group"
                    >
                      <span>{item.headline}</span>
                      <ExternalLink className="h-4 w-4 shrink-0 text-muted group-hover:text-primary" />
                    </a>
                  ) : (
                    <p className="type-body font-semibold text-ink">
                      {item.headline}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Chip tone={item.tone}>{item.tag}</Chip>
                    <span className="type-caption text-faint">{item.time}</span>
                  </div>
                </li>
              ))}
            </ul>

            <Link
              href={routes.marketing.blog}
              className="type-label mt-4 inline-flex min-h-11 items-center rounded-xl text-primary font-semibold transition-colors duration-200 hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              Read full live feed →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
