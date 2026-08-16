"use client";

import { useState, type ReactNode } from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import { StudentProvider } from "./StudentContext";

interface DashboardLayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab?: (tab: string) => void;
}

export default function DashboardLayout({ children, activeTab, setActiveTab }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <StudentProvider>
      <div className="min-h-screen bg-[var(--bg-main)] font-sans text-[var(--text-main)]">
        <DashboardHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <DashboardSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <main className="mx-auto w-full max-w-[1440px] px-9 pt-7 pb-[60px]">{children}</main>
      </div>
    </StudentProvider>
  );
}
