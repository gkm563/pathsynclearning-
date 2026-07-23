import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Sparkles, LayoutDashboard, Map, Zap, BookOpen, BarChart2, Newspaper, GraduationCap, Briefcase, Menu, Check } from "lucide-react";

export default function DashboardHeader({ activeTab, setActiveTab, onToggleSidebar }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState("career"); // "career" or "academic"
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const syncNotifs = () => {
      const saved = localStorage.getItem("pathed_notifications");
      if (saved) {
        setNotifications(JSON.parse(saved));
      } else {
        const defaults = [
          { id: "n1", type: "challenge", title: "Daily SDE Challenge Dropped", desc: "Solve 'Subarray Sum Equals K' using Prefix Sum before midnight to preserve your 7-day streak!", time: "20m ago", read: false, icon: "⚡", color: "#6c63ff", bg: "rgba(108,99,255,0.08)", bdr: "rgba(108,99,255,0.25)" },
          { id: "n2", type: "invite", title: "HackSquad Invitation Received", desc: "Siddharth (IIT-K) invited you to join team 'CodeBlox' for HackAttack '26.", time: "2h ago", read: false, icon: "⚔️", color: "#e040fb", bg: "rgba(224,64,251,0.08)", bdr: "rgba(224,64,251,0.25)", actionable: true, teamName: "CodeBlox" },
          { id: "n3", type: "mentor", title: "Code Review Comments", desc: "Aarav Mehta (SDE 2 @ Google) left 3 suggestions on your Distributed Chat App socket connector logic.", time: "4h ago", read: true, icon: "🧑‍🏫", color: "#00c9a7", bg: "rgba(0,201,167,0.08)", bdr: "rgba(0,201,167,0.25)" },
          { id: "n4", type: "event", title: "RSVP Confirmed: System Design Masterclass", desc: "Your session with Sophia Vance on high-concurrency database partitioned scale starts tomorrow at 6 PM.", time: "1d ago", read: true, icon: "📅", color: "#f7971e", bg: "rgba(247,151,30,0.08)", bdr: "rgba(247,151,30,0.25)" }
        ];
        setNotifications(defaults);
        localStorage.setItem("pathed_notifications", JSON.stringify(defaults));
      }
    };
    syncNotifs();
    const interval = setInterval(syncNotifs, 1000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = (e) => {
    e.stopPropagation();
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("pathed_notifications", JSON.stringify(updated));
  };

  const handleNotifClick = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem("pathed_notifications", JSON.stringify(updated));
  };

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
    } else if (itemId === "community") {
      navigate("/platform/community");
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
        <div style={{ position: "relative" }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: 38, height: 38, borderRadius: 12,
              background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-main)", cursor: "pointer", position: "relative"
            }}
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span style={{ position: "absolute", top: 7, right: 7, width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
            )}
          </motion.button>

          {/* Notifications Dropdown Popover */}
          <AnimatePresence>
            {showNotifications && (
              <>
                {/* Click outside overlay */}
                <div 
                  onClick={() => setShowNotifications(false)}
                  style={{ position: "fixed", inset: 0, zIndex: 999 }}
                />
                
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: "absolute", top: 50, right: 0, width: 340,
                    background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
                    borderRadius: 20, boxShadow: "0 15px 50px rgba(0,0,0,0.25)",
                    zIndex: 1000, overflow: "visible"
                  }}
                >
                  {/* Pointing Popover Arrow */}
                  <div style={{
                    position: "absolute", top: -7, right: 13, width: 12, height: 12,
                    transform: "rotate(45deg)", background: "var(--bg-card)",
                    borderLeft: "1.5px solid var(--border-light)", borderTop: "1.5px solid var(--border-light)",
                    zIndex: 1
                  }} />

                  {/* Dropdown Header */}
                  <div style={{
                    display: "flex", justify: "space-between", alignItems: "center",
                    padding: "14px 18px", borderBottom: "1.5px solid var(--border-light)",
                    background: "var(--bg-alt)", borderTopLeftRadius: 18, borderTopRightRadius: 18,
                    position: "relative", zIndex: 2
                  }}>
                    <strong style={{ fontSize: 14.5, fontFamily: "'Outfit', sans-serif" }}>Notifications</strong>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllRead}
                        style={{ background: "transparent", border: "none", color: "#6c63ff", fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  {/* Dropdown Items List */}
                  <div style={{ maxHeight: 280, overflowY: "auto", position: "relative", zIndex: 2 }} className="hide-scrollbar">
                    {notifications.slice(0, 3).map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => handleNotifClick(item.id)}
                        style={{
                          padding: "14px 18px", borderBottom: "1px solid var(--border-light)",
                          background: item.read ? "transparent" : "rgba(108,99,255,0.03)",
                          cursor: "pointer", display: "flex", gap: 12, transition: "background 0.2s"
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = "var(--bg-alt)"}
                        onMouseLeave={e => e.currentTarget.style.background = item.read ? "transparent" : "rgba(108,99,255,0.03)"}
                      >
                        <div style={{
                          width: 32, height: 32, borderRadius: 8, background: item.bg || "rgba(108,99,255,0.08)",
                          border: `1px solid ${item.bdr || "rgba(108,99,255,0.15)"}`, display: "flex",
                          alignItems: "center", justify: "center", fontSize: 16, flexShrink: 0
                        }}>
                          {item.icon}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justify: "space-between", gap: 8 }}>
                            <strong style={{ fontSize: 13, color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {item.title}
                            </strong>
                            <span style={{ fontSize: 9.5, color: "var(--text-light)", whiteSpace: "nowrap" }}>{item.time}</span>
                          </div>
                          <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--text-muted)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}

                    {notifications.length === 0 && (
                      <div style={{ padding: "30px 20px", textAlign: "center", color: "var(--text-light)", fontSize: 13 }}>
                        No new updates.
                      </div>
                    )}
                  </div>

                  {/* Dropdown Footer */}
                  <div style={{ padding: 10, borderTop: "1.5px solid var(--border-light)", textAlign: "center", position: "relative", zIndex: 2 }}>
                    <button
                      onClick={() => { setShowNotifications(false); navigate("/platform/notifications"); }}
                      style={{
                        width: "100%", padding: "8px", borderRadius: 10, border: "none",
                        background: "var(--bg-alt)", color: "#6c63ff", cursor: "pointer",
                        fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 900
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(108,99,255,0.08)"}
                      onMouseLeave={e => e.currentTarget.style.background = "var(--bg-alt)"}
                    >
                      View All Notifications
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile Avatar */}
        <div 
          onClick={() => navigate("/platform/profile")}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px 4px 4px", background: "var(--bg-alt)", borderRadius: 24, border: "1.5px solid var(--border-light)", cursor: "pointer" }}
        >
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
