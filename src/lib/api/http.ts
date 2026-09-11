import { ZodError, type ZodType } from "zod";
import { AppError, type ErrorCode } from "@/lib/api/errors";
import { rejectImmutableStudentIdentityFields } from "@/lib/identity/student-registration-id";
import { logger } from "@/lib/logger";

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: {
    code: ErrorCode | string;
    message: string;
    details?: unknown;
  };
};

export function ok<T>(data: T, status = 200) {
  return Response.json({ success: true, data } satisfies ApiSuccess<T>, {
    status,
  });
}

export function fail(
  code: ErrorCode | string,
  message: string,
  status: number,
  details?: unknown,
) {
  const body: ApiFailure = {
    success: false,
    error: details === undefined ? { code, message } : { code, message, details },
  };
  return Response.json(body, { status });
}

export async function parseJson<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw AppError.badRequest("Invalid JSON body");
  }

  rejectImmutableStudentIdentityFields(raw);

  try {
    return schema.parse(raw);
  } catch (err) {
    if (err instanceof ZodError) {
      throw AppError.validation("Validation failed", err.flatten());
    }
    throw err;
  }
}

function normalizeError(error: unknown): AppError | null {
  if (error instanceof AppError) return error;
  if (error instanceof ZodError) {
    return AppError.validation("Validation failed", error.flatten());
  }
  if (error instanceof Error && error.message === "UNAUTHORIZED") {
    return AppError.unauthorized();
  }
  return null;
}

export function toErrorResponse(error: unknown) {
  const known = normalizeError(error);
  if (known) {
    return fail(known.code, known.message, known.status, known.details);
  }

  logger.error("Unhandled API error", {
    message: error instanceof Error ? error.message : String(error),
  });

  return fail("INTERNAL", "Something went wrong", 500);
}

/**
 * Legacy-compatible helpers used by existing route handlers during migration.
 * Prefer `ok` / `toErrorResponse` for new code.
 */
export function jsonResponse(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function errorResponse(error: unknown, fallback = "Server error") {
  const known = normalizeError(error);
  if (known) {
    return Response.json(
      {
        error: known.message,
        code: known.code,
        ...(known.details !== undefined ? { details: known.details } : {}),
      },
      { status: known.status },
    );
  }
  logger.error("API error", {
    message: error instanceof Error ? error.message : fallback,
  });
  return Response.json({ error: fallback, code: "INTERNAL" }, { status: 500 });
}
