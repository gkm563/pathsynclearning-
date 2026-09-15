"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Badge, Button } from "@/components/ui";
import { CountUp } from "./shared";
import { homeUi } from "./tokens";
import { formatCri, resolveCriMilli } from "@/lib/cri/milli";
import { WhyCriDialog } from "@/components/cri/WhyCriDialog";

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type Props = {
  cri: number;
  criMilli?: number;
  status?: string | null;
  focus?: string | null;
};

/**
 * Career Readiness Index dial.
 *
 * The SVG is `aria-hidden` because a ring conveys nothing to a screen reader;
 * the `<figcaption>` carries the same information as a sentence, and the live
 * value lives in `CountUp`'s polite region.
 */
export function CriGauge({ cri, criMilli, status, focus }: Props) {
  const reduceMotion = useReducedMotion();
  const [whyOpen, setWhyOpen] = useState(false);
  const milli = resolveCriMilli(criMilli, cri);
  const pct = Math.max(0, Math.min(100, Math.round(milli / 1000)));
  const label = formatCri(milli);
  const target = CIRCUMFERENCE - (CIRCUMFERENCE * pct) / 100;
  const [offset, setOffset] = useState(CIRCUMFERENCE);

  useEffect(() => {
    if (reduceMotion) {
      setOffset(target);
      return;
    }
    const frame = requestAnimationFrame(() => setOffset(target));
    return () => cancelAnimationFrame(frame);
  }, [target, reduceMotion]);

  const summary = [
    `Career readiness index ${label} out of 100.`,
    status ? `Status: ${status}.` : null,
    focus ? `Current focus: ${focus}.` : null,
    "Calculated from verified PathED evidence. It does not guarantee a job.",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={homeUi.card}>
      <h3 className={homeUi.cardTitle}>Career readiness</h3>

      <figure className="m-0 mt-4 flex flex-col items-center">
        <div className="relative h-36 w-36">
          <svg viewBox="0 0 140 140" className="h-full w-full" aria-hidden>
            <circle
              cx="70"
              cy="70"
              r={RADIUS}
              strokeWidth="12"
              className="fill-none stroke-line"
            />
            <circle
              cx="70"
              cy="70"
              r={RADIUS}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={offset}
              transform="rotate(-90 70 70)"
              className="fill-none stroke-primary transition-[stroke-dashoffset] duration-[var(--duration-slow)] ease-[var(--ease-entrance)] motion-reduce:transition-none"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <CountUp
              value={pct}
              suffix="%"
              className="type-numeric text-[2rem] leading-none font-semibold tracking-[-0.04em] text-ink"
            />
            <span className="type-overline mt-1.5 text-faint">CRI {label}</span>
          </div>
        </div>

        <figcaption className="type-small mt-4 mb-0 text-center text-muted">
          {summary}
        </figcaption>
      </figure>

      {status || focus ? (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {status ? <Badge tone="accent">{status}</Badge> : null}
          {focus ? <span className={homeUi.chip}>Focus · {focus}</span> : null}
        </div>
      ) : null}

      <div className="mt-4 flex justify-center">
        <Button variant="secondary" className="min-h-11" onClick={() => setWhyOpen(true)}>
          Why {label}%?
        </Button>
      </div>
      <WhyCriDialog open={whyOpen} onClose={() => setWhyOpen(false)} />
    </div>
  );
}
