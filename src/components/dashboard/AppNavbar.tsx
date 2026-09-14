"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  Bell,
  Check,
  LogOut,
  Settings,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react";
import { Avatar, Breadcrumb, IconButton, Menu } from "@/components/ui";
import { BrandMark } from "@/components/ui/BrandMark";
import { useDismiss } from "@/hooks/useOverlay";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/cn";
import { relativeNotificationTime } from "@/lib/notifications/client";
import { routes } from "@/lib/routes";
import { resolveBreadcrumb } from "./nav-config";

/**
 * Portal header.
 *
 * Sticky rather than `position: fixed` — the previous implementation offset a
 * fixed bar with a hardcoded spacer (`h-[6.25rem] sm:h-[6.85rem] lg:h-16`),
 * which drifted out of sync with the bar's real height at several breakpoints
 * and clipped page content. Sticky inside the scroll container needs no
 * spacer and can't fall out of alignment.
 *
 * Navigation itself lives in the sidebar/tab bar; this bar answers "where am
 * I" (breadcrumb) and holds account-level controls.
 */

function NotificationIcon({ type }: { type?: string }) {
  if (type === "reward") return <Trophy size={15} aria-hidden />;
  if (type === "system") return <Bell size={15} aria-hidden />;
  return <Sparkles size={15} aria-hidden />;
}

function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { notifications, unreadCount, openInbox, markAsRead, markAllAsRead } =
    useNotifications({ load: "summary" });

  useDismiss({ ref: wrapperRef, active: open, onDismiss: () => setOpen(false) });

  return (
    <div ref={wrapperRef} className="relative">
      <IconButton
        label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        variant="ghost"
        size="sm"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => {
            if (!v) openInbox();
            return !v;
          });
        }}
        className="relative"
      >
        <Bell size={18} aria-hidden />
        {unreadCount > 0 ? (
          <span
            aria-hidden
            className="type-numeric absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-surface bg-accent px-1 text-[10px] font-bold text-on-primary"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </IconButton>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.15 }}
            style={{ zIndex: "var(--z-dropdown)" }}
            className="absolute top-[calc(100%+8px)] right-0 flex w-[min(22rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-[var(--radius-md)] border border-line bg-surface shadow-[var(--shadow-lg)]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
              <h2 className="type-label m-0 text-ink">Notifications</h2>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={() => void markAllAsRead()}
                  className="type-caption inline-flex items-center gap-1 rounded-[var(--radius-sm)] font-semibold text-primary transition-opacity hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <Check size={13} aria-hidden />
                  Mark all read
                </button>
              ) : null}
            </div>

            <div className="max-h-[min(24rem,60vh)] overflow-y-auto overscroll-contain">
              {notifications.length === 0 ? (
                <p className="type-small px-4 py-8 text-center text-muted">
                  You&apos;re all caught up.
                </p>
              ) : (
                <ul className="list-none p-0">
                  {notifications.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => void markAsRead(item.id)}
                        className={cn(
                          "flex w-full items-start gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-0 hover:bg-sunken focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
                          !item.read && "bg-primary-soft/60",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                            item.read
                              ? "bg-sunken text-muted"
                              : "bg-primary-soft text-primary",
                          )}
                        >
                          <NotificationIcon type={item.type} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "type-small block text-ink",
                              item.read ? "font-medium" : "font-semibold",
                            )}
                          >
                            {item.title}
                            {!item.read ? (
                              <span className="sr-only"> (unread)</span>
                            ) : null}
                          </span>
                          {item.message || item.desc ? (
                            <span className="type-caption mt-0.5 block text-muted">
                              {item.message || item.desc}
                            </span>
                          ) : null}
                          {item.time ? (
                            <span className="type-caption mt-1 block text-faint">
                              {relativeNotificationTime(item.time)}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-line bg-sunken p-2">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push(routes.app.notifications);
                }}
                className="type-label w-full rounded-[var(--radius-sm)] py-2 font-semibold text-ink transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                View all notifications
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function AccountMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <Menu
      ariaLabel="Account"
      groups={[
        {
          id: "identity",
          items: [
            {
              id: "profile",
              label: "Profile",
              icon: <UserRound size={15} />,
              href: routes.app.profile,
            },
            {
              id: "settings",
              label: "Settings",
              icon: <Settings size={15} />,
              href: routes.app.settings,
            },
          ],
        },
        {
          id: "session",
          items: [
            {
              id: "sign-out",
              label: "Sign out",
              icon: <LogOut size={15} />,
              tone: "danger",
              onSelect: () => void signOut({ redirectUrl: "/" }),
            },
          ],
        },
      ]}
      trigger={({ open, toggle, ref }) => (
        <button
          ref={ref}
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label="Account menu"
          className="flex items-center gap-2 rounded-full p-0.5 transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <Avatar
            src={user?.imageUrl}
            name={user?.fullName || user?.username || "Account"}
            size="sm"
          />
        </button>
      )}
    />
  );
}

export default function AppNavbar({ onMenuOpen }: { onMenuOpen: () => void }) {
  const pathname = usePathname();
  const trail = resolveBreadcrumb(pathname);

  return (
    <header className="sticky top-0 border-b border-line bg-[var(--overlay-bg)] backdrop-blur-xl" style={{ zIndex: "var(--z-header)" }}>
      <div className="flex h-14 items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-5 lg:px-7">
        {/* Phone/tablet: logo + name. Desktop: sidebar already shows the
            brand, so this bar only needs the breadcrumb. */}
        <BrandMark
          href={routes.app.dashboard}
          size="sm"
          className="min-w-0 shrink-0 lg:hidden"
        />
        <div className="hidden min-w-0 flex-1 lg:block">
          <Breadcrumb items={trail} />
        </div>
        <div className="min-w-0 flex-1 lg:hidden" />

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <Link
            href={routes.app.store}
            data-companion-nav="store"
            data-companion-href={routes.app.store}
            className="type-label hidden rounded-[var(--radius-md)] border border-line px-3 py-1.5 font-semibold text-muted transition-colors hover:bg-sunken hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:inline-flex"
          >
            Store
          </Link>
          <NotificationBell />
          <AccountMenu />
        </div>
      </div>
    </header>
  );
}
