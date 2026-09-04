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
  FocusAndNews,
  HomeHero,
  HomeSection,
  HomeSkeleton,
  InsightPanel,
  SkillJourney,
} from "@/components/dashboard/home";
import { homeUi } from "@/components/dashboard/home/tokens";

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

  const loadProgress = useCallback(async (year: number, soft = false) => {
    if (soft) setHeatLoading(true);
    try {
      const payload = await apiGet<ProgressPayload>(
        `/api/me/progress?range=month&year=${year}`,
      );
      setProgress(payload);
      if (payload.heatmap?.year) setHeatYear(payload.heatmap.year);
    } catch {
      if (!soft) setProgress(null);
    } finally {
      setHeatLoading(false);
    }
  }, []);

  const loadNews = useCallback(async () => {
    setNewsLoading(true);
    try {
      const data = await apiGet<NewsListResponse>(
        "/api/me/tech-news?limit=3&sort=latest",
      );
      setNews((data.items || []).slice(0, 3));
    } catch {
      setNews([]);
    } finally {
      setNewsLoading(false);
    }
  }, []);

  const loadInsights = useCallback(async () => {
    setInsightsLoading(true);
    try {
      const res = await fetch("/api/ai/insights", { method: "POST" });
      const data = (await res.json()) as { insights?: Insight[] };
      if (Array.isArray(data.insights) && data.insights.length >= 3) {
        setInsights(data.insights.slice(0, 3));
      }
    } catch {
      // keep current
    } finally {
      setInsightsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await Promise.all([
        loadProgress(heatYear),
        loadNews(),
        loadInsights(),
      ]);
      if (!cancelled) setBootLoading(false);
    })();
    return () => {
      cancelled = true;
    };
    // initial boot only
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const skills = (student.skillsProgress || []).map((s) => ({
    label: s.label,
    pct: s.pct,
  }));

  return (
    <div className={homeUi.page}>
      <HomeSection delay={0}>
        <HomeHero
          name={student.name}
          degree={student.degree}
          institute={student.institute}
          level={student.level}
          xp={student.xp}
          coins={student.coins}
          streak={student.streak}
          goalRole={student.goal.role}
          goalWhy={student.goal.why}
          skills={student.goal.skills || []}
        />
      </HomeSection>

      <HomeSection delay={1}>
        <div className={homeUi.grid2}>
          <CriGauge
            cri={student.cri}
            status={summary ? statusLabel(summary.status) : null}
            focus={summary?.currentFocus}
          />
          <InsightPanel
            insights={insights}
            loading={insightsLoading}
            onRefresh={() => void loadInsights()}
            goalRole={student.goal.role}
          />
        </div>
      </HomeSection>

      <HomeSection delay={2}>
        <SkillJourney skills={skills} summary={summary} />
      </HomeSection>

      <HomeSection delay={3}>
          <ActivityHeatmap
            heatmap={heatmap}
            year={heatYear}
            onYearChange={onYearChange}
            loading={heatLoading}
          />
      </HomeSection>

      <HomeSection delay={4}>
        <ChallengeQueue
          challenges={student.dailyChallenges || []}
          streak={student.streak}
        />
      </HomeSection>

      <HomeSection delay={5}>
        <FocusAndNews
          nextAction={nextAction}
          news={news}
          newsLoading={newsLoading}
        />
      </HomeSection>
    </div>
  );
}
