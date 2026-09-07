"use client";

import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import {
  ConfirmDialog,
  FormField,
  Input,
  Skeleton,
  Switch,
  Textarea,
} from "@/components/ui";
import { cn } from "@/lib/cn";

export { ConfirmDialog };

export const PROFILE_COLS = {
  primary: "var(--primary)",
  success: "var(--success)",
  danger: "var(--error)",
  warning: "var(--warning)",
} as const;

export const sectionCard =
  "rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-[var(--shadow-sm)]";

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="type-small mt-1.5 mb-0 text-danger">
      {message}
    </p>
  );
}

export function TextField({
  id,
  label,
  error,
  hint,
  ...props
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FormField label={label} error={error} hint={hint}>
      {(a) => (
        <Input
          {...a}
          id={id}
          {...props}
          className={cn(error && "border-danger", props.className)}
        />
      )}
    </FormField>
  );
}

export function TextAreaField({
  id,
  label,
  error,
  hint,
  ...props
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FormField label={label} error={error} hint={hint}>
      {(a) => (
        <Textarea
          {...a}
          id={id}
          {...props}
          className={cn(error && "border-danger", props.className)}
        />
      )}
    </FormField>
  );
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="type-h4 m-0 text-ink">{title}</h2>
        {description ? (
          <p className="type-small mt-1.5 mb-0 text-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function ToggleRow({
  id,
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="border-b border-line py-3.5 last:border-b-0">
      <Switch
        checked={checked}
        onChange={onChange}
        label={label}
        description={description}
        disabled={disabled}
      />
      <span id={id} className="sr-only">
        {label}
      </span>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div
      aria-busy
      aria-label="Loading profile"
      className="flex flex-col gap-5 pb-20"
    >
      <Skeleton className="h-40 rounded-[var(--radius-lg)]" />
      <div className="grid gap-5 lg:grid-cols-[13.75rem_minmax(0,1fr)]">
        <Skeleton className="h-80 rounded-[var(--radius-lg)]" />
        <Skeleton className="h-[26rem] rounded-[var(--radius-lg)]" />
      </div>
    </div>
  );
}
