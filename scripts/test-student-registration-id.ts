/**
 * Student ID — lifetime identity tests (no live DB required).
 * Run: npm run test:student-id
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { AppError } from "../src/lib/api/errors";
import {
  STUDENT_REGISTRATION_ID_PATTERN,
  createStudentRegistrationAllocator,
  generateStudentRegistrationId,
  isStudentRegistrationId,
  preserveStudentRegistrationId,
  rejectImmutableStudentIdentityFields,
  sanitizeUserUpdatePatch,
} from "../src/lib/identity/student-registration-id";
import {
  meUpsertSchema,
  profileUpdateSchema,
} from "../src/lib/validation/schemas";

function section(name: string) {
  console.log(`\n✓ ${name}`);
}

section("ID generation is random (does not encode headcount)");
{
  const a = generateStudentRegistrationId(() => Uint8Array.from([0xa3, 0xf1, 0x9c, 0x20, 0xb7, 0xe4]));
  const b = generateStudentRegistrationId(() => Uint8Array.from([0x11, 0x22, 0x33, 0x44, 0x55, 0x66]));
  assert.equal(a, "PED-A3F1-9C20-B7E4");
  assert.equal(b, "PED-1122-3344-5566");
  assert.notEqual(a, b);
  assert.equal(STUDENT_REGISTRATION_ID_PATTERN.test(a), true);
  assert.equal(isStudentRegistrationId(a), true);
  assert.equal(isStudentRegistrationId("PED-2026-000001"), true);
  assert.equal(isStudentRegistrationId("ped-a3f1-9c20-b7e4"), false);
  assert.equal(isStudentRegistrationId("user_abc"), false);
}

section("New student registration");
{
  const ids = createStudentRegistrationAllocator();
  const first = ids.assign("user-a", { role: "student" });
  assert.equal(typeof first, "string");
  assert.equal(STUDENT_REGISTRATION_ID_PATTERN.test(first!), true);
  assert.equal(ids.assign("user-a", { role: "student" }), first);
}

section("Teachers do not receive a student ID");
{
  const ids = createStudentRegistrationAllocator();
  assert.equal(ids.assign("teacher-1", { role: "teacher" }), null);
}

section("Concurrent registrations stay unique and non-sequential");
{
  const ids = createStudentRegistrationAllocator();
  const granted = Array.from({ length: 80 }, (_, i) =>
    ids.assign(`u-${i}`, { role: "student" }),
  );
  const unique = new Set(granted);
  assert.equal(unique.size, 80);
  for (const id of granted) {
    assert.equal(STUDENT_REGISTRATION_ID_PATTERN.test(id!), true);
    assert.equal(/^PED-\d{4}-\d+$/.test(id!), false);
  }
}

section("Duplicate ID prevention");
{
  const ids = createStudentRegistrationAllocator();
  const a = ids.assign("a");
  const b = ids.assign("b");
  assert.notEqual(a, b);
  assert.equal(ids.isIssued(a!), true);
  assert.equal(ids.isIssued(b!), true);
}

section("Profile / name / email / username / course updates preserve the ID");
{
  const ids = createStudentRegistrationAllocator();
  const id = ids.assign("student-1");
  const patches = [
    { fullName: "Ada Lovelace" },
    { email: "ada@example.com" },
    { username: "ada" },
    { phone: "+1 555 0100" },
    { institute: "MIT", branch: "CSE", course: "B.Tech" },
  ];
  for (const patch of patches) {
    assert.equal(ids.updateProfile("student-1", patch), id);
  }
  assert.equal(
    preserveStudentRegistrationId(id, { studentRegistrationId: "PED-FFFF-FFFF-FFFF" }),
    id,
  );
}

section("Account deactivation keeps the ID");
{
  const ids = createStudentRegistrationAllocator();
  const id = ids.assign("student-1");
  assert.equal(ids.deactivate("student-1"), id);
  assert.equal(ids.assign("student-1"), id);
  assert.equal(ids.isIssued(id!), true);
}

section("Account deletion removes the ID; a new account gets a new one");
{
  const ids = createStudentRegistrationAllocator();
  const original = ids.assign("student-1");
  assert.equal(ids.deleteAccount("student-1"), original);
  assert.equal(ids.isIssued(original!), false);
  assert.equal(ids.ownerOf(original!), null);

  const recovered = ids.recoverAsNewAccount("student-1-new");
  assert.notEqual(recovered, original);
  assert.equal(ids.isIssued(original!), false);
  assert.equal(ids.ownerOf(recovered!), "student-1-new");
}

section("Admin / bulk patches cannot overwrite the ID");
{
  const dirty = sanitizeUserUpdatePatch({
    email: "new@example.com",
    studentRegistrationId: "PED-FFFF-FFFF-FFFF",
    student_registration_id: "PED-0000-0000-0001",
    fullName: "Changed",
  });
  assert.equal("studentRegistrationId" in dirty, false);
  assert.equal("student_registration_id" in dirty, false);
  assert.equal(dirty.email, "new@example.com");
  assert.equal(dirty.fullName, "Changed");
}

section("API attempts to modify the ID are rejected");
{
  assert.throws(
    () =>
      rejectImmutableStudentIdentityFields({
        student_registration_id: "PED-AAAA-BBBB-CCCC",
      }),
    (err: unknown) =>
      err instanceof AppError &&
      err.code === "FORBIDDEN" &&
      /lifetime identity/i.test(err.message),
  );

  const profile = profileUpdateSchema.safeParse({
    fullName: "Ada",
    studentRegistrationId: "PED-AAAA-BBBB-CCCC",
  });
  assert.equal(profile.success, false);

  const snake = profileUpdateSchema.safeParse({
    student_registration_id: "PED-AAAA-BBBB-CCCC",
  });
  assert.equal(snake.success, false);

  const me = meUpsertSchema.safeParse({
    role: "student",
    student_registration_id: "PED-AAAA-BBBB-CCCC",
  });
  assert.equal(me.success, false);

  const allowed = profileUpdateSchema.safeParse({
    fullName: "Ada Lovelace",
    username: "ada",
    institute: "MIT",
  });
  assert.equal(allowed.success, true);
}

section("Database migration is uniqueness-safe and random");
{
  const drizzleDir = join(dirname(fileURLToPath(import.meta.url)), "..", "drizzle");
  const sql = readFileSync(join(drizzleDir, "0006_student_registration_id.sql"), "utf8");
  const randomSql = readFileSync(join(drizzleDir, "0008_student_id_random.sql"), "utf8");
  assert.match(sql, /CREATE UNIQUE INDEX IF NOT EXISTS "users_student_registration_id_unique"/);
  assert.match(sql, /generate_student_id/);
  assert.match(sql, /gen_random_uuid/);
  assert.doesNotMatch(sql, /lpad\(seq::text, 6, '0'\)/);
  assert.match(randomSql, /PED-\[0-9\]\{4\}-\[0-9\]\+/);
  assert.match(randomSql, /DROP CONSTRAINT IF EXISTS "issued_student_registration_ids_year_seq"/);
}

section("Existing-student backfill stays unique without sequential numbers");
{
  const ids = createStudentRegistrationAllocator();
  const assigned = ids.backfill([
    { id: "b", createdAt: new Date("2025-02-01T00:00:00.000Z") },
    { id: "a", createdAt: new Date("2025-01-01T00:00:00.000Z") },
    { id: "c", createdAt: new Date("2025-01-01T00:00:00.000Z") },
  ]);
  assert.deepEqual(
    assigned.map((row) => row.userId),
    ["a", "c", "b"],
  );
  assert.equal(new Set(assigned.map((row) => row.registrationId)).size, 3);
  for (const row of assigned) {
    assert.equal(STUDENT_REGISTRATION_ID_PATTERN.test(row.registrationId!), true);
    assert.equal(/^PED-\d{4}-\d+$/.test(row.registrationId!), false);
  }
}

console.log("\nAll Student ID tests passed.");
