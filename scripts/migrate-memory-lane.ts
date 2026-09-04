/**
 * Apply Memory Lane tables to Neon (idempotent).
 * The generated drizzle migration also recreated older tables already present in prod.
 */
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL missing");
    process.exit(1);
  }

  const sql = neon(url);

  console.log("Creating Memory Lane tables (if not exist)...");

  await sql`
    CREATE TABLE IF NOT EXISTS "memories" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
      "type" text NOT NULL,
      "title" text NOT NULL,
      "description" text,
      "occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
      "source_type" text,
      "source_id" text,
      "visibility" text DEFAULT 'private' NOT NULL,
      "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "notes" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
      "title" text NOT NULL,
      "content" text NOT NULL,
      "visibility" text DEFAULT 'private' NOT NULL,
      "source_type" text,
      "source_id" text,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "note_links" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "note_id" uuid NOT NULL REFERENCES "notes"("id") ON DELETE cascade,
      "entity_type" text NOT NULL,
      "entity_id" text NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      CONSTRAINT "note_links_note_entity" UNIQUE("note_id","entity_type","entity_id")
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "milestones" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
      "type" text NOT NULL,
      "title" text NOT NULL,
      "description" text,
      "occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
      "source_type" text,
      "source_id" text,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      CONSTRAINT "milestones_user_type" UNIQUE("user_id","type")
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "domain_events" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE cascade,
      "type" text NOT NULL,
      "source_type" text,
      "source_id" text,
      "payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
      "occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
      "processed_at" timestamp with time zone,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "memory_settings" (
      "user_id" uuid PRIMARY KEY REFERENCES "users"("id") ON DELETE cascade,
      "include_learning" boolean DEFAULT true NOT NULL,
      "include_projects" boolean DEFAULT true NOT NULL,
      "include_achievements" boolean DEFAULT true NOT NULL,
      "include_certifications" boolean DEFAULT true NOT NULL,
      "include_mentorship" boolean DEFAULT true NOT NULL,
      "include_challenges" boolean DEFAULT true NOT NULL,
      "include_events" boolean DEFAULT true NOT NULL,
      "include_career" boolean DEFAULT true NOT NULL,
      "include_private_notes" boolean DEFAULT true NOT NULL,
      "allow_ai_notes" boolean DEFAULT false NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    )
  `;

  // Indexes (IF NOT EXISTS)
  await sql`CREATE INDEX IF NOT EXISTS "idx_memories_user_occurred" ON "memories" ("user_id","occurred_at")`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_memories_user_type" ON "memories" ("user_id","type")`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_memories_source" ON "memories" ("user_id","source_type","source_id")`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_notes_user_created" ON "notes" ("user_id","created_at")`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_notes_source" ON "notes" ("user_id","source_type","source_id")`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_notes_visibility" ON "notes" ("user_id","visibility")`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_note_links_note" ON "note_links" ("note_id")`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_milestones_user_occurred" ON "milestones" ("user_id","occurred_at")`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_domain_events_user" ON "domain_events" ("user_id","occurred_at")`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_domain_events_unprocessed" ON "domain_events" ("processed_at","created_at")`;

  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name IN ('memories','notes','note_links','milestones','domain_events','memory_settings')
    ORDER BY table_name
  `;

  console.log("Verified tables:", tables.map((t) => t.table_name).join(", "));
  console.log("Memory Lane migration applied successfully.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
