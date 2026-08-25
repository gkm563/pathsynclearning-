/**
 * Schema sync via Drizzle ORM (drops legacy onboarding if present).
 */
import { config } from "dotenv";
import { sql } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

config({ path: ".env.local" });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL missing in env/.env.local");
    process.exit(1);
  }

  const db = drizzle(neon(url));
  console.log("Dropping legacy onboarding table (if present)...");
  await db.execute(sql`DROP TABLE IF EXISTS onboarding CASCADE`);
  console.log("Schema sync complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
