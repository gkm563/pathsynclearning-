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

export const onboardingUpdateSchema = z
  .object({
    stage1: z.record(z.string(), z.unknown()).optional(),
    stage2: z.record(z.string(), z.unknown()).optional(),
    stage3: z.record(z.string(), z.unknown()).optional(),
    stage4: z.record(z.string(), z.unknown()).optional(),
    selectedCareer: z.string().trim().max(200).nullable().optional(),
    currentStage: z.number().int().min(1).max(4).optional(),
    completed: z.boolean().optional(),
  })
  .strict();

export const challengesUpdateSchema = z
  .object({
    state: z.array(z.unknown()),
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
