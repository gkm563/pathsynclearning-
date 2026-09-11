CREATE TABLE IF NOT EXISTS "problems" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" text NOT NULL,
  "number" integer NOT NULL,
  "title" text NOT NULL,
  "kind" text NOT NULL,
  "difficulty" text NOT NULL,
  "statement_md" text DEFAULT '' NOT NULL,
  "examples_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "constraints_md" text DEFAULT '' NOT NULL,
  "topics" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "company_tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "career_tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "xp" integer DEFAULT 50 NOT NULL,
  "coins" integer DEFAULT 2 NOT NULL,
  "est_minutes" integer DEFAULT 30 NOT NULL,
  "icon" text DEFAULT 'code' NOT NULL,
  "category" text DEFAULT 'DSA' NOT NULL,
  "is_published" boolean DEFAULT true NOT NULL,
  "weekly_eligible" boolean DEFAULT false NOT NULL,
  "monthly_eligible" boolean DEFAULT false NOT NULL,
  "legacy_id" text,
  "coding_harness" jsonb,
  "mcq_items" jsonb,
  "design_rubric" jsonb,
  "project_spec" jsonb,
  "hints" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "solution" jsonb,
  "extras" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "problems_slug_unique" ON "problems" ("slug");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "problems_number_unique" ON "problems" ("number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_problems_published_number" ON "problems" ("is_published", "number");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_problems_legacy_id" ON "problems" ("legacy_id");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "challenge_schedule" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "period" text NOT NULL,
  "period_key" text NOT NULL,
  "problem_id" uuid NOT NULL REFERENCES "problems"("id") ON DELETE RESTRICT,
  "problem_slug" text NOT NULL,
  "starts_at" timestamp with time zone NOT NULL,
  "ends_at" timestamp with time zone NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "challenge_schedule_period_key" ON "challenge_schedule" ("period", "period_key");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_challenge_schedule_window" ON "challenge_schedule" ("period", "starts_at", "ends_at");
--> statement-breakpoint
ALTER TABLE "challenge_attempts" ADD COLUMN IF NOT EXISTS "problem_id" uuid;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'challenge_attempts_problem_id_problems_id_fk'
  ) THEN
    ALTER TABLE "challenge_attempts"
      ADD CONSTRAINT "challenge_attempts_problem_id_problems_id_fk"
      FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE SET NULL;
  END IF;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_challenge_attempts_user_problem" ON "challenge_attempts" ("user_id", "problem_id");
