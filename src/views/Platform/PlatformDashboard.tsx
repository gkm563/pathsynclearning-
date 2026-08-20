"use client";

import { routes } from "@/lib/routes";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QuoteBanner from "../../components/dashboard/QuoteBanner";
import AddWidgetModal from "../../components/dashboard/AddWidgetModal";
import LockedFeatureModal from "../../components/dashboard/LockedFeatureModal";
import { useStudent } from "../../components/dashboard/StudentContext";
import { 
  Sparkles, Plus, Lock, CheckCircle2, ChevronRight, 
  Flame, Award, Coins, Zap, Shield, HelpCircle, Eye, ArrowUpRight, ChevronDown, ChevronUp, Play, Bot, RefreshCw
} from "lucide-react";



export default function PlatformDashboard() {
  const router = useRouter();
  const [activeWidgets, setActiveWidgets] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [lockedModalFeature, setLockedModalFeature] = useState<any>(null);
  const [hoveredCardId, setHoveredCardId] = useState<any>(null);
  const [isGoalExpanded, setIsGoalExpanded] = useState(false);

  const student = useStudent();
  const devPlan = student.plan || "free";
  const [criScore, setCriScore] = useState(0);

  useEffect(() => {
    let current = 0;
    const target = Math.max(0, Math.min(100, Number(student.cri) || 0));
    if (target === 0) {
      setCriScore(0);
      return;
    }
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
  }, [student.cri]);

  // Hovered Roadmap Node Tooltip State
  const [hoveredNode, setHoveredNode] = useState<any>(null);

  // Live Tech News API State
  const [liveNews, setLiveNews] = useState<any[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  // AI Career Guide Insights State
  const [aiInsights, setAiInsights] = useState([
    { icon: "🎯", text: "Solve 2 BST & Graph problems today to boost DSA competency to 75%." },
    { icon: "⚡", text: "Review Indexing & B-Trees in DBMS before your upcoming mock assessment." },
    { icon: "🚀", text: "Push your responsive card component to GitHub to raise your CRI score by +3%." }
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch Live Tech News from Dev.to API / Fallback
  useEffect(() => {
    const fetchLiveNews = async () => {
      setNewsLoading(true);
      try {
        const res = await fetch("https://dev.to/api/articles?per_page=3&top=1");
        const data = await res.json();
        if (data && data.length > 0) {
          const formatted = data.map((item, idx) => ({
            title: item.title,
            desc: item.description || "Click read more to view full engineering breakdown and code examples.",
            category: item.tag_list?.[0]?.toUpperCase() || "TECH",
            time: "Live Feed",
            url: item.url,
            col: idx === 0 ? "#6c63ff" : idx === 1 ? "#00c9a7" : "#f7971e"
          }));
          setLiveNews(formatted);
          setNewsLoading(false);
          return;
        }
      } catch (e) {
        // Fallback live news dataset
      }

      setLiveNews([
        { 
          title: "DeepMind Releases AlphaCode 3 with Advanced Reasoning", 
          desc: "New AI model achieves competitive programming mastery surpassing 99% of human software engineers on complex benchmarks.",
          category: "AI & ML", time: "Live", url: "https://dev.to", col: "#6c63ff" 
        },
        { 
          title: "React 19 Official Release Candidate Announced", 
          desc: "Features automatic memoization compiler, server actions integration, and asset loading hooks for supercharged web apps.",
          category: "WEB DEV", time: "Live", url: "https://dev.to", col: "#00c9a7" 
        },
        { 
          title: "Quantum Computing Milestone: 1000-Qubit Processor Live", 
          desc: "Researchers demonstrate fault-tolerant quantum logic gates executing cryptography protocols with record fidelity.",
          category: "HARDWARE", time: "Live", url: "https://dev.to", col: "#f7971e" 
        }
      ]);
      setNewsLoading(false);
    };

    fetchLiveNews();
  }, []);

  // Fetch AI Career Assistant Daily Reminders via server route (keeps GEMINI_API_KEY private)
  const fetchAiInsights = async () => {
    setAiLoading(true);
    try {
      const response = await fetch("/api/ai/insights", { method: "POST" });
      const data = await response.json();
      if (Array.isArray(data.insights) && data.insights.length >= 3) {
        setAiInsights(data.insights.slice(0, 3));
        setAiLoading(false);
        return;
      }
    } catch {
      // fall through to local reminders
    }

    setAiInsights([
      { icon: "🎯", text: "Solve 2 BST & Graph problems today to boost DSA competency to 75%." },
      { icon: "⚡", text: "Review Indexing & B-Trees in DBMS before your upcoming mock assessment." },
      { icon: "🚀", text: "Push your responsive card component to GitHub to raise your CRI score by +3%." }
    ]);
    setAiLoading(false);
  };

  // Student metrics from Neon + Clerk
  const user = {
    name: student.name,
    degree: student.degree,
    institute: student.institute,
    criTarget: student.cri,
    xp: student.xp,
    coins: student.coins,
    streak: student.streak,
    level: student.level,
    goal: student.goal,
    skillsProgress: student.skillsProgress,
  };

  const dailyChallenges = student.dailyChallenges;

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
    <>
      
      {/* 1. TOP METRICS & CAREER GOAL BANNER WITH EXPANDABLE DETAILS */}
      <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: "28px 32px", marginBottom: 32, boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}>
        
        {/* User Profile & Top Metrics Bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: 24, paddingBottom: 24, borderBottom: "1.5px solid var(--border-light)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #6c63ff, #00c9a7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, color: "#fff", flexShrink: 0, boxShadow: "0 6px 20px rgba(108,99,255,0.3)" }}>
              🎓
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
                  Welcome back, {user.name}!
                </h1>
                <span style={{ padding: "5px 12px", borderRadius: 20, background: "rgba(108,99,255,0.14)", border: "1.5px solid #6c63ff50", color: "#6c63ff", fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 800 }}>
                  LEVEL {user.level}
                </span>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: 15, margin: "6px 0 0", fontWeight: 500 }}>{user.degree} · {user.institute}</p>
            </div>
          </div>

          {/* XP, Points & Coins Metrics */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(108,99,255,0.1)", border: "1.5px solid #6c63ff40", padding: "12px 20px", borderRadius: 18 }}>
              <Zap size={22} color="#6c63ff" />
              <div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "var(--text-muted)", fontWeight: 800, letterSpacing: 0.5 }}>TOTAL XP</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "#6c63ff" }}>{user.xp} XP</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(247,151,30,0.1)", border: "1.5px solid #f7971e40", padding: "12px 20px", borderRadius: 18 }}>
              <Coins size={22} color="#f7971e" />
              <div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "var(--text-muted)", fontWeight: 800, letterSpacing: 0.5 }}>COINS</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "#f7971e" }}>{user.coins}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(239,68,68,0.1)", border: "1.5px solid #ef444440", padding: "12px 20px", borderRadius: 18 }}>
              <Flame size={22} color="#ef4444" />
              <div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "var(--text-muted)", fontWeight: 800, letterSpacing: 0.5 }}>STREAK</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "#ef4444" }}>{user.streak} Days</div>
              </div>
            </div>
          </div>
        </div>

        {/* CAREER GOAL HEADER & CORE SKILLS MAPPED */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 800, color: "#6c63ff", letterSpacing: 1.2, marginBottom: 2 }}>
                YOUR CAREER GOAL
              </div>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, fontWeight: 800, color: "var(--text-main)", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
                {user.goal.role}
                <span style={{ fontSize: 11, fontFamily: "'Fira Code', monospace", fontWeight: 800, padding: "4px 10px", borderRadius: 18, background: "rgba(108,99,255,0.12)", color: "#6c63ff", border: "1px solid #6c63ff40" }}>
                  {user.goal.tag}
                </span>
              </h2>
            </div>

            {/* Expand / Collapse Details Button */}
            <button
              onClick={() => setIsGoalExpanded(!isGoalExpanded)}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 14,
                background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "#6c63ff",
                fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 800, cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              {isGoalExpanded ? <>Collapse Details <ChevronUp size={16} /></> : <>Expand Details <ChevronDown size={16} /></>}
            </button>
          </div>

          {/* Mapped Skills Chips Row */}
          <div style={{ background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", borderRadius: 16, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 800, color: "var(--text-muted)", letterSpacing: 1.2 }}>
              CORE SKILLS MAPPED
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              {user.goal.skills.map((sk, idx) => (
                <span key={idx} style={{ padding: "5px 12px", borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border-light)", fontSize: 12.5, fontWeight: 700, color: "#6c63ff" }}>
                  {sk}
                </span>
              ))}
            </div>
          </div>

          {/* EXPANDED 4-CARD CAREER DETAILS GRID */}
          <AnimatePresence>
            {isGoalExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                  
                  {/* Card 1: Target Role */}
                  <div style={{ background: "rgba(108,99,255,0.06)", border: "1.5px solid #6c63ff30", borderRadius: 16, padding: 16 }}>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10.5, fontWeight: 800, color: "#6c63ff", letterSpacing: 1.2, marginBottom: 6, textAlign: "center" }}>
                      TARGET ROLE
                    </div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, color: "#6c63ff", textAlign: "center" }}>
                      {user.goal.role}
                    </div>
                  </div>

                  {/* Card 2: Timeline */}
                  <div style={{ background: "rgba(0,201,167,0.06)", border: "1.5px solid #00c9a730", borderRadius: 16, padding: 16 }}>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10.5, fontWeight: 800, color: "#00c9a7", letterSpacing: 1.2, marginBottom: 6, textAlign: "center" }}>
                      TIMELINE
                    </div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, color: "#00c9a7", textAlign: "center" }}>
                      {user.goal.timeline}
                    </div>
                  </div>

                  {/* Card 3: Motivation */}
                  <div style={{ background: "rgba(247,151,30,0.06)", border: "1.5px solid #f7971e30", borderRadius: 16, padding: 16 }}>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10.5, fontWeight: 800, color: "#f7971e", letterSpacing: 1.2, marginBottom: 6, textAlign: "center" }}>
                      MOTIVATION
                    </div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600, color: "var(--text-main)", textAlign: "center", lineHeight: 1.4 }}>
                      {user.goal.why}
                    </div>
                  </div>

                  {/* Card 4: Expected Outcome */}
                  <div style={{ background: "rgba(224,64,251,0.06)", border: "1.5px solid #e040fb30", borderRadius: 16, padding: 16 }}>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10.5, fontWeight: 800, color: "#e040fb", letterSpacing: 1.2, marginBottom: 6, textAlign: "center" }}>
                      EXPECTED OUTCOME
                    </div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600, color: "var(--text-main)", textAlign: "center", lineHeight: 1.4 }}>
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

      {/* 3. RESTORED CRI GAUGE CARD + AI CAREER GUIDE INSIGHTS CARD (Side-by-side right below Quote Banner) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 24, marginBottom: 32 }}>
        
        {/* RESTORED CRI SCORE GAUGE CARD */}
        <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 28, textAlign: "center", position: "relative" }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 800, color: "#6c63ff", letterSpacing: 1.5, marginBottom: 16 }}>
            CAREER READINESS INDEX (CRI)
          </div>
          
          <div style={{ position: "relative", width: 150, height: 150, margin: "0 auto 16px" }}>
            <svg width="150" height="150" viewBox="0 0 150 150">
              <circle cx="75" cy="75" r="58" fill="none" stroke="var(--border-light)" strokeWidth="12" />
              <circle 
                cx="75" cy="75" r="58" fill="none" stroke="#6c63ff" strokeWidth="12" 
                strokeDasharray="364" strokeDashoffset={364 - (364 * criScore) / 100} 
                strokeLinecap="round" transform="rotate(-90 75 75)" 
                style={{ transition: "stroke-dashoffset 0.1s linear" }} 
              />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 40, fontWeight: 800, color: "#6c63ff", lineHeight: 1 }}>{criScore}%</span>
              <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "var(--text-muted)", letterSpacing: 0.5, marginTop: 2 }}>TARGET: 100%</span>
            </div>
          </div>

          <div style={{ fontSize: 14, color: "var(--text-main)", fontWeight: 600 }}>
            {student.cri > 0
              ? `Career readiness at ${student.cri}% — keep shipping challenges to climb higher.`
              : "Complete onboarding and challenges to build your Career Readiness Index."}
          </div>
        </div>

        {/* AI CAREER GUIDE / INSIGHTS CARD */}
        <div style={{ background: "linear-gradient(135deg, rgba(108,99,255,0.06), var(--bg-card))", border: "1.5px solid #6c63ff40", borderRadius: 24, padding: 28, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Bot size={22} color="#6c63ff" />
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 800, color: "#6c63ff", letterSpacing: 1.5 }}>
                  AI CAREER GUIDE & REMINDERS
                </div>
              </div>

              <button
                onClick={fetchAiInsights}
                disabled={aiLoading}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6, fontSize: 12, opacity: aiLoading ? 0.5 : 1 }}
                title="Refresh AI Insights"
              >
                <RefreshCw size={14} style={{ animation: aiLoading ? "spin 1s linear infinite" : "none" }} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {aiInsights.map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 16, padding: "12px 16px" }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <div style={{ fontSize: 14, color: "var(--text-main)", fontWeight: 600, lineHeight: 1.4 }}>
                    {item.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16, fontSize: 12, color: "#6c63ff", fontFamily: "'Fira Code', monospace", fontWeight: 700 }}>
            ⚡ AI guidance synced with your {user.goal.role} goal
          </div>
        </div>

      </div>

      {/* 4. YOUR LEARNING JOURNEY & CONSISTENCY HEATMAP MATRIX */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 24, marginBottom: 32 }}>
        
        {/* PANEL A: YOUR LEARNING JOURNEY */}
        <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 800, color: "#6c63ff", letterSpacing: 1.5 }}>
              YOUR LEARNING JOURNEY
            </div>
            <span style={{ padding: "4px 12px", borderRadius: 12, background: "rgba(0,201,167,0.12)", border: "1px solid #00c9a740", color: "#00c9a7", fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 800 }}>
              Daily compounding, no burnout
            </span>
          </div>

          {/* Skill Progress Bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
            {user.skillsProgress.map((sk, idx) => (
              <div key={idx}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 700, color: "var(--text-main)" }}>{sk.label}</span>
                  <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 14, fontWeight: 800, color: sk.col }}>{sk.pct}%</span>
                </div>
                <div style={{ height: 10, borderRadius: 6, background: "var(--bg-alt)", overflow: "hidden", border: "1px solid var(--border-light)" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${sk.pct}%` }}
                    transition={{ duration: 1.2, delay: idx * 0.1 }}
                    style={{ height: "100%", background: `linear-gradient(90deg, ${sk.col}, ${sk.col}88)`, borderRadius: 6 }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 3 Quick Stat Cards Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 16, padding: 14, textAlign: "center" }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "var(--text-muted)", fontWeight: 800, letterSpacing: 1 }}>PROGRESS</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: "#6c63ff", marginTop: 4 }}>8 / 8</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Skills · 24 topics</div>
            </div>

            <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 16, padding: 14, textAlign: "center" }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "var(--text-muted)", fontWeight: 800, letterSpacing: 1 }}>XP EARNED</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 800, color: "#f7971e", marginTop: 4 }}>1,340</div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>This week</div>
            </div>

            <div style={{ background: "rgba(247,151,30,0.08)", border: "1px solid #f7971e40", borderRadius: 16, padding: 14, textAlign: "center" }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "#f7971e", fontWeight: 800, letterSpacing: 1 }}>NEXT SESSION</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 800, color: "var(--text-main)", marginTop: 4 }}>Data Structures</div>
              <div style={{ fontSize: 11, color: "#f7971e", fontWeight: 700, marginTop: 2 }}>45 min focused</div>
            </div>
          </div>

        </div>

        {/* PANEL B: CONSISTENCY HEATMAP & STREAK MATRIX */}
        <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 28, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 800, color: "#00c9a7", letterSpacing: 1.5 }}>
                CONSISTENCY HEATMAP — 12 WEEKS
              </div>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>98 Active Days</span>
            </div>

            {/* Heatmap Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(14, 1fr)", gap: 6, marginBottom: 20 }}>
              {Array.from({ length: 98 }).map((_, idx) => {
                const activeLevels = ["var(--bg-alt)", "rgba(108,99,255,0.3)", "rgba(108,99,255,0.6)", "#6c63ff", "#00c9a7"];
                const randomCol = activeLevels[idx % 5];
                return (
                  <div
                    key={idx}
                    style={{ width: "100%", aspectRatio: "1", borderRadius: 4, background: randomCol, transition: "transform 0.2s" }}
                    title={`Day ${idx + 1}: Code activity verified`}
                  />
                );
              })}
            </div>
          </div>

          {/* 4 Streak Stat Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 16, padding: 14, textAlign: "center" }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "var(--text-muted)", fontWeight: 800, letterSpacing: 1 }}>CURRENT STREAK</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: "#f7971e", marginTop: 2 }}>7 days</div>
            </div>

            <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 16, padding: 14, textAlign: "center" }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "var(--text-muted)", fontWeight: 800, letterSpacing: 1 }}>BEST STREAK</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: "#6c63ff", marginTop: 2 }}>14 days</div>
            </div>

            <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 16, padding: 14, textAlign: "center" }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "var(--text-muted)", fontWeight: 800, letterSpacing: 1 }}>THIS MONTH</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: "#00c9a7", marginTop: 2 }}>22 / 30</div>
            </div>

            <div style={{ background: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 16, padding: 14, textAlign: "center" }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "var(--text-muted)", fontWeight: 800, letterSpacing: 1 }}>TOTAL DAYS</div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: "#e040fb", marginTop: 2 }}>47 days</div>
            </div>
          </div>
        </div>

      </div>

      {/* 5. TODAY'S CHALLENGES CARD GRID SECTION */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 800, color: "#f7971e", letterSpacing: 1.5, marginBottom: 4 }}>
              ⚡ TODAY'S CHALLENGES
            </div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
              4 tasks · Keep your streak alive 🔥
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ padding: "6px 16px", borderRadius: 20, background: "rgba(247,151,30,0.12)", border: "1px solid #f7971e40", color: "#f7971e", fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 800 }}>
              7-day streak active
            </span>
            <button
              onClick={() => router.push(routes.app.challenges)}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 14,
                background: "rgba(247,151,30,0.12)", border: "1.5px solid #f7971e40", color: "#f7971e",
                fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, cursor: "pointer"
              }}
            >
              View All ↗
            </button>
          </div>
        </div>

        {/* 4 Daily Challenge Task Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 18 }}>
          {dailyChallenges.map((task, idx) => (
            <div
              key={idx}
              onClick={() => router.push(routes.app.challenges)}
              style={{
                background: task.bg, border: `1.5px solid ${task.border}`, borderRadius: 22, padding: 22,
                display: "flex", flexDirection: "column", justifyContent: "space-between",
                boxShadow: "0 8px 24px rgba(0,0,0,0.03)", transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer"
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = `0 12px 32px ${task.border}60`}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.03)"}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <span style={{ fontSize: 32 }}>{task.icon}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ padding: "3px 8px", borderRadius: 8, background: "var(--bg-card)", border: "1px solid var(--border-light)", fontSize: 11, fontWeight: 700, color: "var(--text-main)" }}>
                      {task.diff}
                    </span>
                    <span style={{ padding: "3px 8px", borderRadius: 8, background: task.col, color: "#fff", fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 800 }}>
                      +{task.xp} XP
                    </span>
                  </div>
                </div>

                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "var(--text-main)", marginBottom: 8, lineHeight: 1.3 }}>
                  {task.title}
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600, margin: "0 0 16px" }}>
                  {task.category} · {task.time}
                </p>
              </div>

              <button
                onClick={e => { e.stopPropagation(); router.push(routes.app.challenges); }}
                style={{
                  width: "100%", padding: "12px", borderRadius: 14,
                  background: task.isStarted ? task.col : "var(--bg-card)",
                  color: task.isStarted ? "#ffffff" : task.col,
                  border: task.isStarted ? "none" : `1.5px solid ${task.col}`,
                  fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: task.isStarted ? `0 6px 18px ${task.col}40` : "none"
                }}
              >
                <Play size={15} fill={task.isStarted ? "#fff" : task.col} /> {task.isStarted ? "Resume Challenge" : "Start Challenge"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 6. VISUAL CURVY ROAD SKILL NODE ROADMAP TIMELINE WITH NODE HOVER TOOLTIPS */}
      <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 28, marginBottom: 32, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 800, color: "#6c63ff", letterSpacing: 1.5 }}>
            4-YEAR CURVY ROAD SKILL TIMELINE
          </div>
          
          {/* Full View Button (Links to /roadmap) */}
          <button
            onClick={() => router.push(routes.app.roadmap)}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 14,
              background: "rgba(108,99,255,0.12)", border: "1.5px solid #6c63ff40", color: "#6c63ff",
              fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, cursor: "pointer"
            }}
          >
            Full View <ArrowUpRight size={16} />
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
                    width: 52, height: 52, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: node.active ? 11 : 14,
                    background: node.done ? "linear-gradient(135deg, #00c9a7, #6c63ff)" : node.active ? "linear-gradient(135deg, #6c63ff, #f7971e)" : "var(--bg-alt)",
                    color: node.done || node.active ? "#ffffff" : "var(--text-muted)",
                    border: !node.done && !node.active ? "2px solid var(--border-light)" : "none",
                    boxShadow: node.done ? "0 4px 14px rgba(0,201,167,0.4)" : node.active ? "0 0 0 6px rgba(108,99,255,0.25)" : "none"
                  }}
                >
                  {node.done ? "✓" : node.active ? "NOW" : node.id}
                </motion.div>

                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: node.done ? "#00c9a7" : node.active ? "#6c63ff" : "var(--text-muted)", textAlign: "center", marginTop: 10, whiteSpace: "pre-line", fontWeight: node.active ? 800 : 600 }}>
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
                        position: "absolute", bottom: "100%", width: 240,
                        background: "var(--bg-card)", border: "1.5px solid #6c63ff",
                        borderRadius: 18, padding: 16, boxShadow: "0 15px 35px rgba(0,0,0,0.3)",
                        zIndex: 50, pointerEvents: "none"
                      }}
                    >
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, color: "var(--text-main)", marginBottom: 4 }}>
                        {node.label.replace("\n", " ")}
                      </div>
                      <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#6c63ff", fontWeight: 800, marginBottom: 8 }}>
                        MASTERY: {node.mastery}% • {node.topics}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4, fontWeight: 500 }}>
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

      {/* 7. WORKSPACE MODULE (SPECIAL CARDS ROW + STANDARD CARDS GRID + NO CROSS ICON) */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
              Custom Workspace
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "4px 0 0" }}>Add or configure feature widgets below. Manage widgets via the + button.</p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", borderRadius: 16,
              background: "linear-gradient(135deg, #6c63ff, #00c9a7)", border: "none", color: "#ffffff",
              fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, cursor: "pointer",
              boxShadow: "0 6px 20px rgba(108,99,255,0.3)"
            }}
          >
            <Plus size={18} /> Add Feature Widget
          </button>
        </div>

        {/* Dedicated Row for Special Colored Cards */}
        {specialActiveCards.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 800, color: "#b45309", letterSpacing: 1.5, marginBottom: 12 }}>
              SPECIAL FEATURE CARDS
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
              {specialActiveCards.map(card => (
                <div
                  key={card.id}
                  onMouseEnter={() => setHoveredCardId(card.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  style={{
                    background: card.bg, border: `2px solid ${card.border}`, borderRadius: 22, padding: 22,
                    position: "relative", overflow: "hidden", transition: "all 0.3s ease",
                    transform: hoveredCardId === card.id ? "translateY(-4px)" : "none",
                    boxShadow: hoveredCardId === card.id ? `0 12px 30px ${card.accent}30` : "none"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <span style={{ fontSize: 32 }}>{card.icon}</span>
                    <span style={{ fontSize: 10, fontFamily: "'Fira Code', monospace", padding: "3px 10px", borderRadius: 12, background: card.accent, color: "#ffffff", fontWeight: 800 }}>
                      SPECIAL
                    </span>
                  </div>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, color: "var(--text-main)", marginBottom: 8 }}>{card.label}</h3>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Standard Workspace Cards Grid (Cross icon removed as requested!) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
          {standardActiveCards.map(card => (
            <div
              key={card.id}
              onMouseEnter={() => setHoveredCardId(card.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              style={{
                background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 22, padding: 22,
                position: "relative", overflow: "hidden", transition: "all 0.3s ease",
                transform: hoveredCardId === card.id ? "translateY(-4px)" : "none",
                boxShadow: hoveredCardId === card.id ? "0 12px 30px rgba(108,99,255,0.15)" : "none"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 32 }}>{card.icon}</span>
              </div>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, color: "var(--text-main)", marginBottom: 8 }}>{card.label}</h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
                {card.desc}
              </p>
            </div>
          ))}

          {/* Default Empty State Card */}
          <div
            onClick={() => setIsAddModalOpen(true)}
            style={{
              background: "var(--bg-alt)", border: "2px dashed var(--border-light)", borderRadius: 22, padding: 32,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              cursor: "pointer", minHeight: 200, transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6c63ff"; e.currentTarget.style.background = "rgba(108,99,255,0.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.background = "var(--bg-alt)"; }}
          >
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: "rgba(108,99,255,0.12)", border: "1.5px solid #6c63ff40", display: "flex", alignItems: "center", justifyContent: "center", color: "#6c63ff", marginBottom: 14 }}>
              <Plus size={24} />
            </div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, color: "var(--text-main)" }}>Add Feature Widget</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>Click to browse available modules</div>
          </div>
        </div>
      </div>

      {/* 8. COLLABORATION & COMMUNITIES SECTION */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
            Collaboration & Communities
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-muted)", margin: "4px 0 0" }}>Connect with industry mentors, peer squads, and alumni.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
          {communityCards.map(item => {
            const isUnlocked = devPlan === "premium";
            return (
              <div
                key={item.id}
                onClick={() => {
                  setLockedModalFeature(item);
                }}
                style={{
                  background: "var(--bg-card)",
                  border: isUnlocked ? `1.5px solid ${item.accent}` : "1.5px solid var(--border-light)",
                  borderRadius: 20, padding: 22,
                  cursor: "pointer", transition: "all 0.3s ease", position: "relative"
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = item.accent; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = isUnlocked ? item.accent : "var(--border-light)"; e.currentTarget.style.transform = "none"; }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontSize: 32 }}>{item.icon}</span>
                  {isUnlocked ? (
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(0,201,167,0.15)", border: "1.5px solid #00c9a7", display: "flex", alignItems: "center", justifyContent: "center", color: "#00c9a7" }}>
                      ✓
                    </div>
                  ) : (
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(239,68,68,0.15)", border: "1.5px solid #ef4444", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
                      <Lock size={14} />
                    </div>
                  )}
                </div>

                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>{item.label}</h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, margin: "0 0 16px" }}>{item.desc}</p>

                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 800, color: item.accent, display: "flex", alignItems: "center", gap: 4 }}>
                  {isUnlocked ? "UNLOCKED & ACTIVE" : "UNLOCK REQUIREMENT"} <ChevronRight size={12} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 9. LIVE TECH NEWS FEED GENERATED FROM LIVE API */}
      <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 800, color: "#6c63ff", letterSpacing: 1.5, display: "flex", alignItems: "center", gap: 8 }}>
            <span>LIVE TECH & ENGINEERING HEADLINES</span>
            {newsLoading && <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} />}
          </div>
          <span style={{ fontSize: 13, color: "#00c9a7", fontWeight: 700 }}>● Live Dev.to Feed</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>
          {liveNews.map((news, idx) => (
            <div key={idx} style={{ background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", borderRadius: 18, padding: 20, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ padding: "3px 10px", borderRadius: 8, background: `${news.col}20`, color: news.col, fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 800 }}>
                    {news.category}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{news.time}</span>
                </div>
                <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, color: "var(--text-main)", margin: "0 0 8px", lineHeight: 1.4 }}>
                  {news.title}
                </h4>
                <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, margin: "0 0 18px" }}>
                  {news.desc}
                </p>
              </div>

              {/* Read More Button opens live article */}
              <a
                href={news.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none",
                  color: news.col, fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800
                }}
              >
                Read More <ChevronRight size={16} />
              </a>
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

    </>
  );
}

