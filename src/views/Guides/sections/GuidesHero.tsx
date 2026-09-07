"use client";

import { Reveal } from "./Reveal";

export default function GuidesHero() {
  return (
    <section
      aria-labelledby="guides-hero-title"
      className="border-b border-line bg-surface"
    >
      <div className="mx-auto w-full max-w-[var(--measure-content)] px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <Reveal className="min-w-0 max-w-3xl">
          <p className="type-overline text-accent">PathEd guides</p>
          <h1 id="guides-hero-title" className="type-display mt-4 text-ink">
            Master the platform.
          </h1>
          <p className="type-body-lg type-prose mt-5 text-muted">
            Step-by-step guides and playbooks to help you extract maximum value
            from PathEd and accelerate your engineering career.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
