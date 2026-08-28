/**
 * Wipe Next.js output dirs so webpack chunk maps stay consistent.
 *
 * Usage:
 *   node scripts/clean-next.mjs           # both .next and .next-dev
 *   node scripts/clean-next.mjs --dev     # .next-dev only
 *   node scripts/clean-next.mjs --prod    # .next only
 */
import { rmSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const args = new Set(process.argv.slice(2));

let targets;
if (args.has("--dev")) targets = [".next-dev"];
else if (args.has("--prod")) targets = [".next"];
else targets = [".next", ".next-dev"];

for (const dir of targets) {
  const full = join(root, dir);
  if (!existsSync(full)) {
    console.log(`skip ${dir} (missing)`);
    continue;
  }
  rmSync(full, { recursive: true, force: true });
  console.log(`removed ${dir}`);
}
