"use client";

import Link from "next/link";
import { ArrowUpRight, ListChecks, Play } from "lucide-react";
import type { DailyChallengeCard } from "@/components/dashboard/StudentContext";
import { Badge, EmptyState, Progress } from "@/components/ui";
import { routes } from "@/lib/routes";
import { homeUi } from "./tokens";

type Props = {
  challenges: DailyChallengeCard[];
  streak: number;
};

/**
 * Today's challenge queue.
 *
 * Rows rather than a card grid: four equally-weighted cards would compete with
 * the primary action beside them, and a list makes "which one is already
 * started" readable at a glance on a phone.
 */
export function ChallengeQueue({ challenges, streak }: Props) {
  const queue = challenges.slice(0, 4);

  return (
    <div className={homeUi.card}>
      <div className={homeUi.cardHead}>
        <div className="min-w-0">
          <h3 className={homeUi.cardTitle}>Today’s challenges</h3>
          <p className={homeUi.cardHint}>
            {queue.length > 0
              ? `${queue.length} queued · ${streak}-day streak`
              : "Your daily pack hasn’t been built yet"}
          </p>
        </div>
        <Link href={routes.app.challenges} className={homeUi.link}>
          View all
          <ArrowUpRight size={14} aria-hidden />
        </Link>
      </div>

      {queue.length === 0 ? (
        <EmptyState
          compact
          icon={<ListChecks size={17} aria-hidden />}
          title="No challenges queued"
          description="Challenges appear here once your daily pack is ready. Browse the library to start one now."
          action={
            <Link href={routes.app.challenges} className={homeUi.link}>
              Open challenges
              <ArrowUpRight size={14} aria-hidden />
            </Link>
          }
        />
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {queue.map((task, idx) => (
            <li
              key={`${task.title}-${idx}`}
              className="flex min-w-0 flex-col gap-3 rounded-[var(--radius-md)] border border-line bg-sunken p-3 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="type-code type-numeric rounded-[var(--radius-sm)] border border-line bg-surface px-1.5 py-0.5 text-muted">
                    {task.icon}
                  </span>
                  <Badge tone="neutral">{task.diff}</Badge>
                  <Badge tone="accent">+{task.xp} XP</Badge>
                </div>

                <p className="type-label mt-2 mb-0 text-ink">{task.title}</p>
                <p className="type-caption mt-1 mb-0 text-muted">
                  {task.category} · {task.time}
                </p>

                {task.isStarted ? (
                  <Progress
                    className="mt-2.5"
                    size="sm"
                    value={task.pct}
                    label="Progress"
                    showValue
                  />
                ) : null}
              </div>

              <Link
                href={routes.app.challenges}
                className="type-label inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-primary-border bg-primary-soft px-4 text-primary transition-colors duration-[var(--duration-fast)] hover:bg-primary hover:text-on-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                aria-label={`${task.isStarted ? "Resume" : "Start"} ${task.title}`}
              >
                <Play size={14} aria-hidden />
                {task.isStarted ? "Resume" : "Start"}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
