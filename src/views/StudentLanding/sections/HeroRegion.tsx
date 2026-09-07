"use client";

import Link from "next/link";
import { useState, type KeyboardEvent } from "react";
import {
  ArrowRight,
  GraduationCap,
  Presentation,
  Search,
  type LucideIcon,
} from "lucide-react";
import { Chip, RoleCard, SkillBar } from "../../../components/ui/Shared";
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
}> = [
  {
    id: "s",
    icon: GraduationCap,
    title: "Student",
    tagline: "Learn. Build. Grow.",
    desc: "Roadmaps, CRI tracking, daily challenges, and peer community.",
  },
  {
    id: "t",
    icon: Presentation,
    title: "Teacher",
    tagline: "Guide. Mentor. Empower.",
    desc: "Classroom tools, analytics, and student progress monitoring.",
  },
  {
    id: "r",
    icon: Search,
    title: "Recruiter",
    tagline: "Discover. Hire. Lead.",
    desc: "Talent filters, CRI scores, and verified skill resumes.",
  },
];

const PROOF_POINTS: readonly string[] = [
  "40,000+ students",
  "95% placement rate",
  "500+ companies",
  "1M+ XP daily",
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
    body: "AI-powered skill paths calibrated to Google, Microsoft, Razorpay, and 500+ companies. Build what the industry demands.",
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
  { label: "DSA", pct: 72, tone: "primary" },
  { label: "System Design", pct: 45, tone: "accent" },
  { label: "Web Dev", pct: 88, tone: "info" },
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

/**
 * Arrow-key navigation for a `radiogroup` of roving-tabindex radios: moves the
 * selection and follows it with focus, which is what screen reader users
 * expect from a radio group.
 */
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
        className="px-4 pt-12 pb-14 sm:px-6 sm:pt-16 lg:pt-20"
      >
        <div className="mx-auto max-w-[var(--measure-content)]">
          <div className="mx-auto max-w-[44rem] text-center">
            <Chip>Select your role</Chip>
            <h1 id="hero-heading" className="type-display mt-5 text-ink">
              How do you want to join PathEd?
            </h1>
            <p className="type-body-lg mx-auto mt-5 max-w-[34rem] text-muted">
              One platform. Three perspectives. Start as a student, educator, or
              recruiter.
            </p>
          </div>

          <div
            role="radiogroup"
            aria-label="Select your role"
            onKeyDown={radioKeys<RoleId>(ROLE_IDS, role, setRole)}
            className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3"
          >
            {ROLES.map((item) => (
              <RoleCard
                key={item.id}
                icon={<item.icon size={20} strokeWidth={1.75} />}
                title={item.title}
                tagline={item.tagline}
                desc={item.desc}
                active={role === item.id}
                onClick={() => setRole(item.id)}
              />
            ))}
          </div>

          <ul className="mt-8 flex list-none flex-wrap justify-center gap-2 p-0">
            {PROOF_POINTS.map((point) => (
              <li key={point} className="min-w-0">
                <Chip tone="neutral">{point}</Chip>
              </li>
            ))}
          </ul>
        </div>
      </section>

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
              className="inline-flex gap-1 rounded-[var(--radius-md)] border border-line bg-surface p-1 shadow-[var(--shadow-xs)]"
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
                    className={`type-label min-h-11 rounded-[var(--radius-sm)] px-4 transition-colors duration-[var(--duration-fast)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none sm:px-6 ${
                      on
                        ? "bg-primary text-on-primary"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 grid gap-10 rounded-[var(--radius-xl)] border border-line bg-surface p-6 shadow-[var(--shadow-sm)] sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,17rem)] lg:items-start lg:gap-14 lg:p-12">
            <div className="min-w-0">
              <p className="type-overline text-primary">{active.label}</p>
              <h2 id="hero-mode-heading" className="type-h1 mt-3 text-ink">
                {active.headline}
              </h2>
              <p className="type-body-lg type-prose mt-4 text-muted">
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
                className="type-label mt-8 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] bg-primary px-5 text-on-primary transition-colors duration-[var(--duration-fast)] hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
              >
                {active.cta}
                <ArrowRight size={16} aria-hidden />
              </Link>
            </div>

            <div className="grid min-w-0 gap-4">
              <div className="rounded-[var(--radius-lg)] border border-line bg-canvas p-5 text-center">
                <p className="type-h1 type-numeric m-0 text-ink">78%</p>
                <p className="type-overline mt-2 text-primary">CRI score</p>
                <p className="type-small mt-1 text-muted">
                  Career Readiness Index
                </p>
              </div>
              <div className="rounded-[var(--radius-lg)] border border-line bg-canvas p-5">
                <p className="type-overline text-faint">Skill snapshot</p>
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
