"use client";

import { useCallback, useEffect, useState } from "react";
import { statusLabel } from "@/lib/progress/calculate";
import type {
  ConsistencyHeatmap,
  ProgressNextAction,
  ProgressPayload,
  ProgressSummary,
} from "@/lib/progress/types";
import type { NewsArticleDto, NewsListResponse } from "@/lib/news/types";
import { apiGet } from "@/lib/api";
import { useStudent } from "@/components/dashboard/StudentContext";
import {
  ActivityHeatmap,
  ChallengeQueue,
  CriGauge,
  HomeSection,
  HomeSkeleton,
  InsightPanel,
  SkillJourney,
} from "@/components/dashboard/home";
import { HeadlineStats } from "@/components/dashboard/home/HeadlineStats";
import { NextMoveCard } from "@/components/dashboard/home/NextMoveCard";
import { NewsTeaser } from "@/components/dashboard/home/NewsTeaser";
import { PageHeader } from "@/components/ui";
import { StudentRegistrationIdDisplay } from "@/components/profile/StudentRegistrationIdDisplay";
import { OnboardingNudge } from "./OnboardingNudge";

type Insight = {
  icon: "target" | "zap" | "rocket" | "book" | "code" | "shield";
  text: string;
};

const DEFAULT_INSIGHTS: Insight[] = [
  {
    icon: "target",
    text: "Solve two focused problems today to keep your streak alive.",
  },
  {
    icon: "book",
    text: "Review one weak topic from your last assessment before moving on.",
  },
  {
    icon: "code",
    text: "Ship a small piece of work and log it toward your CRI.",
  },
];

function greetingName(raw: string) {
  const name = raw.trim();
  if (!name) return "there";
  if (name.includes("@")) {
    const local = name.split("@")[0]?.split(/[._-]/)[0] || "there";
    return local.charAt(0).toUpperCase() + local.slice(1);
  }
  return name.split(/\s+/)[0] || "there";
}

/** Student home — `/dashboard` */
export default function StudentHome() {
  const student = useStudent();
  const [heatYear, setHeatYear] = useState(() => new Date().getUTCFullYear());
  const [progress, setProgress] = useState<ProgressPayload | null>(null);
  const [news, setNews] = useState<NewsArticleDto[]>([]);
  const [insights, setInsights] = useState<Insight[]>(DEFAULT_INSIGHTS);
  const [newsLoading, setNewsLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [heatLoading, setHeatLoading] = useState(false);
  const [bootLoading, setBootLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [progressError, setProgressError] = useState<string | null>(null);

  const loadProgress = useCallback(async (year: number, soft = false) => {
    if (soft) setHeatLoading(true);
    try {
      const payload = await apiGet<ProgressPayload>(
        `/api/me/progress?range=month&year=${year}`,
      );
      setProgress(payload);
      setProgressError(null);
      if (payload.heatmap?.year) setHeatYear(payload.heatmap.year);
    } catch (e) {
      if (!soft) setProgress(null);
      setProgressError(
        e instanceof Error ? e.message : "Unable to load progress.",
      );
    } finally {
      setHeatLoading(false);
    }
  }, []);

  const loadNews = useCallback(async () => {
    setNewsLoading(true);
    setNewsError(null);
    try {
      const data = await apiGet<NewsListResponse>(
        "/api/me/tech-news?limit=3&sort=latest",
      );
      setNews((data.items || []).slice(0, 3));
    } catch (e) {
      setNews([]);
      setNewsError(e instanceof Error ? e.message : "Unable to load news.");
    } finally {
      setNewsLoading(false);
    }
  }, []);

  const loadInsights = useCallback(async () => {
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const res = await fetch("/api/ai/insights", { method: "POST" });
      const data = (await res.json()) as { insights?: Insight[] };
      if (Array.isArray(data.insights) && data.insights.length >= 3) {
        setInsights(data.insights.slice(0, 3));
      }
    } catch (e) {
      setInsightsError(
        e instanceof Error ? e.message : "Unable to refresh insights.",
      );
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Insights can wait on an LLM — never block the home canvas on them.
      void loadInsights();
      await Promise.all([loadProgress(heatYear), loadNews()]);
      if (!cancelled) setBootLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onYearChange = (year: number) => {
    setHeatYear(year);
    void loadProgress(year, true);
  };

  if ((student.loading || bootLoading) && !progress) {
    return <HomeSkeleton />;
  }

  const summary: ProgressSummary | null = progress?.summary ?? null;
  const heatmap: ConsistencyHeatmap | null = progress?.heatmap ?? null;
  const nextAction: ProgressNextAction | null = progress?.nextAction ?? null;
  const first = greetingName(student.name);

  const skills = (student.skillsProgress || []).map((s) => ({
    label: s.label,
    pct: s.pct,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Home"
        title={`Welcome back, ${first}`}
        description={
          student.goal.role
            ? `Working toward ${student.goal.role}${student.institute ? ` · ${student.institute}` : ""}.`
            : "Your readiness, next move, and today's work — in one place."
        }
        actions={
          student.studentRegistrationId ? (
            <StudentRegistrationIdDisplay
              value={student.studentRegistrationId}
              compact
            />
          ) : null
        }
      />

      <OnboardingNudge />

      <HomeSection title="Where you stand" delay={0}>
        <HeadlineStats
          cri={student.cri}
          level={student.level}
          xp={student.xp}
          coins={student.coins}
          streak={student.streak}
          status={summary ? statusLabel(summary.status) : null}
        />
      </HomeSection>

      <HomeSection
        title="Next move"
        description="The single most useful thing to do next."
        delay={1}
      >
        <NextMoveCard
          action={nextAction}
          loading={bootLoading}
          error={progressError}
          onRetry={() => void loadProgress(heatYear)}
        />
      </HomeSection>

      <HomeSection title="Readiness and coaching" delay={2}>
        <div className="grid gap-4 lg:grid-cols-2">
          <CriGauge
            cri={student.cri}
            status={summary ? statusLabel(summary.status) : null}
            focus={summary?.currentFocus}
          />
          <InsightPanel
            insights={insights}
            loading={insightsLoading}
            error={insightsError}
            onRefresh={() => void loadInsights()}
            goalRole={student.goal.role}
          />
        </div>
      </HomeSection>

      <HomeSection
        title="Skill journey"
        description="How each focus area is tracking."
        delay={3}
      >
        <SkillJourney skills={skills} summary={summary} />
      </HomeSection>

      <HomeSection title="Consistency" delay={4}>
        <ActivityHeatmap
          heatmap={heatmap}
          year={heatYear}
          onYearChange={onYearChange}
          loading={heatLoading}
        />
      </HomeSection>

      <HomeSection title="Today's queue" delay={5}>
        <ChallengeQueue
          challenges={student.dailyChallenges || []}
          streak={student.streak}
        />
      </HomeSection>

      <HomeSection title="Briefing" delay={6}>
        <NewsTeaser
          news={news}
          loading={newsLoading}
          error={newsError}
          onRetry={() => void loadNews()}
        />
      </HomeSection>
    </>
  );
}
