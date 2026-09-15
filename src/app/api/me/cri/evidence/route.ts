import { and, desc, eq } from "drizzle-orm";
import { AppError } from "@/lib/api/errors";
import { errorResponse, jsonResponse } from "@/lib/api/http";
import { getDb } from "@/lib/db/client";
import { criEvidence, criSnapshots, profiles } from "@/lib/db/schema";
import { requireDbUser } from "@/lib/db/users";
import { PHASE1_LIVE, PHASE1_RESERVED } from "@/lib/cri/formula";

const COMPONENTS = new Set([...PHASE1_LIVE, ...PHASE1_RESERVED]);

export async function GET(request: Request) {
  try {
    const user = await requireDbUser();
    if (user.role !== "student") throw AppError.forbidden();
    const url = new URL(request.url);
    const component = url.searchParams.get("component") || "";
    if (!COMPONENTS.has(component as never)) {
      throw AppError.badRequest("Unknown CRI component");
    }

    const db = getDb();
    const [profile] = await db
      .select({ criSnapshotId: profiles.criSnapshotId })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    let snapshotId = profile?.criSnapshotId ?? null;
    if (!snapshotId) {
      const [latest] = await db
        .select({ id: criSnapshots.id })
          .from(criSnapshots)
          .where(eq(criSnapshots.userId, user.id))
          .orderBy(desc(criSnapshots.computedAt))
          .limit(1);
      snapshotId = latest?.id ?? null;
    }
    if (!snapshotId) {
      return jsonResponse({ component, evidence: [] });
    }

    const owned = await db
      .select({ id: criSnapshots.id })
      .from(criSnapshots)
      .where(and(eq(criSnapshots.id, snapshotId), eq(criSnapshots.userId, user.id)))
      .limit(1);
    if (!owned[0]) throw AppError.notFound();

    const evidence = await db
      .select()
      .from(criEvidence)
      .where(
        and(eq(criEvidence.snapshotId, snapshotId), eq(criEvidence.component, component)),
      );

    return jsonResponse({
      component,
      evidence: evidence.map((row) => ({
        id: row.id,
        sourceType: row.sourceType,
        sourceId: row.sourceId,
        metric: row.metric,
        valueMilli: row.valueMilli,
        weightMilli: row.weightMilli,
      })),
    });
  } catch (e) {
    return errorResponse(e);
  }
}
