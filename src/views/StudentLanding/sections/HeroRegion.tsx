"use client";

import Link from "next/link";
import { useState, type KeyboardEvent } from "react";
import {
  ArrowRight,
  GraduationCap,
  Presentation,
  Search,
  Sparkles,
  Star,
  Users,
  Briefcase,
  Award,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Chip, SkillBar } from "../../../components/ui/Shared";
import { routes } from "@/lib/routes";

type RoleId = "s" | "t" | "r";
type ModeId = "c" | "a";
type BarTone = "primary" | "accent" | "info";

const ROLES: ReadonlyArray<{
  id: RoleId;
  icon: LucideIcon;
  title: string;
  tagline: string;
  desc: string;
  popular?: boolean;
  ctaText: string;
  href: string;
}> = [
  {
    id: "s",
    icon: GraduationCap,
    title: "Student",
    tagline: "LEARN. BUILD. GROW.",
    desc: "Personalized skill paths, real-world project challenges, AI mentorship, and verified proof-of-work.",
    popular: true,
    ctaText: "Continue as Student",
    href: routes.auth.signUp,
  },
  {
    id: "t",
    icon: Presentation,
    title: "Teacher",
    tagline: "GUIDE. MENTOR. EMPOWER.",
    desc: "Classroom analytics, automated assignment evaluation, live student rankers, and curriculum tracking.",
    ctaText: "Continue as Teacher",
    href: routes.auth.signUp,
  },
  {
    id: "r",
    icon: Search,
    title: "Recruiter",
    tagline: "DISCOVER. HIRE. LEAD.",
    desc: "Filter talent by real proof-of-work, verified CRI scores, and zero-resume direct technical hiring.",
    ctaText: "Continue as Recruiter",
    href: routes.auth.signUp,
  },
];

const PROOF_POINTS: ReadonlyArray<{ icon: LucideIcon; value: string; label: string }> = [
  { icon: Award, value: "Verified", label: "Proof-of-Work" },
  { icon: Briefcase, value: "Industry", label: "Skill Roadmaps" },
  { icon: Zap, value: "AI-Powered", label: "Learning Engine" },
  { icon: Users, value: "Mentors", label: "Academic Guidance" },
];

const MODES: ReadonlyArray<{
  id: ModeId;
  label: string;
  headline: string;
  body: string;
  features: readonly string[];
  cta: string;
  href: string;
}> = [
  {
    id: "c",
    label: "Career mode",
    headline: "Turn a B.Tech degree into a career-ready roadmap.",
    body: "AI-powered skill paths calibrated to modern engineering role standards. Build what the industry demands.",
    features: ["AI-fication", "CRI tracker", "XP + coins", "Memory Lane"],
    cta: "Start career mode",
    href: routes.auth.signUp,
  },
  {
    id: "a",
    label: "Academic mode",
    headline: "Master the university curriculum with structured precision.",
    body: "Week-by-week syllabus breakdowns with live exam countdowns. Structured mastery from day one.",
    features: ["Session classes", "Ranker board", "PYQ banks", "Teacher live"],
    cta: "Start academic mode",
    href: routes.auth.signUp,
  },
];

const SKILLS: ReadonlyArray<{ label: string; pct: number; tone: BarTone }> = [
  { label: "DSA & Problem Solving", pct: 78, tone: "primary" },
  { label: "System Design & Architecture", pct: 62, tone: "accent" },
  { label: "Full-Stack Web Development", pct: 88, tone: "info" },
];

const ROLE_IDS: readonly RoleId[] = ROLES.map((role) => role.id);
const MODE_IDS: readonly ModeId[] = MODES.map((mode) => mode.id);

const ARROW_KEYS = [
  "ArrowRight",
  "ArrowDown",
  "ArrowLeft",
  "ArrowUp",
  "Home",
  "End",
];

function radioKeys<T extends string>(
  values: readonly T[],
  current: T,
  onChange: (next: T) => void,
) {
  return (event: KeyboardEvent<HTMLDivElement>) => {
    if (!ARROW_KEYS.includes(event.key)) return;
    event.preventDefault();

    const from = values.indexOf(current);
    const to =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? values.length - 1
          : event.key === "ArrowRight" || event.key === "ArrowDown"
            ? (from + 1) % values.length
            : (from - 1 + values.length) % values.length;

    onChange(values[to]);
    event.currentTarget
      .querySelectorAll<HTMLElement>('[role="radio"]')
      [to]?.focus();
  };
}

export default function HeroRegion() {
  const [role, setRole] = useState<RoleId>("s");
  const [mode, setMode] = useState<ModeId>("c");

  const active = MODES.find((m) => m.id === mode) ?? MODES[0];

  return (
    <>
      <section
        aria-labelledby="hero-heading"
        className="relative overflow-hidden px-4 pt-12 pb-14 sm:px-6 sm:pt-16 lg:pt-20"
      >
        <div className="mx-auto max-w-[var(--measure-content)]">
          {/* Header Tagline & Title */}
          <div className="mx-auto max-w-[48rem] text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary shadow-sm">
              <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              <span>✦ YOUR LEARNING JOURNEY STARTS HERE</span>
            </div>

            <h1 id="hero-heading" className="type-display mt-6 text-ink font-bold tracking-tight">
              How do you want to join <span className="text-primary">PathSync Learning</span>?
            </h1>

            <p className="type-body-lg mx-auto mt-4 max-w-[36rem] text-muted">
              One platform. Three perspectives. Start as a student, educator, or recruiter and unlock endless opportunities.
            </p>
          </div>

          {/* Interactive Role Cards */}
          <div
            role="radiogroup"
            aria-label="Select your role"
            onKeyDown={radioKeys<RoleId>(ROLE_IDS, role, setRole)}
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {ROLES.map((item) => {
              const isActive = role === item.id;
              const IconComponent = item.icon;
              return (
                <div
                  key={item.id}
                  role="radio"
                  aria-checked={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => setRole(item.id)}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-6 text-left transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "border-primary bg-surface shadow-xl ring-2 ring-primary/20 -translate-y-1"
                      : "border-line bg-surface/70 hover:border-line-strong hover:bg-surface hover:-translate-y-1 shadow-sm"
                  }`}
                >
                  {/* Badge for Popular */}
                  {item.popular && (
                    <div className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-on-primary shadow-md">
                      <Star className="h-3 w-3 fill-current" />
                      <span>Most Popular</span>
                    </div>
                  )}

                  <div>
                    <div
                      className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl transition-colors duration-200 ${
                        isActive
                          ? "bg-primary text-on-primary shadow-lg"
                          : "bg-sunken text-muted group-hover:bg-primary/10 group-hover:text-primary"
                      }`}
                    >
                      <IconComponent className="h-7 w-7" strokeWidth={2} />
                    </div>

                    <h3 className="type-h2 font-bold text-ink">{item.title}</h3>
                    <p className="type-overline mt-1 text-xs font-semibold tracking-wider text-primary">
                      {item.tagline}
                    </p>
                    <p className="type-small mt-3 text-muted leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-8 pt-4 border-t border-line/60">
                    <Link
                      href={item.href}
                      className={`type-label inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-xl px-4 font-semibold transition-colors duration-200 ${
                        isActive
                          ? "bg-primary text-on-primary hover:bg-primary-hover shadow-md"
                          : "bg-sunken text-ink hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      <span>{item.ctaText}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Stats / Proof Points Bar */}
          <div className="mt-14 rounded-2xl border border-line bg-surface/80 p-6 shadow-sm backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-line/60">
              {PROOF_POINTS.map((pt, idx) => {
                const PtIcon = pt.icon;
                return (
                  <div key={pt.label} className={`flex items-center gap-4 ${idx > 0 ? "pt-4 md:pt-0 md:pl-6" : ""}`}>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <PtIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold tracking-tight text-ink">{pt.value}</p>
                      <p className="text-xs font-medium text-muted">{pt.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Career & Academic Mode Section */}
      <section
        aria-labelledby="hero-mode-heading"
        className="px-4 pb-16 sm:px-6 sm:pb-20 lg:pb-24"
      >
        <div className="mx-auto max-w-[var(--measure-content)]">
          <div className="flex justify-center">
            <div
              role="radiogroup"
              aria-label="Learning mode"
              onKeyDown={radioKeys<ModeId>(MODE_IDS, mode, setMode)}
              className="inline-flex gap-1 rounded-full border border-line bg-surface p-1.5 shadow-sm"
            >
              {MODES.map((item) => {
                const on = mode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    tabIndex={on ? 0 : -1}
                    onClick={() => setMode(item.id)}
                    className={`type-label min-h-11 rounded-full px-6 font-semibold transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                      on
                        ? "bg-primary text-on-primary shadow-sm"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 grid gap-10 rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,19rem)] lg:items-start lg:gap-14 lg:p-12">
            <div className="min-w-0">
              <p className="type-overline text-primary font-bold uppercase tracking-wider">{active.label}</p>
              <h2 id="hero-mode-heading" className="type-h1 mt-3 text-ink font-bold">
                {active.headline}
              </h2>
              <p className="type-body-lg type-prose mt-4 text-muted leading-relaxed">
                {active.body}
              </p>
              <ul className="mt-6 flex list-none flex-wrap gap-2 p-0">
                {active.features.map((feature) => (
                  <li key={feature} className="min-w-0">
                    <Chip tone="neutral">{feature}</Chip>
                  </li>
                ))}
              </ul>
              <Link
                href={active.href}
                className="type-label mt-8 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-6 font-semibold text-on-primary transition-colors duration-200 hover:bg-primary-hover shadow-md"
              >
                {active.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid min-w-0 gap-4">
              <div className="rounded-2xl border border-line bg-canvas p-6 text-center shadow-inner">
                <p className="type-h1 type-numeric m-0 text-ink font-bold text-4xl">78.5</p>
                <p className="type-overline mt-2 text-primary font-bold tracking-wider">CRI Score</p>
                <p className="type-small mt-1 text-muted">
                  Career Readiness Index (Verified)
                </p>
              </div>
              <div className="rounded-2xl border border-line bg-canvas p-6 shadow-inner">
                <p className="type-overline text-faint font-semibold tracking-wider">Skill Snapshot</p>
                <div className="mt-4 [&>*:last-child]:mb-0">
                  {SKILLS.map((skill, i) => (
                    <SkillBar
                      key={skill.label}
                      label={skill.label}
                      pct={skill.pct}
                      tone={skill.tone}
                      delay={i * 140}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
