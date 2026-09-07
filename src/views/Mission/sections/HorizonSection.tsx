"use client";

import { Kicker, Reveal, SectionBlock } from "./shell";

export default function HorizonSection() {
  return (
    <SectionBlock labelledBy="horizon-title">
      <Reveal className="mx-auto max-w-[46rem] text-center">
        <Kicker>The 10-year horizon</Kicker>
        <h2 id="horizon-title" className="type-h1 mt-5 text-ink">
          Where we are going.
        </h2>
        <p className="type-body-lg mt-4 text-muted">
          Within the next decade, we envision a world where a student's
          potential is never bottlenecked by outdated college syllabi. We aim to
          establish the CRI as the global standard for engineering
          employability — rendering proxy metrics obsolete and ensuring that
          merit, validated by data, is the only currency that matters in hiring.
        </p>
      </Reveal>
    </SectionBlock>
  );
}
