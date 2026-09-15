import { skillsForRoleName } from "@/lib/roadmap/generation-questions";

function normalizeSkill(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9+]+/g, " ").trim();
}

export function skillLabelFromUnknown(item: unknown): string | null {
  if (typeof item === "string") {
    const trimmed = item.trim();
    return trimmed || null;
  }
  if (!item || typeof item !== "object" || Array.isArray(item)) return null;
  const rec = item as Record<string, unknown>;
  for (const key of ["skill", "name", "label", "title"]) {
    const value = rec[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

export function uniqueSkillLabels(raw: unknown[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    const label = skillLabelFromUnknown(item);
    if (!label) continue;
    const key = normalizeSkill(label);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(label);
  }
  return out;
}

export function skillsMatch(a: string, b: string): boolean {
  const left = normalizeSkill(a);
  const right = normalizeSkill(b);
  if (!left || !right) return false;
  if (left === right) return true;
  return left.includes(right) || right.includes(left);
}

export type CareerCriPreview = {
  matchedSkills: string[];
  roleSkills: string[];
  cri: number;
  startsFromBeginning: boolean;
};

/** Career-relative CRI: coverage of the new role's skills. Zero matches → start over. */
export function previewCareerCri(
  studentSkills: string[],
  targetRole: string,
): CareerCriPreview {
  const roleSkills = skillsForRoleName(targetRole);
  const matchedSkills = roleSkills.filter((roleSkill) =>
    studentSkills.some((owned) => skillsMatch(owned, roleSkill)),
  );
  const startsFromBeginning = matchedSkills.length === 0;
  const cri = startsFromBeginning
    ? 0
    : Math.max(
        1,
        Math.min(100, Math.round((matchedSkills.length / roleSkills.length) * 100)),
      );

  return { matchedSkills, roleSkills, cri, startsFromBeginning };
}
