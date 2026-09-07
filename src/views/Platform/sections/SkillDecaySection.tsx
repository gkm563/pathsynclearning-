"use client";

import { AlertTriangle, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { CenteredIntro, Reveal, SectionBlock } from "./shell";

type SkillFreshness = { skill: string; stale: boolean; lastChecked: string };

const SKILL_FRESHNESS: readonly SkillFreshness[] = [
  { skill: "React JS", stale: false, lastChecked: "Assessed 6 days ago" },
  { skill: "System design", stale: true, lastChecked: "Assessed 14 weeks ago" },
  { skill: "SQL joins", stale: false, lastChecked: "Assessed 11 days ago" },
];

export default function SkillDecaySection() {
  return (
    <SectionBlock labelledBy="skill-decay-title">
      <CenteredIntro
        headingId="skill-decay-title"
        kicker="Knowledge maintenance"
        kickerVariant="accent"
        title="Skill decay & refresh indicator."
        lead="Skills you don't use get rusty. Our platform tracks the recency of your assessments and gently flags important skills that need a refresh, so you are always interview-ready."
      />

      <Reveal delay={0.06} className="mt-10 sm:mt-12">
        <ul className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {SKILL_FRESHNESS.map((entry) => (
            <li key={entry.skill} className="min-w-0">
              <div
                className={cn(
                  "flex h-full min-w-0 flex-col rounded-[var(--radius-lg)] border bg-surface p-5 sm:p-6",
                  entry.stale ? "border-warning/40" : "border-line",
                )}
              >
                <h3 className="type-h3 m-0 text-ink">{entry.skill}</h3>
                <p
                  className={cn(
                    "type-label mt-3 mb-0 inline-flex items-center gap-1.5",
                    entry.stale ? "text-warning" : "text-success",
                  )}
                >
                  {entry.stale ? (
                    <AlertTriangle size={15} aria-hidden className="shrink-0" />
                  ) : (
                    <Check size={15} aria-hidden className="shrink-0" />
                  )}
                  {entry.stale ? "Needs refresh" : "Fresh"}
                </p>
                <p className="type-caption mt-2 mb-0 text-faint">
                  {entry.lastChecked}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Reveal>
    </SectionBlock>
  );
}
