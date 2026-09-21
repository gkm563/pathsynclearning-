/**
 * Study-plan calendar + YouTube search/oEmbed cache.
 * Run: npx tsx scripts/migrate-roadmap-study-youtube.ts
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

function statementsFrom(path: string) {
  const raw = readFileSync(path, "utf8");
  return raw
    .split("--> statement-breakpoint")
    .map((chunk) =>
      chunk
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim(),
    )
    .filter(Boolean);
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL missing in .env.local");
    process.exit(1);
  }

  const sql = neon(url);
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const files = [
    "drizzle/0016_roadmap_study_tasks.sql",
    "drizzle/0017_youtube_search_cache.sql",
  ];

  for (const file of files) {
    console.log(`Applying ${file}…`);
    for (const statement of statementsFrom(join(root, file))) {
      await sql.query(statement, []);
    }
  }
  console.log("Study plan + YouTube cache tables are ready.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
