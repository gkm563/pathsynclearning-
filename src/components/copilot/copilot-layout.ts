"use client";

import { useSyncExternalStore } from "react";

export type CompanionPos = { x: number; y: number };
export type ChatSize = { w: number; h: number };
export type ChatPin = { x: number; y: number; side: "left" | "right" };
export type WalkTask = { x: number; y: number; token: number };

export const FAB_STORAGE_KEY = "pathed.copilot-fab-pos";
export const FAB_SIZE = 56;
export const FAB_MARGIN = 16;
export const CHAT_GAP = 12;
export const CHAT_WIDTH = 376;

let pos: CompanionPos | null = null;
let pinnedChat: ChatPin | null = null;
let walkTask: WalkTask | null = null;
let walkDone: ((ok: boolean) => void) | null = null;
let acting = false;
let tapping = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function tabBarInset() {
  if (typeof window === "undefined") return 24;
  if (window.matchMedia("(min-width: 1024px)").matches) return 24;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--mobile-tabbar-height")
    .trim();
  const tab = raw.endsWith("rem") ? parseFloat(raw) * 16 : parseFloat(raw) || 60;
  return tab + 16;
}

export function clampFab(next: CompanionPos): CompanionPos {
  const maxX = Math.max(FAB_MARGIN, window.innerWidth - FAB_SIZE - FAB_MARGIN);
  const maxY = Math.max(FAB_MARGIN, window.innerHeight - FAB_SIZE - tabBarInset());
  return {
    x: Math.min(Math.max(FAB_MARGIN, next.x), maxX),
    y: Math.min(Math.max(FAB_MARGIN, next.y), maxY),
  };
}

export function defaultFabPos(): CompanionPos {
  return clampFab({
    x: window.innerWidth - FAB_SIZE - (window.matchMedia("(min-width: 1024px)").matches ? 24 : 16),
    y: window.innerHeight - FAB_SIZE - tabBarInset(),
  });
}

export function readFabPos(): CompanionPos | null {
  try {
    const raw = window.localStorage.getItem(FAB_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CompanionPos;
    if (typeof parsed?.x !== "number" || typeof parsed?.y !== "number") return null;
    return clampFab(parsed);
  } catch {
    return null;
  }
}

export function saveFabPos(next: CompanionPos) {
  try {
    window.localStorage.setItem(FAB_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota / private mode
  }
}

export function subscribeCompanionPos(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCompanionPos() {
  return pos;
}

export function initCompanionPos() {
  if (pos) return pos;
  pos = readFabPos() ?? defaultFabPos();
  emit();
  return pos;
}

export function setCompanionPos(next: CompanionPos, persist = false) {
  pos = clampFab(next);
  if (persist) saveFabPos(pos);
  emit();
  return pos;
}

export function useCompanionPos() {
  return useSyncExternalStore(subscribeCompanionPos, getCompanionPos, () => null);
}

export function getPinnedChat() {
  return pinnedChat;
}

export function pinCompanionChat(box: ChatPin | null) {
  pinnedChat = box;
  emit();
}

export function getCompanionActing() {
  return acting;
}

export function setCompanionActing(next: boolean) {
  acting = next;
  if (!next) tapping = false;
  emit();
}

export function getCompanionTapping() {
  return tapping;
}

export function setCompanionTapping(next: boolean) {
  tapping = next;
  emit();
}

export function getWalkTask() {
  return walkTask;
}

export function walkCompanionTo(next: CompanionPos): Promise<boolean> {
  walkDone?.(false);
  const point = clampFab(next);
  walkTask = { x: point.x, y: point.y, token: Date.now() };
  emit();
  return new Promise((resolve) => {
    walkDone = resolve;
  });
}

export function finishCompanionWalk(ok = true) {
  walkTask = null;
  const done = walkDone;
  walkDone = null;
  done?.(ok);
  emit();
}

export function useCompanionWalkTask() {
  return useSyncExternalStore(subscribeCompanionPos, getWalkTask, () => null);
}

export function useCompanionActing() {
  return useSyncExternalStore(subscribeCompanionPos, getCompanionActing, () => false);
}

export function useCompanionTapping() {
  return useSyncExternalStore(subscribeCompanionPos, getCompanionTapping, () => false);
}

export function defaultChatSize(): ChatSize {
  return {
    w: Math.min(CHAT_WIDTH, Math.max(280, window.innerWidth - FAB_MARGIN * 2)),
    h: Math.min(576, Math.max(320, window.innerHeight - tabBarInset() - FAB_MARGIN)),
  };
}

export function placeChat(companion: CompanionPos, size: ChatSize) {
  if (pinnedChat) {
    const maxX = Math.max(FAB_MARGIN, window.innerWidth - size.w - FAB_MARGIN);
    const maxY = Math.max(FAB_MARGIN, window.innerHeight - size.h - tabBarInset());
    return {
      x: Math.min(Math.max(FAB_MARGIN, pinnedChat.x), maxX),
      y: Math.min(Math.max(FAB_MARGIN, pinnedChat.y), maxY),
      side: pinnedChat.side,
    };
  }
  const preferLeft = companion.x + FAB_SIZE / 2 > window.innerWidth / 2;
  const leftX = companion.x - size.w - CHAT_GAP;
  const rightX = companion.x + FAB_SIZE + CHAT_GAP;
  let side: "left" | "right" = preferLeft ? "left" : "right";
  if (side === "left" && leftX < FAB_MARGIN) side = "right";
  if (side === "right" && rightX + size.w > window.innerWidth - FAB_MARGIN && leftX >= FAB_MARGIN) {
    side = "left";
  }
  const maxX = Math.max(FAB_MARGIN, window.innerWidth - size.w - FAB_MARGIN);
  const maxY = Math.max(FAB_MARGIN, window.innerHeight - size.h - tabBarInset());
  return {
    x: Math.min(Math.max(FAB_MARGIN, side === "left" ? leftX : rightX), maxX),
    y: Math.min(Math.max(FAB_MARGIN, companion.y + FAB_SIZE - size.h), maxY),
    side,
  };
}

export function homeBesidePinnedChat(size: ChatSize): CompanionPos | null {
  if (!pinnedChat) return pos;
  const onRight = pinnedChat.side === "left";
  return clampFab({
    x: onRight ? pinnedChat.x + size.w + CHAT_GAP : pinnedChat.x - FAB_SIZE - CHAT_GAP,
    y: pinnedChat.y + size.h - FAB_SIZE,
  });
}
