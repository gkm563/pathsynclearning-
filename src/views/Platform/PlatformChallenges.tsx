"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Coins, Flame, Shield, Sparkles, Trophy } from "lucide-react";
import { apiGet, apiSend } from "@/lib/api";
import { routes, problemPath } from "@/lib/routes";
import { SHIELD_COST, xpProgress } from "@/lib/challenges/progress";
import type {
  ChallengesApiResponse,
  ChallengeSummary,
} from "@/lib/challenges/types";
import {
  Button,
  Card,
  ErrorState,
  PageHeader,
  PageSkeleton,
  Progress,
  StatCard,
  TabPanel,
  Tabs,
  useToast,
} from "@/components/ui";
import ChallengeOfDayPanel from "@/components/challenges/ChallengeOfDayPanel";
import ForYouPanel from "@/components/challenges/ForYouPanel";
import RoadmapSyncPanel from "@/components/challenges/RoadmapSyncPanel";
import ArenaPanel from "@/components/challenges/ArenaPanel";
import ProgressExtrasPanel from "@/components/challenges/ProgressExtrasPanel";
import ChallengeReviewModal from "@/components/challenges/ChallengeReviewModal";

type TabId = "cotd" | "foryou" | "arena" | "progress" | "sync";

export default function PlatformChallenges() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const openId = searchParams.get("open")?.trim() || "";
  const toast = useToast();
  const [tab, setTab] = useState<TabId>("cotd");
  const [data, setData] = useState<ChallengesApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [syncSaving, setSyncSaving] = useState(false);
  const [hintBusy, setHintBusy] = useState(false);
  const [reviewItem, setReviewItem] = useState<ChallengeSummary | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [arenaSessionSolved, setArenaSessionSolved] = useState<string[]>([]);

  const flash = (msg: string, tone: "success" | "error" | "info" = "info") => {
    toast[tone](msg);
  };

  const load = useCallback(async () => {
    try {
      setError("");
      const res = await apiGet<ChallengesApiResponse>("/api/me/challenges");
      setData(res);
      setCountdown(res.daily.refreshInSeconds);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load challenges");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!openId) return;
    router.replace(problemPath(openId));
  }, [openId, router]);

  useEffect(() => {
    if (!data?.daily.dateKey) return;
    const t = window.setInterval(() => {
      setCountdown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [data?.daily.dateKey]);

  const openItem = useCallback(
    (item: ChallengeSummary) => {
      router.push(problemPath(item.slug || item.id));
    },
    [router],
  );

  const toggleSync = async (enabled: boolean) => {
    setSyncSaving(true);
    try {
      const res = await apiSend<ChallengesApiResponse>(
        "/api/me/challenges/sync",
        "PUT",
        { enabled },
      );
      setData(res);
      flash(
        enabled ? "Roadmap sync enabled" : "Roadmap sync disabled",
        "success",
      );
    } catch (e) {
      flash(e instanceof Error ? e.message : "Sync update failed", "error");
    } finally {
      setSyncSaving(false);
    }
  };

  const runAction = async (body: Record<string, unknown>, okMsg: string) => {
    try {
      const res = await apiSend<ChallengesApiResponse>(
        "/api/me/challenges/action",
        "POST",
        body,
      );
      setData(res);
      flash(okMsg, "success");
    } catch (e) {
      flash(e instanceof Error ? e.message : "Action failed", "error");
    }
  };

  const unlockHint = async (item: ChallengeSummary) => {
    setHintBusy(true);
    try {
      await runAction(
        { action: "unlock_hint", questionId: item.id },
        "Hint unlocked",
      );
    } finally {
      setHintBusy(false);
    }
  };

  const arenaPack = useMemo(() => {
    if (!data) return [];
    const map = new Map(data.questions.map((q) => [q.id, q]));
    return data.arena.packIds
      .map((id) => map.get(id))
      .filter(Boolean) as ChallengeSummary[];
  }, [data]);

  const drills = useMemo(() => {
    if (!data?.weakness) return [];
    const map = new Map(data.questions.map((q) => [q.id, q]));
    return data.weakness.drillIds
      .map((id) => map.get(id))
      .filter(Boolean) as ChallengeSummary[];
  }, [data]);

  const g = data?.gamification;
  const levelBar = xpProgress(g?.xp || 0);

  if (loading) {
    return <PageSkeleton />;
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Couldn't load challenges"
        description="The challenge catalogue didn't come back. Retry, and if it keeps failing the service is temporarily unavailable."
        detail={error || undefined}
        action={
          <Button variant="secondary" onClick={() => void load()}>
            Try again
          </Button>
        }
      />
    );
  }

  const goalBits = [
    data.careerGoal || "Goal not set",
    data.sync.enabled ? "Roadmap synced" : null,
    data.daily.cleared ? "CotD cleared" : null,
  ].filter(Boolean);

  return (
    <>
      <PageHeader
        eyebrow="Practice"
        title="Challenges"
        description={goalBits.join(" · ")}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => router.push(routes.app.problems)}>
              Problem list
            </Button>
            <span className="type-caption inline-flex items-center gap-1.5 text-muted">
              <Coins size={13} aria-hidden />
              {g?.coins ?? 0} coins
            </span>
            <span className="type-caption inline-flex items-center gap-1.5 text-muted">
              <Flame size={13} aria-hidden />
              {g?.streak ?? 0} day streak
            </span>
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          label="Level"
          value={levelBar.level}
          hint={`${levelBar.xp} / ${levelBar.next} XP`}
          icon={<Sparkles size={16} />}
        />
        <StatCard
          label="XP"
          value={g?.xp ?? 0}
          hint={`${levelBar.pct}% to next level`}
        />
        <StatCard
          label="Catalog"
          value={data.catalogMeta.total}
          hint="Problems you can solve"
          icon={<Trophy size={16} />}
        />
        <StatCard
          label="Shields"
          value={g?.streakShields ?? 0}
          hint={`${g?.streak ?? 0} day streak`}
          icon={<Shield size={16} />}
        />
      </div>

      <Progress
        value={levelBar.pct}
        label="Level progress"
        className="mb-6"
      />

      <Tabs<TabId>
        items={[
          { id: "cotd", label: "Featured" },
          {
            id: "foryou",
            label: "For you",
            badge: (data.forYou?.length || data.daily.side.length) || undefined,
          },
          { id: "arena", label: "Timed Arena" },
          { id: "progress", label: "Milestones" },
          { id: "sync", label: "Roadmap Sync" },
        ]}
        value={tab}
        onChange={setTab}
        ariaLabel="Challenge sections"
        className="mb-6"
      />

      <TabPanel active={tab === "cotd"}>
        <ChallengeOfDayPanel
          featured={data.daily.featured}
          weekly={data.weekly}
          monthly={data.monthly}
          refreshInSeconds={countdown || data.daily.refreshInSeconds}
          careerGoal={data.careerGoal}
          cleared={data.daily.cleared}
          duelCode={data.duelCode}
          shields={data.gamification.streakShields}
          onOpen={openItem}
          onReview={setReviewItem}
          onUnlockHint={(item) => void unlockHint(item)}
          onShareDuel={() => {
            const text = `PathED CotD duel ${data.duelCode} — same pack today. Join Challenges.`;
            void navigator.clipboard?.writeText(text);
            flash("Duel code copied", "success");
          }}
          onBuyShield={() =>
            void runAction(
              { action: "buy_shield" },
              `Streak shield purchased (−${SHIELD_COST} coins)`,
            )
          }
          hintBusy={hintBusy}
        />
      </TabPanel>

      <TabPanel active={tab === "foryou"}>
        <ForYouPanel
          items={data.forYou?.length ? data.forYou : data.daily.side}
          careerGoal={data.careerGoal}
          syncEnabled={data.sync.enabled}
          onOpen={openItem}
          onReview={setReviewItem}
          onUnlockHint={(item) => void unlockHint(item)}
          onOpenRoadmap={() => router.push(routes.app.roadmapPersonalize)}
          hintBusy={hintBusy}
        />
      </TabPanel>

      <TabPanel active={tab === "arena"}>
        <ArenaPanel
          pack={arenaPack}
          bestScore={data.arena.bestScore}
          lastPlayedAt={data.arena.lastPlayedAt}
          sessionSolvedIds={arenaSessionSolved}
          onSessionStart={() => setArenaSessionSolved([])}
          onOpen={openItem}
          onComplete={(score) =>
            void runAction(
              { action: "arena_complete", score },
              `Arena finished · score ${score}%`,
            )
          }
        />
      </TabPanel>

      <TabPanel active={tab === "progress"}>
        <ProgressExtrasPanel
          milestones={data.milestones}
          weakness={data.weakness}
          drills={drills}
          gamification={data.gamification}
          onOpen={openItem}
          onReview={setReviewItem}
          onOpenRecords={() => router.push("/dashboard/records-certs")}
        />
      </TabPanel>

      <TabPanel active={tab === "sync"}>
        <RoadmapSyncPanel
          sync={data.sync}
          careerGoal={data.careerGoal}
          roadmapTopics={data.roadmapTopics}
          saving={syncSaving}
          onToggle={(v) => void toggleSync(v)}
          onOpenRoadmap={() => router.push(routes.app.roadmap)}
        />
      </TabPanel>

      <Card className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="type-small m-0 text-muted">
          Solved challenges sync editorials to Memory Lane. Shields protect a
          missed day.
        </p>
        <Button
          variant="secondary"
          onClick={() =>
            router.push(`${routes.app.memoryLane}?section=challenges`)
          }
        >
          View Memory Lane
        </Button>
      </Card>

      <AnimatePresence>
        {reviewItem && (
          <ChallengeReviewModal
            item={reviewItem}
            onClose={() => setReviewItem(null)}
            onRetry={() => {
              const item = reviewItem;
              setReviewItem(null);
              if (item) openItem(item);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
