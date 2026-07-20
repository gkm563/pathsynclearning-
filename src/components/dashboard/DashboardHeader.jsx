import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, Sparkles, LayoutDashboard, Map, Zap, BookOpen, Newspaper, GraduationCap, Briefcase, Menu } from "lucide-react";

export default function DashboardHeader({ activeTab, setActiveTab, onToggleSidebar }) {
  const [mode, setMode] = useState("career"); // "career" or "academic"

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={17} /> },
    { id: "roadmap", label: "Roadmap", icon: <Map size={17} /> },
    { id: "challenges", label: "Challenges", icon: <Zap size={17} /> },
    { id: "memory-lane", label: "Memory Lane", icon: <BookOpen size={17} /> },
    { id: "technews", label: "TechNews", icon: <Newspaper size={17} /> },
  ];

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "var(--bg-card)",
      borderBottom: "1.5px solid var(--border-light)",
      backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      padding: "14px 36px", display: "flex", alignItems: "center", justifyContent: "space-between"
    }}>
      {/* Left: Sidebar Toggle Button + Brand Logo (Links to Student Landing Page '/') + Nav Links */}
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        
        {/* Menu Drawer Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          onClick={onToggleSidebar}
          style={{
            background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", borderRadius: 12,
            padding: "8px 12px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
            color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700
          }}
          title="Open Side Menu"
        >
          <Menu size={19} color="#6c63ff" />
          <span>Menu</span>
        </motion.button>

        {/* Brand Logo */}
        <Link to="/" style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "var(--text-main)", textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6c63ff, #00c9a7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 18, boxShadow: "0 4px 12px rgba(108,99,255,0.3)" }}>
            P
          </div>
          Path<span style={{ color: "#6c63ff" }}>Ed</span>
        </Link>

        {/* Top Navigation Shortcuts (Boosted Font Size & Comfort Spacing) */}
        <nav style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 12 }}>
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 14,
                  border: isActive ? "1.5px solid #6c63ff50" : "1px solid transparent",
                  background: isActive ? "linear-gradient(135deg, rgba(108,99,255,0.14), rgba(0,201,167,0.08))" : "transparent",
                  color: isActive ? "#6c63ff" : "var(--text-main)",
                  fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: isActive ? 800 : 600,
                  cursor: "pointer", transition: "all 0.2s ease"
                }}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Right: Career/Academic Mode Toggle, Notifications, Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        
        {/* CAREER ⟷ ACADEMIC MODE TOGGLE SWITCH */}
        <div style={{
          display: "flex", alignItems: "center", background: "var(--bg-alt)",
          border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 4
        }}>
          <button
            onClick={() => setMode("career")}
            style={{
              display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 20, border: "none",
              background: mode === "career" ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "transparent",
              color: mode === "career" ? "#ffffff" : "var(--text-muted)",
              fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer",
              transition: "all 0.2s ease", boxShadow: mode === "career" ? "0 4px 12px rgba(108,99,255,0.25)" : "none"
            }}
          >
            <Briefcase size={14} /> Career Mode
          </button>
          <button
            onClick={() => setMode("academic")}
            style={{
              display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 20, border: "none",
              background: mode === "academic" ? "linear-gradient(135deg, #f7971e, #00c9a7)" : "transparent",
              color: mode === "academic" ? "#ffffff" : "var(--text-muted)",
              fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer",
              transition: "all 0.2s ease", boxShadow: mode === "academic" ? "0 4px 12px rgba(247,151,30,0.25)" : "none"
            }}
          >
            <GraduationCap size={14} /> Academic Mode
          </button>
        </div>

        {/* Notification Bell */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => alert("Notifications: 2 new daily challenges dropped!")}
          style={{
            position: "relative", width: 42, height: 42, borderRadius: 14,
            background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-main)", cursor: "pointer"
          }}
        >
          <Bell size={18} />
          <span style={{ position: "absolute", top: 8, right: 8, width: 9, height: 9, borderRadius: "50%", background: "#ef4444" }} />
        </motion.button>

        {/* User Profile Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 12px 4px 4px", background: "var(--bg-alt)", borderRadius: 28, border: "1.5px solid var(--border-light)" }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #6c63ff, #00c9a7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff" }}>
            🎓
          </div>
          <div style={{ textAlign: "left", paddingRight: 4 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, color: "var(--text-main)", lineHeight: 1 }}>Rahul K.</div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "#6c63ff", fontWeight: 700 }}>SDE Trainee</div>
          </div>
        </div>
      </div>
    </header>
  );
}
