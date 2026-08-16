import { desc, eq } from "drizzle-orm";
import { parseJson, errorResponse, jsonResponse } from "@/lib/api/http";
import { getDb } from "@/lib/db/client";
import { memoryLaneEntries } from "@/lib/db/schema";
import { requireDbUser } from "@/lib/db/users";
import { memoryLaneCreateSchema } from "@/lib/validation/schemas";

export async function GET() {
  try {
    const user = await requireDbUser();
    const db = getDb();
    const rows = await db
      .select({
        id: memoryLaneEntries.id,
        payload: memoryLaneEntries.payload,
        createdAt: memoryLaneEntries.createdAt,
      })
      .from(memoryLaneEntries)
      .where(eq(memoryLaneEntries.userId, user.id))
      .orderBy(desc(memoryLaneEntries.createdAt))
      .limit(200);

    return jsonResponse({
      entries: rows.map((r) => ({
        id: r.id,
        ...(typeof r.payload === "object" && r.payload
          ? r.payload
          : { data: r.payload }),
        createdAt: r.createdAt,
      })),
    });
  } catch (e) {
    return errorResponse(e);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireDbUser();
    const body = await parseJson(request, memoryLaneCreateSchema);
    const db = getDb();
    const inserted = await db
      .insert(memoryLaneEntries)
      .values({
        userId: user.id,
        payload: body.payload,
      })
      .returning({
        id: memoryLaneEntries.id,
        payload: memoryLaneEntries.payload,
        createdAt: memoryLaneEntries.createdAt,
      });

    return jsonResponse({
      entry: {
        id: inserted[0].id,
        payload: inserted[0].payload,
        created_at: inserted[0].createdAt,
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
