"use client";

import {
  Briefcase,
  Target,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Kicker, Reveal, SectionBlock, SplitRow } from "./shell";

const CRI_SIGNALS: readonly { icon: LucideIcon; text: string }[] = [
  { icon: Target, text: "Overall skill coverage for your target career" },
  { icon: TrendingUp, text: "Mastery levels achieved on each skill node" },
  { icon: Zap, text: "Consistency of performance over time" },
  { icon: Briefcase, text: "Progress in interview preparedness" },
];

export default function ReadinessSection() {
  return (
    <SectionBlock labelledBy="cri-title">
      <SplitRow
        mediaFirst
        media={
          <Reveal delay={0.06}>
            <figure className="m-0 overflow-hidden rounded-[var(--radius-xl)] border border-line bg-surface">
              <div className="relative aspect-[16/10]">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
                  alt=""
                  aria-hidden
                  width={1200}
                  height={750}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <span className="absolute inset-0 bg-inverse/78" aria-hidden />
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                  <p className="type-display type-numeric m-0 text-on-inverse">
                    84
                    <span className="type-h1 align-top text-on-inverse/70">
                      %
                    </span>
                  </p>
                  <p className="type-overline mt-3 mb-0 text-on-inverse/75">
                    CRI score
                  </p>
                </div>
              </div>
              <figcaption className="border-t border-line p-5">
                <div
                  role="img"
                  aria-label="Career Readiness Index: 84 out of 100"
                  className="h-2 w-full overflow-hidden rounded-full bg-sunken"
                >
                  <span className="block h-full w-[84%] rounded-full bg-primary" />
                </div>
                <p className="type-caption mt-2.5 mb-0 text-muted">
                  A single 0–100 signal, recalculated after every assessment.
                </p>
              </figcaption>
            </figure>
          </Reveal>
        }
      >
        <Reveal>
          <Kicker>Metrics that matter</Kicker>
          <h2 id="cri-title" className="type-h1 mt-5 text-ink">
            The Career Readiness Index.
          </h2>
          <p className="type-body-lg mt-4 text-muted">
            Unlike traditional grades, which only show how you performed on a
            single exam, the CRI is a sophisticated 0–100 score that synthesizes
            multiple data points into a real-time signal of your true job
            readiness.
          </p>
          <ul className="mt-7 flex list-none flex-col gap-2.5 p-0">
            {CRI_SIGNALS.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex min-h-11 min-w-0 items-center gap-3 rounded-[var(--radius-md)] border border-line bg-surface px-4 py-3"
              >
                <span
                  aria-hidden
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-primary-soft text-primary"
                >
                  <Icon size={16} />
                </span>
                <span className="type-body min-w-0 text-ink">{text}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </SplitRow>
    </SectionBlock>
  );
}
