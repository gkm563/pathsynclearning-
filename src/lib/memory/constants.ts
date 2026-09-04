import type { MemoryFilter, MemoryType } from "@/lib/memory/types";

export const FILTER_TO_TYPES: Record<Exclude<MemoryFilter, "all" | "notes">, MemoryType[]> = {
  learning: ["LEARNING_COMPLETED", "ROADMAP_NODE_COMPLETED"],
  skills: ["SKILL_UNLOCKED"],
  projects: ["PROJECT_COMPLETED"],
  challenges: ["CHALLENGE_COMPLETED", "CHALLENGE_PERSONAL_BEST"],
  mentorship: ["MENTORSHIP_SESSION"],
  collaboration: ["COLLABORATION"],
  achievements: ["ACHIEVEMENT"],
  events: ["EVENT_ATTENDED", "HACKATHON"],
  career: ["CAREER_EVENT"],
  certifications: ["CERTIFICATION"],
  milestones: ["MILESTONE"],
};

export const MEMORY_TYPE_META: Record<
  string,
  { label: string; emoji: string; color: string; filter: MemoryFilter }
> = {
  LEARNING_COMPLETED: {
    label: "Learning Completed",
    emoji: "📚",
    color: "#6c63ff",
    filter: "learning",
  },
  ROADMAP_NODE_COMPLETED: {
    label: "Roadmap Node Completed",
    emoji: "🟢",
    color: "#00c9a7",
    filter: "learning",
  },
  SKILL_UNLOCKED: {
    label: "Skill Unlocked",
    emoji: "💻",
    color: "#38bdf8",
    filter: "skills",
  },
  PROJECT_COMPLETED: {
    label: "Project Completed",
    emoji: "🚀",
    color: "#f59e0b",
    filter: "projects",
  },
  CHALLENGE_COMPLETED: {
    label: "Challenge Completed",
    emoji: "🏆",
    color: "#8b5cf6",
    filter: "challenges",
  },
  CHALLENGE_PERSONAL_BEST: {
    label: "Personal Best",
    emoji: "🔥",
    color: "#ec4899",
    filter: "challenges",
  },
  MENTORSHIP_SESSION: {
    label: "Mentorship Session",
    emoji: "👨‍🏫",
    color: "#10b981",
    filter: "mentorship",
  },
  COLLABORATION: {
    label: "Collaboration",
    emoji: "🤝",
    color: "#06b6d4",
    filter: "collaboration",
  },
  HACKATHON: {
    label: "Hackathon",
    emoji: "🏆",
    color: "#f59e0b",
    filter: "events",
  },
  EVENT_ATTENDED: {
    label: "Event Attended",
    emoji: "🎤",
    color: "#6366f1",
    filter: "events",
  },
  ACHIEVEMENT: {
    label: "Achievement",
    emoji: "⭐",
    color: "#eab308",
    filter: "achievements",
  },
  CAREER_EVENT: {
    label: "Career Event",
    emoji: "🎯",
    color: "#f97316",
    filter: "career",
  },
  CERTIFICATION: {
    label: "Certification",
    emoji: "🎓",
    color: "#0ea5e9",
    filter: "certifications",
  },
  PERSONAL_NOTE: {
    label: "Personal Note",
    emoji: "📝",
    color: "#64748b",
    filter: "notes",
  },
  MILESTONE: {
    label: "Milestone",
    emoji: "🌱",
    color: "#22c55e",
    filter: "milestones",
  },
};

export const MILESTONE_DEFS: Record<
  string,
  { title: string; description: string; emoji: string }
> = {
  STARTED_JOURNEY: {
    title: "Started Journey",
    description: "Began your PathEd learning journey.",
    emoji: "🌱",
  },
  FIRST_SKILL: {
    title: "First Skill Completed",
    description: "Completed your first skill or learning node.",
    emoji: "📚",
  },
  FIRST_PROJECT: {
    title: "First Project",
    description: "Shipped your first project.",
    emoji: "💻",
  },
  FIRST_CHALLENGE: {
    title: "First Challenge Win",
    description: "Solved your first challenge.",
    emoji: "🏆",
  },
  FIRST_MENTOR_SESSION: {
    title: "First Mentor Session",
    description: "Completed your first mentorship session.",
    emoji: "👨‍🏫",
  },
  FIRST_TEAM_PROJECT: {
    title: "First Team Project",
    description: "Joined your first collaborative project.",
    emoji: "🤝",
  },
  FIRST_HACKATHON: {
    title: "First Hackathon",
    description: "Participated in your first hackathon.",
    emoji: "🚀",
  },
  FIRST_RESUME: {
    title: "First Resume",
    description: "Created your first resume milestone.",
    emoji: "📄",
  },
  CAREER_READY: {
    title: "Career Ready",
    description: "Reached a career-ready milestone.",
    emoji: "🎯",
  },
};
