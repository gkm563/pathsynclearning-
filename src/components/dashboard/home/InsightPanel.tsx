"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Code2,
  RefreshCw,
  Rocket,
  Shield,
  Target,
  Zap,
} from "lucide-react";
import { HOME, homeUi } from "./tokens";
import { SectionLabel } from "./shared";

export type HomeInsight = {
  icon: "target" | "zap" | "rocket" | "book" | "code" | "shield";
  text: string;
};

const ICONS = {
  target: Target,
  zap: Zap,
  rocket: Rocket,
  book: BookOpen,
  code: Code2,
  shield: Shield,
} as const;

type Props = {
  insights: HomeInsight[];
  loading: boolean;
  onRefresh: () => void;
  goalRole: string;
};

export function InsightPanel({
  insights,
  loading,
  onRefresh,
  goalRole,
}: Props) {
  return (
    <div
      className={`${homeUi.card} flex flex-col bg-[linear-gradient(145deg,rgba(3,105,161,0.08),transparent_45%),var(--bg-card)]`}
    >
      <div className="mb-3.5 flex items-start justify-between gap-3">
        <div>
          <SectionLabel tone="ocean">AI career guide</SectionLabel>
          <p className="m-0 text-[0.85rem] text-[var(--text-muted)]">
            Personal reminders for {goalRole || "your path"}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-light)] bg-[var(--bg-alt)] text-[var(--text-muted)] disabled:opacity-55"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh insights"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : undefined} />
        </button>
      </div>

      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {insights.map((item, idx) => {
          const Icon = ICONS[item.icon] || Target;
          return (
            <motion.li
              key={`${item.text}-${idx}`}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * idx, duration: 0.35 }}
              className="flex items-start gap-3 rounded-2xl border border-[var(--border-light)] bg-[var(--bg-alt)] px-3.5 py-3 text-[0.9rem] leading-snug font-semibold text-[var(--text-main)]"
            >
              <span
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] bg-[rgba(3,105,161,0.12)]"
                style={{ color: HOME.ocean }}
              >
                <Icon size={16} />
              </span>
              <span>{item.text}</span>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
