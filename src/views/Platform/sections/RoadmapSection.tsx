"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { Kicker, Reveal, SectionBlock, SplitRow } from "./shell";

type SkillState = "mastered" | "active" | "locked";

type RoadmapSkill = {
  label: string;
  pct: number;
  state: SkillState;
  status: string;
};

const TARGET_SKILLS: readonly RoadmapSkill[] = [
  {
    label: "Programming fundamentals",
    pct: 100,
    state: "mastered",
    status: "Mastered",
  },
  {
    label: "Object-oriented concepts",
    pct: 90,
    state: "mastered",
    status: "Mastered",
  },
  { label: "Data structures", pct: 65, state: "active", status: "Live" },
  { label: "System design", pct: 0, state: "locked", status: "Locked" },
];

const FILL_CLASS: Record<SkillState, string> = {
  mastered: "bg-success",
  active: "bg-accent",
  locked: "bg-line-strong",
};

const STATUS_CLASS: Record<SkillState, string> = {
  mastered: "text-success",
  active: "text-accent",
  locked: "text-faint",
};

function SkillMeter({ skill, index }: { skill: RoadmapSkill; index: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <li className="min-w-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="type-label min-w-0 text-ink">{skill.label}</span>
        <span
          className={cn(
            "type-caption type-numeric shrink-0 font-semibold",
            STATUS_CLASS[skill.state],
          )}
        >
          {skill.pct}% · {skill.status}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={skill.pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${skill.label} — ${skill.status}`}
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-sunken"
      >
        <motion.div
          className={cn("h-full rounded-full", FILL_CLASS[skill.state])}
          initial={{ width: reduceMotion ? `${skill.pct}%` : 0 }}
          whileInView={{ width: `${skill.pct}%` }}
          viewport={{ once: true }}
          transition={{
            duration: reduceMotion ? 0 : 0.32,
            delay: reduceMotion ? 0 : index * 0.06,
            ease: [0.05, 0.7, 0.1, 1],
          }}
        />
      </div>
    </li>
  );
}

export default function RoadmapSection() {
  return (
    <SectionBlock id="features" tone="surface" labelledBy="features-title">
      <SplitRow
        media={
          <Reveal delay={0.06}>
            <div className="rounded-[var(--radius-xl)] border border-line bg-canvas p-5 shadow-[var(--shadow-sm)] sm:p-7">
              <p className="type-overline m-0 text-primary">
                Target · Software development engineer
              </p>
              <ul className="mt-6 flex list-none flex-col gap-5 p-0">
                {TARGET_SKILLS.map((skill, index) => (
                  <SkillMeter key={skill.label} skill={skill} index={index} />
                ))}
              </ul>
            </div>
          </Reveal>
        }
      >
        <Reveal>
          <Kicker variant="accent">The degree as a skill graph</Kicker>
          <h2 id="features-title" className="type-h1 mt-5 text-ink">
            A personalized learning roadmap.
          </h2>
          <p className="type-body-lg mt-4 text-muted">
            Instead of a static list of courses, PathEd visualizes your entire
            degree as a skill graph. Every skill is a destination connected by
            logical pathways showing you exactly what to learn next to reach
            your ultimate goal.
          </p>
          <p className="type-body-lg mt-4 text-muted">
            See clearly how{" "}
            <strong className="font-semibold text-ink">
              programming fundamentals
            </strong>{" "}
            lead to{" "}
            <strong className="font-semibold text-ink">
              object-oriented concepts
            </strong>
            , which then connect to{" "}
            <strong className="font-semibold text-ink">data structures</strong> —
            building your expertise layer by layer, exactly as industry
            professionals do.
          </p>
        </Reveal>
      </SplitRow>
    </SectionBlock>
  );
}
