import { and, eq, inArray, not, or, sql } from "drizzle-orm";
import { memories } from "@/lib/db/schema";
import type { MemoryFilter, MemorySection } from "@/lib/memory/types";

export const ROADMAP_MEMORY_TYPES = [
  "LEARNING_COMPLETED",
  "SKILL_UNLOCKED",
  "ROADMAP_NODE_COMPLETED",
] as const;

export const CHALLENGE_MEMORY_TYPES = [
  "CHALLENGE_COMPLETED",
  "CHALLENGE_PERSONAL_BEST",
  "PROJECT_COMPLETED",
] as const;

export const ROADMAP_SOURCE_TYPES = [
  "roadmap",
  "roadmap_node",
  "lesson",
  "course",
] as const;

export const CHALLENGE_SOURCE_TYPES = [
  "challenge",
  "coding_session",
  "project",
  "project_run",
] as const;

export const ROADMAP_MILESTONE_TYPES = ["FIRST_SKILL"] as const;
export const CHALLENGE_MILESTONE_TYPES = [
  "FIRST_CHALLENGE",
  "FIRST_PROJECT",
] as const;

export const SECTION_FILTERS: Record<MemorySection, MemoryFilter[]> = {
  roadmap: ["all", "learning", "skills"],
  challenges: ["all", "challenges", "projects"],
  general: [
    "all",
    "mentorship",
    "collaboration",
    "achievements",
    "events",
    "career",
    "certifications",
    "notes",
    "milestones",
  ],
};

export const MEMORY_SECTION_META: Record<
  MemorySection,
  { label: string; description: string; emptyTitle: string; emptyDescription: string }
> = {
  roadmap: {
    label: "Roadmap",
    description: "Skills, nodes, and lessons from your learning path.",
    emptyTitle: "No roadmap memories yet.",
    emptyDescription:
      "Complete a roadmap node or skill and it will show up here. You can also add a note on a node.",
  },
  challenges: {
    label: "Challenges",
    description: "Solves, personal bests, and project challenges you have shipped.",
    emptyTitle: "No challenge memories yet.",
    emptyDescription:
      "Pass a coding, MCQ, or project challenge and it will be saved here.",
  },
  general: {
    label: "General Memory Lane",
    description: "Notes, milestones, mentorship, career, and everything else.",
    emptyTitle: "Your Memory Lane is waiting.",
    emptyDescription:
      "Add a personal note, earn a milestone, or log mentorship, events, and career moments.",
  },
};

function sourceMatches(values: readonly string[]) {
  const list = sql.join(
    values.map((v) => sql`${v}`),
    sql`, `,
  );
  return sql`coalesce(${memories.metadata}->>'sourceType', ${memories.sourceType}) in (${list})`;
}

function milestoneMatches(values: readonly string[]) {
  const list = sql.join(
    values.map((v) => sql`${v}`),
    sql`, `,
  );
  return and(
    eq(memories.type, "MILESTONE"),
    sql`${memories.metadata}->>'milestoneType' in (${list})`,
  );
}

export function roadmapSectionCondition() {
  return or(
    inArray(memories.type, [...ROADMAP_MEMORY_TYPES]),
    and(eq(memories.type, "PERSONAL_NOTE"), sourceMatches(ROADMAP_SOURCE_TYPES)),
    milestoneMatches(ROADMAP_MILESTONE_TYPES),
  )!;
}

export function challengesSectionCondition() {
  return or(
    inArray(memories.type, [...CHALLENGE_MEMORY_TYPES]),
    and(eq(memories.type, "PERSONAL_NOTE"), sourceMatches(CHALLENGE_SOURCE_TYPES)),
    milestoneMatches(CHALLENGE_MILESTONE_TYPES),
  )!;
}

export function sectionSqlCondition(section: MemorySection | "all" | string | undefined) {
  if (!section || section === "all") return undefined;
  if (section === "roadmap") return roadmapSectionCondition();
  if (section === "challenges") return challengesSectionCondition();
  if (section === "general") {
    return not(or(roadmapSectionCondition(), challengesSectionCondition())!);
  }
  return undefined;
}
