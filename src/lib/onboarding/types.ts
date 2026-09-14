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
  workStyle: string;
  strengths: string[];
  outcome: string;
  followUps: Record<string, string>;
};

export type OnboardingMeta = {
  version: 1;
  careerPath: OnboardingCareerPath | null;
  targetRole: string | null;
  interests: string[];
  workStyle: string | null;
  strengths: string[];
  outcome: string | null;
  followUps: Record<string, string>;
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
  workStyle: "",
  strengths: [],
  outcome: "",
  followUps: {},
};

export function parseOnboardingMeta(data: unknown): OnboardingMeta | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const rec = data as Record<string, unknown>;
  const raw = rec.onboarding;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  const careerPath =
    o.careerPath === "decided" || o.careerPath === "help" ? o.careerPath : null;
  const followUps =
    o.followUps && typeof o.followUps === "object" && !Array.isArray(o.followUps)
      ? Object.fromEntries(
          Object.entries(o.followUps as Record<string, unknown>).filter(
            (entry): entry is [string, string] => typeof entry[1] === "string",
          ),
        )
      : {};
  return {
    version: 1,
    careerPath,
    targetRole: typeof o.targetRole === "string" ? o.targetRole : null,
    interests: Array.isArray(o.interests)
      ? o.interests.filter((s): s is string => typeof s === "string")
      : [],
    workStyle: typeof o.workStyle === "string" ? o.workStyle : null,
    strengths: Array.isArray(o.strengths)
      ? o.strengths.filter((s): s is string => typeof s === "string")
      : [],
    outcome: typeof o.outcome === "string" ? o.outcome : null,
    followUps,
    generateNow: o.generateNow === true,
    skipped: o.skipped === true,
  };
}
