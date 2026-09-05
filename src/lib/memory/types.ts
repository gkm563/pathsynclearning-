/** Memory Lane domain types — shared by server + client. */

export const MEMORY_TYPES = [
  "LEARNING_COMPLETED",
  "SKILL_UNLOCKED",
  "PROJECT_COMPLETED",
  "CHALLENGE_COMPLETED",
  "CHALLENGE_PERSONAL_BEST",
  "MENTORSHIP_SESSION",
  "COLLABORATION",
  "HACKATHON",
  "EVENT_ATTENDED",
  "ACHIEVEMENT",
  "CAREER_EVENT",
  "CERTIFICATION",
  "PERSONAL_NOTE",
  "MILESTONE",
  "ROADMAP_NODE_COMPLETED",
] as const;

export type MemoryType = (typeof MEMORY_TYPES)[number];

export const NOTE_VISIBILITY = ["private", "public"] as const;
export type NoteVisibility = (typeof NOTE_VISIBILITY)[number];

export const MEMORY_VISIBILITY = ["private", "public"] as const;
export type MemoryVisibility = (typeof MEMORY_VISIBILITY)[number];

export const SOURCE_TYPES = [
  "challenge",
  "project",
  "project_run",
  "roadmap",
  "roadmap_node",
  "lesson",
  "course",
  "coding_session",
  "mentorship",
  "event",
  "career",
  "certification",
  "achievement",
  "hackathon",
  "note",
  "collaboration",
] as const;

export type SourceType = (typeof SOURCE_TYPES)[number];

export const MILESTONE_TYPES = [
  "STARTED_JOURNEY",
  "FIRST_SKILL",
  "FIRST_PROJECT",
  "FIRST_CHALLENGE",
  "FIRST_MENTOR_SESSION",
  "FIRST_TEAM_PROJECT",
  "FIRST_HACKATHON",
  "FIRST_RESUME",
  "CAREER_READY",
] as const;

export type MilestoneType = (typeof MILESTONE_TYPES)[number];

export const DOMAIN_EVENT_TYPES = [
  "LEARNING_COMPLETED",
  "PROJECT_COMPLETED",
  "CHALLENGE_COMPLETED",
  "MENTORSHIP_COMPLETED",
  "HACKATHON_COMPLETED",
  "EVENT_ATTENDED",
  "CERTIFICATION_EARNED",
  "CAREER_GOAL_CHANGED",
  "ACHIEVEMENT_EARNED",
  "ROADMAP_NODE_COMPLETED",
  "SKILL_UNLOCKED",
  "COLLABORATION_JOINED",
] as const;

export type DomainEventType = (typeof DOMAIN_EVENT_TYPES)[number];

/** Top-level Memory Lane sections. */
export const MEMORY_SECTIONS = ["roadmap", "challenges", "general"] as const;
export type MemorySection = (typeof MEMORY_SECTIONS)[number];

/** Filter chips on Memory Lane (maps to memory types / notes). */
export const MEMORY_FILTERS = [
  "all",
  "learning",
  "skills",
  "projects",
  "challenges",
  "mentorship",
  "collaboration",
  "achievements",
  "events",
  "career",
  "certifications",
  "notes",
  "milestones",
] as const;

export type MemoryFilter = (typeof MEMORY_FILTERS)[number];

export type TimelineItemKind = "memory" | "note" | "milestone";

export type TimelineItem = {
  id: string;
  kind: TimelineItemKind;
  type: string;
  title: string;
  description: string | null;
  occurredAt: string;
  sourceType: string | null;
  sourceId: string | null;
  visibility: string;
  metadata: Record<string, unknown>;
  href: string | null;
  updatedAt?: string;
};

export type MemoryStats = {
  milestones: number;
  skills: number;
  projects: number;
  achievements: number;
  notes: number;
  total: number;
  sections: {
    roadmap: number;
    challenges: number;
    general: number;
  };
};

export type MemorySettingsDto = {
  includeLearning: boolean;
  includeProjects: boolean;
  includeAchievements: boolean;
  includeCertifications: boolean;
  includeMentorship: boolean;
  includeChallenges: boolean;
  includeEvents: boolean;
  includeCareer: boolean;
  includePrivateNotes: boolean;
  allowAiNotes: boolean;
};
