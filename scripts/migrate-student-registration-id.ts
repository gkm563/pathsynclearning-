/**
 * Apply the permanent Student Registration ID schema (idempotent).
 * Run: npm run db:migrate:student-id
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  "0006_student_registration_id.sql",
  "0007_student_registration_id_on_delete.sql",
  "0008_student_id_random.sql",
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL missing");
    process.exit(1);
  }

  const sql = neon(url);

  for (const file of files) {
    const sqlPath = join(root, "drizzle", file);
    const raw = readFileSync(sqlPath, "utf8");
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

    console.log(`Applying ${file}...`);
    for (const statement of statements) {
      await sql.query(statement, []);
    }
  }
  console.log("Student Registration ID migration complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
