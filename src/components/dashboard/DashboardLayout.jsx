import React, { useState } from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";

export default function DashboardLayout({ children, activeTab, setActiveTab }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", color: "var(--text-main)", fontFamily: "'Inter', sans-serif" }}>
      {/* Custom Dedicated Dashboard Header */}
      <DashboardHeader 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
      />
      
      {/* Slide-over Drawer Sidebar (Hidden by default, opens smoothly on Menu click) */}
      <DashboardSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
      
      {/* Dashboard Main Content Body (Full 100% Screen Width!) */}
      <main style={{ width: "100%", maxWidth: 1440, margin: "0 auto", padding: "28px 36px 60px" }}>
        {children}
      </main>
    </div>
  );
}
