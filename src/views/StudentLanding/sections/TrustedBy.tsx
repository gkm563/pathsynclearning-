import { routes } from "@/lib/routes";
import Link from "next/link";

const COMPANIES: readonly string[] = [
  "Google",
  "Microsoft",
  "Amazon",
  "Razorpay",
  "TCS",
  "Wipro",
  "Infosys",
  "Flipkart",
];

export default function TrustedBy() {
  return (
    <section
      aria-labelledby="trusted-heading"
      className="px-4 py-16 sm:px-6 sm:py-20 bg-sunken/40 border-y border-line"
    >
      <div className="mx-auto max-w-[var(--measure-content)] text-center">
        <p className="type-overline text-accent font-bold tracking-wider">Hiring Network</p>
        <h2 id="trusted-heading" className="type-h2 mt-3 text-ink font-bold">
          Top companies hire PathSync Learning graduates
        </h2>
        <p className="type-body mx-auto mt-3 max-w-[36rem] text-muted">
          Verified skill profiles go straight to engineering managers and recruiters — no resume filter bottlenecks.
        </p>

        <ul className="mt-10 grid list-none grid-cols-2 gap-4 p-0 sm:grid-cols-4 lg:grid-cols-8">
          {COMPANIES.map((name) => (
            <li
              key={name}
              className="type-h4 flex min-h-16 min-w-0 items-center justify-center rounded-xl border border-line bg-surface px-4 font-bold text-center text-ink shadow-xs transition-all duration-200 hover:border-primary/50 hover:text-primary hover:shadow-md motion-reduce:transition-none"
            >
              <span className="min-w-0 truncate">{name}</span>
            </li>
          ))}
        </ul>

        <Link
          href={routes.marketing.company}
          className="type-label mt-8 inline-flex min-h-11 items-center rounded-lg px-4 text-primary font-semibold underline decoration-primary/40 underline-offset-4 transition-colors duration-200 hover:decoration-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          See the full hiring network →
        </Link>
      </div>
    </section>
  );
}
