"use client";

import { LineChart, ShieldCheck, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "./Reveal";

type CompanyValue = {
  readonly title: string;
  readonly description: string;
  readonly Icon: LucideIcon;
};

const VALUES: readonly CompanyValue[] = [
  {
    title: "Ship fast",
    description:
      "Iterate rapidly based on student feedback and market demands.",
    Icon: Zap,
  },
  {
    title: "Uncompromising quality",
    description:
      "No broken links. No buggy code editors. Just smooth experiences.",
    Icon: ShieldCheck,
  },
  {
    title: "Data-driven decisions",
    description:
      "We rely on metrics, not intuition, to guide our product roadmap.",
    Icon: LineChart,
  },
];

export default function CompanyValues() {
  return (
    <section
      aria-labelledby="values-title"
      className="border-b border-line bg-sunken"
    >
      <div className="mx-auto w-full max-w-[var(--measure-content)] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <Reveal className="min-w-0 max-w-2xl">
          <p className="type-overline text-primary">Principles</p>
          <h2 id="values-title" className="type-h1 mt-3 text-ink">
            Core engineering values
          </h2>
          <p className="type-body-lg mt-5 text-muted">
            Our product philosophy is simple: cut the noise, build for
            performance, and optimise for actual student outcomes.
          </p>
        </Reveal>

        <ul className="mt-10 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {VALUES.map((value, index) => (
            <Reveal
              as="li"
              key={value.title}
              delay={index * 0.05}
              className="min-w-0"
            >
              <div className="flex h-full min-w-0 flex-col rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-[var(--shadow-xs)]">
                <span
                  aria-hidden
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-primary-soft text-primary"
                >
                  <value.Icon size={20} strokeWidth={1.75} />
                </span>
                <h3 className="type-h3 mt-5 text-ink">{value.title}</h3>
                <p className="type-body mt-2 text-muted">{value.description}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
