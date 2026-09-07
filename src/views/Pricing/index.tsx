import Link from "next/link";
import { Check, Star, User, type LucideIcon } from "lucide-react";
import {
  MarketingHero,
  MarketingPage,
} from "@/components/marketing/MarketingChrome";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

interface Plan {
  name: string;
  icon: LucideIcon;
  price: string;
  period: string;
  meta: string;
  features: readonly string[];
  cta: string;
  /** The recommended plan — gets the badge and the solid CTA. */
  featured: boolean;
}

interface Benefit {
  title: string;
  description: string;
}

const PLANS: readonly Plan[] = [
  {
    name: "Student Pro",
    icon: User,
    price: "₹99",
    period: "/ month",
    meta: "400 users active",
    features: [
      "Career roadmap generation",
      "Skill challenges access",
      "CRI (Career Readiness Index) tracking",
      "Standard peer community access",
      "Weekly progress reports",
    ],
    cta: "Start free trial",
    featured: false,
  },
  {
    name: "Student Premium",
    icon: Star,
    price: "₹150",
    period: "/ month",
    meta: "200 users active",
    features: [
      "Everything in Pro",
      "1-on-1 AI mentor support",
      "Advanced analytics & insights",
      "Direct recruiter visibility",
      "Priority project reviews",
      "Mock interview simulator",
    ],
    cta: "Upgrade to Premium",
    featured: true,
  },
];

const BENEFITS: readonly Benefit[] = [
  {
    title: "Career Readiness Index (CRI) tracking",
    description:
      "We replace arbitrary grades with a live CRI score. This score dynamically updates as you complete challenges and acts as verifiable proof-of-work for recruiters.",
  },
  {
    title: "Direct recruiter visibility",
    description:
      "Premium students who maintain a high CRI are automatically aggregated into dashboards monitored by our corporate hiring partners. Skip the resume pile.",
  },
  {
    title: "AI mentor & analytics",
    description:
      "Get unstuck instantly. The AI mentor understands your specific codebase context and guides you without giving you the raw answer, ensuring deep learning.",
  },
];

function PlanCard({ plan }: { plan: Plan }) {
  const Icon = plan.icon;
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col rounded-[var(--radius-lg)] border bg-surface p-6 sm:p-7",
        plan.featured
          ? "border-primary-border shadow-[var(--shadow-md)]"
          : "border-line shadow-[var(--shadow-xs)]",
      )}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <span
          className={cn(
            "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-primary",
            plan.featured ? "bg-primary-soft" : "bg-sunken",
          )}
          aria-hidden
        >
          <Icon size={20} />
        </span>
        <h2 className="type-h3 m-0 min-w-0 text-ink">{plan.name}</h2>
        {plan.featured ? (
          <span className="type-overline ml-auto shrink-0 rounded-full border border-accent/30 bg-accent-soft px-2.5 py-1 text-accent">
            Most popular
          </span>
        ) : null}
      </div>

      <p className="mt-6 mb-0 flex items-baseline gap-1.5">
        <span className="type-h1 type-numeric text-ink">{plan.price}</span>
        <span className="type-small text-muted">{plan.period}</span>
      </p>
      <p className="type-small mt-2 mb-0 text-faint">{plan.meta}</p>

      <ul className="m-0 mt-7 mb-8 flex list-none flex-col gap-3 p-0">
        {plan.features.map((feature) => (
          <li key={feature} className="type-body flex min-w-0 gap-2.5 text-muted">
            <Check size={17} className="mt-1 shrink-0 text-primary" aria-hidden />
            <span className="min-w-0">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={routes.auth.signUp}
        className={cn(
          "type-label mt-auto inline-flex min-h-11 w-full items-center justify-center rounded-[var(--radius-md)] px-5 transition-colors duration-[var(--duration-fast)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none",
          plan.featured
            ? "bg-primary text-on-primary hover:bg-primary-hover"
            : "border border-line-strong bg-surface text-ink hover:bg-sunken",
        )}
      >
        {plan.cta}
      </Link>
    </div>
  );
}

export default function Pricing() {
  return (
    <MarketingPage>
      <MarketingHero
        kicker="Pricing"
        title={
          <>
            Transparent pricing.
            <br />
            Maximum readiness.
          </>
        }
        description="Invest in career readiness instead of generic coursework. Roadmaps, CRI tracking, and recruiter pipelines — priced for students."
      />

      <section className="mx-auto grid w-full min-w-0 max-w-[58rem] gap-5 px-4 sm:px-6 md:grid-cols-2">
        {PLANS.map((plan) => (
          <PlanCard key={plan.name} plan={plan} />
        ))}
      </section>

      <section
        aria-labelledby="why-these-plans"
        className="mx-auto w-full min-w-0 max-w-[50rem] px-4 pt-16 sm:px-6 sm:pt-24"
      >
        <h2
          id="why-these-plans"
          className="type-h1 m-0 text-center text-balance text-ink"
        >
          Why these plans exist
        </h2>
        <p className="type-body-lg mx-auto mt-4 mb-0 max-w-[46ch] text-center text-muted">
          Every feature is designed to shorten the time between learning and
          earning.
        </p>

        <ul className="m-0 mt-10 flex list-none flex-col gap-4 p-0">
          {BENEFITS.map((benefit) => (
            <li
              key={benefit.title}
              className="min-w-0 rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-xs)] sm:p-6"
            >
              <h3 className="type-h4 m-0 text-ink">{benefit.title}</h3>
              <p className="type-body mt-2 mb-0 text-muted">
                {benefit.description}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </MarketingPage>
  );
}
