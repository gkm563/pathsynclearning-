"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

type Stat = {
  label: string;
  /** Final, canonical value — the only thing assistive tech ever reads. */
  value: string;
  target: number;
  format: (n: number) => string;
};

const STATS: readonly Stat[] = [
  {
    label: "Active learners",
    value: "40,000+",
    target: 40000,
    format: (n) => `${Math.round(n).toLocaleString("en-US")}+`,
  },
  {
    label: "Placement rate",
    value: "95%",
    target: 95,
    format: (n) => `${Math.round(n)}%`,
  },
  {
    label: "Hiring partners",
    value: "500+",
    target: 500,
    format: (n) => `${Math.round(n)}+`,
  },
  {
    label: "Code submissions",
    value: "2M+",
    target: 2,
    format: (n) => `${n.toFixed(1).replace(/\.0$/, "")}M+`,
  },
];

const DURATION = 1200;

/**
 * Counts every metric off a single shared 0→1 progress value, so the four
 * numbers land together instead of drifting apart on their own timers.
 * Starts when the band scrolls into view; skipped entirely under reduced
 * motion, where the final values render immediately.
 */
function useCountUp(reduced: boolean) {
  const ref = useRef<HTMLDListElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduced) {
      setProgress(1);
      return;
    }

    let frame = 0;
    let startedAt = 0;

    const tick = (now: number) => {
      if (!startedAt) startedAt = now;
      const t = Math.min(1, (now - startedAt) / DURATION);
      setProgress(1 - Math.pow(1 - t, 3));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [reduced]);

  return { ref, progress };
}

export default function StatCounter() {
  const reduced = useReducedMotion() ?? false;
  const { ref, progress } = useCountUp(reduced);

  return (
    <section
      aria-label="PathEd by the numbers"
      className="border-y border-line bg-surface px-4 py-12 sm:px-6 sm:py-14"
    >
      <dl
        ref={ref}
        className="mx-auto grid max-w-[var(--measure-content)] grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-x-8"
      >
        {STATS.map((stat) => (
          // `dt` precedes `dd` in the DOM as the spec requires; column-reverse
          // puts the number on top where the eye expects it.
          <div
            key={stat.label}
            className="flex min-w-0 flex-col-reverse items-center gap-2 text-center"
          >
            <dt className="type-overline text-muted">{stat.label}</dt>
            <dd className="type-h1 type-numeric m-0 text-ink">
              <span aria-hidden>{stat.format(stat.target * progress)}</span>
              <span className="sr-only">{stat.value}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
