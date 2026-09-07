"use client";

import { CenteredIntro, Reveal, SectionBlock } from "./shell";

type Guarantee = { title: string; desc: string };

const GUARANTEES: readonly Guarantee[] = [
  {
    title: "Open algorithms",
    desc: "Our CRI scoring methodology is open and explained to every student.",
  },
  {
    title: "No hidden agendas",
    desc: "We don't sell your data. We don't charge hidden fees.",
  },
  {
    title: "Direct feedback",
    desc: "Every assessment comes with granular, actionable feedback.",
  },
];

export default function TransparencySection() {
  return (
    <SectionBlock tone="sunken" labelledBy="transparency-title">
      <CenteredIntro
        headingId="transparency-title"
        kicker="Zero obfuscation"
        title="The transparency guarantee."
        lead="Education should not be a black box. You deserve to know exactly how your performance is measured, why you received a specific CRI score, and what specific steps you must take to improve."
      />

      <Reveal delay={0.06} className="mt-10 sm:mt-12">
        <ul className="grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {GUARANTEES.map((item) => (
            <li key={item.title} className="min-w-0">
              <div className="h-full min-w-0 rounded-[var(--radius-lg)] border border-line bg-surface p-6 sm:p-7">
                <h3 className="type-h3 m-0 text-ink">{item.title}</h3>
                <p className="type-body mt-2.5 mb-0 text-muted">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </Reveal>
    </SectionBlock>
  );
}
