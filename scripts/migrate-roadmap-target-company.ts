/**
 * Add target_company columns for company-specific roadmaps.
 * Run: npm run db:migrate:roadmap-company
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
  console.log("Adding target_company columns...");

  await sql`ALTER TABLE "roadmap_profiles" ADD COLUMN IF NOT EXISTS "target_company" text`;
  await sql`ALTER TABLE "roadmaps" ADD COLUMN IF NOT EXISTS "target_company" text`;

  console.log("Roadmap target company migration complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
