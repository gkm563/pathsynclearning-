import { routes } from "@/lib/routes";
import Link from "next/link";

/**
 * Static logo wall — no state, no motion, so it stays a server component and
 * ships zero client JS.
 */
const COMPANIES: readonly string[] = [
  "TechCorp",
  "Innovate AI",
  "DataFlow",
  "CloudSync",
  "CyberDefend",
  "NextGen",
];

export default function TrustedBy() {
  return (
    <section
      aria-labelledby="trusted-heading"
      className="px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-[var(--measure-content)] text-center">
        <p className="type-overline text-accent">Hiring network</p>
        <h2 id="trusted-heading" className="type-h2 mt-3 text-ink">
          Top companies hire PathEd graduates
        </h2>
        <p className="type-body mx-auto mt-3 max-w-[36rem] text-muted">
          Verified skill profiles go straight to the teams that are hiring — no
          resume screen in between.
        </p>

        <ul className="mt-10 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-3 lg:grid-cols-6">
          {COMPANIES.map((name) => (
            <li
              key={name}
              className="type-h4 flex min-h-16 min-w-0 items-center justify-center rounded-[var(--radius-md)] border border-line bg-surface px-4 text-center text-muted transition-colors duration-[var(--duration-normal)] hover:border-line-strong hover:text-ink motion-reduce:transition-none"
            >
              <span className="min-w-0 truncate">{name}</span>
            </li>
          ))}
        </ul>

        <Link
          href={routes.marketing.company}
          className="type-label mt-8 inline-flex min-h-11 items-center rounded-[var(--radius-sm)] px-1 text-primary underline decoration-primary/40 underline-offset-4 transition-colors duration-[var(--duration-fast)] hover:decoration-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
        >
          See the full hiring network
        </Link>
      </div>
    </section>
  );
}
