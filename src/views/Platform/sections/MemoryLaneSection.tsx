"use client";

import { cn } from "@/lib/cn";
import { Kicker, Reveal, SectionBlock, SplitRow } from "./shell";

type Milestone = { term: string; title: string; detail: string };

const MILESTONES: readonly Milestone[] = [
  {
    term: "Sem 1",
    title: "Mastered Python basics",
    detail: "Retained indelible evidence of syntax mastery.",
  },
  {
    term: "Sem 2",
    title: "Completed DSA modules",
    detail: "90%+ mastery unlocked on tree structures.",
  },
  {
    term: "Sem 3",
    title: "Full-stack project",
    detail: "Synthesized previous skills into a working app.",
  },
];

export default function MemoryLaneSection() {
  const lastIndex = MILESTONES.length - 1;

  return (
    <SectionBlock tone="sunken" labelledBy="memory-lane-title">
      <SplitRow
        media={
          <Reveal delay={0.06}>
            <ol className="m-0 list-none p-0">
              {MILESTONES.map((milestone, index) => (
                <li
                  key={milestone.term}
                  className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-x-4 sm:gap-x-5"
                >
                  <div className="flex flex-col items-center">
                    <span
                      aria-hidden
                      className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary"
                    />
                    {index < lastIndex ? (
                      <span
                        aria-hidden
                        className="mt-1.5 w-px flex-1 bg-line-strong"
                      />
                    ) : null}
                  </div>
                  <div
                    className={cn("min-w-0", index < lastIndex && "pb-8 sm:pb-10")}
                  >
                    <p className="type-overline m-0 text-accent">
                      {milestone.term}
                    </p>
                    <h3 className="type-h3 mt-2 text-ink">{milestone.title}</h3>
                    <p className="type-body mt-1.5 mb-0 text-muted">
                      {milestone.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        }
      >
        <Reveal>
          <Kicker>Long-term retention</Kicker>
          <h2 id="memory-lane-title" className="type-h1 mt-5 text-ink">
            Learning Memory Lane.
          </h2>
          <p className="type-body-lg mt-4 text-muted">
            A critical limitation of traditional education is the absence of
            long-term memory. Skills mastered in one semester are often
            disconnected and forgotten.
          </p>
          <p className="type-body-lg mt-4 text-muted">
            PathEd creates a persistent, chronological record of your academic
            life. Prior learning is never discarded; the system retains
            indelible evidence of what you know and how well you know it.
          </p>
        </Reveal>
      </SplitRow>
    </SectionBlock>
  );
}
