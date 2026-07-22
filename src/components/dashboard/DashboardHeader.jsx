import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, Sparkles, LayoutDashboard, Map, Zap, BookOpen, BarChart2, Newspaper, GraduationCap, Briefcase, Menu } from "lucide-react";

export default function DashboardHeader({ activeTab, setActiveTab, onToggleSidebar }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState("career"); // "career" or "academic"

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={15} /> },
    { id: "roadmap", label: "Roadmap", icon: <Map size={15} /> },
    { id: "challenges", label: "Challenges", icon: <Zap size={15} /> },
    { id: "memory-lane", label: "Memory Lane", icon: <BookOpen size={15} /> },
    { id: "progress", label: "Progress", icon: <BarChart2 size={15} /> },
    { id: "technews", label: "TechNews", icon: <Newspaper size={15} /> },
  ];

  const handleNavClick = (itemId) => {
    if (itemId === "dashboard") {
      navigate("/dashboard");
    } else if (itemId === "roadmap") {
      navigate("/roadmap");
    } else if (itemId === "challenges") {
      navigate("/challenges");
    } else if (itemId === "memory-lane") {
      navigate("/memory-lane");
    } else if (itemId === "progress") {
      navigate("/progress");
    } else if (itemId === "mentorship") {
      navigate("/mentorship");
    } else if (itemId === "project-collab") {
      navigate("/project-collab");
    } else if (itemId === "hacksquad") {
      navigate("/hacksquad");
    } else if (itemId === "hack-attack") {
      navigate("/og-opportunities");
    } else if (itemId === "events") {
      navigate("/events");
    } else if (itemId === "alumni-network") {
      navigate("/alumni-network");
    } else if (itemId === "technews") {
      navigate("/technews");
    } else if (itemId === "placement-inbox") {
      navigate("/placement-inbox");
    } else if (itemId === "placement-insights") {
      navigate("/placement-insights");
    } else if (itemId === "records-certs") {
      navigate("/records-certs");
    } else {
      if (window.location.pathname !== "/dashboard" && window.location.pathname !== "/platform") {
        navigate(`/dashboard?tab=${itemId}`);
      } else {
        if (setActiveTab) setActiveTab(itemId);
      }
    }
  };

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "var(--bg-card)",
      borderBottom: "1.5px solid var(--border-light)",
      backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      padding: "12px 28px", display: "flex", alignItems: "center", justifyContent: "space-between"
    }}>
      {/* Left: Sidebar Menu Toggle + Brand Logo + Header Navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        
        {/* Menu Drawer Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleSidebar}
          style={{
            background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", borderRadius: 12,
            padding: "7px 12px", display: "flex", alignItems: "center", gap: 7, cursor: "pointer",
            color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700
          }}
          title="Open Side Menu"
        >
          <Menu size={18} color="#6c63ff" />
          <span>Menu</span>
        </motion.button>

        {/* Brand Logo */}
        <Link to="/" style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: "var(--text-main)", textDecoration: "none", display: "flex", alignItems: "center", gap: 8, marginRight: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, #6c63ff, #00c9a7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 16, boxShadow: "0 4px 12px rgba(108,99,255,0.3)" }}>
            P
          </div>
          <span>Path<span style={{ color: "#6c63ff" }}>Ed</span></span>
        </Link>

        {/* Header Navigation Links */}
        <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 12,
                  border: isActive ? "1.5px solid #6c63ff50" : "1px solid transparent",
                  background: isActive ? "rgba(108,99,255,0.12)" : "transparent",
                  color: isActive ? "#6c63ff" : "var(--text-main)",
                  fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: isActive ? 800 : 600,
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

      {/* Right: Mode Toggle (with ample margin-left gap), Notifications, Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        
        {/* CAREER ⟷ ACADEMIC MODE TOGGLE SWITCH (Clear gap from TechNews) */}
        <div style={{
          display: "flex", alignItems: "center", background: "var(--bg-alt)",
          border: "1.5px solid var(--border-light)", borderRadius: 22, padding: 3, marginLeft: 16
        }}>
          <button
            onClick={() => setMode("career")}
            style={{
              display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 18, border: "none",
              background: mode === "career" ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "transparent",
              color: mode === "career" ? "#ffffff" : "var(--text-muted)",
              fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
              transition: "all 0.2s ease", boxShadow: mode === "career" ? "0 4px 12px rgba(108,99,255,0.25)" : "none"
            }}
          >
            <Briefcase size={13} /> Career
          </button>
          <button
            onClick={() => setMode("academic")}
            style={{
              display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 18, border: "none",
              background: mode === "academic" ? "linear-gradient(135deg, #f7971e, #00c9a7)" : "transparent",
              color: mode === "academic" ? "#ffffff" : "var(--text-muted)",
              fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
              transition: "all 0.2s ease", boxShadow: mode === "academic" ? "0 4px 12px rgba(247,151,30,0.25)" : "none"
            }}
          >
            <GraduationCap size={13} /> Academic
          </button>
        </div>

        {/* Notification Bell */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => alert("Notifications: 2 new daily challenges dropped!")}
          style={{
            position: "relative", width: 38, height: 38, borderRadius: 12,
            background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "var(--text-main)", cursor: "pointer"
          }}
        >
          <Bell size={17} />
          <span style={{ position: "absolute", top: 7, right: 7, width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
        </motion.button>

        {/* User Profile Avatar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px 4px 4px", background: "var(--bg-alt)", borderRadius: 24, border: "1.5px solid var(--border-light)" }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #6c63ff, #00c9a7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#fff" }}>
            🎓
          </div>
          <div style={{ textAlign: "left", paddingRight: 4 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 800, color: "var(--text-main)", lineHeight: 1 }}>Rahul K.</div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9.5, color: "#6c63ff", fontWeight: 700 }}>SDE Trainee</div>
          </div>
        </div>
      </div>
    </header>
  );
}
