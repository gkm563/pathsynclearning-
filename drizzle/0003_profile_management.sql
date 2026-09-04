-- Profile management personal fields + preference columns
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "username" text;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "phone" text;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "date_of_birth" text;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "bio" text;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "location" text;
--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "website" text;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "idx_profiles_username" ON "profiles" ("username") WHERE "username" IS NOT NULL;
--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "language" text DEFAULT 'en' NOT NULL;
--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "email_notifications" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "push_notifications" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "product_updates" boolean DEFAULT true NOT NULL;
--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "profile_visibility" text DEFAULT 'public' NOT NULL;
