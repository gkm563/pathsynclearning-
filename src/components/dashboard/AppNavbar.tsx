"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  BarChart2,
  Bell,
  BookOpen,
  Briefcase,
  Check,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Newspaper,
  UserRound,
  Zap,
} from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { relativeNotificationTime } from "@/lib/notifications/client";
import { routes } from "@/lib/routes";

type FocusMode = "career" | "academic";

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  match: "exact" | "prefix";
};

const PRIMARY_NAV: NavItem[] = [
  {
    href: routes.app.dashboard,
    label: "Home",
    icon: <LayoutDashboard size={15} />,
    match: "exact",
  },
  {
    href: routes.app.roadmap,
    label: "Roadmap",
    icon: <Map size={15} />,
    match: "prefix",
  },
  {
    href: routes.app.challenges,
    label: "Challenges",
    icon: <Zap size={15} />,
    match: "prefix",
  },
  {
    href: routes.app.memoryLane,
    label: "Memory Lane",
    icon: <BookOpen size={15} />,
    match: "prefix",
  },
  {
    href: routes.app.progress,
    label: "Progress",
    icon: <BarChart2 size={15} />,
    match: "prefix",
  },
  {
    href: routes.app.techNews,
    label: "Tech News",
    icon: <Newspaper size={15} />,
    match: "prefix",
  },
];

function isNavActive(pathname: string | null, item: NavItem): boolean {
  if (!pathname) return false;
  if (item.match === "exact") return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function notificationIcon(type?: string): string {
  if (type === "system") return "🔔";
  if (type === "reward") return "🏆";
  return "✨";
}

type AppNavbarProps = {
  onMenuOpen: () => void;
};

export default function AppNavbar({ onMenuOpen }: AppNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();
  const { signOut } = useClerk();

  const [focusMode, setFocusMode] = useState<FocusMode>("career");
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    openInbox,
    markAsRead,
    markAllAsRead,
  } = useNotifications({ load: "summary" });

  useEffect(() => {
    if (!isPanelOpen && !isAccountOpen) return;

    const onPointerDown = (event: globalThis.MouseEvent) => {
      const target = event.target as Node;
      if (!panelRef.current?.contains(target)) setIsPanelOpen(false);
      if (!accountRef.current?.contains(target)) setIsAccountOpen(false);
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPanelOpen(false);
        setIsAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [isPanelOpen, isAccountOpen]);

  const handleMarkAllAsRead = async (event: ReactMouseEvent) => {
    event.stopPropagation();
    await markAllAsRead();
  };

  return (
    <>
    <header className="fixed top-0 right-0 left-0 z-[100] border-b border-[var(--border-light)] bg-[var(--bg-card)]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between gap-3 px-4 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
        {/* Left: menu + brand + primary nav */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onMenuOpen}
            aria-label="Open navigation menu"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border-light)] bg-[var(--bg-alt)] text-[var(--text-main)] transition-colors hover:bg-[var(--bg-alt)]/80 sm:h-10 sm:w-10"
          >
            <Menu size={18} />
          </button>

          <Link
            href={routes.app.dashboard}
            className="flex shrink-0 items-center gap-2"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-[#6c63ff] to-[#00c9a7] text-sm font-extrabold text-white sm:h-9 sm:w-9 sm:text-base">
              P
            </span>
            <span className="hidden text-lg font-extrabold tracking-tight text-[var(--text-main)] sm:inline">
              Path<span className="text-[#6c63ff]">Ed</span>
            </span>
          </Link>

          <nav
            aria-label="Primary"
            className="ml-1 hidden min-w-0 items-center gap-0.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-alt)] p-1 lg:flex"
          >
            {PRIMARY_NAV.map((item) => {
              const active = isNavActive(pathname, item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[13px] font-semibold transition-colors xl:gap-2 xl:px-3",
                    active
                      ? "bg-[var(--bg-card)] text-[#6c63ff] shadow-sm"
                      : "text-[var(--text-muted)] hover:bg-[var(--bg-card)]/70 hover:text-[var(--text-main)]",
                  ].join(" ")}
                >
                  {item.icon}
                  <span className="hidden xl:inline">{item.label}</span>
                  <span className="xl:hidden">
                    {item.label === "Memory Lane"
                      ? "Memory"
                      : item.label === "Tech News"
                        ? "News"
                        : item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: focus mode + notifications + account */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div
            role="group"
            aria-label="Focus mode"
            className="flex items-center gap-0.5 rounded-xl border border-[var(--border-light)] bg-[var(--bg-alt)] p-1"
          >
            <button
              type="button"
              onClick={() => setFocusMode("career")}
              aria-pressed={focusMode === "career"}
              className={[
                "inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors sm:px-2.5 sm:text-[13px]",
                focusMode === "career"
                  ? "bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)]",
              ].join(" ")}
            >
              <Briefcase size={14} />
              <span className="hidden md:inline">Career</span>
            </button>
            <button
              type="button"
              onClick={() => setFocusMode("academic")}
              aria-pressed={focusMode === "academic"}
              className={[
                "inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors sm:px-2.5 sm:text-[13px]",
                focusMode === "academic"
                  ? "bg-[var(--bg-card)] text-[var(--text-main)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-main)]",
              ].join(" ")}
            >
              <GraduationCap size={14} />
              <span className="hidden md:inline">Academic</span>
            </button>
          </div>

          <div className="relative" ref={panelRef}>
            <button
              type="button"
              onClick={() => {
                setIsAccountOpen(false);
                setIsPanelOpen((open) => {
                  const next = !open;
                  if (next) openInbox();
                  return next;
                });
              }}
              aria-label="Notifications"
              aria-expanded={isPanelOpen}
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border-light)] bg-[var(--bg-alt)] text-[var(--text-main)] transition-colors hover:bg-[var(--bg-alt)]/80 sm:h-10 sm:w-10"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-[var(--bg-card)] bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isPanelOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-[calc(100%+8px)] right-0 z-[200] w-[min(340px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[var(--border-light)] bg-[var(--bg-card)] shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
                >
                  <div className="flex items-center justify-between gap-3 border-b border-[var(--border-light)] px-4 py-3">
                    <p className="text-sm font-bold text-[var(--text-main)]">
                      Notifications
                    </p>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllAsRead}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#6c63ff] hover:opacity-80"
                      >
                        <Check size={14} />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-[var(--text-muted)]">
                        You&apos;re all caught up.
                      </p>
                    ) : (
                      notifications.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => markAsRead(item.id)}
                          className={[
                            "flex w-full items-start gap-3 border-l-[3px] px-4 py-3 text-left transition-colors hover:bg-[var(--bg-alt)]",
                            item.read
                              ? "border-transparent"
                              : "border-[#6c63ff] bg-[rgba(108,99,255,0.04)]",
                          ].join(" ")}
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--bg-alt)] text-base">
                            {notificationIcon(item.type)}
                          </span>
                          <span className="min-w-0">
                            <span
                              className={[
                                "block truncate text-sm text-[var(--text-main)]",
                                item.read ? "font-medium" : "font-bold",
                              ].join(" ")}
                            >
                              {item.title}
                            </span>
                            <span className="mt-0.5 block text-xs leading-relaxed text-[var(--text-muted)]">
                              {item.message || item.desc}
                            {item.time ? (
                              <span className="mt-1 block text-[10px] text-[var(--text-light)]">
                                {relativeNotificationTime(item.time)}
                              </span>
                            ) : null}
                            </span>
                          </span>
                        </button>
                      ))
                    )}
                  </div>

                  <div className="border-t border-[var(--border-light)] p-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPanelOpen(false);
                        router.push(routes.app.notifications);
                      }}
                      className="w-full rounded-lg border border-[var(--border-light)] px-3 py-2 text-sm font-semibold text-[var(--text-main)] transition-colors hover:bg-[var(--bg-alt)]"
                    >
                      View all
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative pl-0.5 sm:pl-1" ref={accountRef}>
            <button
              type="button"
              onClick={() => {
                setIsPanelOpen(false);
                setIsAccountOpen((open) => !open);
              }}
              aria-label="Account menu"
              aria-expanded={isAccountOpen}
              className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[var(--border-light)] bg-[var(--bg-alt)]"
            >
              {user?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-xs font-bold text-[var(--text-main)]">
                  {(user?.firstName?.[0] || user?.username?.[0] || "U").toUpperCase()}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isAccountOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-[calc(100%+8px)] right-0 z-[200] w-52 overflow-hidden rounded-2xl border border-[var(--border-light)] bg-[var(--bg-card)] shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
                >
                  <div className="border-b border-[var(--border-light)] px-3 py-2.5">
                    <p className="truncate text-sm font-bold text-[var(--text-main)]">
                      {user?.fullName || user?.username || "Account"}
                    </p>
                    <p className="truncate text-xs text-[var(--text-muted)]">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                  <Link
                    href={routes.app.profile}
                    onClick={() => setIsAccountOpen(false)}
                    className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-[var(--text-main)] hover:bg-[var(--bg-alt)]"
                  >
                    <UserRound size={15} />
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsAccountOpen(false);
                      await signOut({ redirectUrl: "/" });
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold text-[var(--text-muted)] hover:bg-[var(--bg-alt)]"
                  >
                    <LogOut size={15} />
                    Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Compact primary nav for tablet / small desktop */}
      <nav
        aria-label="Primary compact"
        className="flex gap-1 overflow-x-auto border-t border-[var(--border-light)] px-4 py-2 sm:px-6 lg:hidden"
      >
        {PRIMARY_NAV.map((item) => {
          const active = isNavActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                active
                  ? "bg-[var(--bg-alt)] text-[#6c63ff]"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-alt)] hover:text-[var(--text-main)]",
              ].join(" ")}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
    {/* Spacer matches fixed navbar height so page content isn't covered */}
    <div
      aria-hidden
      className="h-[6.25rem] shrink-0 sm:h-[6.85rem] lg:h-16"
    />
    </>
  );
}
