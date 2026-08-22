import { neon } from '@neondatabase/serverless';
import 'dotenv/config.js'; // load .env
import { config } from 'dotenv';
config({path: '.env.local'});
const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log('Running raw SQL migrations...');
  
  await sql`
    CREATE TABLE IF NOT EXISTS "roadmap_profiles" (
      "user_id" uuid PRIMARY KEY NOT NULL REFERENCES "public"."users"("id") ON DELETE cascade,
      "known_skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
      "has_projects" boolean DEFAULT false NOT NULL,
      "projects" jsonb DEFAULT '[]'::jsonb NOT NULL,
      "experience_level" text,
      "career_goal" text,
      "target_role" text,
      "want_to_learn" jsonb DEFAULT '[]'::jsonb NOT NULL,
      "learning_motivation" text,
      "weekly_hours" text,
      "project_vs_learning" text,
      "learning_styles" jsonb DEFAULT '[]'::jsonb NOT NULL,
      "target_timeline" text,
      "top_priority" text,
      "ai_follow_up_answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
      "current_study" text,
      "year_semester" text,
      "academic_background" text,
      "enjoyed_subjects" jsonb DEFAULT '[]'::jsonb NOT NULL,
      "struggled_subjects" jsonb DEFAULT '[]'::jsonb NOT NULL,
      "completed" boolean DEFAULT false NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    )
  `;
  console.log('Created roadmap_profiles');

  await sql`
    CREATE TABLE IF NOT EXISTS "roadmaps" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE cascade,
      "version" integer DEFAULT 1 NOT NULL,
      "title" text NOT NULL,
      "target_role" text NOT NULL,
      "estimated_weeks" integer,
      "nodes" jsonb NOT NULL,
      "edges" jsonb NOT NULL,
      "generated_from_profile" jsonb DEFAULT '{}'::jsonb NOT NULL,
      "is_active" boolean DEFAULT true NOT NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL
    )
  `;
  console.log('Created roadmaps');

  await sql`
    CREATE TABLE IF NOT EXISTS "roadmap_progress" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE cascade,
      "roadmap_id" uuid NOT NULL REFERENCES "public"."roadmaps"("id") ON DELETE cascade,
      "node_id" text NOT NULL,
      "status" text DEFAULT 'locked' NOT NULL,
      "completed_at" timestamp with time zone,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
      CONSTRAINT "roadmap_progress_user_roadmap_node" UNIQUE("user_id","roadmap_id","node_id")
    )
  `;
  console.log('Created roadmap_progress');
  
  await sql`CREATE INDEX IF NOT EXISTS "idx_roadmaps_user" ON "roadmaps" USING btree ("user_id","created_at")`;
  await sql`CREATE INDEX IF NOT EXISTS "idx_roadmap_progress_user" ON "roadmap_progress" USING btree ("user_id","roadmap_id")`;
  
  console.log('Done!');
}

main().catch(console.error);
