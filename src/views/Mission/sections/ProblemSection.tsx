"use client";

import { Kicker, Reveal, SectionBlock, SplitRow } from "./shell";

type Problem = { title: string; desc: string };

const PROBLEMS: readonly Problem[] = [
  {
    title: "Syllabi misalignment",
    desc: "Organized by discipline, not by industry roles.",
  },
  {
    title: "Lack of clarity",
    desc: "No clear framework for identifying what to learn.",
  },
  {
    title: "Delayed planning",
    desc: "Postponing preparation until the final year.",
  },
  { title: "Wasted effort", desc: "Changing goals penalizes exploration." },
];

export default function ProblemSection() {
  return (
    <SectionBlock tone="surface" labelledBy="problem-title">
      <SplitRow
        mediaFirst
        media={
          <Reveal delay={0.06}>
            <ul className="grid list-none gap-4 p-0 sm:grid-cols-2">
              {PROBLEMS.map((problem) => (
                <li key={problem.title} className="min-w-0">
                  <div className="h-full min-w-0 rounded-[var(--radius-lg)] border border-line bg-canvas p-5 sm:p-6">
                    <h3 className="type-h3 m-0 text-ink">{problem.title}</h3>
                    <p className="type-body mt-2 mb-0 text-muted">
                      {problem.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        }
      >
        <Reveal>
          <Kicker>The structural failure</Kicker>
          <h2 id="problem-title" className="type-h1 mt-5 text-ink">
            The traditional model is broken.
          </h2>
          <p className="type-body-lg mt-4 text-muted">
            The core strategic challenge facing undergraduate engineering
            education is a failure of design. Predefined subjects and rigid
            semesters create systemic friction.
          </p>
          <p className="type-body-lg mt-4 text-muted">
            Students are forced to navigate their degree without a clear
            understanding of how individual courses contribute to professional
            employability.
          </p>
        </Reveal>
      </SplitRow>
    </SectionBlock>
  );
}
