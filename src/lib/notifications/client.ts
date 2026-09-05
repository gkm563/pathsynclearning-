"use client";

import { apiSend } from "@/lib/api";
import type { AppNotification, NotificationListPayload, NotificationSummary } from "./types";

const SUMMARY_URL = "/api/me/notifications?view=summary";
const LIST_URL = "/api/me/notifications";
const SUMMARY_TTL_MS = 120_000;
const LIST_TTL_MS = 60_000;

type Store = {
  unreadCount: number;
  latestAt: string | null;
  items: AppNotification[] | null;
  loadingSummary: boolean;
  loadingList: boolean;
  summaryFetchedAt: number;
  listFetchedAt: number;
  summaryEtag: string | null;
  listEtag: string | null;
};

const store: Store = {
  unreadCount: 0,
  latestAt: null,
  items: null,
  loadingSummary: false,
  loadingList: false,
  summaryFetchedAt: 0,
  listFetchedAt: 0,
  summaryEtag: null,
  listEtag: null,
};

const listeners = new Set<() => void>();
let summaryInflight: Promise<void> | null = null;
let listInflight: Promise<void> | null = null;

function emit() {
  listeners.forEach((listener) => listener());
}

export function getNotificationSnapshot(): Store {
  return store;
}

export function subscribeNotifications(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function applySummary(payload: NotificationSummary) {
  store.unreadCount = payload.unreadCount;
  store.latestAt = payload.latestAt;
  store.summaryFetchedAt = Date.now();
}

function applyList(payload: NotificationListPayload) {
  store.items = payload.notifications;
  store.unreadCount = payload.unreadCount;
  store.latestAt = payload.latestAt;
  store.listFetchedAt = Date.now();
  store.summaryFetchedAt = Date.now();
}

async function fetchJson<T>(
  url: string,
  etag: string | null,
): Promise<{ status: number; body: T | null; etag: string | null }> {
  const res = await fetch(url, {
    credentials: "include",
    cache: "no-store",
    headers: etag ? { "If-None-Match": etag } : undefined,
  });
  const nextEtag = res.headers.get("etag");
  if (res.status === 304) {
    return { status: 304, body: null, etag: nextEtag ?? etag };
  }
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return {
    status: res.status,
    body: (await res.json()) as T,
    etag: nextEtag,
  };
}

export async function refreshNotificationSummary(force = false): Promise<void> {
  if (!force && Date.now() - store.summaryFetchedAt < SUMMARY_TTL_MS) return;
  if (!force && store.items && Date.now() - store.listFetchedAt < LIST_TTL_MS) return;
  if (listInflight) return listInflight;
  if (summaryInflight) return summaryInflight;

  store.loadingSummary = true;
  emit();

  summaryInflight = (async () => {
    try {
      const result = await fetchJson<NotificationSummary>(SUMMARY_URL, store.summaryEtag);
      if (result.status !== 304 && result.body) {
        applySummary(result.body);
      } else {
        store.summaryFetchedAt = Date.now();
      }
      if (result.etag) store.summaryEtag = result.etag;
    } catch {
      store.summaryFetchedAt = Date.now();
    } finally {
      store.loadingSummary = false;
      summaryInflight = null;
      emit();
    }
  })();

  return summaryInflight;
}

export async function refreshNotificationList(force = false): Promise<void> {
  if (!force && store.items && Date.now() - store.listFetchedAt < LIST_TTL_MS) return;
  if (listInflight) return listInflight;

  store.loadingList = true;
  emit();

  listInflight = (async () => {
    try {
      const result = await fetchJson<NotificationListPayload>(LIST_URL, store.listEtag);
      if (result.status !== 304 && result.body) {
        applyList(result.body);
      } else {
        store.listFetchedAt = Date.now();
        store.summaryFetchedAt = Date.now();
      }
      if (result.etag) store.listEtag = result.etag;
    } catch {
      if (!store.items) store.items = [];
      store.listFetchedAt = Date.now();
    } finally {
      store.loadingList = false;
      listInflight = null;
      emit();
    }
  })();

  return listInflight;
}

export async function markNotificationRead(id: string): Promise<void> {
  if (store.items) {
    store.items = store.items.map((item) =>
      item.id === id ? { ...item, read: true } : item,
    );
    store.unreadCount = store.items.filter((item) => !item.read).length;
    emit();
  } else {
    store.unreadCount = Math.max(0, store.unreadCount - 1);
    emit();
  }

  try {
    const payload = await apiSend<NotificationListPayload>(LIST_URL, "PATCH", {
      id,
      read: true,
    });
    applyList(payload);
    emit();
  } catch {
    // keep optimistic UI
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  if (store.items) {
    store.items = store.items.map((item) => ({ ...item, read: true }));
  }
  store.unreadCount = 0;
  emit();

  try {
    const payload = await apiSend<NotificationListPayload>(LIST_URL, "PATCH", {
      markAllRead: true,
    });
    applyList(payload);
    emit();
  } catch {
    // keep optimistic UI
  }
}

export async function deleteNotification(id: string): Promise<void> {
  if (store.items) {
    const removed = store.items.find((item) => item.id === id);
    store.items = store.items.filter((item) => item.id !== id);
    if (removed && !removed.read) {
      store.unreadCount = Math.max(0, store.unreadCount - 1);
    }
    emit();
  }

  try {
    const payload = await apiSend<NotificationListPayload>(LIST_URL, "DELETE", { id });
    applyList(payload);
    emit();
  } catch {
    // keep optimistic UI
  }
}

export async function clearAllNotifications(): Promise<void> {
  store.items = [];
  store.unreadCount = 0;
  store.latestAt = null;
  emit();

  try {
    const payload = await apiSend<NotificationListPayload>(LIST_URL, "DELETE", {
      clearAll: true,
    });
    applyList(payload);
    emit();
  } catch {
    // keep optimistic UI
  }
}

export function relativeNotificationTime(iso: string | Date | undefined): string {
  if (!iso) return "";
  const date = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso);
  const diff = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.round(diff / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
