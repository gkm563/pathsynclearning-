"use client";

import { AlertTriangle, Award, MapPin, TrendingUp } from "lucide-react";
import type {
  MilestoneInfo,
  WeaknessCoach,
  ChallengeSummary,
  ChallengeGamification,
} from "@/lib/challenges/types";
import { xpProgress } from "@/lib/challenges/progress";
import { routes } from "@/lib/routes";
import { Badge, Button, Card, Progress } from "@/components/ui";
import ChallengeCard from "./ChallengeCard";

export default function ProgressExtrasPanel({
  milestones,
  weakness,
  drills,
  gamification,
  onOpen,
  onReview,
  onOpenRecords,
}: {
  milestones: MilestoneInfo[];
  weakness: WeaknessCoach | null;
  drills: ChallengeSummary[];
  gamification: ChallengeGamification;
  onOpen: (item: ChallengeSummary) => void;
  onReview: (item: ChallengeSummary) => void;
  onOpenRecords: () => void;
}) {
  const bar = xpProgress(gamification.xp);

  return (
    <div className="flex min-w-0 w-full flex-col gap-4">
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp size={16} className="text-primary" aria-hidden />
          <h3 className="type-h4 m-0 text-ink">Level {bar.level}</h3>
        </div>
        <div className="mb-2 flex justify-between gap-3">
          <span className="type-caption type-numeric text-ink">
            {bar.xp} XP total
          </span>
          <span className="type-caption type-numeric text-muted">
            {bar.intoLevel}/{bar.span} to Lv {bar.level + 1}
          </span>
        </div>
        <Progress value={bar.pct} label="XP toward next level" />
        <p className="type-small mt-3 mb-0 text-muted">
          XP and level are stored on your profile. First pass of a challenge
          awards XP once — retries keep score history without double rewards.
        </p>
      </Card>

      {weakness && (
        <Card className="border-[color-mix(in_srgb,var(--error)_28%,var(--border-light))] bg-[var(--error-soft)]">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle size={16} className="text-danger" aria-hidden />
            <h3 className="type-h4 m-0 text-ink">
              Weakness coach · {weakness.topic}
            </h3>
          </div>
          <p className="type-small mt-0 mb-3 text-muted">
            {weakness.fails} recent fails on this topic. Drill these three, then
            revisit the linked roadmap node.
          </p>
          {weakness.suggestedNodeTitle && weakness.suggestedNodeId && (
            <a
              href={`/dashboard/roadmap?node=${encodeURIComponent(weakness.suggestedNodeId)}`}
              className="type-small mb-3 inline-flex items-center gap-1.5 font-semibold text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <MapPin size={13} aria-hidden /> {weakness.suggestedNodeTitle}
            </a>
          )}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {drills.map((d) => (
              <ChallengeCard
                key={d.id}
                item={d}
                onOpen={() => onOpen(d)}
                onReview={() => onReview(d)}
              />
            ))}
          </div>
        </Card>
      )}

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Award size={16} className="text-primary" aria-hidden />
            <h3 className="type-h4 m-0 text-ink">Certificate milestones</h3>
          </div>
          <Button variant="secondary" size="sm" onClick={onOpenRecords}>
            Records & Certs
          </Button>
        </div>
        <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
          {milestones.map((m) => (
            <li
              key={m.id}
              className="flex items-start justify-between gap-3 rounded-[var(--radius-md)] border border-line bg-sunken px-3.5 py-3"
            >
              <div className="min-w-0">
                <p className="type-label m-0 text-ink">{m.title}</p>
                <p className="type-caption mt-1 mb-0 text-muted">
                  {m.description}
                </p>
              </div>
              <Badge tone={m.unlocked ? "success" : "neutral"}>
                {m.unlocked ? "Unlocked" : `Need ${m.requirement}`}
              </Badge>
            </li>
          ))}
        </ul>
        <p className="type-caption mt-3 mb-0 text-muted">
          Unlocks also appear under{" "}
          <a
            href={routes.app.recordsCerts}
            className="font-semibold text-primary hover:underline"
          >
            Records & Certs
          </a>
          .
        </p>
      </Card>
    </div>
  );
}
