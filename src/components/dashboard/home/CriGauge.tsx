"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { HOME, homeUi } from "./tokens";
import { SectionLabel } from "./shared";

export function CriGauge({
  cri,
  status,
  focus,
}: {
  cri: number;
  status?: string | null;
  focus?: string | null;
}) {
  const target = Math.max(0, Math.min(100, Math.round(Number(cri) || 0)));
  const [score, setScore] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const duration = 900;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setScore(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  const r = 58;
  const c = 2 * Math.PI * r;
  const offset = c - (c * score) / 100;

  return (
    <div className={`${homeUi.card} text-center`}>
      <SectionLabel>Career readiness</SectionLabel>
      <div className="relative mx-auto mt-2 mb-3.5 h-[150px] w-[150px]">
        <svg width="150" height="150" viewBox="0 0 150 150" aria-hidden>
          <circle
            cx="75"
            cy="75"
            r={r}
            fill="none"
            stroke="var(--border-light)"
            strokeWidth="12"
          />
          <motion.circle
            cx="75"
            cy="75"
            r={r}
            fill="none"
            stroke={HOME.teal}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            transform="rotate(-90 75 75)"
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-[Outfit,sans-serif] text-[2.1rem] leading-none font-extrabold text-[#0f766e]">
            {score}%
          </span>
          <small className="mt-1 font-['Fira_Code',monospace] text-[10px] tracking-[0.08em] text-[var(--text-muted)]">
            CRI
          </small>
        </div>
      </div>
      <p className="m-0 text-[0.9rem] leading-[1.45] font-semibold text-[var(--text-main)]">
        {target > 0
          ? `Readiness at ${target}%. Keep completing challenges to climb.`
          : "Complete challenges and roadmap nodes to build your CRI."}
      </p>
      {(status || focus) && (
        <div className="mt-3.5 flex flex-wrap justify-center gap-2">
          {status ? (
            <span className="rounded-full border border-[var(--border-light)] bg-[var(--bg-alt)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-muted)]">
              {status}
            </span>
          ) : null}
          {focus ? (
            <span className="rounded-full border border-[var(--border-light)] bg-[var(--bg-alt)] px-2.5 py-1 text-[11px] font-bold text-[var(--text-muted)]">
              Focus · {focus}
            </span>
          ) : null}
        </div>
      )}
    </div>
  );
}
