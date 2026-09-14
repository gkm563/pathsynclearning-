"use client";

import type { CopilotInteract, CopilotUiKind, CopilotUiSnapshotItem } from "@/lib/ai/copilot-interact";
import { FAB_MARGIN, FAB_SIZE, clampFab, type CompanionPos } from "./copilot-layout";
import { NAV_GROUPS } from "@/components/dashboard/nav-config";
import { routes } from "@/lib/routes";

const BLOCKED =
  /\b(sign out|log out|logout|delete account|remove account|deactivate|destroy|revoke|unlink|change password|reset password)\b/i;

const SELECTOR = [
  "[data-companion-nav]",
  "[data-companion-target]",
  "a[href]",
  "button",
  "[role='button']",
  "[role='link']",
  "[role='tab']",
  "[role='menuitem']",
  "summary",
  "input:not([type='hidden']):not([type='password']):not([type='file'])",
  "select",
].join(",");

const live = new Map<string, HTMLElement>();

const NAV_ITEMS = [
  ...NAV_GROUPS.flatMap((group) => group.items),
  { id: "settings", href: routes.app.settings, label: "Settings" },
  { id: "profile", href: routes.app.profile, label: "Profile" },
  { id: "notifications", href: routes.app.notifications, label: "Notifications" },
];

function displayed(el: HTMLElement) {
  const style = window.getComputedStyle(el);
  if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) {
    return false;
  }
  const rect = el.getBoundingClientRect();
  return rect.width >= 4 && rect.height >= 4;
}

function labelOf(el: HTMLElement) {
  const labelled = el.getAttribute("aria-label")?.trim();
  if (labelled) return labelled.slice(0, 80);
  const title = el.getAttribute("title")?.trim();
  if (title) return title.slice(0, 80);
  const text = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
  if (text) return text.slice(0, 80);
  const href = hrefOf(el);
  if (href) return href.slice(0, 80);
  return el.tagName.toLowerCase();
}

function kindOf(el: HTMLElement): CopilotUiKind {
  const role = el.getAttribute("role");
  if (role === "tab") return "tab";
  if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
    return "input";
  }
  if (el.tagName === "A" || role === "link") return "link";
  return "button";
}

function hrefOf(el: HTMLElement) {
  const tagged = el.getAttribute("data-companion-href")?.trim();
  if (tagged) return tagged.split("#")[0];
  const node = el instanceof HTMLAnchorElement ? el : el.closest("a");
  if (!node) return undefined;
  const href = node.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("javascript:")) return undefined;
  try {
    const url = new URL(href, window.location.origin);
    if (url.origin !== window.location.origin) return undefined;
    return `${url.pathname}${url.search}`.split("#")[0];
  } catch {
    return href.startsWith("/") ? href.split("#")[0] : undefined;
  }
}

function fingerprint(el: HTMLElement, label: string, href: string | undefined) {
  const nav = el.getAttribute("data-companion-nav") || "";
  const raw = `${nav}|${el.tagName}|${href || ""}|${label}`;
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i += 1) {
    hash = Math.imul(hash ^ raw.charCodeAt(i), 16777619);
  }
  return `ui-${(hash >>> 0).toString(36)}`;
}

function isBlocked(el: HTMLElement, label: string, href?: string) {
  if (el.closest("[data-companion-ignore]")) return true;
  if (el.getAttribute("aria-disabled") === "true" || (el instanceof HTMLButtonElement && el.disabled)) {
    return true;
  }
  if (el.classList.contains("text-danger") || el.className.includes("danger")) return true;
  if (BLOCKED.test(label) || (href && BLOCKED.test(href))) return true;
  return false;
}

function collect(el: HTMLElement, out: CopilotUiSnapshotItem[], seen: Set<string>) {
  if (!displayed(el)) return;
  const label = labelOf(el);
  if (!label || label.length < 2) return;
  const href = hrefOf(el);
  if (isBlocked(el, label, href)) return;
  let id = el.getAttribute("data-companion-nav") || fingerprint(el, label, href);
  if (seen.has(id)) id = `${id}-${out.length}`;
  seen.add(id);
  live.set(id, el);
  out.push({ id, label, kind: kindOf(el), href });
}

export function scanCompanionTargets(): CopilotUiSnapshotItem[] {
  live.clear();
  const root = document.querySelector("[data-app-overlay]") || document.body;
  const out: CopilotUiSnapshotItem[] = [];
  const seen = new Set<string>();

  for (const el of root.querySelectorAll<HTMLElement>("[data-companion-nav], [data-companion-target]")) {
    collect(el, out, seen);
  }
  for (const el of root.querySelectorAll<HTMLElement>(SELECTOR)) {
    if (out.length >= 140) break;
    if (el.hasAttribute("data-companion-nav") || el.hasAttribute("data-companion-target")) continue;
    collect(el, out, seen);
  }
  return out;
}

function norm(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function pathOnly(href: string) {
  return href.split("?")[0].split("#")[0];
}

const EXTRA_ALIASES: Record<string, string[]> = {
  dashboard: ["home", "main", "overview"],
  progress: ["progress", "stats", "analytics"],
  roadmap: ["roadmap", "road map", "skill map", "career map"],
  problems: ["problems", "dsa", "practice problems", "question bank"],
  challenges: ["challenges", "challenge", "daily challenge"],
  "memory-lane": ["memory lane", "memory", "notes"],
  "tech-news": ["tech news", "news", "articles"],
  "live-class": ["live class", "live classs", "class"],
  "placement-inbox": ["placement inbox", "inbox", "placements"],
  "placement-insights": ["placement insights", "insights"],
  "og-opportunities": ["og opportunities", "opportunities", "jobs"],
  events: ["events", "event"],
  mentorship: ["mentorship", "mentor"],
  interview: ["interview", "ai interview", "mock interview"],
  "records-certs": ["records", "certs", "certificates"],
  "student-community": ["community", "student community"],
  "project-collab": ["project collab", "collab", "projects"],
  "hack-squad": ["hack squad", "hackathon"],
  "alumni-network": ["alumni", "alumni network"],
  store: ["store", "shop"],
  wallet: ["wallet", "coins"],
  settings: ["settings", "preferences"],
  profile: ["profile", "account", "my profile"],
  notifications: ["notifications", "alerts", "bell"],
};

function aliasesFor(item: { id: string; label: string; shortLabel?: string }) {
  const extra = EXTRA_ALIASES[item.id] || [];
  return [
    item.label,
    item.shortLabel || "",
    item.id.replace(/-/g, " "),
    ...extra,
  ]
    .map(norm)
    .filter((value) => value.length > 1);
}

export function inferCompanionIntent(text: string): CopilotInteract | null {
  const t = norm(text);
  if (!t) return null;
  const wantsOpen = /\b(open|go to|goto|show|take me|click|press|tap|navigate|start|launch|select|choose)\b/.test(
    t,
  );

  let best: { interact: CopilotInteract; score: number } | null = null;
  const consider = (interact: CopilotInteract, score: number) => {
    if (score <= 0) return;
    if (!best || score > best.score) best = { interact, score };
  };

  for (const item of NAV_ITEMS) {
    let score = 0;
    for (const alias of aliasesFor(item)) {
      if (t === alias) score = Math.max(score, 12);
      else if (alias.length > 2 && t.includes(alias)) score = Math.max(score, 7 + Math.min(4, alias.length / 4));
    }
    if (!score) continue;
    if (!wantsOpen && score < 12) continue;
    consider(
      { type: "click", id: item.id, label: item.label, href: item.href },
      score + 3,
    );
  }

  const onScreen = scanCompanionTargets();
  for (const item of onScreen) {
    const label = norm(item.label);
    if (label.length < 3) continue;
    if (label === "more" || label === "send" || label === "close") continue;
    let score = 0;
    if (t === label) score = 14;
    else if (t.includes(label)) score = 8 + Math.min(6, label.length / 3);
    if (!score) continue;
    if (!wantsOpen && score < 14) continue;
    consider(
      { type: "click", id: item.id, label: item.label, href: item.href },
      score,
    );
  }

  const picked = best;
  if (!picked || (!wantsOpen && picked.score < 12)) return null;
  return picked.interact;
}

function scoreItem(item: CopilotUiSnapshotItem, step: CopilotInteract) {
  const wantLabel = step.label ? norm(step.label) : "";
  const wantHref = step.href ? pathOnly(step.href) : "";
  const wantId = step.id ? norm(step.id) : "";
  const itemHref = item.href ? pathOnly(item.href) : "";
  const itemLabel = norm(item.label);
  const el = live.get(item.id);
  const navId = el?.getAttribute("data-companion-nav") || "";
  let score = 0;
  if (wantId && (item.id === step.id || norm(navId) === wantId)) score += 12;
  if (wantHref && itemHref === wantHref) score += 10;
  if (wantHref && itemHref.startsWith(`${wantHref}/`)) score += 2;
  if (wantLabel && itemLabel === wantLabel) score += 8;
  if (wantLabel && (itemLabel.includes(wantLabel) || wantLabel.includes(itemLabel)) && itemLabel.length > 2) {
    score += 3;
  }
  if (navId) score += 6;
  return score;
}

export function resolveCompanionTarget(step: CopilotInteract): HTMLElement | null {
  const items = scanCompanionTargets();
  const scored = items
    .map((item) => ({ item, score: scoreItem(item, step) }))
    .filter((row) => row.score >= 6)
    .sort((a, b) => b.score - a.score);
  const best = scored[0];
  if (!best) return null;
  return live.get(best.item.id) || null;
}

export function findMoreButton(): HTMLElement | null {
  scanCompanionTargets();
  for (const el of live.values()) {
    const label = norm(labelOf(el));
    if (label === "more" || (el.getAttribute("aria-haspopup") === "dialog" && label.includes("more"))) {
      return el;
    }
  }
  return null;
}

export function companionStandPoint(el: HTMLElement): CompanionPos {
  const rect = el.getBoundingClientRect();
  const left = rect.left - FAB_SIZE - 10;
  const right = rect.right + 10;
  const y = rect.top + rect.height / 2 - FAB_SIZE / 2;
  const x = left >= FAB_MARGIN ? left : right;
  return clampFab({ x, y });
}

export function pressCompanionTarget(el: HTMLElement) {
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
    el.focus();
    return;
  }
  el.focus({ preventScroll: true });
  el.click();
}
