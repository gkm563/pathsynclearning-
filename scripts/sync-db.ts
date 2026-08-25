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

  console.log("1/2 Dropping legacy onboarding table (if present)...");
  await db.execute(sql`DROP TABLE IF EXISTS onboarding CASCADE`);

  console.log("2/2 Seeding store products...");
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
    names.includes("onboarding")
      ? "WARNING: onboarding table still present"
      : "onboarding table removed",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
