/** Student home design tokens — teal / slate / amber (not purple-default). */
export const HOME = {
  teal: "#0f766e",
  tealSoft: "rgba(15, 118, 110, 0.12)",
  tealBorder: "rgba(15, 118, 110, 0.28)",
  ocean: "#0369a1",
  oceanSoft: "rgba(3, 105, 161, 0.12)",
  oceanBorder: "rgba(3, 105, 161, 0.28)",
  amber: "#d97706",
  amberSoft: "rgba(217, 119, 6, 0.12)",
  amberBorder: "rgba(217, 119, 6, 0.28)",
  rose: "#e11d48",
  roseSoft: "rgba(225, 29, 72, 0.1)",
  roseBorder: "rgba(225, 29, 72, 0.25)",
  ink: "var(--text-main)",
  muted: "var(--text-muted)",
  card: "var(--bg-card)",
  alt: "var(--bg-alt)",
  border: "var(--border-light)",
  fontDisplay: "'Outfit', sans-serif",
  fontMono: "'Fira Code', monospace",
  fontBody: "'Inter', sans-serif",
  radius: 20,
} as const;

export const SKILL_PALETTE = [
  HOME.teal,
  HOME.ocean,
  HOME.amber,
  "#0ea5e9",
] as const;

export const homeUi = {
  page: "mx-auto flex max-w-[1180px] flex-col gap-[22px] px-1 pb-12 pt-2 max-sm:gap-4 max-sm:px-0 max-sm:pb-9",
  section: "w-full",
  card: "rounded-3xl border-[1.5px] border-[var(--border-light)] bg-[var(--bg-card)] p-[22px] max-sm:rounded-[20px] max-sm:p-4",
  cardTitle:
    "m-0 font-[Outfit,sans-serif] text-[1.2rem] font-extrabold text-[var(--text-main)]",
  grid2: "grid grid-cols-1 gap-[18px] min-[901px]:grid-cols-2",
  blockHead:
    "mb-4 flex flex-wrap items-end justify-between gap-3.5",
  blockTitle:
    "m-0 font-[Outfit,sans-serif] text-[clamp(1.35rem,2.5vw,1.75rem)] font-extrabold text-[var(--text-main)]",
  blockSub: "mt-1 mb-0 text-[0.9rem] text-[var(--text-muted)]",
  textLink:
    "inline-flex items-center gap-1 text-[0.88rem] font-bold text-[#0369a1] no-underline",
  emptyInline: "text-[0.9rem] font-semibold text-[var(--text-muted)]",
  emptyCard:
    "flex flex-col items-center gap-2.5 rounded-[18px] border-[1.5px] border-dashed border-[var(--border-light)] bg-[var(--bg-alt)] px-7 py-7 text-center text-[0.9rem] font-semibold text-[var(--text-muted)]",
  skel: "animate-[shShimmer_1.2s_ease-in-out_infinite] rounded-[18px] bg-[linear-gradient(90deg,var(--border-light)_25%,var(--bg-alt)_50%,var(--border-light)_75%)] bg-[length:200%_100%]",
  headRow: "mb-4 flex items-start justify-between gap-3",
} as const;

export function heatLevelClass(level: number) {
  switch (level) {
    case 1:
      return "bg-[rgba(15,118,110,0.28)]";
    case 2:
      return "bg-[rgba(15,118,110,0.48)]";
    case 3:
      return "bg-[rgba(15,118,110,0.72)]";
    case 4:
      return "bg-[#0f766e]";
    default:
      return "bg-[var(--border-light)] [html[data-theme=dark]_&]:bg-[var(--bg-alt)]";
  }
}
