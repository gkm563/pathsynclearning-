"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Shield, Sparkles } from "lucide-react";
import { apiGet, apiSend } from "@/lib/api";
import { hrefForNavId, routes } from "@/lib/routes";
import { SHIELD_COST, xpProgress } from "@/lib/challenges/progress";
import type {
  ChallengesApiResponse,
  ChallengeSummary,
} from "@/lib/challenges/types";
import ChallengeOfDayPanel from "@/components/challenges/ChallengeOfDayPanel";
import AllQuestionsPanel from "@/components/challenges/AllQuestionsPanel";
import RoadmapSyncPanel from "@/components/challenges/RoadmapSyncPanel";
import ArenaPanel from "@/components/challenges/ArenaPanel";
import ProgressExtrasPanel from "@/components/challenges/ProgressExtrasPanel";
import ChallengeCodingIde from "@/components/challenges/ChallengeCodingIde";
import ChallengeMcqIde from "@/components/challenges/ChallengeMcqIde";
import ChallengeProjectIde from "@/components/challenges/ChallengeProjectIde";
import ChallengeReviewModal from "@/components/challenges/ChallengeReviewModal";

type TabId = "cotd" | "all" | "arena" | "progress" | "sync";

export default function PlatformChallenges() {
  const router = useRouter();
  const [tab, setTab] = useState<TabId>("cotd");
  const [data, setData] = useState<ChallengesApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [syncSaving, setSyncSaving] = useState(false);
  const [hintBusy, setHintBusy] = useState(false);
  const [codingItem, setCodingItem] = useState<ChallengeSummary | null>(null);
  const [mcqItem, setMcqItem] = useState<ChallengeSummary | null>(null);
  const [projectItem, setProjectItem] = useState<ChallengeSummary | null>(null);
  const [reviewItem, setReviewItem] = useState<ChallengeSummary | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [arenaSessionSolved, setArenaSessionSolved] = useState<string[]>([]);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 3200);
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
    if (!data?.daily.dateKey) return;
    const t = window.setInterval(() => {
      setCountdown((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [data?.daily.dateKey]);

  const openItem = (item: ChallengeSummary) => {
    if (item.type === "mcq") {
      setMcqItem(item);
      return;
    }
    if (item.project || item.type === "project") {
      if (!item.project) {
        flash("This project is not fully configured yet");
        return;
      }
      setProjectItem(item);
      return;
    }
    if (item.coding || item.type === "coding") {
      setCodingItem(item);
      return;
    }
    flash("Open a coding, MCQ, or project challenge to earn XP");
  };

  const submitAttempt = async (
    item: ChallengeSummary,
    body: {
      answers?: Record<string, number>;
      code?: string;
      language?: string;
    },
  ) => {
    try {
      const res = await apiSend<
        ChallengesApiResponse & {
          ok: boolean;
          passed: boolean;
          score: number;
          awarded?: boolean;
          xpAwarded?: number;
          coinsAwarded?: number;
        }
      >("/api/me/challenges/attempt", "POST", {
        questionId: item.id,
        ...body,
      });
      setData(res);
      setCountdown(res.daily.refreshInSeconds);
      if (res.passed) {
        setArenaSessionSolved((ids) =>
          ids.includes(item.id) ? ids : [...ids, item.id],
        );
        if (res.awarded) {
          apiSend("/api/me/memory-lane", "POST", {
            payload: {
              id: `mem_${Date.now()}`,
              title: item.title,
              type: item.type,
              category: item.category,
              xpEarned: res.xpAwarded ?? item.xp,
              date: new Date().toLocaleDateString(),
              snippet:
                item.solution?.editorial?.slice(0, 160) ||
                item.description.slice(0, 120),
              complexity: item.solution?.complexity,
            },
          }).catch(() => {});
        }
      }
    } catch (e) {
      flash(e instanceof Error ? e.message : "Could not save attempt");
    }
  };

  const onMcqFinished = (payload: {
    score: number;
    passed: boolean;
    answers: Record<string, number>;
  }) => {
    if (!mcqItem) return;
    void submitAttempt(mcqItem, { answers: payload.answers });
  };

  const onCodingFinished = (payload: {
    score: number;
    passed: boolean;
    code: string;
    language: string;
  }) => {
    if (!codingItem) return;
    void submitAttempt(codingItem, {
      code: payload.code,
      language: payload.language,
    });
  };

  const onProjectFinished = (payload: {
    score: number;
    passed: boolean;
    challengesPayload?: unknown;
  }) => {
    if (!projectItem) return;
    const res = payload.challengesPayload as ChallengesApiResponse | undefined;
    if (res && "questions" in res) {
      setData(res);
      setCountdown(res.daily.refreshInSeconds);
    } else {
      void load();
    }
    if (payload.passed) {
      setArenaSessionSolved((ids) =>
        ids.includes(projectItem.id) ? ids : [...ids, projectItem.id],
      );
      if (projectItem.status !== "solved") {
        apiSend("/api/me/memory-lane", "POST", {
          payload: {
            id: `mem_${Date.now()}`,
            title: projectItem.title,
            type: "project",
            category: projectItem.category,
            xpEarned: projectItem.xp,
            date: new Date().toLocaleDateString(),
            snippet: projectItem.description.slice(0, 120),
          },
        }).catch(() => {});
      }
    }
  };

  const toggleSync = async (enabled: boolean) => {
    setSyncSaving(true);
    try {
      const res = await apiSend<ChallengesApiResponse>(
        "/api/me/challenges/sync",
        "PUT",
        { enabled },
      );
      setData(res);
      flash(enabled ? "Roadmap sync enabled" : "Roadmap sync disabled");
    } catch (e) {
      flash(e instanceof Error ? e.message : "Sync update failed");
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
      flash(okMsg);
    } catch (e) {
      flash(e instanceof Error ? e.message : "Action failed");
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
  const solved = data?.questions.filter((q) => q.status === "solved").length || 0;

  const tabs: { id: TabId; label: string }[] = [
    { id: "cotd", label: "Challenge of the Day" },
    { id: "all", label: "All Questions" },
    { id: "arena", label: "Timed Arena" },
    { id: "progress", label: "Milestones" },
    { id: "sync", label: "Roadmap Sync" },
  ];

  if (loading) {
    return (
      <div style={{ padding: 40, fontFamily: "Outfit", color: "var(--text-muted)" }}>
        Loading challenges…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: 40, fontFamily: "Outfit" }}>
        <p style={{ color: "#ef4444" }}>{error || "Unavailable"}</p>
        <button type="button" onClick={() => void load()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 22, paddingBottom: 60 }}>
        <div
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "22px 24px",
            borderRadius: 22,
            background:
              "linear-gradient(135deg, rgba(108,99,255,0.14), rgba(0,201,167,0.1))",
            border: "1.5px solid rgba(108,99,255,0.22)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 90% 10%, rgba(0,201,167,0.18), transparent 40%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <h1
                style={{
                  fontFamily: "Outfit",
                  fontSize: 28,
                  fontWeight: 900,
                  margin: "0 0 4px",
                  color: "var(--text-main)",
                }}
              >
                Challenges
              </h1>
              <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", fontFamily: "Outfit" }}>
                Goal:{" "}
                <b style={{ color: "#6c63ff" }}>{data.careerGoal || "Not set"}</b>
                {" · "}
                Solved {solved}/{data.catalogMeta.total}
                {data.sync.enabled ? " · Roadmap synced" : ""}
                {data.daily.cleared ? " · CotD cleared" : ""}
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ minWidth: 180 }}>
                <div
                  style={{
                    ...statPill,
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    alignItems: "stretch",
                    padding: "8px 12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <span>Lv {levelBar.level}</span>
                    <span style={{ color: "var(--text-muted)", fontWeight: 700 }}>
                      {levelBar.xp}/{levelBar.next} XP
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      borderRadius: 999,
                      background: "rgba(108,99,255,0.15)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${levelBar.pct}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #6c63ff, #00c9a7)",
                      }}
                    />
                  </div>
                </div>
              </div>
              <span style={{ ...statPill, background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
                {g?.coins ?? 0} coins
              </span>
              <span style={{ ...statPill, background: "rgba(236,72,153,0.12)", color: "#ec4899" }}>
                {g?.streak ?? 0} day streak
              </span>
              <span
                style={{
                  ...statPill,
                  background: "rgba(108,99,255,0.12)",
                  color: "#6c63ff",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Shield size={12} /> {g?.streakShields ?? 0} shields
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {tabs.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 14,
                  border: active ? "none" : "1.5px solid var(--border-light)",
                  background: active
                    ? "linear-gradient(135deg, #6c63ff, #00c9a7)"
                    : "var(--bg-card)",
                  color: active ? "#fff" : "var(--text-main)",
                  fontFamily: "Outfit",
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === "cotd" && (
          <ChallengeOfDayPanel
            featured={data.daily.featured}
            side={data.daily.side}
            weekly={data.weekly}
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
              flash("Duel code copied");
            }}
            onBuyShield={() =>
              void runAction(
                { action: "buy_shield" },
                `Streak shield purchased (−${SHIELD_COST} coins)`,
              )
            }
            hintBusy={hintBusy}
          />
        )}

        {tab === "all" && (
          <AllQuestionsPanel
            questions={data.questions}
            careerGoal={data.careerGoal}
            companies={data.companies}
            roadmapOnlyDefault={data.sync.enabled}
            onOpen={openItem}
            onReview={setReviewItem}
            onUnlockHint={(item) => void unlockHint(item)}
            hintBusy={hintBusy}
          />
        )}

        {tab === "arena" && (
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
        )}

        {tab === "progress" && (
          <ProgressExtrasPanel
            milestones={data.milestones}
            weakness={data.weakness}
            drills={drills}
            gamification={data.gamification}
            onOpen={openItem}
            onReview={setReviewItem}
            onOpenRecords={() => router.push("/dashboard/records-certs")}
          />
        )}

        {tab === "sync" && (
          <RoadmapSyncPanel
            sync={data.sync}
            careerGoal={data.careerGoal}
            roadmapTopics={data.roadmapTopics}
            saving={syncSaving}
            onToggle={(v) => void toggleSync(v)}
            onOpenRoadmap={() => router.push(routes.app.roadmap)}
          />
        )}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 22px",
            borderRadius: 18,
            background: "var(--bg-card)",
            border: "1.5px solid var(--border-light)",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontFamily: "Outfit", fontSize: 14, color: "var(--text-muted)" }}>
            Solved challenges sync editorials to Memory Lane. Shields protect a missed day.
          </div>
          <button
            type="button"
            onClick={() => router.push(hrefForNavId("memory-lane"))}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: "1.5px solid #6c63ff",
              background: "rgba(108,99,255,0.1)",
              color: "#6c63ff",
              fontFamily: "Outfit",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            View Memory Lane
          </button>
        </div>
      </div>

      <AnimatePresence>
        {reviewItem && (
          <ChallengeReviewModal
            item={reviewItem}
            onClose={() => setReviewItem(null)}
            onRetry={() => {
              const item = reviewItem;
              setReviewItem(null);
              openItem(item);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {codingItem && (
          <ChallengeCodingIde
            item={codingItem}
            onClose={() => setCodingItem(null)}
            onFinished={onCodingFinished}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {mcqItem && (
          <ChallengeMcqIde
            item={mcqItem}
            onClose={() => setMcqItem(null)}
            onFinished={onMcqFinished}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {projectItem && (
          <ChallengeProjectIde
            item={projectItem}
            onClose={() => {
              setProjectItem(null);
              void load();
            }}
            onFinished={onProjectFinished}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            style={{
              position: "fixed",
              bottom: 24,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 990,
              padding: "12px 22px",
              borderRadius: 16,
              background: "linear-gradient(135deg, #00c9a7, #6c63ff)",
              color: "#fff",
              fontFamily: "Outfit",
              fontWeight: 800,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: "0 10px 30px rgba(0,201,167,0.35)",
            }}
          >
            <Sparkles size={16} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const statPill: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 14,
  background: "var(--bg-card)",
  fontFamily: "Fira Code",
  fontSize: 12,
  fontWeight: 800,
  color: "var(--text-main)",
};
