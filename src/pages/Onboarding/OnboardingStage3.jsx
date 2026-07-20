import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import StageTransitionOverlay from "../../components/onboarding/StageTransitionOverlay";
import { 
  Sun, Moon, Sparkles, ArrowRight, ArrowLeft, Rocket, 
  ShieldCheck, User, Building, Cpu, Trophy, Award, MessageSquare, Info 
} from "lucide-react";

export default function OnboardingStage3() {
  const navigate = useNavigate();

  // Dark Mode State Sync
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.getAttribute("data-theme") === "dark";
  });

  const toggleTheme = () => {
    const nextTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  // User Profile Data (Sync from earlier stages or clean placeholders if tested directly)
  const user = {
    name: "Arjun Sharma",
    institute: "IIT Kanpur",
    branch: "CSE (Computer Science)",
    semester: "4th",
    cri: 0,
    skills: ["Python", "C++", "DSA", "React", "DBMS"],
    rankGlobal: "#0",
    rankUniversity: "#0",
    coins: 0,
    xp: 0,
    badge: { icon: "🌱", label: "Beginner Badge", sub: "Awarded to New PathEd Learners" }
  };

  // Section C State: 3 Qualitative Questions
  const [passion, setPassion] = useState("");
  const [objective, setObjective] = useState("");
  const [pitch, setPitch] = useState("");

  const [isLaunching, setIsLaunching] = useState(false);

  const stages = [
    { num: 1, title: "Academic Foundation & DNA", status: "done" },
    { num: 2, title: "Career Ambition & Target Roles", status: "done" },
    { num: 3, title: "Public Identity Review", status: "active" },
    { num: 4, title: "Roadmap Setup", status: "pending" },
  ];

  const handleLaunch = () => {
    setIsLaunching(true);
    setTimeout(() => {
      setIsLaunching(false);
      navigate("/platform");
    }, 2400);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", color: "var(--text-main)", fontFamily: "'Inter', sans-serif", paddingBottom: 140 }}>
      
      {/* 1. TOP STICKY BAR */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "var(--bg-card)", borderBottom: "1.5px solid var(--border-light)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        padding: "14px 40px", display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6c63ff, #00c9a7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 18, boxShadow: "0 4px 12px rgba(108,99,255,0.3)" }}>
            P
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: "var(--text-main)" }}>
            Path<span style={{ color: "#6c63ff" }}>Ed</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, background: "rgba(108,99,255,0.12)", border: "1px solid #6c63ff40", color: "#6c63ff", fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 800 }}>
            <Sparkles size={14} /> STAGE 3 OF 4 ONBOARDING
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            style={{
              width: 40, height: 40, borderRadius: 12, background: "var(--bg-alt)",
              border: "1.5px solid var(--border-light)", display: "flex", alignItems: "center",
              justifyContent: "center", color: "var(--text-main)", cursor: "pointer"
            }}
            title="Toggle Light / Dark Mode"
          >
            {isDarkMode ? <Sun size={18} color="#f7971e" /> : <Moon size={18} color="#6c63ff" />}
          </motion.button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main style={{ maxWidth: 880, margin: "36px auto 0", padding: "0 24px" }}>
        
        {/* 2. TOP 4-STAGE MINIMAP TRACKER */}
        <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: "24px 28px", marginBottom: 32, boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", marginBottom: 20 }}>
            <div style={{ position: "absolute", left: 30, right: 30, top: 18, height: 3, background: "var(--border-light)", zIndex: 0 }} />
            <div style={{ position: "absolute", left: 30, top: 18, height: 3, background: "linear-gradient(90deg, #6c63ff, #00c9a7)", zIndex: 1, width: "75%", transition: "width 0.4s ease" }} />

            {stages.map((stg) => (
              <div key={stg.num} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "relative", zIndex: 2 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800,
                  background: stg.status === "done" ? "linear-gradient(135deg, #00c9a7, #6c63ff)" : stg.status === "active" ? "linear-gradient(135deg, #6c63ff, #e040fb)" : "var(--bg-alt)",
                  color: stg.status === "done" || stg.status === "active" ? "#ffffff" : "var(--text-muted)",
                  border: stg.status === "pending" ? "2px solid var(--border-light)" : "none",
                  boxShadow: stg.status === "active" ? "0 0 0 4px rgba(108,99,255,0.25)" : "none"
                }}>
                  {stg.status === "done" ? "✓" : stg.num}
                </div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: stg.status === "active" ? "#6c63ff" : stg.status === "done" ? "#00c9a7" : "var(--text-muted)", textAlign: "center", maxWidth: 100 }}>
                  {stg.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. DYNAMIC PROFILE EVOLUTION REMINDER BANNER */}
        <div style={{
          background: "linear-gradient(135deg, rgba(108,99,255,0.12), rgba(0,201,167,0.12))",
          border: "1.5px solid #6c63ff40", borderRadius: 20, padding: "18px 24px", marginBottom: 32,
          display: "flex", alignItems: "center", gap: 14
        }}>
          <div style={{ fontSize: 28, flexShrink: 0 }}>💡</div>
          <div style={{ fontSize: 14, color: "var(--text-main)", lineHeight: 1.6, fontWeight: 500 }}>
            <strong style={{ color: "#6c63ff" }}>Dynamic Profile Evolution Notice:</strong> Your public profile is not static — it will continuously evolve and level up based on your daily study consistency, project submissions, and skill achievements on PathEd. Recruiters will see your live real-time progress!
          </div>
        </div>

        {/* HEADER TITLE */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 20, background: "rgba(224,64,251,0.12)", border: "1px solid #e040fb40", color: "#e040fb", fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 800, marginBottom: 12 }}>
            <User size={16} /> PUBLIC IDENTITY REVIEW
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 42, fontWeight: 800, margin: "0 0 12px", lineHeight: 1.15, color: "var(--text-main)" }}>
            Review Your <span style={{ background: "linear-gradient(135deg, #6c63ff, #00c9a7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Public Identity & Profile</span>
          </h1>
          <p style={{ fontSize: 16.5, color: "var(--text-muted)", maxWidth: 600, margin: "0 auto", lineHeight: 1.5 }}>
            Review your public face as it will appear to recruiters, mentors, and peers before launching your 4-year SDE roadmap.
          </p>
        </div>

        {/* SECTION CARDS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          
          {/* SECTION A: HERO IDENTITY CARD */}
          <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 32, boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(108,99,255,0.12)", border: "1.5px solid #6c63ff40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                🪪
              </div>
              <div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
                  SECTION A — Hero Identity Card
                </h3>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: "#6c63ff", letterSpacing: 1 }}>
                  PUBLIC RECRUITER FACE
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 28, alignItems: "flex-start", flexWrap: "wrap" }}>
              {/* Avatar Box */}
              <div style={{ textAlign: "center", flexShrink: 0 }}>
                <div style={{ width: 100, height: 100, borderRadius: "50%", background: "linear-gradient(135deg, #6c63ff, #00c9a7)", padding: 3, margin: "0 auto 12px" }}>
                  <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "var(--bg-alt)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>
                    🎓
                  </div>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 12, background: "rgba(0,201,167,0.12)", border: "1px solid #00c9a740", fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: "#00c9a7" }}>
                  ✔ Verified Student
                </div>
              </div>

              {/* Identity Info Details */}
              <div style={{ flex: 1, minWidth: 260 }}>
                <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--text-main)", margin: "0 0 6px" }}>
                  {user.name}
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  <div style={{ fontSize: 14, color: "var(--text-muted)" }}>
                    🏛️ Institute: <strong style={{ color: "var(--text-main)" }}>{user.institute}</strong>
                  </div>
                  <div style={{ fontSize: 14, color: "var(--text-muted)" }}>
                    💻 Branch: <strong style={{ color: "var(--text-main)" }}>{user.branch} ({user.semester} Sem)</strong>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                  {/* CRI Gauge Badge */}
                  <div style={{ padding: "12px 18px", borderRadius: 16, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", textAlign: "center" }}>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 900, color: "#6c63ff" }}>
                      {user.cri}%
                    </div>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, fontWeight: 700, color: "var(--text-muted)" }}>
                      CRI INDEX (INITIAL)
                    </div>
                  </div>

                  {/* Skills Chips */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6 }}>
                      CORE SKILL TAGS
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {user.skills.map(s => (
                        <span key={s} style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(108,99,255,0.12)", border: "1px solid #6c63ff40", color: "#6c63ff", fontSize: 11, fontWeight: 600 }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* SECTION B: PERFORMANCE & GAMIFICATION */}
          <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 32, boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(247,151,30,0.12)", border: "1.5px solid #f7971e40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                🏆
              </div>
              <div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
                  SECTION B — Performance & Gamification
                </h3>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: "#f7971e", letterSpacing: 1 }}>
                  INITIAL LEADERBOARD BASELINE
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              {/* Stats Box */}
              <div style={{ background: "var(--bg-alt)", borderRadius: 18, padding: 20, border: "1px solid var(--border-light)" }}>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", marginBottom: 12 }}>
                  PLATFORM STATS
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "var(--text-muted)" }}>Global Rank:</span>
                    <strong style={{ color: "#6c63ff" }}>#0 (Unranked)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "var(--text-muted)" }}>University Rank:</span>
                    <strong style={{ color: "#00c9a7" }}>#0 (Unranked)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: "var(--text-muted)" }}>Coins & XP:</span>
                    <strong style={{ color: "#f7971e" }}>0 🪙 · 0 XP</strong>
                  </div>
                </div>
              </div>

              {/* Earned Badges Box (ONLY 1 BEGINNER BADGE) */}
              <div style={{ background: "var(--bg-alt)", borderRadius: 18, padding: 20, border: "1px solid var(--border-light)" }}>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", marginBottom: 12 }}>
                  EARNED BADGES (1 BADGE)
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 14, background: "rgba(0,201,167,0.12)", border: "1px solid #00c9a740" }}>
                  <span style={{ fontSize: 26 }}>{user.badge.icon}</span>
                  <div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: "#00c9a7" }}>
                      {user.badge.label}
                    </div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                      {user.badge.sub}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION C: QUALITATIVE PROFESSIONAL BLOCKS */}
          <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 32, boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(224,64,251,0.12)", border: "1.5px solid #e040fb40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                💬
              </div>
              <div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
                  SECTION C — Qualitative Professional Blocks
                </h3>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: "#e040fb", letterSpacing: 1 }}>
                  SOFT SKILLS & CAREER ASPIRATIONS
                </div>
              </div>
            </div>

            {/* Q1: The Passion Behind the Goal */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>
                The Passion Behind the Goal
              </label>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 10px" }}>
                Why did you choose this career path? Be honest — this shapes your AI roadmap narrative.
              </p>
              <textarea
                rows={3}
                value={passion}
                onChange={e => setPassion(e.target.value)}
                placeholder="Type your story or core motivation..."
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 14,
                  background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                  fontSize: 14, color: "var(--text-main)", outline: "none", resize: "vertical"
                }}
              />
            </div>

            {/* Q2: Professional Objectives */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>
                Professional Objectives
              </label>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 10px" }}>
                What you hope to achieve through PathEd.
              </p>
              <textarea
                rows={3}
                value={objective}
                onChange={e => setObjective(e.target.value)}
                placeholder="e.g. Build a solid DSA foundation and ship 3 production projects..."
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 14,
                  background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                  fontSize: 14, color: "var(--text-main)", outline: "none", resize: "vertical"
                }}
              />
            </div>

            {/* Q3: Unique Strength / Elevator Pitch */}
            <div>
              <label style={{ display: "block", fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text-main)", marginBottom: 4 }}>
                Unique Strength / Elevator Pitch
              </label>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 10px" }}>
                One line that summarises your added value. Recruiters read this first.
              </p>
              <input
                type="text"
                value={pitch}
                onChange={e => setPitch(e.target.value)}
                placeholder="e.g. Fast learner passionate about backend system architecture & clean code."
                style={{
                  width: "100%", padding: "14px 16px", borderRadius: 14,
                  background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                  fontSize: 14, color: "var(--text-main)", outline: "none"
                }}
              />
            </div>

          </div>

          {/* SECTION D: DOCUMENT & PORTFOLIO INTEGRATION NOTICE */}
          <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 32, boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(0,201,167,0.12)", border: "1.5px solid #00c9a740", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                📁
              </div>
              <div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
                  SECTION D — Document & Portfolio Integration
                </h3>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: "#00c9a7", letterSpacing: 1 }}>
                  PROFILE INTEGRATION NOTICE
                </div>
              </div>
            </div>

            <div style={{ padding: "18px 20px", borderRadius: 16, background: "var(--bg-alt)", border: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: 12 }}>
              <Info size={24} color="#6c63ff" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5 }}>
                <strong style={{ color: "var(--text-main)" }}>Notice:</strong> Document uploads (Resume, CV), GitHub links, and project entries will be updated directly inside your student profile settings on the dashboard. No entries are required here during onboarding.
              </div>
            </div>
          </div>

          {/* FINAL LAUNCH ACTION BUTTON (NO SECTION E LABEL) */}
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button
              onClick={handleLaunch}
              disabled={isLaunching}
              style={{
                width: "100%", maxWidth: 520, padding: "18px 36px", borderRadius: 20, border: "none",
                background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#ffffff",
                fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800,
                cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 12,
                boxShadow: "0 10px 30px rgba(108,99,255,0.35)", transition: "all 0.2s"
              }}
            >
              <Rocket size={22} /> {isLaunching ? "Launching Your Roadmap..." : "🚀 Finalize & Launch My Roadmap"}
            </button>
          </div>

        </div>
      </main>

      {/* CLEAN PROFILE SYNCHRONIZATION BOTTOM BAR */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 90,
        background: "var(--bg-card)", borderTop: "1.5px solid var(--border-light)",
        padding: "14px 40px", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 -10px 30px rgba(0,0,0,0.06)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 800, color: "#6c63ff" }}>
          <Sparkles size={16} /> PROFILE SYNCHRONIZATION ACTIVE
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 800, color: "#00c9a7" }}>
            75% FILLED
          </span>
          <div style={{ width: 140, height: 8, borderRadius: 4, background: "var(--bg-alt)", border: "1px solid var(--border-light)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "75%", background: "linear-gradient(90deg, #6c63ff, #00c9a7)", borderRadius: 4 }} />
          </div>
        </div>
      </div>

      {/* Stage Transition Overlay */}
      <StageTransitionOverlay
        isOpen={isLaunching}
        currentStageTitle="Stage 3: Public Identity Review"
        nextStageTitle="Launching Custom 4-Year PathEd SDE Roadmap"
        roleColor="#00c9a7"
      />

    </div>
  );
}
