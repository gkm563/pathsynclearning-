import "server-only";
import { and, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { isStudentRegistrationId } from "@/lib/identity/student-registration-id";

function readIssuedId(result: unknown): string | null {
  const rows = Array.isArray(result)
    ? result
    : result && typeof result === "object" && "rows" in result
      ? (result as { rows?: unknown[] }).rows
      : [];
  const row = rows?.[0];
  if (!row || typeof row !== "object") return null;
  const record = row as Record<string, unknown>;
  const value =
    record.registration_id ??
    record.issue_student_registration_id ??
    Object.values(record)[0];
  return typeof value === "string" && isStudentRegistrationId(value)
    ? value
    : null;
}

/**
 * Issue (or return) the lifetime Student Registration ID for a user.
 * Idempotent: the Postgres function never overwrites an existing assignment.
 */
export async function issueStudentRegistrationId(
  userId: string,
): Promise<string | null> {
  const db = getDb();
  const result = await db.execute(
    sql`SELECT issue_student_registration_id(${userId}::uuid) AS registration_id`,
  );
  const issued = readIssuedId(result);
  if (!issued) return null;

  await db
    .update(users)
    .set({
      studentRegistrationId: issued,
      updatedAt: new Date(),
    })
    .where(and(eq(users.id, userId), isNull(users.studentRegistrationId)));

  return issued;
}
