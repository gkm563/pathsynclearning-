"use client";

import { PageHeader } from "@/components/ui";

type Props = {
  name: string;
  degree: string;
  institute: string;
  level?: number;
  xp?: number;
  coins?: number;
  streak?: number;
  goalRole: string;
  goalWhy?: string;
  skills?: string[];
};

/** Identity strip for the student home. Stats live in HeadlineStats. */
export function HomeHero({ name, degree, institute, goalRole }: Props) {
  const first = name.trim().split(/\s+/)[0] || "there";
  const context = [degree, institute].filter(Boolean).join(" · ");

  return (
    <PageHeader
      eyebrow="Home"
      title={`Welcome back, ${first}`}
      description={
        goalRole
          ? `Working toward ${goalRole}${context ? ` · ${context}` : ""}.`
          : context || "Your readiness, next move, and today's work."
      }
    />
  );
}
