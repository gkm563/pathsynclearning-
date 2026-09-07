"use client";

import { Reveal } from "./Reveal";

export default function BlogHero() {
  return (
    <section
      aria-labelledby="blog-hero-title"
      className="border-b border-line bg-surface"
    >
      <div className="mx-auto w-full max-w-[var(--measure-content)] px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <Reveal className="min-w-0 max-w-3xl">
          <p className="type-overline text-accent">PathEd insights</p>
          <h1 id="blog-hero-title" className="type-display mt-4 text-ink">
            Thoughts on the future of engineering education.
          </h1>
          <p className="type-body-lg type-prose mt-5 text-muted">
            Field notes from the team building PathEd — on pedagogy, hiring
            signals, and the architecture of a career-first degree.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
