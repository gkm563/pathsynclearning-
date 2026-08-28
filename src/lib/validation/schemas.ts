import { z } from "zod";

export const appRoleSchema = z.enum(["student", "teacher", "recruiter"]);

export const meUpsertSchema = z
  .object({
    role: appRoleSchema.optional(),
  })
  .strict();

export const profileUpdateSchema = z
  .object({
    fullName: z.string().trim().min(1).max(120).optional(),
    tagline: z.string().trim().max(280).nullable().optional(),
    institute: z.string().trim().max(200).nullable().optional(),
    degree: z.string().trim().max(120).nullable().optional(),
    branch: z.string().trim().max(120).nullable().optional(),
    cgpa: z.string().trim().max(16).nullable().optional(),
    gradYear: z.string().trim().max(16).nullable().optional(),
    rollNumber: z.string().trim().max(64).nullable().optional(),
    semester: z.string().trim().max(32).nullable().optional(),
    rankGlobal: z.string().trim().max(64).nullable().optional(),
    rankUniv: z.string().trim().max(64).nullable().optional(),
    skills: z.array(z.unknown()).optional(),
    passion: z.string().trim().max(2000).nullable().optional(),
    objective: z.string().trim().max(2000).nullable().optional(),
    pitch: z.string().trim().max(4000).nullable().optional(),
    github: z.string().trim().max(300).nullable().optional(),
    linkedin: z.string().trim().max(300).nullable().optional(),
    portfolio: z.string().trim().max(300).nullable().optional(),
    projects: z.array(z.unknown()).optional(),
    badges: z.array(z.unknown()).optional(),
    additionalData: z.record(z.string(), z.unknown()).optional(),
    additionalCompleted: z.boolean().optional(),
  })
  .strict();

export const settingsUpdateSchema = z
  .object({
    theme: z.enum(["light", "dark"]).optional(),
    accentColor: z.string().trim().max(64).optional(),
    activePlugin: z.string().trim().max(200).nullable().optional(),
  })
  .strict();

export const challengesUpdateSchema = z
  .object({
    state: z.unknown(),
  })
  .strict();

export const challengesSyncSchema = z
  .object({
    enabled: z.boolean().optional(),
    pinnedNodeIds: z.array(z.string().trim().min(1).max(128)).max(40).optional(),
  })
  .strict();

export const challengesAttemptSchema = z
  .object({
    questionId: z.string().trim().min(1).max(128),
    /** Client hint only — server re-grades MCQ/coding strictly */
    passed: z.boolean().optional(),
    score: z.number().min(0).max(100).optional(),
    answers: z.record(z.string(), z.number().int().min(0).max(20)).optional(),
    code: z.string().max(50000).optional(),
    language: z.enum(["javascript", "python", "java", "c", "cpp"]).optional(),
  })
  .strict();

const projectEvidenceSchema = z.object({
  kind: z.enum(["repo_url", "screenshot_url", "demo_url", "notes"]),
  url: z.string().trim().url().max(2000).optional(),
  text: z.string().trim().max(8000).optional(),
  stepId: z.string().trim().max(128).optional(),
});

export const challengesProjectProgressSchema = z
  .object({
    questionId: z.string().trim().min(1).max(128),
    stepsDone: z.array(z.string().trim().min(1).max(128)).max(40),
    evidence: z.array(projectEvidenceSchema).max(40).optional(),
    repoUrl: z.string().trim().url().max(2000).optional(),
    reflection: z.string().trim().max(8000).optional(),
  })
  .strict();

export const challengesProjectSubmitSchema = z
  .object({
    questionId: z.string().trim().min(1).max(128),
    stepsDone: z.array(z.string().trim().min(1).max(128)).max(40),
    evidence: z.array(projectEvidenceSchema).max(40).default([]),
    repoUrl: z.string().trim().url().max(2000).optional(),
    reflection: z.string().trim().max(8000).optional(),
  })
  .strict();

export const challengesActionSchema = z
  .object({
    action: z.enum([
      "buy_shield",
      "unlock_hint",
      "arena_complete",
      "refresh_duel",
    ]),
    questionId: z.string().trim().min(1).max(128).optional(),
    score: z.number().min(0).max(100).optional(),
  })
  .strict();

export const memoryLaneCreateSchema = z
  .object({
    payload: z.record(z.string(), z.unknown()),
  })
  .strict();

export const notificationPatchSchema = z
  .object({
    id: z.string().uuid().optional(),
    read: z.boolean().optional(),
    markAllRead: z.boolean().optional(),
  })
  .strict()
  .refine((v) => v.markAllRead === true || (v.id != null && v.read != null), {
    message: "Provide markAllRead or id+read",
  });

export const applicationCreateSchema = z
  .object({
    eventId: z.string().trim().min(1).max(128),
    kind: z.enum(["event", "og"]).default("event"),
  })
  .strict();

export const storePurchaseSchema = z
  .object({
    productId: z.string().trim().min(1).max(128),
  })
  .strict();

export const walletActionSchema = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("deposit"),
      amountCash: z.number().positive().max(10_000),
    })
    .strict(),
  z
    .object({
      action: z.literal("buy_coins"),
      packId: z.string().trim().min(1).max(64),
    })
    .strict(),
  z
    .object({
      action: z.literal("cash_out"),
      exchangeId: z.string().trim().min(1).max(64),
    })
    .strict(),
  z
    .object({
      action: z.literal("buy_coins_amount"),
      coins: z.number().int().positive().max(50_000),
      cost: z.number().positive().max(10_000),
    })
    .strict(),
  z
    .object({
      action: z.literal("cash_out_amount"),
      coins: z.number().int().positive().max(50_000),
      cashValue: z.number().positive().max(10_000),
    })
    .strict(),
]);

export const quoteRequestSchema = z
  .object({
    phase: z.string().trim().min(1).max(64).default("motivation"),
  })
  .strict();
