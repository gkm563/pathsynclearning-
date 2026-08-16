/**
 * Shared UI primitives — prefer these over one-off styled wrappers.
 * Platform screens still use inline styles; migrate incrementally.
 */
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

const baseBtn: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  borderRadius: 12,
  padding: "10px 16px",
  fontFamily: "Outfit, sans-serif",
  fontWeight: 700,
  fontSize: 14,
  border: "none",
  cursor: "pointer",
  transition: "opacity 0.15s ease, transform 0.15s ease",
};

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variantStyles: Record<ButtonVariant, CSSProperties> = {
  primary: {
    background: "linear-gradient(135deg, #6c63ff, #00c9a7)",
    color: "#ffffff",
  },
  secondary: {
    background: "var(--bg-card)",
    color: "var(--text-main)",
    border: "1.5px solid var(--border-light)",
  },
  ghost: {
    background: "transparent",
    color: "var(--text-muted)",
  },
  danger: {
    background: "rgba(239,68,68,0.1)",
    color: "#ef4444",
    border: "1.5px solid rgba(239,68,68,0.25)",
  },
};

export function Button({
  variant = "primary",
  style,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children?: ReactNode;
}) {
  return (
    <button
      type="button"
      {...props}
      style={{ ...baseBtn, ...variantStyles[variant], ...style }}
    >
      {children}
    </button>
  );
}

export function EmptyState({
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
        textAlign: "center",
        padding: "48px 24px",
        borderRadius: 20,
        border: "1.5px dashed var(--border-light)",
        background: "var(--bg-alt)",
      }}
    >
      <h3
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
      {description ? (
        <p
          style={{
            margin: "8px auto 0",
            maxWidth: 360,
            color: "var(--text-muted)",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      ) : null}
      {action ? <div style={{ marginTop: 16 }}>{action}</div> : null}
    </div>
  );
}

export function PageSpinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight: "40vh",
        display: "grid",
        placeItems: "center",
        color: "var(--text-muted)",
        fontSize: 14,
      }}
    >
      {label}
    </div>
  );
}
