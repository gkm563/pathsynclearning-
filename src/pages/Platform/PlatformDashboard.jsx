import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import QuoteBanner from "../../components/dashboard/QuoteBanner";
import AddWidgetModal from "../../components/dashboard/AddWidgetModal";
import LockedFeatureModal from "../../components/dashboard/LockedFeatureModal";
import { 
  Sparkles, Plus, Lock, CheckCircle2, ChevronRight, 
  Flame, Award, Coins, Zap, Shield, HelpCircle, Eye, ArrowUpRight, ChevronDown, ChevronUp, ExternalLink
} from "lucide-react";

export default function PlatformDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeWidgets, setActiveWidgets] = useState([]); // Default empty workspace
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [lockedModalFeature, setLockedModalFeature] = useState(null);
  const [hoveredCardId, setHoveredCardId] = useState(null);
  
  // Expandable Career Goal Details State
  const [isGoalExpanded, setIsGoalExpanded] = useState(false);

  // Animated CRI Score (0 -> 62)
  const [criScore, setCriScore] = useState(0);

  useEffect(() => {
    let current = 0;
    const target = 62;
    const timer = setInterval(() => {
      current += 1;
      if (current >= target) {
        setCriScore(target);
        clearInterval(timer);
      } else {
        setCriScore(current);
      }
    }, 25);
    return () => clearInterval(timer);
  }, []);

  // Hovered Roadmap Node Tooltip State
  const [hoveredNode, setHoveredNode] = useState(null);

  // Student metrics
  const user = {
    name: "Rahul Kushwaha",
    degree: "B.Tech · Computer Science",
    institute: "IIT Kanpur",
    criTarget: 62,
    xp: 1340,
    coins: 2480,
    streak: 7,
    level: 2,
    goal: {
      role: "Software Engineer",
      tag: "SDE · UG Journey",
      why: "Interest in problem-solving, scalable systems & real-world impact",
      skills: ["DSA", "Programming", "DBMS", "OS", "Web Development"],
      timeline: "4 Years · Full UG",
      outcome: "Industry-ready with strong fundamentals and portfolio projects"
    }
  };

  const roadmapNodes = [
    { id: 1, label: "Programming\nBasics", done: true, topics: "5 of 5 Topics Covered", mastery: 100, current: "Pointers, Memory & Functions" },
    { id: 2, label: "Data\nStructures", done: true, topics: "4 of 4 Topics Covered", mastery: 100, current: "Arrays, Linked Lists & Trees" },
    { id: 3, label: "Algorithms", done: true, topics: "4 of 4 Topics Covered", mastery: 100, current: "Sorting, Searching & Recursion" },
    { id: 4, label: "DBMS", done: false, active: true, topics: "3 of 5 Topics Covered", mastery: 60, current: "Currently Learning: Relational Algebra & Indexing" },
    { id: 5, label: "OS\nConcepts", done: false, topics: "0 of 5 Topics Covered", mastery: 0, current: "Upcoming: Process Scheduling & Threads" },
    { id: 6, label: "Networking", done: false, topics: "0 of 4 Topics Covered", mastery: 0, current: "Upcoming: TCP/IP & HTTP Protocols" },
    { id: 7, label: "System\nDesign", done: false, topics: "0 of 6 Topics Covered", mastery: 0, current: "Upcoming: Load Balancing & Caching" },
    { id: 8, label: "Portfolio", done: false, topics: "0 of 3 Projects Built", mastery: 0, current: "Upcoming: Capstone Microservice App" },
  ];

  const communityCards = [
    { id: "mentorship", label: "Industry Mentorship", desc: "1-on-1 sessions with senior engineers from Tier-1 product tech companies.", req: "1,500 Coins or PASS", icon: "🤝", accent: "#6c63ff" },
    { id: "project-collab", label: "Project Collab", desc: "Build production apps with peers in team-based sprint environments.", req: "Intermediate Level + 1 Project", icon: "🚀", accent: "#f7971e" },
    { id: "alumni-network", label: "Alumni Network", desc: "Direct referral access to placed seniors across Microsoft, Google, and Amazon.", req: "2,000 XP or Store Pass", icon: "🌐", accent: "#00c9a7" },
    { id: "events", label: "Events & Summits", desc: "Live workshops, technical webinars & national hackathon summits.", req: "500 XP + Verified Email", icon: "🎪", accent: "#e040fb" },
    { id: "hack-squad", label: "Hack Squad", desc: "Lead or join institutional coding squads for competitive hackathons.", req: "Top 20% CRI Score", icon: "⚔️", accent: "#ef4444" }
  ];

  const techNews = [
    { 
      title: "DeepMind Releases AlphaCode 3 with Advanced Reasoning", 
      desc: "New AI model achieves competitive programming mastery surpassing 99% of human software engineers on complex algorithmic benchmarks.",
      category: "AI & ML", 
      time: "2h ago", 
      col: "#6c63ff" 
    },
    { 
      title: "React 19 Official Release Candidate Announced", 
      desc: "Features automatic memoization compiler, server actions integration, and asset loading hooks for supercharged web applications.",
      category: "Web Dev", 
      time: "4h ago", 
      col: "#00c9a7" 
    },
    { 
      title: "Quantum Computing Milestone: 1000-Qubit Processor Live", 
      desc: "Researchers demonstrate fault-tolerant quantum logic gates executing cryptography protocols with record fidelity.",
      category: "Hardware", 
      time: "6h ago", 
      col: "#f7971e" 
    }
  ];

  const handleAddWidget = (widget) => {
    if (!activeWidgets.some(w => w.id === widget.id)) {
      setActiveWidgets([...activeWidgets, widget]);
    }
  };

  const handleRemoveWidget = (widgetId) => {
    setActiveWidgets(activeWidgets.filter(w => w.id !== widgetId));
  };

  const specialActiveCards = activeWidgets.filter(w => w.specialColor);
  const standardActiveCards = activeWidgets.filter(w => !w.specialColor);

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      
      {/* 1. TOP METRICS & CAREER GOAL BANNER WITH EXPANDABLE DETAILS */}
      <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: "24px 28px", marginBottom: 28, boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}>
        
        {/* User Profile & Top Metrics Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid var(--border-light)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #6c63ff, #00c9a7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "#fff", flexShrink: 0, boxShadow: "0 6px 20px rgba(108,99,255,0.3)" }}>
              🎓
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
                  Welcome back, {user.name}!
                </h1>
                <span style={{ padding: "4px 10px", borderRadius: 20, background: "rgba(108,99,255,0.12)", border: "1px solid #6c63ff40", color: "#6c63ff", fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 700 }}>
                  LEVEL {user.level}
                </span>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "4px 0 0" }}>{user.degree} · {user.institute}</p>
            </div>
          </div>

          {/* XP, Points & Coins Metrics */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(108,99,255,0.1)", border: "1px solid #6c63ff40", padding: "10px 16px", borderRadius: 16 }}>
              <Zap size={18} color="#6c63ff" />
              <div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "var(--text-muted)", fontWeight: 700 }}>TOTAL XP</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, color: "#6c63ff" }}>{user.xp} XP</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(247,151,30,0.1)", border: "1px solid #f7971e40", padding: "10px 16px", borderRadius: 16 }}>
              <Coins size={18} color="#f7971e" />
              <div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "var(--text-muted)", fontWeight: 700 }}>COINS</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, color: "#f7971e" }}>{user.coins}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(239,68,68,0.1)", border: "1px solid #ef444440", padding: "10px 16px", borderRadius: 16 }}>
              <Flame size={18} color="#ef4444" />
              <div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "var(--text-muted)", fontWeight: 700 }}>STREAK</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, color: "#ef4444" }}>{user.streak} Days</div>
              </div>
            </div>
          </div>
        </div>

        {/* CAREER GOAL HEADER & CORE SKILLS MAPPED */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: "#6c63ff", letterSpacing: 1.5, marginBottom: 2 }}>
                YOUR CAREER GOAL
              </div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800, color: "var(--text-main)", margin: 0, display: "flex", alignItems: "center", gap: 12 }}>
                {user.goal.role}
                <span style={{ fontSize: 12, fontFamily: "'Fira Code', monospace", fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: "rgba(108,99,255,0.12)", color: "#6c63ff", border: "1px solid #6c63ff40" }}>
                  {user.goal.tag}
                </span>
              </h2>
            </div>

            {/* Expand / Collapse Button */}
            <button
              onClick={() => setIsGoalExpanded(!isGoalExpanded)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 14,
                background: "var(--bg-alt)", border: "1px solid var(--border-light)", color: "#6c63ff",
                fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {isGoalExpanded ? <>Collapse Details <ChevronUp size={16} /></> : <>Expand Details <ChevronDown size={16} /></>}
            </button>
          </div>

          {/* Mapped Skills Chips Row */}
          <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 16, padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: "var(--text-muted)", letterSpacing: 1 }}>
              CORE SKILLS MAPPED
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {user.goal.skills.map((sk, idx) => (
                <span key={idx} style={{ padding: "6px 14px", borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border-light)", fontSize: 12, fontWeight: 700, color: "#6c63ff" }}>
                  {sk}
                </span>
              ))}
            </div>
          </div>

          {/* EXPANDED 4-CARD CAREER DETAILS GRID (Matching Reference UI Image) */}
          <AnimatePresence>
            {isGoalExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                  
                  {/* Card 1: Target Role */}
                  <div style={{ background: "rgba(108,99,255,0.06)", border: "1.5px solid #6c63ff30", borderRadius: 18, padding: 18 }}>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: "#6c63ff", letterSpacing: 1, marginBottom: 8, textAlign: "center" }}>
                      TARGET ROLE
                    </div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "#6c63ff", textAlign: "center" }}>
                      {user.goal.role}
                    </div>
                  </div>

                  {/* Card 2: Timeline */}
                  <div style={{ background: "rgba(0,201,167,0.06)", border: "1.5px solid #00c9a730", borderRadius: 18, padding: 18 }}>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: "#00c9a7", letterSpacing: 1, marginBottom: 8, textAlign: "center" }}>
                      TIMELINE
                    </div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "#00c9a7", textAlign: "center" }}>
                      {user.goal.timeline}
                    </div>
                  </div>

                  {/* Card 3: Motivation */}
                  <div style={{ background: "rgba(247,151,30,0.06)", border: "1.5px solid #f7971e30", borderRadius: 18, padding: 18 }}>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: "#f7971e", letterSpacing: 1, marginBottom: 8, textAlign: "center" }}>
                      MOTIVATION
                    </div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: "var(--text-main)", textAlign: "center", lineHeight: 1.4 }}>
                      {user.goal.why}
                    </div>
                  </div>

                  {/* Card 4: Expected Outcome */}
                  <div style={{ background: "rgba(224,64,251,0.06)", border: "1.5px solid #e040fb30", borderRadius: 18, padding: 18 }}>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: "#e040fb", letterSpacing: 1, marginBottom: 8, textAlign: "center" }}>
                      EXPECTED OUTCOME
                    </div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: "var(--text-main)", textAlign: "center", lineHeight: 1.4 }}>
                      {user.goal.outcome}
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* 2. EXPERIENCE-BASED AI DAILY MOTIVATIONAL QUOTE BANNER */}
      <QuoteBanner userLevel={user.level} userStreak={user.streak} />

      {/* 3. CRI SCORE GAUGE & ACTIVITY HEATMAP */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginBottom: 28 }}>
        
        {/* CRI Score Gauge Card (Animated 0 -> 62%) */}
        <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 20, padding: 24, textAlign: "center", position: "relative" }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 700, color: "#6c63ff", letterSpacing: 1, marginBottom: 12 }}>
            CAREER READINESS INDEX (CRI)
          </div>
          
          <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto 12px" }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="54" fill="none" stroke="var(--border-light)" strokeWidth="10" />
              <circle 
                cx="70" cy="70" r="54" fill="none" stroke="#6c63ff" strokeWidth="10" 
                strokeDasharray="339" strokeDashoffset={339 - (339 * criScore) / 100} 
                strokeLinecap="round" transform="rotate(-90 70 70)" 
                style={{ transition: "stroke-dashoffset 0.1s linear" }} 
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 36, fontWeight: 800, color: "#6c63ff", lineHeight: 1 }}>{criScore}%</span>
              <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: "var(--text-muted)", letterSpacing: 0.5 }}>TARGET: 100%</span>
            </div>
          </div>

          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Top 15% percentile among B.Tech candidates nationwide.
          </div>
        </div>

        {/* Career Journey Activity Heatmap */}
        <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 20, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 700, color: "#00c9a7", letterSpacing: 1 }}>
              CONSISTENCY HEATMAP
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Last 14 Weeks</span>
          </div>

          {/* Heatmap Cell Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(14, 1fr)", gap: 6, marginBottom: 16 }}>
            {Array.from({ length: 98 }).map((_, idx) => {
              const activeLevels = ["var(--bg-alt)", "rgba(108,99,255,0.3)", "rgba(108,99,255,0.6)", "#6c63ff", "#00c9a7"];
              const randomCol = activeLevels[idx % 5];
              return (
                <div
                  key={idx}
                  style={{ width: "100%", aspectRatio: "1", borderRadius: 4, background: randomCol, transition: "transform 0.2s" }}
                  title={`Day ${idx + 1}: Activity recorded`}
                />
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", fontFamily: "'Fira Code', monospace" }}>
            <span>Less Active</span>
            <div style={{ display: "flex", gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--bg-alt)" }} />
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(108,99,255,0.4)" }} />
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "#6c63ff" }} />
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "#00c9a7" }} />
            </div>
            <span>More Active</span>
          </div>
        </div>
      </div>

      {/* 4. VISUAL CURVY ROAD SKILL NODE ROADMAP TIMELINE WITH NODE HOVER TOOLTIPS */}
      <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 20, padding: 24, marginBottom: 28, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 700, color: "#6c63ff", letterSpacing: 1 }}>
            4-YEAR CURVY ROAD SKILL TIMELINE
          </div>
          
          {/* Full View Button (Links to /roadmap) */}
          <button
            onClick={() => navigate("/roadmap")}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 12,
              background: "rgba(108,99,255,0.12)", border: "1px solid #6c63ff40", color: "#6c63ff",
              fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer"
            }}
          >
            Full View <ArrowUpRight size={15} />
          </button>
        </div>

        {/* Curvy Road View Container */}
        <div style={{ position: "relative", width: "100%", padding: "30px 0 20px" }}>
          
          {/* SVG Animated Curvy Road Line */}
          <svg width="100%" height="80" viewBox="0 0 800 80" preserveAspectRatio="none" style={{ position: "absolute", top: 10, left: 0, width: "100%", pointerEvents: "none" }}>
            <path
              d="M 40 40 Q 150 10, 250 40 T 450 40 T 650 40 T 760 40"
              fill="none"
              stroke="#6c63ff30"
              strokeWidth="6"
              strokeDasharray="10 6"
            />
            <path
              d="M 40 40 Q 150 10, 250 40 T 450 40 T 650 40 T 760 40"
              fill="none"
              stroke="#6c63ff"
              strokeWidth="4"
              strokeDasharray="200"
              strokeDashoffset="0"
            />
          </svg>

          {/* Connected Skill Nodes */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 2 }}>
            {roadmapNodes.map((node) => (
              <div
                key={node.id}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
              >
                {/* Node Circle */}
                <motion.div
                  whileHover={{ scale: 1.25, y: -4 }}
                  style={{
                    width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: node.active ? 10 : 13,
                    background: node.done ? "linear-gradient(135deg, #00c9a7, #6c63ff)" : node.active ? "linear-gradient(135deg, #6c63ff, #f7971e)" : "var(--bg-alt)",
                    color: node.done || node.active ? "#ffffff" : "var(--text-muted)",
                    border: !node.done && !node.active ? "2px solid var(--border-light)" : "none",
                    boxShadow: node.done ? "0 4px 14px rgba(0,201,167,0.4)" : node.active ? "0 0 0 6px rgba(108,99,255,0.25)" : "none"
                  }}
                >
                  {node.done ? "✓" : node.active ? "NOW" : node.id}
                </motion.div>

                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: node.done ? "#00c9a7" : node.active ? "#6c63ff" : "var(--text-muted)", textAlign: "center", marginTop: 8, whiteSpace: "pre-line", fontWeight: node.active ? 700 : 500 }}>
                  {node.label}
                </div>

                {/* Floating Interactive Hover Tooltip Dialog Box with Arrow */}
                <AnimatePresence>
                  {hoveredNode?.id === node.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: -10, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      style={{
                        position: "absolute", bottom: "100%", width: 220,
                        background: "var(--bg-card)", border: "1.5px solid #6c63ff",
                        borderRadius: 16, padding: 14, boxShadow: "0 15px 35px rgba(0,0,0,0.3)",
                        zIndex: 50, pointerEvents: "none"
                      }}
                    >
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, color: "var(--text-main)", marginBottom: 4 }}>
                        {node.label.replace("\n", " ")}
                      </div>
                      <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "#6c63ff", fontWeight: 700, marginBottom: 6 }}>
                        MASTERY: {node.mastery}% • {node.topics}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>
                        {node.current}
                      </div>

                      {/* Tooltip Down Arrow */}
                      <div style={{ position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%) rotate(45deg)", width: 14, height: 14, background: "var(--bg-card)", borderRight: "1.5px solid #6c63ff", borderBottom: "1.5px solid #6c63ff" }} />
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. WORKSPACE MODULE (SPECIAL CARDS ROW + STANDARD CARDS GRID + NO CROSS ICON) */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
              Custom Workspace
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>Add or configure feature widgets below. Remove or manage via the + button.</p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 14,
              background: "linear-gradient(135deg, #6c63ff, #00c9a7)", border: "none", color: "#ffffff",
              fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, cursor: "pointer",
              boxShadow: "0 6px 20px rgba(108,99,255,0.3)"
            }}
          >
            <Plus size={16} /> Add Feature Widget
          </button>
        </div>

        {/* Dedicated Row for Special Colored Cards */}
        {specialActiveCards.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: "#b45309", letterSpacing: 1, marginBottom: 10 }}>
              SPECIAL FEATURE CARDS
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {specialActiveCards.map(card => (
                <div
                  key={card.id}
                  onMouseEnter={() => setHoveredCardId(card.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  style={{
                    background: card.bg, border: `2px solid ${card.border}`, borderRadius: 20, padding: 20,
                    position: "relative", overflow: "hidden", transition: "all 0.3s ease",
                    transform: hoveredCardId === card.id ? "translateY(-4px)" : "none",
                    boxShadow: hoveredCardId === card.id ? `0 12px 30px ${card.accent}30` : "none"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>{card.icon}</span>
                    <span style={{ fontSize: 9, fontFamily: "'Fira Code', monospace", padding: "2px 8px", borderRadius: 12, background: card.accent, color: "#ffffff", fontWeight: 700 }}>
                      SPECIAL
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>{card.label}</h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4, margin: 0 }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Standard Workspace Cards Grid (Cross icon removed as requested!) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {standardActiveCards.map(card => (
            <div
              key={card.id}
              onMouseEnter={() => setHoveredCardId(card.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              style={{
                background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 20, padding: 20,
                position: "relative", overflow: "hidden", transition: "all 0.3s ease",
                transform: hoveredCardId === card.id ? "translateY(-4px)" : "none",
                boxShadow: hoveredCardId === card.id ? "0 12px 30px rgba(108,99,255,0.15)" : "none"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 28 }}>{card.icon}</span>
              </div>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>{card.label}</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4, margin: 0 }}>
                {card.desc}
              </p>
            </div>
          ))}

          {/* Default Empty State Card */}
          <div
            onClick={() => setIsAddModalOpen(true)}
            style={{
              background: "var(--bg-alt)", border: "2px dashed var(--border-light)", borderRadius: 20, padding: 30,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              cursor: "pointer", minHeight: 180, transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6c63ff"; e.currentTarget.style.background = "rgba(108,99,255,0.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.background = "var(--bg-alt)"; }}
          >
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(108,99,255,0.12)", border: "1px solid #6c63ff40", display: "flex", alignItems: "center", justifyContent: "center", color: "#6c63ff", marginBottom: 12 }}>
              <Plus size={22} />
            </div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, color: "var(--text-main)" }}>Add Feature Widget</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Click to browse available modules</div>
          </div>
        </div>
      </div>

      {/* 6. COLLABORATION & COMMUNITIES SECTION (STORE UNLOCK POPUP FLOW) */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
            Collaboration & Communities
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>Connect with industry mentors, peer squads, and alumni.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {communityCards.map(item => (
            <div
              key={item.id}
              onClick={() => setLockedModalFeature(item)}
              style={{
                background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 18, padding: 20,
                cursor: "pointer", transition: "all 0.3s ease", position: "relative"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = item.accent; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 28 }}>{item.icon}</span>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(239,68,68,0.15)", border: "1px solid #ef4444", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
                  <Lock size={13} />
                </div>
              </div>

              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, color: "var(--text-main)", marginBottom: 4 }}>{item.label}</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4, margin: "0 0 12px" }}>{item.desc}</p>

              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, fontWeight: 700, color: item.accent, display: "flex", alignItems: "center", gap: 4 }}>
                UNLOCK REQUIREMENT <ChevronRight size={10} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. LIVE TECH NEWS FEED (MINI DESCRIPTIONS + READ MORE BUTTONS) */}
      <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 20, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 700, color: "#6c63ff", letterSpacing: 1 }}>
            LIVE TECH & ENGINEERING HEADLINES
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Updated hourly</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {techNews.map((news, idx) => (
            <div key={idx} style={{ background: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 16, padding: 18, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ padding: "2px 8px", borderRadius: 6, background: `${news.col}20`, color: news.col, fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700 }}>
                    {news.category}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{news.time}</span>
                </div>
                <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, color: "var(--text-main)", margin: "0 0 6px", lineHeight: 1.4 }}>
                  {news.title}
                </h4>
                <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.5, margin: "0 0 16px" }}>
                  {news.desc}
                </p>
              </div>

              {/* Read More Link Button (Routes to /technews) */}
              <button
                onClick={() => navigate("/technews")}
                style={{
                  display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
                  color: news.col, fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", padding: 0
                }}
              >
                Read More <ChevronRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Widget Popup Modal */}
      <AddWidgetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        activeWidgets={activeWidgets}
        onAddWidget={handleAddWidget}
        onRemoveWidget={handleRemoveWidget}
      />

      {/* Locked Feature Store Unlock Popup Modal */}
      <LockedFeatureModal
        feature={lockedModalFeature}
        isOpen={!!lockedModalFeature}
        onClose={() => setLockedModalFeature(null)}
      />

    </DashboardLayout>
  );
}
