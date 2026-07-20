import React, { useState } from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";

export default function DashboardLayout({ children, activeTab, setActiveTab }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", color: "var(--text-main)", fontFamily: "'Inter', sans-serif" }}>
      {/* Custom Dedicated Dashboard Header */}
      <DashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div style={{ display: "flex", width: "100%" }}>
        {/* Custom Dedicated Dashboard Side Panel */}
        <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        
        {/* Dashboard Main Content Body */}
        <main style={{ flex: 1, padding: "28px 36px 60px", overflowX: "hidden" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
