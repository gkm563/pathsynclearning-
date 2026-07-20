import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function HoverCard({ children, style, onMouseEnter, onMouseLeave }) {
  return (
    <motion.div 
      whileHover={{ y: -8, boxShadow: "0 30px 60px rgba(108,99,255,0.3)", transition: { type: "spring", stiffness: 400, damping: 17 } }} 
      style={{ ...style }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </motion.div>
  );
}

export function InteractiveCard({ children, style, delay = 0, hoverColor, ...props }) {
  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, delay } };
  return (
    <motion.div 
      {...fadeInUp}
      whileHover={{ 
        y: -8, 
        scale: 1.02, 
        boxShadow: hoverColor 
          ? `0 0 0 2px ${hoverColor}, 0 10px 30px ${hoverColor}40` 
          : "0 20px 40px rgba(108,99,255,0.15)", 
        transition: { type: "spring", stiffness: 400, damping: 17 } 
      }}
      {...props}
      style={{ cursor: "pointer", ...style }}
    >
      {children}
    </motion.div>
  );
}

export function RecruiterValidationSection({ 
  tag = "▸ RECRUITER VERIFIED", 
  title = <>Transparent Skills.<br />Assured Placements.</>, 
  desc1 = "Your hard work doesn't go unnoticed. PathEd gives authorized recruiters direct visibility into your verified performance, skill roadmap, and CRI scores.", 
  desc2 = "By validating your skills through our uncompromising metrics, you bypass traditional hiring friction and connect directly with companies looking for true, demonstrable readiness.", 
  img = "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80" 
}) {
  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };
  return (
    <section style={{ padding: "100px 32px", background: "var(--bg-main)", borderTop: "1px solid var(--border-light)", borderBottom: "1px solid var(--border-light)" }}>
      <div style={{ maxWidth: 1360, margin: "0 auto", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap" }}>
        
        <motion.div {...fadeInUp} style={{ flex: "1 1 500px" }}>
          <Chip bg="#e6f4ff" border="var(--border-strong)" color="#1677ff">{tag}</Chip>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 800, color: "var(--text-main)", lineHeight: 1.15, margin: "24px 0" }}>
            {title}
          </h2>
          <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.8, marginBottom: 24 }}>
            {desc1}
          </p>
          {desc2 && <p style={{ fontSize: 18, color: "var(--text-muted)", lineHeight: 1.8 }}>{desc2}</p>}
        </motion.div>

        <motion.div {...fadeInUp} style={{ flex: "1 1 600px" }}>
          <HoverCard style={{ height: 400, borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 60px rgba(22,119,255,0.15)", border: "1.5px solid var(--border-strong)", background: "var(--bg-card)" }}>
            <img src={img} alt="Recruiter reviewing candidate" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </HoverCard>
        </motion.div>

      </div>
    </section>
  );
}

export function QuoteSection({ quote, author, role }) {
  const fadeInUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };
  return (
    <section style={{ padding: "80px 32px", background: "linear-gradient(135deg, #1a1a2e, #2a2a4e)", color: "var(--text-inverse)" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
        <motion.div {...fadeInUp}>
          <div style={{ fontSize: 64, color: "#6c63ff", opacity: 0.4, lineHeight: 0.5, marginBottom: 20 }}>"</div>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 300, fontStyle: "italic", lineHeight: 1.6, marginBottom: 32 }}>
            {quote}
          </h3>
          <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 40, height: 2, background: "#6c63ff", marginBottom: 16 }} />
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 700 }}>{author}</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#b2aeff", letterSpacing: 1, marginTop: 4, textTransform: "uppercase" }}>{role}</div>
          </div>
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
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "var(--text-muted)" }}>{label}</span>
          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: c }}>{pct}%</span>
        </div>
      )}
      <div style={{ height: 6, borderRadius: 3, background: "var(--border-light)", overflow: "hidden" }}>
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
    <motion.button 
      onClick={onClick}
      whileHover={{ y: -6, scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 17 } }}
      style={{ 
        flex: 1, minWidth: 155, 
        background: active ? "linear-gradient(145deg,#f0f0ff,#e8f9f5)" : "var(--bg-card)", 
        border: `2px solid ${active ? "#6c63ff" : "#e8ecff"}`, 
        borderRadius: 18, padding: "26px 22px", cursor: "pointer", textAlign: "left", 
        position: "relative", overflow: "hidden", 
        boxShadow: active ? "0 16px 48px rgba(108,99,255,.2),0 0 0 4px rgba(108,99,255,.08)" : "0 4px 14px rgba(0,0,0,0.03)"
      }}
    >
      {active && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#6c63ff,#00c9a7)", borderRadius: "18px 18px 0 0" }} />}
      <div style={{ 
        width: 44, height: 44, borderRadius: 12, 
        background: active ? "linear-gradient(135deg,#6c63ff,#00c9a7)" : "#f5f5f5", 
        display: "flex", alignItems: "center", justifyContent: "center", 
        fontSize: 22, marginBottom: 14, 
        boxShadow: active ? "0 6px 18px rgba(108,99,255,.3)" : "none", 
        color: active ? "var(--bg-card)" : "#bbb", transition: "all .3s" 
      }}>
        {icon}
      </div>
      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: active ? "var(--text-main)" : "#bbb", marginBottom: 5 }}>{title}</div>
      <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, color: active ? "#6c63ff" : "#ccc", letterSpacing: 1, marginBottom: 12 }}>{tagline}</div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: active ? "#999" : "#ccc", lineHeight: 1.6 }}>{desc}</div>
    </motion.button>
  );
}
