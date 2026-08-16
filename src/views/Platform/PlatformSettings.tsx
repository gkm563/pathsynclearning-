"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Settings, Sun, Moon, Eye, Shield, Bell, User, 
  Sparkles, Check, ChevronRight, Save, Key, Trash2, ShieldAlert,
  Globe, Laptop, Mail, RefreshCw, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { apiGet, apiSend } from "@/lib/api";

export default function PlatformSettings() {
  const router = useRouter();

  const [theme, setTheme] = useState("light");
  const [accentColor, setAccentColor] = useState("Purple");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<{
          settings: { theme?: string; accent_color?: string };
        }>("/api/me/settings");
        if (cancelled) return;
        if (data.settings?.theme) setTheme(data.settings.theme);
        if (data.settings?.accent_color) setAccentColor(data.settings.accent_color);
      } catch {
        setTheme(localStorage.getItem("theme") || "light");
        setAccentColor(localStorage.getItem("pathed_accent_color") || "Purple");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Settings tab: 'appearance' | 'account' | 'notifications' | 'security'
  const [activeSubTab, setActiveSubTab] = useState("appearance");

  // Toast Message
  const [toastMessage, setToastMessage] = useState("");

  // Mock toggle states
  const [notifStreak, setNotifStreak] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(false);
  const [notifSound, setNotifSound] = useState(true);
  const [privacyPublic, setPrivacyPublic] = useState(true);
  const [tfaEnabled, setTfaEnabled] = useState(false);

  // Sync theme to DOM
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.body.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Sync Accent color to localStorage
  useEffect(() => {
    localStorage.setItem("pathed_accent_color", accentColor);
  }, [accentColor]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleSaveSettings = async () => {
    try {
      await apiSend("/api/me/settings", "PUT", { theme, accentColor });
      triggerToast("💾 Platform settings saved and synced successfully!");
    } catch {
      triggerToast("Saved on this device — sign in to sync.");
    }
  };

  return (
    <DashboardLayout activeTab="settings">
      
      {/* ==================== TOAST ALERT ==================== */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            style={{
              position: "fixed", top: 24, left: "50%", x: "-50%",
              background: "rgba(15, 23, 42, 0.95)", border: "1.5px solid rgba(108,99,255,0.4)",
              borderRadius: 16, padding: "12px 24px", zIndex: 1400, color: "#fff",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: 10,
              fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14.5
            }}
          >
            <Sparkles size={16} color="#6c63ff" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 60 }}>
        
        {/* ==================== HEADER CARD ==================== */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16, padding: "20px 24px",
          background: "var(--bg-card)", borderRadius: 24,
          border: "1.5px solid var(--border-light)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, flexWrap: "wrap" }}>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 900, color: "var(--text-main)", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
                <Settings size={26} color="#6c63ff" />
                Platform <span style={{ color: "#6c63ff" }}>Settings</span>
              </h1>
              <span style={{
                padding: "4px 12px", borderRadius: 14,
                background: "rgba(108, 99, 255, 0.12)", border: "1px solid #6c63ff50",
                color: "#6c63ff", fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 900
              }}>
                ⚙️ CONTROL CENTRE
              </span>
            </div>
            <p style={{ margin: 0, fontSize: 16, color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.6 }}>
              Configure your visual themes, profile permissions, security alerts, and background notifications.
            </p>
          </div>
        </div>

        {/* ==================== SETTINGS WRAPPER ==================== */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", mdLayout: "unset", gap: 24 }} className="settings-layout-grid">
          <style dangerouslySetInnerHTML={{__html: `
            @media (min-width: 992px) {
              .settings-layout-grid {
                grid-template-columns: 280px 1fr !important;
              }
            }
          `}} />

          {/* Sidebar Nav */}
          <div style={{ 
            background: "var(--bg-card)", borderRadius: 24, 
            border: "1.5px solid var(--border-light)", padding: 20,
            display: "flex", flexDirection: "column", gap: 8, height: "max-content"
          }}>
            {[
              { id: "appearance", label: "🎨 Appearance & Theme", desc: "Light & Dark visual tuning", icon: <Eye size={18} /> },
              { id: "account", label: "👤 Account & Identity", desc: "Profile syncing & exports", icon: <User size={18} /> },
              { id: "notifications", label: "🔔 Notifications", desc: "System alerts & weekly digests", icon: <Bell size={18} /> },
              { id: "security", label: "🛡️ Security & Privacy", desc: "Password & 2FA setups", icon: <Shield size={18} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                style={{
                  display: "flex", gap: 14, alignItems: "center", padding: "14px 18px",
                  borderRadius: 16, border: "none", cursor: "pointer", textAlign: "left",
                  background: activeSubTab === tab.id ? "rgba(108,99,255,0.08)" : "transparent",
                  color: activeSubTab === tab.id ? "#6c63ff" : "var(--text-muted)",
                  transition: "all 0.2s"
                }}
              >
                <div style={{
                  color: activeSubTab === tab.id ? "#6c63ff" : "var(--text-light)",
                  display: "flex", alignItems: "center"
                }}>
                  {tab.icon}
                </div>
                <div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 800 }}>{tab.label}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-light)", marginTop: 2 }}>{tab.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Subtab Content Panels */}
          <div style={{ background: "var(--bg-card)", borderRadius: 24, border: "1.5px solid var(--border-light)", padding: 32 }}>
            <AnimatePresence mode="wait">
              
              {/* Tab 1: Appearance & Theme */}
              {activeSubTab === "appearance" && (
                <motion.div
                  key="appearance"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ display: "flex", flexDirection: "column", gap: 28 }}
                >
                  <div>
                    <h3 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 19, fontWeight: 900 }}>Visual Color Theme</h3>
                    <p style={{ margin: "4px 0 20px", fontSize: 13.5, color: "var(--text-muted)" }}>Select between a bright slate interface or a premium midnight dark theme.</p>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                      
                      {/* Theme Option: Light */}
                      <div 
                        onClick={() => setTheme("light")}
                        style={{
                          borderRadius: 20, border: theme === "light" ? "2.5px solid #6c63ff" : "1.5px solid var(--border-light)",
                          background: "#ffffff", padding: 20, cursor: "pointer", position: "relative", overflow: "hidden",
                          boxShadow: theme === "light" ? "0 8px 24px rgba(108,99,255,0.15)" : "none"
                        }}
                      >
                        <div style={{ display: "flex", justify: "space-between", alignItems: "center", marginBottom: 12 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: "#1a1a2e" }}>Light Theme</span>
                          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#f0f4ff", display: "flex", alignItems: "center", justify: "center" }}>
                            <Sun size={14} color="#f7971e" />
                          </div>
                        </div>
                        {/* Dummy preview wireframe */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, background: "#f4f6fc", borderRadius: 8, padding: 8 }}>
                          <div style={{ width: "60%", height: 8, background: "#eaecff", borderRadius: 4 }} />
                          <div style={{ width: "100%", height: 16, background: "#ffffff", border: "1px solid #eaecff", borderRadius: 4 }} />
                          <div style={{ width: "40%", height: 8, background: "#eaecff", borderRadius: 4 }} />
                        </div>
                        {theme === "light" && (
                          <div style={{ position: "absolute", bottom: 8, right: 8, background: "#6c63ff", borderRadius: 50, width: 18, height: 18, display: "flex", alignItems: "center", justify: "center" }}>
                            <Check size={11} color="#fff" />
                          </div>
                        )}
                      </div>

                      {/* Theme Option: Dark */}
                      <div 
                        onClick={() => setTheme("dark")}
                        style={{
                          borderRadius: 20, border: theme === "dark" ? "2.5px solid #6c63ff" : "1.5px solid var(--border-light)",
                          background: "#151b2b", padding: 20, cursor: "pointer", position: "relative", overflow: "hidden",
                          boxShadow: theme === "dark" ? "0 8px 24px rgba(108,99,255,0.3)" : "none"
                        }}
                      >
                        <div style={{ display: "flex", justify: "space-between", alignItems: "center", marginBottom: 12 }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: "#e2e8f0" }}>Midnight Dark</span>
                          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#0f1523", display: "flex", alignItems: "center", justify: "center" }}>
                            <Moon size={14} color="#6c63ff" />
                          </div>
                        </div>
                        {/* Dummy preview wireframe */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, background: "#0b0f19", borderRadius: 8, padding: 8 }}>
                          <div style={{ width: "60%", height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4 }} />
                          <div style={{ width: "100%", height: 16, background: "#151b2b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4 }} />
                          <div style={{ width: "40%", height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4 }} />
                        </div>
                        {theme === "dark" && (
                          <div style={{ position: "absolute", bottom: 8, right: 8, background: "#6c63ff", borderRadius: 50, width: 18, height: 18, display: "flex", alignItems: "center", justify: "center" }}>
                            <Check size={11} color="#fff" />
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Accent palette */}
                  <div>
                    <h3 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800 }}>Highlight Accent Palette</h3>
                    <p style={{ margin: "4px 0 16px", fontSize: 13, color: "var(--text-muted)" }}>Calibrate the secondary button and streak glow accent highlights.</p>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {[
                        { name: "Blue", color: "#1677ff" },
                        { name: "Mint", color: "#00c9a7" },
                        { name: "Orange", color: "#f7971e" },
                        { name: "Purple", color: "#6c63ff" },
                        { name: "Magenta", color: "#ec4899" }
                      ].map(col => (
                        <button
                          key={col.name}
                          onClick={() => setAccentColor(col.name)}
                          style={{
                            display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
                            borderRadius: 12, border: accentColor === col.name ? `2px solid ${col.color}` : "1.5px solid var(--border-light)",
                            background: accentColor === col.name ? "var(--bg-alt)" : "transparent",
                            color: "var(--text-main)", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700
                          }}
                        >
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: col.color }} />
                          <span>{col.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ borderTop: "1.5px solid var(--border-light)", paddingTop: 20, display: "flex", justify: "flex-end" }}>
                    <button
                      onClick={handleSaveSettings}
                      style={{
                        padding: "12px 24px", borderRadius: 12, border: "none",
                        background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff",
                        fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 8
                      }}
                    >
                      <Save size={16} /> Save Preferences
                    </button>
                  </div>

                </motion.div>
              )}

              {/* Tab 2: Account & Identity */}
              {activeSubTab === "account" && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ display: "flex", flexDirection: "column", gap: 24 }}
                >
                  <div>
                    <h3 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 19, fontWeight: 900 }}>Account Specifications</h3>
                    <p style={{ margin: "4px 0 20px", fontSize: 13.5, color: "var(--text-muted)" }}>Control platform identities and system credentials.</p>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <div>
                        <label style={{ display: "block", fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", marginBottom: 6 }}>EMAIL ADDRESS</label>
                        <input
                          type="email"
                          defaultValue="rahul.kushwaha@iitk.ac.in"
                          disabled
                          style={{ width: "100%", padding: 11, borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-muted)", cursor: "not-allowed" }}
                        />
                      </div>

                      <div style={{ display: "flex", justify: "space-between", alignItems: "center", padding: 14, background: "var(--bg-alt)", borderRadius: 16, border: "1px solid var(--border-light)" }}>
                        <div>
                          <strong style={{ display: "block", fontSize: 13.5 }}>Export Profile Ledger</strong>
                          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Download your study history, CRI transaction history and certification ledgers as JSON.</span>
                        </div>
                        <button
                          onClick={() => triggerToast("📊 Profile ledger download initiated! Check downloads.")}
                          style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid var(--border-light)", background: "var(--bg-card)", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 700 }}
                        >
                          Export Data
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: "1.5px solid var(--border-light)", paddingTop: 20, display: "flex", justify: "flex-end" }}>
                    <button
                      onClick={handleSaveSettings}
                      style={{
                        padding: "12px 24px", borderRadius: 12, border: "none",
                        background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff",
                        fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 8
                      }}
                    >
                      <Save size={16} /> Save Account
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Notifications */}
              {activeSubTab === "notifications" && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ display: "flex", flexDirection: "column", gap: 24 }}
                >
                  <div>
                    <h3 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 19, fontWeight: 900 }}>Notification Channels</h3>
                    <p style={{ margin: "4px 0 20px", fontSize: 13.5, color: "var(--text-muted)" }}>Configure when and how PathEd contacts you with updates.</p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      
                      <div style={{ display: "flex", justify: "space-between", alignItems: "center" }}>
                        <div>
                          <strong style={{ display: "block", fontSize: 13.5 }}>Daily Streak Warning Notifications</strong>
                          <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Ping me 2 hours before my streak expires.</span>
                        </div>
                        <input 
                          type="checkbox" checked={notifStreak} onChange={() => setNotifStreak(!notifStreak)}
                          style={{ width: 40, height: 20, cursor: "pointer" }}
                        />
                      </div>

                      <div style={{ display: "flex", justify: "space-between", alignItems: "center", borderTop: "1px solid var(--border-light)", paddingTop: 16 }}>
                        <div>
                          <strong style={{ display: "block", fontSize: 13.5 }}>Weekly Progress Digests</strong>
                          <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Receive a detailed performance and CRI breakdown via email every Sunday.</span>
                        </div>
                        <input 
                          type="checkbox" checked={notifWeekly} onChange={() => setNotifWeekly(!notifWeekly)}
                          style={{ width: 40, height: 20, cursor: "pointer" }}
                        />
                      </div>

                      <div style={{ display: "flex", justify: "space-between", alignItems: "center", borderTop: "1px solid var(--border-light)", paddingTop: 16 }}>
                        <div>
                          <strong style={{ display: "block", fontSize: 13.5 }}>Audio Alerts &amp; Sounds</strong>
                          <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Enable game sounds when completing a roadmap checkpoint node.</span>
                        </div>
                        <input 
                          type="checkbox" checked={notifSound} onChange={() => setNotifSound(!notifSound)}
                          style={{ width: 40, height: 20, cursor: "pointer" }}
                        />
                      </div>

                    </div>
                  </div>

                  <div style={{ borderTop: "1.5px solid var(--border-light)", paddingTop: 20, display: "flex", justify: "flex-end" }}>
                    <button
                      onClick={handleSaveSettings}
                      style={{
                        padding: "12px 24px", borderRadius: 12, border: "none",
                        background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff",
                        fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 8
                      }}
                    >
                      <Save size={16} /> Save Alerts
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Tab 4: Security & Privacy */}
              {activeSubTab === "security" && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{ display: "flex", flexDirection: "column", gap: 24 }}
                >
                  <div>
                    <h3 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 19, fontWeight: 900 }}>Security, Privacy &amp; Credential Setup</h3>
                    <p style={{ margin: "4px 0 20px", fontSize: 13.5, color: "var(--text-muted)" }}>Maintain data integrity, password encryption, and multi-factor validation.</p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                      <div style={{ display: "flex", justify: "space-between", alignItems: "center" }}>
                        <div>
                          <strong style={{ display: "block", fontSize: 13.5 }}>Public Profile Visibility</strong>
                          <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Allow recruiters to search and view my profile dashboard.</span>
                        </div>
                        <input 
                          type="checkbox" checked={privacyPublic} onChange={() => setPrivacyPublic(!privacyPublic)}
                          style={{ width: 40, height: 20, cursor: "pointer" }}
                        />
                      </div>

                      <div style={{ display: "flex", justify: "space-between", alignItems: "center", borderTop: "1px solid var(--border-light)", paddingTop: 16 }}>
                        <div>
                          <strong style={{ display: "block", fontSize: 13.5 }}>Two-Factor Authentication (2FA)</strong>
                          <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Request authentication codes when logging in from new devices.</span>
                        </div>
                        <input 
                          type="checkbox" checked={tfaEnabled} onChange={() => setTfaEnabled(!tfaEnabled)}
                          style={{ width: 40, height: 20, cursor: "pointer" }}
                        />
                      </div>

                      <div style={{ display: "flex", justify: "space-between", alignItems: "center", borderTop: "1px solid var(--border-light)", paddingTop: 16, background: "rgba(255,68,68,0.06)", padding: 14, borderRadius: 16, border: "1px solid rgba(255,68,68,0.15)" }}>
                        <div>
                          <strong style={{ display: "block", fontSize: 13.5, color: "#ff6b6b" }}>Danger Zone: Delete Profile</strong>
                          <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Permanently remove all study checkpoints, coin balances, and transactions.</span>
                        </div>
                        <button
                          onClick={() => alert("Are you sure? This action is non-reversible and deletes all local storage data.")}
                          style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid #ff6b6b40", background: "transparent", color: "#ff6b6b", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 700 }}
                        >
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: "1.5px solid var(--border-light)", paddingTop: 20, display: "flex", justify: "flex-end" }}>
                    <button
                      onClick={handleSaveSettings}
                      style={{
                        padding: "12px 24px", borderRadius: 12, border: "none",
                        background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff",
                        fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 8
                      }}
                    >
                      <Save size={16} /> Save Security
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>

      </div>

    </DashboardLayout>
  );
}
