"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { motion } from "framer-motion";
import StageTransitionOverlay from "../../components/onboarding/StageTransitionOverlay";
import { 
  Sun, Moon, Sparkles, ArrowRight, GraduationCap, 
  BookOpen, Code, Trophy, ShieldCheck, User, Building, Hash, Cpu 
} from "lucide-react";
import { apiSend } from "@/lib/api";

export default function OnboardingStage1() {
  const router = useRouter();

  // Dark Mode State Sync
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    const nextTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  // Form State
  const [fullName, setFullName] = useState("");
  const [university, setUniversity] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [branch, setBranch] = useState("");
  const [semester, setSemester] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [board, setBoard] = useState("");
  
  // Academic DNA State
  const [subjectRatings, setSubjectRatings] = useState({
    DSA: 0, DBMS: 0, OS: 0, Networks: 0, OOPs: 0
  });
  const [codingExp, setCodingExp] = useState("");
  const [primaryLang, setPrimaryLang] = useState("");
  const [academicGoal, setAcademicGoal] = useState("");

  const [validationError, setValidationError] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Calculate completion percentage
  const ratedCount = Object.values(subjectRatings).filter(v => v > 0).length;
  const fields = [
    fullName.trim(), university.trim(), rollNumber.trim(), branch, 
    semester, cgpa.trim(), board, ratedCount > 0 ? "rated" : "", 
    codingExp, primaryLang, academicGoal
  ].filter(Boolean);
  const completionPct = Math.round((fields.length / 11) * 100);

  const stages = [
    { num: 1, title: "Academic Foundation & DNA", status: "active" },
    { num: 2, title: "Career Ambition & Target Roles", status: "pending" },
    { num: 3, title: "Public Identity & Projects", status: "pending" },
    { num: 4, title: "Roadmap Setup", status: "pending" },
  ];

  const handleRatingChange = (subject, val) => {
    setSubjectRatings(prev => ({ ...prev, [subject]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !university.trim() || !branch || !semester) {
      setValidationError("Please fill out your Name, University, Branch, and Semester to continue.");
      return;
    }
    setValidationError("");
    const stage1 = {
      name: fullName,
      college: university,
      roll: rollNumber,
      branch: branch,
      semester: semester,
      cgpa: cgpa,
      board,
      subjectRatings,
      codingExp,
      primaryLang,
      academicGoal,
    };
    localStorage.setItem("pathEdStage1", JSON.stringify(stage1));
    try {
      await apiSend("/api/me/onboarding", "PUT", {
        stage1,
        currentStage: 2,
      });
    } catch {
      // keep local progress if offline
    }
    setIsTransitioning(true);
    setTimeout(() => {
      setIsTransitioning(false);
      router.push("/onboarding/stage2");
    }, 2200);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", color: "var(--text-main)", fontFamily: "'Inter', sans-serif", paddingBottom: 120 }}>
      
      {/* 1. TOP STICKY NAVIGATION BAR */}
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
            <Sparkles size={14} /> STAGE 1 OF 4 ONBOARDING
          </div>

          {/* DYNAMIC LIGHT & DARK MODE THEME TOGGLE */}
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
        
        {/* 2. TOP 4-STAGE MINIMAP PROGRESS TRACKER */}
        <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: "30px 36px", marginBottom: 32, boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", marginBottom: 26 }}>
            <div style={{ position: "absolute", left: 42, right: 42, top: 31, height: 3, background: "var(--border-light)", zIndex: 0 }} />
            <div style={{ position: "absolute", left: 42, top: 31, height: 3, background: "linear-gradient(90deg, #6c63ff, #00c9a7)", zIndex: 1, width: `${(completionPct / 100) * 25}%`, transition: "width 0.4s ease" }} />

            {stages.map((stg) => (
              <div key={stg.num} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 11, position: "relative", zIndex: 2 }}>
                <div style={{
                  width: 62, height: 62, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800,
                  background: stg.status === "active" ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "var(--bg-alt)",
                  color: stg.status === "active" ? "#ffffff" : "var(--text-muted)",
                  border: stg.status === "active" ? "none" : "2px solid var(--border-light)",
                  boxShadow: stg.status === "active" ? "0 0 0 6px rgba(108,99,255,0.18), 0 6px 18px rgba(108,99,255,0.35)" : "none"
                }}>
                  {stg.num}
                </div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 700, color: stg.status === "active" ? "#6c63ff" : "var(--text-muted)", textAlign: "center", maxWidth: 130, lineHeight: 1.35 }}>
                  {stg.title}
                </div>
              </div>
            ))}
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, fontFamily: "'Fira Code', monospace", fontWeight: 700 }}>
              <span style={{ color: "#6c63ff" }}>STAGE 1 COMPLETION</span>
              <span style={{ color: "#00c9a7" }}>{completionPct}% FILLED</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "var(--bg-alt)", overflow: "hidden", border: "1px solid var(--border-light)" }}>
              <motion.div
                animate={{ width: `${completionPct}%` }}
                transition={{ duration: 0.4 }}
                style={{ height: "100%", background: "linear-gradient(90deg, #6c63ff, #00c9a7)", borderRadius: 4 }}
              />
            </div>
          </div>
        </div>

        {/* 3. LARGER SPLIT-COLOR GRADIENT HEADER TITLE */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 20, background: "rgba(0,201,167,0.12)", border: "1px solid #00c9a740", color: "#00c9a7", fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 800, marginBottom: 12 }}>
            <GraduationCap size={16} /> ACADEMIC IDENTITY & DNA SETUP
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 42, fontWeight: 800, margin: "0 0 12px", lineHeight: 1.15, color: "var(--text-main)" }}>
            Let's Build Your <span style={{ background: "linear-gradient(135deg, #6c63ff, #00c9a7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Student Profile & Academic DNA</span>
          </h1>
          <p style={{ fontSize: 16.5, color: "var(--text-muted)", maxWidth: 600, margin: "0 auto", lineHeight: 1.5 }}>
            Help us calibrate your course syllabus, daily study pace, and skill baseline before setting up your 4-year SDE roadmap.
          </p>
        </div>

        {/* FORM CONTAINER */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          
          {/* CORE ACADEMIC IDENTITY QUESTIONS */}
          <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 32, boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
            
            {/* Q1: Full Name */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                <User size={18} color="#6c63ff" /> Q1. Full Name
              </label>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 12px" }}>
                Your full name as it appears on your official university ID card.
              </p>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Arjun Sharma"
                style={{
                  width: "100%", padding: "14px 18px", borderRadius: 14,
                  background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                  fontSize: 15, color: "var(--text-main)", outline: "none"
                }}
              />
            </div>

            {/* Q2: University / College Name */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                <Building size={18} color="#00c9a7" /> Q2. University / College Name
              </label>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 12px" }}>
                Links your profile to campus-specific schedules, academic calendars, and peer networks.
              </p>
              <input
                type="text"
                value={university}
                onChange={e => setUniversity(e.target.value)}
                placeholder="e.g. IIT Kanpur, VIT Vellore, AKGEC Ghaziabad..."
                style={{
                  width: "100%", padding: "14px 18px", borderRadius: 14,
                  background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                  fontSize: 15, color: "var(--text-main)", outline: "none"
                }}
              />
            </div>

            {/* Q3: University Roll Number */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                <Hash size={18} color="#f7971e" /> Q3. University Roll Number
              </label>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 12px" }}>
                Verifies your student identity for campus classroom sessions and certificate verification.
              </p>
              <input
                type="text"
                value={rollNumber}
                onChange={e => setRollNumber(e.target.value)}
                placeholder="e.g. 2200123456"
                style={{
                  width: "100%", maxWidth: 360, padding: "14px 18px", borderRadius: 14,
                  background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                  fontSize: 15, color: "var(--text-main)", outline: "none"
                }}
              />
            </div>

            {/* Q4: Branch / Major */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                <Cpu size={18} color="#e040fb" /> Q4. Branch / Major
              </label>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 12px" }}>
                Ensures your skill roadmap nodes match your specific engineering branch.
              </p>
              <select
                value={branch}
                onChange={e => setBranch(e.target.value)}
                style={{
                  width: "100%", maxWidth: 420, padding: "14px 18px", borderRadius: 14,
                  background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                  fontSize: 15, color: "var(--text-main)", outline: "none"
                }}
              >
                <option value="" disabled>Select your branch...</option>
                {["CSE (Computer Science)", "IT (Information Tech)", "ECE (Electronics)", "EEE (Electrical)", "AIDS (AI & Data Science)", "CSBS (CS & Business Systems)", "Mechanical", "Civil", "Other"].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Q5: Current Semester */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                <BookOpen size={18} color="#6c63ff" /> Q5. Current Semester
              </label>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 14px" }}>
                Calibrates your academic semester pacing and exam schedules.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"].map(sem => {
                  const isSelected = semester === sem;
                  return (
                    <button
                      type="button"
                      key={sem}
                      onClick={() => setSemester(sem)}
                      style={{
                        padding: "10px 18px", borderRadius: 14,
                        border: `1.5px solid ${isSelected ? "#6c63ff" : "var(--border-light)"}`,
                        background: isSelected ? "rgba(108,99,255,0.12)" : "var(--bg-alt)",
                        color: isSelected ? "#6c63ff" : "var(--text-main)",
                        fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: isSelected ? 600 : 500,
                        cursor: "pointer", transition: "all 0.2s"
                      }}
                    >
                      {isSelected ? "✓ " : ""}Sem {sem}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Q6: Current CGPA / Percentage */}
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                <Trophy size={18} color="#00c9a7" /> Q6. Current CGPA / Percentage
              </label>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 12px" }}>
                Sets your current academic baseline for personalized study recommendations.
              </p>
              <input
                type="number"
                min="0"
                max="10"
                step="0.01"
                value={cgpa}
                onChange={e => setCgpa(e.target.value)}
                placeholder="e.g. 8.4 (CGPA) or 82 (%)"
                style={{
                  width: 240, padding: "14px 18px", borderRadius: 14,
                  background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                  fontSize: 15, color: "var(--text-main)", outline: "none"
                }}
              />
            </div>

            {/* Q7: Academic Board / Affiliation */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                <ShieldCheck size={18} color="#f7971e" /> Q7. Academic Board / University Affiliation
              </label>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 12px" }}>
                Ensures syllabus content matches your university board examination structure.
              </p>
              <select
                value={board}
                onChange={e => setBoard(e.target.value)}
                style={{
                  width: "100%", maxWidth: 460, padding: "14px 18px", borderRadius: 14,
                  background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                  fontSize: 15, color: "var(--text-main)", outline: "none"
                }}
              >
                <option value="" disabled>Select university board...</option>
                {[
                  "AKTU (Dr. A.P.J. Abdul Kalam Tech Univ)",
                  "Mumbai University",
                  "VTU (Visvesvaraya Technological Univ)",
                  "GTU (Gujarat Technological Univ)",
                  "Anna University",
                  "JNTU",
                  "Deemed / Autonomous Institution"
                ].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

          </div>

          {/* ACADEMIC DNA QUESTIONS */}
          <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 32, boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
            
            {/* Q8: Core CS Subjects Proficiency Ratings */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                <Code size={18} color="#6c63ff" /> Q8. Core CS Subject Self-Proficiency
              </label>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 16px" }}>
                Rate your current confidence level across core Computer Science subjects (1 = Beginner, 5 = Mastery).
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {Object.entries(subjectRatings).map(([sub, rating]) => (
                  <div key={sub} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, background: "var(--bg-alt)", padding: "12px 18px", borderRadius: 16, border: "1px solid var(--border-light)" }}>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 600, color: "var(--text-main)", width: 140 }}>
                      {sub}
                    </span>

                    <div style={{ display: "flex", gap: 8 }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => handleRatingChange(sub, star)}
                          style={{
                            width: 34, height: 34, borderRadius: 10, border: "none",
                            background: star <= rating && rating > 0 ? "#6c63ff" : "var(--bg-card)",
                            color: star <= rating && rating > 0 ? "#ffffff" : "var(--text-muted)",
                            fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 700,
                            cursor: "pointer", transition: "all 0.2s"
                          }}
                        >
                          {star}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Q9: Prior Coding Experience (EXPLICIT SINGLE ROW LAYOUT FOR ALL 4 OPTIONS) */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                <Sparkles size={18} color="#00c9a7" /> Q9. Prior Coding Experience
              </label>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 14px" }}>
                Select the option that best describes your hands-on coding background.
              </p>
              
              {/* SINGLE ROW FLEX GRID FOR ALL 4 OPTIONS */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, width: "100%" }}>
                {[
                  { id: "beginner", emoji: "🌱", label: "Absolute Beginner", sub: "Never written code" },
                  { id: "syntax", emoji: "💻", label: "Basic Syntax", sub: "Loops & arrays" },
                  { id: "intermediate", emoji: "⚙️", label: "Intermediate", sub: "50+ DSA solved" },
                  { id: "advanced", emoji: "🚀", label: "Advanced CP", sub: "LeetCode / CP active" }
                ].map(item => {
                  const isSelected = codingExp === item.label;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setCodingExp(item.label)}
                      style={{
                        padding: 16, borderRadius: 16, textAlign: "center",
                        border: `1.5px solid ${isSelected ? "#6c63ff" : "var(--border-light)"}`,
                        background: isSelected ? "rgba(108,99,255,0.12)" : "var(--bg-alt)",
                        cursor: "pointer", transition: "all 0.2s"
                      }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{item.emoji}</div>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: isSelected ? 700 : 500, color: isSelected ? "#6c63ff" : "var(--text-main)" }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{item.sub}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Q10: Primary Programming Language */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                <Code size={18} color="#f7971e" /> Q10. Primary Programming Language
              </label>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 14px" }}>
                Choose the language you use for problem-solving and coding practice.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {["C++", "Java", "Python", "JavaScript", "C#", "Go"].map(lang => {
                  const isSelected = primaryLang === lang;
                  return (
                    <button
                      type="button"
                      key={lang}
                      onClick={() => setPrimaryLang(lang)}
                      style={{
                        padding: "10px 20px", borderRadius: 14,
                        border: `1.5px solid ${isSelected ? "#f7971e" : "var(--border-light)"}`,
                        background: isSelected ? "rgba(247,151,30,0.12)" : "var(--bg-alt)",
                        color: isSelected ? "#f7971e" : "var(--text-main)",
                        fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: isSelected ? 700 : 500,
                        cursor: "pointer", transition: "all 0.2s"
                      }}
                    >
                      {isSelected ? "⚡ " : ""}{lang}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Q11: Primary Academic Goal */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                <Trophy size={18} color="#e040fb" /> Q11. Primary Goal for this Academic Year
              </label>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 14px" }}>
                What is your single most important priority right now?
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "SDE Placement & Tier-1 Tech Company Job Offer",
                  "Top Academic CGPA & University Honors",
                  "Higher Studies / GATE / Master's Preparation",
                  "Balanced CGPA + Production Web/Mobile Portfolio Projects"
                ].map(goal => {
                  const isSelected = academicGoal === goal;
                  return (
                    <div
                      key={goal}
                      onClick={() => setAcademicGoal(goal)}
                      style={{
                        padding: "14px 18px", borderRadius: 16,
                        border: `1.5px solid ${isSelected ? "#e040fb" : "var(--border-light)"}`,
                        background: isSelected ? "rgba(224,64,251,0.12)" : "var(--bg-alt)",
                        color: isSelected ? "#e040fb" : "var(--text-main)",
                        fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: isSelected ? 700 : 500,
                        cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 10
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{isSelected ? "🎯" : "⚪"}</span>
                      <span>{goal}</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Validation Error Banner */}
          {validationError && (
            <div style={{ padding: "14px 20px", borderRadius: 16, background: "rgba(239,68,68,0.12)", border: "1.5px solid #ef4444", color: "#ef4444", fontSize: 14, fontWeight: 700, textAlign: "center" }}>
              {validationError}
            </div>
          )}

          {/* Submit Action Button */}
          <div style={{ textAlign: "right" }}>
            <button
              type="submit"
              style={{
                padding: "16px 36px", borderRadius: 18, border: "none",
                background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#ffffff",
                fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800,
                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10,
                boxShadow: "0 8px 24px rgba(108,99,255,0.35)", transition: "all 0.2s"
              }}
            >
              Save Profile & Proceed to Stage 2 <ArrowRight size={18} />
            </button>
          </div>

        </form>
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
            {completionPct}% FILLED
          </span>
          <div style={{ width: 140, height: 8, borderRadius: 4, background: "var(--bg-alt)", border: "1px solid var(--border-light)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${completionPct}%`, background: "linear-gradient(90deg, #6c63ff, #00c9a7)", borderRadius: 4, transition: "width 0.4s ease" }} />
          </div>
        </div>
      </div>

      {/* Stage Transition Celebration Loading Overlay */}
      <StageTransitionOverlay
        isOpen={isTransitioning}
        currentStageTitle="Stage 1: Academic Foundation & DNA"
        nextStageTitle="Stage 2: Career Ambition & Target Roles"
        roleColor="#6c63ff"
      />

    </div>
  );
}
