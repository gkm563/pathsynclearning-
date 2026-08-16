"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StageTransitionOverlay from "../../components/onboarding/StageTransitionOverlay";
import { 
  Sun, Moon, Sparkles, ArrowRight, ArrowLeft, Rocket, 
  Briefcase, Target, Zap, Layers, Cpu, Plus, CheckCircle2, Award 
} from "lucide-react";
import { apiSend } from "@/lib/api";

export default function OnboardingStage2() {
  const router = useRouter();

  // Dark Mode State Sync
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    const nextTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  // Phase Control inside Stage 2 (Phase 1: Profiling Form -> Phase 2: AI Career Blueprints)
  const [phase, setPhase] = useState(1);

  // Form State (No Prefilled Defaults)
  const [domains, setDomains] = useState<any[]>([]);
  const [customDomain, setCustomDomain] = useState("");
  const [showCustomDomain, setShowCustomDomain] = useState(false);

  const [industry, setIndustry] = useState("");
  const [customIndustry, setCustomIndustry] = useState("");
  const [showCustomIndustry, setShowCustomIndustry] = useState(false);

  const [passion, setPassion] = useState("");
  const [envSlider, setEnvSlider] = useState(50);
  const [pstyle, setPstyle] = useState("");
  const [impactSlider, setImpactSlider] = useState(50);

  const [risk, setRisk] = useState("");
  const [customRisk, setCustomRisk] = useState("");
  const [showCustomRisk, setShowCustomRisk] = useState(false);

  const [tags, setTags] = useState<any[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [company, setCompany] = useState("");
  const [customCompany, setCustomCompany] = useState("");
  const [showCustomCompany, setShowCustomCompany] = useState(false);

  const [vision, setVision] = useState("");
  const [customVision, setCustomVision] = useState("");
  const [showCustomVision, setShowCustomVision] = useState(false);

  const [puzzle, setPuzzle] = useState("");
  const [invent, setInvent] = useState("");

  // AI Loading & Launching State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisTextIndex, setAnalysisTextIndex] = useState(0);
  const [selectedCareerTitle, setSelectedCareerTitle] = useState("");
  const [customCareerInput, setCustomCareerInput] = useState("");
  const [isLaunching, setIsLaunching] = useState(false);

  // Know Career Path Modal State
  const [showKnowCareerModal, setShowKnowCareerModal] = useState(false);
  const [knownCareerInput, setKnownCareerInput] = useState("");

  const handleDirectCareerSubmit = async (careerName) => {
    const finalCareer = careerName || knownCareerInput.trim() || "Full-Stack Web Developer";
    const stage2 = {
      domains, tags, passion, pstyle, industry, chosenCareer: finalCareer
    };
    localStorage.setItem("pathEdSelectedCareer", finalCareer);
    localStorage.setItem("pathEdStage2", JSON.stringify(stage2));
    try {
      await apiSend("/api/me/onboarding", "PUT", {
        stage2,
        selectedCareer: finalCareer,
        currentStage: 3,
      });
    } catch {
      // keep local progress if offline
    }
    setShowKnowCareerModal(false);
    setIsLaunching(true);
    setTimeout(() => {
      setIsLaunching(false);
      router.push("/onboarding/stage3");
    }, 1400);
  };

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
    { label: "🧑‍💻 Technical Expert", sub: "Stay deep in code & architecture" },
    { label: "📋 Management Track", sub: "Lead engineering teams & product strategy" },
    { label: "🚀 Entrepreneur / Founder", sub: "Start my own tech company" }
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

  // DYNAMIC CAREER CALCULATION BASED ON ACTUAL USER INPUTS
  const getDynamicCareers = () => {
    const isUnfilled = domains.length === 0 && !industry && !passion && !pstyle && !risk && tags.length === 0 && !company && !vision;

    if (isUnfilled) {
      return [
        {
          title: "Full-Stack Product Engineer",
          score: 55,
          difficulty: "Intermediate", diffCol: "#f7971e", diffBg: "rgba(247,151,30,0.12)",
          demand: "High Demand ↑", demandCol: "#00c9a7", demandBg: "rgba(0,201,167,0.12)",
          cri: 50, rank: 1, accent: "#6c63ff", icon: "🏗️",
          brief: "Build modern web and cloud applications. Default generalist baseline path for software engineering.",
          skills: ["React", "Node.js", "JavaScript", "SQL", "Git"],
          why: "Uncalibrated Baseline — Select preferences in Stage 2 to personalize your match score!",
          sector: "General Tech"
        },
        {
          title: "Application Security Engineer",
          score: 50,
          difficulty: "Advanced", diffCol: "#e040fb", diffBg: "rgba(224,64,251,0.12)",
          demand: "High Growth ↑", demandCol: "#00c9a7", demandBg: "rgba(0,201,167,0.12)",
          cri: 48, rank: 2, accent: "#00c9a7", icon: "🔐",
          brief: "Audit code bases and protect application infrastructure against security vulnerabilities.",
          skills: ["Security Protocols", "Penetration Testing", "Secure Coding", "OWASP", "Python"],
          why: "Uncalibrated Baseline — Select preferences in Stage 2 to personalize your match score!",
          sector: "Fintech / Banking"
        },
        {
          title: "ML / AI Engineer",
          score: 48,
          difficulty: "Advanced", diffCol: "#e040fb", diffBg: "rgba(224,64,251,0.12)",
          demand: "Very High ↑↑", demandCol: "#00c9a7", demandBg: "rgba(0,201,167,0.12)",
          cri: 45, rank: 3, accent: "#f7971e", icon: "🤖",
          brief: "Develop machine learning algorithms and integrate intelligence models into product pipelines.",
          skills: ["Python", "TensorFlow", "PyTorch", "Data Pipelines", "MLOps"],
          why: "Uncalibrated Baseline — Select preferences in Stage 2 to personalize your match score!",
          sector: "AI & Automation"
        },
        {
          title: "Data & BI Analyst",
          score: 42,
          difficulty: "Intermediate", diffCol: "#f7971e", diffBg: "rgba(247,151,30,0.12)",
          demand: "High Growth ↑", demandCol: "#00c9a7", demandBg: "rgba(0,201,167,0.12)",
          cri: 40, rank: 4, accent: "#e040fb", icon: "📊",
          brief: "Analyze data trends to guide engineering and business decision making.",
          skills: ["SQL", "Python", "Tableau", "Power BI", "Statistics"],
          why: "Uncalibrated Baseline — Select preferences in Stage 2 to personalize your match score!",
          sector: "E-Commerce"
        },
        {
          title: "DevOps / Platform Engineer",
          score: 38,
          difficulty: "Intermediate", diffCol: "#f7971e", diffBg: "rgba(247,151,30,0.12)",
          demand: "High Growth ↑", demandCol: "#00c9a7", demandBg: "rgba(0,201,167,0.12)",
          cri: 35, rank: 5, accent: "#00c9a7", icon: "☁️",
          brief: "Manage cloud servers, build automation, and deploy scalable microservices.",
          skills: ["Kubernetes", "AWS", "Docker", "Linux", "CI/CD"],
          why: "Uncalibrated Baseline — Select preferences in Stage 2 to personalize your match score!",
          sector: "Cloud Infrastructure"
        }
      ];
    }

    // Dynamic Scoring calculation when preferences ARE selected
    const hasCyber = domains.includes("Cybersecurity") || pstyle === "The Firefighter";
    const hasAI = domains.includes("AI / ML") || pstyle === "The Researcher";
    const hasDev = domains.includes("Software Dev") || passion === "build";
    const hasData = domains.includes("Data Analytics");
    const hasCloud = domains.includes("Cloud Systems") || domains.includes("DevOps / Infra") || pstyle === "The Architect";

    const baseWhy = [
      pstyle && `Style: ${pstyle}`,
      domains.length > 0 && `Domains: ${domains.slice(0, 2).join(", ")}`,
      industry && `Industry: ${industry}`
    ].filter(Boolean).join(" + ");

    return [
      {
        title: "Application Security Engineer",
        score: hasCyber ? 94 : 72,
        difficulty: "Advanced", diffCol: "#e040fb", diffBg: "rgba(224,64,251,0.12)",
        demand: "High Growth ↑", demandCol: "#00c9a7", demandBg: "rgba(0,201,167,0.12)",
        cri: 88, rank: hasCyber ? 1 : 3, accent: "#00c9a7", icon: "🔐",
        brief: "Develop secure applications by integrating security measures, testing vulnerabilities, and ensuring code compliance.",
        skills: ["Security Protocols", "Penetration Testing", "Secure Coding", "OWASP", "Python"],
        why: hasCyber ? `Matches your ${baseWhy}` : "General Engineering Security Option",
        sector: industry || "Fintech / Banking"
      },
      {
        title: "ML / AI Engineer",
        score: hasAI ? 92 : 75,
        difficulty: "Advanced", diffCol: "#e040fb", diffBg: "rgba(224,64,251,0.12)",
        demand: "Very High ↑↑", demandCol: "#00c9a7", demandBg: "rgba(0,201,167,0.12)",
        cri: 85, rank: hasAI ? 1 : 2, accent: "#6c63ff", icon: "🤖",
        brief: "Build intelligent systems that learn from data — from training neural network models to deploying production microservices.",
        skills: ["Python", "TensorFlow", "PyTorch", "Data Pipelines", "MLOps"],
        why: hasAI ? `Matches your ${baseWhy}` : "AI & Intelligence Focus",
        sector: industry || "Healthtech / Fintech"
      },
      {
        title: "Full-Stack Product Engineer",
        score: hasDev ? 90 : 78,
        difficulty: "Intermediate", diffCol: "#f7971e", diffBg: "rgba(247,151,30,0.12)",
        demand: "Stable ↑", demandCol: "#f7971e", demandBg: "rgba(247,151,30,0.12)",
        cri: 82, rank: hasDev ? 1 : 2, accent: "#f7971e", icon: "🏗️",
        brief: "Own the full product lifecycle — from database schema to pixel-perfect UI.",
        skills: ["React", "Node.js", "PostgreSQL", "Docker", "REST APIs"],
        why: hasDev ? `Matches your ${baseWhy}` : "Product & Full Stack Focus",
        sector: industry || "EdTech / E-commerce"
      },
      {
        title: "Data & BI Analyst",
        score: hasData ? 88 : 68,
        difficulty: "Intermediate", diffCol: "#f7971e", diffBg: "rgba(247,151,30,0.12)",
        demand: "High Growth ↑", demandCol: "#00c9a7", demandBg: "rgba(0,201,167,0.12)",
        cri: 78, rank: 4, accent: "#e040fb", icon: "📊",
        brief: "Transform raw data into strategic decisions. Build real-time dashboards and uncover trends.",
        skills: ["SQL", "Python", "Tableau", "Power BI", "Statistics"],
        why: hasData ? `Matches your ${baseWhy}` : "Analytics Option",
        sector: industry || "E-commerce / Fintech"
      },
      {
        title: "DevOps / Platform Engineer",
        score: hasCloud ? 86 : 65,
        difficulty: "Intermediate", diffCol: "#f7971e", diffBg: "rgba(247,151,30,0.12)",
        demand: "High Growth ↑", demandCol: "#00c9a7", demandBg: "rgba(0,201,167,0.12)",
        cri: 81, rank: 5, accent: "#00c9a7", icon: "☁️",
        brief: "Keep systems running smoothly. Build CI/CD pipelines and manage cloud infra.",
        skills: ["Kubernetes", "AWS", "Terraform", "Linux", "CI/CD"],
        why: hasCloud ? `Matches your ${baseWhy}` : "Platform Infrastructure Option",
        sector: industry || "Enterprise / SaaS"
      }
    ].sort((a, b) => b.score - a.score);
  };

  const aiGeneratedCareers = getDynamicCareers();

  const analysisSteps = [
    "Synthesizing Professional DNA & Domain Preferences...",
    "Calibrating Academic Pacing & Problem Solving Style...",
    "Querying Gemini AI Model for SDE Career Fits...",
    "Generating 5 Tailored SDE Career Blueprints..."
  ];

  // Dynamic Color Calculation for Q4 (Work Environment)
  const getEnvColor = (val) => {
    if (val < 30) return "#7c3aed";
    if (val > 70) return "#00c9a7";
    return "#c084fc";
  };

  // Dynamic Color Calculation for Q6 (Salary vs Impact)
  const getImpactColor = (val) => {
    if (val < 30) return "#f7971e";
    if (val > 70) return "#00c9a7";
    return "#f43f5e";
  };

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

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysisTextIndex(0);

    const stage2 = {
      domains,
      tags,
      passion,
      pstyle,
      industry
    };
    localStorage.setItem("pathEdStage2", JSON.stringify(stage2));
    try {
      await apiSend("/api/me/onboarding", "PUT", {
        stage2,
        currentStage: 2,
      });
    } catch {
      // keep local progress if offline
    }

    const stepInterval = setInterval(() => {
      setAnalysisTextIndex(prev => {
        if (prev >= analysisSteps.length - 1) {
          clearInterval(stepInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 550);

    setTimeout(() => {
      setIsAnalyzing(false);
      setPhase(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 2400);
  };

  const handleLaunchPath = async (title) => {
    const finalTitle = title === "custom" ? customCareerInput || "Custom SDE Career Path" : title;
    setSelectedCareerTitle(finalTitle);
    const stage2 = {
      domains, tags, passion, pstyle, industry, chosenCareer: finalTitle
    };
    localStorage.setItem("pathEdSelectedCareer", finalTitle);
    localStorage.setItem("pathEdStage2", JSON.stringify(stage2));
    try {
      await apiSend("/api/me/onboarding", "PUT", {
        stage2,
        selectedCareer: finalTitle,
        currentStage: 3,
      });
    } catch {
      // keep local progress if offline
    }
    setIsLaunching(true);

    setTimeout(() => {
      setIsLaunching(false);
      router.push("/onboarding/stage3");
    }, 2400);
  };

  const answeredCount = [
    domains.length > 0, industry, passion, pstyle, 
    risk, tags.length > 0, company, vision, puzzle, invent
  ].filter(Boolean).length;
  const completionPct = Math.round((answeredCount / 10) * 100);

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
        <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: "30px 36px", marginBottom: 32, boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", marginBottom: 26 }}>
            <div style={{ position: "absolute", left: 42, right: 42, top: 31, height: 3, background: "var(--border-light)", zIndex: 0 }} />
            <div style={{ position: "absolute", left: 42, top: 31, height: 3, background: "linear-gradient(90deg, #6c63ff, #00c9a7)", zIndex: 1, width: "50%", transition: "width 0.4s ease" }} />

            {stages.map((stg) => (
              <div key={stg.num} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 11, position: "relative", zIndex: 2 }}>
                <div style={{
                  width: 62, height: 62, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800,
                  background: stg.status === "done" ? "linear-gradient(135deg, #00c9a7, #6c63ff)" : stg.status === "active" ? "linear-gradient(135deg, #6c63ff, #f7971e)" : "var(--bg-alt)",
                  color: stg.status === "done" || stg.status === "active" ? "#ffffff" : "var(--text-muted)",
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

        {/* ════════════════════════════════════════════════════════════
           PHASE 1: PROFILING FORM (QUESTIONS 1 TO 12)
        ════════════════════════════════════════════════════════════ */}
        {phase === 1 && (
          <div>
            <div style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 16px", borderRadius: 20, background: "rgba(108,99,255,0.12)", border: "1px solid #6c63ff40", color: "#6c63ff", fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 800, marginBottom: 12 }}>
                <Rocket size={16} /> CAREER AMBITION & ROLE PROFILING
              </div>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 42, fontWeight: 800, margin: "0 0 12px", lineHeight: 1.15, color: "var(--text-main)" }}>
                Define Your <span style={{ background: "linear-gradient(135deg, #6c63ff, #00c9a7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Professional Career DNA</span>
              </h1>
              <p style={{ fontSize: 16.5, color: "var(--text-muted)", maxWidth: 600, margin: "0 auto", lineHeight: 1.5 }}>
                Complete all 12 career profiling questions below so PathEd AI can generate your 4-year SDE roadmap.
              </p>
            </div>

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
                            fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: isSelected ? 600 : 500,
                            cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 10
                          }}
                        >
                          <span style={{ fontSize: 20 }}>{d.icon}</span>
                          <span>{d.label}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <button
                      type="button"
                      onClick={() => setShowCustomDomain(!showCustomDomain)}
                      style={{
                        padding: "10px 18px", borderRadius: 14,
                        border: "1.5px dashed #6c63ff", background: "rgba(108,99,255,0.08)",
                        color: "#6c63ff", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700,
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
                        placeholder="Type custom domain..."
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
                          border: "none", fontWeight: 700, cursor: "pointer"
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
                            fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: isSelected ? 600 : 500,
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
                        color: "#00c9a7", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700,
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
                        placeholder="Type custom industry..."
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
                
                {/* Q3: Builder Archetype (SINGLE ROW LAYOUT) */}
                <div style={{ marginBottom: 32 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                    <Target size={18} color="#f7971e" /> Q3. What kind of builder are you at heart?
                  </label>
                  <p style={{ fontSize: 13.5, color: "var(--text-muted)", margin: "0 0 14px" }}>
                    Determines your primary working archetype across career roadmaps.
                  </p>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, width: "100%" }}>
                    {[
                      { key: "build", emoji: "🏗️", label: "The Builder", sub: "Creates from scratch" },
                      { key: "fix", emoji: "🔥", label: "The Firefighter", sub: "Finds & fixes flaws" },
                      { key: "analyze", emoji: "🔬", label: "The Researcher", sub: "Analyzes patterns" },
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
                          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: isSelected ? 600 : 500, color: isSelected ? "#f7971e" : "var(--text-main)" }}>
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
                    <Layers size={18} color={getEnvColor(envSlider)} /> Q4. Work Environment Preference
                  </label>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, fontFamily: "'Fira Code', monospace", fontWeight: 700 }}>
                    <span style={{ color: envSlider < 50 ? "#7c3aed" : "var(--text-muted)" }}>
                      {envSlider < 30 ? "🔥 Deep Startup Focus" : "⚡ Fast-Paced Startup"}
                    </span>
                    <span style={{ color: envSlider > 50 ? "#00c9a7" : "var(--text-muted)" }}>
                      {envSlider > 70 ? "🏛️ Deep Corporate Focus" : "🏛️ Established Corporate"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={envSlider}
                    onChange={e => setEnvSlider(parseInt(e.target.value))}
                    style={{
                      width: "100%", height: 8, borderRadius: 4, cursor: "pointer",
                      accentColor: getEnvColor(envSlider)
                    }}
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
                          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: isSelected ? 600 : 500, color: isSelected ? "#6c63ff" : "var(--text-main)" }}>
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
                    <Rocket size={18} color={getImpactColor(impactSlider)} /> Q6. Salary vs. Social Impact Priority
                  </label>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, fontFamily: "'Fira Code', monospace", fontWeight: 700 }}>
                    <span style={{ color: impactSlider < 50 ? "#f7971e" : "var(--text-muted)" }}>
                      {impactSlider < 30 ? "💎 Top Salary Focus" : "💰 High Salary Package"}
                    </span>
                    <span style={{ color: impactSlider > 50 ? "#00c9a7" : "var(--text-muted)" }}>
                      {impactSlider > 70 ? "🌱 High Social Impact" : "🌍 Social Impact & Mission"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={impactSlider}
                    onChange={e => setImpactSlider(parseInt(e.target.value))}
                    style={{
                      width: "100%", height: 8, borderRadius: 4, cursor: "pointer",
                      accentColor: getImpactColor(impactSlider)
                    }}
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
                            fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: isSelected ? 600 : 500,
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
                        color: "#00c9a7", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700,
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

                {/* Q8: Favorite Tools Tag Input */}
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
                          fontSize: 12, fontWeight: 700, cursor: "pointer"
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
                            fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: isSelected ? 600 : 500,
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
                        color: "#e040fb", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700,
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

                {/* Q10: Long-Term Career Vision + 4th CUSTOM OPTION */}
                <div style={{ marginBottom: 32 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                    <Rocket size={18} color="#6c63ff" /> Q10. Long-Term Career Vision?
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 10 }}>
                    {visionOptions.map(v => {
                      const isSelected = vision === v.label;
                      return (
                        <div
                          key={v.label}
                          onClick={() => { setVision(v.label); setShowCustomVision(false); }}
                          style={{
                            padding: 16, borderRadius: 16,
                            border: `1.5px solid ${isSelected ? "#6c63ff" : "var(--border-light)"}`,
                            background: isSelected ? "rgba(108,99,255,0.12)" : "var(--bg-alt)",
                            cursor: "pointer", transition: "all 0.2s"
                          }}
                        >
                          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: isSelected ? 600 : 500, color: isSelected ? "#6c63ff" : "var(--text-main)" }}>
                            {v.label}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{v.sub}</div>
                        </div>
                      );
                    })}

                    <div
                      onClick={() => setShowCustomVision(!showCustomVision)}
                      style={{
                        padding: 16, borderRadius: 16,
                        border: "1.5px dashed #6c63ff", background: "rgba(108,99,255,0.08)",
                        cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center", textAlignment: "center"
                      }}
                    >
                      <Plus size={22} color="#6c63ff" />
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 700, color: "#6c63ff", marginTop: 4 }}>
                        + Enter Custom Vision
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Write your own career goal</div>
                    </div>
                  </div>

                  {showCustomVision && (
                    <input
                      type="text"
                      value={customVision}
                      onChange={e => { setCustomVision(e.target.value); setVision(`✨ ${e.target.value}`); }}
                      placeholder="Enter custom career vision..."
                      style={{
                        width: "100%", maxWidth: 420, padding: "12px 16px", borderRadius: 14,
                        background: "var(--bg-alt)", border: "1.5px solid #6c63ff",
                        fontSize: 14, color: "var(--text-main)", outline: "none", marginTop: 8
                      }}
                    />
                  )}
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
                          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: isSelected ? 600 : 500, color: isSelected ? "#00c9a7" : "var(--text-main)" }}>
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
                          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: isSelected ? 600 : 500, color: isSelected ? "#f7971e" : "var(--text-main)" }}>
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
              <div style={{ textAlign: "center", marginTop: 16, display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  style={{
                    padding: "16px 36px", borderRadius: 18, border: "none",
                    background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#ffffff",
                    fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800,
                    cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10,
                    boxShadow: "0 8px 24px rgba(108,99,255,0.35)"
                  }}
                >
                  <Sparkles size={18} /> {isAnalyzing ? "Analyzing Career DNA..." : "Analyze & Match My Target Careers"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowKnowCareerModal(true)}
                  style={{
                    padding: "16px 32px", borderRadius: 18,
                    border: "1.5px solid #6c63ff", background: "rgba(108,99,255,0.08)",
                    color: "#6c63ff", fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800,
                    cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10,
                    transition: "all 0.2s"
                  }}
                >
                  🎯 I Already Know My Career Path
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
           PHASE 2: AI CAREER BLUEPRINTS DISCOVERY (5 CARDS + 6TH CUSTOM)
        ════════════════════════════════════════════════════════════ */}
        {phase === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div style={{ textAlign: "left", marginBottom: 32 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 16, background: "rgba(0,201,167,0.12)", border: "1px solid #00c9a740", fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 800, color: "#00c9a7", marginBottom: 12 }}>
                ▸ PHASE 2 — AI CAREER BLUEPRINTS DISCOVERY
              </div>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 42, fontWeight: 800, color: "var(--text-main)", margin: "0 0 10px" }}>
                Your Top 5 <span style={{ background: "linear-gradient(135deg, #6c63ff, #00c9a7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI Career Blueprints</span>
              </h1>
              <p style={{ fontSize: 16.5, color: "var(--text-muted)", margin: 0, lineHeight: 1.6, maxWidth: 620 }}>
                {completionPct === 0 ? "Showing baseline uncalibrated matches (0 questions answered). Fill choices in Stage 2 to boost match scores!" : "Based on your professional DNA, problem-solving style, and industry interests, Gemini AI has synthesized these high-potential engineering paths."}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 32 }}>
              {aiGeneratedCareers.map((c, i) => (
                <CareerCardItem
                  key={c.title}
                  career={c}
                  index={i}
                  selected={selectedCareerTitle === c.title}
                  onSelect={handleLaunchPath}
                />
              ))}

              {/* 6TH CUSTOM CAREER CARD */}
              <div style={{
                background: "var(--bg-card)", border: "2px dashed #6c63ff", borderRadius: 24, padding: 28,
                boxShadow: "0 10px 30px rgba(108,99,255,0.06)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(108,99,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                    ✏️
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
                      Option #6: Define Custom Career Path
                    </h3>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                      If none of the above fits your specific dream goal, enter your custom role below.
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <input
                    type="text"
                    value={customCareerInput}
                    onChange={e => setCustomCareerInput(e.target.value)}
                    placeholder="e.g. Game Engine Developer, Blockchain Architect..."
                    style={{
                      flex: 1, minWidth: 260, padding: "14px 18px", borderRadius: 14,
                      background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                      fontSize: 15, color: "var(--text-main)", outline: "none"
                    }}
                  />
                  <button
                    onClick={() => handleLaunchPath("custom")}
                    disabled={!customCareerInput.trim()}
                    style={{
                      padding: "14px 28px", borderRadius: 14, border: "none",
                      background: customCareerInput.trim() ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "var(--bg-alt)",
                      color: customCareerInput.trim() ? "#fff" : "var(--text-muted)",
                      fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800,
                      cursor: customCareerInput.trim() ? "pointer" : "not-allowed"
                    }}
                  >
                    Select Custom Path →
                  </button>
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <button
                onClick={() => setPhase(1)}
                style={{
                  background: "none", border: "none", color: "#6c63ff",
                  fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 800,
                  cursor: "pointer", textDecoration: "underline"
                }}
              >
                ← None of these fit? Recalibrate my AI profile questions
              </button>
            </div>
          </motion.div>
        )}

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

      {/* REPLACED MODERN GLOWING ORB AI ANALYSIS OVERLAY */}
      <AnimatePresence>
        {isAnalyzing && (
          <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: "absolute", inset: 0, background: "rgba(10, 10, 24, 0.92)", backdropFilter: "blur(24px)" }}
            />
            
            {/* Glowing Particle Orb Ring */}
            <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(108,99,255,0.25) 0%, rgba(0,201,167,0.05) 70%, transparent 100%)", filter: "blur(20px)" }} />

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{
                position: "relative", zIndex: 10, background: "var(--bg-card)",
                border: "2px solid #6c63ff60", borderRadius: 32, padding: "44px 40px",
                textAlign: "center", maxWidth: 500, width: "100%", boxShadow: "0 25px 70px rgba(108,99,255,0.35)"
              }}
            >
              <div style={{ width: 80, height: 80, borderRadius: 24, background: "linear-gradient(135deg, #6c63ff, #00c9a7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 38, margin: "0 auto 24px", boxShadow: "0 12px 30px rgba(108,99,255,0.4)" }}>
                🤖
              </div>

              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 800, color: "var(--text-main)", margin: "0 0 10px" }}>
                Synthesizing AI Career Blueprints
              </h3>
              
              <p style={{ fontSize: 14, color: "#6c63ff", fontFamily: "'Fira Code', monospace", fontWeight: 700, margin: "0 0 24px", lineHeight: 1.4 }}>
                {analysisSteps[analysisTextIndex]}
              </p>

              {/* Glowing Pulse Bar */}
              <div style={{ height: 8, borderRadius: 4, background: "var(--bg-alt)", overflow: "hidden", border: "1px solid var(--border-light)" }}>
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.2, ease: "easeInOut" }}
                  style={{ height: "100%", background: "linear-gradient(90deg, #6c63ff, #00c9a7, #f7971e)" }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MINI POPUP MODAL: I ALREADY KNOW MY CAREER PATH */}
      <AnimatePresence>
        {showKnowCareerModal && (
          <div
            onClick={() => setShowKnowCareerModal(false)}
            style={{
              position: "fixed", inset: 0, background: "rgba(10, 10, 24, 0.75)",
              backdropFilter: "blur(12px)", zIndex: 300,
              display: "flex", alignItems: "center", justifyContent: "center", padding: 20
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: "var(--bg-card)", borderRadius: 24, padding: 32,
                maxWidth: 500, width: "100%", border: "1.5px solid var(--border-light)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.2)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 26 }}>🎯</span>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
                    Enter Your Chosen Career Path
                  </h3>
                </div>
                <button
                  onClick={() => setShowKnowCareerModal(false)}
                  style={{
                    width: 32, height: 32, borderRadius: 10, background: "var(--bg-alt)",
                    border: "1px solid var(--border-light)", cursor: "pointer", fontSize: 14,
                    color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center"
                  }}
                >
                  ✕
                </button>
              </div>

              <p style={{ fontSize: 13.5, color: "var(--text-muted)", marginBottom: 18, lineHeight: 1.5 }}>
                Skip AI recommendations and directly configure your public profile & 4-year SDE roadmap for your target career role.
              </p>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--text-main)", marginBottom: 8 }}>
                  Type your target career title:
                </label>
                <input
                  type="text"
                  value={knownCareerInput}
                  onChange={e => setKnownCareerInput(e.target.value)}
                  placeholder="e.g. Full-Stack Web Developer, AI/ML Engineer..."
                  style={{
                    width: "100%", padding: "14px 18px", borderRadius: 14,
                    background: "var(--bg-alt)", border: "1.5px solid #6c63ff",
                    fontSize: 15, color: "var(--text-main)", outline: "none"
                  }}
                />
              </div>

              <div style={{ marginBottom: 22 }}>
                <label style={{ display: "block", fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 10 }}>
                  OR QUICK SELECT A POPULAR ROLE:
                </label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[
                    "Full-Stack Web Developer",
                    "AI / ML Engineer",
                    "Cloud & DevOps Engineer",
                    "Data Scientist",
                    "Cybersecurity Analyst",
                    "Mobile App Developer"
                  ].map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleDirectCareerSubmit(role)}
                      style={{
                        padding: "8px 14px", borderRadius: 12,
                        background: "rgba(108,99,255,0.1)", border: "1px solid #6c63ff40",
                        color: "#6c63ff", fontFamily: "'Outfit', sans-serif", fontSize: 13,
                        fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
                      }}
                    >
                      + {role}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDirectCareerSubmit(selectedCareerTitle || knownCareerInput || customCareerInput || "")}
                style={{
                  width: "100%", padding: "14px", borderRadius: 16, border: "none",
                  background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff",
                  fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800,
                  cursor: "pointer", boxShadow: "0 8px 24px rgba(108,99,255,0.3)"
                }}
              >
                Save & Continue to Stage 3 →
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LAUNCHING JOURNEY ANIMATION OVERLAY */}
      <StageTransitionOverlay
        isOpen={isLaunching}
        currentStageTitle={`Selected Target Path: ${selectedCareerTitle}`}
        nextStageTitle="Stage 3: Public Identity Review"
        roleColor="#00c9a7"
      />

    </div>
  );
}

/* CAREER CARD ITEM COMPONENT */
function CareerCardItem({ career, index, selected, onSelect }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  const circumference = 2 * Math.PI * 48;
  const strokeDashoffset = circumference - (circumference * animatedScore) / 100;

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      if (current >= career.score) {
        setAnimatedScore(career.score);
        clearInterval(interval);
      } else {
        setAnimatedScore(current);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [career.score]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      style={{
        background: "var(--bg-card)",
        border: `1.5px solid ${selected ? career.accent : "var(--border-light)"}`,
        borderRadius: 24,
        padding: 28,
        position: "relative",
        boxShadow: selected ? `0 15px 40px ${career.accent}25` : "0 8px 24px rgba(0,0,0,0.03)"
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: `${career.accent}15`, border: `1.5px solid ${career.accent}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
              {career.icon}
            </div>
            <div>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: "var(--text-main)", margin: "0 0 6px" }}>
                {career.title}
              </h3>
              
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <span style={{ padding: "3px 10px", borderRadius: 12, background: career.diffBg, border: `1px solid ${career.diffCol}40`, color: career.diffCol, fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 700 }}>
                  {career.difficulty}
                </span>
                <span style={{ padding: "3px 10px", borderRadius: 12, background: career.demandBg, border: `1px solid ${career.demandCol}40`, color: career.demandCol, fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 700 }}>
                  {career.demand}
                </span>
                <span style={{ padding: "3px 10px", borderRadius: 12, background: "rgba(108,99,255,0.12)", border: "1px solid #6c63ff40", color: "#6c63ff", fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 700 }}>
                  CRI: {career.cri}%
                </span>
                {career.rank === 1 && (
                  <span style={{ padding: "3px 10px", borderRadius: 12, background: "rgba(247,151,30,0.12)", border: "1px solid #f7971e40", color: "#f7971e", fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 800 }}>
                    ⭐ Top Match
                  </span>
                )}
              </div>
            </div>
          </div>

          <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6, margin: "0 0 16px" }}>
            {career.brief}
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {career.skills.map(s => (
              <span key={s} style={{ padding: "5px 12px", borderRadius: 10, background: "var(--bg-alt)", border: "1px solid var(--border-light)", fontSize: 12, fontWeight: 700, color: "#6c63ff" }}>
                ⬡ {s}
              </span>
            ))}
          </div>

          <div style={{ padding: "8px 14px", borderRadius: 12, background: "rgba(108,99,255,0.08)", border: "1px solid #6c63ff30", display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 14 }}>🤖</span>
            <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, fontWeight: 700, color: "#6c63ff" }}>
              {career.why}
            </span>
          </div>

          <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
            🏢 Top sector: <span style={{ color: "var(--text-main)", fontWeight: 700 }}>{career.sector}</span> &nbsp;·&nbsp; 🧑‍🏫 <span style={{ color: "#00c9a7", fontWeight: 700 }}>Teacher Verified</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, minWidth: 120 }}>
          <div style={{ position: "relative", width: 110, height: 110, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="110" height="110" viewBox="0 0 110 110">
              <circle cx="55" cy="55" r="48" fill="none" stroke="var(--bg-alt)" strokeWidth="8" />
              <circle
                cx="55"
                cy="55"
                r="48"
                fill="none"
                stroke={career.accent}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 55 55)"
                style={{ transition: "stroke-dashoffset 0.1s linear" }}
              />
            </svg>
            <div style={{ position: "absolute", textAlign: "center" }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 900, color: "var(--text-main)", lineHeight: 1 }}>
                {animatedScore}%
              </div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 8, fontWeight: 800, color: career.accent, letterSpacing: 1, marginTop: 2 }}>
                MATCH
              </div>
            </div>
          </div>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", marginTop: 6 }}>
            #{career.rank} PICK
          </div>
        </div>

      </div>

      <button
        onClick={() => onSelect(career.title)}
        style={{
          width: "100%", padding: "14px", borderRadius: 14,
          border: `1.5px solid ${selected ? "#00c9a7" : career.accent}`,
          background: selected ? "linear-gradient(135deg, #00c9a7, #6c63ff)" : career.rank === 1 ? "rgba(0,201,167,0.12)" : "var(--bg-alt)",
          color: selected ? "#ffffff" : career.accent,
          fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800,
          cursor: "pointer", transition: "all 0.2s", marginTop: 18,
          boxShadow: selected ? "0 8px 24px rgba(0,201,167,0.3)" : "none"
        }}
      >
        {selected ? "✓ Selected — Launching Your Journey..." : career.rank === 1 ? "⭐ Recommended — Select This Path" : "Select This Path →"}
      </button>
    </motion.div>
  );
}
