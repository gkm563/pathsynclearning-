import type { ChallengeCodingHarness } from "@/lib/challenges/coding-harness";
import type {
  ChallengeDesignSpec,
  ChallengeDifficulty,
  ChallengeIconKey,
  ChallengeMcqItem,
  ChallengeQuestion,
} from "@/lib/challenges/types";
import type { ProjectAssessmentSpec } from "@/lib/projects/types";

const CAREER = [
  "Software Engineer",
  "Full Stack Developer",
  "Backend Engineer",
  "Frontend Engineer",
  "SDE",
];

export function codingProblem(
  number: number,
  spec: {
    slug: string;
    title: string;
    difficulty: ChallengeDifficulty;
    xp: number;
    minutes: number;
    topics: string[];
    companies?: string[];
    desc: string;
    prompt: string;
    hints: string[];
    editorial: string;
    complexity: string;
    params: string;
    fn: string;
    examples: { input: string; output: string }[];
    publicTests: ChallengeCodingHarness["publicTests"];
    hiddenTests: NonNullable<ChallengeCodingHarness["hiddenTests"]>;
    weekly?: boolean;
    monthly?: boolean;
    icon?: ChallengeIconKey;
    category?: string;
  },
): ChallengeQuestion {
  const coding: ChallengeCodingHarness = {
    functionName: spec.fn,
    starterCode: `function ${spec.fn}(${spec.params}) {\n  \n}\n`,
    examples: spec.examples,
    publicTests: spec.publicTests,
    hiddenTests: spec.hiddenTests,
  };
  return {
    id: spec.slug,
    slug: spec.slug,
    number,
    type: "coding",
    difficulty: spec.difficulty,
    title: spec.title,
    description: spec.desc,
    topics: spec.topics,
    careerTags: CAREER,
    companyTags: spec.companies || ["Google", "Amazon", "Microsoft"],
    hints: spec.hints,
    solution: { editorial: spec.editorial, complexity: spec.complexity },
    xp: spec.xp,
    coins: Math.max(2, Math.floor(spec.xp / 10)),
    estMinutes: spec.minutes,
    icon: spec.icon || "code",
    category: spec.category || "DSA",
    prompt: spec.prompt,
    examples: spec.examples.map((e) => `${e.input} → ${e.output}`).join("\n"),
    starterCode: coding.starterCode,
    coding,
    weeklyBossEligible: spec.weekly,
    monthlyEligible: spec.monthly,
    legacyType: "CODE",
  };
}

export function mcqProblem(
  number: number,
  spec: {
    slug: string;
    title: string;
    difficulty: ChallengeDifficulty;
    xp: number;
    minutes: number;
    topics: string[];
    companies?: string[];
    desc: string;
    hints: string[];
    editorial: string;
    questions: ChallengeMcqItem[];
    category?: string;
  },
): ChallengeQuestion {
  return {
    id: spec.slug,
    slug: spec.slug,
    number,
    type: "mcq",
    difficulty: spec.difficulty,
    title: spec.title,
    description: spec.desc,
    topics: spec.topics,
    careerTags: [...CAREER, "Backend Engineer"],
    companyTags: spec.companies || ["Amazon", "Oracle", "Cisco"],
    hints: spec.hints,
    solution: { editorial: spec.editorial, complexity: "MCQ answer key" },
    xp: spec.xp,
    coins: Math.max(2, Math.floor(spec.xp / 10)),
    estMinutes: spec.minutes,
    icon: "book",
    category: spec.category || "THEORY",
    prompt: spec.desc,
    questions: spec.questions,
    legacyType: "MCQ",
  };
}

export function designProblem(
  number: number,
  spec: {
    slug: string;
    title: string;
    difficulty: ChallengeDifficulty;
    xp: number;
    minutes: number;
    topics: string[];
    companies?: string[];
    desc: string;
    prompt: string;
    hints: string[];
    editorial: string;
    design: ChallengeDesignSpec;
    weekly?: boolean;
    monthly?: boolean;
  },
): ChallengeQuestion {
  return {
    id: spec.slug,
    slug: spec.slug,
    number,
    type: "system_design",
    difficulty: spec.difficulty,
    title: spec.title,
    description: spec.desc,
    topics: spec.topics,
    careerTags: [...CAREER, "Staff Engineer", "Platform Engineer"],
    companyTags: spec.companies || ["Google", "Amazon", "Meta", "Uber"],
    hints: spec.hints,
    solution: {
      editorial: spec.editorial,
      complexity: "Design trade-offs, not runtime",
    },
    xp: spec.xp,
    coins: Math.max(4, Math.floor(spec.xp / 10)),
    estMinutes: spec.minutes,
    icon: "network",
    category: "SYSTEM DESIGN",
    prompt: spec.prompt,
    design: spec.design,
    weeklyBossEligible: spec.weekly ?? true,
    monthlyEligible: spec.monthly,
    legacyType: "CODE",
  };
}

export function projectProblem(
  number: number,
  spec: {
    slug: string;
    title: string;
    difficulty: ChallengeDifficulty;
    xp: number;
    minutes: number;
    topics: string[];
    companies?: string[];
    desc: string;
    prompt: string;
    hints: string[];
    editorial: string;
    project: ProjectAssessmentSpec;
    monthly?: boolean;
    weekly?: boolean;
  },
): ChallengeQuestion {
  return {
    id: spec.slug,
    slug: spec.slug,
    number,
    type: "project",
    difficulty: spec.difficulty,
    title: spec.title,
    description: spec.desc,
    topics: spec.topics,
    careerTags: [...CAREER, "Staff Engineer"],
    companyTags: spec.companies || ["GitHub", "Vercel"],
    hints: spec.hints,
    solution: { editorial: spec.editorial, complexity: "Project rubric" },
    xp: spec.xp,
    coins: Math.max(6, Math.floor(spec.xp / 10)),
    estMinutes: spec.minutes,
    icon: "wrench",
    category: "PROJECT",
    prompt: spec.prompt,
    project: spec.project,
    weeklyBossEligible: spec.weekly,
    monthlyEligible: spec.monthly ?? true,
    legacyType: "PROJECT",
  };
}

export const DEFAULT_DESIGN_DIMS: ChallengeDesignSpec["dimensions"] = [
  {
    id: "requirements",
    label: "Requirements",
    weight: 15,
    prompt: "Functional + non-functional requirements, scope, and out-of-scope.",
  },
  {
    id: "capacity",
    label: "Capacity",
    weight: 15,
    prompt: "QPS, storage, bandwidth back-of-envelope.",
  },
  {
    id: "api",
    label: "API",
    weight: 15,
    prompt: "Core endpoints, payloads, idempotency, errors.",
  },
  {
    id: "data",
    label: "Data model",
    weight: 20,
    prompt: "Entities, keys, indexes, consistency.",
  },
  {
    id: "scaling",
    label: "Scaling",
    weight: 20,
    prompt: "Cache, shards, queues, failover.",
  },
  {
    id: "tradeoffs",
    label: "Trade-offs",
    weight: 15,
    prompt: "Consistency vs latency, cost, operational risk.",
  },
];
