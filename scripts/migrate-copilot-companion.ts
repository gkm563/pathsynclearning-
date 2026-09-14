/**
 * Companion name + imported AI memory columns on user_settings.
 * Run: npm run db:migrate:copilot-companion
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
  console.log("Adding copilot companion columns...");

  await sql`ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "copilot_name" text`;
  await sql`ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "copilot_memory" text`;
  await sql`ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "copilot_memory_source" text`;

  console.log("Copilot companion migration complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
