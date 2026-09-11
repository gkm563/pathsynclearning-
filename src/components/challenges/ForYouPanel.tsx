"use client";

import type { ChallengeSummary } from "@/lib/challenges/types";
import { Badge, Button, EmptyState, Section } from "@/components/ui";
import ChallengeCard from "./ChallengeCard";

export default function ForYouPanel({
  items,
  careerGoal,
  syncEnabled,
  onOpen,
  onReview,
  onUnlockHint,
  onOpenRoadmap,
  hintBusy,
}: {
  items: ChallengeSummary[];
  careerGoal: string | null;
  syncEnabled: boolean;
  onOpen: (item: ChallengeSummary) => void;
  onReview: (item: ChallengeSummary) => void;
  onUnlockHint: (item: ChallengeSummary) => void;
  onOpenRoadmap: () => void;
  hintBusy?: boolean;
}) {
  const solved = items.filter((s) => s.status === "solved").length;

  return (
    <div className="flex flex-col gap-6">
      <Section
        title="For you"
        description={
          syncEnabled
            ? "Ranked from your unfinished roadmap skills and topics. These are not the global Daily, Weekly, or Monthly featured problems."
            : "Roadmap sync is off, so these are general career-goal picks. Turn sync on in Roadmap Sync to follow unfinished nodes."
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {careerGoal ? <Badge tone="accent">{careerGoal}</Badge> : null}
            <Badge tone={syncEnabled ? "success" : "neutral"}>
              {syncEnabled ? "Roadmap synced" : "Roadmap sync off"}
            </Badge>
            <span className="type-caption text-muted">
              {solved}/{items.length} done
            </span>
          </div>
        }
      >
        {!careerGoal ? (
          <EmptyState
            title="Set a career goal"
            description="Personalize your roadmap so For you can rank problems for your path."
            action={
              <Button onClick={onOpenRoadmap}>Personalize roadmap</Button>
            }
          />
        ) : items.length === 0 ? (
          <EmptyState
            title="No personalized picks yet"
            description="Solve a few catalog problems or enable roadmap sync to fill this queue."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {items.map((item) => (
              <ChallengeCard
                key={item.slug || item.id}
                item={item}
                onOpen={() => onOpen(item)}
                onReview={() => onReview(item)}
                onUnlockHint={() => onUnlockHint(item)}
                hintBusy={hintBusy}
              />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
