"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-xs font-bold tracking-[0.08em] text-[var(--purple)]">PATHED</p>
      <h1 className="font-[family-name:var(--font-sans)] text-2xl font-extrabold tracking-tight text-[var(--text-main)]">
        Something went wrong
      </h1>
      <p className="max-w-md text-sm text-[var(--text-muted)]">
        We hit an unexpected problem loading this page.
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-[var(--purple)] px-4 py-2.5 text-sm font-bold text-white"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-xl border border-[var(--border-light)] px-4 py-2.5 text-sm font-bold text-[var(--text-main)]"
        >
          Go home
        </a>
      </div>
      {error.digest ? (
        <p className="text-xs text-[var(--text-light)]">Ref: {error.digest}</p>
      ) : null}
    </div>
  );
}
