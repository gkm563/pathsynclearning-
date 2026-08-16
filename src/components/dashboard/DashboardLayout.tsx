"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { hrefForNavId } from "@/lib/routes";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab: string;
  /** Optional local state sync; navigation always uses the route registry. */
  setActiveTab?: (tab: string) => void;
}

/** Chrome only — auth + student data come from `(app)/(portal)/layout`. */
export default function DashboardLayout({
  children,
  activeTab,
  setActiveTab,
}: DashboardLayoutProps) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const onTabChange = (tab: string) => {
    setActiveTab?.(tab);
    router.push(hrefForNavId(tab));
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] font-sans text-[var(--text-main)]">
      <DashboardHeader
        activeTab={activeTab}
        setActiveTab={onTabChange}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <DashboardSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={onTabChange}
      />
      <main className="mx-auto w-full max-w-[1440px] px-9 pt-7 pb-[60px]">
        {children}
      </main>
    </div>
  );
}
