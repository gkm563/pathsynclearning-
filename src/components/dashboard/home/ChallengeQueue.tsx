"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Play } from "lucide-react";
import { routes } from "@/lib/routes";
import type { DailyChallengeCard } from "@/components/dashboard/StudentContext";
import { SKILL_PALETTE, homeUi } from "./tokens";
import { SectionLabel } from "./shared";

type Props = {
  challenges: DailyChallengeCard[];
  streak: number;
};

export function ChallengeQueue({ challenges, streak }: Props) {
  return (
    <div>
      <div className={homeUi.blockHead}>
        <div>
          <SectionLabel tone="amber">Today</SectionLabel>
          <h2 className={homeUi.blockTitle}>Daily challenges</h2>
          <p className={homeUi.blockSub}>
            {challenges.length > 0
              ? `${challenges.length} queued · streak ${streak}d`
              : "No challenges loaded yet"}
          </p>
        </div>
        <Link
          href={routes.app.challenges}
          className="inline-flex items-center gap-1.5 rounded-[14px] border-[1.5px] border-[rgba(217,119,6,0.28)] bg-[rgba(217,119,6,0.1)] px-3.5 py-2.5 font-[Outfit,sans-serif] text-[0.9rem] font-extrabold text-[#d97706] no-underline"
        >
          View all <ArrowUpRight size={15} />
        </Link>
      </div>

      {challenges.length === 0 ? (
        <div className={homeUi.emptyCard}>
          <p>Challenges will appear here once your daily pack is ready.</p>
          <Link href={routes.app.challenges} className={homeUi.textLink}>
            Open challenges
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-3.5">
          {challenges.map((task, idx) => {
            const col = SKILL_PALETTE[idx % SKILL_PALETTE.length];
            return (
              <motion.article
                key={`${task.title}-${idx}`}
                className="flex min-h-[200px] flex-col rounded-[20px] border-[1.5px] p-[18px]"
                style={{
                  borderColor: `${col}40`,
                  background: `${col}0f`,
                }}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 380, damping: 22 }}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span
                    className="rounded-[10px] border border-[var(--border-light)] bg-[var(--bg-card)] px-2.5 py-1.5 font-['Fira_Code',monospace] text-xs font-extrabold"
                    style={{ color: col }}
                  >
                    {task.icon}
                  </span>
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <span className="rounded-lg border border-[var(--border-light)] bg-[var(--bg-card)] px-2 py-0.5 text-[11px] font-bold text-[var(--text-main)]">
                      {task.diff}
                    </span>
                    <span
                      className="rounded-lg px-2 py-0.5 text-[11px] font-bold text-white"
                      style={{ background: col }}
                    >
                      +{task.xp} XP
                    </span>
                  </div>
                </div>
                <h3 className="mt-0 mb-2 font-[Outfit,sans-serif] text-[1.05rem] leading-snug font-extrabold text-[var(--text-main)]">
                  {task.title}
                </h3>
                <p className="mb-4 text-[0.85rem] font-semibold text-[var(--text-muted)]">
                  {task.category} · {task.time}
                </p>
                <Link
                  href={routes.app.challenges}
                  className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl border-[1.5px] bg-[var(--bg-card)] py-[11px] font-[Outfit,sans-serif] text-[0.9rem] font-extrabold no-underline"
                  style={
                    task.isStarted
                      ? { background: col, color: "#fff", borderColor: col }
                      : { color: col, borderColor: col }
                  }
                >
                  <Play size={14} fill={task.isStarted ? "#fff" : col} />
                  {task.isStarted ? "Resume" : "Start"}
                </Link>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}
