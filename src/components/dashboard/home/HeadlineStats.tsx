"use client";

import { Coins, Flame, Gauge, Zap } from "lucide-react";
import { StatCard } from "@/components/ui";
import { CountUp } from "./shared";
import { formatCri, resolveCriMilli } from "@/lib/cri/milli";

type Props = {
  cri: number;
  criMilli?: number;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  /** Overall progress status label, once the progress payload has loaded. */
  status: string | null;
};

/**
 * "Where do I stand" — the four numbers that open the page.
 *
 * Deliberately the quietest band despite being first: it answers a question
 * the student already knows the shape of, so it reads as a readout rather than
 * competing with the primary action below it.
 */
export function HeadlineStats({ cri, criMilli, level, xp, coins, streak, status }: Props) {
  const milli = resolveCriMilli(criMilli, cri);
  const label = formatCri(milli);
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <StatCard
        label="Career readiness"
        value={`${label}%`}
        hint={status ?? (milli > 0 ? "Evidence-backed CRI" : "Not started yet")}
        icon={<Gauge size={16} aria-hidden />}
      />
      <StatCard
        label="Level"
        value={<CountUp value={level} />}
        hint={`${xp.toLocaleString()} XP earned`}
        icon={<Zap size={16} aria-hidden />}
      />
      <StatCard
        label="Day streak"
        value={<CountUp value={streak} />}
        hint={streak > 0 ? "Keep it alive today" : "Start one today"}
        icon={<Flame size={16} aria-hidden />}
      />
      <StatCard
        label="Coins"
        value={<CountUp value={coins} />}
        hint="Redeemable in the store"
        icon={<Coins size={16} aria-hidden />}
      />
    </div>
  );
}
