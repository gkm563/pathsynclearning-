"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useUser } from "@clerk/nextjs";
import { apiGet } from "@/lib/api";
import { levelFromXp } from "@/lib/challenges/progress";
import type { ChallengesApiResponse } from "@/lib/challenges/types";
import type { PreferencesFormState } from "@/lib/profile/types";
import {
  EMPTY_PREFERENCES,
  mapApiSettings,
} from "@/lib/profile/types";

export type StudentGoal = {
  role: string;
  tag: string;
  why: string;
  skills: string[];
  timeline: string;
  outcome: string;
};

export type SkillProgress = { label: string; pct: number; col: string };

export type DailyChallengeCard = {
  icon: string;
  title: string;
  category: string;
  time: string;
  diff: string;
  xp: number;
  pct: number;
  isStarted: boolean;
  col: string;
  bg: string;
  border: string;
};

export type StudentSnapshot = {
  loading: boolean;
  name: string;
  shortName: string;
  title: string;
  degree: string;
  institute: string;
  cri: number;
  xp: number;
  coins: number;
  streak: number;
  level: number;
  goal: StudentGoal;
  skillsProgress: SkillProgress[];
  dailyChallenges: DailyChallengeCard[];
  plan: string;
  preferences: PreferencesFormState;
  refresh: () => Promise<void>;
};

const SKILL_COLORS = ["#6c63ff", "#00c9a7", "#f7971e", "#e040fb"];

const FALLBACK_CHALLENGES: DailyChallengeCard[] = [
  {
    icon: "BST",
    title: "Implement Binary Search Tree",
    category: "DSA",
    time: "45 min",
    diff: "Medium",
    xp: 150,
    pct: 68,
    isStarted: true,
    col: "#6c63ff",
    bg: "rgba(108,99,255,0.08)",
    border: "#6c63ff40",
  },
  {
    icon: "LL",
    title: "Reverse a Linked List in-place",
    category: "DSA",
    time: "20 min",
    diff: "Easy",
    xp: 80,
    pct: 0,
    isStarted: false,
    col: "#f7971e",
    bg: "rgba(247,151,30,0.08)",
    border: "#f7971e40",
  },
  {
    icon: "SYS",
    title: "Design a Rate Limiter System",
    category: "System Design",
    time: "90 min",
    diff: "Hard",
    xp: 300,
    pct: 0,
    isStarted: false,
    col: "#00c9a7",
    bg: "rgba(0,201,167,0.08)",
    border: "#00c9a740",
  },
  {
    icon: "WEB",
    title: "Build a Responsive Card Component",
    category: "Web Dev",
    time: "15 min",
    diff: "Easy",
    xp: 60,
    pct: 0,
    isStarted: false,
    col: "#e040fb",
    bg: "rgba(224,64,251,0.08)",
    border: "#e040fb40",
  },
];

function shortNameFrom(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Student";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function mapDailyFromApi(
  res: ChallengesApiResponse | null,
): DailyChallengeCard[] {
  if (!res?.daily) return FALLBACK_CHALLENGES;
  const pack = [
    res.daily.featured,
    ...(res.daily.side || []),
  ].filter(Boolean) as NonNullable<typeof res.daily.featured>[];
  if (!pack.length) return FALLBACK_CHALLENGES;

  const palette = [
    { col: "#6c63ff", bg: "rgba(108,99,255,0.08)", border: "#6c63ff40" },
    { col: "#f7971e", bg: "rgba(247,151,30,0.08)", border: "#f7971e40" },
    { col: "#00c9a7", bg: "rgba(0,201,167,0.08)", border: "#00c9a740" },
    { col: "#e040fb", bg: "rgba(224,64,251,0.08)", border: "#e040fb40" },
  ];
  const diffLabel = { easy: "Easy", medium: "Medium", hard: "Hard" } as const;

  return pack.slice(0, 4).map((c, idx) => {
    const colors = palette[idx % palette.length];
    const pct = c.status === "solved" ? 100 : c.status === "attempted" ? 40 : 0;
    return {
      icon: String(c.icon || c.category || "CH").slice(0, 4).toUpperCase(),
      title: c.title || "Challenge",
      category: c.category || "DSA",
      time: `${c.estMinutes || 30} min`,
      diff: diffLabel[c.difficulty] || "Medium",
      xp: Number(c.xp) || 100,
      pct,
      isStarted: pct > 0,
      ...colors,
    };
  });
}

function applyAppearance(prefs: PreferencesFormState) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", prefs.theme);
  document.body.setAttribute("data-theme", prefs.theme);
}

const StudentContext = createContext<StudentSnapshot | null>(null);

const DEFAULT_SNAPSHOT: Omit<StudentSnapshot, "loading" | "refresh"> = {
  name: "Student",
  shortName: "Student",
  title: "SDE Trainee",
  degree: "B.Tech · Computer Science",
  institute: "Your Institute",
  cri: 0,
  xp: 0,
  coins: 0,
  streak: 0,
  level: 1,
  goal: {
    role: "Software Engineer",
    tag: "SDE · UG Journey",
    why: "Build strong fundamentals and ship real projects",
    skills: ["DSA", "Programming", "DBMS", "OS", "Web Development"],
    timeline: "4 Years · Full UG",
    outcome: "Industry-ready with strong fundamentals and portfolio projects",
  },
  skillsProgress: [
    { label: "DSA", pct: 20, col: "#6c63ff" },
    { label: "System Design", pct: 10, col: "#00c9a7" },
    { label: "Web Dev", pct: 25, col: "#f7971e" },
    { label: "Algorithms", pct: 15, col: "#e040fb" },
  ],
  dailyChallenges: FALLBACK_CHALLENGES,
  plan: "free",
  preferences: { ...EMPTY_PREFERENCES },
};

export function StudentProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser();
  const [snapshot, setSnapshot] =
    useState<Omit<StudentSnapshot, "loading" | "refresh">>(DEFAULT_SNAPSHOT);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (signal?: { cancelled: boolean }) => {
    if (!isLoaded) return;
    try {
      await fetch("/api/me", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }).catch(() => null);

      const [profileRes, settingsRes, challengesRes] = await Promise.all([
        apiGet<{ profile: any }>("/api/me/profile").catch(() => null),
        apiGet<{ settings: any }>("/api/me/settings").catch(() => null),
        apiGet<ChallengesApiResponse>("/api/me/challenges").catch(() => null),
      ]);

      if (signal?.cancelled) return;

      const p = profileRes?.profile;
      const prefs = mapApiSettings(settingsRes?.settings);
      applyAppearance(prefs);

      const clerkName =
        [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
        clerkUser?.fullName ||
        clerkUser?.username ||
        "";
      const name = (p?.full_name as string) || clerkName || "Student";

      const career =
        challengesRes?.careerGoal ||
        (p?.objective as string) ||
        (p?.passion as string) ||
        "Software Engineer";

      const skillsFromProfile = Array.isArray(p?.skills) ? p.skills : null;
      const skills =
        skillsFromProfile ||
        ["DSA", "Programming", "DBMS", "OS", "Web Development"];

      const g = challengesRes?.gamification;
      const xp = Math.max(Number(p?.xp) || 0, Number(g?.xp) || 0);
      const coins = Math.max(Number(p?.coins) || 0, Number(g?.coins) || 0);
      const streak = Math.max(Number(p?.streak) || 0, Number(g?.streak) || 0);
      const cri = Number(p?.cri) || 0;
      const degree =
        [p?.degree, p?.branch].filter(Boolean).join(" · ") ||
        "B.Tech · Computer Science";
      const institute = (p?.institute as string) || "Your Institute";

      const skillsProgress: SkillProgress[] = skills
        .slice(0, 4)
        .map((label: string, idx: number) => ({
          label,
          pct: Math.min(95, Math.max(12, cri + idx * 8 - 5)),
          col: SKILL_COLORS[idx % SKILL_COLORS.length],
        }));

      setSnapshot({
        name,
        shortName: shortNameFrom(name),
        title: career.includes("Engineer") ? "SDE Trainee" : "PathEd Student",
        degree,
        institute,
        cri,
        xp,
        coins,
        streak,
        level: levelFromXp(xp),
        goal: {
          role: career,
          tag: "Career Path · PathEd",
          why:
            (p?.bio as string) ||
            (p?.passion as string) ||
            "Interest in problem-solving, scalable systems & real-world impact",
          skills,
          timeline: "4 Years · Full UG",
          outcome:
            "Industry-ready with strong fundamentals and portfolio projects",
        },
        skillsProgress,
        dailyChallenges: mapDailyFromApi(challengesRes),
        plan: (settingsRes?.settings?.plan as string) || "free",
        preferences: prefs,
      });
    } catch {
      // keep defaults
    } finally {
      if (!signal?.cancelled) setLoading(false);
    }
  }, [isLoaded, clerkUser]);

  useEffect(() => {
    const signal = { cancelled: false };
    void load(signal);
    return () => {
      signal.cancelled = true;
    };
  }, [load]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  const value = useMemo(
    () => ({ ...snapshot, loading, refresh }),
    [snapshot, loading, refresh],
  );

  return (
    <StudentContext.Provider value={value}>{children}</StudentContext.Provider>
  );
}

export function useStudent(): StudentSnapshot {
  const ctx = useContext(StudentContext);
  if (!ctx) {
    return {
      ...DEFAULT_SNAPSHOT,
      loading: false,
      refresh: async () => undefined,
    };
  }
  return ctx;
}
