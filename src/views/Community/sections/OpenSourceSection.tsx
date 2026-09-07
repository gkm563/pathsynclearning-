"use client";

import { GitPullRequest, Globe, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "./Reveal";

type OpenSourceBenefit = {
  readonly title: string;
  readonly description: string;
  readonly Icon: LucideIcon;
};

const BENEFITS: readonly OpenSourceBenefit[] = [
  {
    title: "Global impact",
    description:
      "Write code that hundreds of thousands of people use.",
    Icon: Globe,
  },
  {
    title: "Team dynamics",
    description:
      "Learn to navigate complex codebases and coordinate with maintainers.",
    Icon: Users,
  },
  {
    title: "Verified commits",
    description:
      "All your open-source activity boosts your overall employability index.",
    Icon: GitPullRequest,
  },
];

export default function OpenSourceSection() {
  return (
    <section
      aria-labelledby="open-source-title"
      className="border-b border-line bg-sunken"
    >
      <div className="mx-auto w-full max-w-[var(--measure-content)] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <Reveal className="min-w-0 max-w-2xl">
          <p className="type-overline text-primary">Open ecosystem</p>
          <h2 id="open-source-title" className="type-h1 mt-3 text-ink">
            Collaborative open source
          </h2>
          <p className="type-body-lg mt-5 text-muted">
            Contribute to real-world projects directly from the PathEd platform.
            Our open-source integration tracks your pull requests and commits,
            adding verified open-source experience to your CRI profile.
          </p>
        </Reveal>

        <ul className="mt-10 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {BENEFITS.map((benefit, index) => (
            <Reveal
              as="li"
              key={benefit.title}
              delay={index * 0.05}
              className="min-w-0"
            >
              <div className="flex h-full min-w-0 flex-col rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-[var(--shadow-xs)]">
                <span
                  aria-hidden
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-primary-soft text-primary"
                >
                  <benefit.Icon size={20} strokeWidth={1.75} />
                </span>
                <h3 className="type-h3 mt-5 text-ink">{benefit.title}</h3>
                <p className="type-body mt-2 text-muted">
                  {benefit.description}
                </p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
