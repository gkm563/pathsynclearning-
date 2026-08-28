import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import {
  projectEvidence,
  projectRuns,
  projectStepProgress,
} from "@/lib/db/schema";
import type {
  ProjectEvidenceInput,
  ProjectSource,
} from "@/lib/projects/types";

export async function getOrCreateProjectRun(opts: {
  userId: string;
  source: ProjectSource;
  refId: string;
}) {
  const db = getDb();
  const [existing] = await db
    .select()
    .from(projectRuns)
    .where(
      and(
        eq(projectRuns.userId, opts.userId),
        eq(projectRuns.source, opts.source),
        eq(projectRuns.refId, opts.refId),
      ),
    )
    .orderBy(desc(projectRuns.updatedAt))
    .limit(1);

  if (existing) {
    // Resume latest run (including failed) — only create fresh if none
    return existing;
  }

  const [created] = await db
    .insert(projectRuns)
    .values({
      userId: opts.userId,
      source: opts.source,
      refId: opts.refId,
      status: "in_progress",
    })
    .returning();
  return created;
}

export async function loadRunBundle(runId: string) {
  const db = getDb();
  const steps = await db
    .select()
    .from(projectStepProgress)
    .where(eq(projectStepProgress.runId, runId));
  const evidence = await db
    .select()
    .from(projectEvidence)
    .where(eq(projectEvidence.runId, runId));
  return { steps, evidence };
}

export async function saveProjectProgress(opts: {
  runId: string;
  stepsDone: string[];
  evidence?: ProjectEvidenceInput[];
  repoUrl?: string;
  reflection?: string;
}) {
  const db = getDb();
  const now = new Date();

  for (const stepId of opts.stepsDone) {
    const [row] = await db
      .select()
      .from(projectStepProgress)
      .where(
        and(
          eq(projectStepProgress.runId, opts.runId),
          eq(projectStepProgress.stepId, stepId),
        ),
      )
      .limit(1);
    if (row) {
      await db
        .update(projectStepProgress)
        .set({ done: true, doneAt: now, updatedAt: now })
        .where(eq(projectStepProgress.id, row.id));
    } else {
      await db.insert(projectStepProgress).values({
        runId: opts.runId,
        stepId,
        done: true,
        doneAt: now,
      });
    }
  }

  // Mark unchecked steps as not done if we sync full list — only upsert done ones
  if (opts.evidence) {
    await db.delete(projectEvidence).where(eq(projectEvidence.runId, opts.runId));
    for (const e of opts.evidence) {
      await db.insert(projectEvidence).values({
        runId: opts.runId,
        stepId: e.stepId || null,
        kind: e.kind,
        url: e.url || null,
        text: e.text || null,
      });
    }
  }

  await db
    .update(projectRuns)
    .set({
      repoUrl: opts.repoUrl ?? undefined,
      reflection: opts.reflection ?? undefined,
      updatedAt: now,
    })
    .where(eq(projectRuns.id, opts.runId));
}
