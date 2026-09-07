"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { routes } from "@/lib/routes";
import { Reveal } from "./Reveal";

/**
 * The single real destination on this page.
 *
 * Individual guides have no detail route yet, so the cards above stay
 * non-interactive and every reader who wants more is sent somewhere that
 * actually exists.
 */
export default function GuidesCTA() {
  return (
    <section aria-labelledby="guides-cta-title" className="bg-sunken">
      <div className="mx-auto w-full max-w-[var(--measure-content)] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <Reveal className="mx-auto min-w-0 max-w-2xl text-center">
          <h2 id="guides-cta-title" className="type-h1 text-ink">
            Need the full detail today?
          </h2>
          <p className="type-body-lg mt-4 text-muted">
            The documentation covers every one of these topics in depth —
            scoring, grading, privacy controls, and the recruiter view of your
            profile.
          </p>
          <Link
            href={routes.marketing.documentation}
            className="type-label mt-8 inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] bg-primary px-6 text-on-primary transition-colors duration-[var(--duration-fast)] hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
          >
            Read the documentation
            <ArrowRight size={16} strokeWidth={2} aria-hidden />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
