import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { pathToFileURL } from "url";
import { neon } from "@neondatabase/serverless";

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    let val = m[2].trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnvLocal();

async function runSqlFile(sql, filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const statements = [];
  let buf = "";
  let inDollar = false;
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.startsWith("--")) continue;
    const dollars = (trimmed.match(/\$\$/g) || []).length;
    if (dollars % 2 === 1) inDollar = !inDollar;
    buf += `${line}\n`;
    if (!inDollar && trimmed.endsWith(";")) {
      const stmt = buf.trim();
      if (stmt.length > 1) statements.push(stmt);
      buf = "";
    }
  }
  if (buf.trim()) statements.push(buf.trim());

  console.log(`Migrating ${statements.length} statements from ${path.basename(filePath)}`);
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await sql.query(stmt);
      process.stdout.write(".");
    } catch (err) {
      console.error(`\nFailed statement ${i + 1}:\n${stmt.slice(0, 240)}`);
      throw err;
    }
  }
  console.log("\nSchema OK");
}

async function seed(sql) {
  const catalogPath = path.join(process.cwd(), "src", "data", "store-catalog.ts");
  const catalogSrc = fs.readFileSync(catalogPath, "utf8");
  const arrayLiteral = catalogSrc.slice(
    catalogSrc.indexOf("= [") + 2,
    catalogSrc.lastIndexOf("];") + 1,
  );
  // eslint-disable-next-line no-new-func
  const products = Function(`"use strict"; return (${arrayLiteral});`)();

  console.log(`Seeding ${products.length} store products...`);
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    await sql`
      INSERT INTO store_products (
        id, title, category, price, icon, image_url, description, meta, color, included, sort_order, is_active
      ) VALUES (
        ${p.id}, ${p.title}, ${p.category}, ${p.price}, ${p.icon}, ${p.image},
        ${p.desc}, ${p.meta}, ${p.col}, ${JSON.stringify(p.included)}::jsonb, ${i}, TRUE
      )
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        category = EXCLUDED.category,
        price = EXCLUDED.price,
        icon = EXCLUDED.icon,
        image_url = EXCLUDED.image_url,
        description = EXCLUDED.description,
        meta = EXCLUDED.meta,
        color = EXCLUDED.color,
        included = EXCLUDED.included,
        sort_order = EXCLUDED.sort_order,
        is_active = TRUE
    `;
  }

  const quotesPath = path.join(process.cwd(), "src", "data", "quotes_dataset.json");
  const quotes = JSON.parse(fs.readFileSync(quotesPath, "utf8"));
  const existingQuotes = await sql`SELECT COUNT(*)::int AS c FROM quotes`;
  if ((existingQuotes[0]?.c || 0) === 0) {
    console.log(`Seeding ${quotes.length} quotes...`);
    for (const q of quotes) {
      await sql`
        INSERT INTO quotes (phase, text, author)
        VALUES (${q.phase}, ${q.text}, ${q.author})
      `;
    }
  } else {
    console.log("Quotes already seeded, skipping.");
  }

  console.log("Seed complete.");
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL missing in env/.env.local");
    process.exit(1);
  }
  const sql = neon(url);
  await runSqlFile(sql, path.join(process.cwd(), "src", "lib", "db", "schema.sql"));
  await seed(sql);

  const tables = await sql`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' ORDER BY table_name
  `;
  console.log(
    "Tables:",
    tables.map((t) => t.table_name).join(", "),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
