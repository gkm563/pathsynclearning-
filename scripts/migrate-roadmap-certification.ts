/**
 * Roadmap certification columns for the final-interview gate.
 * Run: npm run db:migrate:roadmap-certification
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
  console.log("Adding roadmap certification columns...");

  await sql`ALTER TABLE "roadmaps" ADD COLUMN IF NOT EXISTS "certified_at" timestamp with time zone`;
  await sql`ALTER TABLE "roadmaps" ADD COLUMN IF NOT EXISTS "certification_status" text DEFAULT 'in_progress' NOT NULL`;
  await sql`ALTER TABLE "roadmaps" ADD COLUMN IF NOT EXISTS "last_final_interview_id" uuid`;
  await sql`ALTER TABLE "roadmaps" ADD COLUMN IF NOT EXISTS "adaptation" jsonb DEFAULT '{}'::jsonb NOT NULL`;

  console.log("Roadmap certification migration complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
