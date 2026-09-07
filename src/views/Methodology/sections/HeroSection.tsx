"use client";

import { Kicker, MediaFrame, Reveal, SectionBlock } from "./shell";

export default function HeroSection() {
  return (
    <SectionBlock
      labelledBy="methodology-title"
      className="pt-12 pb-14 sm:pt-16 sm:pb-16 lg:pt-20 lg:pb-20"
    >
      <Reveal className="max-w-[44rem]">
        <Kicker>Pedagogy of progress</Kicker>
        <h1 id="methodology-title" className="type-display mt-5 text-ink">
          Ensuring learning is deep and{" "}
          <span className="text-primary">demonstrable.</span>
        </h1>
        <p className="type-body-lg type-prose mt-5 text-muted">
          The strategic integrity of the PathEd system rests on uncompromising
          pedagogical rules. We embed rigor into our core logic to produce
          industry-ready graduates, not merely fast learners.
        </p>
      </Reveal>

      <Reveal delay={0.06} className="mt-10 sm:mt-12">
        <MediaFrame
          src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1600&q=80"
          alt="Student studying at a desk covered with notes and a laptop"
          ratioClass="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]"
        />
      </Reveal>
    </SectionBlock>
  );
}
