/**
 * Full DB sync via Drizzle ORM.
 */
import { config } from "dotenv";
import { count, sql } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { storeProducts, users } from "../src/lib/db/schema";
import { STORE_CATALOG } from "../src/data/store-catalog";

config({ path: ".env.local" });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL missing in env/.env.local");
    process.exit(1);
  }

  const client = neon(url);
  const db = drizzle(client, {
    schema: { storeProducts, users },
  });

  console.log("1/3 Ensuring roadmap_assessment_attempts table...");
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS roadmap_assessment_attempts (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      user_id uuid NOT NULL REFERENCES users(id) ON DELETE cascade,
      roadmap_id uuid NOT NULL REFERENCES roadmaps(id) ON DELETE cascade,
      node_id text NOT NULL,
      type text NOT NULL,
      passed boolean DEFAULT false NOT NULL,
      score integer DEFAULT 0 NOT NULL,
      violations jsonb DEFAULT '[]'::jsonb NOT NULL,
      answers jsonb DEFAULT '{}'::jsonb NOT NULL,
      code text,
      created_at timestamptz DEFAULT now() NOT NULL
    )
  `);
  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS idx_assessment_attempts_user_node
    ON roadmap_assessment_attempts (user_id, roadmap_id, node_id)
  `);

  console.log("2/3 Dropping legacy onboarding table (if present)...");
  await db.execute(sql`DROP TABLE IF EXISTS onboarding CASCADE`);

  console.log("3/3 Seeding store products...");
  for (let i = 0; i < STORE_CATALOG.length; i++) {
    const p = STORE_CATALOG[i];
    await db
      .insert(storeProducts)
      .values({
        id: p.id,
        title: p.title,
        category: p.category,
        price: p.price,
        icon: p.icon,
        imageUrl: p.image,
        description: p.desc,
        meta: p.meta,
        color: p.col,
        included: p.included,
        sortOrder: i,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: storeProducts.id,
        set: {
          title: p.title,
          category: p.category,
          price: p.price,
          icon: p.icon,
          imageUrl: p.image,
          description: p.desc,
          meta: p.meta,
          color: p.col,
          included: p.included,
          sortOrder: i,
          isActive: true,
        },
      });
  }

  const tables = (await client`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `) as Array<{ table_name: string }>;

  const [userCount] = await db.select({ value: count() }).from(users);
  const [productCount] = await db.select({ value: count() }).from(storeProducts);
  const names = tables.map((t) => t.table_name);

  console.log("DB sync complete.");
  console.log(`Tables: ${names.join(", ")}`);
  console.log(`Counts — users: ${userCount.value}, products: ${productCount.value}`);
  console.log(
    names.includes("roadmap_assessment_attempts")
      ? "roadmap_assessment_attempts ready"
      : "WARNING: assessment table missing",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
