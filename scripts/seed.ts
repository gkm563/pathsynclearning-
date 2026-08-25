/**
 * Seed catalog data via Drizzle ORM (no raw SQL).
 * Run: npm run db:seed
 */
import { config } from "dotenv";
import { count } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { STORE_CATALOG } from "../src/data/store-catalog";
import quotesData from "../src/data/quotes_dataset.json";
import { quotes, storeProducts } from "../src/lib/db/schema";

config({ path: ".env.local" });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL missing in env/.env.local");
    process.exit(1);
  }

  const db = drizzle(neon(url), { schema: { storeProducts, quotes } });

  console.log(`Seeding ${STORE_CATALOG.length} store products...`);
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

  const [{ value: quoteCount }] = await db.select({ value: count() }).from(quotes);
  if (quoteCount === 0) {
    console.log(`Seeding ${quotesData.length} quotes...`);
    for (const q of quotesData as Array<{ phase: string; text: string; author: string }>) {
      await db.insert(quotes).values({
        phase: q.phase,
        text: q.text,
        author: q.author,
      });
    }
  } else {
    console.log("Quotes already seeded, skipping.");
  }

  console.log("Seed complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
