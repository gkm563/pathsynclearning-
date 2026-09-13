ALTER TABLE "roadmaps" ADD COLUMN IF NOT EXISTS "certified_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "roadmaps" ADD COLUMN IF NOT EXISTS "certification_status" text DEFAULT 'in_progress' NOT NULL;
--> statement-breakpoint
ALTER TABLE "roadmaps" ADD COLUMN IF NOT EXISTS "last_final_interview_id" uuid;
--> statement-breakpoint
ALTER TABLE "roadmaps" ADD COLUMN IF NOT EXISTS "adaptation" jsonb DEFAULT '{}'::jsonb NOT NULL;
