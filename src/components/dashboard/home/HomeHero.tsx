"use client";

import { motion } from "framer-motion";
import { Coins, Flame, Sparkles, Zap } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { HOME } from "./tokens";
import { SectionLabel } from "./shared";

type Props = {
  name: string;
  degree: string;
  institute: string;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  goalRole: string;
  goalWhy: string;
  skills: string[];
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const from = 0;
    const duration = 700;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span>{display.toLocaleString()}</span>;
}

export function HomeHero({
  name,
  degree,
  institute,
  level,
  xp,
  coins,
  streak,
  goalRole,
  goalWhy,
  skills,
}: Props) {
  const first = name.trim().split(/\s+/)[0] || "Student";

  return (
    <div className="relative overflow-hidden rounded-[28px] border-[1.5px] border-[var(--border-light)] bg-[radial-gradient(1200px_280px_at_10%_-20%,rgba(15,118,110,0.16),transparent_55%),radial-gradient(900px_240px_at_90%_0%,rgba(3,105,161,0.12),transparent_50%),linear-gradient(160deg,var(--bg-card)_0%,var(--bg-alt)_100%)] px-7 pt-7 pb-6 max-sm:rounded-[22px] max-sm:px-4 max-sm:py-5">
      <motion.div
        className="pointer-events-none absolute -right-[10%] -bottom-[40%] left-[40%] h-[180px] bg-[radial-gradient(circle,rgba(15,118,110,0.18),transparent_70%)]"
        aria-hidden
        animate={{ y: [0, -12, 0], scale: [1, 1.05, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <SectionLabel tone="teal">Student Home</SectionLabel>
          <h1 className="m-0 font-[Outfit,sans-serif] text-[clamp(1.6rem,3.2vw,2.15rem)] font-extrabold tracking-[-0.02em] text-[var(--text-main)]">
            Welcome back,{" "}
            <span className="bg-[linear-gradient(120deg,#0f766e,#0369a1)] bg-clip-text text-transparent">
              {first}
            </span>
          </h1>
          <p className="mt-2 mb-0 text-[0.95rem] font-medium text-[var(--text-muted)]">
            {degree}
            {institute ? ` · ${institute}` : ""}
          </p>
        </div>
        <div
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(15,118,110,0.28)] bg-[rgba(15,118,110,0.12)] px-3.5 py-2.5 font-['Fira_Code',monospace] text-xs font-bold text-[#0f766e]"
          title={`Level ${level}`}
        >
          <Sparkles size={16} />
          Level {level}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 min-[641px]:grid-cols-3">
        <MetricChip
          icon={<Zap size={18} />}
          label="XP"
          value={xp}
          tone="ocean"
        />
        <MetricChip
          icon={<Coins size={18} />}
          label="Coins"
          value={coins}
          tone="amber"
        />
        <MetricChip
          icon={<Flame size={18} />}
          label="Streak"
          value={streak}
          suffix="d"
          tone="rose"
        />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-[var(--border-light)] pt-[18px] max-sm:items-start">
        <div>
          <SectionLabel tone="ocean">Career goal</SectionLabel>
          <h2 className="m-0 font-[Outfit,sans-serif] text-[clamp(1.25rem,2.4vw,1.65rem)] font-extrabold text-[var(--text-main)]">
            {goalRole}
          </h2>
          {goalWhy ? (
            <p className="mt-1.5 mb-0 max-w-[520px] text-[0.9rem] leading-[1.45] text-[var(--text-muted)]">
              {goalWhy}
            </p>
          ) : null}
        </div>
        {skills.length > 0 ? (
          <div className="flex flex-wrap justify-end gap-2 max-sm:justify-start">
            {skills.slice(0, 6).map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-[var(--border-light)] bg-[var(--bg-card)] px-3 py-1.5 text-xs font-bold text-[#0f766e]"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MetricChip({
  icon,
  label,
  value,
  suffix = "",
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  suffix?: string;
  tone: "ocean" | "amber" | "rose";
}) {
  const colors =
    tone === "amber"
      ? { fg: HOME.amber, bg: HOME.amberSoft, bd: HOME.amberBorder }
      : tone === "rose"
        ? { fg: HOME.rose, bg: HOME.roseSoft, bd: HOME.roseBorder }
        : { fg: HOME.ocean, bg: HOME.oceanSoft, bd: HOME.oceanBorder };

  return (
    <motion.div
      className="flex items-center gap-3 rounded-[18px] border-[1.5px] px-4 py-3.5"
      style={{ background: colors.bg, borderColor: colors.bd, color: colors.fg }}
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
    >
      {icon}
      <div>
        <div className="font-['Fira_Code',monospace] text-[10px] font-bold tracking-[0.08em] uppercase opacity-85">
          {label}
        </div>
        <div className="font-[Outfit,sans-serif] text-[1.25rem] leading-tight font-extrabold">
          <AnimatedNumber value={value} />
          {suffix}
        </div>
      </div>
    </motion.div>
  );
}
