import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, Search, Sparkles, LayoutDashboard, Map, Zap, BookOpen, Newspaper, GraduationCap, Briefcase } from "lucide-react";

export default function DashboardHeader({ activeTab, setActiveTab }) {
  const [mode, setMode] = useState("career"); // "career" or "academic"

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={15} /> },
    { id: "roadmap", label: "Roadmap", icon: <Map size={15} /> },
    { id: "challenges", label: "Challenges", icon: <Zap size={15} /> },
    { id: "memory-lane", label: "Memory Lane", icon: <BookOpen size={15} /> },
    { id: "technews", label: "TechNews", icon: <Newspaper size={15} /> },
  ];

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "var(--bg-card)",
      borderBottom: "1.5px solid var(--border-light)",
      backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      padding: "12px 32px", display: "flex", alignItems: "center", justifyContent: "space-between"
    }}>
      {/* Left: Brand Logo (Links to Student Landing Page '/') & Shortcuts */}
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <Link to="/" style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: "var(--text-main)", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, #6c63ff, #00c9a7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 16 }}>
            P
          </div>
          Path<span style={{ color: "#6c63ff" }}>Ed</span>
        </Link>

        {/* Top Navigation Shortcuts */}
        <nav style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 7, padding: "8px 14px", borderRadius: 12,
                  border: isActive ? "1px solid #6c63ff40" : "1px solid transparent",
                  background: isActive ? "rgba(108,99,255,0.12)" : "transparent",
                  color: isActive ? "#6c63ff" : "var(--text-muted)",
                  fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: isActive ? 700 : 500,
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

      {/* Right: Career/Academic Mode Toggle, Search, Notifications, Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        
        {/* CAREER ⟷ ACADEMIC MODE TOGGLE SWITCH */}
        <div style={{
          display: "flex", alignItems: "center", background: "var(--bg-alt)",
          border: "1px solid var(--border-light)", borderRadius: 20, padding: 3
        }}>
          <button
            onClick={() => setMode("career")}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 16, border: "none",
              background: mode === "career" ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "transparent",
              color: mode === "career" ? "#ffffff" : "var(--text-muted)",
              fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <Briefcase size={13} /> Career
          </button>
          <button
            onClick={() => setMode("academic")}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 16, border: "none",
              background: mode === "academic" ? "linear-gradient(135deg, #f7971e, #00c9a7)" : "transparent",
              color: mode === "academic" ? "#ffffff" : "var(--text-muted)",
              fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 700, cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <GraduationCap size={13} /> Academic
          </button>
        </div>

        {/* Quick Search */}
        <div style={{ position: "relative", width: 180 }}>
          <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search skills..."
            style={{
              width: "100%", padding: "7px 12px 7px 32px", background: "var(--bg-alt)",
              border: "1px solid var(--border-light)", borderRadius: 20,
              fontSize: 12, color: "var(--text-main)", outline: "none",
              transition: "all 0.2s"
            }}
            onFocus={(e) => e.target.style.borderColor = "#6c63ff"}
            onBlur={(e) => e.target.style.borderColor = "var(--border-light)"}
          />
        </div>

        {/* Notification Bell */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => alert("Notifications: 2 new daily challenges dropped!")}
          style={{
            position: "relative", width: 36, height: 36, borderRadius: 12,
            background: "var(--bg-alt)", border: "1px solid var(--border-light)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-main)", cursor: "pointer"
          }}
        >
          <Bell size={16} />
          <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
        </motion.button>

        {/* User Profile Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px 4px 4px", background: "var(--bg-alt)", borderRadius: 24, border: "1px solid var(--border-light)" }}>
          <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #6c63ff, #00c9a7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff" }}>
            🎓
          </div>
          <div style={{ textAlign: "left", paddingRight: 4 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 700, color: "var(--text-main)", lineHeight: 1 }}>Rahul K.</div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: "#6c63ff", fontWeight: 600 }}>SDE Trainee</div>
          </div>
        </div>
      </div>
    </header>
  );
}
