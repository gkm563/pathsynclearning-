/**
 * Upsert the in-repo problem bank into `problems`.
 * Run: npm run db:seed:problems
 */
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { listCatalog } from "../src/lib/challenges/catalog";
import { problems } from "../src/lib/db/schema";

config({ path: ".env.local" });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL missing");
    process.exit(1);
  }
  const db = drizzle(neon(url), { schema: { problems } });
  const catalog = listCatalog();
  let upserted = 0;
  for (const q of catalog) {
    const row = {
      slug: q.slug,
      number: q.number,
      title: q.title,
      kind: q.type,
      difficulty: q.difficulty,
      statementMd: q.prompt,
      examplesJson: q.coding?.examples || [],
      constraintsMd: "",
      topics: q.topics,
      companyTags: q.companyTags,
      careerTags: q.careerTags,
      xp: q.xp,
      coins: q.coins,
      estMinutes: q.estMinutes,
      icon: q.icon,
      category: q.category,
      isPublished: true,
      weeklyEligible: Boolean(q.weeklyBossEligible),
      monthlyEligible: Boolean(q.monthlyEligible),
      legacyId: q.id !== q.slug ? q.id : null,
      codingHarness: q.coding || null,
      mcqItems: q.questions || null,
      designRubric: q.design || null,
      projectSpec: q.project || null,
      hints: q.hints,
      solution: q.solution || null,
      extras: {},
      updatedAt: new Date(),
    };
    const existing = await db
      .select({ id: problems.id })
      .from(problems)
      .where(eq(problems.slug, q.slug))
      .limit(1);
    if (existing[0]) {
      await db.update(problems).set(row).where(eq(problems.id, existing[0].id));
    } else {
      await db.insert(problems).values(row);
    }
    upserted += 1;
  }
  console.log(`Seeded ${upserted} problems.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
