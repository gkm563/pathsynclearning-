import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Globe, Sun } from "lucide-react";

export default function Header() {
  const links = [
    { label: "Home", path: "/" },
    { label: "Platform", path: "/platform" },
    { label: "Methodology", path: "/methodology" },
    { label: "Mission", path: "/mission" },
    { label: "Company", path: "/company" },
    { label: "Blog", path: "/blog" },
    { label: "Community", path: "/community" }
  ];

  return (
    <div style={{ position: "fixed", top: 24, left: 0, right: 0, zIndex: 100, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <header style={{
        pointerEvents: "auto",
        width: "calc(100% - 64px)",
        maxWidth: "1280px",
        background: "rgba(255, 255, 255, 0.75)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        border: "1px solid rgba(255, 255, 255, 1)",
        borderRadius: "24px",
        boxShadow: "0 12px 40px rgba(108,99,255,0.08), 0 1px 3px rgba(0,0,0,0.02)",
        padding: "8px 12px 8px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        
        {/* LEFT SIDE: Logo & Navigation Links */}
        <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          
          {/* Logo */}
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, #6c63ff, #00c9a7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "18px",
              color: "#fff", boxShadow: "0 4px 14px rgba(108,99,255,0.25)"
            }}>P</div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "22px", color: "#1a1a2e" }}>
              Path<span style={{ color: "#6c63ff" }}>Ed</span>
            </span>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "4px 10px", borderRadius: "12px", background: "#f0f4ff",
              fontFamily: "'Fira Code', monospace",
              fontSize: "10px", color: "#6c63ff", fontWeight: 600, marginLeft: "6px"
            }}>
              BETA
            </div>
          </Link>

          {/* Navigation */}
          <nav style={{ display: "flex", gap: "2px", alignItems: "center" }}>
            {links.map((link) => (
              <Link key={link.label} to={link.path} style={{
                color: "#555", fontFamily: "'Inter', sans-serif", fontSize: "14px",
                padding: "8px 12px", borderRadius: "10px", fontWeight: 500,
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#1a1a2e"; e.currentTarget.style.background = "#f0f4ff" }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#555"; e.currentTarget.style.background = "transparent" }}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* RIGHT SIDE: Icons & Auth */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          
          {/* Icons */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "#666" }}>
            <button style={{ color: "#666", display: "flex", alignItems: "center", padding: "6px", borderRadius: "8px", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#f0f4ff"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <Search size={18} strokeWidth={2.5} />
            </button>
            <button style={{ color: "#666", display: "flex", alignItems: "center", padding: "6px", borderRadius: "8px", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#f0f4ff"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <Globe size={18} strokeWidth={2.5} />
            </button>
            <button style={{ color: "#f7971e", display: "flex", alignItems: "center", padding: "6px", borderRadius: "8px", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#fff3cd"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <Sun size={18} strokeWidth={2.5} />
            </button>
          </div>

          <div style={{ width: "1px", height: "24px", background: "#e0e4f5" }} />

          {/* Auth Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Link to="/login" style={{
              color: "#6c63ff", fontFamily: "'Outfit', sans-serif", fontWeight: 700,
              fontSize: "14px", padding: "10px 16px", borderRadius: "12px",
              transition: "all 0.2s", display: "inline-block"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#f0f4ff"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              Sign In
            </Link>

            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to="/register" style={{
                background: "#1a1a2e",
                color: "#fff", fontFamily: "'Outfit', sans-serif", fontWeight: 700,
                fontSize: "14px", padding: "12px 24px", borderRadius: "14px",
                display: "inline-block", boxShadow: "0 6px 16px rgba(26,26,46,0.15)"
              }}>
                Get Started
              </Link>
            </motion.div>
          </div>

        </div>

      </header>
    </div>
  );
}
