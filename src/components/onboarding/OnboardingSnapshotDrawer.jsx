import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Sparkles } from "lucide-react";

export default function OnboardingSnapshotDrawer({ 
  completionPct = 100, 
  tags = [], 
  expandedData = [] 
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 90,
      background: "var(--bg-card)", borderTop: "1.5px solid var(--border-light)",
      padding: "14px 36px", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      boxShadow: "0 -10px 35px rgba(0,0,0,0.08)"
    }}>
      {/* COLLAPSED BAR HEADER */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 12.5, fontWeight: 800, color: "#6c63ff", letterSpacing: 1, display: "flex", alignItems: "center", gap: 6 }}>
            <Sparkles size={16} /> SNAPSHOT:
          </span>

          {tags.map((tag, idx) => (
            <span
              key={idx}
              style={{
                padding: "6px 14px", borderRadius: 12,
                background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                fontSize: 13.5, fontWeight: 700, color: "var(--text-main)"
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 800, color: "#00c9a7" }}>
            {completionPct}% FILLED
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 14,
              background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "#6c63ff",
              fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 800, cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {isExpanded ? <>Collapse Answers <ChevronDown size={16} /></> : <>Expand Answers <ChevronUp size={16} /></>}
          </button>
        </div>
      </div>

      {/* EXPANDED DETAILED ANSWERS GRID */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            style={{ overflow: "hidden", paddingTop: 14, borderTop: "1.5px solid var(--border-light)" }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              {expandedData.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "var(--bg-alt)", padding: "14px 18px", borderRadius: 14,
                    border: "1.5px solid var(--border-light)"
                  }}
                >
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 800, color: "#6c63ff", letterSpacing: 1, marginBottom: 4 }}>
                    {item.label}
                  </div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, color: "var(--text-main)" }}>
                    {item.value || "Not specified"}
                  </div>
                  {item.sub && (
                    <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>
                      {item.sub}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
