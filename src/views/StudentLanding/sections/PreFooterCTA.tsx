import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { routes } from "@/lib/routes";

/** Closing conversion band. Static — no client JS. */
export default function PreFooterCTA() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="px-4 pb-16 sm:px-6 sm:pb-20 lg:pb-24"
    >
      <div className="mx-auto max-w-[var(--measure-content)]">
        <div className="rounded-[var(--radius-xl)] border border-line bg-surface px-6 py-14 text-center shadow-[var(--shadow-sm)] sm:px-12 sm:py-16 lg:py-20">
          <p className="type-overline text-primary">
            Begin your journey
          </p>
          <h2 id="cta-heading" className="type-display mt-4 text-ink">
            Your roadmap starts now.
          </h2>
          <p className="type-body-lg mx-auto mt-5 max-w-[32rem] text-muted">
            Join 40,000+ students building careers they’re proud of. Real
            skills. Real progress. Real offers.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={routes.auth.signUp}
              className="type-label inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] bg-primary px-6 text-on-primary transition-colors duration-[var(--duration-fast)] hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
            >
              Create free account
              <ArrowRight size={16} aria-hidden />
            </Link>
            <Link
              href={routes.marketing.pricing}
              className="type-label inline-flex min-h-11 items-center rounded-[var(--radius-md)] border border-line px-6 text-ink transition-colors duration-[var(--duration-fast)] hover:bg-sunken focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
            >
              Compare plans
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
