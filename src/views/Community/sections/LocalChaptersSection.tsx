"use client";

import { MapPin } from "lucide-react";
import { Reveal } from "./Reveal";

export default function LocalChaptersSection() {
  return (
    <section
      aria-labelledby="local-chapters-title"
      className="border-b border-line bg-canvas"
    >
      <div className="mx-auto w-full max-w-[var(--measure-content)] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <Reveal className="mx-auto min-w-0 max-w-2xl text-center">
          <span
            aria-hidden
            className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-accent-soft text-accent"
          >
            <MapPin size={20} strokeWidth={1.75} />
          </span>
          <p className="type-overline mt-5 text-accent">Offline presence</p>
          <h2 id="local-chapters-title" className="type-h1 mt-3 text-ink">
            PathEd Local Chapters
          </h2>
          <p className="type-body-lg mt-5 text-muted">
            Digital connection is great, but offline collaboration is unmatched.
            Starting from our roots in Prayagraj, PathEd Local Chapters are
            expanding across campuses nationwide. Attend local meetups, host
            technical workshops, and build lifelong professional relationships in
            person.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
