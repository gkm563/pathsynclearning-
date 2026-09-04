import { z } from "zod";

export const appRoleSchema = z.enum(["student", "teacher", "recruiter"]);

export const meUpsertSchema = z
  .object({
    role: appRoleSchema.optional(),
  })
  .strict();

/** Coerce blank strings to null for optional nullable text fields */
const optionalText = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : v),
    z.string().trim().max(max).nullable().optional(),
  );

const optionalUsername = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? null : v),
  z
    .string()
    .trim()
    .min(3)
    .max(32)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username may only contain letters, numbers, and underscores",
    )
    .nullable()
    .optional(),
);

const optionalPhone = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? null : v),
  z
    .string()
    .trim()
    .max(32)
    .regex(/^[+\d\s()-]+$/, "Enter a valid phone number")
    .nullable()
    .optional(),
);

const optionalDate = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? null : v),
  z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD")
    .nullable()
    .optional(),
);

export const profileUpdateSchema = z
  .object({
    fullName: z.string().trim().min(1).max(120).optional(),
    username: optionalUsername,
    phone: optionalPhone,
    dateOfBirth: optionalDate,
    bio: optionalText(500),
    location: optionalText(120),
    website: optionalText(300),
    tagline: optionalText(280),
    institute: optionalText(200),
    degree: optionalText(120),
    branch: optionalText(120),
    cgpa: optionalText(16),
    gradYear: optionalText(16),
    rollNumber: optionalText(64),
    semester: optionalText(32),
    rankGlobal: optionalText(64),
    rankUniv: optionalText(64),
    skills: z.array(z.unknown()).optional(),
    passion: optionalText(2000),
    objective: optionalText(2000),
    pitch: optionalText(4000),
    github: optionalText(300),
    linkedin: optionalText(300),
    portfolio: optionalText(300),
    projects: z.array(z.unknown()).optional(),
    badges: z.array(z.unknown()).optional(),
    additionalData: z.record(z.string(), z.unknown()).optional(),
    additionalCompleted: z.boolean().optional(),
    imageUrl: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? null : v),
      z.string().trim().url().max(2000).nullable().optional(),
    ),
  })
  .strict();

export const settingsUpdateSchema = z
  .object({
    theme: z.enum(["light", "dark"]).optional(),
    accentColor: z.string().trim().max(64).optional(),
    activePlugin: z.string().trim().max(200).nullable().optional(),
    emailNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
    productUpdates: z.boolean().optional(),
    profileVisibility: z.enum(["public", "private", "connections"]).optional(),
  })
  .strict();

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1).max(200),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128)
      .regex(/[A-Z]/, "Include at least one uppercase letter")
      .regex(/[a-z]/, "Include at least one lowercase letter")
      .regex(/[0-9]/, "Include at least one number"),
  })
  .strict();

export const avatarSyncSchema = z
  .object({
    imageUrl: z.preprocess(
      (v) => (typeof v === "string" && v.trim() === "" ? null : v),
      z.string().trim().url().max(2000).nullable(),
    ),
  })
  .strict();

export const sessionsRevokeSchema = z
  .object({
    sessionId: z.string().trim().min(1).max(200).optional(),
    revokeOthers: z.boolean().optional(),
  })
  .strict()
  .refine((v) => Boolean(v.sessionId) || v.revokeOthers === true, {
    message: "Provide sessionId or set revokeOthers",
  });

export const accountDeleteSchema = z
  .object({
    confirmation: z.literal("DELETE"),
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

function normalizeOptionalUrl(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const withProtocol = /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  try {
    const parsed = new URL(withProtocol);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return undefined;
    }
    return parsed.toString();
  } catch {
    return undefined;
  }
}

function normalizeOptionalText(value: unknown, max = 8000): string | undefined {
  if (value == null) return undefined;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

const optionalUrl = z.preprocess(
  normalizeOptionalUrl,
  z.string().url().max(2000).optional(),
);

const optionalLongText = z.preprocess(
  (v) => normalizeOptionalText(v, 8000),
  z.string().max(8000).optional(),
);

const projectEvidenceSchema = z.object({
  kind: z.enum(["repo_url", "screenshot_url", "demo_url", "notes"]),
  url: optionalUrl,
  text: optionalLongText,
  stepId: z.preprocess(
    (v) => normalizeOptionalText(v, 128),
    z.string().max(128).optional(),
  ),
});

const projectEvidenceListSchema = z.preprocess((value) => {
  if (value == null) return [];
  if (!Array.isArray(value)) return value;
  return value
    .map((raw) => {
      if (!raw || typeof raw !== "object") return null;
      const item = raw as Record<string, unknown>;
      const kind = item.kind;
      if (
        kind !== "repo_url" &&
        kind !== "screenshot_url" &&
        kind !== "demo_url" &&
        kind !== "notes"
      ) {
        return null;
      }
      const url = normalizeOptionalUrl(item.url);
      const text = normalizeOptionalText(item.text, 8000);
      const stepId = normalizeOptionalText(item.stepId, 128);
      if (!url && !text) return null;
      return {
        kind,
        ...(url ? { url } : {}),
        ...(text ? { text } : {}),
        ...(stepId ? { stepId } : {}),
      };
    })
    .filter(Boolean);
}, z.array(projectEvidenceSchema).max(40));

export const challengesProjectProgressSchema = z
  .object({
    questionId: z.string().trim().min(1).max(128),
    stepsDone: z.array(z.string().trim().min(1).max(128)).max(40),
    evidence: projectEvidenceListSchema.optional(),
    repoUrl: optionalUrl,
    reflection: optionalLongText,
  })
  .strict();

export const challengesProjectSubmitSchema = z
  .object({
    questionId: z.string().trim().min(1).max(128),
    stepsDone: z.array(z.string().trim().min(1).max(128)).max(40),
    evidence: projectEvidenceListSchema.default([]),
    repoUrl: optionalUrl,
    reflection: optionalLongText,
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

/** @deprecated Legacy opaque payload — prefer domain event processor. */
export const memoryLaneCreateSchema = z
  .object({
    payload: z.record(z.string(), z.unknown()),
  })
  .strict();

export const noteVisibilitySchema = z.enum(["private", "public"]);

export const noteCreateSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    content: z.string().trim().min(1).max(12000),
    visibility: noteVisibilitySchema.optional().default("private"),
    sourceType: z.string().trim().min(1).max(64).nullable().optional(),
    sourceId: z.string().trim().min(1).max(200).nullable().optional(),
    links: z
      .array(
        z.object({
          entityType: z.string().trim().min(1).max(64),
          entityId: z.string().trim().min(1).max(200),
        }),
      )
      .max(20)
      .optional(),
  })
  .strict();

export const noteUpdateSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    content: z.string().trim().min(1).max(12000).optional(),
    visibility: noteVisibilitySchema.optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, {
    message: "Provide at least one field to update",
  });

export const memorySettingsUpdateSchema = z
  .object({
    includeLearning: z.boolean().optional(),
    includeProjects: z.boolean().optional(),
    includeAchievements: z.boolean().optional(),
    includeCertifications: z.boolean().optional(),
    includeMentorship: z.boolean().optional(),
    includeChallenges: z.boolean().optional(),
    includeEvents: z.boolean().optional(),
    includeCareer: z.boolean().optional(),
    includePrivateNotes: z.boolean().optional(),
    allowAiNotes: z.boolean().optional(),
  })
  .strict();

export const memoryTimelineQuerySchema = z.object({
  filter: z
    .enum([
      "all",
      "learning",
      "skills",
      "projects",
      "challenges",
      "mentorship",
      "collaboration",
      "achievements",
      "events",
      "career",
      "certifications",
      "notes",
      "milestones",
    ])
    .optional()
    .default("all"),
  search: z.string().trim().max(200).optional(),
  cursor: z.string().trim().max(64).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(30),
});

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

export const progressRangeSchema = z.enum(["week", "month", "all"]).default("all");

export const progressQuerySchema = z
  .object({
    range: progressRangeSchema,
  })
  .strict();

export const newsCategorySchema = z.enum([
  "AI",
  "Programming",
  "Startups",
  "Cybersecurity",
  "Web Development",
  "Cloud",
  "Open Source",
  "Gadgets",
]);

export const newsListQuerySchema = z
  .object({
    category: newsCategorySchema.optional(),
    search: z.string().trim().max(120).optional(),
    sort: z.enum(["latest", "popular"]).default("latest"),
    cursor: z.string().trim().max(200).optional(),
    limit: z.coerce.number().int().min(1).max(40).default(18),
    saved: z
      .union([z.literal("1"), z.literal("true"), z.literal("0"), z.literal("false")])
      .optional()
      .transform((v) => v === "1" || v === "true"),
  })
  .strict();

export const newsBookmarkSchema = z
  .object({
    articleId: z.string().uuid(),
    bookmarked: z.boolean(),
  })
  .strict();

export const newsReadSchema = z
  .object({
    articleId: z.string().uuid(),
  })
  .strict();

export const newsPreferencesUpdateSchema = z
  .object({
    categories: z.array(newsCategorySchema).max(8),
  })
  .strict();
