"use client";

import { Reveal } from "./Reveal";

export default function CommunityHero() {
  return (
    <section
      aria-labelledby="community-hero-title"
      className="border-b border-line bg-canvas"
    >
      <div className="mx-auto w-full max-w-[var(--measure-content)] px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <Reveal className="min-w-0 max-w-3xl">
          <p className="type-overline text-accent">Peer-to-peer ecosystem</p>
          <h1 id="community-hero-title" className="type-display mt-4 text-ink">
            You are not learning alone.
          </h1>
          <p className="type-body-lg type-prose mt-5 text-muted">
            PathEd is built on the belief that engineering is a collaborative
            discipline. Our community is designed to foster professional growth,
            technical debates, and peer-driven success.
          </p>
        </Reveal>

        <Reveal delay={0.06} className="mt-10 min-w-0 sm:mt-14">
          <figure className="m-0 overflow-hidden rounded-[var(--radius-xl)] border border-line bg-sunken shadow-[var(--shadow-sm)]">
            <div className="aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[21/9]">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80"
                alt="Engineering students gathered around a laptop, reviewing code together"
                width={1600}
                height={900}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
