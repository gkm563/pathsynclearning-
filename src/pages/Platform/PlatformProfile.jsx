import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, User, Award, ShieldCheck, Mail, Phone, MapPin, 
  Sparkles, ShieldAlert, Cpu, CheckCircle, Globe, Code,
  ExternalLink, Edit, Save, X, Plus, Star, StarOff, 
  AlertCircle, Rocket, BarChart2, Briefcase, FileText, ChevronRight, GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SKILL_PALETTE = [
  { bg: "rgba(108,99,255,0.12)", bdr: "rgba(108,99,255,0.3)", col: "#6c63ff" },
  { bg: "rgba(0,201,167,0.12)", bdr: "rgba(0,201,167,0.3)", col: "#00c9a7" },
  { bg: "rgba(247,151,30,0.12)", bdr: "rgba(247,151,30,0.3)", col: "#f7971e" },
  { bg: "rgba(224,64,251,0.12)", bdr: "rgba(224,64,251,0.3)", col: "#e040fb" }
];

const DEFAULT_PROFILE = {
  name: "Rahul Kushwaha",
  tagline: "B.Tech · Computer Science & Engineering",
  institute: "Indian Institute of Technology, Kanpur",
  degree: "B.Tech",
  branch: "Computer Science",
  cgpa: "9.1",
  gradYear: "2026",
  cri: 78,
  rankGlobal: "#847",
  rankUniv: "#12",
  xp: "1,340",
  streak: 7,
  skills: ["Python", "DSA", "React", "Cloud Computing", "DBMS", "Kotlin"],
  passion: "I've always been fascinated by how software solves real human problems. Watching seniors land FAANG roles pushed me to take career-prep seriously from Year 1 — PathEd helps me structure that ambition into a measurable roadmap.",
  objective: "Land a Software Engineering role at a top product company by building a structured DSA + System Design foundation, while growing a portfolio that showcases real-world problem solving.",
  pitch: "I bridge the gap between complex algorithms and user-centric design — turning data into elegant, scalable experiences.",
  github: "https://github.com/rahulkushwaha",
  linkedin: "https://linkedin.com/in/rahulkushwaha",
  portfolio: "https://rahulkushwaha.dev",
  projects: [
    { title: "E-Commerce Platform", desc: "Full-stack MERN with payment gateway & real-time order tracking.", tags: ["React", "Node.js", "MongoDB"], github: "#", demo: "#" },
    { title: "ML Algorithm — Python", desc: "Decision tree classifier with 94% accuracy on UCI dataset.", tags: ["Python", "scikit-learn"], github: "#", demo: "#" },
    { title: "DevOps Pipeline", desc: "CI/CD with Docker, GitHub Actions and auto-deploy to AWS EC2.", tags: ["Docker", "AWS", "GH Actions"], github: "#", demo: "#" },
    { title: "Chat App — Socket.io", desc: "Real-time messaging with rooms, typing indicators and auth.", tags: ["Socket.io", "Redis"], github: "#", demo: "#" }
  ],
  badges: [
    { icon: "🌱", label: "Fast Learner", desc: "Completed 5 new skill nodes in a single week." },
    { icon: "⚔️", label: "Code Warrior", desc: "Solved 50+ LeetCode-style challenges on PathEd." },
    { icon: "🏅", label: "Top 100", desc: "Ranked in the top 100 students at your university." },
    { icon: "🤖", label: "AI Pioneer", desc: "First batch to use PathEd AI-fication feature." },
    { icon: "🚀", label: "Builder", desc: "Published 3 or more projects to your portfolio." },
    { icon: "🔥", label: "Streak Master", desc: "Maintained a 7-day learning streak." },
    { icon: "🌐", label: "Open Source", desc: "Contributed to an open source project via PathEd." },
    { icon: "💡", label: "Innovator", desc: "Won a HackAttack competition." }
  ]
};

export default function PlatformProfile() {
  const navigate = useNavigate();

  // Local Storage Sync
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("pathed_profile_live");
    return saved ? JSON.parse(saved) : { ...DEFAULT_PROFILE };
  });

  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem("pathed_user_coins");
    return saved ? parseInt(saved, 10) : 3480;
  });

  const [additionalCompleted, setAdditionalCompleted] = useState(() => {
    return localStorage.getItem("pathed_profile_additional_completed") === "true";
  });

  // Edit Mode Draft States
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...profile });
  const [activeTab, setActiveTab] = useState("identity");
  const [toastMessage, setToastMessage] = useState("");

  // Additional Details Form State
  const [showAdditionalModal, setShowAdditionalModal] = useState(false);
  const [addStep, setAddStep] = useState(1);
  const [board, setBoard] = useState("CBSE");
  const [codingExp, setCodingExp] = useState("Familiar with syntax");
  const [primaryLang, setPrimaryLang] = useState("Python");
  const [academicGoal, setAcademicGoal] = useState("FAANG Placement Prep");
  const [ratings, setRatings] = useState({ DSA: 4, DBMS: 3, OS: 3, Networks: 2, OOPs: 4 });
  const [envSlider, setEnvSlider] = useState(50);
  const [impactSlider, setImpactSlider] = useState(50);
  const [risk, setRisk] = useState("⚖️ Moderate");
  const [company, setCompany] = useState("🌐 FAANG / Big Tech");
  const [vision, setVision] = useState("🧑‍💻 Technical Expert");
  const [puzzle, setPuzzle] = useState("Logic Bug");
  const [invent, setInvent] = useState("💡 Create Something New");

  useEffect(() => {
    localStorage.setItem("pathed_profile_live", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("pathed_user_coins", coins.toString());
  }, [coins]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const handleSaveProfile = () => {
    setProfile({ ...draft });
    setEditing(false);
    triggerToast("✅ Profile saved successfully!");
  };

  const handleCancelEdit = () => {
    setDraft({ ...profile });
    setEditing(false);
  };

  // Submit Omitted/Additional Questions
  const handleAdditionalSubmit = () => {
    const additionalData = {
      board, codingExp, primaryLang, academicGoal, ratings,
      envSlider, impactSlider, risk, company, vision, puzzle, invent
    };
    localStorage.setItem("pathed_profile_additional_data", JSON.stringify(additionalData));
    localStorage.setItem("pathed_profile_additional_completed", "true");
    setAdditionalCompleted(true);
    setCoins(prev => prev + 250);
    triggerToast("🚀 Profile Completed! Added +250 Coins to your wallet!");
    setShowAdditionalModal(false);
  };

  const getSubjectColor = (subject) => {
    switch(subject) {
      case "DSA": return "#6c63ff";
      case "DBMS": return "#00c9a7";
      case "OS": return "#f7971e";
      case "Networks": return "#e040fb";
      default: return "#6c63ff";
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", color: "var(--text-main)", fontFamily: "'Inter', sans-serif" }}>
      
      {/* ==================== TOAST ALERT ==================== */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            style={{
              position: "fixed", top: 24, left: "50%", x: "-50%",
              background: "rgba(15, 23, 42, 0.95)", border: "1.5px solid rgba(108,99,255,0.4)",
              borderRadius: 16, padding: "12px 24px", zIndex: 1400, color: "#fff",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: 10,
              fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 14.5
            }}
          >
            <Sparkles size={16} color="#6c63ff" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== BANNER & COVER ZONE ==================== */}
      <div style={{
        height: 240,
        position: "relative",
        background: "linear-gradient(135deg, rgba(108, 99, 255, 0.25) 0%, rgba(0, 201, 167, 0.15) 50%, rgba(224, 64, 251, 0.2) 100%)",
        borderBottom: "1.5px solid var(--border-light)",
        overflow: "hidden"
      }}>
        {/* Decorative Grid Overlays */}
        <div style={{
          position: "absolute", inset: 0, 
          backgroundImage: "radial-gradient(var(--border-light) 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px", opacity: 0.4
        }} />

        {/* Back Button */}
        <button 
          onClick={() => navigate("/dashboard")} 
          style={{
            position: "absolute", top: 24, left: 40, zIndex: 10,
            display: "flex", alignItems: "center", gap: 8, 
            background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12,
            padding: "8px 16px", color: "#fff", cursor: "pointer",
            fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700
          }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        {/* Edit Button or Save/Cancel Sticky Row */}
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            style={{
              position: "absolute", top: 24, right: 40, zIndex: 10,
              display: "flex", alignItems: "center", gap: 8,
              background: "linear-gradient(135deg, #6c63ff, #00c9a7)",
              border: "none", borderRadius: 12, padding: "10px 18px",
              color: "#fff", cursor: "pointer", fontFamily: "'Outfit', sans-serif",
              fontSize: 13.5, fontWeight: 800, boxShadow: "0 6px 16px rgba(108,99,255,0.3)"
            }}
          >
            <Edit size={16} /> Edit Profile
          </button>
        ) : (
          <div style={{ position: "absolute", top: 24, right: 40, zIndex: 10, display: "flex", gap: 10 }}>
            <button
              onClick={handleCancelEdit}
              style={{
                background: "rgba(255, 68, 68, 0.15)", border: "1px solid rgba(255, 68, 68, 0.3)",
                color: "#ff6b6b", padding: "10px 18px", borderRadius: 12, cursor: "pointer",
                fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 700
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveProfile}
              style={{
                background: "#00c9a7", border: "none", color: "#fff",
                padding: "10px 22px", borderRadius: 12, cursor: "pointer",
                fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 900,
                boxShadow: "0 6px 18px rgba(0,201,167,0.3)"
              }}
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* ==================== PROFILE HERO BANNER CONTROLS ==================== */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", position: "relative" }}>
        
        {/* Floating Avatar Area */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 24, marginTop: -80, marginBottom: 30, position: "relative", zIndex: 5, flexWrap: "wrap" }}>
          
          <div style={{
            width: 140, height: 140, borderRadius: "50%",
            background: "linear-gradient(135deg, #6c63ff, #00c9a7, #e040fb)",
            padding: 4.5, boxShadow: "0 12px 30px rgba(0,0,0,0.15)"
          }}>
            <div style={{
              width: "100%", height: "100%", borderRadius: "50%",
              background: "var(--bg-card)", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 54
            }}>
              🎓
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 280, paddingBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <h1 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 900, color: "var(--text-main)" }}>
                {profile.name}
              </h1>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "4px 10px", borderRadius: 20,
                background: "rgba(0,201,167,0.12)", border: "1px solid rgba(0,201,167,0.25)",
                fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 700, color: "#00c9a7"
              }}>
                <ShieldCheck size={13} />
                <span>Verified Student</span>
              </div>
            </div>

            <p style={{ margin: "6px 0 12px", fontSize: 16, color: "var(--text-muted)", fontWeight: 500 }}>
              {profile.tagline}
            </p>

            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: 13.5, color: "var(--text-muted)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><MapPin size={14} /> {profile.institute}</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}><GraduationCap size={14} /> CGPA: {profile.cgpa}</span>
            </div>
          </div>
        </div>

        {/* ==================== COMPLETE PROFILE BONUS BANNER ==================== */}
        {!additionalCompleted && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: "linear-gradient(135deg, rgba(108, 99, 255, 0.12) 0%, rgba(224, 64, 251, 0.12) 100%)",
              border: "1.5px solid rgba(108, 99, 255, 0.3)", borderRadius: 20,
              padding: "24px 30px", marginBottom: 30, display: "flex",
              alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20
            }}
          >
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", maxWidth: 700 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(108,99,255,0.2)", display: "flex", alignItems: "center", justify: "center", flexShrink: 0 }}>
                <Rocket color="#6c63ff" size={22} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 16.5, fontWeight: 900, color: "var(--text-main)" }}>
                  💡 Complete Your Professional DNA Setup
                </h4>
                <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.45 }}>
                  You skipped several career ideology and academic performance questions during onboarding. Fill them in now to optimize your AI Placement Matcher &amp; earn a <strong style={{ color: "#f7971e" }}>+250 Coins Bonus</strong>!
                </p>
              </div>
            </div>
            
            <button
              onClick={() => { setAddStep(1); setShowAdditionalModal(true); }}
              style={{
                padding: "12px 24px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, #6c63ff, #e040fb)", color: "#fff",
                fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900, cursor: "pointer",
                boxShadow: "0 6px 20px rgba(108,99,255,0.3)"
              }}
            >
              Complete Setup (+250 🪙)
            </button>
          </motion.div>
        )}

        {/* ==================== STATS OVERVIEW CARDS ==================== */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 18, marginBottom: 40 }}>
          
          <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 20, padding: "18px 22px", textAlign: "center" }}>
            <span style={{ fontSize: 12, fontFamily: "'Fira Code', monospace", fontWeight: 800, color: "#6c63ff" }}>CRI SCORE</span>
            <h3 style={{ margin: "6px 0 0", fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 900 }}>{profile.cri} <span style={{ fontSize: 14, color: "var(--text-muted)" }}>/ 100</span></h3>
          </div>

          <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 20, padding: "18px 22px", textAlign: "center" }}>
            <span style={{ fontSize: 12, fontFamily: "'Fira Code', monospace", fontWeight: 800, color: "#00c9a7" }}>GLOBAL RANK</span>
            <h3 style={{ margin: "6px 0 0", fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 900 }}>{profile.rankGlobal}</h3>
          </div>

          <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 20, padding: "18px 22px", textAlign: "center" }}>
            <span style={{ fontSize: 12, fontFamily: "'Fira Code', monospace", fontWeight: 800, color: "#f7971e" }}>COINS</span>
            <h3 style={{ margin: "6px 0 0", fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 900 }}>{coins.toLocaleString()}</h3>
          </div>

          <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 20, padding: "18px 22px", textAlign: "center" }}>
            <span style={{ fontSize: 12, fontFamily: "'Fira Code', monospace", fontWeight: 800, color: "#e040fb" }}>STREAK</span>
            <h3 style={{ margin: "6px 0 0", fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 900 }}>{profile.streak} 🔥</h3>
          </div>

        </div>

        {/* ==================== PROFILE TABS NAVIGATION ==================== */}
        <div style={{ 
          display: "flex", gap: 10, overflowX: "auto", paddingBottom: 10,
          borderBottom: "1.5px solid var(--border-light)", marginBottom: 30
        }} className="hide-scrollbar">
          {[
            { id: "identity", label: "🪪 Public Identity" },
            { id: "performance", label: "🏆 Academic DNA" },
            { id: "aspirations", label: "🎯 Career Ideology" },
            { id: "portfolio", label: "📁 Portfolio & CV" },
            { id: "badges", label: "🎖️ Badges & Honors" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 20px", borderRadius: 12, border: "none", cursor: "pointer",
                fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800,
                whiteSpace: "nowrap", transition: "all 0.2s",
                background: activeTab === tab.id ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "var(--bg-card)",
                color: activeTab === tab.id ? "#fff" : "var(--text-muted)",
                boxShadow: activeTab === tab.id ? "0 4px 14px rgba(108,99,255,0.25)" : "none"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ==================== TABS CONTENT ==================== */}
        <div style={{ paddingBottom: 80 }}>
          
          {/* TAB 1: Public Identity */}
          {activeTab === "identity" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 28 }}>
                <h3 style={{ margin: "0 0 18px", fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900 }}>Elevator Pitch</h3>
                {!editing ? (
                  <p style={{ margin: 0, fontSize: 14.5, color: "var(--text-muted)", lineHeight: 1.6 }}>{profile.pitch}</p>
                ) : (
                  <textarea
                    value={draft.pitch}
                    onChange={e => setDraft(prev => ({ ...prev, pitch: e.target.value }))}
                    style={{ width: "100%", height: 80, padding: 12, borderRadius: 12, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", resize: "none", fontFamily: "'Inter', sans-serif" }}
                  />
                )}
              </div>

              <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 28 }}>
                <h3 style={{ margin: "0 0 18px", fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900 }}>Professional Passion</h3>
                {!editing ? (
                  <p style={{ margin: 0, fontSize: 14.5, color: "var(--text-muted)", lineHeight: 1.6 }}>{profile.passion}</p>
                ) : (
                  <textarea
                    value={draft.passion}
                    onChange={e => setDraft(prev => ({ ...prev, passion: e.target.value }))}
                    style={{ width: "100%", height: 120, padding: 12, borderRadius: 12, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", resize: "vertical", fontFamily: "'Inter', sans-serif" }}
                  />
                )}
              </div>

              <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 28 }}>
                <h3 style={{ margin: "0 0 18px", fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900 }}>Career Objective</h3>
                {!editing ? (
                  <p style={{ margin: 0, fontSize: 14.5, color: "var(--text-muted)", lineHeight: 1.6 }}>{profile.objective}</p>
                ) : (
                  <textarea
                    value={draft.objective}
                    onChange={e => setDraft(prev => ({ ...prev, objective: e.target.value }))}
                    style={{ width: "100%", height: 100, padding: 12, borderRadius: 12, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", resize: "none", fontFamily: "'Inter', sans-serif" }}
                  />
                )}
              </div>

            </motion.div>
          )}

          {/* TAB 2: Academic DNA */}
          {activeTab === "performance" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "grid", gridTemplateColumns: "1fr", mdLayout: "unset", gap: 24 }} className="profile-layout-grid">
              <style dangerouslySetInnerHTML={{__html: `
                @media (min-width: 768px) {
                  .profile-layout-grid {
                    grid-template-columns: 1.5fr 1fr !important;
                  }
                }
              `}} />

              {/* Core Subject Ratings */}
              <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 28 }}>
                <h3 style={{ margin: "0 0 8px", fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900 }}>📚 Core Subject Competence</h3>
                <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--text-muted)" }}>Simulated self-evaluation ratings for computer science domains.</p>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {Object.entries(ratings).map(([subject, rating]) => (
                    <div key={subject}>
                      <div style={{ display: "flex", justify: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 800, color: "var(--text-main)" }}>{subject}</span>
                        <div style={{ display: "flex", gap: 2 }}>
                          {[1, 2, 3, 4, 5].map(num => (
                            <Star 
                              key={num} 
                              size={14} 
                              color={num <= rating ? getSubjectColor(subject) : "var(--border-light)"} 
                              fill={num <= rating ? getSubjectColor(subject) : "transparent"} 
                            />
                          ))}
                        </div>
                      </div>
                      <div style={{ width: "100%", height: 6, borderRadius: 3, background: "var(--bg-alt)", overflow: "hidden" }}>
                        <div style={{ width: `${(rating / 5) * 100}%`, height: "100%", background: getSubjectColor(subject), borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Academic Info */}
              <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 28, display: "flex", flexDirection: "column", gap: 18 }}>
                <h3 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900 }}>🏫 Education DNA</h3>
                
                <div>
                  <label style={{ fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)" }}>INSTITUTE</label>
                  {!editing ? (
                    <div style={{ fontSize: 14.5, fontWeight: 750, marginTop: 4 }}>{profile.institute}</div>
                  ) : (
                    <input
                      type="text"
                      value={draft.institute}
                      onChange={e => setDraft(prev => ({ ...prev, institute: e.target.value }))}
                      style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 8, background: "var(--bg-alt)", border: "1px solid var(--border-light)", color: "var(--text-main)", outline: "none" }}
                    />
                  )}
                </div>

                <div>
                  <label style={{ fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)" }}>DEGREE &amp; BRANCH</label>
                  {!editing ? (
                    <div style={{ fontSize: 14.5, fontWeight: 750, marginTop: 4 }}>{profile.degree} · {profile.branch}</div>
                  ) : (
                    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                      <input
                        type="text"
                        value={draft.degree}
                        onChange={e => setDraft(prev => ({ ...prev, degree: e.target.value }))}
                        style={{ flex: 1, padding: 8, borderRadius: 8, background: "var(--bg-alt)", border: "1px solid var(--border-light)", color: "var(--text-main)", outline: "none" }}
                      />
                      <input
                        type="text"
                        value={draft.branch}
                        onChange={e => setDraft(prev => ({ ...prev, branch: e.target.value }))}
                        style={{ flex: 2, padding: 8, borderRadius: 8, background: "var(--bg-alt)", border: "1px solid var(--border-light)", color: "var(--text-main)", outline: "none" }}
                      />
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)" }}>CGPA / PERCENTAGE</label>
                    {!editing ? (
                      <div style={{ fontSize: 14.5, fontWeight: 750, marginTop: 4 }}>{profile.cgpa}</div>
                    ) : (
                      <input
                        type="text"
                        value={draft.cgpa}
                        onChange={e => setDraft(prev => ({ ...prev, cgpa: e.target.value }))}
                        style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 8, background: "var(--bg-alt)", border: "1px solid var(--border-light)", color: "var(--text-main)", outline: "none" }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)" }}>GRADUATION YEAR</label>
                    {!editing ? (
                      <div style={{ fontSize: 14.5, fontWeight: 750, marginTop: 4 }}>{profile.gradYear}</div>
                    ) : (
                      <input
                        type="text"
                        value={draft.gradYear}
                        onChange={e => setDraft(prev => ({ ...prev, gradYear: e.target.value }))}
                        style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 8, background: "var(--bg-alt)", border: "1px solid var(--border-light)", color: "var(--text-main)", outline: "none" }}
                      />
                    )}
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* TAB 3: Career Ideology */}
          {activeTab === "aspirations" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 28 }}>
                <h3 style={{ margin: "0 0 20px", fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900 }}>🎯 Long-Term Career Aims</h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
                  <div style={{ padding: 16, background: "var(--bg-alt)", borderRadius: 16, border: "1px solid var(--border-light)" }}>
                    <span style={{ fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)" }}>CAREER VISION</span>
                    <div style={{ fontSize: 14.5, fontWeight: 800, marginTop: 6, color: "#6c63ff" }}>{vision}</div>
                  </div>

                  <div style={{ padding: 16, background: "var(--bg-alt)", borderRadius: 16, border: "1px solid var(--border-light)" }}>
                    <span style={{ fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)" }}>TARGET COMPANY MODEL</span>
                    <div style={{ fontSize: 14.5, fontWeight: 800, marginTop: 6, color: "#00c9a7" }}>{company}</div>
                  </div>

                  <div style={{ padding: 16, background: "var(--bg-alt)", borderRadius: 16, border: "1px solid var(--border-light)" }}>
                    <span style={{ fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)" }}>BEHAVIORAL RISK APPETITE</span>
                    <div style={{ fontSize: 14.5, fontWeight: 800, marginTop: 6, color: "#f7971e" }}>{risk}</div>
                  </div>
                </div>
              </div>

              {/* Sliders preference overview */}
              <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 28 }}>
                <h3 style={{ margin: "0 0 20px", fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900 }}>⚙️ Ideological Alignment Parameters</h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  <div>
                    <div style={{ display: "flex", justify: "space-between", fontSize: 13, marginBottom: 8, fontWeight: 700 }}>
                      <span style={{ color: "#6c63ff" }}>⚡ Fast Startup</span>
                      <span style={{ color: "var(--text-muted)" }}>Preferences Weight: {envSlider}%</span>
                      <span style={{ color: "#00c9a7" }}>🏛️ Stable Corporate</span>
                    </div>
                    <div style={{ width: "100%", height: 6, borderRadius: 3, background: "var(--bg-alt)" }}>
                      <div style={{ width: `${envSlider}%`, height: "100%", background: "linear-gradient(90deg, #6c63ff, #00c9a7)", borderRadius: 3 }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justify: "space-between", fontSize: 13, marginBottom: 8, fontWeight: 700 }}>
                      <span style={{ color: "#f7971e" }}>💰 High Salary Focus</span>
                      <span style={{ color: "var(--text-muted)" }}>Preferences Weight: {impactSlider}%</span>
                      <span style={{ color: "#00c9a7" }}>🌍 Social Mission Impact</span>
                    </div>
                    <div style={{ width: "100%", height: 6, borderRadius: 3, background: "var(--bg-alt)" }}>
                      <div style={{ width: `${impactSlider}%`, height: "100%", background: "linear-gradient(90deg, #f7971e, #00c9a7)", borderRadius: 3 }} />
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 4: Portfolio & CV */}
          {activeTab === "portfolio" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              {/* Cover Letter/CV upload placeholder */}
              <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 28 }}>
                <h3 style={{ margin: "0 0 8px", fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900 }}>📄 Resume / Curriculum Vitae</h3>
                <p style={{ margin: "0 0 20px", fontSize: 13, color: "var(--text-muted)" }}>Keep your professional resume updated for immediate application matching.</p>
                
                <div style={{ border: "2px dashed var(--border-light)", borderRadius: 16, padding: "30px 20px", textAlign: "center", background: "var(--bg-alt)", cursor: "pointer" }}>
                  <FileText size={32} color="#6c63ff" style={{ margin: "0 auto 10px" }} />
                  <strong style={{ display: "block", fontSize: 14, color: "var(--text-main)" }}>Rahul_Kushwaha_Resume.pdf</strong>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>PDF format · 142 KB · Updated 2 days ago</span>
                </div>
              </div>

              {/* Projects Grid */}
              <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 28 }}>
                <h3 style={{ margin: "0 0 20px", fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900 }}>💻 Portfolio Projects</h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
                  {profile.projects.map((proj, idx) => (
                    <div key={idx} style={{ padding: 18, background: "var(--bg-alt)", borderRadius: 16, border: "1px solid var(--border-light)", display: "flex", flexDirection: "column", justify: "space-between", gap: 14 }}>
                      <div>
                        <h4 style={{ margin: "0 0 6px", fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800 }}>{proj.title}</h4>
                        <p style={{ margin: 0, fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.5 }}>{proj.desc}</p>
                      </div>

                      <div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                          {proj.tags.map(t => (
                            <span key={t} style={{ padding: "2px 8px", borderRadius: 8, background: "var(--bg-card)", border: "1.5px solid var(--border-light)", fontSize: 10, fontFamily: "'Fira Code', monospace" }}>{t}</span>
                          ))}
                        </div>
                        <div style={{ display: "flex", gap: 12, fontSize: 11, fontWeight: 700 }}>
                          <a href={proj.github} style={{ color: "#6c63ff", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}><Code size={12} /> Repository</a>
                          <a href={proj.demo} style={{ color: "#00c9a7", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}><ExternalLink size={12} /> Live Link</a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 5: Badges */}
          {activeTab === "badges" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 28 }}>
                <h3 style={{ margin: "0 0 8px", fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900 }}>🎖️ Gamified Badges &amp; Milestone Trophies</h3>
                <p style={{ margin: "0 0 24px", fontSize: 13, color: "var(--text-muted)" }}>Earned by completing challenges, roadmaps, and maintaining streaks.</p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                  {profile.badges.map((badge, idx) => {
                    const style = SKILL_PALETTE[idx % 4];
                    return (
                      <div 
                        key={idx} 
                        style={{
                          padding: 16, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                          borderRadius: 20, textAlign: "center", display: "flex", flexDirection: "column",
                          alignItems: "center", gap: 8
                        }}
                      >
                        <div style={{ 
                          width: 46, height: 46, borderRadius: 12, 
                          background: style.bg, border: `1.5px solid ${style.bdr}`,
                          display: "flex", alignItems: "center", justify: "center", fontSize: 22
                        }}>
                          {badge.icon}
                        </div>
                        <h4 style={{ margin: "4px 0 2px", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, color: "var(--text-main)" }}>
                          {badge.label}
                        </h4>
                        <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>
                          {badge.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

        </div>

      </div>

      {/* ==================== GLOBAL MULTI-STEP MODAL: OMITTED QUESTIONS ==================== */}
      <AnimatePresence>
        {showAdditionalModal && (
          <div 
            onClick={e => { if (e.target === e.currentTarget) setShowAdditionalModal(false); }}
            style={{
              position: "fixed", inset: 0, zIndex: 1300,
              background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(8px)",
              display: "flex", alignItems: "center", justifyContent: "center", padding: 24
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                background: "var(--bg-card)", borderRadius: 24, maxWidth: 540, width: "100%",
                border: "1.5px solid var(--border-light)", boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
                overflow: "hidden"
              }}
            >
              
              {/* Modal Header */}
              <div style={{ padding: "20px 24px", borderBottom: "1.5px solid var(--border-light)", display: "flex", justify: "space-between", alignItems: "center", background: "var(--bg-alt)" }}>
                <div>
                  <h4 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900, color: "var(--text-main)" }}>
                    🚀 Complete Professional Profile DNA
                  </h4>
                  <span style={{ fontSize: 11.5, color: "#6c63ff", fontWeight: 700, fontFamily: "'Fira Code', monospace" }}>
                    STEP {addStep} OF 2
                  </span>
                </div>
                <button 
                  onClick={() => setShowAdditionalModal(false)}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-main)", fontSize: 22 }}
                >
                  ×
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: 24 }}>
                
                {/* STEP 1: Academic & Coding DNA */}
                {addStep === 1 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontFamily: "'Outfit', sans-serif", fontWeight: 800, marginBottom: 6 }}>1. School Board Affiliation (10th/12th)</label>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {["CBSE", "ICSE", "State Board", "IB / Cambridge"].map(opt => (
                          <button
                            key={opt}
                            onClick={() => setBoard(opt)}
                            style={{
                              padding: "8px 14px", borderRadius: 10, cursor: "pointer",
                              fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 700,
                              background: board === opt ? "rgba(108,99,255,0.12)" : "var(--bg-alt)",
                              border: board === opt ? "1.5px solid #6c63ff" : "1px solid var(--border-light)",
                              color: board === opt ? "#6c63ff" : "var(--text-main)"
                            }}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontFamily: "'Outfit', sans-serif", fontWeight: 800, marginBottom: 6 }}>2. Coding Experience Level</label>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {["Absolute Beginner", "Familiar with syntax", "Built small projects", "Advanced Developer"].map(opt => (
                          <button
                            key={opt}
                            onClick={() => setCodingExp(opt)}
                            style={{
                              padding: "8px 14px", borderRadius: 10, cursor: "pointer",
                              fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 700,
                              background: codingExp === opt ? "rgba(0,201,167,0.12)" : "var(--bg-alt)",
                              border: codingExp === opt ? "1.5px solid #00c9a7" : "1px solid var(--border-light)",
                              color: codingExp === opt ? "#00c9a7" : "var(--text-main)"
                            }}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", fontSize: 13, fontFamily: "'Outfit', sans-serif", fontWeight: 800, marginBottom: 6 }}>3. Primary Language</label>
                        <select
                          value={primaryLang}
                          onChange={e => setPrimaryLang(e.target.value)}
                          style={{ width: "100%", padding: 10, borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", cursor: "pointer" }}
                        >
                          {["Python", "C++", "Java", "JavaScript", "Go", "Rust"].map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ flex: 1.2 }}>
                        <label style={{ display: "block", fontSize: 13, fontFamily: "'Outfit', sans-serif", fontWeight: 800, marginBottom: 6 }}>4. Main Academic Goal</label>
                        <select
                          value={academicGoal}
                          onChange={e => setAcademicGoal(e.target.value)}
                          style={{ width: "100%", padding: 10, borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", cursor: "pointer" }}
                        >
                          {["Sem Topper Focus", "FAANG Placement Prep", "Research & Thesis", "Building Startup MVP"].map(goal => (
                            <option key={goal} value={goal}>{goal}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontFamily: "'Outfit', sans-serif", fontWeight: 800, marginBottom: 6 }}>5. Subject Self-Evaluation (1 to 5 Stars)</label>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12, background: "var(--bg-alt)", borderRadius: 14, border: "1px solid var(--border-light)" }}>
                        {Object.entries(ratings).map(([subj, rate]) => (
                          <div key={subj} style={{ display: "flex", justify: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 12.5, fontWeight: 700 }}>{subj}</span>
                            <div style={{ display: "flex", gap: 4 }}>
                              {[1, 2, 3, 4, 5].map(star => (
                                <button
                                  type="button"
                                  key={star}
                                  onClick={() => setRatings(prev => ({ ...prev, [subj]: star }))}
                                  style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
                                >
                                  <Star 
                                    size={14} 
                                    fill={star <= rate ? "#6c63ff" : "transparent"} 
                                    color={star <= rate ? "#6c63ff" : "var(--text-muted)"} 
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </motion.div>
                )}

                {/* STEP 2: Ideology & Cognitive Match */}
                {addStep === 2 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    
                    <div>
                      <div style={{ display: "flex", justify: "space-between", fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
                        <span style={{ color: "#6c63ff" }}>⚡ Fast Startup</span>
                        <span style={{ color: "#00c9a7" }}>🏛️ Corporate</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" value={envSlider} 
                        onChange={e => setEnvSlider(parseInt(e.target.value))}
                        style={{ width: "100%", height: 6, borderRadius: 3, background: "var(--bg-alt)", outline: "none", cursor: "pointer" }}
                      />
                    </div>

                    <div>
                      <div style={{ display: "flex", justify: "space-between", fontSize: 12, fontWeight: 800, marginBottom: 6 }}>
                        <span style={{ color: "#f7971e" }}>💰 Salary Scale</span>
                        <span style={{ color: "#00c9a7" }}>🌍 Mission Impact</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" value={impactSlider} 
                        onChange={e => setImpactSlider(parseInt(e.target.value))}
                        style={{ width: "100%", height: 6, borderRadius: 3, background: "var(--bg-alt)", outline: "none", cursor: "pointer" }}
                      />
                    </div>

                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", fontSize: 12, fontFamily: "'Outfit', sans-serif", fontWeight: 800, marginBottom: 6 }}>Risk Appetite</label>
                        <select 
                          value={risk} onChange={e => setRisk(e.target.value)}
                          style={{ width: "100%", padding: 10, borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none" }}
                        >
                          {["🛡️ Conservative", "⚖️ Moderate", "🚀 Aggressive"].map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ flex: 1.2 }}>
                        <label style={{ display: "block", fontSize: 12, fontFamily: "'Outfit', sans-serif", fontWeight: 800, marginBottom: 6 }}>Long-Term Vision</label>
                        <select 
                          value={vision} onChange={e => setVision(e.target.value)}
                          style={{ width: "100%", padding: 10, borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none" }}
                        >
                          {["🧑‍💻 Technical Expert", "📋 Management Track", "🚀 Entrepreneur / Founder"].map(v => (
                            <option key={v} value={v}>{v}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 12.5, fontFamily: "'Outfit', sans-serif", fontWeight: 800, marginBottom: 6 }}>Dream Company Type</label>
                      <select 
                        value={company} onChange={e => setCompany(e.target.value)}
                        style={{ width: "100%", padding: 10, borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none" }}
                      >
                        {["🌐 FAANG / Big Tech", "🦄 Unicorn Startups", "🏛️ Government / Public", "💻 Freelance / Builder"].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", fontSize: 12, fontFamily: "'Outfit', sans-serif", fontWeight: 800, marginBottom: 6 }}>Ideal Challenge</label>
                        <select 
                          value={puzzle} onChange={e => setPuzzle(e.target.value)}
                          style={{ width: "100%", padding: 10, borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none" }}
                        >
                          {["Math Problem", "Design Flaw", "Logic Bug", "System Chaos"].map(pz => (
                            <option key={pz} value={pz}>{pz}</option>
                          ))}
                        </select>
                      </div>

                      <div style={{ flex: 1 }}>
                        <label style={{ display: "block", fontSize: 12, fontFamily: "'Outfit', sans-serif", fontWeight: 800, marginBottom: 6 }}>Archetype Bias</label>
                        <select 
                          value={invent} onChange={e => setInvent(e.target.value)}
                          style={{ width: "100%", padding: 10, borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none" }}
                        >
                          {["💡 Create Something New", "⚖️ Both Equally", "⚡ Make Existing 10× Better"].map(iv => (
                            <option key={iv} value={iv}>{iv}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                  </motion.div>
                )}

              </div>

              {/* Modal Footer Controls */}
              <div style={{ padding: "16px 24px", borderTop: "1.5px solid var(--border-light)", background: "var(--bg-alt)", display: "flex", gap: 12, justifyContent: "flex-end" }}>
                {addStep === 1 ? (
                  <button
                    onClick={() => setAddStep(2)}
                    style={{
                      padding: "10px 22px", borderRadius: 10, border: "none",
                      background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff",
                      fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 900, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 4
                    }}
                  >
                    <span>Next Phase</span>
                    <ChevronRight size={15} />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setAddStep(1)}
                      style={{
                        padding: "10px 18px", borderRadius: 10, border: "1.5px solid var(--border-light)",
                        background: "var(--bg-card)", color: "var(--text-muted)", cursor: "pointer",
                        fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 800
                      }}
                    >
                      Back
                    </button>
                    <button
                      onClick={handleAdditionalSubmit}
                      style={{
                        padding: "10px 24px", borderRadius: 10, border: "none",
                        background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff",
                        fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 900, cursor: "pointer"
                      }}
                    >
                      Save &amp; Sync DNA
                    </button>
                  </>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
