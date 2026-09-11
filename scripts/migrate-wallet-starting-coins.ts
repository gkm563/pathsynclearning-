/**
 * New wallets start at 0 coins. Run: npm run db:migrate:wallet-coins
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
  const raw = readFileSync(
    join(root, "drizzle", "0010_wallet_starting_coins.sql"),
    "utf8",
  );
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
  console.log("Wallet starting coins migration complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
