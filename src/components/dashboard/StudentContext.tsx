"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useUser } from "@clerk/nextjs";
import { apiGet } from "@/lib/api";

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
};

const SKILL_COLORS = ["#6c63ff", "#00c9a7", "#f7971e", "#e040fb"];

const FALLBACK_CHALLENGES: DailyChallengeCard[] = [
  {
    icon: "🌳",
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
    icon: "🔥",
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
    icon: "🧠",
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
    icon: "🎨",
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

function levelFromXp(xp: number) {
  if (xp >= 5000) return 5;
  if (xp >= 3000) return 4;
  if (xp >= 1500) return 3;
  if (xp >= 800) return 2;
  return 1;
}

function shortNameFrom(full: string) {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Student";
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function mapChallenges(state: unknown): DailyChallengeCard[] {
  if (!Array.isArray(state) || state.length === 0) return FALLBACK_CHALLENGES;
  const palette = [
    { col: "#6c63ff", bg: "rgba(108,99,255,0.08)", border: "#6c63ff40" },
    { col: "#f7971e", bg: "rgba(247,151,30,0.08)", border: "#f7971e40" },
    { col: "#00c9a7", bg: "rgba(0,201,167,0.08)", border: "#00c9a740" },
    { col: "#e040fb", bg: "rgba(224,64,251,0.08)", border: "#e040fb40" },
  ];
  return state.slice(0, 4).map((c: any, idx: number) => {
    const colors = palette[idx % palette.length];
    const pct = Number(c.pct) || (c.done ? 100 : 0);
    return {
      icon: c.icon || "⚡",
      title: c.label || c.title || "Challenge",
      category: c.cat || c.category || "DSA",
      time: c.time || "30 min",
      diff: c.diff || "Medium",
      xp: Number(c.xp) || 100,
      pct,
      isStarted: pct > 0 || Boolean(c.done),
      ...colors,
    };
  });
}

const StudentContext = createContext<StudentSnapshot | null>(null);

export function StudentProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser();
  const [snapshot, setSnapshot] = useState<Omit<StudentSnapshot, "loading">>({
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
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isLoaded) return;
      try {
        // Ensure DB user row exists when signed in
        await fetch("/api/me", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }).catch(() => null);

        const [profileRes, onboardingRes, settingsRes, challengesRes] =
          await Promise.all([
            apiGet<{ profile: any }>("/api/me/profile").catch(() => null),
            apiGet<{ onboarding: any }>("/api/me/onboarding").catch(() => null),
            apiGet<{ settings: any }>("/api/me/settings").catch(() => null),
            apiGet<{ state: any }>("/api/me/challenges").catch(() => null),
          ]);

        if (cancelled) return;

        const p = profileRes?.profile;
        const o = onboardingRes?.onboarding;
        const clerkName =
          [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
          clerkUser?.fullName ||
          clerkUser?.username ||
          "";
        const name =
          (p?.full_name as string) ||
          clerkName ||
          (o?.stage1?.name as string) ||
          "Student";

        const career =
          (o?.selected_career as string) ||
          (o?.stage2?.chosenCareer as string) ||
          "Software Engineer";

        const skillsFromProfile = Array.isArray(p?.skills) ? p.skills : null;
        const skillsFromStage =
          Array.isArray(o?.stage2?.tags) && o.stage2.tags.length
            ? o.stage2.tags
            : null;
        const skills =
          skillsFromProfile ||
          skillsFromStage ||
          ["DSA", "Programming", "DBMS", "OS", "Web Development"];

        const xp = Number(p?.xp) || 0;
        const coins = Number(p?.coins) || 0;
        const streak = Number(p?.streak) || 0;
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
              (o?.stage2?.passion as string) ||
              "Interest in problem-solving, scalable systems & real-world impact",
            skills,
            timeline: "4 Years · Full UG",
            outcome:
              "Industry-ready with strong fundamentals and portfolio projects",
          },
          skillsProgress,
          dailyChallenges: mapChallenges(challengesRes?.state),
          plan: (settingsRes?.settings?.plan as string) || "free",
        });
      } catch {
        // keep defaults
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoaded, clerkUser]);

  const value = useMemo(
    () => ({ ...snapshot, loading }),
    [snapshot, loading],
  );

  return (
    <StudentContext.Provider value={value}>{children}</StudentContext.Provider>
  );
}

export function useStudent(): StudentSnapshot {
  const ctx = useContext(StudentContext);
  if (!ctx) {
    return {
      loading: false,
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
    };
  }
  return ctx;
}
