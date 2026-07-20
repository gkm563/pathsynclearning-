import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Home, Map, Zap, BarChart2, Newspaper, 
  Rocket, Inbox, Lightbulb, Award, ShieldAlert, Users, ShoppingBag, Settings 
} from "lucide-react";

export default function DashboardSidebar({ activeTab, setActiveTab }) {
  const navigate = useNavigate();

  const mainPortal = [
    { id: "dashboard", label: "Home", icon: <Home size={17} /> },
    { id: "roadmap", label: "Roadmap", icon: <Map size={17} /> },
    { id: "challenges", label: "Challenges", icon: <Zap size={17} /> },
    { id: "progress", label: "Progress", icon: <BarChart2 size={17} /> },
    { id: "technews", label: "Tech News", icon: <Newspaper size={17} /> },
  ];

  const expandedFeatures = [
    { id: "advanced-career", label: "Advanced Career", icon: <Rocket size={17} /> },
    { id: "placement-inbox", label: "Placement Inbox", icon: <Inbox size={17} /> },
    { id: "placement-insights", label: "Placement Insights", icon: <Lightbulb size={17} /> },
    { id: "records-certs", label: "Records & Certs", icon: <Award size={17} /> },
    { id: "hack-attack", label: "Hack Attack", icon: <ShieldAlert size={17} /> },
    { id: "community", label: "Community", icon: <Users size={17} /> },
    { id: "store", label: "Store", icon: <ShoppingBag size={17} />, isStoreRoute: true },
  ];

  const handleNavClick = (item) => {
    if (item.isStoreRoute) {
      navigate("/store");
    } else {
      setActiveTab(item.id);
    }
  };

  return (
    <aside style={{
      width: 250, flexShrink: 0, height: "calc(100vh - 61px)", position: "sticky", top: 61,
      background: "var(--bg-card)", borderRight: "1.5px solid var(--border-light)",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: "20px 16px", overflowY: "auto"
    }}>
      <div>
        {/* User Profile Card */}
        <div style={{
          padding: "14px", borderRadius: 16, background: "var(--bg-alt)",
          border: "1px solid var(--border-light)", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 12
        }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg, #6c63ff, #00c9a7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff", flexShrink: 0 }}>
            🎓
          </div>
          <div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, color: "var(--text-main)" }}>Rahul Kushwaha</div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: "#6c63ff", fontWeight: 700, letterSpacing: 0.5 }}>B.TECH · IIT KANPUR</div>
          </div>
        </div>

        {/* MAIN PORTAL Links */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1.5, marginBottom: 8, paddingLeft: 8 }}>
            MAIN PORTAL
          </div>
          {mainPortal.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  borderRadius: 12, border: "none", marginBottom: 3, cursor: "pointer",
                  background: isActive ? "linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,201,167,0.1))" : "transparent",
                  color: isActive ? "#6c63ff" : "var(--text-muted)",
                  fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: isActive ? 700 : 500,
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
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1.5, marginBottom: 8, paddingLeft: 8 }}>
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
                  padding: "10px 12px", borderRadius: 12, border: "none", marginBottom: 3, cursor: "pointer",
                  background: isActive ? "linear-gradient(135deg, rgba(108,99,255,0.15), rgba(0,201,167,0.1))" : "transparent",
                  color: isActive ? "#6c63ff" : "var(--text-muted)",
                  fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: isActive ? 700 : 500,
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {/* Red Animated NEW Badge */}
                <motion.span
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    padding: "2px 6px", borderRadius: 6,
                    background: "linear-gradient(135deg, #ef4444, #dc2626)",
                    color: "#ffffff", fontFamily: "'Fira Code', monospace", fontSize: 8,
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
      <div style={{ paddingTop: 16, borderTop: "1.5px solid var(--border-light)" }}>
        <button
          onClick={() => alert("Settings Modal: Theme, Profile, and Password preferences will open here.")}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
            borderRadius: 14, background: "var(--bg-alt)", border: "1px solid var(--border-light)",
            color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700,
            cursor: "pointer", transition: "all 0.2s"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6c63ff"; e.currentTarget.style.color = "#6c63ff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.color = "var(--text-main)"; }}
        >
          <Settings size={18} />
          <span>Platform Settings</span>
        </button>
      </div>
    </aside>
  );
}
