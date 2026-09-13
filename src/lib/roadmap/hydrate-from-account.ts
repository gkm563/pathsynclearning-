import { parseOnboardingMeta, type OnboardingMeta } from "@/lib/onboarding/types";
import { findRoleByName } from "@/lib/roadmap/hiring-catalog";
import type { ProjectEntry, SkillConfidence } from "@/types/roadmap";

const INTEREST_TO_SUBJECTS: Record<string, string[]> = {
  ui: ["Web Development"],
  apis: ["Databases", "Programming"],
  systems: ["Data Structures", "Programming"],
  ml: ["AI/ML", "Statistics"],
  data: ["Statistics", "Databases"],
  cloud: ["Operating Systems", "Networks"],
  security: ["Networks", "Operating Systems"],
  mobile: ["Programming", "Web Development"],
  product: ["Other"],
  quality: ["Programming"],
};

export type AccountForRoadmap = {
  institute?: string | null;
  degree?: string | null;
  branch?: string | null;
  gradYear?: string | null;
  location?: string | null;
  semester?: string | null;
  skills?: unknown;
  projects?: unknown;
  objective?: string | null;
  passion?: string | null;
  bio?: string | null;
  additionalData?: unknown;
};

export type DerivedRoadmapFields = {
  currentStudy: string | null;
  yearSemester: string | null;
  academicBackground: string | null;
  enjoyedSubjects: string[];
  careerGoal: string | null;
  targetRole: string | null;
  knownSkills: SkillConfidence[];
  hasProjects: boolean;
  projects: ProjectEntry[];
  experienceLevel: string | null;
  learningMotivation: string | null;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isBlank(value: unknown, key?: string): boolean {
  if (key === "hasProjects") return value !== true;
  if (value == null) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

export function composeCurrentStudy(
  degree?: string | null,
  branch?: string | null,
  institute?: string | null,
): string | null {
  const program = [text(degree), text(branch) ? `in ${text(branch)}` : ""]
    .filter(Boolean)
    .join(" ");
  const school = text(institute);
  if (program && school) return `${program} at ${school}`;
  return program || school || null;
}

export function inferYearSemester(
  gradYear?: string | null,
  degree?: string | null,
  semester?: string | null,
): string | null {
  const listed = text(semester);
  if (
    [
      "1st Year",
      "2nd Year",
      "3rd Year",
      "4th Year",
      "MSc",
      "PhD",
      "Other",
    ].includes(listed)
  ) {
    return listed;
  }

  const deg = text(degree).toLowerCase();
  if (/\bphd\b/.test(deg)) return "PhD";
  if (/\bm\.?\s*tech\b|\bmca\b|\bmba\b|\bm\.?\s*sc\b|\bmsc\b/.test(deg)) {
    return "MSc";
  }

  const year = Number(text(gradYear));
  if (!Number.isFinite(year) || year < 1990 || year > 2100) return null;
  const yearsLeft = year - new Date().getFullYear();
  if (yearsLeft >= 4) return "1st Year";
  if (yearsLeft === 3) return "2nd Year";
  if (yearsLeft === 2) return "3rd Year";
  if (yearsLeft === 1) return "4th Year";
  return "Other";
}

export function composeAcademicBackground(
  institute?: string | null,
  location?: string | null,
  degree?: string | null,
): string | null {
  const parts = [text(degree), text(institute), text(location)].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

function subjectsFromInterests(interests: string[]): string[] {
  const set = new Set<string>();
  for (const id of interests) {
    for (const subject of INTEREST_TO_SUBJECTS[id] ?? []) set.add(subject);
  }
  return [...set];
}

function skillsFromAccount(raw: unknown): SkillConfidence[] {
  if (!Array.isArray(raw)) return [];
  const out: SkillConfidence[] = [];
  for (const item of raw) {
    if (typeof item === "string" && item.trim()) {
      out.push({ skill: item.trim(), confidence: "beginner" });
      continue;
    }
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const skill = text(rec.skill) || text(rec.name) || text(rec.label);
    if (!skill) continue;
    const conf = text(rec.confidence || rec.level).toLowerCase().replace(/\s+/g, "_");
    const allowed: SkillConfidence["confidence"][] = [
      "never_used",
      "beginner",
      "basic",
      "intermediate",
      "advanced",
      "very_confident",
    ];
    out.push({
      skill,
      confidence: allowed.includes(conf as SkillConfidence["confidence"])
        ? (conf as SkillConfidence["confidence"])
        : "beginner",
    });
  }
  return out;
}

function projectsFromAccount(raw: unknown): ProjectEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: ProjectEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const name = text(rec.name) || text(rec.title);
    if (!name) continue;
    const technologies = Array.isArray(rec.technologies)
      ? rec.technologies.filter((t): t is string => typeof t === "string" && t.trim() !== "")
      : text(rec.tech)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
    const difficultyRaw = text(rec.difficulty).toLowerCase();
    const difficulty: ProjectEntry["difficulty"] =
      difficultyRaw === "hard" || difficultyRaw === "advanced"
        ? "hard"
        : difficultyRaw === "medium" || difficultyRaw === "intermediate"
          ? "medium"
          : "easy";
    out.push({
      name,
      technologies,
      difficulty,
      deployed: Boolean(rec.deployed),
      solo: rec.solo !== false,
    });
  }
  return out;
}

export function deriveRoadmapFieldsFromAccount(
  account: AccountForRoadmap,
  meta?: OnboardingMeta | null,
): DerivedRoadmapFields {
  const onboarding = meta ?? parseOnboardingMeta(account.additionalData);
  const targetRole = text(onboarding?.targetRole) || null;
  const projects = projectsFromAccount(account.projects);
  const knownSkills = skillsFromAccount(account.skills);

  return {
    currentStudy: composeCurrentStudy(
      account.degree,
      account.branch,
      account.institute,
    ),
    yearSemester: inferYearSemester(
      account.gradYear,
      account.degree,
      account.semester,
    ),
    academicBackground: composeAcademicBackground(
      account.institute,
      account.location,
      account.degree,
    ),
    enjoyedSubjects: subjectsFromInterests(onboarding?.interests ?? []),
    careerGoal:
      onboarding?.careerPath === "help"
        ? "Explore a career"
        : onboarding?.careerPath === "decided"
          ? "Get a job"
          : null,
    targetRole: targetRole
      ? findRoleByName(targetRole)?.name || targetRole
      : null,
    knownSkills,
    hasProjects: projects.length > 0,
    projects,
    experienceLevel: projects.length ? "College projects" : null,
    learningMotivation:
      text(account.objective) || text(account.passion) || text(account.bio) || null,
  };
}

export function fillMissingRoadmapFields<T extends Record<string, unknown>>(
  stored: T | null | undefined,
  derived: DerivedRoadmapFields,
): T & DerivedRoadmapFields {
  const base = { ...(stored ?? {}) } as T & DerivedRoadmapFields;
  const keys = Object.keys(derived) as (keyof DerivedRoadmapFields)[];
  for (const key of keys) {
    if (isBlank(base[key], key)) {
      (base as DerivedRoadmapFields)[key] = derived[key] as never;
    }
  }
  return base;
}
