import { Briefcase, Code, Target, TrendingUp, type LucideIcon } from "lucide-react";

type Step = {
  num: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  /** Token-backed accent for the step medallion. */
  tone: "primary" | "info" | "accent" | "success";
};

const STEPS: readonly Step[] = [
  {
    num: "01",
    icon: Target,
    title: "Set your target",
    desc: "Select your dream role, and we generate a personalized skill graph.",
    tone: "primary",
  },
  {
    num: "02",
    icon: Code,
    title: "Complete challenges",
    desc: "Prove your knowledge by passing industry-simulated coding tasks.",
    tone: "info",
  },
  {
    num: "03",
    icon: TrendingUp,
    title: "Grow your CRI",
    desc: "Every success increases your Career Readiness Index score.",
    tone: "accent",
  },
  {
    num: "04",
    icon: Briefcase,
    title: "Get hired",
    desc: "Recruiters filter for high-CRI students and skip the resume screen.",
    tone: "success",
  },
];

const MEDALLION: Record<Step["tone"], string> = {
  primary: "border-primary-border bg-primary-soft text-primary",
  info: "border-info/25 bg-info-soft text-info",
  accent: "border-accent/25 bg-accent-soft text-accent",
  success: "border-success/25 bg-success-soft text-success",
};

/**
 * Alternating step timeline.
 *
 * The desktop mirroring used to need an injected `<style>` block for
 * `:nth-child(even)`; because the rows are mapped with an index, the flip is
 * just a conditional class — no CSS injection, and no client JS at all.
 */
export default function HowItWorks() {
  return (
    <section
      aria-labelledby="how-heading"
      className="border-y border-line bg-sunken px-4 py-16 sm:px-6 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-[var(--measure-content)]">
        <div className="mx-auto max-w-[40rem] text-center">
          <p className="type-overline text-primary">The process</p>
          <h2 id="how-heading" className="type-h1 mt-3 text-ink">
            How PathEd works
          </h2>
          <p className="type-body-lg mt-4 text-muted">
            We’ve engineered a seamless pipeline from raw potential to hired
            professional.
          </p>
        </div>

        <ol className="relative mt-12 grid list-none gap-6 p-0 lg:mt-16 lg:gap-10">
          {/* Decorative spine — pinned inside the list, never past the viewport. */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-6 left-1/2 hidden w-px -translate-x-1/2 bg-line-strong lg:block"
          />

          {STEPS.map((step, i) => {
            const flipped = i % 2 === 1;
            return (
              <li
                key={step.num}
                className={`relative flex min-w-0 flex-col items-center gap-5 lg:flex-row lg:gap-12 ${
                  flipped ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className="flex w-full min-w-0 justify-center lg:w-1/2">
                  <span
                    className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full border bg-surface shadow-[var(--shadow-sm)] ${MEDALLION[step.tone]}`}
                    aria-hidden
                  >
                    <step.icon size={28} strokeWidth={1.5} />
                  </span>
                </div>

                <div
                  className={`w-full min-w-0 rounded-[var(--radius-lg)] border border-line bg-surface p-6 text-center shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] duration-[var(--duration-normal)] hover:border-line-strong hover:shadow-[var(--shadow-md)] motion-reduce:transition-none sm:p-7 lg:w-1/2 ${
                    flipped ? "lg:text-right" : "lg:text-left"
                  }`}
                >
                  <p className="type-overline text-faint">Step {step.num}</p>
                  <h3 className="type-h3 mt-2 text-ink">{step.title}</h3>
                  <p className="type-body mt-2 text-muted">{step.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
