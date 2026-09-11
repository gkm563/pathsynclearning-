"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, PanelLeftClose, Settings } from "lucide-react";
import { BrandMark } from "@/components/ui/BrandMark";
import { Avatar, Drawer, IconButton, Tooltip } from "@/components/ui";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { NAV_GROUPS, isNavItemActive, type NavItem } from "./nav-config";
import { useStudent } from "./StudentContext";

const SIDEBAR_COLLAPSED_KEY = "pathed.sidebar-collapsed";

const MOTION =
  "transition-[width,max-width,opacity,padding,margin,gap,transform] duration-[var(--duration-slow)] ease-[var(--ease-standard)] motion-reduce:transition-none";

/**
 * Portal navigation.
 *
 * Renders twice from one config:
 *  - `SidebarNav` inside a persistent column from `lg` up, because a career
 *    platform with ~20 destinations shouldn't hide them all behind a hamburger
 *    on a 1440px display;
 *  - the same list inside a `Drawer` below `lg`.
 *
 * Mounted only by `PortalShell` — the ESLint `no-restricted-imports` rule and
 * `scripts/check-portal-shell.mjs` enforce that views/pages never import it.
 */

function RailTip({
  label,
  enabled,
  children,
}: {
  label: string;
  enabled?: boolean;
  children: ReactNode;
}) {
  if (!enabled) return children;
  return (
    <Tooltip label={label} side="right" className="flex w-full justify-center">
      {children}
    </Tooltip>
  );
}

function Label({
  collapsed,
  children,
  className,
}: {
  collapsed?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "min-w-0 overflow-hidden whitespace-nowrap",
        MOTION,
        collapsed ? "max-w-0 flex-none opacity-0" : "max-w-[12rem] flex-1 opacity-100",
        className,
      )}
      aria-hidden={collapsed || undefined}
    >
      {children}
    </span>
  );
}

function NavLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <RailTip label={item.label} enabled={collapsed}>
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        aria-label={collapsed ? item.label : undefined}
        className={cn(
          "group relative flex items-center rounded-[var(--radius-md)]",
          "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
          MOTION,
          collapsed ? "h-10 w-10 justify-center px-0" : "min-h-10 w-full gap-2.5 px-2.5 py-2",
          active
            ? "bg-primary-soft font-semibold text-primary"
            : "font-medium text-muted hover:bg-sunken hover:text-ink",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "absolute top-1/2 -left-2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-primary",
            MOTION,
            collapsed || !active ? "opacity-0" : "opacity-100",
          )}
        />
        <Icon size={17} className="shrink-0" aria-hidden />
        <Label collapsed={collapsed} className="type-small">
          {item.label}
        </Label>
      </Link>
    </RailTip>
  );
}

function SidebarNav({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Portal sections"
      className={cn("flex flex-col", MOTION, collapsed ? "items-center gap-1" : "gap-5")}
    >
      {NAV_GROUPS.map((group) => (
        <div key={group.id} className={cn("w-full", collapsed && "flex flex-col items-center")}>
          <h2
            className={cn(
              "type-overline overflow-hidden px-2.5 text-faint",
              MOTION,
              collapsed
                ? "mb-0 max-h-0 opacity-0"
                : "mb-1.5 max-h-6 opacity-100",
            )}
          >
            {group.label}
          </h2>
          <ul
            className={cn(
              "m-0 flex list-none flex-col p-0",
              MOTION,
              collapsed ? "items-center gap-1" : "gap-0.5",
            )}
          >
            {group.items.map((item) => (
              <li key={item.id} className={collapsed ? undefined : "w-full"}>
                <NavLink
                  item={item}
                  active={isNavItemActive(pathname, item)}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Account summary + settings entry, shared by both presentations. */
function SidebarFooter({
  collapsed,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const student = useStudent();
  const pathname = usePathname();
  const degree = (student.degree?.split("·")[0] ?? "").trim();

  return (
    <div
      className={cn(
        "mt-auto border-t border-line",
        MOTION,
        collapsed
          ? "flex flex-col items-center gap-1 pt-2"
          : "flex flex-col gap-1.5 pt-3",
      )}
    >
      <RailTip label={student.name || "Your profile"} enabled={collapsed}>
        <Link
          href={routes.app.profile}
          onClick={onNavigate}
          aria-current={pathname === routes.app.profile ? "page" : undefined}
          aria-label={collapsed ? student.name || "Your profile" : undefined}
          className={cn(
            "flex items-center rounded-[var(--radius-md)] hover:bg-sunken",
            "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
            MOTION,
            collapsed ? "h-10 w-10 justify-center" : "w-full gap-2.5 p-2",
          )}
        >
          <Avatar name={student.name} size="sm" />
          <Label collapsed={collapsed}>
            <span className="type-label block truncate text-ink">
              {student.name || "Your profile"}
            </span>
            <span className="type-caption block truncate text-muted">
              {[degree, student.institute].filter(Boolean).join(" · ") ||
                "View profile"}
            </span>
          </Label>
          <ChevronRight
            size={14}
            aria-hidden
            className={cn(
              "shrink-0 text-faint",
              MOTION,
              collapsed ? "w-0 opacity-0" : "opacity-100",
            )}
          />
        </Link>
      </RailTip>

      <RailTip label="Settings" enabled={collapsed}>
        <Link
          href={routes.app.settings}
          onClick={onNavigate}
          aria-label={collapsed ? "Settings" : undefined}
          className={cn(
            "type-small flex items-center font-medium text-muted hover:bg-sunken hover:text-ink",
            "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
            MOTION,
            collapsed
              ? "h-10 w-10 justify-center"
              : "min-h-10 w-full gap-2.5 rounded-[var(--radius-md)] px-2.5 py-2",
          )}
        >
          <Settings size={17} className="shrink-0" aria-hidden />
          <Label collapsed={collapsed}>Settings</Label>
        </Link>
      </RailTip>
    </div>
  );
}

function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1");
    } catch {
      // private mode / blocked storage — keep expanded
    }
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  };

  return { collapsed, toggle };
}

/** Persistent sidebar column. Hidden below `lg`, where the drawer takes over. */
export function DesktopSidebar() {
  const { collapsed, toggle } = useSidebarCollapsed();

  return (
    <div
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col overflow-hidden border-r border-line bg-surface lg:flex",
        MOTION,
        collapsed ? "w-16" : "w-[16.5rem]",
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center overflow-hidden",
          MOTION,
          collapsed
            ? "h-auto flex-col justify-center gap-1 px-2 pt-2 pb-1"
            : "h-16 flex-row items-center justify-between gap-2 px-3",
        )}
      >
        <BrandMark
          href={routes.app.dashboard}
          size="sm"
          showWordmark={!collapsed}
          className={cn(MOTION, collapsed && "h-10 w-10 justify-center")}
        />
        <IconButton
          label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          size="sm"
          aria-expanded={!collapsed}
          aria-controls="portal-sidebar-nav"
          onClick={toggle}
          className={MOTION}
        >
          <PanelLeftClose
            size={18}
            className={cn(MOTION, collapsed && "rotate-180")}
          />
        </IconButton>
      </div>
      <div
        id="portal-sidebar-nav"
        className={cn(
          "hide-scrollbar min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain",
          MOTION,
          collapsed ? "px-2 py-1" : "px-3 pb-3",
        )}
      >
        <SidebarNav collapsed={collapsed} />
      </div>
      <div className={cn("shrink-0", MOTION, collapsed ? "px-2 pb-2" : "px-3 pb-3")}>
        <SidebarFooter collapsed={collapsed} />
      </div>
    </div>
  );
}

/** Slide-in navigation for tablet and phone viewports. */
export default function DashboardSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      side="left"
      title="Navigation"
      hideHeader
      className="lg:hidden"
    >
      <div className="flex min-h-full flex-col">
        <div className="mb-4 flex items-center justify-between">
          <BrandMark href={routes.app.dashboard} size="sm" showWordmark />
        </div>
        <SidebarNav onNavigate={onClose} />
        <SidebarFooter onNavigate={onClose} />
      </div>
    </Drawer>
  );
}
