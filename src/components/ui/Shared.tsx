"use client";

import type { CSSProperties, MouseEventHandler, ReactNode } from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface HoverCardProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
}

export function HoverCard({ children, style, className, onMouseEnter, onMouseLeave }: HoverCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: "0 30px 60px rgba(108,99,255,0.3)", transition: { type: "spring", stiffness: 400, damping: 17 } }}
      className={className}
      style={{ ...style }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </motion.div>
  );
}

interface InteractiveCardProps {
  children: ReactNode;
  style?: CSSProperties;
  delay?: number;
  hoverColor?: string;
  [key: string]: unknown;
}

export function InteractiveCard({ children, style, delay = 0, hoverColor, ...props }: InteractiveCardProps) {
  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, delay } };
  return (
    <motion.div
      {...fadeInUp}
      whileHover={{
        y: -8,
        scale: 1.02,
        boxShadow: hoverColor
          ? `0 0 0 2px ${hoverColor}, 0 10px 30px ${hoverColor}40`
          : "0 20px 40px rgba(108,99,255,0.15)",
        transition: { type: "spring", stiffness: 400, damping: 17 },
      }}
      {...props}
      style={{ cursor: "pointer", ...style }}
    >
      {children}
    </motion.div>
  );
}

interface RecruiterValidationSectionProps {
  tag?: string;
  title?: ReactNode;
  desc1?: string;
  desc2?: string;
  img?: string;
}

export function RecruiterValidationSection({
  tag = "▸ RECRUITER VERIFIED",
  title = (
    <>
      Transparent Skills.
      <br />
      Assured Placements.
    </>
  ),
  desc1 = "Your hard work doesn't go unnoticed. PathEd gives authorized recruiters direct visibility into your verified performance, skill roadmap, and CRI scores.",
  desc2 = "By validating your skills through our uncompromising metrics, you bypass traditional hiring friction and connect directly with companies looking for true, demonstrable readiness.",
  img = "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80",
}: RecruiterValidationSectionProps) {
  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };
  return (
    <section className="border-y border-[var(--border-light)] bg-[var(--bg-main)] px-8 py-[100px]">
      <div className="mx-auto flex max-w-[1360px] flex-wrap items-center gap-[60px]">
        <motion.div {...fadeInUp} className="min-w-0 flex-[1_1_500px]">
          <Chip bg="#e6f4ff" border="var(--border-strong)" color="#1677ff">
            {tag}
          </Chip>
          <h2 className="my-6 font-display text-[clamp(36px,4vw,56px)] font-extrabold leading-[1.15] text-[var(--text-main)]">
            {title}
          </h2>
          <p className="mb-6 text-lg leading-loose text-[var(--text-muted)]">{desc1}</p>
          {desc2 && <p className="text-lg leading-loose text-[var(--text-muted)]">{desc2}</p>}
        </motion.div>

        <motion.div {...fadeInUp} className="min-w-0 flex-[1_1_600px]">
          <HoverCard className="relative h-[400px] overflow-hidden rounded-3xl border-[1.5px] border-[var(--border-strong)] bg-[var(--bg-card)] shadow-[0_20px_60px_rgba(22,119,255,0.15)]" style={{ height: 400, borderRadius: 24, overflow: "hidden" }}>
            <Image src={img} alt="Recruiter reviewing candidate" fill className="object-cover" sizes="(max-width: 768px) 100vw, 600px" />
          </HoverCard>
        </motion.div>
      </div>
    </section>
  );
}

interface QuoteSectionProps {
  quote: string;
  author: string;
  role: string;
}

export function QuoteSection({ quote, author, role }: QuoteSectionProps) {
  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };
  return (
    <section className="bg-linear-to-br from-[#1a1a2e] to-[#2a2a4e] px-8 py-20 text-[var(--text-inverse)]">
      <div className="mx-auto max-w-[1000px] text-center">
        <motion.div {...fadeInUp}>
          <div className="mb-5 text-[64px] leading-none text-[#6c63ff] opacity-40">&quot;</div>
          <h3 className="mb-8 font-display text-[clamp(24px,3vw,36px)] font-light italic leading-relaxed">{quote}</h3>
          <div className="inline-flex flex-col items-center">
            <div className="mb-4 h-0.5 w-10 bg-[#6c63ff]" />
            <div className="font-display text-xl font-bold">{author}</div>
            <div className="mt-1 font-sans text-sm tracking-wide text-[#b2aeff] uppercase">{role}</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

interface ChipProps {
  bg: string;
  border: string;
  color: string;
  children: ReactNode;
}

export function Chip({ bg, border, color, children }: ChipProps) {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-[20px] px-3.5 py-1.5 font-mono text-[11px] font-semibold tracking-wide"
      style={{ background: bg, border: `1px solid ${border}`, color }}
    >
      {children}
    </div>
  );
}

interface SkillBarProps {
  label?: string;
  pct: number;
  c: string;
  delay?: number;
}

export function SkillBar({ label, pct, c, delay = 0 }: SkillBarProps) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), 600 + delay);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div className={label ? "mb-2.5" : ""}>
      {label && (
        <div className="mb-1 flex justify-between">
          <span className="font-sans text-[11px] text-[var(--text-muted)]">{label}</span>
          <span className="font-mono text-[10px]" style={{ color: c }}>
            {pct}%
          </span>
        </div>
      )}
      <div className="h-1.5 overflow-hidden rounded-[3px] bg-[var(--border-light)]">
        <div
          className="h-full rounded-[3px] transition-[width] duration-1000"
          style={{ width: `${w}%`, background: `linear-gradient(90deg,${c},${c}99)` }}
        />
      </div>
    </div>
  );
}

interface RoleCardProps {
  icon: ReactNode;
  title: string;
  tagline: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}

export function RoleCard({ icon, title, tagline, desc, active, onClick }: RoleCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -6, scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 17 } }}
      className="relative min-w-[155px] flex-1 overflow-hidden rounded-[18px] px-[22px] py-[26px] text-left"
      style={{
        background: active ? "var(--role-card-active)" : "var(--bg-card)",
        border: `2px solid ${active ? "#6c63ff" : "var(--border-light)"}`,
        boxShadow: active
          ? "0 16px 48px rgba(108,99,255,.2),0 0 0 4px rgba(108,99,255,.08)"
          : "0 4px 14px rgba(0,0,0,0.03)",
      }}
    >
      {active && (
        <div className="absolute top-0 right-0 left-0 h-[3px] rounded-t-[18px] bg-linear-to-r from-[#6c63ff] to-[#00c9a7]" />
      )}
      <div
        className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-xl text-[22px] transition-all"
        style={{
          background: active ? "linear-gradient(135deg,#6c63ff,#00c9a7)" : "var(--bg-alt)",
          boxShadow: active ? "0 6px 18px rgba(108,99,255,.3)" : "none",
          color: active ? "var(--bg-card)" : "var(--text-muted)",
        }}
      >
        {icon}
      </div>
      <div
        className="mb-1.5 font-display text-2xl font-extrabold"
        style={{ color: active ? "var(--text-main)" : "var(--text-muted)" }}
      >
        {title}
      </div>
      <div
        className="mb-3 font-mono text-[13px] tracking-wide"
        style={{ color: active ? "#6c63ff" : "var(--text-light)" }}
      >
        {tagline}
      </div>
      <div
        className="font-sans text-[15px] leading-relaxed"
        style={{ color: active ? "var(--text-muted)" : "var(--text-light)" }}
      >
        {desc}
      </div>
    </motion.button>
  );
}
