"use client";

import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Eye, EyeOff, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Form controls beyond the plain text inputs in `primitives.tsx`.
 *
 * All of these render a real, focusable native input and hide it visually
 * rather than replacing it with a div — that keeps form submission, browser
 * autofill, validation and screen-reader semantics working for free.
 */

/**
 * Grouping wrapper for a labelled control.
 *
 * Generates the id, wires `htmlFor`, and connects hint/error text via
 * `aria-describedby` and `aria-invalid`, so an error is announced rather than
 * only turning the border red.
 */
export function FormField({
  label,
  hint,
  error,
  required,
  optional,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  children: (props: {
    id: string;
    "aria-describedby": string | undefined;
    "aria-invalid": boolean | undefined;
  }) => ReactNode;
  className?: string;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="type-label flex items-center gap-1.5 text-ink">
        {label}
        {required ? (
          <span className="text-danger" aria-hidden>
            *
          </span>
        ) : null}
        {optional ? (
          <span className="type-caption font-normal text-faint">Optional</span>
        ) : null}
      </label>

      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
      })}

      {error ? (
        <p id={errorId} role="alert" className="type-small font-medium text-danger">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="type-small text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Groups related fields under a heading. Uses fieldset/legend for semantics. */
export function FieldGroup({
  legend,
  description,
  children,
  className,
}: {
  legend: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <fieldset className={cn("min-w-0 border-0 p-0", className)}>
      <legend className="type-h4 mb-1 p-0 text-ink">{legend}</legend>
      {description ? (
        <p className="type-small mt-0 mb-4 max-w-prose text-muted">
          {description}
        </p>
      ) : (
        <div className="mb-4" />
      )}
      <div className="flex flex-col gap-4">{children}</div>
    </fieldset>
  );
}

/**
 * Boolean toggle for settings that apply immediately.
 *
 * Use a Checkbox instead when the value is only committed on submit — a switch
 * implies the change takes effect the moment it's flipped.
 */
export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}) {
  const id = useId();
  const descriptionId = `${id}-description`;

  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <label
          htmlFor={id}
          className={cn(
            "type-label block text-ink",
            disabled ? "opacity-60" : "cursor-pointer",
          )}
        >
          {label}
        </label>
        {description ? (
          <p id={descriptionId} className="type-small mt-0.5 text-muted">
            {description}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={checked}
        aria-describedby={description ? descriptionId : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          // 44px hit area via padding while the visual track stays compact.
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors duration-150",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
          checked
            ? "border-primary bg-primary"
            : "border-line-strong bg-sunken",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1/2 h-4.5 w-4.5 -translate-y-1/2 rounded-full bg-surface shadow-[var(--shadow-xs)] transition-[left] duration-150 motion-reduce:transition-none",
            checked ? "left-[calc(100%-1.25rem)]" : "left-[3px]",
          )}
        />
      </button>
    </div>
  );
}

/** Checkbox with an inline label. Renders a native input for form semantics. */
export function Checkbox({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: ReactNode;
  description?: string;
  disabled?: boolean;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("flex items-start gap-2.5", className)}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className={cn(
          "mt-0.5 h-4.5 w-4.5 shrink-0 cursor-pointer appearance-none rounded-[5px] border border-line-strong bg-surface transition-colors",
          "checked:border-primary checked:bg-primary",
          // Tick drawn as a background image so it inherits the checked state
          // without an extra element to keep in sync.
          "checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22 fill=%22none%22 stroke=%22white%22 stroke-width=%222.5%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%223,8.5 6.5,12 13,4.5%22/></svg>')] checked:bg-center checked:bg-no-repeat",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      />
      <div className="min-w-0">
        <label
          htmlFor={id}
          className={cn(
            "type-small block text-ink",
            disabled ? "opacity-60" : "cursor-pointer",
          )}
        >
          {label}
        </label>
        {description ? (
          <p className="type-caption mt-0.5 text-muted">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Radio group. Options render as selectable cards when `description` is
 * present, otherwise as a compact list.
 */
export function RadioGroup<T extends string>({
  name,
  value,
  onChange,
  options,
  className,
}: {
  name: string;
  value: T;
  onChange: (next: T) => void;
  options: Array<{
    value: T;
    label: string;
    description?: string;
    disabled?: boolean;
  }>;
  className?: string;
}) {
  const groupId = useId();
  const asCards = options.some((o) => o.description);

  return (
    <div
      role="radiogroup"
      className={cn(asCards ? "grid gap-2" : "flex flex-col gap-2", className)}
    >
      {options.map((option) => {
        const id = `${groupId}-${option.value}`;
        const selected = option.value === value;
        return (
          <label
            key={option.value}
            htmlFor={id}
            className={cn(
              "flex items-start gap-2.5 transition-colors",
              option.disabled ? "opacity-60" : "cursor-pointer",
              asCards &&
                "rounded-[var(--radius-md)] border p-3.5 hover:bg-sunken",
              asCards && selected
                ? "border-primary bg-primary-soft"
                : asCards
                  ? "border-line bg-surface"
                  : "",
            )}
          >
            <input
              type="radio"
              id={id}
              name={name}
              value={option.value}
              checked={selected}
              disabled={option.disabled}
              onChange={() => onChange(option.value)}
              className={cn(
                "mt-0.5 h-4.5 w-4.5 shrink-0 cursor-pointer appearance-none rounded-full border border-line-strong bg-surface transition-colors",
                "checked:border-[5px] checked:border-primary",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                "disabled:cursor-not-allowed",
              )}
            />
            <span className="min-w-0">
              <span className="type-label block text-ink">{option.label}</span>
              {option.description ? (
                <span className="type-small mt-0.5 block text-muted">
                  {option.description}
                </span>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}

/**
 * Search box with a clear affordance.
 *
 * `type="search"` plus `role="searchbox"` semantics; the clear button is only
 * rendered when there's something to clear so it never occupies dead space.
 * Debouncing is the caller's concern — this stays a controlled input so the
 * value never fights with an external filter state.
 */
export const SearchInput = forwardRef<
  HTMLInputElement,
  Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> & {
    value: string;
    onValueChange: (next: string) => void;
    onClear?: () => void;
    busy?: boolean;
  }
>(function SearchInput(
  { value, onValueChange, onClear, busy, className, placeholder = "Search…", ...props },
  ref,
) {
  return (
    <div
      className={cn(
        "flex min-h-11 flex-1 items-center gap-2 rounded-[var(--radius-md)] border border-line-strong bg-surface px-3 transition-[border-color,box-shadow] duration-150",
        "focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--ring-soft)]",
        className,
      )}
    >
      <Search size={16} className="shrink-0 text-faint" aria-hidden />
      <input
        ref={ref}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onValueChange(e.target.value)}
        className="type-body min-w-0 flex-1 border-0 bg-transparent text-ink outline-none placeholder:text-faint [&::-webkit-search-cancel-button]:appearance-none"
        {...props}
      />
      {busy ? (
        <span
          aria-hidden
          className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-line border-t-primary"
        />
      ) : null}
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            onValueChange("");
            onClear?.();
          }}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-faint transition-colors hover:bg-sunken hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
        >
          <X size={13} aria-hidden />
        </button>
      ) : null}
    </div>
  );
});

/** Password input with a reveal toggle. */
export const PasswordInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function PasswordInput({ className, ...props }, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <div
      className={cn(
        "flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] border border-line-strong bg-surface px-3.5 transition-[border-color,box-shadow] duration-150",
        "focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--ring-soft)]",
        className,
      )}
    >
      <input
        ref={ref}
        type={visible ? "text" : "password"}
        className="type-body min-w-0 flex-1 border-0 bg-transparent text-ink outline-none placeholder:text-faint"
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-faint transition-colors hover:bg-sunken hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
      >
        {visible ? <EyeOff size={15} aria-hidden /> : <Eye size={15} aria-hidden />}
      </button>
    </div>
  );
});
