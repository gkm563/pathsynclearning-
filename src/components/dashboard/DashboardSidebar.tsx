"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, Map, Zap, BookOpen, BarChart2, Newspaper, 
  Rocket, Inbox, Lightbulb, Award, ShieldAlert, Users, ShoppingBag, Settings, X, Globe, Calendar 
} from "lucide-react";
import { useStudent } from "./StudentContext";
import { dashboardTabPath, pathForNavId, routes } from "@/lib/routes";

export default function DashboardSidebar({ isOpen, onClose, activeTab, setActiveTab }) {
  const router = useRouter();
  const student = useStudent();

  const mainPortal = [
    { id: "dashboard", label: "Home", icon: <Home size={20} /> },
    { id: "roadmap", label: "Roadmap", icon: <Map size={20} /> },
    { id: "challenges", label: "Challenges", icon: <Zap size={20} /> },
    { id: "memory-lane", label: "Memory Lane", icon: <BookOpen size={20} /> },
    { id: "progress", label: "Progress", icon: <BarChart2 size={20} /> },
    { id: "technews", label: "Tech News", icon: <Newspaper size={20} /> },
  ];

  const expandedFeatures = [
    { id: "advanced-career", label: "Advanced Career", icon: <Rocket size={20} /> },
    { id: "placement-inbox", label: "Placement Inbox", icon: <Inbox size={20} /> },
    { id: "placement-insights", label: "Placement Insights", icon: <Lightbulb size={20} /> },
    { id: "records-certs", label: "Records & Certs", icon: <Award size={20} /> },
    { id: "hack-attack", label: "OG Oppurtanities", icon: <Award size={20} /> },
    { id: "community", label: "Community", icon: <Users size={20} /> },
    { id: "store", label: "Store", icon: <ShoppingBag size={20} />, isStoreRoute: true },
  ];

  const handleNavClick = (item) => {
    const path = pathForNavId(item.isStoreRoute ? "store" : item.id);
    if (path) {
      router.push(path);
    } else if (window.location.pathname !== routes.app.dashboard) {
      router.push(dashboardTabPath(item.id));
    } else if (setActiveTab) {
      setActiveTab(item.id);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed", inset: 0, zIndex: 199,
              background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)"
            }}
          />

          {/* Slide-over Drawer Sidebar */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              position: "fixed", left: 0, top: 0, bottom: 0, width: 300,
              background: "var(--bg-card)", borderRight: "1.5px solid var(--border-light)",
              zIndex: 200, display: "flex", flexDirection: "column", justifyContent: "space-between",
              padding: "26px 22px", boxShadow: "10px 0 40px rgba(0,0,0,0.25)", overflowY: "auto"
            }}
          >
            <div>
              {/* Sidebar Header with Brand & Close Button */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingBottom: 16, borderBottom: "1.5px solid var(--border-light)" }}>
                <Link href="/" style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: "var(--text-main)", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg, #6c63ff, #00c9a7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 18 }}>
                    P
                  </div>
                  <span>Path<span style={{ color: "#6c63ff" }}>Ed</span></span>
                </Link>

                <button onClick={onClose} style={{ background: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 12, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-main)" }}>
                  <X size={20} />
                </button>
              </div>

              {/* User Profile Card */}
              <div 
                onClick={() => { router.push(routes.app.profile); onClose(); }}
                style={{
                  padding: "16px", borderRadius: 18, background: "var(--bg-alt)",
                  border: "1.5px solid var(--border-light)", marginBottom: 26,
                  display: "flex", alignItems: "center", gap: 14, cursor: "pointer"
                }}
              >
                <div style={{ width: 50, height: 50, borderRadius: "50%", background: "linear-gradient(135deg, #6c63ff, #00c9a7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#fff", flexShrink: 0, boxShadow: "0 4px 14px rgba(108,99,255,0.3)" }}>
                  🎓
                </div>
                <div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)" }}>{student.name}</div>
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#6c63ff", fontWeight: 700, letterSpacing: 0.5, marginTop: 2 }}>
                    {(student.degree.split("·")[0] || "B.TECH").trim().toUpperCase()} · {student.institute.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* MAIN PORTAL Links */}
              <div style={{ marginBottom: 26 }}>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 800, color: "var(--text-muted)", letterSpacing: 1.5, marginBottom: 12, paddingLeft: 8 }}>
                  MAIN PORTAL
                </div>
                {mainPortal.map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item)}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                        borderRadius: 14, border: "none", marginBottom: 6, cursor: "pointer",
                        background: isActive ? "linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,201,167,0.1))" : "transparent",
                        color: isActive ? "#6c63ff" : "var(--text-main)",
                        fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: isActive ? 800 : 600,
                        transition: "all 0.2s ease", textAlign: "left"
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  );
                })}
              </div>

              {/* EXPANDED FEATURES Section with Red NEW Badges */}
              <div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 800, color: "var(--text-muted)", letterSpacing: 1.5, marginBottom: 12, paddingLeft: 8 }}>
                  EXPANDED FEATURES
                </div>
                {expandedFeatures.map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item)}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "14px 16px", borderRadius: 14, border: "none", marginBottom: 6, cursor: "pointer",
                        background: isActive ? "linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,201,167,0.1))" : "transparent",
                        color: isActive ? "#6c63ff" : "var(--text-main)",
                        fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: isActive ? 800 : 600,
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {/* Red Animated NEW Badge */}
                      <motion.span
                        animate={{ scale: [1, 1.08, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                          padding: "4px 10px", borderRadius: 8,
                          background: "linear-gradient(135deg, #ef4444, #dc2626)",
                          color: "#ffffff", fontFamily: "'Fira Code', monospace", fontSize: 10,
                          fontWeight: 800, letterSpacing: 0.5, boxShadow: "0 2px 8px rgba(239,68,68,0.4)"
                        }}
                      >
                        NEW
                      </motion.span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fixed Settings Button at Sidebar Bottom */}
            <div style={{ paddingTop: 20, borderTop: "1.5px solid var(--border-light)" }}>
              <button
                onClick={() => { router.push(routes.app.settings); onClose(); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "16px 18px",
                  borderRadius: 16, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                  color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800,
                  cursor: "pointer", transition: "all 0.2s"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6c63ff"; e.currentTarget.style.color = "#6c63ff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.color = "var(--text-main)"; }}
              >
                <Settings size={22} />
                <span>Platform Settings</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
