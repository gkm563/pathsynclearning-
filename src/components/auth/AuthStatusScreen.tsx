import { BrandMark } from "@/components/ui/BrandMark";

/**
 * Full-height transitional screen for the OAuth handoff steps
 * (`/sso-callback`, `/auth/continue`).
 *
 * These pages are unavoidably blank — the browser is waiting on Clerk — so the
 * job here is to look intentional rather than broken: brand, a determinate-
 * looking indicator, and the live status message. The message is announced via
 * `aria-live` because it is the only signal a screen-reader user gets that
 * anything is happening.
 */
export function AuthStatusScreen({
  message,
  tone = "pending",
  children,
}: {
  message: string;
  tone?: "pending" | "error";
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-7 bg-canvas px-6 py-12 text-center">
      <BrandMark href="/" size="lg" />

      <div className="flex flex-col items-center gap-4">
        <span
          aria-hidden
          className={
            tone === "error"
              ? "h-9 w-9 rounded-full border-2 border-[var(--error)] border-dashed"
              : "h-9 w-9 animate-spin rounded-full border-2 border-line-strong border-t-[var(--primary)] motion-reduce:animate-none"
          }
        />
        <p
          role="status"
          aria-live="polite"
          className="type-body m-0 max-w-sm text-muted"
        >
          {message}
        </p>
      </div>

      {children}
    </div>
  );
}
