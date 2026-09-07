"use client";

import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { AlertCircle, Inbox, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--primary)] text-[var(--text-on-primary)] shadow-[0_1px_0_rgba(255,255,255,0.12)_inset] hover:bg-[var(--primary-hover)] disabled:opacity-50",
  secondary:
    "bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-strong)] hover:bg-[var(--bg-alt)] disabled:opacity-50",
  outline:
    "bg-transparent text-[var(--text-main)] border border-[var(--border-strong)] hover:bg-[var(--bg-alt)] disabled:opacity-50",
  ghost:
    "bg-transparent text-[var(--text-muted)] hover:bg-[var(--bg-alt)] hover:text-[var(--text-main)] disabled:opacity-50",
  danger:
    "bg-[color-mix(in_srgb,var(--error)_10%,var(--bg-card))] text-[var(--error)] border border-[color-mix(in_srgb,var(--error)_28%,var(--border-light))] hover:bg-[color-mix(in_srgb,var(--error)_16%,var(--bg-card))] disabled:opacity-50",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "h-9 gap-1.5 px-3 text-xs lg:text-[13px]",
  md: "h-10 gap-2 px-4 text-xs lg:text-sm",
  lg: "h-12 gap-2 px-5 text-sm lg:text-[15px]",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    children?: ReactNode;
  }
>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    className,
    style,
    children,
    disabled,
    type = "button",
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius-md)] font-semibold tracking-[-0.02em] transition-[background-color,color,border-color,box-shadow,transform] duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
        "active:translate-y-px",
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      style={style}
      {...props}
    >
      {loading ? (
        <LoaderCircle size={16} className="animate-spin" aria-hidden />
      ) : null}
      {children}
    </button>
  );
});

/**
 * Square button for a single icon.
 *
 * `label` is required and becomes the `aria-label` — an icon-only control with
 * no accessible name is invisible to screen readers, so the API makes it
 * impossible to omit. Sizes keep a >=36px touch target at every step.
 */
export const IconButton = forwardRef<
  HTMLButtonElement,
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
    label: string;
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    children?: ReactNode;
  }
>(function IconButton(
  {
    label,
    variant = "ghost",
    size = "md",
    loading = false,
    className,
    children,
    disabled,
    type = "button",
    ...props
  },
  ref,
) {
  const box: Record<ButtonSize, string> = {
    sm: "h-9 w-9",
    md: "h-10 w-10",
    lg: "h-11 w-11",
  };
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      disabled={disabled || loading}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[var(--radius-md)] transition-[background-color,color,border-color,box-shadow] duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
        variantClass[variant],
        box[size],
        className,
      )}
      {...props}
    >
      {loading ? (
        <LoaderCircle size={16} className="animate-spin" aria-hidden />
      ) : (
        children
      )}
    </button>
  );
});

const fieldClass =
  "w-full min-h-11 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--bg-card)] px-3.5 py-2.5 text-xs text-[var(--text-main)] transition-[border-color,box-shadow] duration-150 placeholder:text-[var(--text-light)] focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--ring-soft)] disabled:cursor-not-allowed disabled:opacity-60 lg:text-sm";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClass, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(fieldClass, "min-h-28 resize-y", className)}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldClass, className)} {...props} />;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[13px] font-semibold text-[var(--text-main)]"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[13px] font-medium text-[var(--error)]" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[13px] text-[var(--text-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "accent" | "success" | "warning" | "error" | "info";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral:
      "bg-[var(--bg-alt)] text-[var(--text-muted)] border-[var(--border-light)]",
    accent:
      "bg-[var(--primary-soft)] text-[var(--primary)] border-[var(--primary-border)]",
    success:
      "bg-[var(--success-soft)] text-[var(--success)] border-[color-mix(in_srgb,var(--success)_28%,transparent)]",
    warning:
      "bg-[var(--warning-soft)] text-[var(--warning)] border-[color-mix(in_srgb,var(--warning)_28%,transparent)]",
    error:
      "bg-[var(--error-soft)] text-[var(--error)] border-[color-mix(in_srgb,var(--error)_28%,transparent)]",
    info: "bg-[var(--info-soft)] text-[var(--info)] border-[color-mix(in_srgb,var(--info)_28%,transparent)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-[0.04em] uppercase",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Card({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-[var(--radius-lg)] border border-[var(--border-light)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)]",
        padded && "p-5 sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Alert({
  title,
  children,
  tone = "info",
}: {
  title?: string;
  children?: ReactNode;
  tone?: "info" | "success" | "warning" | "error";
}) {
  const tones: Record<string, string> = {
    info: "border-[color-mix(in_srgb,var(--info)_30%,var(--border-light))] bg-[var(--info-soft)]",
    success:
      "border-[color-mix(in_srgb,var(--success)_30%,var(--border-light))] bg-[var(--success-soft)]",
    warning:
      "border-[color-mix(in_srgb,var(--warning)_30%,var(--border-light))] bg-[var(--warning-soft)]",
    error:
      "border-[color-mix(in_srgb,var(--error)_30%,var(--border-light))] bg-[var(--error-soft)]",
  };
  return (
    <div
      role="status"
      className={cn(
        "flex gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-sm",
        tones[tone],
      )}
    >
      <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
      <div>
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? (
          <div className="mt-0.5 text-[var(--text-muted)]">{children}</div>
        ) : null}
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-[shShimmer_1.4s_ease-in-out_infinite] rounded-[var(--radius-md)] bg-[linear-gradient(90deg,var(--border-light)_25%,var(--bg-alt)_50%,var(--border-light)_75%)] bg-[length:200%_100%]",
        className,
      )}
      aria-hidden
    />
  );
}

/**
 * Explains why a region has no content and what to do about it.
 *
 * `description` and `action` are strongly encouraged: an empty state that only
 * says "No results" leaves the user guessing whether the app is broken or they
 * simply haven't done anything yet. `compact` fits it inside a card.
 */
export function EmptyState({
  title,
  description,
  action,
  icon,
  compact = false,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-[var(--radius-lg)] border border-dashed border-[var(--border-strong)] bg-[var(--bg-alt)] px-6 text-center",
        compact ? "py-8" : "py-14",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full bg-[var(--bg-card)] text-[var(--text-muted)] shadow-[var(--shadow-sm)]",
          compact ? "mb-3 h-10 w-10" : "mb-4 h-12 w-12",
        )}
        aria-hidden
      >
        {icon ?? <Inbox size={compact ? 17 : 20} />}
      </span>
      <h3 className="type-h4 m-0 text-[var(--text-main)]">{title}</h3>
      {description ? (
        <p className="type-small mx-auto mt-2 mb-0 max-w-sm text-[var(--text-muted)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/**
 * Failure state for a data-driven region.
 *
 * Shows human-readable copy and a retry affordance. `detail` is for a short
 * server message; raw stack traces and error digests belong in logs, not in
 * front of users.
 */
export function ErrorState({
  title = "Something went wrong",
  description = "We couldn’t load this content. Check your connection and try again.",
  action,
  detail,
  compact = false,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  detail?: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--error)_28%,var(--border-light))] bg-[var(--error-soft)] px-6 text-center",
        compact ? "py-8" : "py-12",
        className,
      )}
    >
      <span
        className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--bg-card)] text-[var(--error)] shadow-[var(--shadow-sm)]"
        aria-hidden
      >
        <AlertCircle size={18} />
      </span>
      <h3 className="type-h4 m-0 text-[var(--text-main)]">{title}</h3>
      <p className="type-small mx-auto mt-2 mb-0 max-w-sm text-[var(--text-muted)]">
        {description}
      </p>
      {detail ? (
        <p className="type-caption mt-2 mb-0 max-w-sm text-[var(--text-light)]">
          {detail}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function PageSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid min-h-[40vh] place-items-center px-6"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="grid w-full max-w-md gap-3">
          <Skeleton className="h-8 w-2/5" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
        <span className="text-sm font-medium text-[var(--text-muted)]">
          {label}
        </span>
      </div>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-7 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-2 text-[11px] font-semibold tracking-[0.14em] text-[var(--primary)] uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="m-0 text-[clamp(1.5rem,2.4vw,1.85rem)] font-semibold tracking-[-0.038em] text-[var(--text-main)]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 mb-0 max-w-2xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-[15px]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
