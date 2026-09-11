import "server-only";
import { AppError } from "@/lib/api/errors";

const windowMs = 60_000;
const maxPerWindow = 20;
const hits = new Map<string, number[]>();

export function assertCopilotRateLimit(userId: string) {
  const now = Date.now();
  const prev = (hits.get(userId) || []).filter((t) => now - t < windowMs);
  if (prev.length >= maxPerWindow) {
    throw AppError.rateLimit("Too many Copilot requests. Try again in a minute.");
  }
  prev.push(now);
  hits.set(userId, prev);
}
