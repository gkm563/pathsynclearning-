"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Sparkles, Check } from "lucide-react";

export const ALL_AVAILABLE_WIDGETS = [
  // Special Colored Cards
  {
    id: "room-of-honor",
    label: "Room of Honor",
    icon: "🏅",
    specialColor: true,
    accent: "#b45309",
    bg: "linear-gradient(135deg, rgba(254,243,199,0.2), rgba(253,224,71,0.15))",
    border: "#fcd34d",
    desc: "Your personal hall of fame inside PathEd. Enshrines every major milestone, streak achievement, and hackathon win."
  },
  {
    id: "soft-corner",
    label: "Soft Corner",
    icon: "💙",
    specialColor: true,
    accent: "#be185d",
    bg: "linear-gradient(135deg, rgba(252,231,243,0.2), rgba(249,168,212,0.15))",
    border: "#f9a8d4",
    desc: "Private note-taking and mental sanctuary for reflections, journal entries, and personal career notes."
  },
  {
    id: "hall-of-fame",
    label: "Hall of Fame",
    icon: "🏆",
    specialColor: true,
    accent: "#6c63ff",
    bg: "linear-gradient(135deg, rgba(243,232,255,0.2), rgba(196,181,253,0.15))",
    border: "#c4b5fd",
    desc: "Global institutional leaderboard showcasing Platinum-tier students, top XP sprint leaders, and CRI achievers."
  },
  {
    id: "community-card",
    label: "Community",
    icon: "👥",
    specialColor: true,
    accent: "#1565c0",
    bg: "linear-gradient(135deg, rgba(227,242,253,0.2), rgba(144,202,249,0.15))",
    border: "#90caf9",
    desc: "Connect with peer study circles, share project breakdowns, and build reputation points across your institution."
  },

  // Standard Feature Cards
  {
    id: "my-roadmap",
    label: "My Roadmap",
    icon: "🗺️",
    accent: "#6c63ff",
    desc: "Your 4-year SDE skill blueprint mapped to your college curriculum with target milestones."
  },
  {
    id: "daily-challenges",
    label: "Daily Challenges",
    icon: "⚡",
    accent: "#f7971e",
    desc: "Four fresh coding and CS fundamental challenges dropped every morning with XP streak multipliers."
  },
  {
    id: "progress-report",
    label: "Progress Report",
    icon: "📊",
    accent: "#00c9a7",
    desc: "Live analytics dashboard tracking your CRI score, skill velocity, and consistency heatmap."
  },
  {
    id: "hackattack",
    label: "HackAttack Arena",
    icon: "⚔️",
    accent: "#e040fb",
    desc: "Competitive arena matching live hackathons and coding sprints to your current skill level."
  },
  {
    id: "interview-prep",
    label: "Interview Prep",
    icon: "🎤",
    accent: "#6c63ff",
    desc: "Mock interview engine with company-specific DSA rounds, whiteboard sessions, and AI feedback."
  },
  {
    id: "placement-inbox",
    label: "Placement Inbox",
    icon: "📥",
    accent: "#f7971e",
    desc: "Direct messaging channel where verified recruiters send job offers based on your CRI score."
  },
  {
    id: "certifications",
    label: "Certifications Vault",
    icon: "📜",
    accent: "#00c9a7",
    desc: "Digitally verifiable credentials and skill badges shareable on LinkedIn and resume portfolios."
  },
  {
    id: "pathed-store",
    label: "PathEd Store",
    icon: "🛍️",
    accent: "#9c27b0",
    desc: "Redeem XP and coins for roadmap themes, streak shields, and partner platform vouchers."
  }
];

export default function AddWidgetModal({ isOpen, onClose, activeWidgets, onAddWidget, onRemoveWidget }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          style={{
            position: "relative", width: "100%", maxWidth: 720, maxHeight: "85vh",
            background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
            borderRadius: 24, padding: "28px 32px", overflowY: "auto",
            boxShadow: "0 25px 60px rgba(0,0,0,0.3)"
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid var(--border-light)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Sparkles size={20} color="#6c63ff" />
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--text-main)" }}>Customize Your Workspace</h3>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>Select widgets to add or remove from your personal dashboard grid.</p>
            </div>
            <button onClick={onClose} style={{ background: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 10, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-main)" }}>
              <X size={18} />
            </button>
          </div>

          {/* Widget Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {ALL_AVAILABLE_WIDGETS.map(widget => {
              const isAdded = activeWidgets.some(w => w.id === widget.id);
              return (
                <div
                  key={widget.id}
                  style={{
                    background: widget.specialColor ? widget.bg : "var(--bg-alt)",
                    border: `1.5px solid ${widget.specialColor ? widget.border : "var(--border-light)"}`,
                    borderRadius: 16, padding: 18, display: "flex", flexDirection: "column", justifyContent: "space-between"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 24 }}>{widget.icon}</span>
                    <div>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--text-main)" }}>
                        {widget.label}
                        {widget.specialColor && (
                          <span style={{ marginLeft: 8, fontSize: 9, fontFamily: "'Fira Code', monospace", padding: "2px 6px", borderRadius: 6, background: widget.accent, color: "#fff", fontWeight: 700 }}>
                            SPECIAL
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.4 }}>
                        {widget.desc}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => isAdded ? onRemoveWidget(widget.id) : onAddWidget(widget)}
                    style={{
                      width: "100%", padding: "8px", borderRadius: 10, border: "none",
                      background: isAdded ? "rgba(239,68,68,0.15)" : widget.accent,
                      color: isAdded ? "#ef4444" : "#ffffff",
                      fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700,
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                      transition: "all 0.2s"
                    }}
                  >
                    {isAdded ? (
                      <> <Check size={14} /> Added to Workspace (Click to Remove) </>
                    ) : (
                      <> <Plus size={14} /> Add to Workspace </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
