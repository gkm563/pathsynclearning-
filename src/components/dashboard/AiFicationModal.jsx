import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Brain, Target, Building2, MapPin, DollarSign, CheckCircle2, 
  RefreshCw, ShieldAlert, Cpu, Layers, Zap, X, Save, RotateCcw, ArrowRight,
  TrendingUp, BarChart3, ChevronRight, Award, Laptop, Check, Sun, Moon
} from "lucide-react";

/* ─── COMPREHENSIVE MNC CAREER & COMPANY DATASET ─── */
const CAREER_DATASETS = {
  "Software Engineer": [
    {
      id: "google",
      name: "Google",
      logo: "🔍",
      status: "Hiring (High Volume)",
      profile: "Tier-1 Tech Giant • Global Product Infrastructure",
      avgPackage: "$185k - $210k • ₹24L - ₹38L LPA",
      locations: ["Mountain View, CA", "Bangalore, IN", "Zurich, CH"],
      requirements: "Google R&D labs heavily prioritize System Design, Microservices, C#, Distributed Caching, and Vector Indexing for AI Search.",
      skills: ["System Design & Caching", "C# & .NET Systems", "Vector Indexing & DBs", "Distributed Microservices", "High Concurrency Systems", "Zero-Trust Security"]
    },
    {
      id: "amazon",
      name: "Amazon",
      logo: "📦",
      status: "Hiring (1,420+ Openings)",
      profile: "AWS Cloud & E-Commerce Scale Systems",
      avgPackage: "$170k - $195k • ₹22L - ₹35L LPA",
      locations: ["Seattle, WA", "Hyderabad, IN", "Vancouver, CA"],
      requirements: "Amazon AWS labs heavily prioritize DynamoDB, Event-Driven Microservices, Distributed Caching, and Serverless Architecture.",
      skills: ["AWS Cloud Architecture", "DynamoDB & NoSQL", "Event-Driven Microservices", "Distributed Caching", "Kafka Stream Processing"]
    },
    {
      id: "microsoft",
      name: "Microsoft",
      logo: "🪟",
      status: "Hiring (Core AI & Cloud)",
      profile: "Azure Cloud & Copilot AI Ecosystem",
      avgPackage: "$175k - $205k • ₹23L - ₹36L LPA",
      locations: ["Redmond, WA", "Noida, IN", "Dublin, IE"],
      requirements: "Microsoft Azure Teams prioritize C#, .NET 8, Graph Algorithms, and Copilot AI Orchestration for enterprise architectures.",
      skills: [".NET 8 & C# Systems", "Azure Cloud Architecture", "Copilot AI Agents", "System Design & Load Balancers"]
    },
    {
      id: "ibm",
      name: "IBM",
      logo: "💻",
      status: "Hiring (Enterprise Cloud)",
      profile: "Hybrid Cloud & Quantum Computing Infrastructure",
      avgPackage: "$155k - $180k • ₹18L - ₹28L LPA",
      locations: ["Armonk, NY", "Bangalore, IN", "Tokyo, JP"],
      requirements: "IBM Hybrid Cloud & Quantum AI prioritize OpenShift, Kubernetes, and Enterprise Zero-Trust Security.",
      skills: ["Kubernetes & Helm", "RedHat OpenShift", "Enterprise Zero-Trust Sec", "Quantum Algorithmic Logic"]
    },
    {
      id: "meta",
      name: "Meta",
      logo: "♾️",
      status: "Hiring (AI & Systems)",
      profile: "AI Infrastructure & Social Scale Platforms",
      avgPackage: "$190k - $225k • ₹26L - ₹42L LPA",
      locations: ["Menlo Park, CA", "London, UK", "Remote"],
      requirements: "Meta AI & Infrastructure prioritize PyTorch, GraphQL Federation, Relay, and ultra-high-concurrency web systems.",
      skills: ["GraphQL Federation", "React Deep Internals", "PyTorch Systems", "Ultra-High Concurrency"]
    }
  ],
  "Full-Stack Web Developer": [
    {
      id: "google",
      name: "Google",
      logo: "🔍",
      status: "Hiring (Core UI Labs)",
      profile: "Web Platforms & Angular/Lit Core Teams",
      avgPackage: "$180k - $205k • ₹22L - ₹36L LPA",
      locations: ["Mountain View, CA", "Bangalore, IN"],
      requirements: "Focuses on TypeScript, Web Vitals Optimization, Progressive Web Apps, and Distributed Node APIs.",
      skills: ["Progressive Web Apps", "Web Vitals Optimization", "Edge Computing & CDN", "React Server Components"]
    },
    {
      id: "stripe",
      name: "Stripe",
      logo: "💳",
      status: "Hiring (Fintech Web)",
      profile: "Global Payment Infrastructure Platform",
      avgPackage: "$195k - $230k • ₹28L - ₹45L LPA",
      locations: ["San Francisco, CA", "Dublin, IE"],
      requirements: "Requires bulletproof API Security, Idempotency, React State Architecture, and SQL Schema Design.",
      skills: ["Fintech Idempotency", "API Vault Security", "React State Engines", "PostgreSQL Sharding"]
    },
    {
      id: "netflix",
      name: "Netflix",
      logo: "🍿",
      status: "Hiring (UI Systems)",
      profile: "Global Streaming UI & Micro-frontends",
      avgPackage: "$210k - $250k • ₹32L - ₹50L LPA",
      locations: ["Los Gatos, CA", "Remote"],
      requirements: "Demands mastery of Node.js streaming APIs, GraphQL Federation, and client-side rendering performance.",
      skills: ["Micro-Frontend Arch", "Node.js Stream Engine", "GraphQL Federation", "Redis Distributed Cache"]
    }
  ],
  "AI / Machine Learning Engineer": [
    {
      id: "openai",
      name: "OpenAI",
      logo: "🤖",
      status: "Hiring (Frontier Models)",
      profile: "AGI Research & LLM Scaling Infrastructure",
      avgPackage: "$220k - $310k • ₹35L - ₹60L LPA",
      locations: ["San Francisco, CA"],
      requirements: "Requires deep PyTorch, Transformer Attention Mechanisms, Distributed GPU Training, and Vector DBs.",
      skills: ["Multi-Agent Frameworks", "Pinecone Vector DB", "Triton GPU Kernels", "RAG & LangChain", "Model Alignment & RLHF"]
    },
    {
      id: "google_deepmind",
      name: "Google DeepMind",
      logo: "🧠",
      status: "Hiring (AI Science)",
      profile: "Reinforcement Learning & Foundation Models",
      avgPackage: "$210k - $285k • ₹32L - ₹55L LPA",
      locations: ["London, UK", "Mountain View, CA"],
      requirements: "Prioritizes JAX/Flax, Multi-Agent Reinforcement Learning, Linear Algebra, and Calculus Foundations.",
      skills: ["JAX / Flax Acceleration", "Multi-Agent RL", "Neural Arch Search", "Low-Latency AI Inference"]
    },
    {
      id: "anthropic",
      name: "Anthropic",
      logo: "🛡️",
      status: "Hiring (Claude AI)",
      profile: "AI Alignment & Constitutional LLMs",
      avgPackage: "$215k - $295k • ₹34L - ₹58L LPA",
      locations: ["San Francisco, CA"],
      requirements: "Prioritizes Mechanistic Interpretability, Alignment Algorithms, and Rust/C++ GPU Acceleration.",
      skills: ["Constitutional AI", "Mechanistic Interpretability", "Rust GPU Acceleration", "AI Bias Audit"]
    }
  ]
};

export default function AiFicationModal({
  isOpen,
  onClose,
  targetCareer = "Software Engineer",
  onModifyRoadmap,
  onResetRoadmap,
  onSave
}) {
  // Theme Mode State ("light" or "dark") - Default set to Light Mode UI as requested
  const [themeMode, setThemeMode] = useState("light");

  const [selectedRole, setSelectedRole] = useState(
    CAREER_DATASETS[targetCareer] ? targetCareer : "Software Engineer"
  );
  
  const currentCompanies = CAREER_DATASETS[selectedRole] || CAREER_DATASETS["Software Engineer"];
  const [selectedCompanyId, setSelectedCompanyId] = useState(currentCompanies[0]?.id || "google");
  
  const selectedCompany = currentCompanies.find(c => c.id === selectedCompanyId) || currentCompanies[0];
  
  // AI Recalibration State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const isLight = themeMode === "light";

  // Dynamic Theme Token Palette
  const t = {
    overlayBg: isLight ? "rgba(241, 245, 249, 0.82)" : "rgba(15, 23, 42, 0.88)",
    modalContainerBg: isLight 
      ? "linear-gradient(135deg, #ffffff 0%, #f8fafc 55%, #f0f9ff 100%)" 
      : "linear-gradient(135deg, #0b1329 0%, #151a33 60%, #0369a1 140%)",
    modalBorder: isLight ? "2px solid #00c9a7" : "1.5px solid rgba(0, 201, 167, 0.6)",
    modalShadow: isLight 
      ? "0 25px 70px rgba(0, 201, 167, 0.22), 0 10px 40px rgba(108, 99, 255, 0.12)" 
      : "0 30px 80px rgba(0, 201, 167, 0.3), 0 0 50px rgba(108, 99, 255, 0.25)",
    
    headerBg: isLight ? "#ffffff" : "rgba(11, 19, 41, 0.75)",
    headerBorder: isLight ? "1.5px solid #e2e8f0" : "1.5px solid rgba(255, 255, 255, 0.12)",
    titleText: isLight ? "#0f172a" : "#ffffff",
    subtitleText: isLight ? "#64748b" : "rgba(255, 255, 255, 0.75)",

    // Box A (Target Career)
    boxABg: isLight ? "#ffffff" : "rgba(15, 23, 42, 0.75)",
    boxABorder: isLight ? "1.5px solid #bae6fd" : "1.5px solid rgba(56, 189, 248, 0.4)",
    boxAShadow: isLight ? "0 8px 24px rgba(2, 132, 199, 0.08)" : "0 8px 24px rgba(0,0,0,0.25)",
    boxAHighlightBg: isLight ? "#f0f9ff" : "rgba(56, 189, 248, 0.14)",
    boxAHighlightBorder: isLight ? "1px solid #7dd3fc" : "1px solid rgba(56, 189, 248, 0.45)",
    boxATitleText: isLight ? "#0284c7" : "#38bdf8",
    boxARoleBtnBg: isLight ? "#f8fafc" : "rgba(255,255,255,0.06)",
    boxARoleBtnText: isLight ? "#334155" : "#ffffff",
    boxARoleBtnBorder: isLight ? "1px solid #e2e8f0" : "none",

    // Box B (Companies Hiring)
    boxBBg: isLight ? "#ffffff" : "rgba(15, 23, 42, 0.75)",
    boxBBorder: isLight ? "1.5px solid #a7f3d0" : "1.5px solid rgba(16, 185, 129, 0.4)",
    boxBShadow: isLight ? "0 8px 24px rgba(16, 185, 129, 0.08)" : "0 8px 24px rgba(0,0,0,0.25)",
    boxBTitleText: isLight ? "#059669" : "#10b981",
    boxBItemBg: isLight ? "#f8fafc" : "rgba(255, 255, 255, 0.05)",
    boxBItemBorder: isLight ? "1.5px solid #e2e8f0" : "1.5px solid rgba(255, 255, 255, 0.1)",
    boxBItemActiveBg: isLight ? "#ecfdf5" : "rgba(16, 185, 129, 0.22)",
    boxBNameText: isLight ? "#0f172a" : "#ffffff",

    // Box C (Company Snapshot)
    boxCBg: isLight ? "#ffffff" : "rgba(15, 23, 42, 0.75)",
    boxCBorder: isLight ? "1.5px solid #fbcfe8" : "1.5px solid rgba(236, 72, 153, 0.4)",
    boxCShadow: isLight ? "0 8px 24px rgba(236, 72, 153, 0.08)" : "0 8px 24px rgba(0,0,0,0.25)",
    boxCTitleText: isLight ? "#db2777" : "#ec4899",
    boxCNameText: isLight ? "#0f172a" : "#ffffff",
    boxCDescText: isLight ? "#475569" : "#cbd5e1",
    boxCPkgBg: isLight ? "#fdf2f8" : "rgba(236, 72, 153, 0.14)",
    boxCPkgBorder: isLight ? "1px solid #fbcfe8" : "1px solid rgba(236, 72, 153, 0.35)",
    boxCPkgLabel: isLight ? "#db2777" : "#f472b6",
    boxCPkgVal: isLight ? "#0f172a" : "#ffffff",
    boxCLocBg: isLight ? "#f8fafc" : "rgba(255, 255, 255, 0.05)",
    boxCLocBorder: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255, 255, 255, 0.1)",
    boxCLocText: isLight ? "#334155" : "#cbd5e1",

    // Middle Requirement Box
    midBg: isLight ? "#ffffff" : "rgba(15, 23, 42, 0.85)",
    midBorder: isLight ? "1.5px solid #99f6e4" : "1.5px solid rgba(0, 201, 167, 0.5)",
    midShadow: isLight ? "0 12px 30px rgba(0, 201, 167, 0.12)" : "0 12px 32px rgba(0, 201, 167, 0.18)",
    midTitleText: isLight ? "#0d9488" : "#00c9a7",
    midAtomBg: isLight ? "linear-gradient(135deg, #ccfbf1 0%, #e0e7ff 100%)" : "linear-gradient(135deg, rgba(0, 201, 167, 0.12), rgba(108, 99, 255, 0.16))",
    midAtomBorder: isLight ? "1px solid #99f6e4" : "1px solid rgba(0, 201, 167, 0.35)",
    midAtomHeading: isLight ? "#0f172a" : "#ffffff",
    midAtomSubtext: isLight ? "#475569" : "#cbd5e1",
    midCalloutBg: isLight ? "#f8fafc" : "rgba(255, 255, 255, 0.05)",
    midCalloutBorder: isLight ? "1px dashed #cbd5e1" : "1px dashed rgba(255, 255, 255, 0.25)",
    midCalloutText: isLight ? "#1e293b" : "#e2e8f0",

    // Injected Skill Chips
    chipBg: isLight ? "linear-gradient(135deg, #f0fdf4, #e0f2fe)" : "linear-gradient(135deg, rgba(108, 99, 255, 0.3), rgba(0, 201, 167, 0.3))",
    chipBorder: isLight ? "1.5px solid #00c9a7" : "1px solid rgba(0, 201, 167, 0.5)",
    chipText: isLight ? "#0f172a" : "#ffffff",

    // Footer Action Buttons
    footerBg: isLight ? "#ffffff" : "rgba(11, 19, 41, 0.85)",
    footerBorder: isLight ? "1.5px solid #e2e8f0" : "1.5px solid rgba(255, 255, 255, 0.12)",
    saveBtnBg: isLight ? "#f8fafc" : "rgba(255, 255, 255, 0.08)",
    saveBtnBorder: isLight ? "1.5px solid #cbd5e1" : "1.5px solid rgba(255, 255, 255, 0.2)",
    saveBtnText: isLight ? "#0f172a" : "#ffffff",
    resetBtnBg: isLight ? "#fef2f2" : "rgba(239, 68, 68, 0.14)",
    resetBtnBorder: isLight ? "1.5px solid #fca5a5" : "1.5px solid rgba(239, 68, 68, 0.5)",
    resetBtnText: isLight ? "#dc2626" : "#ff4d4d",

    // Overlay
    overlayBg: isLight ? "rgba(255, 255, 255, 0.96)" : "rgba(11, 19, 41, 0.96)",
    overlayHeading: isLight ? "#0f172a" : "#ffffff",
    overlaySubtext: isLight ? "#0284c7" : "#00c9a7"
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    const newCompanies = CAREER_DATASETS[role] || CAREER_DATASETS["Software Engineer"];
    setSelectedCompanyId(newCompanies[0]?.id || "google");
  };

  const handleRunAiModification = () => {
    setIsAnalyzing(true);
    setAnalysisStep(1);

    setTimeout(() => setAnalysisStep(2), 700);
    setTimeout(() => setAnalysisStep(3), 1400);
    setTimeout(() => {
      setIsAnalyzing(false);
      if (onModifyRoadmap) {
        onModifyRoadmap({
          role: selectedRole,
          company: selectedCompany,
          injectedSkills: selectedCompany.skills
        });
      }
      onClose();
    }, 2200);
  };

  const handleResetClick = () => {
    setSelectedRole(targetCareer || "Software Engineer");
    setSelectedCompanyId("google");
    if (onResetRoadmap) {
      onResetRoadmap();
    }
    onClose();
  };

  const handleSaveClick = () => {
    setSaveSuccess(true);
    if (onSave) onSave({ role: selectedRole, company: selectedCompany });
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <AnimatePresence>
      <div style={{
        position: "fixed", inset: 0, zIndex: 1000,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16, background: t.overlayBg,
        backdropFilter: "blur(16px)"
      }}>
        {/* MNC-Grade Light / Dark Adaptive Glass Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ type: "spring", damping: 25, stiffness: 320 }}
          style={{
            width: "100%", maxWidth: 1040, maxHeight: "92vh",
            background: t.modalContainerBg,
            border: t.modalBorder,
            borderRadius: 24, overflow: "hidden",
            boxShadow: t.modalShadow,
            display: "flex", flexDirection: "column", color: t.titleText,
            position: "relative"
          }}
        >
          {/* Top Bar Header */}
          <div style={{
            padding: "18px 26px",
            borderBottom: t.headerBorder,
            background: t.headerBg,
            display: "flex", alignItems: "center", justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: "linear-gradient(135deg, #00c9a7, #6c63ff)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 24px rgba(0, 201, 167, 0.5)"
              }}>
                <Brain size={26} color="#ffffff" />
              </div>

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <h2 style={{
                    fontFamily: "'Outfit', sans-serif", fontSize: 21, fontWeight: 900,
                    margin: 0, color: t.titleText
                  }}>
                    AI-fication: Corporate Roadmap Sync
                  </h2>
                  <span style={{
                    padding: "3px 10px", borderRadius: 12,
                    background: isLight ? "rgba(0, 201, 167, 0.12)" : "rgba(0, 201, 167, 0.2)",
                    border: "1px solid #00c9a7",
                    color: "#00c9a7", fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 900
                  }}>
                    ● MNC RECRUITER ENGINE ACTIVE
                  </span>
                </div>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: t.subtitleText, fontFamily: "'Outfit', sans-serif" }}>
                  Real-time market signal ingestion & university curriculum additive graph expansion
                </p>
              </div>
            </div>

            {/* Header Right Action Group (Theme Switcher & Close Button) */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              
              {/* Theme Mode Toggle Button */}
              <button
                onClick={() => setThemeMode(isLight ? "dark" : "light")}
                style={{
                  padding: "7px 14px", borderRadius: 12,
                  border: isLight ? "1.5px solid #0284c7" : "1.5px solid rgba(0,201,167,0.5)",
                  background: isLight ? "#f0f9ff" : "rgba(255,255,255,0.08)",
                  color: isLight ? "#0284c7" : "#00c9a7",
                  fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: 800,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                  transition: "all 0.2s"
                }}
              >
                {isLight ? <Moon size={15} /> : <Sun size={15} />}
                <span>{isLight ? "🌙 Dark Mode" : "🌞 Light Mode"}</span>
              </button>

              <button
                onClick={onClose}
                style={{
                  width: 38, height: 38, borderRadius: 12,
                  border: isLight ? "1.5px solid #cbd5e1" : "1.5px solid rgba(255,255,255,0.2)",
                  background: isLight ? "#f8fafc" : "rgba(255,255,255,0.06)",
                  color: isLight ? "#0f172a" : "#fff", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.2s"
                }}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Modal Main Scrollable Content */}
          <div style={{ padding: 24, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>

            {/* ── TOP SECTION: 3 COLUMNS (MATCHING USER WIREFRAME IMAGE 2) ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr 1.35fr", gap: 16 }}>
              
              {/* BOX 1: CAREER ROLE */}
              <div style={{
                background: t.boxABg,
                border: t.boxABorder,
                borderRadius: 18, padding: 18, display: "flex", flexDirection: "column", justifyContent: "space-between",
                boxShadow: t.boxAShadow
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <Laptop size={16} color={t.boxATitleText} />
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 900, color: t.boxATitleText, letterSpacing: 0.5 }}>
                      A. YOUR TARGET CAREER
                    </span>
                  </div>

                  <div style={{
                    padding: "10px 12px", borderRadius: 12,
                    background: t.boxAHighlightBg, border: t.boxAHighlightBorder,
                    marginBottom: 14
                  }}>
                    <div style={{ fontSize: 10, color: "#64748b", fontFamily: "'Fira Code', monospace", fontWeight: 700 }}>
                      FETCHED BACKEND ROLE:
                    </div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15.5, fontWeight: 900, color: isLight ? "#0f172a" : "#ffffff", marginTop: 2 }}>
                      {selectedRole}
                    </div>
                  </div>

                  <div style={{ fontSize: 11, color: isLight ? "#475569" : "#94a3b8", marginBottom: 8, fontWeight: 700 }}>
                    SWITCH ROLE TARGETING:
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {Object.keys(CAREER_DATASETS).map(role => (
                      <button
                        key={role}
                        onClick={() => handleRoleChange(role)}
                        style={{
                          padding: "8px 12px", borderRadius: 10, border: t.boxARoleBtnBorder,
                          background: selectedRole === role ? "linear-gradient(135deg, #0284c7, #06b6d4)" : t.boxARoleBtnBg,
                          color: selectedRole === role ? "#ffffff" : t.boxARoleBtnText,
                          fontFamily: "'Outfit', sans-serif", fontSize: 11.5, fontWeight: selectedRole === role ? 800 : 600,
                          textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                          transition: "all 0.2s"
                        }}
                      >
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{role}</span>
                        {selectedRole === role && <CheckCircle2 size={13} color="#fff" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 14, paddingTop: 10, borderTop: isLight ? "1px solid #e2e8f0" : "1px solid rgba(255,255,255,0.1)", fontSize: 10.5, color: "#00c9a7", fontFamily: "'Fira Code', monospace", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>🟢 Form backend data linked</span>
                </div>
              </div>

              {/* BOX 2: COMPANIES HIRING */}
              <div style={{
                background: t.boxBBg,
                border: t.boxBBorder,
                borderRadius: 18, padding: 18, display: "flex", flexDirection: "column",
                boxShadow: t.boxBShadow
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Building2 size={16} color={t.boxBTitleText} />
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 900, color: t.boxBTitleText, letterSpacing: 0.5 }}>
                    B. COMPANIES HIRING
                  </span>
                </div>

                <div style={{ fontSize: 11, color: isLight ? "#64748b" : "#94a3b8", marginBottom: 10, fontWeight: 600 }}>
                  Select target company to fetch live skill requirements:
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", flex: 1, maxHeight: 220, paddingRight: 4 }}>
                  {currentCompanies.map(comp => {
                    const isSelected = selectedCompanyId === comp.id;
                    return (
                      <div
                        key={comp.id}
                        onClick={() => setSelectedCompanyId(comp.id)}
                        style={{
                          padding: "10px 12px", borderRadius: 12,
                          background: isSelected ? t.boxBItemActiveBg : t.boxBItemBg,
                          border: `1.5px solid ${isSelected ? "#10b981" : isLight ? "#e2e8f0" : "rgba(255, 255, 255, 0.1)"}`,
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                          transition: "all 0.2s"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 18 }}>{comp.logo}</span>
                          <div>
                            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 800, color: t.boxBNameText }}>
                              {comp.name}
                            </div>
                            <div style={{ fontSize: 10.5, color: "#10b981", fontFamily: "'Fira Code', monospace", fontWeight: 700 }}>
                              {comp.status}
                            </div>
                          </div>
                        </div>

                        <div style={{
                          width: 22, height: 22, borderRadius: "50%",
                          background: isSelected ? "#10b981" : isLight ? "#cbd5e1" : "rgba(255,255,255,0.1)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontSize: 12, fontWeight: 900
                        }}>
                          ✓
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* BOX 3: COMPANY SNAPSHOT */}
              <div style={{
                background: t.boxCBg,
                border: t.boxCBorder,
                borderRadius: 18, padding: 18, display: "flex", flexDirection: "column", justifyContent: "space-between",
                boxShadow: t.boxCShadow
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <BarChart3 size={16} color={t.boxCTitleText} />
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 900, color: t.boxCTitleText, letterSpacing: 0.5 }}>
                        C. COMPANY SNAPSHOT
                      </span>
                    </div>
                    <span style={{ fontSize: 20 }}>{selectedCompany.logo}</span>
                  </div>

                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900, color: t.boxCNameText, marginBottom: 4 }}>
                    {selectedCompany.name}
                  </div>
                  
                  <div style={{ fontSize: 11.5, color: t.boxCDescText, marginBottom: 12, lineHeight: 1.4 }}>
                    {selectedCompany.profile}
                  </div>

                  {/* Metrics Badge */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
                    <div style={{
                      padding: "8px 12px", borderRadius: 10,
                      background: t.boxCPkgBg, border: t.boxCPkgBorder,
                      display: "flex", alignItems: "center", justifyContent: "space-between"
                    }}>
                      <span style={{ fontSize: 11, color: t.boxCPkgLabel, fontWeight: 700 }}>Average Package:</span>
                      <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 900, color: t.boxCPkgVal }}>
                        {selectedCompany.avgPackage}
                      </span>
                    </div>

                    <div style={{
                      padding: "8px 12px", borderRadius: 10,
                      background: t.boxCLocBg, border: t.boxCLocBorder,
                      display: "flex", alignItems: "center", gap: 6
                    }}>
                      <MapPin size={13} color="#0284c7" />
                      <span style={{ fontSize: 11, color: t.boxCLocText, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {selectedCompany.locations.join(" • ")}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: 10.5, color: isLight ? "#64748b" : "#94a3b8", fontFamily: "'Fira Code', monospace", textAlign: "right" }}>
                  Dataset synchronized • Active hiring pool
                </div>
              </div>

            </div>

            {/* ── MIDDLE SECTION: SPECIFIC REQUIREMENT OF THE JOB PROFILE (MATCHING USER WIREFRAME IMAGE 2) ── */}
            <div style={{
              background: t.midBg,
              border: t.midBorder,
              borderRadius: 20, padding: 20,
              boxShadow: t.midShadow
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Zap size={18} color={t.midTitleText} />
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 900, color: t.midTitleText, letterSpacing: 0.5 }}>
                    SPECIFIC REQUIREMENTS & SKILL GAP ANALYSIS OF {selectedCompany.name.toUpperCase()}
                  </span>
                </div>
                <span style={{ padding: "4px 12px", borderRadius: 10, background: isLight ? "#ccfbf1" : "rgba(0, 201, 167, 0.2)", color: "#00c9a7", fontSize: 11, fontFamily: "'Fira Code', monospace", fontWeight: 900, border: "1px solid #00c9a7" }}>
                  ⚡ ADDITIVE GRAPH EXPANSION
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.45fr", gap: 16, alignItems: "center" }}>
                {/* Visual Neural Atom Graphic */}
                <div style={{
                  padding: 16, borderRadius: 16,
                  background: t.midAtomBg,
                  border: t.midAtomBorder,
                  display: "flex", alignItems: "center", gap: 14
                }}>
                  <div style={{
                    width: 68, height: 68, borderRadius: "50%",
                    background: "radial-gradient(circle, #00c9a7 0%, #0284c7 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 30, boxShadow: "0 0 28px rgba(0, 201, 167, 0.6)", flexShrink: 0
                  }}>
                    ⚛️
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 900, color: t.midAtomHeading }}>
                      Roadmap Expansion: +{selectedCompany.skills.length} Level Nodes
                    </div>
                    <div style={{ fontSize: 11.5, color: t.midAtomSubtext, marginTop: 3, lineHeight: 1.4 }}>
                      AI will additively expand your roadmap from <b>12 → {12 + selectedCompany.skills.length} Levels</b> by adding <b style={{ color: "#00c9a7" }}>{selectedCompany.skills.slice(0, 2).join(", ")}</b> without replacing degree modules!
                    </div>
                  </div>
                </div>

                {/* Specific Job Requirement Callout Box */}
                <div style={{
                  padding: 14, borderRadius: 16,
                  background: t.midCalloutBg,
                  border: t.midCalloutBorder,
                  fontSize: 12.5, color: t.midCalloutText, lineHeight: 1.5, fontFamily: "'Outfit', sans-serif"
                }}>
                  <b style={{ color: "#0284c7" }}>Corporate Insight:</b> "{selectedCompany.requirements}"
                </div>
              </div>

              {/* Injected Skill Chips */}
              <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: isLight ? "#475569" : "#94a3b8", fontWeight: 800, fontFamily: "'Fira Code', monospace" }}>
                  DYNAMICALLY INJECTING NEW NODES:
                </span>
                {selectedCompany.skills.map((sk, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: "5px 14px", borderRadius: 12,
                      background: t.chipBg,
                      border: t.chipBorder, color: t.chipText,
                      fontFamily: "'Outfit', sans-serif", fontSize: 11.5, fontWeight: 900,
                      boxShadow: "0 4px 14px rgba(0, 201, 167, 0.15)"
                    }}
                  >
                    + Level {13 + idx}: {sk}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* ── BOTTOM ACTION BUTTONS: 3 BUTTONS (MATCHING USER WIREFRAME IMAGE 2) ── */}
          <div style={{
            padding: "18px 26px",
            borderTop: t.footerBorder,
            background: t.footerBg,
            display: "grid", gridTemplateColumns: "1fr 1.1fr 1.7fr", gap: 14
          }}>
            {/* SAVE BUTTON */}
            <button
              onClick={handleSaveClick}
              style={{
                padding: "13px", borderRadius: 14, border: t.saveBtnBorder,
                background: saveSuccess ? "rgba(16, 185, 129, 0.2)" : t.saveBtnBg,
                color: saveSuccess ? "#10b981" : t.saveBtnText,
                fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 800,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s"
              }}
            >
              <Save size={16} />
              <span>{saveSuccess ? "✓ Saved Target" : "Save Preferences"}</span>
            </button>

            {/* RESET BUTTON (FULLY ACTIVATED & FUNCTIONAL) */}
            <button
              onClick={handleResetClick}
              style={{
                padding: "13px", borderRadius: 14, border: t.resetBtnBorder,
                background: t.resetBtnBg, color: t.resetBtnText,
                fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 900,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s", boxShadow: "0 4px 16px rgba(239, 68, 68, 0.12)"
              }}
            >
              <RotateCcw size={16} />
              <span>Reset to 12 Nodes</span>
            </button>

            {/* MODIFY ROADMAP BUTTON (PRIMARY ACTION) */}
            <button
              onClick={handleRunAiModification}
              disabled={isAnalyzing}
              style={{
                padding: "13px", borderRadius: 14, border: "none",
                background: "linear-gradient(135deg, #00c9a7 0%, #6c63ff 100%)",
                color: "#ffffff",
                fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900,
                cursor: isAnalyzing ? "wait" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                boxShadow: "0 8px 28px rgba(0, 201, 167, 0.4)",
                position: "relative", overflow: "hidden"
              }}
            >
              <Sparkles size={18} />
              <span>{isAnalyzing ? "Expanding Roadmap Graph..." : `Modify RoadMap (+${selectedCompany.skills.length} Nodes)`}</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Futuristic Scanning Overlay during AI Recalibration */}
          {isAnalyzing && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 1100,
              background: t.overlayBg, backdropFilter: "blur(18px)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: 24, textAlign: "center"
            }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                style={{
                  width: 76, height: 76, borderRadius: "50%",
                  border: "4px solid rgba(0, 201, 167, 0.25)",
                  borderTop: "4px solid #00c9a7",
                  boxShadow: "0 0 35px rgba(0, 201, 167, 0.6)",
                  marginBottom: 22
                }}
              />
              
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 23, fontWeight: 900, margin: "0 0 8px", color: t.overlayHeading }}>
                PathEd AI-fication Engine Active
              </h3>
              
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13.5, color: t.overlaySubtext, fontWeight: 900 }}>
                {analysisStep === 1 && `🔍 Ingesting real-time corporate hiring signals from ${selectedCompany.name}...`}
                {analysisStep === 2 && `📊 Analyzing curriculum debt vs active ${selectedRole} benchmarks...`}
                {analysisStep >= 3 && `🧠 Additively expanding roadmap graph from 12 → ${12 + selectedCompany.skills.length} Levels...`}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
