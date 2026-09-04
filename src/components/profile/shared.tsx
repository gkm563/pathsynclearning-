"use client";

import type { CSSProperties, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { SkeletonBlock } from "@/components/progress/shared";

export const PROFILE_COLS = {
  primary: "#6c63ff",
  success: "#00c9a7",
  danger: "#ef4444",
  warning: "#f59e0b",
} as const;

export const sectionCard: CSSProperties = {
  background: "var(--bg-card)",
  border: "1.5px solid var(--border-light)",
  borderRadius: 20,
  padding: 24,
};

export const fieldLabel: CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.02em",
  color: "var(--text-muted)",
  marginBottom: 6,
  fontFamily: "Outfit, sans-serif",
};

export const fieldInput: CSSProperties = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 12,
  border: "1.5px solid var(--border-light)",
  background: "var(--bg-alt)",
  color: "var(--text-main)",
  fontFamily: "Outfit, sans-serif",
  fontSize: 14,
  outline: "none",
  transition: "border-color 0.15s ease, box-shadow 0.15s ease",
};

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      style={{
        margin: "6px 0 0",
        fontSize: 12,
        color: PROFILE_COLS.danger,
        fontFamily: "Outfit, sans-serif",
      }}
    >
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
    <div>
      <label htmlFor={id} style={fieldLabel}>
        {label}
      </label>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        style={{
          ...fieldInput,
          borderColor: error ? "rgba(239,68,68,0.55)" : "var(--border-light)",
          opacity: props.disabled ? 0.7 : 1,
          cursor: props.disabled ? "not-allowed" : undefined,
        }}
        {...props}
      />
      {hint && !error ? (
        <p
          id={`${id}-hint`}
          style={{ margin: "6px 0 0", fontSize: 12, color: "var(--text-muted)" }}
        >
          {hint}
        </p>
      ) : null}
      {error ? (
        <span id={`${id}-error`}>
          <FieldError message={error} />
        </span>
      ) : null}
    </div>
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
    <div>
      <label htmlFor={id} style={fieldLabel}>
        {label}
      </label>
      <textarea
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        style={{
          ...fieldInput,
          minHeight: 96,
          resize: "vertical",
          borderColor: error ? "rgba(239,68,68,0.55)" : "var(--border-light)",
        }}
        {...props}
      />
      {hint && !error ? (
        <p
          id={`${id}-hint`}
          style={{ margin: "6px 0 0", fontSize: 12, color: "var(--text-muted)" }}
        >
          {hint}
        </p>
      ) : null}
      {error ? (
        <span id={`${id}-error`}>
          <FieldError message={error} />
        </span>
      ) : null}
    </div>
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
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 20,
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            fontFamily: "Outfit, sans-serif",
            fontSize: 18,
            fontWeight: 800,
            color: "var(--text-main)",
          }}
        >
          {title}
        </h2>
        {description ? (
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 13.5,
              color: "var(--text-muted)",
              lineHeight: 1.5,
            }}
          >
            {description}
          </p>
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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "14px 0",
        borderBottom: "1px solid var(--border-light)",
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <label
          htmlFor={id}
          style={{
            display: "block",
            fontFamily: "Outfit, sans-serif",
            fontSize: 14,
            fontWeight: 700,
            color: "var(--text-main)",
            cursor: disabled ? "default" : "pointer",
          }}
        >
          {label}
        </label>
        <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--text-muted)" }}>
          {description}
        </p>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        style={{
          width: 48,
          height: 28,
          borderRadius: 999,
          border: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          background: checked ? PROFILE_COLS.primary : "var(--border-light)",
          position: "relative",
          flexShrink: 0,
          transition: "background 0.2s ease",
        }}
      >
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 23 : 3,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
            transition: "left 0.2s ease",
          }}
        />
      </button>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div
      aria-busy
      aria-label="Loading profile"
      style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 80 }}
    >
      <SkeletonBlock height={160} radius={20} />
      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20 }}>
        <SkeletonBlock height={320} radius={20} />
        <SkeletonBlock height={420} radius={20} />
      </div>
      <style>{`
        @keyframes progressShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (max-width: 900px) {
          .profile-skel-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  loading,
  confirmDisabled,
  onConfirm,
  onCancel,
  children,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  loading?: boolean;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}) {
  if (!open) return null;
  const confirmBg =
    tone === "danger"
      ? PROFILE_COLS.danger
      : "linear-gradient(135deg, #6c63ff, #00c9a7)";
  const disabled = Boolean(loading || confirmDisabled);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1500,
        background: "rgba(15,23,42,0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onCancel}
      onKeyDown={(e) => {
        if (e.key === "Escape") onCancel();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--bg-card)",
          borderRadius: 20,
          border: "1.5px solid var(--border-light)",
          padding: 24,
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id="confirm-dialog-title"
          style={{
            margin: 0,
            fontFamily: "Outfit, sans-serif",
            fontSize: 18,
            fontWeight: 800,
            color: "var(--text-main)",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: "10px 0 0",
            fontSize: 14,
            color: "var(--text-muted)",
            lineHeight: 1.55,
          }}
        >
          {description}
        </p>
        {children}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 22,
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: "1.5px solid var(--border-light)",
              background: "transparent",
              color: "var(--text-main)",
              fontFamily: "Outfit, sans-serif",
              fontWeight: 700,
              fontSize: 13.5,
              cursor: "pointer",
            }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={disabled}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              border: "none",
              background: confirmBg,
              color: "#fff",
              fontFamily: "Outfit, sans-serif",
              fontWeight: 700,
              fontSize: 13.5,
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.55 : 1,
            }}
          >
            {loading ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
