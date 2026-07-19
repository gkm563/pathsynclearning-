import React, { useState, useEffect } from "react";

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
