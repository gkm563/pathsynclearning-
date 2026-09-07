import { BookOpen, Briefcase, GraduationCap, type LucideIcon } from "lucide-react";

/**
 * The three audiences PathEd onboards.
 *
 * `id` is not cosmetic — it's sent to `POST /api/me` as `role`, stored on the
 * Clerk user as `unsafeMetadata.role`, and passed through the whole OAuth
 * redirect chain (`/sso-callback?role=` → `/auth/continue?role=`) to decide
 * where the user lands after authenticating. Do not rename these ids.
 */
export type AuthRoleId = "student" | "teacher" | "recruiter";

export type AuthRole = {
  id: AuthRoleId;
  name: string;
  icon: LucideIcon;
  /** Sub-heading on the sign-in/sign-up panel. */
  tagline: string;
  /** Proof points shown beside the form on wide viewports. */
  highlights: Array<{ title: string; detail: string }>;
};

export const AUTH_ROLES: AuthRole[] = [
  {
    id: "student",
    name: "Student",
    icon: GraduationCap,
    tagline: "Access your AI roadmap and skill graph.",
    highlights: [
      {
        title: "Skill decay protection",
        detail: "98% knowledge retention",
      },
      {
        title: "AI-calibrated skill graph",
        detail: "Benchmarked to real hiring bars",
      },
      {
        title: "Career Readiness Index",
        detail: "Real-time scoring",
      },
    ],
  },
  {
    id: "teacher",
    name: "Educator",
    icon: BookOpen,
    tagline: "Enter the educator command centre.",
    highlights: [
      { title: "12,000+ classrooms connected", detail: "Active academics" },
      { title: "Automated AI evaluator", detail: "Submission analytics" },
      { title: "Real-time student heatmap", detail: "Skill-gap monitoring" },
    ],
  },
  {
    id: "recruiter",
    name: "Recruiter",
    icon: Briefcase,
    tagline: "Access the verified talent portal.",
    highlights: [
      { title: "500+ hiring partners", detail: "Verified skill résumés" },
      { title: "Zero résumé friction", detail: "CRI-scored candidates" },
      { title: "Pipeline intelligence", detail: "Real-time matching" },
    ],
  },
];

export function findAuthRole(id: string): AuthRole {
  return AUTH_ROLES.find((role) => role.id === id) ?? AUTH_ROLES[0];
}