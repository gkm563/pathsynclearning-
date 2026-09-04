/**
 * Smoke-test Memory Lane CRUD against Neon (uses a throwaway user id if present).
 */
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";

config({ path: ".env.local" });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing");
  const db = drizzle(neon(url), { schema });

  const [user] = await db.select({ id: schema.users.id }).from(schema.users).limit(1);
  if (!user) {
    console.log("No users in DB — skipping auth-scoped CRUD (tables verified earlier).");
    process.exit(0);
  }

  const userId = user.id;
  console.log("Using user", userId);

  const [note] = await db
    .insert(schema.notes)
    .values({
      userId,
      title: "Memory Lane smoke test",
      content: "Temporary note for migration verification.",
      visibility: "private",
      sourceType: "career",
      sourceId: "smoke_test",
    })
    .returning();
  console.log("Inserted note", note.id);

  const [memory] = await db
    .insert(schema.memories)
    .values({
      userId,
      type: "PERSONAL_NOTE",
      title: note.title,
      description: note.content,
      sourceType: "note",
      sourceId: note.id,
      visibility: "private",
      metadata: { smoke: true },
    })
    .returning();
  console.log("Inserted memory", memory.id);

  await db
    .update(schema.notes)
    .set({ content: "Updated smoke note", updatedAt: new Date() })
    .where(eq(schema.notes.id, note.id));
  console.log("Updated note");

  const [read] = await db
    .select()
    .from(schema.memories)
    .where(eq(schema.memories.id, memory.id))
    .limit(1);
  console.log("Read memory title:", read?.title);

  await db.delete(schema.memories).where(eq(schema.memories.id, memory.id));
  await db.delete(schema.notes).where(eq(schema.notes.id, note.id));
  console.log("Deleted smoke rows — OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
