import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import StageTransitionOverlay from "../../components/onboarding/StageTransitionOverlay";
import { 
  Sun, Moon, Sparkles, CheckCircle2, ArrowRight, ArrowLeft, Rocket, 
  Briefcase, Target, Zap, Shield, HelpCircle, Layers, Cpu, ChevronUp, ChevronDown, Plus 
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

  // Stage 2 Form State
  const [domains, setDomains] = useState(["Software Dev", "AI / ML"]);
  const [industry, setIndustry] = useState("Fintech");
  const [customIndustry, setCustomIndustry] = useState("");
  const [showCustomIndustry, setShowCustomIndustry] = useState(false);

  const [passion, setPassion] = useState("build");
  const [pstyle, setPstyle] = useState("The Architect");
  const [envSlider, setEnvSlider] = useState(50);
  const [impactSlider, setImpactSlider] = useState(50);
  
  const [risk, setRisk] = useState("🚀 Aggressive");
  const [customRisk, setCustomRisk] = useState("");
  const [showCustomRisk, setShowCustomRisk] = useState(false);

  const [company, setCompany] = useState("🦄 Unicorn Startups");
  const [customCompany, setCustomCompany] = useState("");
  const [showCustomCompany, setShowCustomCompany] = useState(false);

  const [vision, setVision] = useState("🧑‍💻 Technical Expert");
  const [puzzle, setPuzzle] = useState("Logic Bug");
  const [invent, setInvent] = useState("💡 Create Something New");

  const [tags, setTags] = useState(["React", "Python", "SQL"]);
  const [tagInput, setTagInput] = useState("");

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedCareerMatch, setSelectedCareerMatch] = useState(null);
  const [isSnapshotExpanded, setIsSnapshotExpanded] = useState(false);
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

  const companyOptions = [
    "🌐 FAANG / Big Tech", "🦄 Unicorn Startups", 
    "🏛️ Government / Public Sector", "💻 Freelancing / Self-Employed"
  ];

  const careerMatches = [
    {
      title: "Full-Stack Product Engineer",
      score: 95,
      brief: "Own the full product lifecycle from architecture to pixel-perfect UI. The highest in-demand role for high-growth tech startups.",
      skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "System Design"],
      icon: "🏗️",
      accent: "#6c63ff"
    },
    {
      title: "ML / AI Solutions Engineer",
      score: 91,
      brief: "Build & deploy neural network models into real-world production systems. High impact at the intersection of algorithms & data.",
      skills: ["Python", "TensorFlow", "PyTorch", "Data Pipelines", "MLOps"],
      icon: "🤖",
      accent: "#00c9a7"
    },
    {
      title: "Application Security Specialist",
      score: 87,
      brief: "Identify vulnerabilities, audit codebases, and secure cloud microservices against real-world threat actors.",
      skills: ["Penetration Testing", "OWASP", "Secure Coding", "Linux", "Python"],
      icon: "🔐",
      accent: "#f7971e"
    }
  ];

  const toggleDomain = (lbl) => {
    setDomains(prev => prev.includes(lbl) ? prev.filter(x => x !== lbl) : [...prev, lbl]);
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
            Tell us what technical domains, engineering roles, and company cultures excite you most.
          </p>
        </div>

        {/* QUESTIONS CONTAINER */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          
          {/* SECTION 1: TECHNICAL DOMAIN & INDUSTRY */}
          <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 32, boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
            
            {/* Tech Domains Selection */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                <Cpu size={18} color="#6c63ff" /> Q1. Which technical domains spark your curiosity?
              </label>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 14px" }}>
                Select all that resonate — this seeds your roadmap node graph.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
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
            </div>

            {/* Industry Focus + Custom Option */}
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

                {/* Plus Custom Option Button */}
                <button
                  type="button"
                  onClick={() => setShowCustomIndustry(!showCustomIndustry)}
                  style={{
                    padding: "10px 18px", borderRadius: 14,
                    border: "1.5px dashed #6c63ff", background: "rgba(108,99,255,0.08)",
                    color: "#6c63ff", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 6
                  }}
                >
                  <Plus size={16} /> Add Custom Industry
                </button>
              </div>

              {/* Custom Write-In Input Field */}
              {showCustomIndustry && (
                <div style={{ marginTop: 10 }}>
                  <input
                    type="text"
                    value={customIndustry}
                    onChange={e => { setCustomIndustry(e.target.value); setIndustry(`✨ ${e.target.value}`); }}
                    placeholder="Type custom industry (e.g. Bio-Informatics, Climate Tech)..."
                    style={{
                      width: "100%", maxWidth: 420, padding: "12px 16px", borderRadius: 14,
                      background: "var(--bg-alt)", border: "1.5px solid #6c63ff",
                      fontSize: 14, color: "var(--text-main)", outline: "none"
                    }}
                  />
                </div>
              )}
            </div>

          </div>

          {/* SECTION 2: WORK STYLE & IDEOLOGY */}
          <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 32, boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
            
            {/* Q3: Builder Archetype */}
            <div style={{ marginBottom: 32 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                <Target size={18} color="#f7971e" /> Q3. What kind of builder are you at heart?
              </label>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 14px" }}>
                Determines your primary working archetype across career roadmaps.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                {[
                  { key: "build", emoji: "🏗️", label: "The Builder", sub: "Loves writing logic from scratch" },
                  { key: "fix", emoji: "🔥", label: "The Firefighter", sub: "Thrives fixing flaws & bugs" },
                  { key: "analyze", emoji: "🔭", label: "The Researcher", sub: "Finds patterns in complex data" },
                  { key: "design", emoji: "✨", label: "The Designer", sub: "Bridges code & user intuition" }
                ].map(item => {
                  const isSelected = passion === item.key;
                  return (
                    <div
                      key={item.key}
                      onClick={() => setPassion(item.key)}
                      style={{
                        padding: 18, borderRadius: 16,
                        border: `1.5px solid ${isSelected ? "#f7971e" : "var(--border-light)"}`,
                        background: isSelected ? "rgba(247,151,30,0.12)" : "var(--bg-alt)",
                        cursor: "pointer", transition: "all 0.2s"
                      }}
                    >
                      <div style={{ fontSize: 26, marginBottom: 8 }}>{item.emoji}</div>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, color: isSelected ? "#f7971e" : "var(--text-main)" }}>
                        {item.label}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{item.sub}</div>
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

            {/* Q5: Favorite Tools & Technologies Tag Input */}
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                <Zap size={18} color="#6c63ff" /> Q5. Favorite tools & technologies so far?
              </label>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 12px" }}>
                Type tools you enjoy (e.g. React, Python, Docker) and press ENTER.
              </p>

              {/* Tags Display */}
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

      {/* 4. EXPANDABLE LIVE SNAPSHOT DRAWER */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 90,
        background: "var(--bg-card)", borderTop: "1.5px solid var(--border-light)",
        padding: "12px 32px", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 -10px 30px rgba(0,0,0,0.06)"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 800, color: "#6c63ff", letterSpacing: 1 }}>
              CAREER DNA SNAPSHOT:
            </span>
            {domains.length > 0 && <span style={{ padding: "4px 10px", borderRadius: 10, background: "var(--bg-alt)", border: "1px solid var(--border-light)", fontSize: 12, fontWeight: 700 }}>⚙️ {domains.join(", ")}</span>}
            {industry && <span style={{ padding: "4px 10px", borderRadius: 10, background: "var(--bg-alt)", border: "1px solid var(--border-light)", fontSize: 12, fontWeight: 700 }}>💼 {industry}</span>}
            {risk && <span style={{ padding: "4px 10px", borderRadius: 10, background: "var(--bg-alt)", border: "1px solid var(--border-light)", fontSize: 12, fontWeight: 700 }}>{risk}</span>}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={() => setIsSnapshotExpanded(!isSnapshotExpanded)}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 12,
                background: "var(--bg-alt)", border: "1px solid var(--border-light)", color: "#6c63ff",
                fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 800, cursor: "pointer"
              }}
            >
              {isSnapshotExpanded ? <>Collapse Snapshot <ChevronDown size={14} /></> : <>Expand Snapshot <ChevronUp size={14} /></>}
            </button>
          </div>
        </div>

        {/* Expandable Summary Grid */}
        <AnimatePresence>
          {isSnapshotExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginTop: 0 }}
              animate={{ height: "auto", opacity: 1, marginTop: 14 }}
              exit={{ height: 0, opacity: 0, marginTop: 0 }}
              style={{ overflow: "hidden", paddingTop: 12, borderTop: "1px solid var(--border-light)" }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <div style={{ background: "var(--bg-alt)", padding: 12, borderRadius: 12, border: "1px solid var(--border-light)" }}>
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "var(--text-muted)" }}>DOMAINS</div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 800, color: "var(--text-main)", marginTop: 2 }}>{domains.join(", ") || "None"}</div>
                </div>

                <div style={{ background: "var(--bg-alt)", padding: 12, borderRadius: 12, border: "1px solid var(--border-light)" }}>
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "var(--text-muted)" }}>INDUSTRY & RISK</div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 800, color: "var(--text-main)", marginTop: 2 }}>{industry} · {risk}</div>
                </div>

                <div style={{ background: "var(--bg-alt)", padding: 12, borderRadius: 12, border: "1px solid var(--border-light)" }}>
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "var(--text-muted)" }}>FAVORITE TOOLS</div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 800, color: "#6c63ff", marginTop: 2 }}>{tags.join(", ") || "None"}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
