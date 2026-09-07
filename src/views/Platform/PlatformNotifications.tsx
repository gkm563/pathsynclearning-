"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  UserRound,
  Users,
} from "lucide-react";
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  IconButton,
  ListSkeleton,
  PageHeader,
  Tabs,
  useToast,
} from "@/components/ui";
import { useNotifications } from "@/hooks/useNotifications";
import { relativeNotificationTime } from "@/lib/notifications/client";
import { cn } from "@/lib/cn";

type FilterId = "all" | "unread" | "invites" | "mentor";

export default function PlatformNotifications() {
  const toast = useToast();
  const {
    notifications,
    unreadCount,
    loadingList,
    markAsRead,
    markAllAsRead,
    deleteItem,
    clearAll,
  } = useNotifications({ load: "list" });

  const [filter, setFilter] = useState<FilterId>("all");
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = useMemo(
    () =>
      notifications.filter((n) => {
        if (filter === "unread") return !n.read;
        if (filter === "invites") return n.type === "invite";
        if (filter === "mentor") return n.type === "mentor";
        return true;
      }),
    [notifications, filter],
  );

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    toast.success("Marked all notifications as read");
  };

  const handleClearAll = async () => {
    await clearAll();
    setConfirmClear(false);
    toast.info("Notifications cleared");
  };

  const handleAcceptInvite = (id: string, teamName?: string) => {
    void markAsRead(id);
    toast.success({
      title: "Invite accepted",
      description: `You joined ${teamName ?? "the team"}.`,
    });
  };

  const handleDeclineInvite = (id: string) => {
    void markAsRead(id);
    toast.info("Invitation declined");
  };

  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Notifications"
        description="Challenge updates, collaboration invites and mentor feedback — in one place."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              disabled={notifications.length === 0 || unreadCount === 0}
              onClick={() => void handleMarkAllRead()}
            >
              <CheckCheck size={15} aria-hidden />
              Mark all read
            </Button>
            <Button
              variant="danger"
              disabled={notifications.length === 0}
              onClick={() => setConfirmClear(true)}
            >
              <Trash2 size={15} aria-hidden />
              Clear all
            </Button>
          </div>
        }
      />

      <Tabs<FilterId>
        items={[
          { id: "all", label: "All", badge: notifications.length || undefined },
          { id: "unread", label: "Unread", badge: unreadCount || undefined },
          { id: "invites", label: "Invites" },
          { id: "mentor", label: "Mentor" },
        ]}
        value={filter}
        onChange={setFilter}
        ariaLabel="Notification filters"
        className="mb-5"
      />

      {loadingList && notifications.length === 0 ? (
        <ListSkeleton count={5} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Bell size={20} aria-hidden />}
          title={
            filter === "all"
              ? "You're all caught up"
              : "Nothing matches this filter"
          }
          description={
            filter === "all"
              ? "New challenge updates, team invites and mentor notes will appear here."
              : "Try another filter, or clear it to see everything."
          }
          action={
            filter !== "all" ? (
              <Button variant="secondary" onClick={() => setFilter("all")}>
                Show all
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {filtered.map((n) => (
            <li key={n.id}>
              <Card
                className={cn(
                  "flex gap-4",
                  !n.read && "border-primary-border bg-primary-soft/40",
                )}
              >
                <span
                  className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-sunken text-primary"
                  aria-hidden
                >
                  {n.type === "invite" ? (
                    <Users size={18} />
                  ) : n.type === "mentor" ? (
                    <UserRound size={18} />
                  ) : (
                    <Bell size={18} />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="type-h4 m-0 text-ink">{n.title}</h3>
                        {!n.read ? <Badge tone="accent">New</Badge> : null}
                      </div>
                      <p className="type-caption mt-1 mb-0 text-faint">
                        {relativeNotificationTime(n.time)}
                      </p>
                    </div>
                    <IconButton
                      label="Remove notification"
                      onClick={() => void deleteItem(n.id)}
                    >
                      <Trash2 size={15} />
                    </IconButton>
                  </div>

                  <p className="type-small mt-2 mb-0 text-muted">
                    {n.desc || n.message}
                  </p>

                  {n.actionable ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleAcceptInvite(n.id, n.teamName)}
                      >
                        Accept invite
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDeclineInvite(n.id)}
                      >
                        Decline
                      </Button>
                    </div>
                  ) : null}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={confirmClear}
        tone="danger"
        title="Clear all notifications?"
        description="This removes every item from your inbox. Unread items will be gone too."
        confirmLabel="Clear all"
        onClose={() => setConfirmClear(false)}
        onConfirm={() => void handleClearAll()}
      />
    </>
  );
}
