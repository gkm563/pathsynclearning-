import "server-only";

import { eq } from "drizzle-orm";
import { computeCri } from "@/lib/cri/compute";
import { CRI_FORMULA_ID } from "@/lib/cri/formula";
import { gatherCriFacts } from "@/lib/cri/gather";
import { criInteger } from "@/lib/cri/milli";
import type { CriTrigger } from "@/lib/cri/types";
import { getDb } from "@/lib/db/client";
import { criEvidence, criSnapshots, profiles } from "@/lib/db/schema";

export type CriRecomputeResult = {
  snapshotId: string;
  formulaId: string;
  criMilli: number;
  cri: number;
  targetRole: string | null;
};

export async function recomputeCri(
  userId: string,
  trigger: CriTrigger,
  nowMs = Date.now(),
): Promise<CriRecomputeResult> {
  const facts = await gatherCriFacts(userId);
  const computed = computeCri(facts, nowMs);
  const db = getDb();

  const [snapshot] = await db
    .insert(criSnapshots)
    .values({
      userId,
      formulaId: computed.formulaId,
      targetRole: computed.targetRole,
      criMilli: computed.criMilli,
      components: computed.components,
      trigger,
      computedAt: new Date(nowMs),
    })
    .returning({ id: criSnapshots.id });

  if (computed.evidence.length) {
    await db.insert(criEvidence).values(
      computed.evidence.map((row) => ({
        snapshotId: snapshot.id,
        component: row.component,
        sourceType: row.sourceType,
        sourceId: row.sourceId,
        metric: row.metric,
        valueMilli: row.valueMilli,
        weightMilli: row.weightMilli,
      })),
    );
  }

  const cri = criInteger(computed.criMilli);
  await db
    .update(profiles)
    .set({
      cri,
      criMilli: computed.criMilli,
      criFormula: CRI_FORMULA_ID,
      criSnapshotId: snapshot.id,
      updatedAt: new Date(nowMs),
    })
    .where(eq(profiles.userId, userId));

  return {
    snapshotId: snapshot.id,
    formulaId: computed.formulaId,
    criMilli: computed.criMilli,
    cri,
    targetRole: computed.targetRole,
  };
}

export async function recomputeCriSafe(userId: string, trigger: CriTrigger) {
  try {
    return await recomputeCri(userId, trigger);
  } catch {
    return null;
  }
}
