export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION"
  | "RATE_LIMIT"
  | "INTERNAL";

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION: 422,
  RATE_LIMIT: 429,
  INTERNAL: 500,
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: unknown;

  constructor(code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.details = details;
  }

  static badRequest(message: string, details?: unknown) {
    return new AppError("BAD_REQUEST", message, details);
  }

  static unauthorized(message = "Unauthorized") {
    return new AppError("UNAUTHORIZED", message);
  }

  static forbidden(message = "Forbidden") {
    return new AppError("FORBIDDEN", message);
  }

  static notFound(message = "Not found") {
    return new AppError("NOT_FOUND", message);
  }

  static conflict(message: string, details?: unknown) {
    return new AppError("CONFLICT", message, details);
  }

  static validation(message: string, details?: unknown) {
    return new AppError("VALIDATION", message, details);
  }

  static rateLimit(message = "Too many requests") {
    return new AppError("RATE_LIMIT", message);
  }
}
