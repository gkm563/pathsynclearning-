export type OnboardingCareerPath = "decided" | "help";

export type OnboardingBasics = {
  fullName: string;
  institute: string;
  degree: string;
  branch: string;
  gradYear: string;
  location: string;
};

export type OnboardingCareer = {
  path: OnboardingCareerPath | null;
  targetRole: string;
  interests: string[];
};

export type OnboardingMeta = {
  version: 1;
  careerPath: OnboardingCareerPath | null;
  targetRole: string | null;
  interests: string[];
  generateNow: boolean;
  skipped: boolean;
};

export type OnboardingStatus = {
  completed: boolean;
  basics: OnboardingBasics;
  career: OnboardingCareer;
};

export const EMPTY_ONBOARDING_BASICS: OnboardingBasics = {
  fullName: "",
  institute: "",
  degree: "",
  branch: "",
  gradYear: "",
  location: "",
};

export const EMPTY_ONBOARDING_CAREER: OnboardingCareer = {
  path: null,
  targetRole: "",
  interests: [],
};

export function parseOnboardingMeta(data: unknown): OnboardingMeta | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const rec = data as Record<string, unknown>;
  const raw = rec.onboarding;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const careerPath =
    o.careerPath === "decided" || o.careerPath === "help" ? o.careerPath : null;
  return {
    version: 1,
    careerPath,
    targetRole: typeof o.targetRole === "string" ? o.targetRole : null,
    interests: Array.isArray(o.interests)
      ? o.interests.filter((s): s is string => typeof s === "string")
      : [],
    generateNow: o.generateNow === true,
    skipped: o.skipped === true,
  };
}
