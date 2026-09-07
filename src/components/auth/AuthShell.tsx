import type { ReactNode } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/ui/BrandMark";
import { cn } from "@/lib/cn";
import type { AuthRole } from "./roles";

/**
 * Two-column frame shared by sign-in and sign-up.
 *
 * The narrative panel is decoration: it is hidden below `lg` so phones get a
 * single, focused form column instead of a scroll marathon. The form column is
 * always the first thing in the DOM order on small screens.
 */
export function AuthShell({
  role,
  eyebrow,
  heading,
  children,
}: {
  role: AuthRole;
  eyebrow: string;
  heading: ReactNode;
  children: ReactNode;
}) {
  const RoleIcon = role.icon;

  return (
    <div className="grid min-h-dvh grid-cols-1 bg-canvas lg:grid-cols-[minmax(0,1fr)_minmax(0,560px)] xl:grid-cols-[minmax(0,1fr)_minmax(0,620px)]">
      {/* Narrative panel — desktop only. */}
      <aside className="relative hidden min-w-0 flex-col justify-between overflow-hidden bg-sunken px-10 py-10 lg:flex xl:px-14">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top_left,color-mix(in_srgb,var(--primary)_10%,transparent),transparent_65%)]"
        />

        <div className="relative">
          <BrandMark href="/" size="lg" />
        </div>

        <div className="relative max-w-md">
          <p className="type-overline mb-3 text-accent">{eyebrow}</p>
          <h1 className="type-h1 m-0 text-balance text-ink">{heading}</h1>
          <p className="type-body-lg mt-4 mb-0 text-muted">{role.tagline}</p>

          <ul className="mt-9 flex list-none flex-col gap-3 p-0">
            {role.highlights.map((item) => (
              <li
                key={item.title}
                className="flex items-start gap-3.5 rounded-[var(--radius-lg)] border border-line bg-surface p-4 shadow-[var(--shadow-xs)]"
              >
                <span
                  aria-hidden
                  className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-primary-soft text-primary"
                >
                  <Check size={16} strokeWidth={2.5} />
                </span>
                <span className="min-w-0">
                  <span className="type-body block font-semibold text-ink">
                    {item.title}
                  </span>
                  <span className="type-caption block text-muted">
                    {item.detail}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="type-caption relative m-0 flex items-center gap-2 text-faint">
          <ShieldCheck size={15} aria-hidden />
          256-bit encrypted platform authentication
        </p>
      </aside>

      {/* Form column. */}
      <main className="flex min-w-0 flex-col justify-center px-5 py-8 sm:px-8 sm:py-12 lg:border-l lg:border-line lg:bg-surface lg:px-12">
        <div className="mx-auto w-full max-w-[440px]">
          <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
            <BrandMark href="/" size="md" />
            <span
              aria-hidden
              className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-primary-soft text-primary"
            >
              <RoleIcon size={18} />
            </span>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

/**
 * Divider used between the credential form and the OAuth providers.
 */
export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="my-6 flex items-center gap-3.5">
      <span className="h-px min-w-0 flex-1 bg-line" />
      <span className="type-caption shrink-0 font-medium tracking-wide text-faint uppercase">
        {label}
      </span>
      <span className="h-px min-w-0 flex-1 bg-line" />
    </div>
  );
}

/**
 * Slim determinate bar reflecting multi-step auth progress (password → MFA →
 * session finalize). Renders nothing at 0 so it never occupies layout space
 * before the user submits.
 */
export function AuthProgress({ value }: { value: number }) {
  if (value <= 0) return null;
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-label="Sign-in progress"
      className="mb-5 h-1 w-full overflow-hidden rounded-full bg-sunken"
    >
      <span
        className={cn(
          "block h-full rounded-full bg-primary",
          "transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-standard)]",
          "motion-reduce:transition-none",
        )}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
