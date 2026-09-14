ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "copilot_name" text;
--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "copilot_memory" text;
--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "copilot_memory_source" text;
