-- PathEd production schema (Neon PostgreSQL)
-- Idempotent: safe to re-run

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Users (Clerk-linked) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id        TEXT NOT NULL UNIQUE,
  email           TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'student'
                    CHECK (role IN ('student', 'teacher', 'recruiter')),
  full_name       TEXT,
  image_url       TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users (clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ─── Profiles ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  tagline         TEXT,
  institute       TEXT,
  degree          TEXT,
  branch          TEXT,
  cgpa            TEXT,
  grad_year       TEXT,
  roll_number     TEXT,
  semester        TEXT,
  cri             INT NOT NULL DEFAULT 0,
  rank_global     TEXT,
  rank_univ       TEXT,
  xp              INT NOT NULL DEFAULT 0,
  streak          INT NOT NULL DEFAULT 0,
  skills          JSONB NOT NULL DEFAULT '[]'::jsonb,
  passion         TEXT,
  objective       TEXT,
  pitch           TEXT,
  github          TEXT,
  linkedin        TEXT,
  portfolio       TEXT,
  projects        JSONB NOT NULL DEFAULT '[]'::jsonb,
  badges          JSONB NOT NULL DEFAULT '[]'::jsonb,
  additional_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  additional_completed BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Onboarding ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS onboarding (
  user_id           UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  stage1            JSONB NOT NULL DEFAULT '{}'::jsonb,
  stage2            JSONB NOT NULL DEFAULT '{}'::jsonb,
  stage3            JSONB NOT NULL DEFAULT '{}'::jsonb,
  stage4            JSONB NOT NULL DEFAULT '{}'::jsonb,
  selected_career   TEXT,
  current_stage     INT NOT NULL DEFAULT 1,
  completed         BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Settings ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_settings (
  user_id       UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  theme         TEXT NOT NULL DEFAULT 'light',
  accent_color  TEXT NOT NULL DEFAULT 'Purple',
  plan          TEXT NOT NULL DEFAULT 'free',
  active_plugin TEXT,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Wallet ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallets (
  user_id       UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  coins         INT NOT NULL DEFAULT 3480,
  cash_balance  NUMERIC(12,2) NOT NULL DEFAULT 0,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind          TEXT NOT NULL,
  amount_coins  INT NOT NULL DEFAULT 0,
  amount_cash   NUMERIC(12,2) NOT NULL DEFAULT 0,
  meta          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_user ON wallet_transactions (user_id, created_at DESC);

-- ─── Store catalog + purchases ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS store_products (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  category      TEXT NOT NULL,
  price         INT NOT NULL,
  icon          TEXT,
  image_url     TEXT,
  description   TEXT,
  meta          TEXT,
  color         TEXT,
  included      JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order    INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchases (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id    TEXT NOT NULL REFERENCES store_products(id),
  price_paid    INT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases (user_id);

-- ─── Notifications ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type          TEXT NOT NULL DEFAULT 'general',
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  icon          TEXT,
  color         TEXT,
  bg            TEXT,
  bdr           TEXT,
  actionable    BOOLEAN NOT NULL DEFAULT FALSE,
  meta          JSONB NOT NULL DEFAULT '{}'::jsonb,
  read          BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, created_at DESC);

-- ─── Challenges + memory lane ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS challenge_progress (
  user_id       UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  state         JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memory_lane_entries (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payload       JSONB NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memory_user ON memory_lane_entries (user_id, created_at DESC);

-- ─── Events / OG applications ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS event_applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id      TEXT NOT NULL,
  kind          TEXT NOT NULL DEFAULT 'event'
                  CHECK (kind IN ('event', 'og')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, event_id, kind)
);

-- ─── Quotes (AI fallback dataset) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS quotes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase         TEXT NOT NULL,
  text          TEXT NOT NULL,
  author        TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quotes_phase ON quotes (phase);

-- ─── updated_at trigger helper ──────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'users_updated_at') THEN
    CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'profiles_updated_at') THEN
    CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'onboarding_updated_at') THEN
    CREATE TRIGGER onboarding_updated_at BEFORE UPDATE ON onboarding
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'user_settings_updated_at') THEN
    CREATE TRIGGER user_settings_updated_at BEFORE UPDATE ON user_settings
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'wallets_updated_at') THEN
    CREATE TRIGGER wallets_updated_at BEFORE UPDATE ON wallets
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'challenge_progress_updated_at') THEN
    CREATE TRIGGER challenge_progress_updated_at BEFORE UPDATE ON challenge_progress
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END $$;
CREATE TABLE IF NOT EXISTS "roadmap_profiles" ("user_id" uuid PRIMARY KEY NOT NULL REFERENCES "public"."users"("id") ON DELETE cascade, "known_skills" jsonb DEFAULT 
'
[]
'
::jsonb NOT NULL, "has_projects" boolean DEFAULT false NOT NULL, "projects" jsonb DEFAULT 
'
[]
'
::jsonb NOT NULL, "experience_level" text, "career_goal" text, "target_role" text, "want_to_learn" jsonb DEFAULT 
'
[]
'
::jsonb NOT NULL, "learning_motivation" text, "weekly_hours" text, "project_vs_learning" text, "learning_styles" jsonb DEFAULT 
'
[]
'
::jsonb NOT NULL, "target_timeline" text, "top_priority" text, "ai_follow_up_answers" jsonb DEFAULT 
'
{}
'
::jsonb NOT NULL, "current_study" text, "year_semester" text, "academic_background" text, "enjoyed_subjects" jsonb DEFAULT 
'
[]
'
::jsonb NOT NULL, "struggled_subjects" jsonb DEFAULT 
'
[]
'
::jsonb NOT NULL, "completed" boolean DEFAULT false NOT NULL, "updated_at" timestamp with time zone DEFAULT now() NOT NULL); CREATE TABLE IF NOT EXISTS "roadmaps" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "user_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE cascade, "version" integer DEFAULT 1 NOT NULL, "title" text NOT NULL, "target_role" text NOT NULL, "estimated_weeks" integer, "nodes" jsonb NOT NULL, "edges" jsonb NOT NULL, "generated_from_profile" jsonb DEFAULT 
'
{}
'
::jsonb NOT NULL, "is_active" boolean DEFAULT true NOT NULL, "created_at" timestamp with time zone DEFAULT now() NOT NULL); CREATE TABLE IF NOT EXISTS "roadmap_progress" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL, "user_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE cascade, "roadmap_id" uuid NOT NULL REFERENCES "public"."roadmaps"("id") ON DELETE cascade, "node_id" text NOT NULL, "status" text DEFAULT 
'
locked
'
 NOT NULL, "completed_at" timestamp with time zone, "updated_at" timestamp with time zone DEFAULT now() NOT NULL, CONSTRAINT "roadmap_progress_user_roadmap_node" UNIQUE("user_id","roadmap_id","node_id")); CREATE INDEX IF NOT EXISTS "idx_roadmaps_user" ON "roadmaps" USING btree ("user_id","created_at"); CREATE INDEX IF NOT EXISTS "idx_roadmap_progress_user" ON "roadmap_progress" USING btree ("user_id","roadmap_id");
