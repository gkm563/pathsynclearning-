"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserButton } from "@clerk/nextjs";
import { Bell, Sparkles, LayoutDashboard, Map, Zap, BookOpen, BarChart2, Newspaper, GraduationCap, Briefcase, Menu, Check } from "lucide-react";
import { apiGet, apiSend } from "@/lib/api";
import { useStudent } from "./StudentContext";
import { routes } from "@/lib/routes";

export default function DashboardHeader({ onToggleSidebar }) {
  const router = useRouter();
  const pathname = usePathname();
  const student = useStudent();
  const [mode, setMode] = useState("career"); // "career" or "academic"
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await apiGet<{ notifications: any[] }>("/api/me/notifications");
        if (!cancelled) setNotifications(data.notifications || []);
      } catch {
        // unauthenticated — empty bell
        if (!cancelled) setNotifications([]);
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async (e) => {
    e.stopPropagation();
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    try {
      await apiSend("/api/me/notifications", "PATCH", { markAllRead: true });
    } catch {
      // ignore
    }
  };

  const handleNotifClick = async (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    try {
      await apiSend("/api/me/notifications", "PATCH", { id, read: true });
    } catch {
      // ignore
    }
  };

  const navItems = [
    { id: "dashboard", path: routes.app.dashboard, label: "Dashboard", icon: <LayoutDashboard size={15} /> },
    { id: "roadmap", path: routes.app.roadmap, label: "Roadmap", icon: <Map size={15} /> },
    { id: "challenges", path: routes.app.challenges, label: "Challenges", icon: <Zap size={15} /> },
    { id: "memory-lane", path: routes.app.memoryLane, label: "Memory Lane", icon: <BookOpen size={15} /> },
    { id: "progress", path: routes.app.progress, label: "Progress", icon: <BarChart2 size={15} /> },
    { id: "technews", path: routes.app.techNews, label: "TechNews", icon: <Newspaper size={15} /> },
  ];

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
            width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "var(--text-main)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
          }}
        >
          <Menu size={20} />
        </motion.button>

        {/* Brand Logo - Visible only on Desktop Header */}
        <Link href="/" style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-main)", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg, #6c63ff, #00c9a7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 16 }}>
            P
          </div>
          <span style={{ display: "none" }} className="sm:block">Path<span style={{ color: "#6c63ff" }}>Ed</span></span>
        </Link>

        {/* Dynamic Header Tab Navigation */}
        <div style={{
          display: "flex", alignItems: "center", background: "var(--bg-alt)",
          padding: 6, borderRadius: 14, border: "1.5px solid var(--border-light)", gap: 4
        }} className="hidden md:flex">
          {navItems.map(item => {
            const isActive = pathname === item.path || (item.path !== routes.app.dashboard && pathname?.startsWith(item.path));
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.path)}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
                  borderRadius: 10, border: "none", cursor: "pointer",
                  background: isActive ? "linear-gradient(135deg, rgba(108,99,255,0.1), rgba(0,201,167,0.1))" : "transparent",
                  color: isActive ? "#6c63ff" : "var(--text-muted)",
                  fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: isActive ? 800 : 600,
                  transition: "all 0.2s ease"
                }}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Toggle + Coins + Notifications */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        
        {/* Career / Academic Mode Toggle */}
        <div style={{
          display: "flex", alignItems: "center", background: "var(--bg-alt)",
          padding: 4, borderRadius: 12, border: "1.5px solid var(--border-light)", gap: 4
        }}>
          <button
            onClick={() => setMode("career")}
            style={{
              padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              background: mode === "career" ? "var(--bg-card)" : "transparent",
              color: mode === "career" ? "var(--text-main)" : "var(--text-muted)",
              boxShadow: mode === "career" ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
              fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, transition: "all 0.2s"
            }}
          >
            <Briefcase size={14} /> Career
          </button>
          <button
            onClick={() => setMode("academic")}
            style={{
              padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              background: mode === "academic" ? "var(--bg-card)" : "transparent",
              color: mode === "academic" ? "var(--text-main)" : "var(--text-muted)",
              boxShadow: mode === "academic" ? "0 2px 8px rgba(0,0,0,0.05)" : "none",
              fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, transition: "all 0.2s"
            }}
          >
            <GraduationCap size={14} /> Academics
          </button>
        </div>

        {/* Global Wallet Coins */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
          borderRadius: 12, background: "rgba(247, 151, 30, 0.1)",
          border: "1.5px solid rgba(247, 151, 30, 0.3)", cursor: "pointer"
        }} onClick={() => router.push(routes.app.wallet)}>
          <span style={{ fontSize: 16 }}>💰</span>
          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 15, fontWeight: 800, color: "#f7971e" }}>
            {student.coins.toLocaleString()}
          </span>
        </div>

        {/* Notification Bell Dropdown */}
        <div style={{ position: "relative" }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              width: 42, height: 42, borderRadius: 12, border: "1.5px solid var(--border-light)",
              background: "var(--bg-alt)", display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text-main)", position: "relative"
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span style={{
                position: "absolute", top: -4, right: -4, background: "#ef4444", color: "#fff",
                fontSize: 10, fontWeight: 800, width: 18, height: 18, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid var(--bg-card)"
              }}>
                {unreadCount}
              </span>
            )}
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: "absolute", top: 56, right: 0, width: 340,
                  background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
                  borderRadius: 16, padding: "16px 0", boxShadow: "0 10px 40px rgba(0,0,0,0.15)", zIndex: 200
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px 12px", borderBottom: "1px solid var(--border-light)", marginBottom: 8 }}>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, color: "var(--text-main)" }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} style={{ display: "flex", alignItems: "center", gap: 4, background: "transparent", border: "none", color: "#6c63ff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      <Check size={14} /> Mark all read
                    </button>
                  )}
                </div>
                
                <div style={{ maxHeight: 320, overflowY: "auto" }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)", fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
                      You're all caught up! ✨
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => handleNotifClick(n.id)}
                        style={{ 
                          padding: "12px 20px", display: "flex", gap: 14, cursor: "pointer",
                          background: n.read ? "transparent" : "rgba(108,99,255,0.04)",
                          borderLeft: n.read ? "3px solid transparent" : "3px solid #6c63ff",
                          transition: "background 0.2s"
                        }}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--bg-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                          {n.type === "system" ? "🔔" : n.type === "reward" ? "🏆" : "✨"}
                        </div>
                        <div>
                          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: n.read ? 600 : 800, color: "var(--text-main)", marginBottom: 2 }}>{n.title}</div>
                          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>{n.message || n.desc}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div style={{ padding: "12px 20px 0", borderTop: "1px solid var(--border-light)", marginTop: 8 }}>
                  <button
                    onClick={() => { setShowNotifications(false); router.push(routes.app.notifications); }}
                    style={{ width: "100%", padding: "8px 0", borderRadius: 8, background: "transparent", border: "1px solid var(--border-light)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
                  >
                    View All Notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile / Sign Out — Manage account opens PathEd Profile Management */}
        <div style={{ marginLeft: 8, display: "flex", alignItems: "center" }}>
          <UserButton
            userProfileMode="navigation"
            userProfileUrl={routes.app.profile}
          />
        </div>

      </div>
    </header>
  );
}

