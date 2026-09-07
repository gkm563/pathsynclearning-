"use client";

import { Kicker, MediaFrame, Reveal, SectionBlock } from "./shell";

export default function HeroSection() {
  return (
    <SectionBlock
      labelledBy="mission-title"
      className="pt-12 pb-14 sm:pt-16 sm:pb-16 lg:pt-20 lg:pb-20"
    >
      <Reveal className="max-w-[44rem]">
        <Kicker variant="accent">Our mission</Kicker>
        <h1 id="mission-title" className="type-display mt-5 text-ink">
          Bridging the gap between{" "}
          <span className="text-accent">academia and industry.</span>
        </h1>
        <p className="type-body-lg type-prose mt-5 text-muted">
          We exist to solve the structural disconnect in modern engineering
          education. We are translating academic investment into demonstrable
          economic value.
        </p>
      </Reveal>

      <Reveal delay={0.06} className="mt-10 sm:mt-12">
        <MediaFrame
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80"
          alt="Engineering students working together across a shared desk"
          ratioClass="aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]"
        />
      </Reveal>
    </SectionBlock>
  );
}
