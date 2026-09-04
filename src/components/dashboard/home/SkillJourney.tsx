"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { routes } from "@/lib/routes";
import type { ProgressSummary } from "@/lib/progress/types";
import { HOME, SKILL_PALETTE, homeUi } from "./tokens";
import { SectionLabel } from "./shared";

type Skill = { label: string; pct: number };

type Props = {
  skills: Skill[];
  summary: ProgressSummary | null;
};

export function SkillJourney({ skills, summary }: Props) {
  const completion = summary?.completion ?? 0;
  const done = summary?.completedTasks ?? 0;
  const total = summary?.totalTasks ?? 0;

  return (
    <div className={homeUi.card}>
      <div className={homeUi.headRow}>
        <div>
          <SectionLabel tone="ocean">Learning journey</SectionLabel>
          <h3 className={homeUi.cardTitle}>Skill momentum</h3>
        </div>
        <Link href={routes.app.progress} className={homeUi.textLink}>
          Progress <ArrowUpRight size={14} />
        </Link>
      </div>

      <div className="mb-1 flex flex-col gap-3.5">
        {skills.length === 0 ? (
          <p className={homeUi.emptyInline}>
            Add skills on your profile to track momentum here.
          </p>
        ) : (
          skills.map((sk, idx) => {
            const col = SKILL_PALETTE[idx % SKILL_PALETTE.length];
            const pct = Math.max(0, Math.min(100, Math.round(sk.pct)));
            return (
              <div key={sk.label}>
                <div className="mb-1.5 flex justify-between font-[Outfit,sans-serif] text-[0.92rem] font-bold">
                  <span>{sk.label}</span>
                  <span
                    className="font-['Fira_Code',monospace] text-[0.85rem]"
                    style={{ color: col }}
                  >
                    {pct}%
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full border border-[var(--border-light)] bg-[var(--bg-alt)]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: col }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{
                      duration: 0.9,
                      delay: idx * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 min-[641px]:grid-cols-3">
        <div>
          <div className="font-['Fira_Code',monospace] text-[10px] font-bold tracking-[0.06em] uppercase text-[var(--text-muted)]">
            Completion
          </div>
          <div
            className="mt-1 font-[Outfit,sans-serif] text-[1.2rem] font-extrabold"
            style={{ color: HOME.teal }}
          >
            {completion}%
          </div>
        </div>
        <div>
          <div className="font-['Fira_Code',monospace] text-[10px] font-bold tracking-[0.06em] uppercase text-[var(--text-muted)]">
            Tasks done
          </div>
          <div
            className="mt-1 font-[Outfit,sans-serif] text-[1.2rem] font-extrabold"
            style={{ color: HOME.ocean }}
          >
            {done}/{total || "—"}
          </div>
        </div>
        <div>
          <div className="font-['Fira_Code',monospace] text-[10px] font-bold tracking-[0.06em] uppercase text-[var(--text-muted)]">
            In progress
          </div>
          <div
            className="mt-1 font-[Outfit,sans-serif] text-[1.2rem] font-extrabold"
            style={{ color: HOME.amber }}
          >
            {summary?.inProgress ?? 0}
          </div>
        </div>
      </div>
    </div>
  );
}
