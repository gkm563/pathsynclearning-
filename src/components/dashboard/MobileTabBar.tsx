"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";
import { getMobileTabs, isNavItemActive } from "./nav-config";

/**
 * Bottom tab bar for phone viewports.
 *
 * A sidebar shrunk into a hamburger puts every destination two taps away at
 * the top of the screen — the hardest place to reach one-handed. A tab bar
 * keeps the four most-used sections one thumb-tap away and hands everything
 * else to the drawer via "More".
 *
 * Hidden from `lg` up, where the persistent sidebar covers the same ground.
 * `fixed` (not sticky) so overflow:hidden on a page — roadmap, profile —
 * cannot unstick it from the viewport.
 */
export default function MobileTabBar({ onMoreOpen }: { onMoreOpen: () => void }) {
  const pathname = usePathname();
  const tabs = getMobileTabs();

  const itemClass =
    "flex flex-1 flex-col items-center justify-center gap-1 rounded-[var(--radius-sm)] py-1.5 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring";

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 border-t border-line bg-[var(--overlay-bg)] backdrop-blur-xl lg:hidden"
      style={{
        zIndex: "var(--z-header)",
        // Clears the iOS home indicator so the last row stays tappable.
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <ul className="flex list-none items-stretch gap-0.5 px-1.5 py-1">
        {tabs.map((item) => {
          const active = isNavItemActive(pathname, item);
          const Icon = item.icon;
          return (
            <li key={item.id} className="flex min-w-0 flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                data-companion-nav={item.id}
                data-companion-href={item.href}
                className={cn(
                  itemClass,
                  // 48px minimum target height.
                  "min-h-12",
                  active ? "text-primary" : "text-muted",
                )}
              >
                <Icon size={19} aria-hidden />
                <span className="type-caption max-w-full truncate font-semibold">
                  {item.shortLabel ?? item.label}
                </span>
              </Link>
            </li>
          );
        })}
        <li className="flex min-w-0 flex-1">
          <button
            type="button"
            onClick={onMoreOpen}
            aria-haspopup="dialog"
            className={cn(itemClass, "min-h-12 text-muted")}
          >
            <MoreHorizontal size={19} aria-hidden />
            <span className="type-caption font-semibold">More</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
