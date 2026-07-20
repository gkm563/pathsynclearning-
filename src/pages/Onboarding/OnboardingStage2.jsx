import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import StageTransitionOverlay from "../../components/onboarding/StageTransitionOverlay";
import OnboardingSnapshotDrawer from "../../components/onboarding/OnboardingSnapshotDrawer";
import { 
  Sun, Moon, Sparkles, ArrowRight, ArrowLeft, Rocket, 
  Briefcase, Target, Zap, Layers, Cpu, Plus 
} from "lucide-react";

export default function OnboardingStage2() {
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

  // Stage 2 Form State (ALL 12 QUESTIONS FROM REFERENCE)
  // Q1: Tech Domains
  const [domains, setDomains] = useState(["Software Dev", "AI / ML"]);
  const [customDomain, setCustomDomain] = useState("");
  const [showCustomDomain, setShowCustomDomain] = useState(false);

  // Q2: Industry Focus
  const [industry, setIndustry] = useState("Fintech");
  const [customIndustry, setCustomIndustry] = useState("");
  const [showCustomIndustry, setShowCustomIndustry] = useState(false);

  // Q3: Builder Archetype (Displayed in a Single Row)
  const [passion, setPassion] = useState("build");

  // Q4: Work Environment Preference Slider
  const [envSlider, setEnvSlider] = useState(50);

  // Q5: Problem Solving Style
  const [pstyle, setPstyle] = useState("The Architect");

  // Q6: Salary vs Social Impact Priority Slider
  const [impactSlider, setImpactSlider] = useState(50);

  // Q7: Risk Appetite
  const [risk, setRisk] = useState("🚀 Aggressive");
  const [customRisk, setCustomRisk] = useState("");
  const [showCustomRisk, setShowCustomRisk] = useState(false);

  // Q8: Favorite Tools Tag Input
  const [tags, setTags] = useState(["React", "Python", "SQL"]);
  const [tagInput, setTagInput] = useState("");

  // Q9: Dream Company Type
  const [company, setCompany] = useState("🦄 Unicorn Startups");
  const [customCompany, setCustomCompany] = useState("");
  const [showCustomCompany, setShowCustomCompany] = useState(false);

  // Q10: Long-Term Career Vision
  const [vision, setVision] = useState("🧑‍💻 Technical Expert");

  // Q11: Cognitive Challenge Preference
  const [puzzle, setPuzzle] = useState("Logic Bug");

  // Q12: Invention vs Optimization
  const [invent, setInvent] = useState("💡 Create Something New");

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCareerMatch, setSelectedCareerMatch] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const stages = [
    { num: 1, title: "Academic Foundation & DNA", status: "done" },
    { num: 2, title: "Career Ambition & Target Roles", status: "active" },
    { num: 3, title: "Public Identity & Projects", status: "pending" },
    { num: 4, title: "Roadmap Setup", status: "pending" },
  ];

  const domainOptions = [
    { icon: "⚙️", label: "Software Dev" },
    { icon: "🤖", label: "AI / ML" },
    { icon: "🔐", label: "Cybersecurity" },
    { icon: "☁️", label: "Cloud Systems" },
    { icon: "🎨", label: "UI/UX Design" },
    { icon: "📊", label: "Data Analytics" },
    { icon: "🔌", label: "Hardware / IoT" },
    { icon: "🚀", label: "DevOps / Infra" }
  ];

  const industryOptions = [
    "💳 Fintech", "🏥 Healthtech", "🎮 Gaming", "🛒 E-commerce", 
    "📚 EdTech", "🚀 Space-Tech", "🌱 Sustainability", "🛡️ Defence Tech"
  ];

  const pstyleOptions = [
    { key: "arch", icon: "🏛️", label: "The Architect", sub: "Plans structure first" },
    { key: "fire", icon: "🔥", label: "The Firefighter", sub: "Fixes urgent bugs" },
    { key: "res", icon: "🔬", label: "The Researcher", sub: "Deep dives into why" },
    { key: "comm", icon: "🗣️", label: "The Communicator", sub: "Bridges tech & people" }
  ];

  const companyOptions = [
    "🌐 FAANG / Big Tech", "🦄 Unicorn Startups", 
    "🏛️ Government / Public Sector", "💻 Freelancing / Self-Employed"
  ];

  const visionOptions = [
    { label: "🧑‍💻 Technical Expert", sub: "Stay deep in code" },
    { label: "📋 Management Track", sub: "Lead teams & product strategy" },
    { label: "🚀 Entrepreneur / Founder", sub: "Start my own company" }
  ];

  const puzzleOptions = [
    { key: "math", icon: "🔢", label: "Math Problem", sub: "Algorithmic logic" },
    { key: "design", icon: "🎨", label: "Design Flaw", sub: "Visual intuition" },
    { key: "bug", icon: "🐛", label: "Logic Bug", sub: "Code detective" },
    { key: "system", icon: "🗂️", label: "System Chaos", sub: "Architecture fix" }
  ];

  const inventOptions = [
    { label: "💡 Create Something New", sub: "Build product from zero" },
    { label: "⚖️ Both Equally", sub: "Depends on project phase" },
    { label: "⚡ Make Existing 10× Better", sub: "Optimization & refactoring" }
  ];

  const careerMatches = [
    {
      title: "Full-Stack Product Engineer",
      score: 95,
      brief: "Own the full product lifecycle from architecture to pixel-perfect UI. High demand across top tech startups.",
      skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "System Design"],
      icon: "🏗️",
      accent: "#6c63ff"
    },
    {
      title: "ML / AI Solutions Engineer",
      score: 91,
      brief: "Deploy deep neural network models into scalable cloud microservices.",
      skills: ["Python", "TensorFlow", "PyTorch", "Data Pipelines", "MLOps"],
      icon: "🤖",
      accent: "#00c9a7"
    },
    {
      title: "Application Security Specialist",
      score: 87,
      brief: "Audit codebases, conduct penetration testing, and protect cloud infrastructure.",
      skills: ["Penetration Testing", "OWASP", "Secure Coding", "Linux", "Python"],
      icon: "🔐",
      accent: "#f7971e"
    }
  ];

  const toggleDomain = (lbl) => {
    setDomains(prev => prev.includes(lbl) ? prev.filter(x => x !== lbl) : [...prev, lbl]);
  };

  const handleAddCustomDomain = () => {
    if (customDomain.trim()) {
      setDomains([...domains, customDomain.trim()]);
      setCustomDomain("");
      setShowCustomDomain(false);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setSelectedCareerMatch(careerMatches[0]);
    }, 1800);
  };

  const handleProceedStage3 = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setIsTransitioning(false);
      navigate("/platform");
    }, 2200);
  };

  // Calculate completion percentage
  const answeredCount = [
    domains.length > 0, industry, passion, envSlider !== 50, pstyle, 
    impactSlider !== 50, risk, tags.length > 0, company, vision, puzzle, invent
  ].filter(Boolean).length;
  const completionPct = Math.round((answeredCount / 12) * 100);

  // Shared Snapshot Data
  const snapshotTags = [
    domains.length > 0 ? `⚙️ ${domains.slice(0, 2).join(", ")}` : null,
    industry ? `💼 ${industry}` : null,
    pstyle ? `🧭 ${pstyle}` : null,
    risk ? `🚀 ${risk}` : null,
    company ? `🏛️ ${company}` : null,
  ].filter(Boolean);

  const expandedData = [
    { label: "TARGET TECH DOMAINS", value: domains.join(", ") || "None selected" },
    { label: "PREFERRED INDUSTRY", value: industry || "Not selected" },
    { label: "BUILDER ARCHETYPE", value: passion === "build" ? "The Builder 🏗️" : passion === "fix" ? "The Firefighter 🔥" : passion === "analyze" ? "The Researcher 🔭" : "The Designer ✨" },
    { label: "WORKING STYLE", value: pstyle || "Not selected" },
    { label: "FAVORITE TOOLS", value: tags.join(", ") || "None" },
    { label: "RISK & COMPANY TYPE", value: `${risk} · ${company}` },
    { label: "CAREER VISION", value: vision || "Not selected" },
    { label: "INVENTION PREFERENCE", value: invent || "Not selected" },
  ];

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
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 20, background: "rgba(0,201,167,0.12)", border: "1px solid #00c9a740", color: "#00c9a7", fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 800 }}>
            <Sparkles size={14} /> STAGE 2 OF 4 ONBOARDING
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
            <div style={{ position: "absolute", left: 30, top: 18, height: 3, background: "linear-gradient(90deg, #6c63ff, #00c9a7)", zIndex: 1, width: "50%", transition: "width 0.4s ease" }} />

            {stages.map((stg) => (
              <div key={stg.num} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "relative", zIndex: 2 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800,
                  background: stg.status === "done" ? "linear-gradient(135deg, #00c9a7, #6c63ff)" : stg.status === "active" ? "linear-gradient(135deg, #6c63ff, #f7971e)" : "var(--bg-alt)",
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

        {/* 3. SPLIT-COLOR HEADER TITLE */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 20, background: "rgba(108,99,255,0.12)", border: "1px solid #6c63ff40", color: "#6c63ff", fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 800, marginBottom: 12 }}>
            <Rocket size={16} /> CAREER AMBITION & ROLE PROFILING
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 36, fontWeight: 800, margin: "0 0 10px", lineHeight: 1.2, color: "var(--text-main)" }}>
            Define Your <span style={{ background: "linear-gradient(135deg, #6c63ff, #00c9a7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Professional Career DNA</span>
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-muted)", maxWidth: 580, margin: "0 auto", lineHeight: 1.5 }}>
            Complete all 12 career profiling questions below so PathEd AI can generate your 4-year SDE roadmap.
          </p>
        </div>

        {/* QUESTIONS CONTAINER */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          
          {/* CARD 1: TECHNICAL DOMAINS & INDUSTRY */}
          <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 32, boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
            
            {/* Q1: Tech Domains + Custom Option */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                <Cpu size={18} color="#6c63ff" /> Q1. Which tech domains spark your curiosity?
              </label>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 14px" }}>
                Select all that resonate — this seeds your roadmap node graph.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 14 }}>
                {domainOptions.map(d => {
                  const isSelected = domains.includes(d.label);
                  return (
                    <div
                      key={d.label}
                      onClick={() => toggleDomain(d.label)}
                      style={{
                        padding: "14px 16px", borderRadius: 16,
                        border: `1.5px solid ${isSelected ? "#6c63ff" : "var(--border-light)"}`,
                        background: isSelected ? "rgba(108,99,255,0.12)" : "var(--bg-alt)",
                        color: isSelected ? "#6c63ff" : "var(--text-main)",
                        fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: isSelected ? 800 : 600,
                        cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 10
                      }}
                    >
                      <span style={{ fontSize: 20 }}>{d.icon}</span>
                      <span>{d.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Plus Custom Domain Button */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => setShowCustomDomain(!showCustomDomain)}
                  style={{
                    padding: "10px 18px", borderRadius: 14,
                    border: "1.5px dashed #6c63ff", background: "rgba(108,99,255,0.08)",
                    color: "#6c63ff", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 6
                  }}
                >
                  <Plus size={16} /> Add Custom Domain
                </button>
              </div>

              {showCustomDomain && (
                <div style={{ marginTop: 12, display: "flex", gap: 10, maxWidth: 420 }}>
                  <input
                    type="text"
                    value={customDomain}
                    onChange={e => setCustomDomain(e.target.value)}
                    placeholder="Type custom domain (e.g. Quantum Computing)..."
                    style={{
                      flex: 1, padding: "12px 16px", borderRadius: 14,
                      background: "var(--bg-alt)", border: "1.5px solid #6c63ff",
                      fontSize: 14, color: "var(--text-main)", outline: "none"
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomDomain}
                    style={{
                      padding: "12px 20px", borderRadius: 14, background: "#6c63ff", color: "#fff",
                      border: "none", fontWeight: 800, cursor: "pointer"
                    }}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {/* Q2: Industry Focus + Custom Option */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                <Briefcase size={18} color="#00c9a7" /> Q2. Which industry excites you most?
              </label>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 14px" }}>
                Calibrates which companies and verticals appear in your career matches.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                {industryOptions.map(ind => {
                  const isSelected = industry === ind;
                  return (
                    <button
                      type="button"
                      key={ind}
                      onClick={() => { setIndustry(ind); setShowCustomIndustry(false); }}
                      style={{
                        padding: "10px 18px", borderRadius: 14,
                        border: `1.5px solid ${isSelected ? "#00c9a7" : "var(--border-light)"}`,
                        background: isSelected ? "rgba(0,201,167,0.12)" : "var(--bg-alt)",
                        color: isSelected ? "#00c9a7" : "var(--text-main)",
                        fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: isSelected ? 800 : 600,
                        cursor: "pointer", transition: "all 0.2s"
                      }}
                    >
                      {ind}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setShowCustomIndustry(!showCustomIndustry)}
                  style={{
                    padding: "10px 18px", borderRadius: 14,
                    border: "1.5px dashed #00c9a7", background: "rgba(0,201,167,0.08)",
                    color: "#00c9a7", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 6
                  }}
                >
                  <Plus size={16} /> Add Custom Industry
                </button>
              </div>

              {showCustomIndustry && (
                <div style={{ marginTop: 10 }}>
                  <input
                    type="text"
                    value={customIndustry}
                    onChange={e => { setCustomIndustry(e.target.value); setIndustry(`✨ ${e.target.value}`); }}
                    placeholder="Type custom industry (e.g. Bio-Informatics)..."
                    style={{
                      width: "100%", maxWidth: 420, padding: "12px 16px", borderRadius: 14,
                      background: "var(--bg-alt)", border: "1.5px solid #00c9a7",
                      fontSize: 14, color: "var(--text-main)", outline: "none"
                    }}
                  />
                </div>
              )}
            </div>

          </div>

          {/* CARD 2: BUILDER ARCHETYPE (SINGLE ROW LAYOUT) & WORKING STYLE */}
          <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 32, boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
            
            {/* Q3: Builder Archetype (EXPLICIT SINGLE ROW LAYOUT) */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                <Target size={18} color="#f7971e" /> Q3. What kind of builder are you at heart?
              </label>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 14px" }}>
                Determines your primary working archetype across career roadmaps.
              </p>
              
              {/* SINGLE ROW FLEX CONTAINER */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, width: "100%" }}>
                {[
                  { key: "build", emoji: "🏗️", label: "The Builder", sub: "Creates from scratch" },
                  { key: "fix", emoji: "🔥", label: "The Firefighter", sub: "Finds & fixes flaws" },
                  { key: "analyze", emoji: "🔭", label: "The Researcher", sub: "Analyzes patterns" },
                  { key: "design", emoji: "✨", label: "The Designer", sub: "Crafts UX experience" }
                ].map(item => {
                  const isSelected = passion === item.key;
                  return (
                    <div
                      key={item.key}
                      onClick={() => setPassion(item.key)}
                      style={{
                        padding: 16, borderRadius: 16, textAlign: "center",
                        border: `1.5px solid ${isSelected ? "#f7971e" : "var(--border-light)"}`,
                        background: isSelected ? "rgba(247,151,30,0.12)" : "var(--bg-alt)",
                        cursor: "pointer", transition: "all 0.2s"
                      }}
                    >
                      <div style={{ fontSize: 28, marginBottom: 6 }}>{item.emoji}</div>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, color: isSelected ? "#f7971e" : "var(--text-main)" }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2, lineHeight: 1.3 }}>{item.sub}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Q4: Work Environment Preference Slider */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                <Layers size={18} color="#e040fb" /> Q4. Work Environment Preference
              </label>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, fontFamily: "'Fira Code', monospace", fontWeight: 700 }}>
                <span style={{ color: "#6c63ff" }}>⚡ Fast-Paced Startup</span>
                <span style={{ color: "#00c9a7" }}>🏛️ Established Corporate</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={envSlider}
                onChange={e => setEnvSlider(parseInt(e.target.value))}
                style={{ width: "100%", height: 8, borderRadius: 4, accentColor: "#6c63ff", cursor: "pointer" }}
              />
            </div>

            {/* Q5: Problem Solving Style */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                <Cpu size={18} color="#6c63ff" /> Q5. Problem-Solving Style
              </label>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 14px" }}>
                Your natural working identity when facing engineering challenges in a team.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                {pstyleOptions.map(s => {
                  const isSelected = pstyle === s.label;
                  return (
                    <div
                      key={s.key}
                      onClick={() => setPstyle(s.label)}
                      style={{
                        padding: 16, borderRadius: 16,
                        border: `1.5px solid ${isSelected ? "#6c63ff" : "var(--border-light)"}`,
                        background: isSelected ? "rgba(108,99,255,0.12)" : "var(--bg-alt)",
                        cursor: "pointer", transition: "all 0.2s"
                      }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, color: isSelected ? "#6c63ff" : "var(--text-main)" }}>
                        {s.label}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{s.sub}</div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* CARD 3: SALARY, RISK & FAVORITE TOOLS */}
          <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 32, boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
            
            {/* Q6: Salary vs Social Impact Priority */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                <Rocket size={18} color="#f7971e" /> Q6. Salary vs. Social Impact Priority
              </label>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, fontFamily: "'Fira Code', monospace", fontWeight: 700 }}>
                <span style={{ color: "#f7971e" }}>💰 High Salary Package</span>
                <span style={{ color: "#00c9a7" }}>🌍 Social Impact & Mission</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={impactSlider}
                onChange={e => setImpactSlider(parseInt(e.target.value))}
                style={{ width: "100%", height: 8, borderRadius: 4, accentColor: "#f7971e", cursor: "pointer" }}
              />
            </div>

            {/* Q7: Risk Appetite + Custom Option */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                <Briefcase size={18} color="#00c9a7" /> Q7. Risk Appetite
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
                {["🛡️ Conservative", "⚖️ Moderate", "🚀 Aggressive"].map(r => {
                  const isSelected = risk === r;
                  return (
                    <button
                      type="button"
                      key={r}
                      onClick={() => { setRisk(r); setShowCustomRisk(false); }}
                      style={{
                        padding: "10px 20px", borderRadius: 14,
                        border: `1.5px solid ${isSelected ? "#00c9a7" : "var(--border-light)"}`,
                        background: isSelected ? "rgba(0,201,167,0.12)" : "var(--bg-alt)",
                        color: isSelected ? "#00c9a7" : "var(--text-main)",
                        fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: isSelected ? 800 : 600,
                        cursor: "pointer", transition: "all 0.2s"
                      }}
                    >
                      {r}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setShowCustomRisk(!showCustomRisk)}
                  style={{
                    padding: "10px 18px", borderRadius: 14,
                    border: "1.5px dashed #00c9a7", background: "rgba(0,201,167,0.08)",
                    color: "#00c9a7", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 6
                  }}
                >
                  <Plus size={16} /> Add Custom Risk
                </button>
              </div>

              {showCustomRisk && (
                <input
                  type="text"
                  value={customRisk}
                  onChange={e => { setCustomRisk(e.target.value); setRisk(`⚡ ${e.target.value}`); }}
                  placeholder="Type custom risk preference..."
                  style={{
                    width: "100%", maxWidth: 360, padding: "12px 16px", borderRadius: 14,
                    background: "var(--bg-alt)", border: "1.5px solid #00c9a7",
                    fontSize: 14, color: "var(--text-main)", outline: "none", marginTop: 8
                  }}
                />
              )}
            </div>

            {/* Q8: Favorite Tools & Tech Tag Input */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                <Zap size={18} color="#6c63ff" /> Q8. Favorite tools & technologies so far?
              </label>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 12px" }}>
                Type tools you enjoy (e.g. React, Python, Docker) and press ENTER to add.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                {tags.map(t => (
                  <span
                    key={t}
                    onClick={() => setTags(tags.filter(x => x !== t))}
                    style={{
                      padding: "6px 14px", borderRadius: 12, background: "rgba(108,99,255,0.12)",
                      border: "1px solid #6c63ff40", color: "#6c63ff", fontFamily: "'Fira Code', monospace",
                      fontSize: 12, fontWeight: 800, cursor: "pointer"
                    }}
                  >
                    {t} ×
                  </span>
                ))}
              </div>

              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type tool name & press Enter..."
                style={{
                  width: "100%", maxWidth: 380, padding: "12px 16px", borderRadius: 14,
                  background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                  fontSize: 14, color: "var(--text-main)", outline: "none"
                }}
              />
            </div>

          </div>

          {/* CARD 4: COMPANY TYPE, VISION & AI JUDGMENT */}
          <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 32, boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
            
            {/* Q9: Dream Company Type + Custom Option */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                <Layers size={18} color="#e040fb" /> Q9. Dream Company Type?
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
                {companyOptions.map(c => {
                  const isSelected = company === c;
                  return (
                    <button
                      type="button"
                      key={c}
                      onClick={() => { setCompany(c); setShowCustomCompany(false); }}
                      style={{
                        padding: "10px 18px", borderRadius: 14,
                        border: `1.5px solid ${isSelected ? "#e040fb" : "var(--border-light)"}`,
                        background: isSelected ? "rgba(224,64,251,0.12)" : "var(--bg-alt)",
                        color: isSelected ? "#e040fb" : "var(--text-main)",
                        fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: isSelected ? 800 : 600,
                        cursor: "pointer", transition: "all 0.2s"
                      }}
                    >
                      {c}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setShowCustomCompany(!showCustomCompany)}
                  style={{
                    padding: "10px 18px", borderRadius: 14,
                    border: "1.5px dashed #e040fb", background: "rgba(224,64,251,0.08)",
                    color: "#e040fb", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 6
                  }}
                >
                  <Plus size={16} /> Add Custom Company Type
                </button>
              </div>

              {showCustomCompany && (
                <input
                  type="text"
                  value={customCompany}
                  onChange={e => { setCustomCompany(e.target.value); setCompany(`✨ ${e.target.value}`); }}
                  placeholder="Type custom company preference..."
                  style={{
                    width: "100%", maxWidth: 380, padding: "12px 16px", borderRadius: 14,
                    background: "var(--bg-alt)", border: "1.5px solid #e040fb",
                    fontSize: 14, color: "var(--text-main)", outline: "none", marginTop: 8
                  }}
                />
              )}
            </div>

            {/* Q10: Long-Term Career Vision */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                <Rocket size={18} color="#6c63ff" /> Q10. Long-Term Career Vision?
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                {visionOptions.map(v => {
                  const isSelected = vision === v.label;
                  return (
                    <div
                      key={v.label}
                      onClick={() => setVision(v.label)}
                      style={{
                        padding: 16, borderRadius: 16,
                        border: `1.5px solid ${isSelected ? "#6c63ff" : "var(--border-light)"}`,
                        background: isSelected ? "rgba(108,99,255,0.12)" : "var(--bg-alt)",
                        cursor: "pointer", transition: "all 0.2s"
                      }}
                    >
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, color: isSelected ? "#6c63ff" : "var(--text-main)" }}>
                        {v.label}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{v.sub}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Q11: Cognitive Challenge Preference */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                <Target size={18} color="#00c9a7" /> Q11. Which challenge would you pick first?
              </label>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 12px" }}>
                Cognitive pattern mapping question to fine-tune AI recommendations.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                {puzzleOptions.map(p => {
                  const isSelected = puzzle === p.label;
                  return (
                    <div
                      key={p.key}
                      onClick={() => setPuzzle(p.label)}
                      style={{
                        padding: 16, borderRadius: 16,
                        border: `1.5px solid ${isSelected ? "#00c9a7" : "var(--border-light)"}`,
                        background: isSelected ? "rgba(0,201,167,0.12)" : "var(--bg-alt)",
                        cursor: "pointer", transition: "all 0.2s"
                      }}
                    >
                      <div style={{ fontSize: 24, marginBottom: 6 }}>{p.icon}</div>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, color: isSelected ? "#00c9a7" : "var(--text-main)" }}>
                        {p.label}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{p.sub}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Q12: Invention vs Optimization */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                <Zap size={18} color="#f7971e" /> Q12. Invention vs. Optimization?
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
                {inventOptions.map(o => {
                  const isSelected = invent === o.label;
                  return (
                    <div
                      key={o.label}
                      onClick={() => setInvent(o.label)}
                      style={{
                        padding: 16, borderRadius: 16,
                        border: `1.5px solid ${isSelected ? "#f7971e" : "var(--border-light)"}`,
                        background: isSelected ? "rgba(247,151,30,0.12)" : "var(--bg-alt)",
                        cursor: "pointer", transition: "all 0.2s"
                      }}
                    >
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, color: isSelected ? "#f7971e" : "var(--text-main)" }}>
                        {o.label}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{o.sub}</div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* AI MATCH BUTTON ACTION */}
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              style={{
                padding: "16px 40px", borderRadius: 18, border: "none",
                background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#ffffff",
                fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800,
                cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10,
                boxShadow: "0 8px 24px rgba(108,99,255,0.35)"
              }}
            >
              <Sparkles size={18} /> {isAnalyzing ? "Analyzing Career DNA..." : "Analyze & Match My Target Careers"}
            </button>
          </div>

          {/* AI CAREER MATCH RESULTS PANEL */}
          <AnimatePresence>
            {selectedCareerMatch && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ background: "var(--bg-card)", border: "2px solid #6c63ff", borderRadius: 24, padding: 32, boxShadow: "0 15px 40px rgba(108,99,255,0.15)", marginTop: 12 }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(108,99,255,0.14)", border: "1px solid #6c63ff40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                    🤖
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 800, color: "#6c63ff", letterSpacing: 1.5 }}>
                      PATHED AI CAREER MATCHING COMPLETE
                    </div>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
                      Top 3 Tailored SDE Specializations
                    </h3>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 24 }}>
                  {careerMatches.map((m, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "var(--bg-alt)", border: `1.5px solid ${m.accent}50`, borderRadius: 18, padding: 20,
                        position: "relative"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <span style={{ fontSize: 28 }}>{m.icon}</span>
                        <span style={{ padding: "4px 10px", borderRadius: 12, background: `${m.accent}20`, color: m.accent, fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 800 }}>
                          {m.score}% MATCH
                        </span>
                      </div>
                      <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, color: "var(--text-main)", margin: "0 0 6px" }}>{m.title}</h4>
                      <p style={{ fontSize: 12.5, color: "var(--text-muted)", lineHeight: 1.4, margin: "0 0 12px" }}>{m.brief}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {m.skills.map(sk => (
                          <span key={sk} style={{ padding: "2px 8px", borderRadius: 6, background: "var(--bg-card)", border: "1px solid var(--border-light)", fontSize: 10, fontWeight: 700 }}>{sk}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Submit Action */}
                <div style={{ textAlign: "right" }}>
                  <button
                    onClick={handleProceedStage3}
                    style={{
                      padding: "16px 36px", borderRadius: 18, border: "none",
                      background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#ffffff",
                      fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800,
                      cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10,
                      boxShadow: "0 8px 24px rgba(108,99,255,0.35)"
                    }}
                  >
                    Confirm Career Matches & Proceed to Stage 3 <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* UNIFIED LIVE SNAPSHOT DRAWER */}
      <OnboardingSnapshotDrawer
        completionPct={completionPct}
        tags={snapshotTags}
        expandedData={expandedData}
      />

      {/* Stage Transition Celebration Loading Overlay */}
      <StageTransitionOverlay
        isOpen={isTransitioning}
        currentStageTitle="Stage 2: Career Ambition & Target Roles"
        nextStageTitle="Stage 3: Public Identity & Projects"
        roleColor="#00c9a7"
      />

    </div>
  );
}
