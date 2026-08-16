/**
 * Client-only absolute URLs for Clerk OAuth (built from window.location.origin).
 */
import { routes } from "@/lib/routes";

function origin(): string {
  if (typeof window === "undefined") {
    throw new Error("auth-urls helpers are client-only");
  }
  return window.location.origin;
}

export function ssoCallbackAbsoluteUrl(
  role: string,
  intent: "login" | "register" = "login",
): string {
  const q = new URLSearchParams({ role, intent });
  return `${origin()}${routes.auth.ssoCallback}?${q.toString()}`;
}

export function authContinueAbsoluteUrl(role?: string | null): string {
  if (!role) return `${origin()}${routes.auth.continue}`;
  const q = new URLSearchParams({ role });
  return `${origin()}${routes.auth.continue}?${q.toString()}`;
}
