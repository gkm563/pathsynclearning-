import { AppError } from "@/lib/api/errors";

/** Public lifetime identity. Distinct from `users.id` (internal) and Clerk id. */
export const STUDENT_REGISTRATION_ID_PREFIX = "PED";

/** Random public form: PED-A3F1-9C20-B7E4 (no sequence, no headcount). */
export const STUDENT_REGISTRATION_ID_PATTERN =
  /^PED-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/;

/** Legacy sequential form kept only so old rows still parse during migration. */
const LEGACY_SEQUENTIAL_ID_PATTERN = /^PED-\d{4}-\d{6,}$/;

export const IMMUTABLE_STUDENT_IDENTITY_KEYS = [
  "student_registration_id",
  "studentRegistrationId",
  "registration_id",
  "registrationId",
] as const;

export type IssuedStudentRegistration = {
  registrationId: string;
  userId: string | null;
};

export function generateStudentRegistrationId(
  random: () => Uint8Array = defaultRandomBytes,
): string {
  const bytes = random();
  if (bytes.length < 6) {
    throw new Error("Student ID needs 6 random bytes");
  }
  const hex = [...bytes.slice(0, 6)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  return `${STUDENT_REGISTRATION_ID_PREFIX}-${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}`;
}

function defaultRandomBytes(): Uint8Array {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function isStudentRegistrationId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    (STUDENT_REGISTRATION_ID_PATTERN.test(value) ||
      LEGACY_SEQUENTIAL_ID_PATTERN.test(value))
  );
}

export function rejectImmutableStudentIdentityFields(body: unknown): void {
  if (!body || typeof body !== "object" || Array.isArray(body)) return;
  const keys = Object.keys(body);
  const blocked = keys.filter((key) =>
    (IMMUTABLE_STUDENT_IDENTITY_KEYS as readonly string[]).includes(key),
  );
  if (blocked.length > 0) {
    throw new AppError(
      "FORBIDDEN",
      "Student ID is a lifetime identity and cannot be changed",
      { fields: blocked },
    );
  }
}

/** Drop immutable identity keys from an untrusted patch. Never copies them through. */
export function sanitizeUserUpdatePatch<T extends Record<string, unknown>>(
  patch: T,
): Omit<T, (typeof IMMUTABLE_STUDENT_IDENTITY_KEYS)[number]> {
  const next = { ...patch };
  for (const key of IMMUTABLE_STUDENT_IDENTITY_KEYS) {
    delete next[key];
  }
  return next;
}

export function preserveStudentRegistrationId<T extends { studentRegistrationId?: string | null }>(
  existing: string | null | undefined,
  incoming: T,
): string | null {
  if (existing) return existing;
  return incoming.studentRegistrationId ?? null;
}

/**
 * In-memory model of the DB allocator: unique random IDs, first assignment wins.
 * Account deletion removes the ID.
 */
export function createStudentRegistrationAllocator(opts?: {
  random?: () => Uint8Array;
}) {
  const issued = new Map<string, IssuedStudentRegistration>();
  const byUser = new Map<string, string>();
  let nonce = 0;

  function nextRandom() {
    if (opts?.random) return opts.random();
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    bytes[0] = (bytes[0] + nonce) & 0xff;
    nonce += 1;
    return bytes;
  }

  function assign(userId: string, assignOpts?: { role?: string; at?: Date }) {
    const role = assignOpts?.role ?? "student";
    if (role !== "student") {
      return byUser.get(userId) ?? null;
    }
    const existing = byUser.get(userId);
    if (existing) return existing;

    let registrationId = generateStudentRegistrationId(nextRandom);
    let spins = 0;
    while (issued.has(registrationId)) {
      spins += 1;
      if (spins > 24) throw new Error("Duplicate Student ID");
      registrationId = generateStudentRegistrationId(nextRandom);
    }

    issued.set(registrationId, { registrationId, userId });
    byUser.set(userId, registrationId);
    return registrationId;
  }

  function updateProfile(
    userId: string,
    _patch: Record<string, unknown>,
  ): string | null {
    return byUser.get(userId) ?? null;
  }

  function deactivate(userId: string) {
    return byUser.get(userId) ?? null;
  }

  function deleteAccount(userId: string) {
    const id = byUser.get(userId);
    if (!id) return null;
    issued.delete(id);
    byUser.delete(userId);
    return id;
  }

  function recoverAsNewAccount(newUserId: string, at?: Date) {
    return assign(newUserId, { role: "student", at });
  }

  function isIssued(registrationId: string) {
    return issued.has(registrationId);
  }

  function ownerOf(registrationId: string) {
    return issued.get(registrationId)?.userId ?? null;
  }

  function backfill(
    students: Array<{ id: string; createdAt: Date; role?: string }>,
  ) {
    const ordered = [...students].sort((a, b) => {
      const t = a.createdAt.getTime() - b.createdAt.getTime();
      if (t !== 0) return t;
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    });
    return ordered.map((student) => ({
      userId: student.id,
      registrationId: assign(student.id, {
        role: student.role ?? "student",
        at: student.createdAt,
      }),
    }));
  }

  return {
    assign,
    updateProfile,
    deactivate,
    deleteAccount,
    recoverAsNewAccount,
    isIssued,
    ownerOf,
    backfill,
    snapshot: () => ({
      issued: [...issued.values()],
      byUser: Object.fromEntries(byUser),
    }),
  };
}
