import "server-only";
import { AppError } from "@/lib/api/errors";

const hits = new Map<string, number[]>();

function assertWindow(key: string, max: number, windowMs: number, message: string) {
  const now = Date.now();
  const prev = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (prev.length >= max) throw AppError.rateLimit(message);
  prev.push(now);
  hits.set(key, prev);
}

export function assertInterviewStartLimit(userId: string) {
  assertWindow(
    `start:${userId}`,
    8,
    60 * 60 * 1000,
    "Interview limit reached. Try again in a bit.",
  );
}

export function assertInterviewTurnLimit(userId: string) {
  assertWindow(
    `turn:${userId}`,
    30,
    60_000,
    "Too many interview replies. Pause a few seconds.",
  );
}
