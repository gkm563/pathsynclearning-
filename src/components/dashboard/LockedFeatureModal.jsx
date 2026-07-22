import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Lock, ShoppingBag, X, ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";

export default function LockedFeatureModal({ feature, isOpen, onClose }) {
  const navigate = useNavigate();
  if (!isOpen || !feature) return null;

  return (
    <AnimatePresence>
      <div style={{ position: "fixed", inset: 0, zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          style={{
            position: "relative", width: "100%", maxWidth: 500,
            background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
            borderRadius: 24, padding: "32px", textAlign: "center",
            boxShadow: "0 25px 60px rgba(0,0,0,0.3)", overflow: "hidden"
          }}
        >
          {/* Close button */}
          <button onClick={onClose} style={{ position: "absolute", right: 16, top: 16, background: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 10, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-main)" }}>
            <X size={16} />
          </button>

          {/* Locked Icon Badge */}
          <div style={{ width: 72, height: 72, borderRadius: 24, background: "rgba(239,68,68,0.12)", border: "1.5px solid #ef4444", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", margin: "0 auto 20px", fontSize: 32 }}>
            {feature.icon || <Lock size={32} />}
          </div>

          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
            {feature.label}
          </h3>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid #ef444440", color: "#ef4444", fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 700, marginBottom: 16 }}>
            <Lock size={12} /> FEATURE CURRENTLY LOCKED
          </div>

          {/* Detailed Feature Breakdown / Mini Description */}
          <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 16, padding: "16px", marginBottom: 20, textAlign: "left" }}>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: feature.accent || "#6c63ff", letterSpacing: 1, marginBottom: 6 }}>
              FEATURE DESCRIPTION & BENEFITS
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 12px" }}>
              {feature.desc || "Unlock access to senior engineering mentors, collaborative project teams, referral networks, and institutional summits."}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: "var(--text-main)" }}>
                <CheckCircle2 size={14} color="#00c9a7" /> Verified peer & recruiter connections
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: "var(--text-main)" }}>
                <CheckCircle2 size={14} color="#00c9a7" /> Real-time collaborative workspace access
              </div>
            </div>
          </div>

          {/* Unlock Requirement */}
          <div style={{ background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.3)", borderRadius: 14, padding: "12px 16px", marginBottom: 24, textAlign: "left" }}>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: "#6c63ff", letterSpacing: 1, marginBottom: 2 }}>
              HOW TO UNLOCK
            </div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, color: "var(--text-main)", display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldAlert size={16} color="#f7971e" /> {feature.req || "2,000 XP or PathEd Store Pass"}
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={onClose}
              style={{ flex: 1, padding: "12px", borderRadius: 12, background: "var(--bg-alt)", border: "1px solid var(--border-light)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >
              Cancel
            </button>

            <button
              onClick={() => {
                onClose();
                navigate("/store");
              }}
              style={{
                flex: 1.5, padding: "12px", borderRadius: 12, background: "linear-gradient(135deg, #6c63ff, #00c9a7)", border: "none", color: "#ffffff",
                fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: "0 8px 20px rgba(108,99,255,0.3)"
              }}
            >
              <ShoppingBag size={16} /> Go to Store <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
