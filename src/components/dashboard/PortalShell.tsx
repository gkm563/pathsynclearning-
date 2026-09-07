"use client";

import { useState, type ReactNode } from "react";
import AppNavbar from "./AppNavbar";
import DashboardSidebar, { DesktopSidebar } from "./DashboardSidebar";
import MobileTabBar from "./MobileTabBar";

/**
 * PortalShell — the ONE authenticated product chrome.
 *
 * Ownership rule (enforced by `no-restricted-imports` in eslint.config.mjs and
 * by `scripts/check-portal-shell.mjs`):
 * - rendered ONLY from `src/app/(app)/(portal)/layout.tsx`
 * - views (`src/views/**`) and route `page.tsx` files must NEVER wrap this
 * - nested layouts under `/dashboard` must NOT re-mount this shell
 *
 * Layout: a two-column flex row where the sidebar is its own scroll context
 * and the content column scrolls the document. That lets the header be
 * `sticky` (no fixed-position spacer to keep in sync) and lets the sidebar
 * stay put while long pages scroll.
 */
export default function PortalShell({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-dvh bg-canvas text-ink">
      <DesktopSidebar />

      {/* Drawer navigation for < lg. Renders in a portal; the empty state
          costs nothing when closed. */}
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* min-w-0 is load-bearing: without it a wide child (code editor, table,
          roadmap canvas) stretches this column past the viewport and
          reintroduces page-level horizontal scroll. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <AppNavbar onMenuOpen={() => setIsSidebarOpen(true)} />

        <main
          id="main"
          className="mx-auto w-full min-w-0 max-w-[var(--measure-content)] flex-1 px-4 pt-5 pb-[calc(var(--mobile-tabbar-height)+1rem+env(safe-area-inset-bottom,0px))] sm:px-6 sm:pt-6 lg:px-8 lg:pb-14"
        >
          {children}
        </main>

        <MobileTabBar onMoreOpen={() => setIsSidebarOpen(true)} />
      </div>
    </div>
  );
}
