"use client";

import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";

const controlClass =
  "w-full min-h-11 rounded-[var(--radius-md)] border bg-surface px-3.5 py-2.5 text-[15px] text-ink " +
  "transition-[border-color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)] motion-reduce:transition-none " +
  "placeholder:text-faint focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--ring-soft)] " +
  "disabled:cursor-not-allowed disabled:opacity-60";

/**
 * Labelled text input for the auth forms.
 *
 * `invalid` only paints the border — the human-readable reason lives in the
 * single form-level alert, matching the existing one-message-at-a-time
 * validation model.
 */
export function AuthField({
  label,
  hint,
  invalid = false,
  trailing,
  id: idProp,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: ReactNode;
  invalid?: boolean;
  trailing?: ReactNode;
}) {
  const autoId = useId();
  const id = idProp ?? autoId;

  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="type-label text-ink">
          {label}
        </label>
        {hint}
      </div>
      <div className="relative">
        <input
          id={id}
          aria-invalid={invalid || undefined}
          className={cn(
            controlClass,
            invalid
              ? "border-danger focus-visible:border-danger"
              : "border-line-strong focus-visible:border-primary",
            trailing && "pr-11",
            className,
          )}
          {...props}
        />
        {trailing ? (
          <span className="absolute inset-y-0 right-1 flex items-center">
            {trailing}
          </span>
        ) : null}
      </div>
    </div>
  );
}

type Strength = "none" | "weak" | "medium" | "strong";

/**
 * Scores a password for the meter.
 *
 * Thresholds are carried over verbatim from the previous implementation so the
 * feedback a user sees does not change — only how it is presented. This is
 * guidance only; Clerk remains the authority on what it will accept.
 */
export function scorePassword(pwd: string): Strength {
  if (!pwd) return "none";
  if (pwd.length < 6) return "weak";
  const hasLetters = /[a-zA-Z]/.test(pwd);
  const hasNumbers = /[0-9]/.test(pwd);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);
  if (pwd.length >= 8 && hasLetters && hasNumbers && hasSpecial) return "strong";
  const pairs =
    (hasLetters && hasNumbers) ||
    (hasLetters && hasSpecial) ||
    (hasNumbers && hasSpecial);
  if (pwd.length >= 6 && pairs) return "medium";
  return "weak";
}

const STRENGTH_META: Record<
  Exclude<Strength, "none">,
  { label: string; bars: number; bar: string; text: string }
> = {
  weak: {
    label: "Weak password",
    bars: 1,
    bar: "bg-[var(--error)]",
    text: "text-danger",
  },
  medium: {
    label: "Reasonable password",
    bars: 2,
    bar: "bg-[var(--warning)]",
    text: "text-warning",
  },
  strong: {
    label: "Strong password",
    bars: 3,
    bar: "bg-[var(--success)]",
    text: "text-success",
  },
};

/**
 * Password input with a reveal toggle and a strength meter.
 *
 * Replaces the previous colour-coded eye icon, which encoded strength purely in
 * hue — invisible to anyone who can't distinguish red from green, and to screen
 * readers entirely. The meter states it in words.
 */
export function PasswordField({
  label,
  value,
  onValueChange,
  invalid = false,
  showMeter = false,
  hint,
  autoComplete,
  placeholder = "••••••••",
  disabled,
  id: idProp,
}: {
  label: string;
  value: string;
  onValueChange: (next: string) => void;
  invalid?: boolean;
  showMeter?: boolean;
  hint?: ReactNode;
  autoComplete?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}) {
  const [revealed, setRevealed] = useState(false);
  const autoId = useId();
  const id = idProp ?? autoId;
  const strength = scorePassword(value);
  const meta = strength === "none" ? null : STRENGTH_META[strength];

  return (
    <div className="min-w-0">
      <AuthField
        id={id}
        label={label}
        hint={hint}
        invalid={invalid}
        type={revealed ? "text" : "password"}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        trailing={
          <button
            type="button"
            onClick={() => setRevealed((prev) => !prev)}
            aria-label={revealed ? "Hide password" : "Show password"}
            aria-pressed={revealed}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-muted",
              "hover:bg-sunken hover:text-ink",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            )}
          >
            {revealed ? <Eye size={17} /> : <EyeOff size={17} />}
          </button>
        }
      />

      {showMeter && meta ? (
        <div className="mt-2 flex items-center gap-2.5">
          <span className="flex min-w-0 flex-1 gap-1" aria-hidden>
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className={cn(
                  "h-1 flex-1 rounded-full",
                  index < meta.bars ? meta.bar : "bg-line",
                )}
              />
            ))}
          </span>
          <span className={cn("type-caption shrink-0 font-medium", meta.text)}>
            {meta.label}
          </span>
        </div>
      ) : null}
    </div>
  );
}

/**
 * One-time-code input for email/SMS verification steps.
 */
export function CodeField({
  label,
  value,
  onValueChange,
  disabled,
}: {
  label: string;
  value: string;
  onValueChange: (next: string) => void;
  disabled?: boolean;
}) {
  return (
    <AuthField
      label={label}
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      autoFocus
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      placeholder="123456"
      disabled={disabled}
      className="font-mono text-lg tracking-[0.35em]"
    />
  );
}

/**
 * Single form-level error banner.
 *
 * `role="alert"` makes it announce on change, which is what the existing
 * validate-on-change behaviour needs; the previous version was a silent
 * animated div.
 */
export function AuthAlert({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mb-5 flex items-start gap-2.5 rounded-[var(--radius-md)] border border-[color-mix(in_srgb,var(--error)_32%,transparent)] bg-danger-soft px-3.5 py-3"
    >
      <AlertCircle size={17} className="mt-px shrink-0 text-danger" aria-hidden />
      <p className="type-small m-0 min-w-0 font-medium text-danger">{message}</p>
    </div>
  );
}

/**
 * Small text link used for "Forgot password?" and similar inline affordances.
 */
export function AuthTextLink({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "type-caption rounded-[var(--radius-xs)] font-semibold text-primary",
        "hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
      )}
      {...props}
    >
      {children}
    </button>
  );
}
