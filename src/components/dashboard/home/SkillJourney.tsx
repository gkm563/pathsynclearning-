"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";
import type { ProgressSummary } from "@/lib/progress/types";
import { DescriptionList, EmptyState, Progress } from "@/components/ui";
import { routes } from "@/lib/routes";
import { homeUi, SKILL_TONES } from "./tokens";

type Skill = { label: string; pct: number };

type Props = {
  skills: Skill[];
  summary: ProgressSummary | null;
};

/**
 * "How am I trending" for skills.
 *
 * Each bar uses the `Progress` primitive, which already exposes the value via
 * `role="progressbar"` — so the visual and the accessible reading can't drift
 * apart the way a hand-rolled div-with-a-width does.
 */
export function SkillJourney({ skills, summary }: Props) {
  const total = summary?.totalTasks ?? 0;

  return (
    <div className={homeUi.card}>
      <div className={homeUi.cardHead}>
        <div className="min-w-0">
          <h3 className={homeUi.cardTitle}>Skill momentum</h3>
          <p className={homeUi.cardHint}>
            Relative strength across the skills on your profile
          </p>
        </div>
        <Link href={routes.app.progress} className={homeUi.link}>
          Full progress
          <ArrowUpRight size={14} aria-hidden />
        </Link>
      </div>

      {skills.length === 0 ? (
        <EmptyState
          compact
          icon={<Sparkles size={17} aria-hidden />}
          title="No skills tracked yet"
          description="Add the skills you’re working on to your profile and their momentum shows up here."
          action={
            <Link href={routes.app.profile} className={homeUi.link}>
              Edit profile
              <ArrowUpRight size={14} aria-hidden />
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-3.5">
          {skills.map((skill, idx) => (
            <Progress
              key={skill.label}
              label={skill.label}
              value={Math.max(0, Math.min(100, Math.round(skill.pct)))}
              tone={SKILL_TONES[idx % SKILL_TONES.length]}
              showValue
            />
          ))}
        </div>
      )}

      <DescriptionList
        className="mt-5 border-t border-line pt-4"
        items={[
          {
            label: "Overall completion",
            value: (
              <span className="type-numeric font-semibold">
                {summary?.completion ?? 0}%
              </span>
            ),
          },
          {
            label: "Tasks completed",
            value: (
              <span className="type-numeric font-semibold">
                {summary?.completedTasks ?? 0}
                {total > 0 ? ` of ${total}` : ""}
              </span>
            ),
          },
          {
            label: "In progress",
            value: (
              <span className="type-numeric font-semibold">
                {summary?.inProgress ?? 0}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
