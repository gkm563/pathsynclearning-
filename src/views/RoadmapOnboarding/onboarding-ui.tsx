"use client";

import React from "react";
import { motion } from "framer-motion";

export const fonts = {
  display: "Outfit, sans-serif",
  body: "Inter, sans-serif",
};

export function OnboardingCard({
  children,
  accent = "#6c63ff",
}: {
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      style={{
        position: "relative",
        overflow: "hidden",
        padding: "28px 28px 32px",
        borderRadius: 24,
        border: "1px solid var(--border-light)",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--bg-card) 92%, white) 0%, var(--bg-card) 100%)",
        boxShadow: "0 18px 50px rgba(15, 23, 42, 0.08)",
        fontFamily: fonts.display,
        color: "var(--text-main)",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(900px 180px at 10% -20%, ${accent}22, transparent 55%)`,
        }}
      />
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 22 }}>
        {children}
      </div>
    </motion.div>
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
  icon?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      {icon ? (
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            display: "grid",
            placeItems: "center",
            background: "var(--bg-alt)",
            border: "1px solid var(--border-light)",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
      ) : null}
      <div>
        {kicker ? (
          <div
            style={{
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            {kicker}
          </div>
        ) : null}
        <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2 }}>{title}</div>
        {subtitle ? (
          <p
            style={{
              margin: "8px 0 0",
              fontFamily: fonts.body,
              fontSize: 15,
              color: "var(--text-muted)",
              lineHeight: 1.55,
              maxWidth: 640,
            }}
          >
            {subtitle}
          </p>
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
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "14px 16px",
        borderRadius: 14,
        border: "1px solid var(--border-light)",
        background: "var(--bg-main)",
        color: "var(--text-main)",
        fontFamily: fonts.body,
        fontSize: 15,
        outline: "none",
      }}
    />
  );
}

export function ChoiceCard({
  selected,
  onClick,
  children,
  accent = "#6c63ff",
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: "left",
        cursor: "pointer",
        padding: 18,
        borderRadius: 18,
        border: `2px solid ${selected ? accent : "var(--border-light)"}`,
        background: selected ? `${accent}14` : "var(--bg-alt)",
        color: "var(--text-main)",
        fontFamily: fonts.display,
        boxShadow: selected ? `0 10px 28px ${accent}22` : "none",
        transition: "all 0.18s ease",
      }}
    >
      {children}
    </button>
  );
}

export function Pill({
  selected,
  onClick,
  children,
  accent = "#00c9a7",
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "10px 14px",
        borderRadius: 999,
        border: `1.5px solid ${selected ? accent : "var(--border-light)"}`,
        background: selected ? accent : "var(--bg-alt)",
        color: selected ? "#fff" : "var(--text-main)",
        cursor: "pointer",
        fontFamily: fonts.display,
        fontSize: 14,
        fontWeight: selected ? 700 : 500,
      }}
    >
      {children}
    </button>
  );
}

export const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 10,
  fontWeight: 700,
  fontFamily: fonts.display,
  fontSize: 15,
};

export const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid var(--border-light)",
  background: "var(--bg-main)",
  color: "var(--text-main)",
  fontFamily: fonts.body,
  fontSize: 15,
  outline: "none",
};
