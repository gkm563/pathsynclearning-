import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function HoverCard({ children, style, onMouseEnter, onMouseLeave }) {
  return (
    <motion.div 
      whileHover={{ y: -12, boxShadow: "0 30px 60px rgba(108,99,255,0.3)" }} 
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ ...style }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </motion.div>
  );
}

export function RecruiterValidationSection() {
  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };
  return (
    <section style={{ padding: "100px 32px", background: "#fcfdff", borderTop: "1px solid #eaecff", borderBottom: "1px solid #eaecff" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap" }}>
        
        <motion.div {...fadeInUp} style={{ flex: "1 1 500px" }}>
          <Chip bg="#e6f4ff" border="#bae0ff" color="#1677ff">▸ RECRUITER VERIFIED</Chip>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "#1a1a2e", lineHeight: 1.15, margin: "24px 0" }}>
            Transparent Skills.<br />Assured Placements.
          </h2>
          <p style={{ fontSize: 18, color: "#666", lineHeight: 1.8, marginBottom: 24 }}>
            Your hard work doesn't go unnoticed. PathEd gives authorized recruiters direct visibility into your verified performance, skill roadmap, and CRI scores. 
          </p>
          <p style={{ fontSize: 18, color: "#666", lineHeight: 1.8 }}>
            By validating your skills through our uncompromising metrics, you bypass traditional hiring friction and connect directly with companies looking for true, demonstrable readiness.
          </p>
        </motion.div>

        <motion.div {...fadeInUp} style={{ flex: "1 1 600px" }}>
          <HoverCard style={{ height: 400, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(22,119,255,0.15)", border: "1.5px solid #bae0ff", background: "#fff" }}>
            <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80" alt="Recruiter reviewing candidate" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </HoverCard>
        </motion.div>

      </div>
    </section>
  );
}

export function Chip({ bg, border, color, children }) {
  return (
    <div style={{ 
      display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", 
      borderRadius: 20, background: bg, border: `1px solid ${border}`, 
      fontFamily: "'Fira Code', monospace", fontSize: 11, color, 
      letterSpacing: ".5px", fontWeight: 600 
    }}>
      {children}
    </div>
  );
}

export function SkillBar({ label, pct, c, delay = 0 }) {
  const [w, setW] = useState(0);
  useEffect(() => { 
    const t = setTimeout(() => setW(pct), 600 + delay); 
    return () => clearTimeout(t); 
  }, [pct, delay]);
  
  return (
    <div style={{ marginBottom: label ? 10 : 0 }}>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#555" }}>{label}</span>
          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: c }}>{pct}%</span>
        </div>
      )}
      <div style={{ height: 6, borderRadius: 3, background: "#eaecff", overflow: "hidden" }}>
        <div style={{ 
          height: "100%", width: `${w}%`, 
          background: `linear-gradient(90deg,${c},${c}99)`, 
          borderRadius: 3, transition: "width 1s cubic-bezier(.4,0,.2,1)" 
        }} />
      </div>
    </div>
  );
}

export function RoleCard({ icon, title, tagline, desc, active, onClick }) {
  return (
    <button 
      onClick={onClick} 
      style={{ 
        flex: 1, minWidth: 155, 
        background: active ? "linear-gradient(145deg,#f0f0ff,#e8f9f5)" : "#fff", 
        border: `2px solid ${active ? "#6c63ff" : "#e8ecff"}`, 
        borderRadius: 18, padding: "26px 22px", cursor: "pointer", textAlign: "left", 
        position: "relative", overflow: "hidden", 
        transition: "all .35s cubic-bezier(.34,1.56,.64,1)", 
        transform: active ? "translateY(-6px) scale(1.03)" : "scale(1)", 
        boxShadow: active ? "0 16px 48px rgba(108,99,255,.2),0 0 0 4px rgba(108,99,255,.08)" : "0 2px 16px rgba(108,99,255,.06)" 
      }}
    >
      {active && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#6c63ff,#00c9a7)", borderRadius: "18px 18px 0 0" }} />}
      <div style={{ 
        width: 44, height: 44, borderRadius: 12, 
        background: active ? "linear-gradient(135deg,#6c63ff,#00c9a7)" : "#f5f5f5", 
        display: "flex", alignItems: "center", justifyContent: "center", 
        fontSize: 22, marginBottom: 14, 
        boxShadow: active ? "0 6px 18px rgba(108,99,255,.3)" : "none", 
        color: active ? "#fff" : "#bbb", transition: "all .3s" 
      }}>
        {icon}
      </div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: active ? "#1a1a2e" : "#bbb", marginBottom: 5 }}>{title}</div>
      <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, color: active ? "#6c63ff" : "#ccc", letterSpacing: 1, marginBottom: 12 }}>{tagline}</div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: active ? "#999" : "#ccc", lineHeight: 1.6 }}>{desc}</div>
    </button>
  );
}
