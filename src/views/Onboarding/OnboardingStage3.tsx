"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import StageTransitionOverlay from "../../components/onboarding/StageTransitionOverlay";
import {
  Sun, Moon, Sparkles, Rocket, User, Globe,
  FileText, Trophy, MessageSquare, Info
} from "lucide-react";
import { apiGet } from "@/lib/api";

export default function OnboardingStage3() {
  const router = useRouter();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [stored1, setStored1] = useState<Record<string, any>>({});
  const [stored2, setStored2] = useState<Record<string, any>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<{ onboarding?: { stage1?: Record<string, unknown>; stage2?: Record<string, unknown> } }>("/api/me/onboarding");
        if (cancelled) return;
        const o = data.onboarding || {};
        setStored1((o.stage1 as Record<string, unknown>) || {});
        setStored2((o.stage2 as Record<string, unknown>) || {});
      } catch {
        // keep defaults
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleTheme = () => {
    const next = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute("data-theme", next);
  };

  const userSkills = Array.from(new Set([...(stored2.tags || []), ...(stored2.domains || [])]));

  const user = {
    name: stored1.name || "Rahul Kushwaha",
    institute: stored1.college || "Indian Institute of Technology, Kanpur",
    branch: stored1.branch || "Computer Science",
    semester: stored1.semester || "4th",
    cgpa: stored1.cgpa || "9.1",
    skills: userSkills.length > 0 ? userSkills : ["Python", "DSA", "React", "Cloud Computing", "DBMS"],
    cri: 78
  };

  const [passion, setPassion] = useState("");
  const [objective, setObjective] = useState("");
  const [pitch, setPitch] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [isLaunching, setIsLaunching] = useState(false);

  const stages = [
    { num: 1, title: "Academic Foundation & DNA", status: "done" },
    { num: 2, title: "Career Ambition & Target Roles", status: "done" },
    { num: 3, title: "Public Identity Review", status: "active" },
    { num: 4, title: "Roadmap Setup", status: "pending" },
  ];

  const badges = [
    { icon: "🌱", label: "Beginner" },
    { icon: "⚔️", label: "Fighter" },
    { icon: "🏅", label: "Achiever" },
    { icon: "🤖", label: "AI User" },
    { icon: "🚀", label: "Launcher" }
  ];

  const handleLaunch = () => {
    setIsLaunching(true);
    setTimeout(() => {
      setIsLaunching(false);
      router.push("/onboarding/stage4");
    }, 2400);
  };

  /* ── Shared section-header layout ── */
  const SectionHeader = ({ emoji, emojiBg, emojiColor, title, subtitle, badge, badgeColor, badgeBg }) => (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: emojiBg, border: `1.5px solid ${emojiColor}40`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0
        }}>
          {emoji}
        </div>
        <div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-main)", margin: "0 0 4px" }}>
            {title}
          </h2>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10.5, fontWeight: 700, color: emojiColor, letterSpacing: 1.2 }}>
            {subtitle}
          </div>
        </div>
      </div>

      {badge && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "6px 14px", borderRadius: 20,
          background: badgeBg, border: `1px solid ${badgeColor}40`,
          fontFamily: "'Fira Code', monospace", fontSize: 10.5, fontWeight: 800, color: badgeColor
        }}>
          🛡️ {badge}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", color: "var(--text-main)", fontFamily: "'Inter', sans-serif", paddingBottom: 140 }}>

      {/* ── TOP STICKY HEADER ── */}
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
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            style={{ width: 40, height: 40, borderRadius: 12, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            {isDarkMode ? <Sun size={18} color="#f7971e" /> : <Moon size={18} color="#6c63ff" />}
          </motion.button>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "36px auto 0", padding: "0 24px" }}>

        {/* ── 4-STAGE PROGRESS TRACKER ── */}
        <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: "30px 36px", marginBottom: 32, boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
            <div style={{ position: "absolute", left: 42, right: 42, top: 31, height: 3, background: "var(--border-light)", zIndex: 0 }} />
            <div style={{ position: "absolute", left: 42, top: 31, height: 3, background: "linear-gradient(90deg, #6c63ff, #00c9a7)", zIndex: 1, width: "75%" }} />
            {stages.map(stg => (
              <div key={stg.num} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 11, position: "relative", zIndex: 2 }}>
                <div style={{
                  width: 62, height: 62, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800,
                  background: stg.status === "done" ? "linear-gradient(135deg, #00c9a7, #6c63ff)" : stg.status === "active" ? "linear-gradient(135deg, #6c63ff, #e040fb)" : "var(--bg-alt)",
                  color: (stg.status === "done" || stg.status === "active") ? "#fff" : "var(--text-muted)",
                  border: stg.status === "pending" ? "2px solid var(--border-light)" : "none",
                  boxShadow: stg.status === "active" ? "0 0 0 6px rgba(108,99,255,0.18), 0 6px 18px rgba(108,99,255,0.35)" : "none"
                }}>
                  {stg.status === "done" ? "✓" : stg.num}
                </div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 700, color: stg.status === "active" ? "#6c63ff" : stg.status === "done" ? "#00c9a7" : "var(--text-muted)", textAlign: "center", maxWidth: 130, lineHeight: 1.35 }}>
                  {stg.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── DYNAMIC PROFILE EVOLUTION BANNER ── */}
        <div style={{
          background: "linear-gradient(135deg, rgba(108,99,255,0.1), rgba(0,201,167,0.1))",
          border: "1.5px solid #6c63ff30", borderRadius: 20, padding: "16px 22px",
          marginBottom: 32, display: "flex", alignItems: "center", gap: 14
        }}>
          <span style={{ fontSize: 26, flexShrink: 0 }}>💡</span>
          <div style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-main)" }}>
            <strong style={{ color: "#6c63ff" }}>Dynamic Profile Evolution Notice:</strong>{" "}
            Your public profile is not static — it will continuously evolve and level up based on your daily consistency, project submissions, and skill achievements on PathEd. Recruiters will see your live progress!
          </div>
        </div>

        {/* ── PAGE TITLE ── */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 20, background: "rgba(224,64,251,0.12)", border: "1px solid #e040fb40", color: "#e040fb", fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 800, marginBottom: 14 }}>
            <User size={14} /> PUBLIC IDENTITY REVIEW
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 44, fontWeight: 800, margin: "0 0 12px", lineHeight: 1.15, color: "var(--text-main)" }}>
            Review Your{" "}
            <span style={{ background: "linear-gradient(135deg, #6c63ff, #00c9a7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Public Identity &amp; Profile
            </span>
          </h1>
          <p style={{ fontSize: 16.5, color: "var(--text-muted)", maxWidth: 580, margin: "0 auto", lineHeight: 1.55 }}>
            Review your public face as it will appear to recruiters, mentors, and peers before launching your 4-year SDE roadmap.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

          {/* ════════════════════════════════════
              SECTION A — HERO IDENTITY CARD
          ════════════════════════════════════ */}
          <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 28, padding: "32px 36px", boxShadow: "0 10px 36px rgba(0,0,0,0.04)" }}>
            <SectionHeader
              emoji="🪪" emojiBg="rgba(108,99,255,0.12)" emojiColor="#6c63ff"
              title="Hero Identity Card" subtitle="SECTION A — YOUR PUBLIC FACE"
              badge="VISIBLE TO RECRUITERS" badgeColor="#6c63ff" badgeBg="rgba(108,99,255,0.1)"
            />

            {/* Two-column hero layout */}
            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 32, alignItems: "start" }}>
              
              {/* LEFT: Avatar + badges + name */}
              <div style={{ textAlign: "center" }}>
                {/* Avatar ring */}
                <div style={{
                  width: 120, height: 120, borderRadius: "50%",
                  background: "conic-gradient(#6c63ff 0deg 200deg, #00c9a7 200deg 300deg, #e040fb 300deg 360deg)",
                  padding: 4, margin: "0 auto 14px",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <div style={{
                    width: "100%", height: "100%", borderRadius: "50%",
                    background: "var(--bg-alt)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 46
                  }}>
                    🎓
                  </div>
                </div>

                {/* Live Badge */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "5px 12px", borderRadius: 20, marginBottom: 8,
                  background: "rgba(0,201,167,0.12)", border: "1px solid #00c9a740",
                  fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 700, color: "#00c9a7"
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#00c9a7", display: "inline-block" }} />
                  Live Badge
                </div>

                {/* Verified Student */}
                <div style={{ display: "block", marginBottom: 12 }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    padding: "5px 12px", borderRadius: 20,
                    background: "rgba(108,99,255,0.12)", border: "1px solid #6c63ff40",
                    fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 700, color: "#6c63ff"
                  }}>
                    ✓ Verified Student
                  </div>
                </div>

                {/* Name */}
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 900, color: "var(--text-main)", lineHeight: 1.15, marginBottom: 6 }}>
                  {user.name || <span style={{ color: "var(--text-muted)", fontSize: 16, fontWeight: 500 }}>Your Name</span>}
                </div>

                {/* Status chips */}
                <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
                  <span style={{ padding: "3px 10px", borderRadius: 10, background: "rgba(0,201,167,0.12)", border: "1px solid #00c9a740", fontSize: 11, fontWeight: 700, color: "#00c9a7" }}>active</span>
                  <span style={{ padding: "3px 10px", borderRadius: 10, background: "rgba(108,99,255,0.12)", border: "1px solid #6c63ff40", fontSize: 11, fontWeight: 700, color: "#6c63ff" }}>MEMBER</span>
                </div>

                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10 }}>
                  Click to upload photo or choose avatar
                </div>
              </div>

              {/* RIGHT: Academic Credentials + CRI + Skills */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Academic Credentials panel */}
                <div style={{ background: "var(--bg-alt)", borderRadius: 18, padding: "20px 22px", border: "1px solid var(--border-light)" }}>
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1.2, marginBottom: 14 }}>
                    ACADEMIC CREDENTIALS
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                    <div style={{ display: "flex", gap: 20, alignItems: "baseline" }}>
                      <span style={{ width: 130, flexShrink: 0, fontSize: 13.5, color: "var(--text-muted)" }}>Current Institute:</span>
                      <span style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text-main)" }}>
                        {user.institute || <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>Not entered</span>}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 20, alignItems: "baseline" }}>
                      <span style={{ width: 130, flexShrink: 0, fontSize: 13.5, color: "var(--text-muted)" }}>Degree / Branch:</span>
                      <span style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text-main)" }}>
                        {user.branch ? `B.Tech · ${user.branch}` : <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>Not entered</span>}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                      <span style={{ width: 130, flexShrink: 0, fontSize: 13.5, color: "var(--text-muted)" }}>Performance:</span>
                      <span style={{ padding: "4px 12px", borderRadius: 10, background: "rgba(108,99,255,0.12)", border: "1px solid #6c63ff30", fontSize: 12.5, fontWeight: 700, color: "#6c63ff" }}>
                        {user.cgpa ? `Academic % / CGPA: ${user.cgpa}` : "Not entered"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CRI + Core Skill Tags — two column */}
                <div style={{ display: "grid", gridTemplateColumns: "120px 1fr", gap: 16 }}>
                  {/* CRI Gauge */}
                  <div style={{ background: "var(--bg-alt)", borderRadius: 18, padding: 18, border: "1px solid var(--border-light)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <div style={{ position: "relative", width: 72, height: 72, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="72" height="72" viewBox="0 0 72 72">
                        <circle cx="36" cy="36" r="30" fill="none" stroke="var(--border-light)" strokeWidth="7" />
                        <circle
                          cx="36" cy="36" r="30" fill="none"
                          stroke="#6c63ff" strokeWidth="7"
                          strokeDasharray={`${2 * Math.PI * 30}`}
                          strokeDashoffset={`${2 * Math.PI * 30 * (1 - user.cri / 100)}`}
                          strokeLinecap="round"
                          transform="rotate(-90 36 36)"
                        />
                      </svg>
                      <div style={{ position: "absolute", textAlign: "center" }}>
                        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 900, color: "#6c63ff", lineHeight: 1 }}>{user.cri}</div>
                      </div>
                    </div>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, fontWeight: 700, color: "var(--text-muted)", textAlign: "center" }}>
                      CRI: {user.cri}/100
                    </div>
                  </div>

                  {/* Core Skill Tags */}
                  <div style={{ background: "var(--bg-alt)", borderRadius: 18, padding: "16px 18px", border: "1px solid var(--border-light)" }}>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1.2, marginBottom: 10 }}>
                      CORE SKILL TAGS
                    </div>
                    {user.skills && user.skills.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                        {user.skills.map(s => (
                          <span key={s} style={{ padding: "4px 11px", borderRadius: 10, background: "rgba(108,99,255,0.12)", border: "1px solid #6c63ff30", fontSize: 12, fontWeight: 700, color: "#6c63ff" }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                        {["Python", "DSA", "React", "Cloud Computing", "DBMS"].map(s => (
                          <span key={s} style={{ padding: "4px 11px", borderRadius: 10, background: "rgba(108,99,255,0.08)", border: "1px solid #6c63ff20", fontSize: 12, fontWeight: 600, color: "#6c63ff" }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ════════════════════════════════════
              SECTION B — PERFORMANCE & GAMIFICATION
          ════════════════════════════════════ */}
          <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 28, padding: "32px 36px", boxShadow: "0 10px 36px rgba(0,0,0,0.04)" }}>
            <SectionHeader
              emoji="🏆" emojiBg="rgba(247,151,30,0.12)" emojiColor="#f7971e"
              title="Performance & Gamification" subtitle="SECTION B — YOUR STATS"
              badge="BUILDS YOUR LEADERBOARD RANK" badgeColor="#f7971e" badgeBg="rgba(247,151,30,0.1)"
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Ranking panel */}
              <div style={{ background: "var(--bg-alt)", borderRadius: 18, padding: "20px 24px", border: "1px solid var(--border-light)" }}>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1.2, marginBottom: 16 }}>
                  RANKING
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14, color: "var(--text-muted)" }}>PathEd Global Rank</span>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text-muted)" }}>#0 — Unranked</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14, color: "var(--text-muted)" }}>University Rank</span>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text-muted)" }}>#0 — Unranked</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14, color: "var(--text-muted)" }}>Coins &amp; XP Balance</span>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, color: "var(--text-muted)" }}>0 🪙 · 0 XP</span>
                  </div>
                </div>
              </div>

              {/* Earned Badges panel — 1 Beginner Badge only */}
              <div style={{ background: "var(--bg-alt)", borderRadius: 18, padding: "20px 24px", border: "1px solid var(--border-light)" }}>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1.2, marginBottom: 16 }}>
                  EARNED BADGES
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    title="Beginner"
                    style={{
                      width: 56, height: 56, borderRadius: 16,
                      background: "rgba(0,201,167,0.12)", border: "1.5px solid #00c9a740",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 28, cursor: "default", boxShadow: "0 4px 12px rgba(0,201,167,0.15)"
                    }}
                  >
                    🌱
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: "#00c9a7", marginBottom: 2 }}>Beginner Badge</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Awarded to new PathEd learners</div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, fontFamily: "'Fira Code', monospace" }}>More badges unlock as you progress →</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════
              SECTION C — QUALITATIVE PROFESSIONAL BLOCKS
          ════════════════════════════════════ */}
          <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 28, padding: "32px 36px", boxShadow: "0 10px 36px rgba(0,0,0,0.04)" }}>
            <SectionHeader
              emoji="💬" emojiBg="rgba(224,64,251,0.12)" emojiColor="#e040fb"
              title="Qualitative Professional Blocks" subtitle="SECTION C — SOFT SKILLS & ASPIRATIONS"
              badge="POWERS YOUR MENTOR MATCH" badgeColor="#e040fb" badgeBg="rgba(224,64,251,0.1)"
            />

            {/* Passion */}
            <div style={{ marginBottom: 32, textAlign: "center" }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 21, fontWeight: 700, color: "var(--text-main)", margin: "0 0 4px" }}>
                The Passion Behind the Goal
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 12px" }}>
                Why did you choose this career path? Be honest — this shapes your AI roadmap narrative.
              </p>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, borderRadius: "4px 0 0 4px", background: "#6c63ff" }} />
                <textarea
                  rows={3}
                  value={passion}
                  onChange={e => setPassion(e.target.value)}
                  placeholder="I've always been fascinated by how software solves real human problems..."
                  style={{
                    width: "100%", padding: "14px 18px", borderRadius: 14,
                    background: "var(--bg-alt)", border: "1.5px solid #6c63ff30",
                    fontSize: 14, color: "var(--text-main)", outline: "none", resize: "vertical",
                    lineHeight: 1.6, boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            {/* Professional Objectives */}
            <div style={{ marginBottom: 32, textAlign: "center" }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 21, fontWeight: 700, color: "var(--text-main)", margin: "0 0 4px" }}>
                Professional Objectives
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 12px" }}>
                What you hope to achieve through PathEd.
              </p>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, borderRadius: "4px 0 0 4px", background: "#00c9a7" }} />
                <textarea
                  rows={3}
                  value={objective}
                  onChange={e => setObjective(e.target.value)}
                  placeholder="Land a Software Engineering role at a top product company by building a structured DSA + System Design foundation..."
                  style={{
                    width: "100%", padding: "14px 18px", borderRadius: 14,
                    background: "var(--bg-alt)", border: "1.5px solid #00c9a730",
                    fontSize: 14, color: "var(--text-main)", outline: "none", resize: "vertical",
                    lineHeight: 1.6, boxSizing: "border-box"
                  }}
                />
              </div>
            </div>

            {/* Unique Strength / Elevator Pitch */}
            <div style={{ textAlign: "center" }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 21, fontWeight: 700, color: "var(--text-main)", margin: "0 0 4px" }}>
                Unique Strength / Elevator Pitch
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 12px" }}>
                One line that summarises your added value. Recruiters read this first.
              </p>
              <input
                type="text"
                value={pitch}
                onChange={e => setPitch(e.target.value)}
                placeholder="I bridge the gap between complex algorithms and user-centric design — turning data into elegant, scalable experiences."
                style={{
                  width: "100%", padding: "14px 18px", borderRadius: 14,
                  background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                  fontSize: 14, color: "var(--text-main)", outline: "none", boxSizing: "border-box"
                }}
              />
            </div>
          </div>

          {/* ════════════════════════════════════
              SECTION D — DOCUMENT & PORTFOLIO INTEGRATION
          ════════════════════════════════════ */}
          <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 28, padding: "32px 36px", boxShadow: "0 10px 36px rgba(0,0,0,0.04)" }}>
            <SectionHeader
              emoji="📁" emojiBg="rgba(0,201,167,0.12)" emojiColor="#00c9a7"
              title="Document & Portfolio Integration" subtitle="SECTION D — YOUR PROFESSIONAL ASSETS"
              badge="SHARED WITH RECRUITERS" badgeColor="#00c9a7" badgeBg="rgba(0,201,167,0.1)"
            />

            {/* Document Dual-Action Bar */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16.5, fontWeight: 700, color: "var(--text-main)", textAlign: "center", margin: "0 0 4px" }}>
                Document Dual-Action Bar
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", margin: "0 0 16px" }}>
                Auto-generated from your onboarding data. Review before publishing.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button style={{
                  padding: "12px 26px", borderRadius: 14,
                  border: "1.5px solid #6c63ff", background: "transparent",
                  color: "#6c63ff", fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
                }}>
                  📄 View Resume
                </button>
                <button style={{
                  padding: "12px 26px", borderRadius: 14,
                  border: "none", background: "linear-gradient(135deg, #6c63ff, #00c9a7)",
                  color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                  transition: "all 0.2s", boxShadow: "0 4px 14px rgba(108,99,255,0.3)"
                }}>
                  📋 View CV
                </button>
              </div>
            </div>

            {/* Social Connectivity — 4 Real SVG Logo Cards Covering 1 Row */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16.5, fontWeight: 700, color: "var(--text-main)", margin: "0 0 4px" }}>
                🔗 Social Connectivity
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 14px" }}>
                Link your professional presence so recruiters can find you.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, width: "100%" }}>
                {[
                  {
                    label: "GitHub", color: "var(--text-main)", bg: "var(--bg-alt)", border: "var(--border-light)",
                    svg: <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                  },
                  {
                    label: "LinkedIn", color: "#0a66c2", bg: "rgba(10,102,194,0.08)", border: "rgba(10,102,194,0.22)",
                    svg: <svg width="30" height="30" viewBox="0 0 24 24" fill="#0a66c2"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                  },
                  {
                    label: "Portfolio", color: "#6c63ff", bg: "rgba(108,99,255,0.08)", border: "rgba(108,99,255,0.22)",
                    svg: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#6c63ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  },
                  {
                    label: "And More", color: "#e040fb", bg: "rgba(224,64,251,0.08)", border: "rgba(224,64,251,0.22)",
                    svg: <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#e040fb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
                  }
                ].map(s => (
                  <div
                    key={s.label}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
                      padding: "20px 16px", borderRadius: 18,
                      background: s.bg, border: `1.5px solid ${s.border}`,
                      cursor: "pointer", transition: "all 0.2s"
                    }}
                  >
                    {s.svg}
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 700, color: s.color }}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Projects — Placeholder Cards */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16.5, fontWeight: 700, color: "var(--text-main)", margin: "0 0 4px" }}>
                🗂️ Projects
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 14px" }}>
                Your project showcase visible to recruiters and mentors.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                {[
                  { title: "PathEd Dashboard UI", stack: "React · Vite · CSS", status: "In Progress", icon: "🖥️", color: "#6c63ff" },
                  { title: "DSA Visualizer", stack: "Python · Matplotlib", status: "Completed", icon: "📊", color: "#00c9a7" },
                  { title: "ML Sentiment Model", stack: "TensorFlow · FastAPI", status: "Completed", icon: "🤖", color: "#f7971e" }
                ].map((proj) => (
                  <div
                    key={proj.title}
                    style={{
                      background: "var(--bg-alt)", border: `1.5px solid ${proj.color}30`,
                      borderRadius: 18, padding: "18px 20px", position: "relative",
                      boxShadow: `0 4px 16px ${proj.color}10`
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12,
                        background: `${proj.color}15`, border: `1px solid ${proj.color}30`,
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20
                      }}>
                        {proj.icon}
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 700, color: "var(--text-main)" }}>
                          {proj.title}
                        </div>
                        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                          {proj.stack}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "3px 10px", borderRadius: 10,
                      background: proj.status === "Completed" ? "rgba(0,201,167,0.12)" : "rgba(247,151,30,0.12)",
                      border: `1px solid ${proj.status === "Completed" ? "#00c9a740" : "#f7971e40"}`,
                      fontSize: 11, fontWeight: 700,
                      color: proj.status === "Completed" ? "#00c9a7" : "#f7971e",
                      fontFamily: "'Fira Code', monospace"
                    }}>
                      {proj.status === "Completed" ? "✓" : "⟳"} {proj.status}
                    </div>
                    <div style={{
                      position: "absolute", top: 12, right: 12,
                      fontSize: 9, fontWeight: 700, color: "var(--text-muted)",
                      fontFamily: "'Fira Code', monospace", background: "var(--bg-card)",
                      padding: "2px 8px", borderRadius: 6, border: "1px solid var(--border-light)"
                    }}>
                      PLACEHOLDER
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Certificates — Placeholder Cards */}
            <div style={{ marginBottom: 32 }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16.5, fontWeight: 700, color: "var(--text-main)", margin: "0 0 4px" }}>
                🏅 Certificates
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 14px" }}>
                Your verified certifications displayed on your public profile.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                {[
                  { name: "Google Data Analytics", issuer: "Coursera", date: "Mar 2024", emoji: "📊", color: "#4285F4" },
                  { name: "AWS Cloud Practitioner", issuer: "Amazon Web Services", date: "Jan 2024", emoji: "☁️", color: "#f7971e" },
                  { name: "Meta Front-End Dev", issuer: "Meta / Coursera", date: "Nov 2023", emoji: "⚛️", color: "#0668E1" }
                ].map((cert) => (
                  <div
                    key={cert.name}
                    style={{
                      background: "var(--bg-alt)", border: `1.5px solid ${cert.color}22`,
                      borderRadius: 18, overflow: "hidden",
                      boxShadow: `0 4px 14px ${cert.color}10`, position: "relative"
                    }}
                  >
                    <div style={{
                      height: 96,
                      background: `linear-gradient(135deg, ${cert.color}20, ${cert.color}08)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      borderBottom: `1px solid ${cert.color}18`, fontSize: 42
                    }}>
                      {cert.emoji}
                    </div>
                    <div style={{ padding: "14px 16px" }}>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 700, color: "var(--text-main)", marginBottom: 4, lineHeight: 1.3 }}>
                        {cert.name}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginBottom: 8 }}>
                        {cert.issuer}
                      </div>
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "3px 10px", borderRadius: 8,
                        background: "rgba(0,201,167,0.1)", border: "1px solid #00c9a730",
                        fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: "#00c9a7"
                      }}>
                        ✓ {cert.date}
                      </div>
                    </div>
                    <div style={{
                      position: "absolute", top: 8, right: 8,
                      fontSize: 9, fontWeight: 700, color: "var(--text-muted)",
                      fontFamily: "'Fira Code', monospace", background: "var(--bg-card)",
                      padding: "2px 7px", borderRadius: 6, border: "1px solid var(--border-light)"
                    }}>
                      PLACEHOLDER
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Info Notice */}
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 14,
              padding: "20px 22px", borderRadius: 18,
              background: "linear-gradient(135deg, rgba(108,99,255,0.07), rgba(0,201,167,0.05))",
              border: "1.5px solid #6c63ff25"
            }}>
              <Info size={20} color="#6c63ff" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 800, color: "var(--text-main)", marginBottom: 10 }}>
                  ℹ️ The following details will be fully updated inside your Profile on the Platform:
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    "🐙 Social Links — GitHub, LinkedIn, Portfolio URL",
                    "🗂️ Projects — Title, description, tech stack, GitHub repo & live demo link",
                    "🏅 Certificates — Upload certificate images, issuer, date, credential ID",
                    "📄 Resume & CV — Upload or auto-generate from your PathEd data",
                    "📸 Profile Photo — Upload your photo or choose an avatar",
                    "🔗 Open Source Contributions — Link to PRs and public repos",
                    "📝 Publications & Research Papers — Academic or personal work",
                    "🏆 Achievements & Awards — Hackathons, competitions, recognitions"
                  ].map(item => (
                    <li key={item} style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
                      {item}
                    </li>
                  ))}
                </ul>
                <div style={{ marginTop: 12, fontSize: 13, color: "#6c63ff", fontFamily: "'Fira Code', monospace", fontWeight: 700 }}>
                  ✦ No entries are mandatory here during onboarding. You can complete your profile after launching your roadmap.
                </div>
              </div>
            </div>
          </div>

          {/* ── FINALIZE & LAUNCH BUTTON ── */}
          <div style={{ textAlign: "center", paddingTop: 8 }}>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 16px 44px rgba(108,99,255,0.45)" }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLaunch}
              disabled={isLaunching}
              style={{
                width: "100%", maxWidth: 540, padding: "18px 36px", borderRadius: 22, border: "none",
                background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff",
                fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800,
                cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 12,
                boxShadow: "0 10px 32px rgba(108,99,255,0.35)", transition: "all 0.2s"
              }}
            >
              <Rocket size={22} />
              {isLaunching ? "Launching Your Roadmap..." : "🚀 Finalize & Launch My Roadmap"}
            </motion.button>
          </div>

        </div>
      </main>

      {/* ── BOTTOM SYNC BAR ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 90,
        background: "var(--bg-card)", borderTop: "1.5px solid var(--border-light)",
        padding: "14px 40px", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 -8px 28px rgba(0,0,0,0.05)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 800, color: "#6c63ff" }}>
          <Sparkles size={16} /> PROFILE SYNCHRONIZATION ACTIVE
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 800, color: "#00c9a7" }}>
            STAGE 3 OF 4
          </span>
          <div style={{ width: 140, height: 8, borderRadius: 4, background: "var(--bg-alt)", border: "1px solid var(--border-light)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "75%", background: "linear-gradient(90deg, #6c63ff, #00c9a7)", borderRadius: 4 }} />
          </div>
        </div>
      </div>

      <StageTransitionOverlay
        isOpen={isLaunching}
        currentStageTitle="Stage 3: Public Identity Review"
        nextStageTitle="Stage 4: Roadmap Setup"
        roleColor="#00c9a7"
      />
    </div>
  );
}
