import { findRoleByName } from "@/lib/roadmap/hiring-catalog";
import { skillsMatch } from "@/lib/career/match";

export function evidenceMatchesRole(
  tags: string[],
  targetRole: string | null,
): boolean {
  if (!targetRole?.trim()) return false;
  if (!tags.length) return true;
  const role = findRoleByName(targetRole);
  return tags.some((tag) => {
    if (skillsMatch(tag, targetRole)) return true;
    const tagged = findRoleByName(tag);
    if (role && tagged && role.id === tagged.id) return true;
    return false;
  });
}

export function interviewMatchesRole(
  sessionRole: string,
  targetRole: string | null,
): boolean {
  if (!targetRole?.trim()) return false;
  if (skillsMatch(sessionRole, targetRole)) return true;
  const a = findRoleByName(sessionRole);
  const b = findRoleByName(targetRole);
  return Boolean(a && b && a.id === b.id);
}
