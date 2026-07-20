import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export default function StageTransitionOverlay({ isOpen, currentStageTitle, nextStageTitle, roleColor = "#6c63ff", onComplete }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        {/* Full Screen Blur Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "absolute", inset: 0,
            background: "rgba(10, 10, 20, 0.88)",
            backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)"
          }}
        />

        {/* Dynamic Radar Pulse Glow Rings */}
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", border: `1.5px solid ${roleColor}40`, animation: "pulse 2s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", border: `1px solid ${roleColor}20`, animation: "pulse 3s ease-in-out infinite" }} />

        {/* Congratulatory Content Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          style={{
            position: "relative", zIndex: 10, width: "100%", maxWidth: 520,
            background: "var(--bg-card)", border: `2px solid ${roleColor}60`,
            borderRadius: 28, padding: "40px 36px", textAlign: "center",
            boxShadow: `0 25px 60px ${roleColor}30`
          }}
        >
          {/* Success Check Badge */}
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: `linear-gradient(135deg, ${roleColor}, #00c9a7)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", margin: "0 auto 20px", boxShadow: `0 10px 30px ${roleColor}50` }}>
            <CheckCircle2 size={42} />
          </div>

          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 800, color: roleColor, letterSpacing: 1.5, marginBottom: 8 }}>
            🎉 STAGE COMPLETED!
          </div>

          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 800, color: "var(--text-main)", margin: "0 0 12px", lineHeight: 1.3 }}>
            Congratulating You on Completing <br /><span style={{ color: roleColor }}>{currentStageTitle}</span>
          </h2>

          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 24 }}>
            Your responses have been synchronized with PathEd's AI engine. Transitioning you to the next stage...
          </p>

          <div style={{ background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", borderRadius: 18, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 28 }}>
            <Sparkles size={18} color="#00c9a7" />
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, color: "var(--text-main)" }}>
              Next Stage: <span style={{ color: "#00c9a7" }}>{nextStageTitle}</span>
            </span>
          </div>

          {/* Animated Spinner Line */}
          <div style={{ height: 6, width: "100%", borderRadius: 3, background: "var(--bg-alt)", overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.2, ease: "easeInOut" }}
              style={{ height: "100%", background: `linear-gradient(90deg, ${roleColor}, #00c9a7)` }}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
