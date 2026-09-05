-- Company-targeted roadmaps
ALTER TABLE "roadmap_profiles" ADD COLUMN IF NOT EXISTS "target_company" text;
--> statement-breakpoint
ALTER TABLE "roadmaps" ADD COLUMN IF NOT EXISTS "target_company" text;
