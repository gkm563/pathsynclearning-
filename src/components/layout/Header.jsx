import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Globe, Sun, Moon } from "lucide-react";

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

  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true" || localStorage.getItem("userRegistered") === "true";
  });

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(localStorage.getItem("isAuthenticated") === "true" || localStorage.getItem("userRegistered") === "true");
    };
    window.addEventListener("storage", checkAuth);
    const interval = setInterval(checkAuth, 800);
    return () => {
      window.removeEventListener("storage", checkAuth);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (isDark) {
      document.body.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  return (
    <div style={{ position: "fixed", top: 24, left: 0, right: 0, zIndex: 100, display: "flex", justifyContent: "center", pointerEvents: "none" }}>
      <header style={{
        pointerEvents: "auto",
        width: "calc(100% - 64px)",
        maxWidth: "1280px",
        background: "var(--overlay-bg)",
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
              color: "var(--text-inverse)", boxShadow: "0 4px 14px rgba(108,99,255,0.25)"
            }}>P</div>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: "22px", color: "var(--text-main)" }}>
              Path<span style={{ color: "#6c63ff" }}>Ed</span>
            </span>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              padding: "4px 10px", borderRadius: "12px", background: "var(--bg-alt)",
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
                color: "var(--text-main)", fontFamily: "'Inter', sans-serif", fontSize: "14px",
                padding: "8px 12px", borderRadius: "10px", fontWeight: 500,
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-main)"; e.currentTarget.style.background = "var(--bg-alt)" }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent" }}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* RIGHT SIDE: Icons & Auth */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          
          {/* Icons */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "var(--text-muted)" }}>
            <button style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", padding: "6px", borderRadius: "8px", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "var(--bg-alt)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <Search size={18} strokeWidth={2.5} />
            </button>
            <button style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", padding: "6px", borderRadius: "8px", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "var(--bg-alt)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <Globe size={18} strokeWidth={2.5} />
            </button>
            <button onClick={() => setIsDark(!isDark)} style={{ color: isDark ? "#6c63ff" : "#f7971e", display: "flex", alignItems: "center", padding: "6px", borderRadius: "8px", transition: "all 0.2s", cursor: "pointer", border: "none", background: "transparent" }} onMouseEnter={e => e.currentTarget.style.background = "var(--bg-alt)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              {isDark ? <Moon size={18} strokeWidth={2.5} /> : <Sun size={18} strokeWidth={2.5} />}
            </button>
          </div>

          <div style={{ width: "1px", height: "24px", background: "#e0e4f5" }} />

          {/* Auth Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {isAuthenticated ? (
              <>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/platform" style={{
                    background: "linear-gradient(135deg, #6c63ff, #00c9a7)",
                    color: "#ffffff", fontFamily: "'Outfit', sans-serif", fontWeight: 700,
                    fontSize: "14px", padding: "10px 22px", borderRadius: "14px",
                    display: "inline-block", boxShadow: "0 6px 20px rgba(108,99,255,0.25)",
                    textDecoration: "none"
                  }}>
                    Dashboard →
                  </Link>
                </motion.div>
                <button 
                  onClick={() => {
                    localStorage.removeItem("isAuthenticated");
                    localStorage.removeItem("userRegistered");
                    setIsAuthenticated(false);
                    window.dispatchEvent(new Event("storage"));
                  }}
                  style={{
                    background: "transparent", border: "none", color: "var(--text-muted)",
                    fontFamily: "'Inter', sans-serif", fontSize: "13px", fontWeight: 600,
                    padding: "8px 12px", borderRadius: "10px", cursor: "pointer"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg-alt)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={{
                  color: "#6c63ff", fontFamily: "'Outfit', sans-serif", fontWeight: 700,
                  fontSize: "14px", padding: "10px 16px", borderRadius: "12px",
                  transition: "all 0.2s", display: "inline-block", textDecoration: "none"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-alt)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  Sign In
                </Link>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link to="/register" style={{
                    background: "var(--bg-inverse)",
                    color: "var(--text-inverse)", fontFamily: "'Outfit', sans-serif", fontWeight: 700,
                    fontSize: "14px", padding: "12px 24px", borderRadius: "14px",
                    display: "inline-block", boxShadow: "0 6px 16px rgba(26,26,46,0.15)", textDecoration: "none"
                  }}>
                    Get Started
                  </Link>
                </motion.div>
              </>
            )}
          </div>

        </div>

      </header>
    </div>
  );
}
