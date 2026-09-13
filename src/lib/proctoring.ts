/** Shared assessment + interview proctoring. Safe for client and server. */

export const MAX_PROCTOR_VIOLATIONS = 3;
export const PROCTOR_GRACE_MS = 2500;
export const PROCTOR_DEDUP_MS = 800;

export type ProctorIntegrityType =
  | "tab_hidden"
  | "tab_visible"
  | "paste"
  | "fullscreen_exit"
  | "window_blur"
  | "clipboard_blocked";

export function isProctoringEnabled() {
  const pub = process.env.NEXT_PUBLIC_ASSESSMENT_PROCTORING;
  const srv = process.env.ASSESSMENT_PROCTORING;
  if (pub === "false" || srv === "false") return false;
  return true;
}

export function isCountedProctorEvent(type: string) {
  return type !== "tab_visible";
}

export function countProctorViolations(events: Array<{ type: string }>) {
  return events.filter((event) => isCountedProctorEvent(event.type)).length;
}
