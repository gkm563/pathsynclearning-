"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import {
  clearAllNotifications,
  deleteNotification,
  getNotificationSnapshot,
  markAllNotificationsRead,
  markNotificationRead,
  refreshNotificationList,
  refreshNotificationSummary,
  subscribeNotifications,
} from "@/lib/notifications/client";

type UseNotificationsOptions = {
  load?: "summary" | "list";
};

export function useNotifications(options: UseNotificationsOptions = {}) {
  const load = options.load ?? "summary";
  const snapshot = useSyncExternalStore(
    subscribeNotifications,
    getNotificationSnapshot,
    getNotificationSnapshot,
  );

  useEffect(() => {
    if (load === "list") {
      void refreshNotificationList();
      return;
    }
    void refreshNotificationSummary();
  }, [load]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      void refreshNotificationSummary();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, []);

  const openInbox = useCallback(() => {
    void refreshNotificationList();
  }, []);

  return {
    notifications: snapshot.items ?? [],
    unreadCount: snapshot.unreadCount,
    loadingList: snapshot.loadingList,
    loadingSummary: snapshot.loadingSummary,
    openInbox,
    refreshList: refreshNotificationList,
    markAsRead: markNotificationRead,
    markAllAsRead: markAllNotificationsRead,
    deleteItem: deleteNotification,
    clearAll: clearAllNotifications,
  };
}
