/**
 * PathEd palette — sampled from the logo, then mapped to semantic roles.
 * Use CSS tokens in UI. These hex values are for JS-only surfaces (charts,
 * Monaco, seeded data) that cannot read `var(--*)`.
 */
export const palette = {
  primary: "#066BD3",
  primaryHover: "#0554B0",
  primaryActive: "#0A4193",
  primarySoft: "#EFF6FF",
  primarySoftStrong: "#DBEAFE",

  secondary: "#22D3A7",
  secondaryHover: "#14B8A6",
  secondaryDark: "#0F766E",

  success: "#14B8A6",
  warning: "#D97706",
  error: "#DC4A5A",
  info: "#066BD3",

  ink: "#0F172A",
  muted: "#475569",
  faint: "#64748B",

  canvas: "#F8FAFC",
  surface: "#FFFFFF",
  sunken: "#F1F5F9",
  line: "#E2E8F0",
} as const;
