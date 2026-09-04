/**
 * Apply profile management columns to Neon (idempotent).
 * Run: npm run db:migrate:profile
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
  console.log("Applying profile management columns...");

  await sql`ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "username" text`;
  await sql`ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "phone" text`;
  await sql`ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "date_of_birth" text`;
  await sql`ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "bio" text`;
  await sql`ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "location" text`;
  await sql`ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "website" text`;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "idx_profiles_username"
    ON "profiles" ("username")
    WHERE "username" IS NOT NULL
  `;

  await sql`ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "language" text DEFAULT 'en' NOT NULL`;
  await sql`ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "email_notifications" boolean DEFAULT true NOT NULL`;
  await sql`ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "push_notifications" boolean DEFAULT true NOT NULL`;
  await sql`ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "product_updates" boolean DEFAULT true NOT NULL`;
  await sql`ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "profile_visibility" text DEFAULT 'public' NOT NULL`;

  console.log("Profile management migration complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
