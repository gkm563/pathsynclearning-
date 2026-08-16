import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL missing");
    process.exit(1);
  }

  const sql = neon(url);
  const schemaPath = path.join(process.cwd(), "src", "lib", "db", "schema.sql");
  const raw = fs.readFileSync(schemaPath, "utf8");

  // Split on semicolons that end statements, but keep DO $$ blocks intact
  const statements = [];
  let buf = "";
  let inDollar = false;
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.startsWith("--")) continue;
    if (trimmed.includes("$$")) {
      inDollar = !inDollar;
    }
    buf += line + "\n";
    if (!inDollar && trimmed.endsWith(";")) {
      const stmt = buf.trim();
      if (stmt.length > 1) statements.push(stmt);
      buf = "";
    }
  }
  if (buf.trim()) statements.push(buf.trim());

  console.log(`Running ${statements.length} SQL statements...`);
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await sql.query(stmt);
      process.stdout.write(".");
    } catch (err) {
      console.error(`\nFailed at statement ${i + 1}:\n${stmt.slice(0, 200)}...`);
      throw err;
    }
  }
  console.log("\nMigration complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
