import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { 
  BarChart2, Trophy, Award, Sparkles, Target, Zap, Clock, Calendar, CheckSquare, 
  MapPin, ShieldAlert, Cpu, Layers, Bookmark, Search, Filter, RefreshCw, 
  ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, BookOpen, Flame, 
  Building, GraduationCap, Code2, Users, Briefcase, Plus, X, ChevronRight, Play,
  MessageSquare, ChevronLeft, Volume2, ArrowUpRight
} from "lucide-react";

/* ─── COLOR TOKENS ─── */
const COLS = {
  primary: "#6c63ff",
  success: "#00c9a7",
  warning: "#f59e0b",
  danger: "#ec4899",
  info: "#38bdf8",
  purple: "#8b5cf6"
};

/* ─── ANIMATED VALUE COUNTER COMPONENT ─── */
function AnimatedValue({ value, duration = 1200, prefix = "", suffix = "" }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const cleanStr = value.toString().replace(/[^\d]/g, "");
    const targetVal = parseInt(cleanStr, 10);
    
    if (isNaN(targetVal)) {
      setCurrent(value);
      return;
    }

    let startTimestamp = null;
    let animFrame = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = progress * (2 - progress); // easeOutQuad
      const currentVal = Math.floor(ease * targetVal);
      
      setCurrent(currentVal);
      if (progress < 1) {
        animFrame = window.requestAnimationFrame(step);
      } else {
        setCurrent(targetVal);
      }
    };
    
    animFrame = window.requestAnimationFrame(step);
    return () => {
      if (animFrame) window.cancelAnimationFrame(animFrame);
    };
  }, [value, duration]);

  let formatted = current;
  if (value.toString().includes(",")) {
    formatted = current.toLocaleString();
  }
  
  return (
    <span>{prefix}{formatted}{suffix}</span>
  );
}

/* ─── ANIMATED PROGRESS BARS ─── */
function AnimatedProgressBar({ pct, col }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setW(pct), 150);
    return () => clearTimeout(timer);
  }, [pct]);
  
  return (
    <div style={{ height: 10, borderRadius: 5, background: "var(--border-light)", overflow: "hidden" }}>
      <div style={{ 
        height: "100%", 
        width: `${w}%`, 
        background: col, 
        borderRadius: 5, 
        transition: "width 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      }} />
    </div>
  );
}

function AnimatedProgressBarMini({ pct, col }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setW(pct), 150);
    return () => clearTimeout(timer);
  }, [pct]);
  
  return (
    <div style={{ height: 8, borderRadius: 4, background: "var(--border-light)", overflow: "hidden" }}>
      <div style={{ 
        height: "100%", 
        width: `${w}%`, 
        background: col, 
        borderRadius: 4, 
        transition: "width 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      }} />
    </div>
  );
}

function AnimatedProgressBarMicro({ pct, col }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setW(pct), 150);
    return () => clearTimeout(timer);
  }, [pct]);
  
  return (
    <div style={{ height: 6, borderRadius: 3, background: "var(--border-light)", overflow: "hidden" }}>
      <div style={{ 
        height: "100%", 
        width: `${w}%`, 
        background: col, 
        borderRadius: 3, 
        transition: "width 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      }} />
    </div>
  );
}

/* ─── ANIMATED CIRCLE GAUGE ─── */
function AnimatedCircle({ pct }) {
  const circumference = 2 * Math.PI * 80;
  const [strokeOffset, setStrokeOffset] = useState(circumference);
  
  useEffect(() => {
    const targetOffset = circumference - (pct / 100) * circumference;
    const timer = setTimeout(() => setStrokeOffset(targetOffset), 150);
    return () => clearTimeout(timer);
  }, [pct, circumference]);

  return (
    <svg width="250" height="250" viewBox="0 0 200 200" style={{ transform: "rotate(-90deg)" }}>
      <circle cx="100" cy="100" r="80" fill="none" stroke="var(--border-light)" strokeWidth="18" />
      <circle cx="100" cy="100" r="80" fill="none" stroke="url(#criGradient)" strokeWidth="18"
        strokeDasharray={`${circumference}`}
        strokeDashoffset={strokeOffset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}
      />
      <defs>
        <linearGradient id="criGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6c63ff" />
          <stop offset="100%" stopColor="#00c9a7" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── DATASET DEFINITIONS ─── */
const USER = {
  name: "Rahul Kushwaha",
  avatar: "🎓",
  institute: "IIT Kanpur",
  degree: "B.Tech · Computer Science",
  cri: 78,
  rankGlobal: "#847",
  streak: 7,
  coins: "2,480",
  xp: "1,340"
};

const CRI_ARMS = [
  { label: "Skill Coverage", pct: 68, col: COLS.primary, bg: "rgba(108, 99, 255, 0.1)" },
  { label: "Mastery Levels", pct: 54, col: COLS.success, bg: "rgba(0, 201, 167, 0.1)" },
  { label: "Consistency", pct: 77, col: COLS.warning, bg: "rgba(245, 158, 11, 0.1)" },
  { label: "Interview Readiness", pct: 38, col: COLS.danger, bg: "rgba(236, 72, 153, 0.1)" }
];

const MARKET_ALIGNMENT = [
  { 
    company: "Microsoft", 
    match: 85, 
    role: "SDE Intern", 
    col: COLS.primary, 
    bg: "rgba(108, 99, 255, 0.1)", 
    bdr: "rgba(108, 99, 255, 0.3)", 
    icon: "🪟",
    achievements: [
      "Target tier-1 school alignment (B.Tech Computer Science from IIT Kanpur)",
      "92% Programming Basics mastery (highly structured OOP & Recursion skills)",
      "78% Data Structures average (implemented BST and LL algorithms)",
      "Normalised a SQL Schema challenge solved cleanly"
    ],
    gaps: [
      "System Design is only at 10%. Microsoft SDE target requires at least 70% in scalability, rate limiting, and sharding.",
      "Projects Portfolio matches 3/5 logged. Complete 2 additional system projects to pass technical screening.",
      "Consistency: Target a 14-day streak to secure active recall algorithm speed benchmarks."
    ]
  },
  { 
    company: "Google", 
    match: 72, 
    role: "STEP Intern", 
    col: COLS.success, 
    bg: "rgba(0, 201, 167, 0.1)", 
    bdr: "rgba(0, 201, 167, 0.3)", 
    icon: "🔍",
    achievements: [
      "IIT Kanpur enrollment verification boosts algorithms profile weight",
      "92% in Programming basics with error handling",
      "BST tree traversal challenges successfully completed first try"
    ],
    gaps: [
      "Algorithms category is at 65%. Google STEP bar tests advanced DP, Greedy, and complex Graph cycles (target 85%+).",
      "OS concepts node: Memory management and deadlocks are at 30% — Google expects high hardware concept mastery."
    ]
  },
  { 
    company: "Amazon", 
    match: 68, 
    role: "SDE Intern", 
    col: COLS.warning, 
    bg: "rgba(245, 158, 11, 0.1)", 
    bdr: "rgba(245, 158, 11, 0.3)", 
    icon: "📦",
    achievements: [
      "High score on Sliding Window BST algorithms",
      "DBMS SQL Schema normalization milestone complete"
    ],
    gaps: [
      "System Design: Load balancing & distributed caching nodes are locked. Amazon requires strict low-latency cache system familiarity.",
      "DBMS: average DBMS mastery is at 48%. Target indexing and transaction isolation level nodes."
    ]
  },
  { 
    company: "Flipkart", 
    match: 91, 
    role: "Software Intern", 
    col: COLS.danger, 
    bg: "rgba(236, 72, 153, 0.1)", 
    bdr: "rgba(236, 72, 153, 0.3)", 
    icon: "🛍️",
    achievements: [
      "Data structures SDE Intern profile matches Flipkart Core API team demands",
      "92% basic coding and clean implementation paradigms",
      "7-day daily problem-solving streak maintained"
    ],
    gaps: [
      "System Design sharding and message queue nodes require active completion.",
      "Web dev react server components node requires active review."
    ]
  }
];

const SKILL_MASTERY = [
  { label: "Programming Basics", pct: 92, col: COLS.success, bg: "rgba(0, 201, 167, 0.08)", bdr: "rgba(0, 201, 167, 0.25)", nodes: 12, done: 11,
    subtopics: [{ name: "Variables & Types", pct: 100 }, { name: "Control Flow", pct: 98 }, { name: "Functions", pct: 95 }, { name: "OOP Concepts", pct: 88 }, { name: "Error Handling", pct: 82 }, { name: "Recursion", pct: 78 }] },
  { label: "Data Structures", pct: 78, col: COLS.primary, bg: "rgba(108, 99, 255, 0.08)", bdr: "rgba(108, 99, 255, 0.25)", nodes: 14, done: 11,
    subtopics: [{ name: "Arrays & Strings", pct: 95 }, { name: "Linked Lists", pct: 90 }, { name: "Stacks & Queues", pct: 88 }, { name: "Trees", pct: 75 }, { name: "Graphs", pct: 62 }, { name: "Heaps", pct: 55 }] },
  { label: "Algorithms", pct: 65, col: COLS.warning, bg: "rgba(245, 158, 11, 0.08)", bdr: "rgba(245, 158, 11, 0.25)", nodes: 18, done: 12,
    subtopics: [{ name: "Sorting", pct: 85 }, { name: "Searching", pct: 80 }, { name: "Dynamic Programming", pct: 60 }, { name: "Greedy", pct: 55 }, { name: "Backtracking", pct: 45 }, { name: "Divide & Conquer", pct: 65 }] },
  { label: "DBMS", pct: 48, col: COLS.purple, bg: "rgba(139, 92, 246, 0.08)", bdr: "rgba(139, 92, 246, 0.25)", nodes: 10, done: 5, active: true,
    subtopics: [{ name: "Relational Model", pct: 70 }, { name: "SQL Basics", pct: 65 }, { name: "Normalization", pct: 55 }, { name: "Transactions", pct: 40 }, { name: "Indexing", pct: 30 }, { name: "Query Optimization", pct: 20 }] },
  { label: "Operating Systems", pct: 30, col: COLS.success, bg: "rgba(0, 201, 167, 0.08)", bdr: "rgba(0, 201, 167, 0.25)", nodes: 12, done: 4,
    subtopics: [{ name: "Process Management", pct: 50 }, { name: "Memory Management", pct: 35 }, { name: "File Systems", pct: 30 }, { name: "Deadlocks", pct: 20 }, { name: "Scheduling", pct: 25 }, { name: "I/O Systems", pct: 18 }] },
  { label: "System Design", pct: 10, col: COLS.info, bg: "rgba(56, 189, 248, 0.08)", bdr: "rgba(56, 189, 248, 0.25)", nodes: 16, done: 2,
    subtopics: [{ name: "Scalability", pct: 20 }, { name: "Load Balancing", pct: 15 }, { name: "Caching", pct: 12 }, { name: "Databases", pct: 10 }, { name: "Microservices", pct: 5 }, { name: "Message Queues", pct: 8 }] }
];

const RECENT_CHALLENGES = [
  { label: "Implement Binary Search Tree", cat: "DSA", date: "20/03/2026", xp: 150, diff: "Medium", col: COLS.primary, bg: "rgba(108, 99, 255, 0.08)", letter: "M" },
  { label: "Design a Rate Limiter", cat: "System Design", date: "19/03/2026", xp: 300, diff: "Hard", col: COLS.warning, bg: "rgba(245, 158, 11, 0.08)", letter: "H" },
  { label: "Two Sum — Sliding Window", cat: "DSA", date: "18/03/2026", xp: 80, diff: "Easy", col: COLS.success, bg: "rgba(0, 201, 167, 0.08)", letter: "E" },
  { label: "Normalise a SQL Schema", cat: "DBMS", date: "17/03/2026", xp: 120, diff: "Medium", col: COLS.purple, bg: "rgba(139, 92, 246, 0.08)", letter: "M" },
  { label: "Build a Responsive Navbar", cat: "Web Dev", date: "16/03/2026", xp: 60, diff: "Easy", col: COLS.primary, bg: "rgba(108, 99, 255, 0.08)", letter: "E" },
  { label: "LRU Cache Implementation", cat: "DSA", date: "15/03/2026", xp: 200, diff: "Hard", col: COLS.warning, bg: "rgba(245, 158, 11, 0.08)", letter: "H" }
];

const HEATMAP_DATA = Array.from({ length: 35 }, (_, i) => {
  const v = Math.random(); 
  return v < 0.25 ? 0 : v < 0.5 ? 1 : v < 0.75 ? 2 : 3;
});

const genLeaderboard = () => {
  const names = ["Aarav Shah", "Priya Nair", "Ravi Kumar", "Sneha Patel", "Arjun Mehta", "Divya Rao", "Karan Singh", "Pooja Iyer", "Aditya Verma", "Ananya Ghosh", "Vikram Bose", "Meera Joshi", "Rahul Kushwaha", "Siddharth Das", "Kavya Reddy", "Nikhil Gupta", "Ishaan Chawla", "Shreya Mishra", "Rohit Sharma", "Tanvi Kaur"];
  const institutes = ["IIT Bombay", "IIT Delhi", "IIT Kanpur", "IIT Madras", "BITS Pilani", "NIT Warangal", "IIT Kharagpur", "IIIT Hyderabad", "VIT Vellore", "DTU Delhi", "NIT Trichy", "IIT Roorkee", "IIT Guwahati", "NSIT Delhi", "PEC Chandigarh", "BIT Mesra", "IIIT Allahabad", "IIT BHU", "NIT Surathkal", "Jadavpur Univ"];
  const states = ["Maharashtra", "Kerala", "UP", "Gujarat", "Punjab", "Telangana", "West Bengal", "Karnataka", "Tamil Nadu", "Delhi", "Madhya Pradesh", "Rajasthan", "Bihar", "Haryana", "Andhra Pradesh", "Odisha", "Assam", "Himachal Pradesh", "Jharkhand", "Goa"];
  
  return names.map((name, i) => ({
    rank: i + 1,
    name,
    institute: institutes[i],
    state: states[i],
    cri: Math.max(45, 98 - i * 2 + Math.floor(Math.random() * 6)),
    xp: Math.floor(3200 - i * 90 + Math.random() * 120),
    streak: Math.max(1, 28 - i + Math.floor(Math.random() * 5)),
    badge: i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i < 10 ? "🏆" : "⭐",
    isUser: name === "Rahul Kushwaha"
  }));
};

const LEADERBOARD = genLeaderboard();

export default function PlatformProgress() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("progress"); // Sidebar active highlight
  const [progTab, setProgTab] = useState("overview"); // "overview" | "leaderboard"

  // AI Insights Panel & Selected Company state
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [hasNewInsight, setHasNewInsight] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Hovered Roadmap Node Tooltip State (Synced with PlatformDashboard UI)
  const [hoveredNode, setHoveredNode] = useState(null);

  // Overview Stats
  const totalNodes = SKILL_MASTERY.reduce((s, sk) => s + sk.nodes, 0);
  const doneNodes = SKILL_MASTERY.reduce((s, sk) => s + sk.done, 0);
  const journeyPct = Math.round((doneNodes / totalNodes) * 100);
  const skillsMastered = SKILL_MASTERY.filter(s => s.pct >= 70).length;

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === "dashboard") navigate("/dashboard");
    if (tabId === "roadmap") navigate("/roadmap");
    if (tabId === "challenges") navigate("/challenges");
    if (tabId === "memory-lane") navigate("/memory-lane");
    if (tabId === "technews") navigate("/technews");
  };

  // Synced 8 Roadmap nodes data model from Dashboard timeline
  const roadmapNodes = [
    { id: 1, label: "Programming\nBasics", done: true, topics: "5 of 5 Topics Covered", mastery: 100, current: "Pointers, Memory & Functions" },
    { id: 2, label: "Data\nStructures", done: true, topics: "4 of 4 Topics Covered", mastery: 100, current: "Arrays, Linked Lists & Trees" },
    { id: 3, label: "Algorithms", done: true, topics: "4 of 4 Topics Covered", mastery: 100, current: "Sorting, Searching & Recursion" },
    { id: 4, label: "DBMS", done: false, active: true, topics: "3 of 5 Topics Covered", mastery: 60, current: "Currently Learning: Relational Algebra & Indexing" },
    { id: 5, label: "OS\nConcepts", done: false, topics: "0 of 5 Topics Covered", mastery: 0, current: "Upcoming: Process Scheduling & Threads" },
    { id: 6, label: "Networking", done: false, topics: "0 of 4 Topics Covered", mastery: 0, current: "Upcoming: TCP/IP & HTTP Protocols" },
    { id: 7, label: "System\nDesign", done: false, topics: "0 of 6 Topics Covered", mastery: 0, current: "Upcoming: Load Balancing & Caching" },
    { id: 8, label: "Portfolio", done: false, topics: "0 of 3 Projects Built", mastery: 0, current: "Upcoming: Capstone Microservice App" }
  ];

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={handleTabChange}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 60, position: "relative" }}>
        
        {/* ── TOP HERO HEADER & CONTROLS (UNTOUCHED TEXT SIZES) ── */}
        <div style={{
          padding: "26px 30px", borderRadius: 24,
          background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16
        }}>
          <div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "#6c63ff", fontWeight: 900, letterSpacing: 1.5, marginBottom: 4 }}>
              STUDENT ANALYTICS HUB
            </div>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
              Your Learning <span style={{ background: "linear-gradient(90deg, #6c63ff, #00c9a7, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Progress</span>
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {/* AI Insights Launcher Button with Notification Red Dot */}
            <button
              onClick={() => {
                setAiPanelOpen(true);
                setHasNewInsight(false);
              }}
              style={{
                position: "relative", padding: "12px 18px", borderRadius: 16,
                background: "linear-gradient(135deg, rgba(0,201,167,0.18), rgba(108,99,255,0.18))",
                border: "1.5px solid #00c9a7", cursor: "pointer",
                fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900,
                color: "var(--text-main)", display: "flex", alignItems: "center", gap: 8
              }}
            >
              <Sparkles size={17} color="#00c9a7" />
              <span>🤖 AI Analysis Insights</span>
              {hasNewInsight && (
                <span style={{
                  position: "absolute", top: -3, right: -3, width: 12, height: 12,
                  borderRadius: "50%", background: "#ec4899", border: "2px solid var(--bg-card)",
                  boxShadow: "0 0 8px #ec4899"
                }} />
              )}
            </button>

            {/* Toggle Switch */}
            <div style={{
              display: "inline-flex", background: "var(--bg-alt)", padding: 5, borderRadius: 20,
              border: "1.5px solid var(--border-light)", gap: 8
            }}>
              <button
                onClick={() => setProgTab("overview")}
                style={{
                  padding: "12px 24px", borderRadius: 16, border: "none",
                  background: progTab === "overview" ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "transparent",
                  color: progTab === "overview" ? "#ffffff" : "var(--text-muted)",
                  fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
                }}
              >
                <BarChart2 size={17} />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setProgTab("leaderboard")}
                style={{
                  padding: "12px 24px", borderRadius: 16, border: "none",
                  background: progTab === "leaderboard" ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "transparent",
                  color: progTab === "leaderboard" ? "#ffffff" : "var(--text-muted)",
                  fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
                }}
              >
                <Trophy size={17} />
                <span>Leaderboard</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── OVERVIEW TAB PANEL ── */}
        {progTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* ROW 1: CAREER READINESS INDEX (CRI) SCORE HUB (COLLISION FIXED) */}
            <div style={{
              padding: 28, borderRadius: 24, background: "var(--bg-card)",
              border: "1.5px solid var(--border-light)", boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
              position: "relative", overflow: "hidden"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: 24 }}>
                <div>
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 14.5, color: "#6c63ff", fontWeight: 900, letterSpacing: 1.2 }}>
                    📍 PERFORMANCE GAUGE
                  </div>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 900, color: "var(--text-main)", margin: "4px 0 0" }}>
                    Career Readiness Index (CRI) • Score: <span style={{ color: "#6c63ff" }}><AnimatedValue value={USER.cri} /></span> / 100
                  </h3>
                </div>

                <div style={{
                  padding: "12px 22px", borderRadius: 16, border: "1px solid rgba(0, 201, 167, 0.35)",
                  background: "rgba(0, 201, 167, 0.08)", color: "#00c9a7",
                  fontFamily: "'Outfit', sans-serif", fontSize: 16.5, fontWeight: 900, display: "flex", alignItems: "center", gap: 8,
                  flexShrink: 0
                }}>
                  <Target size={20} />
                  <span>CRI Target: 90+ for Premium Roles</span>
                </div>
              </div>

              {/* CRI Center circle and floating nodes diagram representation (RESPONSIVE GRID PREVENTS COLLISION) */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 24, alignItems: "center" }}>
                
                <div style={{ display: "flex", justifyContent: "center", position: "relative", padding: 20 }}>
                  {/* Gauge ring */}
                  <AnimatedCircle pct={USER.cri} />

                  {/* Inside Center text */}
                  <div style={{
                    position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                    textAlign: "center"
                  }}>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 52, fontWeight: 900, color: "var(--text-main)", lineHeight: 1 }}>
                      <AnimatedValue value={USER.cri} />
                    </div>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, color: "var(--text-muted)", marginTop: 4, letterSpacing: 1.5 }}>
                      CRI LEVEL
                    </div>
                  </div>
                </div>

                {/* 4 Pillars of Readiness */}
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {CRI_ARMS.map((arm, idx) => (
                    <div key={idx} style={{
                      padding: "18px 22px", borderRadius: 16, background: "var(--bg-alt)",
                      border: "1.5px solid var(--border-light)"
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900, color: "var(--text-main)" }}>
                          {arm.label}
                        </span>
                        <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 17, fontWeight: 900, color: arm.col }}>
                          <AnimatedValue value={arm.pct} suffix="%" />
                        </span>
                      </div>
                      <AnimatedProgressBar pct={arm.pct} col={arm.col} />
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* ROW 2: MARKET ALIGNMENT CARDS WITH CLICK POPUP MODAL (INCREASED TEXT SIZES) */}
            <div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 14.5, color: "var(--text-muted)", fontWeight: 900, letterSpacing: 1.5, marginBottom: 12 }}>
                🎯 TARGET COMPANY MATCH ALIGNMENT (CLICK CARD FOR AI ROADMAP REVIEW)
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                {MARKET_ALIGNMENT.map((m, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedCompany(m)}
                    style={{
                      padding: 24, borderRadius: 22, background: "var(--bg-card)",
                      border: `1.5px solid ${m.bdr}`, boxShadow: "0 6px 18px rgba(0,0,0,0.02)",
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <span style={{ fontSize: 28 }}>{m.icon}</span>
                      <div>
                        <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
                          {m.company}
                        </h4>
                        <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 13.5, color: "var(--text-muted)" }}>
                          {m.role}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", justify: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, color: "var(--text-muted)" }}>
                        CRI Match
                      </span>
                      <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 18, fontWeight: 900, color: m.col }}>
                        <AnimatedValue value={m.match} suffix="%" />
                      </span>
                    </div>

                    <AnimatedProgressBar pct={m.match} col={m.col} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ROW 3: STAT KPI METRIC CARDS (INCREASED TEXT SIZES) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              {[
                { label: "JOURNEY COMPLETION", val: journeyPct, suffix: "%", sub: `${doneNodes} of ${totalNodes} nodes completed`, col: "#6c63ff", icon: <Layers size={22} /> },
                { label: "SKILLS MASTERED", val: skillsMastered, suffix: "/6", sub: "Skills at ≥ 70% mastery", col: "#00c9a7", icon: <Award size={22} /> },
                { label: "CURRENT MOTIVATION", val: "DBMS", isText: true, sub: "Active roadmap node", col: "#f59e0b", icon: <Target size={22} /> },
                { label: "DAILY STREAK", val: USER.streak, suffix: " Days", sub: "Keep consistent!", col: "#ec4899", icon: <Flame size={22} /> }
              ].map((kpi, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "24px 28px", borderRadius: 22, background: "var(--bg-card)",
                    border: "1.5px solid var(--border-light)", display: "flex", justify: "space-between",
                    alignItems: "center", boxShadow: "0 6px 18px rgba(0,0,0,0.02)"
                  }}
                >
                  <div>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, color: "var(--text-muted)", fontWeight: 900, letterSpacing: 1 }}>
                      {kpi.label}
                    </div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 900, color: kpi.col, marginTop: 4 }}>
                      {kpi.isText ? kpi.val : <AnimatedValue value={kpi.val} suffix={kpi.suffix} />}
                    </div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15.5, color: "var(--text-muted)", marginTop: 2 }}>
                      {kpi.sub}
                    </div>
                  </div>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14, background: `${kpi.col}18`,
                    color: kpi.col, display: "flex", alignItems: "center", justify: "center"
                  }}>
                    {kpi.icon}
                  </div>
                </div>
              ))}
            </div>

            {/* ROW 4: 4-YEAR CURVY ROAD SKILL TIMELINE */}
            <div style={{
              background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
              borderRadius: 24, padding: 28, boxShadow: "0 6px 18px rgba(0,0,0,0.02)", position: "relative"
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13.5, fontWeight: 800, color: "#6c63ff", letterSpacing: 1.5 }}>
                    CAREER JOURNEY TIMELINE
                  </div>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 900, color: "var(--text-main)", margin: "4px 0 0" }}>
                    Major Milestones
                  </h3>
                </div>
                
                <button
                  onClick={() => navigate("/roadmap")}
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

                      <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: node.done ? "#00c9a7" : node.active ? "#6c63ff" : "var(--text-muted)", textAlign: "center", marginTop: 10, whiteSpace: "pre-line", fontWeight: node.active ? 800 : 600 }}>
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
                              MASTERY: <AnimatedValue value={node.mastery} suffix="%" /> • {node.topics}
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

            {/* ROW 5: RECENT COMPLETED CHALLENGES TIMELINE */}
            <div style={{
              padding: 24, borderRadius: 24, background: "var(--bg-card)",
              border: "1.5px solid var(--border-light)"
            }}>
              <div style={{ display: "flex", justify: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 14.5, color: "#f59e0b", fontWeight: 900, letterSpacing: 1.5 }}>
                    ⚡ CHALLENGE COMPLETION LOG
                  </div>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 900, color: "var(--text-main)", margin: "4px 0 0" }}>
                    Recent Activity — Last 30 Days
                  </h3>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <span style={{ padding: "6px 14px", background: "rgba(0, 201, 167, 0.12)", border: "1px solid #00c9a7", borderRadius: 10, fontFamily: "'Fira Code', monospace", fontSize: 13, color: "#00c9a7", fontWeight: 800 }}>✓ <AnimatedValue value={RECENT_CHALLENGES.length} /> completed</span>
                  <span style={{ padding: "6px 14px", background: "rgba(245, 158, 11, 0.12)", border: "1px solid #f59e0b", borderRadius: 10, fontFamily: "'Fira Code', monospace", fontSize: 13, color: "#f59e0b", fontWeight: 800 }}><AnimatedValue value={7} />-day streak 🔥</span>
                </div>
              </div>

              {/* Exact reference card grid UI for challenge logs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 16 }}>
                {RECENT_CHALLENGES.map((ch, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 4 }}
                    style={{
                      display: "flex", alignItems: "center", gap: 14, padding: "16px 20px",
                      borderRadius: 16, border: "1.5px solid var(--border-light)", background: "var(--bg-alt)",
                      transition: "all 0.2s ease", cursor: "default"
                    }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: 12, background: ch.bg,
                      border: `1.5px solid ${ch.col}33`, display: "flex", alignItems: "center",
                      justifyContent: "center", flexShrink: 0
                    }}>
                      <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 16.5, color: ch.col, fontWeight: 900 }}>
                        {ch.letter}
                      </span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: "'Outfit', sans-serif", fontSize: 16.5, color: "var(--text-main)",
                        fontWeight: 900, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
                      }}>
                        {ch.label}
                      </div>

                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{
                          padding: "3px 10px", background: ch.bg, border: `1.5px solid ${ch.col}33`,
                          borderRadius: 6, fontFamily: "'Fira Code', monospace", fontSize: 12, color: ch.col, fontWeight: 800
                        }}>
                          {ch.cat}
                        </span>
                        <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: "var(--text-muted)" }}>
                          {ch.date}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                      <span style={{
                        padding: "3px 10px", background: "rgba(245, 158, 11, 0.12)",
                        border: "1px solid #f59e0b", borderRadius: 8,
                        fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#f59e0b", fontWeight: 900
                      }}>
                        +<AnimatedValue value={ch.xp} /> XP
                      </span>
                      <span style={{
                        padding: "3px 8px", background: "rgba(0, 201, 167, 0.12)",
                        border: "1px solid #00c9a7", borderRadius: 8,
                        fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "#00c9a7", fontWeight: 800
                      }}>
                        ✓ Done
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ROW 6: BUILDER LEVEL + DEEP DIVE (left) | HEATMAP & STREAK STATUS (right) */}
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
              
              {/* Left Column: Builder Level + Deep Dive Analytics */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                
                {/* Builder Level Card (EXACT MATCH WITH SCREENSHOT 2) */}
                <div style={{
                  padding: 28, borderRadius: 24, background: "var(--bg-card)",
                  border: "1.5px solid var(--border-light)", boxShadow: "0 6px 18px rgba(0,0,0,0.02)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justify: "space-between", marginBottom: 16 }}>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
                      <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#6c63ff", fontWeight: 900, letterSpacing: 1.5, marginBottom: 6 }}>
                        🏗️ PROJECT IMPACT LEVEL
                      </div>
                      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
                        Builder <span style={{ color: "#6c63ff" }}>Level <AnimatedValue value={2} /></span>
                      </h2>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "var(--text-muted)", marginTop: 6 }}>
                        <AnimatedValue value={3} /> projects logged · advancing from Learner → Builder → Architect
                      </div>
                    </div>

                    <div style={{ position: "relative", width: 68, height: 68, flexShrink: 0 }}>
                      <div style={{
                        width: 68, height: 68, borderRadius: "50%",
                        background: "linear-gradient(135deg, #6c63ff, #00c9a7)",
                        display: "flex", alignItems: "center", justify: "center",
                        fontSize: 32, boxShadow: "0 4px 16px rgba(108,99,255,0.3)"
                      }}>
                        🏗️
                      </div>
                      <div style={{
                        position: "absolute", inset: -4, borderRadius: "50%",
                        border: "2px dashed rgba(108,99,255,0.25)", animation: "spinSlow 8s linear infinite"
                      }} />
                    </div>
                  </div>

                  <div style={{ marginTop: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 800 }}>
                      <span style={{ color: "var(--text-muted)" }}>LEVEL 2 → LEVEL 3</span>
                      <span style={{ color: "#6c63ff" }}><AnimatedValue value={3} />/5 projects</span>
                    </div>
                    <AnimatedProgressBar pct={60} col="linear-gradient(90deg, #6c63ff, #00c9a7)" />
                  </div>
                </div>

                {/* Deep Dive Analytics */}
                <div style={{
                  padding: 24, borderRadius: 24, background: "var(--bg-card)",
                  border: "1.5px solid var(--border-light)", display: "flex", flexDirection: "column", gap: 16
                }}>
                  <div style={{ display: "flex", justify: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                      <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 14.5, color: "#6c63ff", fontWeight: 900, letterSpacing: 1.2 }}>
                        SKILL MASTERY LEVELS
                      </div>
                      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 900, color: "var(--text-main)", margin: "4px 0 0" }}>
                        Deep Dive Analytics
                      </h3>
                    </div>
                    <span style={{ padding: "4px 12px", background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", borderRadius: 10, fontFamily: "'Fira Code', monospace", fontSize: 13, color: "var(--text-muted)", fontWeight: 800, flexShrink: 0 }}>
                      <AnimatedValue value={SKILL_MASTERY.length} /> skills tracked
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
                    {SKILL_MASTERY.map((skill, idx) => (
                      <SkillMasteryBar key={idx} skill={skill} />
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Heatmap & Enlarged Streak Status Card */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                
                {/* Heatmap Card */}
                <div style={{
                  padding: 24, borderRadius: 24, background: "var(--bg-card)",
                  border: "1.5px solid var(--border-light)", display: "flex", flexDirection: "column", gap: 14
                }}>
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 14.5, color: "#6c63ff", fontWeight: 900, letterSpacing: 1.2 }}>
                    CONSISTENCY HEATMAP — 5 WEEKS
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, margin: "6px 0" }}>
                    {HEATMAP_DATA.map((v, i) => (
                      <div
                        key={i}
                        style={{
                          aspectRatio: 1, borderRadius: 4,
                          background: v === 0 ? "var(--bg-alt)" : v === 1 ? "#c5c0ff" : v === 2 ? "#9d97ff" : "#6c63ff",
                          border: "1px solid var(--border-light)"
                        }}
                      />
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {[["var(--bg-alt)", "None"], ["#c5c0ff", "Low"], ["#9d97ff", "Mid"], ["#6c63ff", "High"]].map(([c, l]) => (
                      <div key={l} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                        <div style={{ width: 10, height: 10, borderRadius: 3, background: c }} />
                        <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "var(--text-muted)" }}>{l}</span>
                      </div>
                    ))}
                  </div>

                  {/* ENLARGED STREAK BOXES */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
                    {[
                      { lbl: "CURRENT STREAK", val: USER.streak, suffix: " days", col: "#f59e0b" },
                      { lbl: "BEST STREAK", val: 14, suffix: " days", col: "#6c63ff" },
                      { lbl: "THIS MONTH", val: 22, suffix: " / 30", col: "#00c9a7" },
                      { lbl: "TOTAL ACTIVE", val: 47, suffix: " days", col: "#ec4899" }
                    ].map((stk, i) => (
                      <div key={i} style={{ padding: "18px 24px", background: "var(--bg-alt)", borderRadius: 18, border: "1.5px solid var(--border-light)", boxShadow: "0 4px 12px rgba(0,0,0,0.01)" }}>
                        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "var(--text-muted)", letterSpacing: 0.8, marginBottom: 4 }}>{stk.lbl}</div>
                        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 900, color: stk.col }}>
                          <AnimatedValue value={stk.val} suffix={stk.suffix} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* ROW 7 (NEW): ACTIVITY SUMMARY (EXACT VISUAL MATCH WITH SCREENSHOT 3 CAPSULES) */}
            <div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 14.5, color: "var(--text-muted)", fontWeight: 900, letterSpacing: 1.5, marginBottom: 12 }}>
                ⚡ ACTIVITY SUMMARY
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
                {[
                  { icon: "⏱️", label: "Study Hours", val: 84, suffix: "h", desc: "Total deep work time", col: "#6c63ff", bg: "rgba(108, 99, 255, 0.06)", bdr: "rgba(108, 99, 255, 0.15)" },
                  { icon: "📝", label: "Assessments", val: 23, suffix: "", desc: "Tests & quizzes cleared", col: "#f59e0b", bg: "rgba(245, 158, 11, 0.06)", bdr: "rgba(245, 158, 11, 0.15)" },
                  { icon: "🌐", label: "Skill Coverage", val: 61, suffix: "%", desc: "Industry curriculum touched", col: "#00c9a7", bg: "rgba(0, 201, 167, 0.06)", bdr: "rgba(0, 201, 167, 0.15)" },
                  { icon: "🏆", label: "XP Earned", val: 1340, suffix: "", desc: "Total across all activities", col: "#ec4899", bg: "rgba(236, 72, 153, 0.06)", bdr: "rgba(236, 72, 153, 0.15)" }
                ].map((act, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "20px 24px", borderRadius: 20, background: "var(--bg-card)",
                      border: `1.5px solid var(--border-light)`, boxShadow: "0 6px 18px rgba(0,0,0,0.02)"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 14, background: act.bg,
                        border: `1.5px solid ${act.bdr}`, display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: 24, flexShrink: 0
                      }}>
                        {act.icon}
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: act.col, fontWeight: 900 }}>
                          {act.label.toUpperCase()}
                        </div>
                        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, color: "var(--text-muted)", marginTop: 2 }}>
                          {act.desc}
                        </div>
                      </div>
                    </div>

                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 900, color: act.col, marginLeft: 12 }}>
                      <AnimatedValue value={act.val} suffix={act.suffix} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ── LEADERBOARD TAB PANEL ── */}
        {progTab === "leaderboard" && (
          <div style={{
            padding: 24, borderRadius: 24, background: "var(--bg-card)",
            border: "1.5px solid var(--border-light)", display: "flex", flexDirection: "column", gap: 20
          }}>
            <div style={{ display: "flex", alignItems: "center", justify: "space-between", flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, color: "#6c63ff", fontWeight: 900, letterSpacing: 1.2 }}>
                  🏆 LEADERBOARD RANKINGS
                </div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 21, fontWeight: 900, color: "var(--text-main)", margin: "2px 0 0" }}>
                  Global Student Placement Rankings
                </h3>
              </div>

              <div style={{ display: "flex", gap: 8, background: "var(--bg-alt)", padding: 4, borderRadius: 14, border: "1.5px solid var(--border-light)" }}>
                {["GLOBAL", "NATIONAL", "INSTITUTE"].map(lvl => (
                  <button
                    key={lvl}
                    style={{
                      padding: "6px 14px", borderRadius: 10, border: "none",
                      background: lvl === "GLOBAL" ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "transparent",
                      color: lvl === "GLOBAL" ? "#ffffff" : "var(--text-muted)",
                      fontFamily: "'Fira Code', monospace", fontSize: 11.5, fontWeight: 800, cursor: "pointer"
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Highlighting User rank block */}
            <div style={{
              padding: "16px 20px", borderRadius: 18,
              background: "linear-gradient(135deg, rgba(0, 201, 167, 0.12), rgba(108, 99, 255, 0.12))",
              border: "1.5px solid #00c9a7", display: "flex", alignItems: "center", justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 26 }}>🎓</span>
                <div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 900, color: "var(--text-main)" }}>
                    You ({USER.name})
                  </div>
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: "var(--text-muted)" }}>
                    {USER.institute} • {USER.degree}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 18, textAlign: "right" }}>
                <div>
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "var(--text-muted)" }}>GLOBAL RANK</div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 900, color: "#6c63ff" }}>#<AnimatedValue value={13} /></div>
                </div>
                <div>
                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "var(--text-muted)" }}>CRI SCORE</div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 900, color: "#00c9a7" }}><AnimatedValue value={USER.cri} /></div>
                </div>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: "1.5px solid var(--border-light)", textAlign: "left" }}>
                    <th style={{ padding: "14px 18px", fontFamily: "'Fira Code', monospace", fontSize: 13, color: "var(--text-muted)" }}>RANK</th>
                    <th style={{ padding: "14px 18px", fontFamily: "'Fira Code', monospace", fontSize: 13, color: "var(--text-muted)" }}>STUDENT</th>
                    <th style={{ padding: "14px 18px", fontFamily: "'Fira Code', monospace", fontSize: 13, color: "var(--text-muted)" }}>INSTITUTE</th>
                    <th style={{ padding: "14px 18px", fontFamily: "'Fira Code', monospace", fontSize: 13, color: "var(--text-muted)" }}>CRI SCORE</th>
                    <th style={{ padding: "14px 18px", fontFamily: "'Fira Code', monospace", fontSize: 13, color: "var(--text-muted)" }}>XP EARNED</th>
                  </tr>
                </thead>
                <tbody>
                  {LEADERBOARD.map((item, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: "1px solid var(--border-light)",
                        background: item.isUser ? "rgba(0, 201, 167, 0.05)" : "transparent",
                        transition: "background 0.2s"
                      }}
                    >
                      <td style={{ padding: "16px 18px", fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 900, color: item.isUser ? "#00c9a7" : "var(--text-main)" }}>
                        {item.rank <= 3 ? item.badge : `#${item.rank}`}
                      </td>
                      <td style={{ padding: "16px 18px", fontFamily: "'Outfit', sans-serif", fontSize: 16.5, fontWeight: 800, color: "var(--text-main)" }}>
                        {item.name} {item.isUser && "(You)"}
                      </td>
                      <td style={{ padding: "16px 18px", fontFamily: "'Outfit', sans-serif", fontSize: 15.5, color: "var(--text-muted)" }}>
                        {item.institute}
                      </td>
                      <td style={{ padding: "16px 18px", fontFamily: "'Fira Code', monospace", fontSize: 16.5, fontWeight: 900, color: "#6c63ff" }}>
                        {item.cri}
                      </td>
                      <td style={{ padding: "16px 18px", fontFamily: "'Fira Code', monospace", fontSize: 15.5, color: "#f59e0b" }}>
                        {item.xp.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ── FLOATING SLIDE-IN AI INSIGHTS SIDE PANEL (RIGHT SIDE Drawer) ── */}
        <AnimatePresence>
          {aiPanelOpen && (
            <>
              {/* Backdrop */}
              <div
                onClick={() => setAiPanelOpen(false)}
                style={{
                  position: "fixed", inset: 0, zIndex: 1090,
                  background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)"
                }}
              />

              {/* Side Drawer */}
              <motion.div
                initial={{ x: 420 }}
                animate={{ x: 0 }}
                exit={{ x: 420 }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                style={{
                  position: "fixed", top: 0, right: 0, bottom: 0, width: 400,
                  zIndex: 1100, background: "var(--bg-card)",
                  borderLeft: "1.5px solid var(--border-light)",
                  boxShadow: "-10px 0 40px rgba(0,0,0,0.15)",
                  display: "flex", flexDirection: "column", padding: "28px 24px"
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", justify: "space-between", alignItems: "center", borderBottom: "1.5px solid var(--border-light)", paddingBottom: 16, marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Sparkles size={22} color="#00c9a7" />
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
                      AI Insights & Pacing
                    </h3>
                  </div>
                  <button
                    onClick={() => setAiPanelOpen(false)}
                    style={{
                      width: 36, height: 36, borderRadius: 12, border: "1.5px solid var(--border-light)",
                      background: "var(--bg-alt)", color: "var(--text-main)", cursor: "pointer",
                      display: "flex", alignItems: "center", justify: "center"
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Insights Content List */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", flex: 1 }}>
                  {[
                    { icon: "🚀", title: "Accelerate System Design Node", text: "You've finalized basic algorithms. Starting your sharding & consistent hashing nodes now would boost your Microsoft CRI match score by ~7% within 14 days." },
                    { icon: "🔥", title: "Protect Your 7-Day Streak", text: "Daily consistency is key. Complete one medium assessment or simple coding challenge today to prevent streak decay and secure the Streak Shield badge." },
                    { icon: "🎯", title: "DBMS Mastery Target (48%)", text: "Relational model & transactions are incomplete. Spending 40 minutes on DBMS indexing this week will push you to 70% average mastery, unlocking placement referrals." },
                    { icon: "🧠", title: "Competitive DSA Benchmark", text: "Your current BST execution speed is 94%. We recommend sliding window array problems to raise your SDE-1 competitive score to Google levels." }
                  ].map((insight, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: 18, borderRadius: 18, background: "var(--bg-alt)",
                        border: "1.5px solid var(--border-light)", display: "flex", flexDirection: "column", gap: 8
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 22 }}>{insight.icon}</span>
                        <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
                          {insight.title}
                        </h4>
                      </div>
                      <p style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 14.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
                        {insight.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Footer close button */}
                <div style={{ borderTop: "1.5px solid var(--border-light)", paddingTop: 20, marginTop: 20 }}>
                  <button
                    onClick={() => setAiPanelOpen(false)}
                    style={{
                      width: "100%", padding: "14px", borderRadius: 16, border: "none",
                      background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#ffffff",
                      fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 900, cursor: "pointer"
                    }}
                  >
                    Acknowledge Insights & Resume Practice
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── TARGET COMPANY MATCH AI REVIEW POPUP MODAL ── */}
        <AnimatePresence>
          {selectedCompany && (
            <div
              onClick={e => { if (e.target === e.currentTarget) setSelectedCompany(null); }}
              style={{
                position: "fixed", inset: 0, zIndex: 1200,
                background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(12px)",
                display: "flex", alignItems: "center", justifyContent: "center", padding: 24
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 24 }}
                style={{
                  background: "var(--bg-card)", borderRadius: 28, maxWidth: 680, width: "100%",
                  maxHeight: "85vh", overflow: "hidden", border: "1.5px solid var(--border-light)",
                  boxShadow: "0 30px 80px rgba(0,0,0,0.35)", display: "flex", flexDirection: "column"
                }}
              >
                {/* Header */}
                <div style={{
                  padding: "24px 32px 20px", borderBottom: "1.5px solid var(--border-light)",
                  background: "linear-gradient(135deg, rgba(108,99,255,0.08), rgba(0,201,167,0.08))",
                  display: "flex", alignItems: "center", justifyContent: "space-between"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <span style={{ fontSize: 36 }}>{selectedCompany.icon}</span>
                    <div>
                      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
                        {selectedCompany.company} SDE Compatibility
                      </h2>
                      <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: selectedCompany.col, fontWeight: 900 }}>
                        TARGET ROLE: {selectedCompany.role} • MATCH SCORE: {selectedCompany.match}%
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCompany(null)}
                    style={{
                      width: 36, height: 36, borderRadius: 12, border: "1.5px solid var(--border-light)",
                      background: "var(--bg-card)", color: "var(--text-main)", cursor: "pointer",
                      display: "flex", alignItems: "center", justify: "center"
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Body Content */}
                <div style={{ padding: 28, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
                  
                  {/* Matching Gauge Bar */}
                  <div style={{ padding: "14px 18px", borderRadius: 16, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)" }}>
                    <div style={{ display: "flex", justify: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 900, color: "var(--text-muted)" }}>
                        Current Match Readiness
                      </span>
                      <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 16, fontWeight: 900, color: selectedCompany.col }}>
                        <AnimatedValue value={selectedCompany.match} suffix="% Compatibility" />
                      </span>
                    </div>
                    <AnimatedProgressBar pct={selectedCompany.match} col={selectedCompany.col} />
                  </div>

                  {/* Achievements: What you have done */}
                  <div>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#00c9a7", fontWeight: 900, marginBottom: 10 }}>
                      ✓ COMPLETED REQUIREMENTS (ACHIEVEMENTS):
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {(selectedCompany.achievements || [
                        "Tier-1 school academic profile match.",
                        "Excellent core basic programming and data structures foundations verified."
                      ]).map((ach, i) => (
                        <div
                          key={i}
                          style={{
                            padding: "10px 14px", borderRadius: 12, background: "var(--bg-alt)",
                            border: "1.5px solid var(--border-light)", fontSize: 14, fontFamily: "'Outfit', sans-serif",
                            color: "var(--text-main)", display: "flex", alignItems: "flex-start", gap: 8
                          }}
                        >
                          <CheckCircle2 size={16} color="#00c9a7" style={{ marginTop: 2, flexShrink: 0 }} />
                          <span>{ach}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gaps: What you need to do more */}
                  <div>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#f59e0b", fontWeight: 900, marginBottom: 10 }}>
                      ⚠️ ACTION REQUIRED (AI TARGET GAPS):
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {(selectedCompany.gaps || [
                        "Complete sharding and load balancer algorithms to hit SDE Intern compatibility thresholds.",
                        "Resolve remaining DBMS indexing and transactions problems."
                      ]).map((gap, i) => (
                        <div
                          key={i}
                          style={{
                            padding: "10px 14px", borderRadius: 12, background: "var(--bg-alt)",
                            border: "1.5px solid var(--border-light)", fontSize: 14, fontFamily: "'Outfit', sans-serif",
                            color: "var(--text-main)", display: "flex", alignItems: "flex-start", gap: 8
                          }}
                        >
                          <AlertTriangle size={16} color="#f59e0b" style={{ marginTop: 2, flexShrink: 0 }} />
                          <span>{gap}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Footer action button */}
                <div style={{ padding: 24, borderTop: "1.5px solid var(--border-light)" }}>
                  <button
                    onClick={() => {
                      setSelectedCompany(null);
                      navigate("/roadmap");
                    }}
                    style={{
                      width: "100%", padding: "14px", borderRadius: 16, border: "none",
                      background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#ffffff",
                      fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 900, cursor: "pointer",
                      display: "flex", alignItems: "center", justify: "center", gap: 8
                    }}
                  >
                    <span>🚀 Launch Prepare Roadmap & Fill Gaps</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}

/* ─── SKILL MASTERY BAR COMPONENT WITH POPUP DROPDOWN ─── */
function SkillMasteryBar({ skill }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  // Close popup click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: "14px 18px", borderRadius: 16, background: "var(--bg-alt)",
          border: `1.5px solid ${isOpen ? skill.col : "var(--border-light)"}`,
          cursor: "pointer", display: "flex", flexDirection: "column", gap: 8, transition: "all 0.2s"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justify: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16.5, fontWeight: 900, color: "var(--text-main)" }}>
              {skill.label}
            </span>
            {skill.active && (
              <span style={{
                padding: "2px 8px", borderRadius: 6,
                background: "rgba(108, 99, 255, 0.15)", border: "1px solid #6c63ff",
                color: "#6c63ff", fontFamily: "'Fira Code', monospace", fontSize: 9.5, fontWeight: 900
              }}>
                ACTIVE ROADMAP
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'Fira Code', monospace", fontSize: 13, color: "var(--text-muted)" }}>
            <span><AnimatedValue value={skill.done} /> / <AnimatedValue value={skill.nodes} /> Nodes</span>
            <span style={{ fontWeight: 900, color: skill.col }}><AnimatedValue value={skill.pct} suffix="%" /></span>
            <span style={{ fontSize: 10 }}>▼</span>
          </div>
        </div>

        <AnimatedProgressBarMini pct={skill.pct} col={skill.col} />
      </div>

      {/* Subtopic Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            style={{
              position: "absolute", left: 0, right: 0, top: "calc(100% + 8px)", zIndex: 100,
              padding: 16, borderRadius: 18, background: "var(--bg-card)",
              border: `1.5px solid ${skill.col}40`, boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
              display: "flex", flexDirection: "column", gap: 10
            }}
          >
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: skill.col, fontWeight: 900 }}>
              📘 SUBTOPIC DETAILED MASTERY BREAKDOWN:
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {skill.subtopics.map((st, i) => (
                <div key={i} style={{ padding: "10px 14px", borderRadius: 12, background: "var(--bg-alt)", border: "1px solid var(--border-light)" }}>
                  <div style={{ display: "flex", justify: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 800, color: "var(--text-main)" }}>
                      {st.name}
                    </span>
                    <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 900, color: skill.col }}>
                      <AnimatedValue value={st.pct} suffix="%" />
                    </span>
                  </div>
                  <AnimatedProgressBarMicro pct={st.pct} col={skill.col} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
