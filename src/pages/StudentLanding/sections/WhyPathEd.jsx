import React from "react";
import { Chip, SkillBar, InteractiveCard } from "../../../components/ui/Shared";

export default function WhyPathEd() {
  return (
    <section style={{ paddingBottom: 80, position: "relative", zIndex: 2, maxWidth: 1360, margin: "0 auto", padding: "0 32px 80px" }}>
      <div style={{ display: "flex", gap: 40, flexWrap: "wrap", alignItems: "flex-start" }}>
        
        {/* Left Column */}
        <div style={{ flex: "1 1 360px" }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 600, color: "#6c63ff", letterSpacing: 3, marginBottom: 14 }}>▸ WHY PATHED</div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(24px,3vw,42px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 16, color: "var(--text-main)" }}>
            One platform.<br/><span style={{ color: "#6c63ff" }}>Infinite directions.</span>
          </h2>
          <p style={{ color: "#777", fontSize: 17, lineHeight: 1.8, maxWidth: 440, marginBottom: 24, fontFamily: "'Inter', sans-serif" }}>
            The only platform that simultaneously optimizes your CGPA and Career Readiness Index. No compromises.
          </p>
          
          <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: 24, border: "1.5px solid var(--border-light)", boxShadow: "0 2px 12px rgba(108,99,255,.06)" }}>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 600, color: "#6c63ff", letterSpacing: 2, marginBottom: 16 }}>CONSISTENCY HEATMAP — 12 WEEKS</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(14,1fr)", gap: 3 }}>
              {Array.from({ length: 98 }, (_, i) => {
                const v = Math.random();
                const cols = ["#f0f2ff", "#c5c0ff", "#9d97ff", "#6c63ff"];
                const col = v < .3 ? cols[0] : v < .55 ? cols[1] : v < .8 ? cols[2] : cols[3];
                return <div key={i} style={{ aspectRatio: 1, borderRadius: 2, background: col, animation: `heatPulse ${2 + Math.random() * 2}s ease-in-out infinite`, animationDelay: `${Math.random() * 2}s` }} />;
              })}
            </div>
          </div>
          
          <div style={{ marginTop: 20, background: "linear-gradient(135deg,#fff9ee,#fff3cd)", border: "1.5px solid #ffe0a0", borderRadius: 16, padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 600, color: "#c68a00", letterSpacing: 2 }}>⚡ TODAY'S CHALLENGE</div>
              <Chip bg="#fff9e6" border="#ffe08a" color="#c68a00">+150 XP</Chip>
            </div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>Implement Binary Search Tree</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "#888", marginBottom: 16 }}>DSA • Medium • 45 min estimated</div>
            <SkillBar pct={68} c="#f7971e" delay={300} />
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 600, color: "#c68a00", marginTop: 8 }}>7-day streak 🔥</div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ flex: "1 1 420px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            {[
              ["🗺️", "4yr", "#6c63ff", "Visual Roadmap", "Day 1 → Placement"],
              ["📊", "2×", "#00c9a7", "Dual Metrics", "CGPA + CRI live"],
              ["⚡", "∞", "#f7971e", "Daily Challenges", "Gamified XP engine"],
              ["🧑‍🏫", "24/7", "#e040fb", "Teacher Connect", "Beat every plateau"]
            ].map(([em, stat, c, lbl, sub]) => (
              <InteractiveCard key={lbl} style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 16, padding: "26px 20px", textAlign: "center", transition: "all .3s ease", boxShadow: "0 2px 10px rgba(0,0,0,.04)" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{em}</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 36, fontWeight: 800, color: c, marginBottom: 4 }}>{stat}</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>{lbl}</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#999" }}>{sub}</div>
              </InteractiveCard>
            ))}
          </div>
          
          <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: "24px 28px", border: "1.5px solid var(--border-light)", boxShadow: "0 2px 12px rgba(108,99,255,.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#f7971e", animation: "pulse 2s ease infinite" }} />
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 600, color: "#c68a00", letterSpacing: 2 }}>📡 TECH NEWS — LIVE</div>
            </div>
            {[
              { h: "OpenAI releases o3 API for enterprise developers", tag: "AI nodes updated", c: "#00a67e", bg: "#e8faf5", bdr: "#b2eed9", t: "2h ago" },
              { h: "Google plans 2,000 DevOps hires in Q2 2025", tag: "CRI DevOps ↑12%", c: "#6c63ff", bg: "#f0f0ff", bdr: "#d8d4ff", t: "5h ago" },
              { h: "Meta open-sources new LLaMA 4 architecture", tag: "ML roadmap refreshed", c: "#9c27b0", bg: "#fdf0ff", bdr: "#e8b3ff", t: "1d ago" }
            ].map((n, i) => (
              <div key={i} style={{ padding: "14px 0", borderBottom: i < 2 ? "1px solid #f0f2ff" : "none", cursor: "pointer", transition: "transform .2s ease" }} onMouseEnter={e => e.currentTarget.style.transform = "translateX(4px)"} onMouseLeave={e => e.currentTarget.style.transform = ""}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, color: "#333", marginBottom: 6, fontWeight: 500 }}>{n.h}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Chip bg={n.bg} border={n.bdr} color={n.c}>↳ {n.tag}</Chip>
                  <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#bbb", fontWeight: 600 }}>{n.t}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
