import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/lib/env";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

let db: Db | null = null;

/** Drizzle client over Neon HTTP (serverless-friendly). */
export function getDb() {
  if (!db) {
    db = drizzle(neon(env.databaseUrl), { schema });
  }
  return db;
}

export type Database = ReturnType<typeof getDb>;
