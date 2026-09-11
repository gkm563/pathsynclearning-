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
import type {
  AttemptStatus,
  ChallengesApiResponse,
} from "@/lib/challenges/types";
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
  id?: string;
  icon: string;
  title: string;
  category: string;
  time: string;
  diff: string;
  xp: number;
  pct: number;
  isStarted: boolean;
  status: AttemptStatus;
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
  studentRegistrationId: string;
  preferences: PreferencesFormState;
  refresh: () => Promise<void>;
};

const SKILL_COLORS = ["#0f766e", "#0369a1", "#d97706", "#0ea5e9"];

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
    status: "attempted",
    col: "#1b4540",
    bg: "rgba(27,69,64,0.08)",
    border: "#1b454040",
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
    status: "todo",
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
    status: "todo",
    col: "#1f6b48",
    bg: "rgba(31,107,72,0.08)",
    border: "#1f6b4840",
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
    status: "todo",
    col: "#c45c26",
    bg: "rgba(196,92,38,0.08)",
    border: "#c45c2640",
  },
];

function publicDisplayName(full: string) {
  const name = full.trim();
  if (!name) return "Student";
  if (name.includes("@")) {
    const local = name.split("@")[0]?.split(/[._-]/)[0] || "Student";
    return local.charAt(0).toUpperCase() + local.slice(1);
  }
  return name;
}

function shortNameFrom(full: string) {
  const parts = publicDisplayName(full).split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Student";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function mapDailyFromApi(
  res: ChallengesApiResponse | null,
): DailyChallengeCard[] {
  if (!res?.daily) return FALLBACK_CHALLENGES;
  const seen = new Set<string>();
  const pack = [
    res.daily.featured,
    ...(res.daily.side || []),
  ].filter((c): c is NonNullable<typeof res.daily.featured> => {
    if (!c) return false;
    const key = c.slug || c.id;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  if (!pack.length) return FALLBACK_CHALLENGES;

  const palette = [
    { col: "#0f766e", bg: "rgba(15,118,110,0.08)", border: "#0f766e40" },
    { col: "#d97706", bg: "rgba(217,119,6,0.08)", border: "#d9770640" },
    { col: "#0369a1", bg: "rgba(3,105,161,0.08)", border: "#0369a140" },
    { col: "#0ea5e9", bg: "rgba(14,165,233,0.08)", border: "#0ea5e940" },
  ];
  const diffLabel = { easy: "Easy", medium: "Medium", hard: "Hard" } as const;

  return pack.slice(0, 4).map((c, idx) => {
    const colors = palette[idx % palette.length];
    const pct = c.status === "solved" ? 100 : c.status === "attempted" ? 40 : 0;
    return {
      id: c.slug || c.id,
      icon: String(c.icon || c.category || "CH").slice(0, 4).toUpperCase(),
      title: c.title || "Challenge",
      category: c.category || "DSA",
      time: `${c.estMinutes || 30} min`,
      diff: diffLabel[c.difficulty] || "Medium",
      xp: Number(c.xp) || 100,
      pct,
      isStarted: pct > 0,
      status: c.status,
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
    { label: "DSA", pct: 20, col: "#1b4540" },
    { label: "System Design", pct: 10, col: "#1f6b48" },
    { label: "Web Dev", pct: 25, col: "#f7971e" },
    { label: "Algorithms", pct: 15, col: "#c45c26" },
  ],
  dailyChallenges: FALLBACK_CHALLENGES,
  plan: "free",
  studentRegistrationId: "",
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
      const [, profileRes, settingsRes, challengesRes] = await Promise.all([
        fetch("/api/me", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }).catch(() => null),
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
      const name = publicDisplayName(
        (p?.full_name as string) || clerkName || "Student",
      );

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
        studentRegistrationId: String(p?.student_registration_id ?? ""),
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
