"use client";

import { Clock, Share2, Shield } from "lucide-react";
import type { ChallengeSummary, ChallengesApiResponse } from "@/lib/challenges/types";
import { Badge, Button, Card, EmptyState, Section } from "@/components/ui";
import ChallengeCard from "./ChallengeCard";

function formatCountdown(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, "0")}h : ${String(m).padStart(2, "0")}m : ${String(s).padStart(2, "0")}s`;
}

export default function ChallengeOfDayPanel({
  featured,
  side,
  weekly,
  refreshInSeconds,
  careerGoal,
  cleared,
  duelCode,
  shields,
  onOpen,
  onReview,
  onUnlockHint,
  onShareDuel,
  onBuyShield,
  hintBusy,
}: {
  featured: ChallengeSummary | null;
  side: ChallengeSummary[];
  weekly: ChallengesApiResponse["weekly"];
  refreshInSeconds: number;
  careerGoal: string | null;
  cleared: boolean;
  duelCode: string;
  shields: number;
  onOpen: (item: ChallengeSummary) => void;
  onReview: (item: ChallengeSummary) => void;
  onUnlockHint: (item: ChallengeSummary) => void;
  onShareDuel: () => void;
  onBuyShield: () => void;
  hintBusy?: boolean;
}) {
  const sideDone = side.filter((s) => s.status === "solved").length;
  const featuredDone = featured?.status === "solved";

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="type-h4 m-0 text-ink">Today&apos;s pack</h3>
            {careerGoal ? <Badge tone="accent">{careerGoal}</Badge> : null}
            {cleared ? <Badge tone="success">Cleared</Badge> : null}
          </div>
          <p className="type-caption mt-2 mb-0 inline-flex items-center gap-1.5 text-muted">
            <Clock size={13} aria-hidden />
            Refresh in {formatCountdown(refreshInSeconds)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onShareDuel}>
            <Share2 size={13} aria-hidden /> Share CotD ({duelCode.slice(-6)})
          </Button>
          <Button variant="secondary" size="sm" onClick={onBuyShield}>
            <Shield size={13} aria-hidden /> Shields {shields}
          </Button>
          <span className="type-caption text-muted">
            Featured {featuredDone ? "done" : "open"} · Side {sideDone}/
            {side.length}
          </span>
        </div>
      </Card>

      {featured ? (
        <ChallengeCard
          item={featured}
          featured
          onOpen={() => onOpen(featured)}
          onReview={() => onReview(featured)}
          onUnlockHint={() => onUnlockHint(featured)}
          hintBusy={hintBusy}
        />
      ) : (
        <EmptyState
          title="No featured challenge"
          description="Complete roadmap personalization to unlock goal-aligned packs."
        />
      )}

      <Section title="Side questions">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {side.map((item) => (
            <ChallengeCard
              key={item.id}
              item={item}
              onOpen={() => onOpen(item)}
              onReview={() => onReview(item)}
              onUnlockHint={() => onUnlockHint(item)}
              hintBusy={hintBusy}
            />
          ))}
        </div>
      </Section>

      <Section title={`Weekly boss · ${weekly.weekKey} · ${weekly.progress}%`}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {weekly.boss && (
            <ChallengeCard
              item={weekly.boss}
              boss
              onOpen={() => onOpen(weekly.boss!)}
              onReview={() => onReview(weekly.boss!)}
              onUnlockHint={() => onUnlockHint(weekly.boss!)}
              hintBusy={hintBusy}
            />
          )}
          {weekly.parts.map((item) => (
            <ChallengeCard
              key={item.id}
              item={item}
              onOpen={() => onOpen(item)}
              onReview={() => onReview(item)}
              onUnlockHint={() => onUnlockHint(item)}
              hintBusy={hintBusy}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}
