import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { 
  BookOpen, Map, Zap, Sparkles, Lock, Unlock, FileText, CheckCircle2, Plus, X, 
  Search, Share2, ExternalLink, Folder, Calendar, Award, Coins, Flame, Rocket, 
  BarChart2, Code2, Video, FileSpreadsheet, Image as ImageIcon, Layers, 
  ShieldCheck, MessageSquare, Filter, RefreshCw, Check, ArrowRight, CornerDownRight,
  Eye, File, Play, Upload, Star, Heart, Trophy
} from "lucide-react";

/* ─── TOP-DOWN 2D SPORTS CAR VECTOR GRAPHIC FOR ROADWAY ─── */
function TopDownCarGraphic({ carColor = "#ef4444" }) {
  return (
    <svg width="32" height="58" viewBox="0 0 34 62" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.4))" }}>
      {/* Rubber Wheels */}
      <rect x="0" y="8" width="5" height="12" rx="2.5" fill="#0f172a" />
      <rect x="29" y="8" width="5" height="12" rx="2.5" fill="#0f172a" />
      <rect x="0" y="42" width="5" height="12" rx="2.5" fill="#0f172a" />
      <rect x="29" y="42" width="5" height="12" rx="2.5" fill="#0f172a" />

      {/* Aerodynamic Chassis */}
      <path d="M5 14C5 8 10 3 17 3C24 3 29 8 29 14V48C29 54 24 58 17 58C10 58 5 54 5 48V14Z" fill={carColor} stroke="#ffffff" strokeWidth="1.5" />
      <path d="M15 3H19V58H15V3Z" fill="#ffffff" opacity="0.4" />

      {/* Windshield */}
      <path d="M8 20C8 17 11 15 17 15C23 15 26 17 26 20V26H8V20Z" fill="#0f172a" />
      <path d="M10 21C10 19 12 17.5 17 17.5C22 17.5 24 19 24 21V24H10V21Z" fill="#38bdf8" opacity="0.85" />

      {/* Roof & Lights */}
      <rect x="9" y="27" width="16" height="14" rx="3" fill="#1e293b" />
      <circle cx="9" cy="5" r="2.5" fill="#38bdf8" />
      <circle cx="25" cy="5" r="2.5" fill="#38bdf8" />
      <rect x="8" y="56" width="5" height="2" rx="1" fill="#ff4d4d" />
      <rect x="21" y="56" width="5" height="2" rx="1" fill="#ff4d4d" />
    </svg>
  );
}

/* ─── CATEGORY & DIFFICULTY COLOR TOKENS ─── */
const CAT_COL = { 
  DSA: "#6c63ff", 
  "SYSTEM DESIGN": "#38bdf8", 
  "WEB DEV": "#00c9a7", 
  OS: "#ec4899", 
  DBMS: "#10b981", 
  THEORY: "#8b5cf6", 
  PROJECT: "#f59e0b" 
};

const DIFF_BG = { 
  Easy: "rgba(0, 201, 167, 0.12)", 
  Medium: "rgba(245, 158, 11, 0.12)", 
  Hard: "rgba(236, 72, 153, 0.12)",
  Milestone: "rgba(255, 215, 0, 0.15)"
};

const DIFF_COL = { 
  Easy: "#00c9a7", 
  Medium: "#f59e0b", 
  Hard: "#ec4899",
  Milestone: "#ffd700"
};

const TYPE_COL = { 
  Video: "#6c63ff", 
  PDF: "#ec4899", 
  Code: "#00c9a7", 
  Doc: "#f59e0b", 
  Image: "#38bdf8", 
  Diagram: "#8b5cf6", 
  Note: "#f59e0b", 
  Sheet: "#10b981", 
  Link: "#6c63ff" 
};

/* ─── DYNAMIC ROADMAP GENERATOR MATH FOR HIGHWAY TRACK ─── */
function getRoadmapMajorNodes(targetCareer) {
  const career = (targetCareer || "").toLowerCase();

  let defaultSkills = [
    { id: "dsa", label: "DSA Foundations", emoji: "🌳", color: "#6c63ff", scope: "Arrays, Trees, Graphs & DP.", desc: "Arrays, Stacks, Queues, BST — interview backbone. 80% mastered." },
    { id: "oop", label: "OOP & Java/C++", emoji: "☕", color: "#38bdf8", scope: "Classes, Inheritance & Design Patterns.", desc: "Core OOP, Collections, Generics — enterprise backbone mastered." },
    { id: "web_basics", label: "HTML5 & Tailwind", emoji: "🎨", color: "#00c9a7", scope: "Flexbox, Grid & Responsive UI.", desc: "Responsive layout design, flexbox grid systems, CSS transitions." },
    { id: "react", label: "React & Next.js", emoji: "⚛️", color: "#f59e0b", scope: "JSX, Hooks & Server Components.", desc: "JSX, Hooks, Redux Toolkit, Next.js — dominant UI paradigm." },
    { id: "typescript", label: "TypeScript", emoji: "🔷", color: "#ec4899", scope: "Interfaces, Types & Generics.", desc: "Strong typing, interface schemas, generic functions & async types." },
    { id: "nodejs", label: "Node.js Express", emoji: "🟩", color: "#10b981", scope: "REST APIs & Microservices.", desc: "Express, Async I/O, Event Loop, JWT Auth — server-side JS mastery." },
    { id: "dbms", label: "PostgreSQL & SQL", emoji: "🗄️", color: "#8b5cf6", scope: "Indexing, 3NF & Schema Design.", desc: "SQL, Joins, 3NF Normalization, B+ Tree Indexing & PgBouncer." },
    { id: "sysdesign", label: "System Design", emoji: "🏛️", color: "#38bdf8", scope: "Scalability & Load Balancers.", desc: "Scalability, Rate Limiting, Consistent Hashing & Microservices." }
  ];

  const canvasWidth = 1600;
  const startY = 160;
  const stepY = 320;

  return defaultSkills.map((sk, index) => {
    const isDone = index < 3;
    const isActive = index === 3;

    const sinOffset = Math.sin(index * 0.95) * 480;
    const x = canvasWidth / 2 + sinOffset;
    const y = startY + index * stepY;

    return {
      ...sk,
      status: isDone ? "done" : isActive ? "active" : "locked",
      levelNum: index + 1,
      x,
      y,
      files: [
        { icon: "🎥", name: `${sk.label} Masterclass — Udemy`, type: "Video", detail: "4h 20m watched" },
        { icon: "📄", name: `${sk.label} Cheatsheet.pdf`, type: "PDF", detail: "1.4 MB" },
        { icon: "💻", name: `github.com/rahul/${sk.id}-lab`, type: "Code", detail: "24 commits" },
        { icon: "📝", name: "My Personal Notes.docx", type: "Doc", detail: "840 KB" }
      ],
      slots: [
        { text: `${sk.label} core principles mastered through hands-on coding.`, date: "1 wk ago", col: sk.color, bg: `${sk.color}15` },
        { text: "Key insight: Always optimize asymptotic time bounds before deploying.", date: "3 days ago", col: "#00c9a7", bg: "rgba(0,201,167,0.12)" },
        null
      ],
      media: [
        { type: "image", name: "Milestone_Certificate.png", url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80" },
        { type: "image", name: "Code_Proof_Snapshot.png", url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80" }
      ],
      minor: [
        { id: `${sk.id}_1`, label: "Core Basics", fill: isDone ? 100 : 0 },
        { id: `${sk.id}_2`, label: "Key Patterns", fill: isDone ? 100 : 0 },
        { id: `${sk.id}_3`, label: "Practice Sprint", fill: isDone ? 100 : 0 },
        { id: `${sk.id}_4`, label: "Architecture", fill: isDone ? 100 : 0 },
        { id: `${sk.id}_5`, label: "Optimization", fill: isDone ? 100 : 0 },
        { id: `${sk.id}_6`, label: "Real-World Lab", fill: isDone ? 100 : 0 }
      ]
    };
  });
}

/* ─── DEFAULT CHALLENGES MEMORIES DATASET ─── */
const DEFAULT_CHAL_MEMORIES = [
  {
    id: "cm_1", icon: "🌳", label: "Implement Binary Search Tree Traversal", cat: "DSA", diff: "Medium", xp: 150, date: "2 days ago", score: 94,
    desc: "Nailed the in-order traversal recursion trick. Used DFS recursion for clean sorted array generation.",
    files: [
      { icon: "💻", name: "bst_solution.py", type: "Code", detail: "78 lines" },
      { icon: "📸", name: "test_pass_screenshot.png", type: "Image", detail: "Screenshot" },
      { icon: "📝", name: "BST logic notes.txt", type: "Note", detail: "3 KB" }
    ],
    slots: [
      { text: "Always think: left < root < right. The invariant holds the tree together.", col: "#6c63ff", bg: "rgba(108, 99, 255, 0.1)" },
      { text: "Inorder traversal = sorted output array. Useful for k-th smallest element!", col: "#00c9a7", bg: "rgba(0, 201, 167, 0.1)" },
      null
    ],
    media: [
      { type: "image", name: "BST_Test_Pass.png", url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80" }
    ]
  },
  {
    id: "cm_2", icon: "🔗", label: "Reverse Linked List In-Place", cat: "DSA", diff: "Easy", xp: 90, date: "3 days ago", score: 100,
    desc: "Three-pointer technique: prev, curr, next. Clean O(1) space solution accepted first try.",
    files: [
      { icon: "💻", name: "reverse_ll.py", type: "Code", detail: "12 lines" },
      { icon: "📊", name: "pointer_diagram.png", type: "Diagram", detail: "Visual" }
    ],
    slots: [
      { text: "prev=None, curr=head, then walk while curr is valid. Draw pointers first!", col: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" },
      null, null
    ]
  },
  {
    id: "cm_3", icon: "⚙️", label: "Token Bucket Rate Limiter Algorithm", cat: "SYSTEM DESIGN", diff: "Hard", xp: 240, date: "5 days ago", score: 88,
    desc: "Sliding window token bucket. Used deque + timestamp for O(1) window eviction under 10K requests.",
    files: [
      { icon: "📄", name: "rate_limiter_design.pdf", type: "PDF", detail: "1.8 MB" },
      { icon: "💻", name: "rate_limiter.py", type: "Code", detail: "55 lines" },
      { icon: "🎥", name: "System Design Primer - YT", type: "Video", detail: "Watched" }
    ],
    slots: [
      { text: "Token bucket > fixed window for bursty API traffic control.", col: "#6c63ff", bg: "rgba(108, 99, 255, 0.1)" },
      { text: "deque + timestamp = O(1) sliding window eviction. Super elegant.", col: "#ec4899", bg: "rgba(236, 72, 153, 0.1)" },
      null
    ]
  },
  {
    id: "cm_4", icon: "⚛️", label: "Custom React Debounce Hook", cat: "WEB DEV", diff: "Medium", xp: 140, date: "1 week ago", score: 96,
    desc: "Built useDebounce hook with setTimeout cleanup return function to avoid memory leaks.",
    files: [
      { icon: "💻", name: "useDebounce.js", type: "Code", detail: "24 lines" },
      { icon: "📸", name: "auto_search_demo.gif", type: "Image", detail: "Animation" }
    ],
    slots: [
      { text: "Always return () => clearTimeout(timer) in useEffect for clean unmounting.", col: "#00c9a7", bg: "rgba(0, 201, 167, 0.1)" },
      null, null
    ]
  },
  {
    id: "cm_5", icon: "📚", label: "OSI Model & Networking Masterclass", cat: "THEORY", diff: "Easy", xp: 120, date: "2 weeks ago", score: 100,
    desc: "Passed 7-question proctored assessment covering Layer 4 transport, TCP 3-way handshake & TLS 1.3.",
    files: [
      { icon: "📄", name: "Networking_7Q_Assessment.pdf", type: "PDF", detail: "Passed 100%" }
    ],
    slots: [
      { text: "Layer 4 = Transport (TCP/UDP ports). Layer 3 = Network (IP addresses).", col: "#8b5cf6", bg: "rgba(139, 92, 246, 0.1)" },
      null, null
    ]
  }
];

export default function PlatformMemoryLane() {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("memory-lane");
  const [mode, setMode] = useState("roadmap"); // "roadmap" | "challenge"
  const [selectedVaultModal, setSelectedVaultModal] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("ALL");

  // Read Target Career
  const targetCareer = (() => {
    try {
      const direct = localStorage.getItem("pathEdSelectedCareer");
      if (direct) return direct;
      const stg2 = JSON.parse(localStorage.getItem("pathEdStage2") || "{}");
      return stg2.chosenCareer || "Full-Stack Web Developer";
    } catch {
      return "Full-Stack Web Developer";
    }
  })();

  const [roadmapNodes] = useState(() => getRoadmapMajorNodes(targetCareer));

  // Read LocalStorage Memory Log
  const [challengeMemories, setChallengeMemories] = useState(() => {
    try {
      const logs = JSON.parse(localStorage.getItem("pathEdMemoryLaneLog") || "[]");
      if (logs && logs.length > 0) {
        const mappedLogs = logs.map((item, idx) => ({
          id: item.id || `log_${idx}`,
          icon: item.category === "DSA" ? "🌳" : item.category === "SYSTEM DESIGN" ? "⚙️" : item.category === "WEB DEV" ? "⚛️" : "📚",
          label: item.title || "Solved Problem",
          cat: item.category || "DSA",
          diff: "Medium",
          xp: item.xpEarned || 150,
          date: item.date || "Recently",
          score: 100,
          desc: item.snippet || "Completed challenge verified and logged to permanent memory portfolio.",
          files: [
            { icon: "💻", name: "solution_code.py", type: "Code", detail: "Verified Code" },
            { icon: "📝", name: "Active_Recall_Notes.txt", type: "Note", detail: "User Recall" }
          ],
          slots: [
            { text: item.snippet || "Solution verified cleanly.", col: "#00c9a7", bg: "rgba(0, 201, 167, 0.1)" },
            null, null
          ],
          media: [
            { type: "image", name: "Execution_Proof.png", url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80" }
          ]
        }));
        return [...mappedLogs, ...DEFAULT_CHAL_MEMORIES];
      }
    } catch (e) {
      console.error("Error reading memory logs:", e);
    }
    return DEFAULT_CHAL_MEMORIES;
  });

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === "dashboard") navigate("/dashboard");
    if (tabId === "roadmap") navigate("/roadmap");
    if (tabId === "challenges") navigate("/challenges");
  };

  // Filtered Challenge Memories
  const filteredChallengeMemories = challengeMemories.filter(c => {
    const matchesSearch = c.label.toLowerCase().includes(searchQuery.toLowerCase()) || c.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategoryFilter === "ALL" || c.cat === activeCategoryFilter;
    return matchesSearch && matchesCat;
  });

  // Add Custom Memory / Reflection
  const handleAddReflection = (nodeId, text) => {
    if (!text || !text.trim()) return;

    setChallengeMemories(prev => prev.map(item => {
      if (item.id !== nodeId) return item;
      const newSlots = [...item.slots];
      const emptyIdx = newSlots.findIndex(s => s === null);
      if (emptyIdx !== -1) {
        newSlots[emptyIdx] = {
          text,
          date: "Just now",
          col: "#6c63ff",
          bg: "rgba(108, 99, 255, 0.12)"
        };
      }
      return { ...item, slots: newSlots };
    }));

    if (selectedVaultModal && selectedVaultModal.id === nodeId) {
      setSelectedVaultModal(prev => {
        const newSlots = [...prev.slots];
        const emptyIdx = newSlots.findIndex(s => s === null);
        if (emptyIdx !== -1) {
          newSlots[emptyIdx] = {
            text,
            date: "Just now",
            col: "#6c63ff",
            bg: "rgba(108, 99, 255, 0.12)"
          };
        }
        return { ...prev, slots: newSlots };
      });
    }

    triggerToast("✨ Personal Memory Note Saved & Vault Portfolio Updated!");
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={handleTabChange}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 60 }}>
        
        {/* ── TOP HERO BANNER & REFLECTION SWITCH ── */}
        <div style={{
          padding: "26px 30px", borderRadius: 24,
          background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "#6c63ff", fontWeight: 900, letterSpacing: 1.5 }}>
            <Sparkles size={16} />
            <span>PERSONAL LEARNING VAULT & MEMORY ARCHIVE</span>
          </div>

          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 34, fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
            Memory <span style={{ background: "linear-gradient(90deg, #6c63ff, #00c9a7, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Lane</span>
          </h1>

          <p style={{ margin: 0, fontSize: 15, color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif", maxWidth: 620, lineHeight: 1.6 }}>
            Every solved code challenge, active recall note, certificate snapshot, and major roadmap milestone archived in your personal learning vault.
          </p>

          {/* Dual-Mode Toggle Switch */}
          <div style={{
            display: "inline-flex", background: "var(--bg-alt)", padding: 5, borderRadius: 20,
            border: "1.5px solid var(--border-light)", gap: 8, marginTop: 4
          }}>
            <button
              onClick={() => setMode("roadmap")}
              style={{
                padding: "12px 24px", borderRadius: 16, border: "none",
                background: mode === "roadmap" ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "transparent",
                color: mode === "roadmap" ? "#ffffff" : "var(--text-muted)",
                fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s",
                boxShadow: mode === "roadmap" ? "0 4px 16px rgba(108,99,255,0.3)" : "none"
              }}
            >
              <Map size={17} />
              <span>🗺️ Roadmap Track Vault</span>
            </button>

            <button
              onClick={() => setMode("challenge")}
              style={{
                padding: "12px 24px", borderRadius: 16, border: "none",
                background: mode === "challenge" ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "transparent",
                color: mode === "challenge" ? "#ffffff" : "var(--text-muted)",
                fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s",
                boxShadow: mode === "challenge" ? "0 4px 16px rgba(108,99,255,0.3)" : "none"
              }}
            >
              <Zap size={17} />
              <span>⚡ Challenge Memory Vault</span>
            </button>
          </div>
        </div>

        {/* ── STATS BAR (4 MNC CARDS) ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          {[
            { label: "NODES REFLECTED", val: `${roadmapNodes.length} Nodes`, col: "#6c63ff", icon: <Map size={18} /> },
            { label: "CHALLENGES RECALLED", val: `${challengeMemories.length} Solved`, col: "#00c9a7", icon: <Zap size={18} /> },
            { label: "FILES ARCHIVED", val: "34 Resources", col: "#f59e0b", icon: <Folder size={18} /> },
            { label: "PRIVATE SLOTS USED", val: "12 / 15 Used", col: "#ec4899", icon: <Lock size={18} /> }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -3 }}
              style={{
                padding: "20px 24px", borderRadius: 22,
                background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", justifyContent: "space-between"
              }}
            >
              <div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "var(--text-muted)", fontWeight: 900, letterSpacing: 1 }}>
                  {stat.label}
                </div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 900, color: stat.col, marginTop: 2 }}>
                  {stat.val}
                </div>
              </div>
              <div style={{
                width: 44, height: 44, borderRadius: 14, background: `${stat.col}18`,
                color: stat.col, display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                {stat.icon}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── MODE 1: EXACT ROADMAP HIGHWAY ROAD TRACK & CAR VIEW ── */}
        {mode === "roadmap" && (
          <div style={{
            background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
            borderRadius: 24, padding: 24, boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
            display: "flex", flexDirection: "column", gap: 18
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
              <div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "#6c63ff", fontWeight: 900, letterSpacing: 1.2 }}>
                  ROADMAP TRACK & ANIMATED CAR ENGINE
                </div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 900, color: "var(--text-main)", margin: "2px 0 0" }}>
                  Interactive Road Track • Targeting: <span style={{ color: "#6c63ff" }}>{targetCareer}</span>
                </h3>
              </div>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, color: "var(--text-muted)" }}>
                💡 Click any major node to open its complete Memory Vault & Archived Notes
              </div>
            </div>

            {/* Exact Road Canvas with Moving Sports Car */}
            <HighwayRoadTrackCanvas
              nodes={roadmapNodes}
              onNodeClick={(node) => setSelectedVaultModal({ ...node, isChallenge: false })}
            />
          </div>
        )}

        {/* ── MODE 2: CHALLENGE MEMORY GRID VIEW ── */}
        {mode === "challenge" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Search & Filter Bar */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: 16, padding: "18px 24px", borderRadius: 22,
              background: "var(--bg-card)", border: "1.5px solid var(--border-light)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 260 }}>
                <Search size={20} color="var(--text-muted)" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search solved challenges, active recall notes, or code..."
                  style={{
                    width: "100%", background: "none", border: "none", outline: "none",
                    color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 15
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
                {["ALL", "DSA", "SYSTEM DESIGN", "WEB DEV", "THEORY", "PROJECT"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategoryFilter(cat)}
                    style={{
                      padding: "8px 16px", borderRadius: 14,
                      border: activeCategoryFilter === cat ? "none" : "1.5px solid var(--border-light)",
                      background: activeCategoryFilter === cat ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "var(--bg-alt)",
                      color: activeCategoryFilter === cat ? "#ffffff" : "var(--text-main)",
                      fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: activeCategoryFilter === cat ? 900 : 700,
                      cursor: "pointer", whiteSpace: "nowrap"
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Challenges Grid with Increased Text Size */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
              {filteredChallengeMemories.map(c => (
                <ChallengeMemoryCard
                  key={c.id}
                  c={c}
                  onClick={() => setSelectedVaultModal({ ...c, isChallenge: true })}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── LARGE IMMERSIVE PRO VAULT MODAL ── */}
      <AnimatePresence>
        {selectedVaultModal && (
          <ProVaultModal
            node={selectedVaultModal}
            onClose={() => setSelectedVaultModal(null)}
            onAddReflection={handleAddReflection}
          />
        )}
      </AnimatePresence>

      {/* ── TOAST NOTIFICATION ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            style={{
              position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
              zIndex: 990, padding: "12px 24px", borderRadius: 16,
              background: "linear-gradient(135deg, #00c9a7, #6c63ff)", color: "#ffffff",
              fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900,
              boxShadow: "0 10px 30px rgba(0, 201, 167, 0.4)", display: "flex", alignItems: "center", gap: 10
            }}
          >
            <Sparkles size={18} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
}

/* ─── CHALLENGE MEMORY CARD COMPONENT (INCREASED TEXT SIZES) ─── */
function ChallengeMemoryCard({ c, onClick }) {
  const catCol = CAT_COL[c.cat] || "#6c63ff";
  const diffBg = DIFF_BG[c.diff] || "rgba(108,99,255,0.12)";
  const diffCol = DIFF_COL[c.diff] || "#6c63ff";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={onClick}
      style={{
        borderRadius: 24, padding: 24, cursor: "pointer",
        background: "rgba(0, 201, 167, 0.05)",
        border: "1.5px solid rgba(0, 201, 167, 0.35)",
        display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16,
        boxShadow: "0 8px 24px rgba(0, 201, 167, 0.08)", position: "relative"
      }}
    >
      <div style={{ position: "absolute", top: 18, right: 18 }}>
        <span style={{
          padding: "4px 12px", borderRadius: 12,
          background: "rgba(0, 201, 167, 0.18)", border: "1px solid #00c9a7",
          color: "#00c9a7", fontFamily: "'Fira Code', monospace", fontSize: 11.5, fontWeight: 900
        }}>
          ✓ ARCHIVED
        </span>
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: 30 }}>{c.icon}</span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span style={{
              padding: "4px 10px", borderRadius: 10,
              background: diffBg, color: diffCol,
              fontFamily: "'Fira Code', monospace", fontSize: 11.5, fontWeight: 900
            }}>
              {c.diff}
            </span>
            <span style={{
              padding: "4px 10px", borderRadius: 10,
              background: "rgba(108,99,255,0.12)", color: catCol,
              fontFamily: "'Fira Code', monospace", fontSize: 11.5, fontWeight: 900
            }}>
              {c.cat}
            </span>
          </div>
        </div>

        {/* Card Title (Increased to 18.5px) */}
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18.5, fontWeight: 900, color: "var(--text-main)", margin: "0 0 8px", lineHeight: 1.35 }}>
          {c.label}
        </h3>

        {/* Card Description (Increased to 14.5px) */}
        <p style={{ margin: "0 0 14px", fontSize: 14.5, color: "var(--text-muted)", lineHeight: 1.6, fontFamily: "'Outfit', sans-serif" }}>
          {c.desc}
        </p>
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, fontFamily: "'Fira Code', monospace", fontSize: 13 }}>
          <span style={{ color: catCol, fontWeight: 900 }}>+{c.xp} XP</span>
          <span style={{ color: "#00c9a7", fontWeight: 800 }}>Score: {c.score}%</span>
          <span style={{ color: "var(--text-muted)" }}>{c.date}</span>
        </div>

        {/* Score Progress Bar */}
        <div style={{ height: 7, borderRadius: 4, background: "rgba(0, 201, 167, 0.15)", overflow: "hidden", marginBottom: 14 }}>
          <div style={{ height: "100%", width: `${c.score}%`, background: "linear-gradient(90deg, #00c9a7, #6c63ff)", borderRadius: 4 }} />
        </div>

        <button style={{
          width: "100%", padding: "12px 16px", borderRadius: 16, border: "none",
          background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#ffffff",
          fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 900, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          boxShadow: "0 4px 16px rgba(108,99,255,0.25)"
        }}>
          <BookOpen size={16} />
          <span>📖 Recall Logic & Vault Notes</span>
        </button>
      </div>
    </motion.div>
  );
}

/* ─── HIGHWAY ROAD TRACK CANVAS WITH ANIMATED CAR ─── */
function HighwayRoadTrackCanvas({ nodes, onNodeClick }) {
  const [carProgress, setCarProgress] = useState(0.35); // Car position along SVG spline (0.0 to 1.0)
  const [hoveredNode, setHoveredNode] = useState(null);

  const canvasWidth = 1600;
  const canvasHeight = nodes.length * 320 + 200;

  // Build Curved Spline Path
  const generateRoadSvgPath = () => {
    if (!nodes || nodes.length === 0) return "";
    let d = `M ${nodes[0].x} ${nodes[0].y}`;
    for (let i = 0; i < nodes.length - 1; i++) {
      const p1 = nodes[i];
      const p2 = nodes[i + 1];
      const cy1 = p1.y + 150;
      const cy2 = p2.y - 150;
      d += ` C ${p1.x} ${cy1}, ${p2.x} ${cy2}, ${p2.x} ${p2.y}`;
    }
    return d;
  };

  const svgPathD = generateRoadSvgPath();
  const pathRef = useRef(null);
  const [carPos, setCarPos] = useState({ x: 800, y: 300, angle: 0 });

  // Compute Car Coordinates & Tangent Angle along SVG Spline
  useEffect(() => {
    if (pathRef.current) {
      const pathLen = pathRef.current.getTotalLength();
      const currentLen = pathLen * carProgress;
      const pt1 = pathRef.current.getPointAtLength(currentLen);
      const pt2 = pathRef.current.getPointAtLength(Math.min(pathLen, currentLen + 2));

      const angle = Math.atan2(pt2.y - pt1.y, pt2.x - pt1.x) * (180 / Math.PI) + 90;
      setCarPos({ x: pt1.x, y: pt1.y, angle });
    }
  }, [carProgress, nodes]);

  // Car Drive Animation Loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCarProgress(prev => (prev >= 0.95 ? 0.05 : prev + 0.0015));
    }, 30);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      position: "relative", width: "100%", height: 620, overflow: "auto",
      borderRadius: 24, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)"
    }}>
      <div style={{ position: "relative", width: canvasWidth, height: canvasHeight, margin: "0 auto" }}>
        
        {/* SVG Highway Asphalt Track */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}>
          {/* Outer Roadbed Outline */}
          <path
            d={svgPathD}
            fill="none"
            stroke="#1e293b"
            strokeWidth="90"
            strokeLinecap="round"
          />

          {/* Inner Asphalt Road */}
          <path
            d={svgPathD}
            fill="none"
            stroke="#0f172a"
            strokeWidth="76"
            strokeLinecap="round"
          />

          {/* Dashed Center Lane Marking Line */}
          <path
            ref={pathRef}
            d={svgPathD}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3.5"
            strokeDasharray="14 14"
          />
        </svg>

        {/* Animated Sports Car Graphic on Road Track */}
        <div style={{
          position: "absolute",
          left: carPos.x, top: carPos.y,
          transform: `translate(-50%, -50%) rotate(${carPos.angle}deg)`,
          transition: "transform 0.05s linear",
          zIndex: 30, pointerEvents: "none"
        }}>
          <TopDownCarGraphic carColor="#ef4444" />
        </div>

        {/* Major Roadmap Skill Nodes */}
        {nodes.map((node) => {
          const isDone = node.status === "done";
          const isActive = node.status === "active";
          const isHovered = hoveredNode === node.id;

          let nodeBg = isDone ? "linear-gradient(135deg, #00c9a7, #6c63ff)" : isActive ? "linear-gradient(135deg, #6c63ff, #ec4899)" : "var(--bg-card)";
          let nodeBorder = isDone ? "3px solid #00c9a7" : isActive ? "3px solid #6c63ff" : "2px solid var(--border-light)";

          return (
            <div
              key={node.id}
              style={{
                position: "absolute", left: node.x, top: node.y, transform: "translate(-50%, -50%)",
                zIndex: 40, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 8
              }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => onNodeClick(node)}
            >
              {/* Tooltip on Hover */}
              {isHovered && (
                <div style={{
                  position: "absolute", bottom: "calc(100% + 12px)", left: "50%", transform: "translateX(-50%)",
                  background: "#0f172a", color: "#ffffff", padding: "10px 14px", borderRadius: 14,
                  fontSize: 12, fontFamily: "'Outfit', sans-serif", width: 220, textAlign: "center",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.4)", zIndex: 60, pointerEvents: "none"
                }}>
                  <div style={{ fontWeight: 900, color: "#00c9a7" }}>{node.label}</div>
                  <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 2 }}>{node.desc}</div>
                </div>
              )}

              {/* Major Circle Badge */}
              <motion.div
                whileHover={{ scale: 1.12 }}
                style={{
                  width: 72, height: 72, borderRadius: "50%", background: nodeBg, border: nodeBorder,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  color: "#ffffff", boxShadow: isDone ? "0 0 24px rgba(0,201,167,0.4)" : isActive ? "0 0 24px rgba(108,99,255,0.5)" : "0 4px 16px rgba(0,0,0,0.1)"
                }}
              >
                <span style={{ fontSize: 24 }}>{node.emoji}</span>
                <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 9.5, fontWeight: 900 }}>
                  Lvl {node.levelNum}
                </span>
              </motion.div>

              <span style={{
                fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 900,
                color: isDone ? "#00c9a7" : isActive ? "#6c63ff" : "var(--text-main)",
                background: "var(--bg-card)", padding: "2px 10px", borderRadius: 10,
                border: "1px solid var(--border-light)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
              }}>
                {node.label}
              </span>
            </div>
          );
        })}

      </div>
    </div>
  );
}

/* ─── LARGE IMMERSIVE PRO VAULT MODAL COMPONENT (EXPANDED UI) ─── */
function ProVaultModal({ node, onClose, onAddReflection }) {
  const [activeTab, setActiveTab] = useState("files"); // "files" | "slots" | "media" | "add"
  const [newNoteText, setNewNoteText] = useState("");

  if (!node) return null;

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddReflection(node.id, newNoteText);
    setNewNoteText("");
    setActiveTab("slots");
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
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
          background: "var(--bg-card)", borderRadius: 28, maxWidth: 920, width: "100%",
          maxHeight: "90vh", overflow: "hidden", border: "1.5px solid var(--border-light)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.35)", display: "flex", flexDirection: "column"
        }}
      >
        {/* Large Header Banner */}
        <div style={{
          padding: "24px 32px 20px", borderBottom: "1.5px solid var(--border-light)",
          background: "linear-gradient(135deg, rgba(108,99,255,0.12), rgba(0,201,167,0.12))",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 18,
              background: "linear-gradient(135deg, #6c63ff, #00c9a7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 30, boxShadow: "0 8px 24px rgba(108,99,255,0.3)"
            }}>
              {node.emoji || node.icon}
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
                  {node.label} {node.isChallenge ? "— Memory Recall" : "— Personal Learning Vault"}
                </h2>
                <span style={{
                  padding: "4px 12px", borderRadius: 12,
                  background: "rgba(0, 201, 167, 0.15)", border: "1px solid #00c9a7",
                  color: "#00c9a7", fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 900
                }}>
                  🔒 PRO VAULT LOCKED
                </span>
              </div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "#6c63ff", fontWeight: 800 }}>
                {node.isChallenge ? `CHALLENGE • ${node.cat} • SCORE: ${node.score}%` : `ROADMAP NODE • PRIVATE ARCHIVE`}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 38, height: 38, borderRadius: 12, border: "1.5px solid var(--border-light)",
              background: "var(--bg-card)", color: "var(--text-main)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Header Subtitle */}
        <div style={{ padding: "14px 32px", background: "var(--bg-alt)", borderBottom: "1.5px solid var(--border-light)" }}>
          <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.5 }}>
            {node.desc}
          </p>
        </div>

        {/* Vault Navigation Tabs */}
        <div style={{ display: "flex", borderBottom: "1.5px solid var(--border-light)", background: "var(--bg-card)" }}>
          {[
            { id: "files", label: `📂 Resources & Files (${node.files?.length || 0})` },
            { id: "slots", label: `🔒 Private Memory Slots` },
            { id: "media", label: `🖼️ Celebration Media (${node.media?.length || 0})` },
            { id: "add", label: `✚ Add Memory Note` }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                flex: 1, padding: "14px", background: "none", border: "none",
                borderBottom: activeTab === t.id ? "3px solid #6c63ff" : "none",
                color: activeTab === t.id ? "#6c63ff" : "var(--text-muted)",
                fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: activeTab === t.id ? 900 : 700,
                cursor: "pointer"
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Modal Body Content Area */}
        <div style={{ padding: 28, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
          
          {/* TAB 1: ARCHIVED RESOURCES */}
          {activeTab === "files" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "var(--text-muted)", fontWeight: 900 }}>
                ATTACHED FILES & REPO REFERENCES:
              </div>

              {(!node.files || node.files.length === 0) ? (
                <div style={{ padding: 24, textAlign: "center", fontSize: 14, color: "var(--text-muted)" }}>
                  No external resources attached yet. Click ✚ Add Memory Note to upload local notes or code links.
                </div>
              ) : (
                node.files.map((f, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: "14px 20px", borderRadius: 16,
                      background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                      display: "flex", alignItems: "center", justifyContent: "space-between"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span style={{ fontSize: 24 }}>{f.icon}</span>
                      <div>
                        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 900, color: "var(--text-main)" }}>
                          {f.name}
                        </div>
                        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "var(--text-muted)" }}>
                          {f.type} • {f.detail}
                        </div>
                      </div>
                    </div>

                    <span style={{
                      padding: "4px 12px", borderRadius: 10,
                      background: "rgba(108,99,255,0.12)", color: TYPE_COL[f.type] || "#6c63ff",
                      fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 900
                    }}>
                      {f.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: PRIVATE MEMORY SLOTS */}
          {activeTab === "slots" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "var(--text-muted)", fontWeight: 900 }}>
                PRIVATE MEMORY SLOTS (PERSONAL ACTIVE RECALL):
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
                {(node.slots || [null, null, null]).map((s, idx) => s ? (
                  <div
                    key={idx}
                    style={{
                      borderRadius: 18, padding: 16, background: s.bg || "rgba(108,99,255,0.1)",
                      border: `1.5px solid ${s.col || "#6c63ff"}`, display: "flex", flexDirection: "column", justifyContent: "space-between"
                    }}
                  >
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: s.col || "#6c63ff", fontWeight: 900, marginBottom: 8 }}>
                      SLOT {idx + 1} • PRIVATE RECALL
                    </div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, color: "var(--text-main)", fontStyle: "italic", lineHeight: 1.6 }}>
                      "{s.text}"
                    </div>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "var(--text-muted)", marginTop: 10 }}>
                      {s.date}
                    </div>
                  </div>
                ) : (
                  <div
                    key={idx}
                    onClick={() => setActiveTab("add")}
                    style={{
                      borderRadius: 18, padding: 16, background: "var(--bg-alt)",
                      border: "1.5px dashed var(--border-light)", cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 110
                    }}
                  >
                    <Plus size={22} color="var(--text-muted)" />
                    <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "var(--text-muted)", fontWeight: 800 }}>
                      + Add Reflection Slot
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CELEBRATION MEDIA & PHOTOS */}
          {activeTab === "media" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "var(--text-muted)", fontWeight: 900 }}>
                CELEBRATION MEDIA & CERTIFICATE SNAPSHOTS:
              </div>

              {(!node.media || node.media.length === 0) ? (
                <div style={{ padding: 24, textAlign: "center", fontSize: 14, color: "var(--text-muted)" }}>
                  No photos or screenshots uploaded for this node yet.
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
                  {node.media.map((m, idx) => (
                    <div key={idx} style={{ borderRadius: 16, overflow: "hidden", border: "1.5px solid var(--border-light)", background: "var(--bg-alt)" }}>
                      <img src={m.url} alt={m.name} style={{ width: "100%", height: 130, objectFit: "cover" }} />
                      <div style={{ padding: 10, fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 800, color: "var(--text-main)" }}>
                        {m.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ADD MEMORY NOTE FORM */}
          {activeTab === "add" && (
            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <label style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "#6c63ff", fontWeight: 900 }}>
                RECORD PERSONAL VAULT MEMORY NOTE:
              </label>
              <textarea
                value={newNoteText}
                onChange={e => setNewNoteText(e.target.value)}
                placeholder="Write your personal insight, key algorithmic trick, or milestone note..."
                style={{
                  width: "100%", height: 120, padding: 16, borderRadius: 18,
                  background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                  color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 14.5, outline: "none", resize: "none"
                }}
              />

              <button
                type="submit"
                style={{
                  padding: "14px", borderRadius: 16, border: "none",
                  background: "linear-gradient(135deg, #00c9a7, #6c63ff)", color: "#ffffff",
                  fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 900, cursor: "pointer"
                }}
              >
                Approve & Save to Personal Learning Vault
              </button>
            </form>
          )}

        </div>
      </motion.div>
    </div>
  );
}
