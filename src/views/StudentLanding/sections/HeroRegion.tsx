"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Chip, RoleCard, SkillBar } from "../../../components/ui/Shared";

export default function HeroRegion() {
  const [activeRole, setActiveRole] = useState("s");
  const [mode, setMode] = useState("c");
  const isC = mode === "c";
  const router = useRouter();

  const skills = [
    { label: "DSA", pct: 72, c: "#6c63ff" },
    { label: "System Design", pct: 45, c: "#00c9a7" },
    { label: "Web Dev", pct: 88, c: "#f7971e" },
  ];

  return (
    <>
      {/* S1 ROLE SELECTOR */}
      <section style={{ padding: "80px 0 56px", textAlign: "center", position: "relative", zIndex: 2 }}>
        <div className="f1" style={{ marginBottom: 20 }}>
          <Chip bg="#f0f0ff" border="#d8d4ff" color="#6c63ff">▸ PLATFORM ENTRY — SELECT YOUR ROLE</Chip>
        </div>
        
        <h1 className="f2" style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(48px,7vw,84px)", fontWeight: 800, lineHeight: 1.05, marginBottom: 16, color: "var(--text-main)", maxWidth: "900px", margin: "0 auto 16px" }}>
          How do you want to<br /> <span className="shimmer-text">join PathEd?</span>
        </h1>
        
        <p className="f3" style={{ color: "var(--text-muted)", fontSize: 18, maxWidth: 540, margin: "0 auto 48px", lineHeight: 1.7, fontFamily: "'Inter', sans-serif" }}>
          One platform. Three powerful perspectives. Your journey begins with a single choice.
        </p>

        <div className="f4" style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", maxWidth: "1080px", margin: "0 auto" }}>
          <RoleCard 
            icon="◈" title="Student" tagline="Learn. Build. Grow." 
            desc="Roadmaps, CRI tracking, daily challenges & peer community." 
            active={activeRole === "s"} 
            onClick={() => { setActiveRole("s"); router.push("/"); }} 
          />
          <RoleCard 
            icon="⬡" title="Teacher" tagline="Guide. Mentor. Empower." 
            desc="Classroom tools, analytics & student progress monitoring." 
            active={activeRole === "t"} 
            onClick={() => { setActiveRole("t"); }} 
          />
          <RoleCard 
            icon="◎" title="Recruiter" tagline="Discover. Hire. Lead." 
            desc="Smart talent filters, CRI scores & verified skill resumes." 
            active={activeRole === "r"} 
            onClick={() => { setActiveRole("r"); }} 
          />
        </div>

        <div className="f5" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 36 }}>
          {[
            ["🎓 40,000+ Students", "#f0f0ff", "#d8d4ff", "#6c63ff"],
            ["✓ 95% Placement Rate", "#e8faf5", "#b2eed9", "#00a67e"],
            ["⚡ 500+ Companies", "#fff8ee", "#ffe0a0", "#c67c00"],
            ["🏆 1M+ XP Daily", "#fdf0ff", "#e8b3ff", "#9c27b0"]
          ].map(([text, bg, border, color]) => (
            <motion.div key={text} whileHover={{ scale: 1.05, boxShadow: `0 0 0 2px ${color}, 0 4px 15px ${color}40`, borderRadius: 100 }} style={{ borderRadius: 100, transition: "box-shadow 0.2s" }}>
              <Chip bg={bg} border={border} color={color}>{text}</Chip>
            </motion.div>
          ))}
        </div>
      </section>

      {/* S2 MODE TOGGLE */}
      <section style={{ paddingBottom: 52, textAlign: "center", position: "relative", zIndex: 2 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "linear-gradient(90deg,#f0f0ff,#e8faf5)", border: "1.5px solid #d8d4ff", borderRadius: 24, padding: "9px 22px 9px 12px", marginBottom: 26 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "linear-gradient(135deg,#6c63ff,#00c9a7)", animation: "pulse 2s ease infinite" }} />
          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 600, color: "#6c63ff", letterSpacing: "1.5px" }}>TEACHER GUIDANCE ACTIVE — ALL MODES</span>
        </div>
        <div style={{ display: "flex", gap: 0, background: "var(--bg-card)", borderRadius: 14, padding: 5, border: "1.5px solid var(--border-light)", width: "fit-content", margin: "0 auto", boxShadow: "0 4px 20px rgba(108,99,255,.08)" }}>
          {[["c","🚀 Career Mode"],["a","📚 Academic Mode"]].map(([m,lbl]) => (
            <button key={m} onClick={() => setMode(m)} style={{ 
              padding: "10px 28px", borderRadius: 10, border: "none", cursor: "pointer", 
              fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 13, transition: "all .3s ease", 
              background: mode === m ? (m === "c" ? "linear-gradient(135deg,#6c63ff,#00c9a7)" : "linear-gradient(135deg,#f7971e,#e040fb)") : "transparent", 
              color: mode === m ? "var(--bg-card)" : "#888", 
              boxShadow: mode === m ? (m === "c" ? "0 6px 24px rgba(108,99,255,.35)" : "0 6px 24px rgba(247,151,30,.3)") : "none" 
            }}>
              {lbl}
            </button>
          ))}
        </div>
      </section>

      {/* S3 HERO */}
      <section style={{ paddingBottom: 80, position: "relative", zIndex: 2, maxWidth: 1360, margin: "0 auto", padding: "0 32px 80px" }}>
        <div style={{ 
          background: isC ? "var(--hero-card-gradient-c)" : "var(--hero-card-gradient-a)", 
          border: `2px solid ${isC ? "#d8d4ff" : "#ffe0a0"}`, borderRadius: 24, padding: "56px 64px", marginBottom: 40, 
          position: "relative", overflow: "hidden", boxShadow: "0 8px 40px rgba(108,99,255,.1)" 
        }}>
          <div style={{ position: "absolute", right: -60, top: -60, width: 320, height: 320, opacity: .12, animation: "spinSlow 30s linear infinite" }}>
            <svg viewBox="0 0 320 320"><circle cx="160" cy="160" r="130" stroke="#6c63ff" strokeWidth="40" strokeDasharray="10 6" fill="none"/></svg>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 50, flexWrap: "wrap" }}>
            
            <div style={{ flex: 1, minWidth: 320 }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 600, color: isC ? "#6c63ff" : "#c68a00", letterSpacing: 2, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: isC ? "#6c63ff" : "#f7971e", animation: "pulse 1.5s ease infinite" }} />▸ {isC ? "CAREER" : "ACADEMIC"} MODE ACTIVE
              </div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(24px,3.5vw,42px)", fontWeight: 800, lineHeight: 1.15, marginBottom: 16, color: "#1a1a2e" }}>
                {isC ? <>Turn your B.Tech degree into a<br/><span style={{ color: "#6c63ff" }}>career-ready roadmap.</span></> : <>Master your University Curriculum<br/><span style={{ color: "#f7971e" }}>with structured precision.</span></>}
              </h2>
              <p style={{ color: "#666666", fontSize: 17, lineHeight: 1.8, maxWidth: 480, marginBottom: 12, fontFamily: "'Inter', sans-serif" }}>
                {isC ? "AI-powered skill paths calibrated to Google, Microsoft, Razorpay & 500+ companies. Build what the industry demands — skip what it doesn't." : "Week-by-week syllabus breakdowns with live exam countdowns. No more last-minute cramming. Structured mastery from Day 1."}
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
                {(isC ? [["#f0f0ff","#d8d4ff","#6c63ff","✦ AI-fication"],["#e8faf5","#b2eed9","#00a67e","✦ CRI Tracker"],["#fff8ee","#ffe0a0","#c67c00","✦ XP + Coins"],["#fdf0ff","#e8b3ff","#9c27b0","✦ Memory Lane"]] : [["#fff8ee","#ffe0a0","#c67c00","✦ Session Classes"],["#fdf0ff","#e8b3ff","#9c27b0","✦ Ranker Board"],["#e8faf5","#b2eed9","#00a67e","✦ PYQ Banks"],["#f0f0ff","#d8d4ff","#6c63ff","✦ Teacher Live"]]).map(([bg,bdr,c,lbl]) => <Chip key={lbl} bg={bg} border={bdr} color={c}>{lbl}</Chip>)}
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button onClick={() => router.push("/sign-up")} style={{ 
                  background: isC ? "linear-gradient(135deg,#6c63ff,#00c9a7)" : "linear-gradient(135deg,#f7971e,#e040fb)", 
                  border: "none", color: "var(--text-inverse)", fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: 14, 
                  padding: "14px 36px", borderRadius: 12, cursor: "pointer", 
                  boxShadow: isC ? "0 8px 28px rgba(108,99,255,.35)" : "0 8px 28px rgba(247,151,30,.3)" 
                }}>
                  Start {isC ? "Career" : "Academic"} Mode →
                </button>
                <button style={{ background: "transparent", border: "1.5px solid #d0d4ff", color: "#6c63ff", fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 13, padding: "14px 28px", borderRadius: 12, cursor: "pointer" }}>
                  ▶ Watch Demo
                </button>
              </div>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ animation: "floatY 4s ease-in-out infinite", background: "var(--bg-card)", borderRadius: 20, padding: 20, boxShadow: "0 8px 32px rgba(108,99,255,.12)", border: "1.5px solid var(--border-light)" }}>
                <svg width="130" height="130" viewBox="0 0 130 130">
                  <circle cx="65" cy="65" r="54" fill="none" stroke="#f0f2ff" strokeWidth="9"/>
                  <circle cx="65" cy="65" r="54" fill="none" stroke="url(#cg)" strokeWidth="9" strokeDasharray="339" strokeDashoffset="74" strokeLinecap="round" transform="rotate(-90 65 65)" style={{ animation: "criDraw 2s .5s cubic-bezier(.22,1,.36,1) both" }}/>
                  <defs><linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#6c63ff"/><stop offset="100%" stopColor="#00c9a7"/></linearGradient></defs>
                  <text x="65" y="59" textAnchor="middle" fill="var(--text-main)" fontFamily="'Outfit', sans-serif" fontSize="22" fontWeight="800">78%</text>
                  <text x="65" y="76" textAnchor="middle" fill="#6c63ff" fontFamily="'Fira Code', monospace" fontSize="8" letterSpacing="1.5">CRI SCORE</text>
                </svg>
                <div style={{ textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#999", marginTop: 6 }}>Career Readiness Index</div>
              </div>
              <div style={{ background: "var(--bg-card)", borderRadius: 16, padding: "20px 24px", boxShadow: "0 4px 20px rgba(108,99,255,.08)", border: "1.5px solid var(--border-light)", minWidth: 220 }}>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 600, color: "#6c63ff", letterSpacing: 2, marginBottom: 14 }}>SKILL SNAPSHOT</div>
                {skills.map((s,i) => <SkillBar key={s.label} {...s} delay={i*150} />)}
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}
