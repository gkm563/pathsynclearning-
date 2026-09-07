"use client";

import type { ReactNode } from "react";
import { SearchInput } from "@/components/ui";
import { cn } from "@/lib/cn";

export function OnboardingCard({
  children,
}: {
  children: ReactNode;
  accent?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-[var(--shadow-sm)] sm:p-8">
      <div className="relative flex flex-col gap-6">{children}</div>
    </div>
  );
}

export function StepHeader({
  kicker,
  title,
  subtitle,
  icon,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex gap-3.5">
      {icon ? (
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[var(--radius-md)] border border-line bg-sunken text-primary">
          {icon}
        </div>
      ) : null}
      <div className="min-w-0">
        {kicker ? <p className="type-overline m-0 mb-1.5 text-faint">{kicker}</p> : null}
        <h2 className="type-h3 m-0 text-ink">{title}</h2>
        {subtitle ? (
          <p className="type-small mt-2 mb-0 max-w-xl text-muted">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <SearchInput
      value={value}
      onValueChange={onChange}
      placeholder={placeholder}
    />
  );
}

export function ChoiceCard({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  accent?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "rounded-[var(--radius-lg)] border p-4 text-left transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        selected
          ? "border-primary-border bg-primary-soft text-ink"
          : "border-line bg-sunken text-ink hover:bg-surface",
      )}
    >
      {children}
    </button>
  );
}

export function Pill({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  accent?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "type-label inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        selected
          ? "border-primary-border bg-primary text-[var(--text-on-primary)]"
          : "border-line bg-sunken text-ink hover:bg-surface",
      )}
    >
      {children}
    </button>
  );
}

export const labelClass = "type-label mb-2.5 block text-ink";

export const fieldClass =
  "w-full min-h-11 rounded-[var(--radius-md)] border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-faint focus-visible:border-primary focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--ring-soft)]";
