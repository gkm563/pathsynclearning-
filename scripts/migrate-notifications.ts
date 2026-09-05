/**
 * Unread notification lookup index.
 * Run: npm run db:migrate:notifications
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
  console.log("Adding notifications unread index...");

  await sql`
    CREATE INDEX IF NOT EXISTS "idx_notifications_user_unread"
    ON "notifications" ("user_id", "read", "created_at")
  `;

  console.log("Notifications unread index migration complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
