import { desc, eq } from "drizzle-orm";
import { AppError } from "@/lib/api/errors";
import { errorResponse, jsonResponse } from "@/lib/api/http";
import { CRI_DISCLAIMER, CRI_FORMULA_ID } from "@/lib/cri/formula";
import { criInteger, formatCri } from "@/lib/cri/milli";
import { recomputeCri } from "@/lib/cri/persist";
import { getDb } from "@/lib/db/client";
import { criSnapshots, profiles } from "@/lib/db/schema";
import { requireDbUser } from "@/lib/db/users";

export async function GET() {
  try {
    const user = await requireDbUser();
    if (user.role !== "student") throw AppError.forbidden();
    const db = getDb();

    const [profile] = await db
      .select({
        cri: profiles.cri,
        criMilli: profiles.criMilli,
        criFormula: profiles.criFormula,
        criSnapshotId: profiles.criSnapshotId,
      })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    let snapshot = profile?.criSnapshotId
      ? (
          await db
            .select()
            .from(criSnapshots)
            .where(eq(criSnapshots.id, profile.criSnapshotId))
            .limit(1)
        )[0]
      : (
          await db
            .select()
            .from(criSnapshots)
            .where(eq(criSnapshots.userId, user.id))
            .orderBy(desc(criSnapshots.computedAt))
            .limit(1)
        )[0];

    const staleInteger =
      Boolean(profile) &&
      criInteger(profile.criMilli ?? 0) !== (profile.cri ?? 0);

    if (!snapshot || staleInteger) {
      await recomputeCri(user.id, "manual");
      const [fresh] = await db
        .select()
        .from(criSnapshots)
        .where(eq(criSnapshots.userId, user.id))
        .orderBy(desc(criSnapshots.computedAt))
        .limit(1);
      snapshot = fresh;
    }

    const [synced] = await db
      .select({
        cri: profiles.cri,
        criMilli: profiles.criMilli,
        criFormula: profiles.criFormula,
      })
      .from(profiles)
      .where(eq(profiles.userId, user.id))
      .limit(1);

    const criMilli = snapshot?.criMilli ?? synced?.criMilli ?? 0;

    return jsonResponse({
      formulaId: snapshot?.formulaId ?? synced?.criFormula ?? CRI_FORMULA_ID,
      criMilli,
      cri: formatCri(criMilli),
      criInteger: synced?.cri ?? criInteger(criMilli),
      targetRole: snapshot?.targetRole ?? null,
      computedAt: snapshot?.computedAt ?? null,
      trigger: snapshot?.trigger ?? null,
      snapshotId: snapshot?.id ?? null,
      components: snapshot?.components ?? [],
      disclaimer: CRI_DISCLAIMER,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
