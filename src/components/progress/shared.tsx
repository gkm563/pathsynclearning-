"use client";

import type { CSSProperties, ReactNode } from "react";

export const PROGRESS_COLS = {
  primary: "#6c63ff",
  success: "#00c9a7",
  warning: "#f59e0b",
  danger: "#ec4899",
  info: "#38bdf8",
  muted: "var(--text-muted)",
} as const;

export const cardStyle: CSSProperties = {
  background: "var(--bg-card)",
  border: "1.5px solid var(--border-light)",
  borderRadius: 20,
  padding: 22,
};

export function SkeletonBlock({
  height = 16,
  width = "100%",
  radius = 10,
  style,
}: {
  height?: number | string;
  width?: number | string;
  radius?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      aria-hidden
      style={{
        height,
        width,
        borderRadius: radius,
        background:
          "linear-gradient(90deg, var(--border-light) 25%, var(--bg-alt) 50%, var(--border-light) 75%)",
        backgroundSize: "200% 100%",
        animation: "progressShimmer 1.2s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

export function ProgressSection({
  title,
  action,
  children,
  style,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <section style={{ ...cardStyle, ...style }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 16,
        }}
      >
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
        {action}
      </div>
      {children}
    </section>
  );
}
