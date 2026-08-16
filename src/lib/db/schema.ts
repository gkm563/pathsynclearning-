import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkId: text("clerk_id").notNull().unique(),
    email: text("email").notNull(),
    role: text("role").notNull().default("student"),
    fullName: text("full_name"),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_users_clerk_id").on(t.clerkId), index("idx_users_email").on(t.email)],
);

export const profiles = pgTable("profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  tagline: text("tagline"),
  institute: text("institute"),
  degree: text("degree"),
  branch: text("branch"),
  cgpa: text("cgpa"),
  gradYear: text("grad_year"),
  rollNumber: text("roll_number"),
  semester: text("semester"),
  cri: integer("cri").notNull().default(0),
  rankGlobal: text("rank_global"),
  rankUniv: text("rank_univ"),
  xp: integer("xp").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  skills: jsonb("skills").$type<unknown[]>().notNull().default([]),
  passion: text("passion"),
  objective: text("objective"),
  pitch: text("pitch"),
  github: text("github"),
  linkedin: text("linkedin"),
  portfolio: text("portfolio"),
  projects: jsonb("projects").$type<unknown[]>().notNull().default([]),
  badges: jsonb("badges").$type<unknown[]>().notNull().default([]),
  additionalData: jsonb("additional_data").$type<Record<string, unknown>>().notNull().default({}),
  additionalCompleted: boolean("additional_completed").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const onboarding = pgTable("onboarding", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  stage1: jsonb("stage1").$type<Record<string, unknown>>().notNull().default({}),
  stage2: jsonb("stage2").$type<Record<string, unknown>>().notNull().default({}),
  stage3: jsonb("stage3").$type<Record<string, unknown>>().notNull().default({}),
  stage4: jsonb("stage4").$type<Record<string, unknown>>().notNull().default({}),
  selectedCareer: text("selected_career"),
  currentStage: integer("current_stage").notNull().default(1),
  completed: boolean("completed").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userSettings = pgTable("user_settings", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  theme: text("theme").notNull().default("light"),
  accentColor: text("accent_color").notNull().default("Purple"),
  plan: text("plan").notNull().default("free"),
  activePlugin: text("active_plugin"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const wallets = pgTable("wallets", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  coins: integer("coins").notNull().default(3480),
  cashBalance: numeric("cash_balance", { precision: 12, scale: 2 }).notNull().default("0"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const walletTransactions = pgTable(
  "wallet_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    amountCoins: integer("amount_coins").notNull().default(0),
    amountCash: numeric("amount_cash", { precision: 12, scale: 2 }).notNull().default("0"),
    meta: jsonb("meta").$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_wallet_tx_user").on(t.userId, t.createdAt)],
);

export const storeProducts = pgTable("store_products", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  price: integer("price").notNull(),
  icon: text("icon"),
  imageUrl: text("image_url"),
  description: text("description"),
  meta: text("meta"),
  color: text("color"),
  included: jsonb("included").$type<unknown[]>().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const purchases = pgTable(
  "purchases",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => storeProducts.id),
    pricePaid: integer("price_paid").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique("purchases_user_product").on(t.userId, t.productId),
    index("idx_purchases_user").on(t.userId),
  ],
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull().default("general"),
    title: text("title").notNull(),
    body: text("body").notNull(),
    icon: text("icon"),
    color: text("color"),
    bg: text("bg"),
    bdr: text("bdr"),
    actionable: boolean("actionable").notNull().default(false),
    meta: jsonb("meta").$type<Record<string, unknown>>().notNull().default({}),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_notifications_user").on(t.userId, t.createdAt)],
);

export const challengeProgress = pgTable("challenge_progress", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  state: jsonb("state").$type<unknown[]>().notNull().default([]),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const memoryLaneEntries = pgTable(
  "memory_lane_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_memory_user").on(t.userId, t.createdAt)],
);

export const eventApplications = pgTable(
  "event_applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    eventId: text("event_id").notNull(),
    kind: text("kind").notNull().default("event"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [unique("event_applications_user_event_kind").on(t.userId, t.eventId, t.kind)],
);

export const quotes = pgTable(
  "quotes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    phase: text("phase").notNull(),
    text: text("text").notNull(),
    author: text("author").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_quotes_phase").on(t.phase)],
);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type Onboarding = typeof onboarding.$inferSelect;
