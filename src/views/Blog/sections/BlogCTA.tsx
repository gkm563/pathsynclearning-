"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { routes } from "@/lib/routes";
import { Reveal } from "./Reveal";

/**
 * The single real destination on this page.
 *
 * Individual essays have no detail route yet, so the cards above stay
 * non-interactive and every reader who wants more is sent somewhere that
 * actually exists.
 */
export default function BlogCTA() {
  return (
    <section
      aria-labelledby="blog-cta-title"
      className="border-b border-line bg-sunken"
    >
      <div className="mx-auto w-full max-w-[var(--measure-content)] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <Reveal className="mx-auto min-w-0 max-w-2xl text-center">
          <h2 id="blog-cta-title" className="type-h1 text-ink">
            Where these conversations continue
          </h2>
          <p className="type-body-lg mt-4 text-muted">
            Full essays are discussed first inside the PathEd community —
            alongside peer reviews, hackathon post-mortems, and mentor AMAs.
          </p>
          <Link
            href={routes.marketing.community}
            className="type-label mt-8 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] bg-primary px-6 text-on-primary transition-colors duration-[var(--duration-fast)] hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
          >
            Explore the community
            <ArrowRight size={16} strokeWidth={2} aria-hidden />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
