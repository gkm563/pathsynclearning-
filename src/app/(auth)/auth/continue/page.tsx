import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { resolvePostAuthPathServer } from "@/lib/auth-routing-server";
import { routes } from "@/lib/routes";
import ContinuePending from "./ContinuePending";

type Props = {
  searchParams: Promise<{ role?: string }>;
};

const RESOLVE_TIMEOUT_MS = 8_000;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("AUTH_CONTINUE_TIMEOUT")),
          ms,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Post-auth router (server-first).
 * If Clerk session cookies are present → upsert DB user and redirect once.
 * If not yet (OAuth race) → client resolves or does a single reload.
 */
export default async function AuthContinuePage({ searchParams }: Props) {
  const params = await searchParams;
  const role = params.role || "student";
  const fallback =
    role === "student" ? routes.onboarding.stage1 : routes.home;

  const { userId } = await auth();

  if (!userId) {
    return <ContinuePending role={role} />;
  }

  let destination: string = fallback;
  try {
    const path = await withTimeout(
      resolvePostAuthPathServer(role),
      RESOLVE_TIMEOUT_MS,
    );
    destination = path === routes.auth.signIn ? fallback : path;
  } catch (e) {
    console.error("auth/continue resolve failed:", e);
  }

  redirect(destination);
}
