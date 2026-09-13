import { HIRING_ROLES, type HiringRole, type RoleId } from "@/lib/roadmap/hiring-catalog";

export type CareerInterest = {
  id: string;
  label: string;
  hint: string;
  roles: RoleId[];
};

export const CAREER_INTERESTS: CareerInterest[] = [
  {
    id: "ui",
    label: "Building interfaces people use",
    hint: "Web UI, design systems, interaction",
    roles: ["frontend", "ux", "fullstack"],
  },
  {
    id: "apis",
    label: "APIs, servers, and databases",
    hint: "Backend services and data stores",
    roles: ["backend", "fullstack", "sde"],
  },
  {
    id: "systems",
    label: "Coding interviews and core CS",
    hint: "DSA, language fluency, product engineering",
    roles: ["sde", "backend", "fullstack"],
  },
  {
    id: "ml",
    label: "AI, models, and machine learning",
    hint: "Python, applied ML, research-adjacent work",
    roles: ["ml", "data-scientist", "sde"],
  },
  {
    id: "data",
    label: "Dashboards, SQL, and insights",
    hint: "Analytics, metrics, stakeholder-ready reports",
    roles: ["data-analyst", "data-scientist", "pm"],
  },
  {
    id: "cloud",
    label: "Cloud, DevOps, and reliability",
    hint: "CI/CD, containers, production operations",
    roles: ["devops", "sre", "backend"],
  },
  {
    id: "security",
    label: "Security and protecting systems",
    hint: "AppSec, networking, defensive tooling",
    roles: ["security", "sre", "sdet"],
  },
  {
    id: "mobile",
    label: "Mobile apps",
    hint: "Android, iOS, or cross-platform",
    roles: ["mobile", "fullstack", "frontend"],
  },
  {
    id: "product",
    label: "Product strategy and people",
    hint: "Roadmaps, research, communication",
    roles: ["pm", "ux", "sde"],
  },
  {
    id: "quality",
    label: "Testing and quality",
    hint: "Automation, coverage, shipping with confidence",
    roles: ["sdet", "sde", "backend"],
  },
];

export function suggestRolesFromInterests(interestIds: string[]): HiringRole[] {
  const scores = new Map<RoleId, number>();
  for (const id of interestIds) {
    const interest = CAREER_INTERESTS.find((item) => item.id === id);
    if (!interest) continue;
    interest.roles.forEach((roleId, index) => {
      scores.set(roleId, (scores.get(roleId) ?? 0) + (3 - index));
    });
  }
  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => HIRING_ROLES.find((role) => role.id === id))
    .filter((role): role is HiringRole => Boolean(role))
    .slice(0, 3);
}
