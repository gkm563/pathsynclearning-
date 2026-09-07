/**
 * Placement insights mock dataset.
 *
 * `kind` drives the icon and badge tone in the UI, so the copy never has to
 * carry an emoji and every card stays inside the token palette.
 */

import { routes } from "@/lib/routes";

export type InsightKind = "immediate" | "project" | "decay" | "trend";

export type AiInsight = {
  id: string;
  title: string;
  category: string;
  /** Short outcome promise, e.g. "+8% CRI". */
  impact: string;
  kind: InsightKind;
  description: string;
  actionLabel: string;
  href: string;
};

export type MentorReview = {
  id: string;
  mentorName: string;
  mentorTitle: string;
  avatarUrl: string;
  reviewedOn: string;
  projectName: string;
  comment: string;
  /** Out of 5. */
  score: number;
};

export type Competency = {
  label: string;
  pct: number;
};

export const AI_INSIGHTS: readonly AiInsight[] = [
  {
    id: "ai1",
    title: "Targeted DSA competency boost",
    category: "DSA · Graph & DP",
    impact: "+8% CRI",
    kind: "immediate",
    description:
      "Your Graph and Dynamic Programming node mastery stands at 62%. Taking it to 75% satisfies the recruitment thresholds at Stripe and Uber.",
    actionLabel: "Practice graph problems",
    href: routes.app.challenges,
  },
  {
    id: "ai2",
    title: "Backend portfolio packaging",
    category: "Architecture · Integration",
    impact: "+14% SDE fit",
    kind: "project",
    description:
      "Your portfolio has two projects. Adding a microservices build with Redis caching and Docker shows the industrial patterns recruiters screen for.",
    actionLabel: "Unlock project blueprint",
    href: routes.app.projectCollab,
  },
  {
    id: "ai3",
    title: "DBMS skill recency decay",
    category: "Data integrity · Indexing",
    impact: "Holds your CRI",
    kind: "decay",
    description:
      "Indexing and B-Trees are drifting. Twenty minutes refreshing transactions keeps you inside the top 12% national percentile.",
    actionLabel: "Take a 10m refresh quiz",
    href: routes.app.challenges,
  },
  {
    id: "ai4",
    title: "Market demand alignment",
    category: "Stack · Go & Rust concurrency",
    impact: "+18 leads",
    kind: "trend",
    description:
      "Recruiter requests for Go and Rust concurrency rose 35% this quarter. The Go channels node makes you eligible for 12 more automated recruiter views.",
    actionLabel: "Unlock Go roadmap",
    href: routes.app.roadmap,
  },
];

export const MENTOR_REVIEWS: readonly MentorReview[] = [
  {
    id: "me1",
    mentorName: "Aarav Mehta",
    mentorTitle: "SDE 2 @ Google",
    avatarUrl:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
    reviewedOn: "Reviewed July 21, 2026",
    projectName: "Distributed Chat Application",
    comment:
      "Code review on your chat repository shows solid object-oriented layout and clean separation of concerns. However, your WebSocket connection pooling is unthrottled, which could cause socket starvation under heavy load. I've left detailed notes on refactoring your Redis Pub/Sub client connection builder to prevent memory leaks.",
    score: 4.8,
  },
  {
    id: "me2",
    mentorName: "Sophia Vance",
    mentorTitle: "Engineering Lead @ Stripe",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    reviewedOn: "Reviewed July 17, 2026",
    projectName: "Mock whiteboard round — array mapping",
    comment:
      "During our mock whiteboard session your communication was structured and logical, and you correctly identified the brute-force complexity as O(N²). To stand out, highlight the space-time trade-off using hash maps to reach linear time before being prompted. Excellent confidence overall.",
    score: 4.5,
  },
  {
    id: "me3",
    mentorName: "Rahul Sen",
    mentorTitle: "Senior Architect @ Adobe",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    reviewedOn: "Reviewed July 12, 2026",
    projectName: "E-commerce system design mock",
    comment:
      "Your high-level diagram has a robust database partition structure. When designing microservices, pay closer attention to distributed transaction limits — backend interviewers want to hear about the Saga pattern or two-phase commit. Work on explaining data consistency next.",
    score: 4.6,
  },
];

export const COMPETENCIES: readonly Competency[] = [
  { label: "DSA & problem solving", pct: 72 },
  { label: "Coding speed & quality", pct: 88 },
  { label: "System architecture", pct: 45 },
  { label: "Data management & SQL", pct: 60 },
  { label: "Technical communication", pct: 75 },
];

/** Progress-bar tone banding, so a weak area never reads as "on track". */
export function competencyTone(
  pct: number,
): "success" | "primary" | "warning" {
  if (pct >= 80) return "success";
  if (pct >= 60) return "primary";
  return "warning";
}
