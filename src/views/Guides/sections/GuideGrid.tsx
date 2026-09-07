"use client";

import {
  Award,
  BookOpen,
  Briefcase,
  Code,
  Compass,
  ShieldCheck,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "./Reveal";

/**
 * The guide index.
 *
 * There are no per-guide routes yet, so the cards are deliberately
 * non-interactive `<article>` elements rather than `href="#"` links that go
 * nowhere — the page-level CTA is the one real destination.
 */

type Guide = {
  readonly title: string;
  readonly summary: string;
  readonly Icon: LucideIcon;
};

const GUIDES: readonly Guide[] = [
  {
    title: "Navigating your skill tree",
    summary:
      "Learn how to effectively unlock new competencies and advance your career level.",
    Icon: Compass,
  },
  {
    title: "Maximising your CRI score",
    summary:
      "A deep dive into how the Career Readiness Index is calculated and how to boost it.",
    Icon: Target,
  },
  {
    title: "Acing the AI mentor interviews",
    summary: "Tips and tricks for passing our simulated technical interviews.",
    Icon: BookOpen,
  },
  {
    title: "Building portfolio projects",
    summary:
      "How to leverage PathEd challenges to build a recruiter-ready GitHub portfolio.",
    Icon: Code,
  },
  {
    title: "Decoding the market trends",
    summary:
      "Analyse the demand for specific frameworks and optimise your learning path.",
    Icon: TrendingUp,
  },
  {
    title: "Corporate recruiting pipeline",
    summary:
      "Understand exactly what hiring managers see when they view your PathEd profile.",
    Icon: Briefcase,
  },
  {
    title: "Mastering the AI grader",
    summary:
      "Learn how the AST-based grading engine evaluates your code submissions for efficiency.",
    Icon: Zap,
  },
  {
    title: "Data security best practices",
    summary:
      "A guide to maintaining strict privacy controls over your academic and performance data.",
    Icon: ShieldCheck,
  },
  {
    title: "Achieving elite certifications",
    summary:
      "Step-by-step roadmap to earning top-tier badges recognised by industry leaders.",
    Icon: Award,
  },
];

export default function GuideGrid() {
  return (
    <section
      aria-labelledby="guides-index-title"
      className="border-b border-line bg-canvas"
    >
      <div className="mx-auto w-full max-w-[var(--measure-content)] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <h2 id="guides-index-title" className="sr-only">
          All guides
        </h2>

        <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {GUIDES.map((guide, index) => (
            <Reveal
              as="li"
              key={guide.title}
              delay={Math.min(index, 5) * 0.04}
              className="min-w-0"
            >
              <article className="flex h-full min-w-0 flex-col rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-[var(--shadow-xs)]">
                <span
                  aria-hidden
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-primary-soft text-primary"
                >
                  <guide.Icon size={20} strokeWidth={1.75} />
                </span>
                <h3 className="type-h3 mt-5 text-ink">{guide.title}</h3>
                <p className="type-body mt-2 text-muted">{guide.summary}</p>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
