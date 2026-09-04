"use client";

import { useState, type ReactNode } from "react";
import AppNavbar from "./AppNavbar";
import DashboardSidebar from "./DashboardSidebar";

/**
 * PortalShell — the ONE authenticated product chrome (navbar + sidebar + main).
 *
 * Ownership rule (industry standard for App Router):
 * - Rendered ONLY from `src/app/(app)/(portal)/layout.tsx`
 * - Views (`src/views/**`) and route `page.tsx` files must NEVER wrap this
 * - Nested layouts under `/dashboard` must NOT re-mount this shell
 *
 * Violating this causes duplicate nav (double header). ESLint enforces the ban.
 */
export default function PortalShell({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-sans text-[var(--text-main)]">
      <AppNavbar onMenuOpen={() => setIsSidebarOpen(true)} />
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="mx-auto w-full max-w-[1440px] px-4 pt-6 pb-14 sm:px-6 sm:pt-7 sm:pb-16 lg:px-8">
        {children}
      </main>
    </div>
  );
}
