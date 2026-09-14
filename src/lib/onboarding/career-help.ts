import { HIRING_ROLES, type HiringRole, type RoleId } from "@/lib/roadmap/hiring-catalog";
import type { OnboardingCareer } from "@/lib/onboarding/types";

export type CareerInterest = {
  id: string;
  label: string;
  hint: string;
  roles: RoleId[];
};

export type HelpOption = {
  id: string;
  label: string;
  roles: RoleId[];
};

export type HelpQuestion = {
  id: string;
  prompt: string;
  hint?: string;
  options: HelpOption[];
  when: (interests: string[]) => boolean;
};

export type CareerSuggestion = HiringRole & {
  score: number;
  matchPercent: number;
  reasons: string[];
  breakdown: MatchBreakdownRow[];
  blurb: string;
};

export type MatchBreakdownRow = {
  label: string;
  detail: string;
  aligned: boolean;
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

export const WORK_STYLES: HelpOption[] = [
  { id: "builder", label: "Ship features and products", roles: ["fullstack", "frontend", "mobile", "sde"] },
  { id: "analyst", label: "Find patterns in data and explain them", roles: ["data-analyst", "data-scientist", "pm"] },
  { id: "operator", label: "Keep systems running and safe", roles: ["devops", "sre", "security"] },
  { id: "researcher", label: "Experiment, model, and go deep", roles: ["ml", "data-scientist", "security"] },
  { id: "communicator", label: "Align people, specs, and decisions", roles: ["pm", "ux", "sdet"] },
];

export const STRENGTHS: HelpOption[] = [
  { id: "coding", label: "Writing code", roles: ["sde", "backend", "fullstack", "frontend"] },
  { id: "math", label: "Math and statistics", roles: ["ml", "data-scientist", "data-analyst"] },
  { id: "design", label: "Visual / interaction design", roles: ["ux", "frontend"] },
  { id: "systems", label: "How computers and networks work", roles: ["sre", "devops", "security", "backend"] },
  { id: "people", label: "Talking to users and stakeholders", roles: ["pm", "ux", "data-analyst"] },
  { id: "careful", label: "Finding bugs and edge cases", roles: ["sdet", "security", "sde"] },
];

export const OUTCOMES: HelpOption[] = [
  { id: "internship", label: "Land an internship", roles: ["sde", "frontend", "backend", "fullstack"] },
  { id: "job", label: "Get a full-time role", roles: ["sde", "backend", "fullstack"] },
  { id: "portfolio", label: "Build a portfolio I can show", roles: ["frontend", "fullstack", "ux", "mobile"] },
  { id: "explore", label: "Explore before I commit", roles: ["sde", "data-analyst", "frontend"] },
  { id: "specialist", label: "Go deep in one specialty", roles: ["ml", "security", "sre", "devops"] },
];

export const FOLLOW_UPS: HelpQuestion[] = [
  {
    id: "ui-craft",
    prompt: "When you picture a product, what pulls you more?",
    when: (i) => i.includes("ui"),
    options: [
      { id: "looks", label: "How it looks and feels", roles: ["ux", "frontend"] },
      { id: "works", label: "Making the interface work in code", roles: ["frontend", "fullstack"] },
      { id: "both-ui", label: "Both — design through to code", roles: ["frontend", "ux"] },
    ],
  },
  {
    id: "api-depth",
    prompt: "On the server side, what sounds more like you?",
    when: (i) => i.includes("apis"),
    options: [
      { id: "features", label: "APIs that power product features", roles: ["backend", "fullstack"] },
      { id: "scale", label: "Performance, data, and reliability", roles: ["backend", "sre", "sde"] },
      { id: "data-layer", label: "Databases and query design", roles: ["backend", "data-analyst"] },
    ],
  },
  {
    id: "systems-path",
    prompt: "Core CS is useful in different ways. Which matters more right now?",
    when: (i) => i.includes("systems"),
    options: [
      { id: "dsa", label: "Coding interviews and DSA", roles: ["sde", "backend"] },
      { id: "ship", label: "Using CS to ship real software", roles: ["fullstack", "sde", "backend"] },
      { id: "low-level", label: "How the machine actually works", roles: ["sde", "sre", "security"] },
    ],
  },
  {
    id: "ml-shape",
    prompt: "With AI / data, what do you want to spend time on?",
    when: (i) => i.includes("ml") || i.includes("data"),
    options: [
      { id: "train", label: "Train and evaluate models", roles: ["ml", "data-scientist"] },
      { id: "insights", label: "SQL, experiments, and dashboards", roles: ["data-analyst", "data-scientist", "pm"] },
      { id: "apply", label: "Put models into a product", roles: ["ml", "sde", "backend"] },
    ],
  },
  {
    id: "cloud-shape",
    prompt: "Infra work can go two ways. Which is closer?",
    when: (i) => i.includes("cloud"),
    options: [
      { id: "ship-pipe", label: "CI/CD, containers, and shipping", roles: ["devops", "backend"] },
      { id: "uptime", label: "Uptime, incidents, and SLOs", roles: ["sre", "devops"] },
      { id: "cloud-apps", label: "Using cloud to build product backends", roles: ["backend", "devops", "sde"] },
    ],
  },
  {
    id: "sec-shape",
    prompt: "In security, which side are you curious about?",
    when: (i) => i.includes("security"),
    options: [
      { id: "offense", label: "Finding holes — CTFs, pentest, AppSec", roles: ["security"] },
      { id: "defense", label: "Detection, hardening, and response", roles: ["security", "sre"] },
      { id: "secure-build", label: "Building software that fails closed", roles: ["sdet", "backend", "security"] },
    ],
  },
  {
    id: "mobile-shape",
    prompt: "For apps on phones, what do you want to learn first?",
    when: (i) => i.includes("mobile"),
    options: [
      { id: "native", label: "Native Android or iOS", roles: ["mobile"] },
      { id: "cross", label: "Cross-platform (React Native / Flutter)", roles: ["mobile", "frontend"] },
      { id: "mobile-full", label: "App UI plus the backend behind it", roles: ["mobile", "fullstack"] },
    ],
  },
  {
    id: "product-shape",
    prompt: "Working with people and product — which seat fits?",
    when: (i) => i.includes("product"),
    options: [
      { id: "pm-seat", label: "Prioritize, write specs, measure impact", roles: ["pm"] },
      { id: "design-seat", label: "Research and design the experience", roles: ["ux", "pm"] },
      { id: "eng-partner", label: "Engineer who still thinks about the user", roles: ["sde", "fullstack", "frontend"] },
    ],
  },
  {
    id: "quality-shape",
    prompt: "Quality work looks different day to day. What appeals?",
    when: (i) => i.includes("quality"),
    options: [
      { id: "auto", label: "Automation frameworks and CI gates", roles: ["sdet"] },
      { id: "break", label: "Breaking things on purpose and reporting well", roles: ["sdet", "security"] },
      { id: "build-test", label: "Building features and testing them myself", roles: ["sde", "fullstack", "sdet"] },
    ],
  },
];

export function followUpsFor(interests: string[]): HelpQuestion[] {
  return FOLLOW_UPS.filter((q) => q.when(interests)).slice(0, 3);
}

function bump(scores: Map<RoleId, number>, roles: RoleId[], amount: number) {
  roles.forEach((roleId, index) => {
    scores.set(roleId, (scores.get(roleId) ?? 0) + Math.max(1, amount - index));
  });
}

function matchCeiling(career: OnboardingCareer): number {
  return (
    career.interests.length * 4 +
    followUpsFor(career.interests).length * 5 +
    (career.workStyle ? 3 : 0) +
    career.strengths.length * 3 +
    (career.outcome ? 2 : 0)
  );
}

function toPercent(score: number, ceiling: number): number {
  if (ceiling <= 0) return 0;
  const raw = Math.round((score / ceiling) * 100);
  return Math.max(1, Math.min(100, raw));
}

function breakdownFor(roleId: RoleId, career: OnboardingCareer): MatchBreakdownRow[] {
  const rows: MatchBreakdownRow[] = [];

  for (const id of career.interests) {
    const interest = CAREER_INTERESTS.find((item) => item.id === id);
    if (!interest) continue;
    rows.push({
      label: "Interest",
      detail: interest.label,
      aligned: interest.roles.includes(roleId),
    });
  }

  for (const question of followUpsFor(career.interests)) {
    const answerId = career.followUps[question.id];
    const option = question.options.find((o) => o.id === answerId);
    if (!option) continue;
    rows.push({
      label: "Follow-up",
      detail: `${question.prompt} → ${option.label}`,
      aligned: option.roles.includes(roleId),
    });
  }

  const style = WORK_STYLES.find((o) => o.id === career.workStyle);
  if (style) {
    rows.push({
      label: "Work style",
      detail: style.label,
      aligned: style.roles.includes(roleId),
    });
  }

  for (const id of career.strengths) {
    const strength = STRENGTHS.find((item) => item.id === id);
    if (!strength) continue;
    rows.push({
      label: "Strength",
      detail: strength.label,
      aligned: strength.roles.includes(roleId),
    });
  }

  const outcome = OUTCOMES.find((o) => o.id === career.outcome);
  if (outcome) {
    rows.push({
      label: "Goal",
      detail: outcome.label,
      aligned: outcome.roles.includes(roleId),
    });
  }

  return rows;
}

function blurbFor(
  role: HiringRole,
  percent: number,
  reasons: string[],
  isBest: boolean,
): string {
  const lead = isBest
    ? `${role.name} is your strongest match at ${percent}%.`
    : `${role.name} is a ${percent}% match based on this questionnaire.`;
  const why = reasons.length
    ? ` ${reasons.join(". ")}.`
    : "";
  return `${lead}${why} ${role.summary}`;
}

function reasonFor(roleId: RoleId, career: OnboardingCareer): string[] {
  const reasons: string[] = [];
  const interestHits = CAREER_INTERESTS.filter(
    (item) => career.interests.includes(item.id) && item.roles.includes(roleId),
  );
  if (interestHits[0]) reasons.push(`Matches “${interestHits[0].label.toLowerCase()}”`);

  const style = WORK_STYLES.find((o) => o.id === career.workStyle);
  if (style?.roles.includes(roleId)) reasons.push(`Fits ${style.label.toLowerCase()}`);

  const strengthHits = STRENGTHS.filter(
    (s) => career.strengths.includes(s.id) && s.roles.includes(roleId),
  );
  if (strengthHits[0]) reasons.push(`Plays to ${strengthHits[0].label.toLowerCase()}`);

  const outcome = OUTCOMES.find((o) => o.id === career.outcome);
  if (outcome?.roles.includes(roleId)) reasons.push(`Supports “${outcome.label.toLowerCase()}”`);

  return reasons.slice(0, 3);
}

export function suggestRolesFromHelp(career: OnboardingCareer): CareerSuggestion[] {
  const scores = new Map<RoleId, number>();

  for (const id of career.interests) {
    const interest = CAREER_INTERESTS.find((item) => item.id === id);
    if (interest) bump(scores, interest.roles, 4);
  }

  const style = WORK_STYLES.find((o) => o.id === career.workStyle);
  if (style) bump(scores, style.roles, 3);

  for (const id of career.strengths) {
    const strength = STRENGTHS.find((item) => item.id === id);
    if (strength) bump(scores, strength.roles, 3);
  }

  const outcome = OUTCOMES.find((o) => o.id === career.outcome);
  if (outcome) bump(scores, outcome.roles, 2);

  for (const question of followUpsFor(career.interests)) {
    const answerId = career.followUps[question.id];
    const option = question.options.find((o) => o.id === answerId);
    if (option) bump(scores, option.roles, 5);
  }

  const ceiling = matchCeiling(career);
  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);

  return ranked
    .map(([id, score], index) => {
      const role = HIRING_ROLES.find((item) => item.id === id);
      if (!role) return null;
      const reasons = reasonFor(id, career);
      const matchPercent = toPercent(score, ceiling);
      return {
        ...role,
        score,
        matchPercent,
        reasons,
        breakdown: breakdownFor(id, career),
        blurb: blurbFor(role, matchPercent, reasons, index === 0),
      };
    })
    .filter((row): row is CareerSuggestion => Boolean(row))
    .slice(0, 3);
}

export function suggestRolesFromInterests(interestIds: string[]): HiringRole[] {
  return suggestRolesFromHelp({
    path: "help",
    targetRole: "",
    interests: interestIds,
    workStyle: "",
    strengths: [],
    outcome: "",
    followUps: {},
  });
}

export function careerHelpIncomplete(career: OnboardingCareer): string | null {
  if (career.interests.length === 0) {
    return "Select at least one interest so we can ask better follow-ups.";
  }
  const pending = followUpsFor(career.interests).find((q) => !career.followUps[q.id]);
  if (pending) return "Answer the follow-up questions — they change the recommendation.";
  if (!career.workStyle) return "Tell us how you like to work.";
  if (career.strengths.length === 0) return "Pick at least one strength.";
  if (!career.outcome) return "Pick the outcome you want next.";
  return null;
}
