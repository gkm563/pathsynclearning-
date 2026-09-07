"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { AUTH_ROLES, type AuthRoleId } from "./roles";

/**
 * Role picker for the auth forms.
 *
 * Implemented as a real radio group rather than a row of buttons so that
 * screen readers announce "1 of 3" and arrow keys move between options for
 * free. The selected role drives the post-auth redirect, so it is a genuine
 * form input, not a display toggle.
 */
export function RoleSelector({
  value,
  onChange,
  disabled = false,
}: {
  value: AuthRoleId;
  onChange: (next: AuthRoleId) => void;
  disabled?: boolean;
}) {
  const name = useId();

  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="type-label mb-2 text-muted">I&apos;m signing in as</legend>
      <div
        className="grid grid-cols-3 gap-1.5 rounded-[var(--radius-lg)] border border-line bg-sunken p-1.5"
        role="radiogroup"
        aria-label="Account type"
      >
        {AUTH_ROLES.map((role) => {
          const Icon = role.icon;
          const selected = role.id === value;
          return (
            <label
              key={role.id}
              className={cn(
                "flex min-h-[62px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[var(--radius-md)] px-2 py-2.5 text-center",
                "transition-[background-color,color,box-shadow] duration-[var(--duration-fast)] ease-[var(--ease-standard)] motion-reduce:transition-none",
                "focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring",
                selected
                  ? "bg-surface text-primary shadow-[var(--shadow-sm)]"
                  : "text-muted hover:text-ink",
                disabled && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                type="radio"
                name={name}
                value={role.id}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange(role.id)}
                className="sr-only"
              />
              <Icon size={19} aria-hidden />
              <span className="type-caption font-semibold">{role.name}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
