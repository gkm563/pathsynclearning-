"use client";

import { Check } from "lucide-react";
import { QuoteSection, RecruiterValidationSection } from "@/components/ui/Shared";
import HeroSection from "./sections/HeroSection";
import ImageRowSection from "./sections/ImageRowSection";
import { GAMIFICATION_ROW, NODE_LEVEL_ROW } from "./sections/content";
import {
  CenteredIntro,
  Kicker,
  Reveal,
  SectionBlock,
  SplitRow,
  bodyClass,
  headingClass,
} from "./sections/shell";

const SIGNALS = [
  {
    title: "Assessment performance",
    body: "Raw scores and accuracy on deeply technical challenges.",
  },
  {
    title: "Number of attempts",
    body: "Persistence and the journey from failure to mastery.",
  },
  {
    title: "Time spent",
    body: "Depth of focus and engagement on a node.",
  },
  {
    title: "Improvement trends",
    body: "Whether the learning is compounding, not just happening.",
  },
] as const;

const EXCLUSIONS = [
  "No social feeds or forums",
  "No distracting notifications",
  "No advertisements or upsells",
  "High-contrast readability modes",
  "Full keyboard navigation support",
] as const;

/**
 * `/methodology` — how PathEd measures real learning.
 *
 * Page chrome belongs to `app/(marketing)/layout.tsx`.
 */
export default function Methodology() {
  return (
    <>
      <HeroSection />

      <SectionBlock labelledBy="signals-title" tone="surface">
        <CenteredIntro
          headingId="signals-title"
          kicker="Holistic evaluation"
          title="Multi-signal progress validation."
          lead="In contrast to single-score models, PathEd assesses progress using multiple signals to create a balanced, ethical, and realistic picture of how you are actually learning."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {SIGNALS.map((signal, i) => (
            <Reveal key={signal.title} delay={i * 0.04}>
              <article className="rounded-[var(--radius-lg)] border border-line bg-canvas p-5 sm:p-6">
                <h3 className="type-h4 m-0 text-ink">{signal.title}</h3>
                <p className="type-small mt-2 mb-0 text-muted">{signal.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </SectionBlock>

      <ImageRowSection row={GAMIFICATION_ROW} />
      <ImageRowSection row={NODE_LEVEL_ROW} />

      <SectionBlock labelledBy="exclusion-title" tone="sunken">
        <CenteredIntro
          headingId="exclusion-title"
          kicker="Ethical design"
          title="Focused by exclusion."
          lead="The value of PathEd is defined as much by what it includes as by what it deliberately leaves out — an environment for deep work, not another feed."
        />
        <ul className="mt-10 grid list-none gap-3 p-0 sm:grid-cols-2">
          {EXCLUSIONS.map((item) => (
            <li
              key={item}
              className="flex items-center gap-3 rounded-[var(--radius-md)] border border-line bg-surface px-4 py-3.5"
            >
              <Check size={16} className="shrink-0 text-success" aria-hidden />
              <span className="type-label text-ink">{item}</span>
            </li>
          ))}
        </ul>
      </SectionBlock>

      <SectionBlock labelledBy="compiler-title" tone="inverse">
        <SplitRow
          media={
            <Reveal>
              <div className="overflow-hidden rounded-[var(--radius-lg)] border border-white/10 bg-[#101412]">
                <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" aria-hidden />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" aria-hidden />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" aria-hidden />
                  <span className="type-caption ml-2 text-white/50">
                    main.py — PathEd compiler
                  </span>
                </div>
                <pre className="type-code m-0 overflow-x-auto p-5 text-[13px] leading-relaxed text-white/85">
{`def validate_skill(student_score):
    if student_score >= 90:
        return "Skill Unlocked"
    else:
        return "Review Required"

# Compiling and executing...
> Output: Skill Unlocked. Proceed to next node.`}
                </pre>
              </div>
            </Reveal>
          }
        >
          <Reveal>
            <Kicker variant="inverse">Interactive coding</Kicker>
            <h2 id="compiler-title" className={`type-h2 mt-4 ${headingClass("inverse")}`}>
              In-browser compilation.
            </h2>
            <p className={`type-body type-prose mt-4 ${bodyClass("inverse")}`}>
              Demonstrating mastery shouldn't require a local environment setup.
              Write, compile and execute code in the browser — then get instant
              feedback on algorithmic challenges and project submissions.
            </p>
          </Reveal>
        </SplitRow>
      </SectionBlock>

      <QuoteSection
        quote="We don't need easier degrees. We need degrees that actually matter to the people hiring."
        author="Rahul Kushwaha"
        role="CEO & Chief Designer"
      />

      <RecruiterValidationSection
        tag="Validated architecture"
        title={
          <>
            Methodology backed
            <br />
            by industry.
          </>
        }
        desc1="Our pedagogical framework was co-designed with hiring managers. The evaluation you undergo is academically sound and aligned with what industry actually asks for."
        desc2="Because recruiters trust the method, a validated CRI score is a direct passport to technical interviews."
        img="https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=1200&q=80"
      />
    </>
  );
}
