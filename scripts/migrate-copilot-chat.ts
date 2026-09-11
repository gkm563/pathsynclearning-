/**
 * Copilot chat threads + messages. Run: npm run db:migrate:copilot
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
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
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const raw = readFileSync(join(root, "drizzle", "0011_copilot_chat.sql"), "utf8");
  const statements = raw
    .split("--> statement-breakpoint")
    .map((chunk) =>
      chunk
        .split("\n")
        .filter((line) => !line.trim().startsWith("--"))
        .join("\n")
        .trim(),
    )
    .filter(Boolean);

  for (const statement of statements) {
    await sql.query(statement, []);
  }
  console.log("Copilot chat migration complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
