"use client";

import { useState, type ReactNode } from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";

/**
 * PortalShell — the ONE authenticated product chrome (header + sidebar + main).
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
      <DashboardHeader
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="mx-auto w-full max-w-[1440px] px-9 pt-7 pb-[60px]">
        {children}
      </main>
    </div>
  );
}
