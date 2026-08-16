import Link from "next/link";
import { routes } from "@/lib/routes";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg-main)] px-6 text-center">
      <p className="font-mono text-sm font-semibold tracking-wide text-[#6c63ff]">
        404
      </p>
      <h1 className="font-display text-3xl font-extrabold text-[var(--text-main)]">
        Page not found
      </h1>
      <p className="max-w-md font-sans text-[15px] text-[var(--text-muted)]">
        That route does not exist or was moved. Head home or continue to your
        workspace.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={routes.home}
          className="rounded-xl bg-[var(--bg-inverse)] px-5 py-2.5 font-display text-sm font-bold text-[var(--text-inverse)] no-underline"
        >
          Home
        </Link>
        <Link
          href={routes.auth.continue}
          className="rounded-xl border border-[var(--border-light)] bg-[var(--bg-card)] px-5 py-2.5 font-display text-sm font-bold text-[var(--text-main)] no-underline"
        >
          My workspace
        </Link>
      </div>
    </main>
  );
}
