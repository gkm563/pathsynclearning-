"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AiFicationModal from "../../components/dashboard/AiFicationModal";
import { 
  Sun, Moon, Sparkles, Rocket, Compass, Zap, Target, BookOpen, 
  CheckCircle2, Plus, Search, Info, ShieldAlert, ArrowLeft, ArrowRight,
  FileText, Play, Award, Brain, Lock, RefreshCw, Layers, Star, Maximize2, Minimize2,
  ThumbsUp, Share2, MessageSquare, Download, Upload, Check, EyeOff
} from "lucide-react";
import { useSelectedCareer } from "@/hooks/useStudentData";
function TopDownCarGraphic({ carColor = "#ef4444" }) {
  return (
    <svg width="34" height="62" viewBox="0 0 34 62" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: "drop-shadow(0 10px 22px rgba(0,0,0,0.5))" }}>
      {/* Rubber Wheels */}
      <rect x="0" y="8" width="5" height="12" rx="2.5" fill="#0f172a" />
      <rect x="29" y="8" width="5" height="12" rx="2.5" fill="#0f172a" />
      <rect x="0" y="42" width="5" height="12" rx="2.5" fill="#0f172a" />
      <rect x="29" y="42" width="5" height="12" rx="2.5" fill="#0f172a" />

      {/* Aerodynamic Main Body Chassis */}
      <path d="M5 14C5 8 10 3 17 3C24 3 29 8 29 14V48C29 54 24 58 17 58C10 58 5 54 5 48V14Z" fill={carColor} stroke="#ffffff" strokeWidth="1.5" />
      
      {/* Center Racing Stripe */}
      <path d="M15 3H19V58H15V3Z" fill="#ffffff" opacity="0.4" />

      {/* Front Tinted Glass Windshield */}
      <path d="M8 20C8 17 11 15 17 15C23 15 26 17 26 20V26H8V20Z" fill="#0f172a" />
      <path d="M10 21C10 19 12 17.5 17 17.5C22 17.5 24 19 24 21V24H10V21Z" fill="#38bdf8" opacity="0.85" />

      {/* Rear Window */}
      <path d="M9 42H25V46C25 48.5 21.5 50 17 50C12.5 50 9 48.5 9 46V42Z" fill="#0f172a" />

      {/* Cabin Roof */}
      <rect x="9" y="27" width="16" height="14" rx="3" fill="#1e293b" />

      {/* Side Mirrors */}
      <rect x="1" y="19" width="3" height="5" rx="1.5" fill={carColor} />
      <rect x="30" y="19" width="3" height="5" rx="1.5" fill={carColor} />

      {/* Glowing Xenon Headlights */}
      <circle cx="9" cy="5" r="2.5" fill="#38bdf8" />
      <circle cx="25" cy="5" r="2.5" fill="#38bdf8" />

      {/* LED Taillights */}
      <rect x="8" y="56" width="5" height="2" rx="1" fill="#ff4d4d" />
      <rect x="21" y="56" width="5" height="2" rx="1" fill="#ff4d4d" />
    </svg>
  );
}

/* ─── DYNAMIC AI CAREER SKILL GENERATOR ─── */
function getRoadmapMajorNodes(targetCareer, extraInjectedSkills = [], userPriorityOrder = []) {
  const career = (targetCareer || "").toLowerCase();

  let defaultSkills = [];
  if (career.includes("ai") || career.includes("machine learning") || career.includes("data science") || career.includes("ml")) {
    defaultSkills = [
      { id: "python", label: "Python 3.12+", emoji: "🐍", color: "#ec4899", scope: "Core syntax, OOP, NumPy & Pandas." },
      { id: "math", label: "Linear Algebra", emoji: "📐", color: "#3b82f6", scope: "Matrices, calculus & probability." },
      { id: "ml_basics", label: "Classical ML", emoji: "📊", color: "#10b981", scope: "Regression, Trees & Scikit-Learn." },
      { id: "pytorch", label: "PyTorch & TF", emoji: "🔥", color: "#f59e0b", scope: "Neural Networks & GPU acceleration." },
      { id: "deep_learning", label: "Deep Learning", emoji: "🧠", color: "#8b5cf6", scope: "CNNs, ResNets & Computer Vision." },
      { id: "nlp_llms", label: "NLP & LLMs", emoji: "🤖", color: "#06b6d4", scope: "Transformers, RAG & LangChain." },
      { id: "vector_db", label: "Vector DBs", emoji: "🗄️", color: "#ec4899", scope: "Pinecone, ChromaDB & SQL." },
      { id: "mlops", label: "MLOps Engine", emoji: "⚡", color: "#3b82f6", scope: "MLflow, Docker & Model Registry." },
      { id: "sysdesign_ai", label: "AI System Design", emoji: "🏛️", color: "#10b981", scope: "Low-latency inference & caching." },
      { id: "cloud_ai", label: "Cloud AI Services", emoji: "☁️", color: "#f59e0b", scope: "AWS SageMaker & GCP Vertex." },
      { id: "ethics_ai", label: "AI Safety & Ethics", emoji: "🛡️", color: "#8b5cf6", scope: "Model alignment & bias audit." },
      { id: "capstone_ai", label: "Autonomous Agent", emoji: "🚀", color: "#06b6d4", scope: "Production AI Agent Capstone." }
    ];
  } else if (career.includes("devops") || career.includes("cloud") || career.includes("infra")) {
    defaultSkills = [
      { id: "linux", label: "Linux Admin", emoji: "💻", color: "#ec4899", scope: "Bash scripting & OS internals." },
      { id: "networking", label: "Networking", emoji: "🌐", color: "#3b82f6", scope: "TCP/IP, DNS & Firewalls." },
      { id: "docker", label: "Docker Engine", emoji: "🐳", color: "#10b981", scope: "Containers & multi-stage builds." },
      { id: "k8s", label: "Kubernetes", emoji: "☸️", color: "#f59e0b", scope: "Pods, Helm & Ingress." },
      { id: "aws", label: "AWS Cloud Arch", emoji: "☁️", color: "#8b5cf6", scope: "EC2, S3, VPC & IAM." },
      { id: "terraform", label: "Terraform IaC", emoji: "🏗️", color: "#ec4899", scope: "State mgmt & cloud automation." },
      { id: "cicd", label: "CI/CD Pipelines", emoji: "⚙️", color: "#06b6d4", scope: "GitHub Actions & Releases." },
      { id: "golang", label: "Golang & Python", emoji: "🐹", color: "#3b82f6", scope: "CLI automation tools." },
      { id: "prometheus", label: "Grafana Metrics", emoji: "📊", color: "#10b981", scope: "Prometheus & log monitoring." },
      { id: "sre", label: "Site Reliability", emoji: "⚡", color: "#f59e0b", scope: "SLOs & chaos engineering." },
      { id: "sysdesign_devops", label: "Scale Systems", emoji: "🏛️", color: "#8b5cf6", scope: "Global CDN & auto-scaling." },
      { id: "devsecops", label: "Zero-Trust Sec", emoji: "🛡️", color: "#06b6d4", scope: "Vault & secret management." }
    ];
  } else {
    // Default Full-Stack SDE
    defaultSkills = [
      { id: "dsa", label: "DSA Foundations", emoji: "🌳", color: "#ec4899", scope: "Arrays, Trees, Graphs & DP." },
      { id: "oop", label: "OOP & Java/C++", emoji: "☕", color: "#3b82f6", scope: "Classes, Inheritance & Design Patterns." },
      { id: "web_basics", label: "HTML5 & Tailwind", emoji: "🎨", color: "#10b981", scope: "Flexbox, Grid & Responsive UI." },
      { id: "react", label: "React & Next.js", emoji: "⚛️", color: "#f59e0b", scope: "JSX, Hooks & Server Components." },
      { id: "typescript", label: "TypeScript", emoji: "🔷", color: "#8b5cf6", scope: "Interfaces, Types & Generics." },
      { id: "nodejs", label: "Node.js Express", emoji: "🟩", color: "#06b6d4", scope: "REST APIs & Microservices." },
      { id: "dbms", label: "PostgreSQL & SQL", emoji: "🗄️", color: "#ec4899", scope: "Indexing, Joins & Schema Design." },
      { id: "nosql", label: "MongoDB & Redis", emoji: "🍃", color: "#10b981", scope: "NoSQL & In-memory caching." },
      { id: "sysdesign", label: "System Design", emoji: "🏛️", color: "#3b82f6", scope: "Scalability & Load Balancers." },
      { id: "cloud_devops", label: "Docker & AWS", emoji: "☁️", color: "#f59e0b", scope: "Containers & EC2 deployment." },
      { id: "web_security", label: "Web Security", emoji: "🛡️", color: "#8b5cf6", scope: "OWASP Top 10, JWT & CORS." },
      { id: "sde_capstone", label: "Full-Stack SaaS", emoji: "🚀", color: "#06b6d4", scope: "Production SaaS Capstone." }
    ];
  }

  let allSkills = [...defaultSkills];

  // ADDITIVE NODE INJECTION (AI-fication expands 12 -> 15/16/17/18 nodes)
  if (extraInjectedSkills && extraInjectedSkills.length > 0) {
    const colors = ["#00c9a7", "#ec4899", "#f59e0b", "#3b82f6", "#8b5cf6", "#06b6d4"];
    const emojis = ["⚡", "🧠", "🤖", "🛡️", "🔮", "🚀"];

    const extraSkillObjects = extraInjectedSkills.map((skLabel, idx) => {
      const isAlreadyIncluded = defaultSkills.some(s => s.label.toLowerCase().includes(skLabel.toLowerCase()));
      if (isAlreadyIncluded) return null;

      return {
        id: `ai_inj_${idx}_${Date.now()}`,
        label: `${skLabel}`,
        emoji: emojis[idx % emojis.length],
        color: colors[idx % colors.length],
        scope: `Market-demanded high-ROI skill dynamically injected by AI-fication engine.`,
        isAiInjected: true
      };
    }).filter(Boolean);

    allSkills = [...allSkills, ...extraSkillObjects];
  }

  // Priority re-ordering if selected
  let ordered = [...allSkills];
  if (userPriorityOrder && userPriorityOrder.length > 0) {
    ordered.sort((a, b) => {
      const idxA = userPriorityOrder.indexOf(a.label);
      const idxB = userPriorityOrder.indexOf(b.label);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return 0;
    });
  }

  // HIGHWAY ROADWAY MATH WITH EXTENDED 850px GAP & DYNAMIC CANVAS
  const canvasWidth = 1200;
  const startY = 220;
  const stepY = 850;

  return ordered.map((sk, index) => {
    const isDone = index < 2;
    const isActive = index === 2;

    const sinOffset = Math.sin(index * 0.85) * 240;
    const x = canvasWidth / 2 + sinOffset;
    const y = startY + index * stepY;

    return {
      ...sk,
      status: isDone ? "done" : isActive ? "active" : "locked",
      levelNum: index + 1,
      x,
      y,
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

/* ─── MATHEMATICALLY PERFECT 360° CIRCULAR SUNBURST GEOMETRY ─── */
function getPerfectCirclePositions(count, cx, cy, radius = 220) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (360 / count) * i - 90;
    const rad = (angle * Math.PI) / 180;
    
    const x = cx + radius * Math.cos(rad);
    const y = cy + radius * Math.sin(rad);

    const labelX = cx + (radius + 50) * Math.cos(rad);
    const labelY = cy + (radius + 50) * Math.sin(rad);

    return { x, y, labelX, labelY, angle, rad };
  });
}

/* ════════════════════════════════════════════════════════════
   UPLOAD MEMORY CARD MODAL (LOCAL FILE UPLOAD & APPROVAL)
════════════════════════════════════════════════════════════ */
function UploadMemoryModal({ isOpen, onClose, onSave, minorLabel }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("video");
  const [fileName, setFileName] = useState("");
  const [isApproved, setIsApproved] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleApproveAndSave = () => {
    if (!title) {
      alert("Please provide a title for your memory card.");
      return;
    }
    setIsApproved(true);
    setTimeout(() => {
      onSave({
        id: Date.now(),
        title: title || `${minorLabel} Note`,
        category,
        fileName: fileName || "uploaded_asset.png",
        date: new Date().toLocaleDateString()
      });
      setIsApproved(false);
      setTitle("");
      setFileName("");
      onClose();
    }, 600);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1200,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          width: "100%", maxWidth: 480, background: "var(--bg-card)",
          border: "1.5px solid var(--border-light)", borderRadius: 24,
          padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 24 }}>🧠</span>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
              Upload Memory Card
            </h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, color: "var(--text-muted)", cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, color: "var(--text-main)", marginBottom: 6 }}>
              Category
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {[
                { id: "video", label: "🎥 Video" },
                { id: "image", label: "🖼️ Image" },
                { id: "notes", label: "📄 Notes PDF" }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  style={{
                    padding: "10px", borderRadius: 12,
                    background: category === cat.id ? "rgba(108,99,255,0.12)" : "var(--bg-alt)",
                    border: `1.5px solid ${category === cat.id ? "#6c63ff" : "var(--border-light)"}`,
                    color: category === cat.id ? "#6c63ff" : "var(--text-main)",
                    fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 700, cursor: "pointer"
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, color: "var(--text-main)", marginBottom: 6 }}>
              Memory Title / Note Name
            </label>
            <input
              type="text"
              placeholder={`e.g. My ${minorLabel} Masterclass Summary...`}
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{
                width: "100%", padding: "12px 14px", borderRadius: 14,
                background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                color: "var(--text-main)", fontSize: 14, outline: "none"
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, color: "var(--text-main)", marginBottom: 6 }}>
              Upload Asset File from System
            </label>
            <div style={{
              border: "2px dashed var(--border-light)", borderRadius: 16, padding: "20px",
              textAlign: "center", background: "var(--bg-alt)", cursor: "pointer", position: "relative"
            }}>
              <input
                type="file"
                onChange={handleFileChange}
                style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
              />
              <Upload size={24} color="#6c63ff" style={{ margin: "0 auto 8px" }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)" }}>
                {fileName ? `File: ${fileName}` : "Click or drag local file to upload"}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                Supports MP4, PNG, JPG, PDF up to 50MB
              </div>
            </div>
          </div>

          <button
            onClick={handleApproveAndSave}
            disabled={isApproved}
            style={{
              width: "100%", marginTop: 8, padding: "14px", borderRadius: 14, border: "none",
              background: isApproved ? "#10b981" : "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff",
              fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800,
              cursor: "pointer", boxShadow: "0 4px 16px rgba(108,99,255,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8
            }}
          >
            {isApproved ? (
              <><span>✓ Approved & Saved to System</span></>
            ) : (
              <><span>Approve & Upload Memory</span></>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAXIMIZED RESOURCE FULL VIEW (YOUTUBE INTERFACE STYLE)
════════════════════════════════════════════════════════════ */
function MaximizedResourceView({ majorNode, minorNode, onClose, onStudy }) {
  const [activeVideo, setActiveVideo] = useState<any>({
    id: "v1",
    title: `${minorNode.label} Masterclass & Architecture Sprint`,
    embedId: "dQw4w9WgXcQ",
    channel: "PathEd AI Formulation",
    views: "2.4M views",
    date: "1 day ago"
  });

  const [activeNote, setActiveNote] = useState({
    name: `${minorNode.label} Complete Cheatsheet & Code Reference.pdf`,
    size: "1.4 MB",
    content: `Comprehensive guide to ${minorNode.label}. Includes core syntax, best practices, asymptotic complexity, and production architecture rules.`
  });

  const [isSplitView, setIsSplitView] = useState(false);
  const [activeAssessment, setActiveAssessment] = useState<any>(null); // Non-null when taking test (triggers blackout!)
  const [assessmentStep, setAssessmentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadedMemories, setUploadedMemories] = useState([
    { id: 1, title: `${minorNode.label} Memory Note 1`, category: "notes", date: "Today" },
    { id: 2, title: `Diagram & Mindmap`, category: "image", date: "Yesterday" }
  ]);

  const videos = [
    { id: "v1", title: `${minorNode.label} Masterclass`, dur: "18:45", views: "1.2M views", channel: "PathEd AI" },
    { id: "v2", title: `Top 20 Interview Questions`, dur: "24:10", views: "850K views", channel: "PathEd Career" },
    { id: "v3", title: `Real Architecture Lab`, dur: "31:05", views: "540K views", channel: "System Design" },
    { id: "v4", title: `Hands-on Code Sprint`, dur: "15:20", views: "310K views", channel: "Live Code" }
  ];

  const quizQuestions = [
    { q: `What is the primary architectural rule of ${minorNode.label}?`, opts: ["High Coupling", "Separation of Concerns", "Global Mutable State", "Blocking I/O"] },
    { q: `Which time complexity target should be achieved for ${minorNode.label} lookup?`, opts: ["O(1) or O(log N)", "O(N^2)", "O(2^N)", "O(N!)"] },
    { q: `How do you prevent race conditions in ${minorNode.label}?`, opts: ["Mutex locks or atomic state", "Ignore threads", "Use infinite loops", "Increase RAM"] }
  ];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "var(--bg-main)", color: "var(--text-main)",
      display: "flex", flexDirection: "column", overflow: "hidden"
    }}>
      {/* ── YOUTUBE TOP NAVBAR ── */}
      <header style={{
        height: 64, background: "var(--bg-card)", borderBottom: "1.5px solid var(--border-light)",
        padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 24 }}>{majorNode.emoji}</span>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900, color: "var(--text-main)" }}>
              {majorNode.label} <span style={{ color: "#6c63ff" }}>› {minorNode.label}</span>
            </span>
          </div>
          <span style={{
            padding: "4px 10px", borderRadius: 10,
            background: "rgba(108,99,255,0.12)", color: "#6c63ff",
            fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 800
          }}>
            FULL YOUTUBE RESOURCE VIEW
          </span>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Split View Toggle */}
          <button
            onClick={() => setIsSplitView(!isSplitView)}
            style={{
              padding: "8px 14px", borderRadius: 12, border: "1.5px solid var(--border-light)",
              background: isSplitView ? "rgba(108,99,255,0.15)" : "var(--bg-alt)",
              color: isSplitView ? "#6c63ff" : "var(--text-main)",
              fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 800,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6
            }}
          >
            <Layers size={16} /> {isSplitView ? "Split View Active" : "Enable Split View (Video + Notes)"}
          </button>

          {/* Minimize / Close */}
          <button
            onClick={onClose}
            style={{
              width: 38, height: 38, borderRadius: 12, background: "var(--bg-alt)",
              border: "1.5px solid var(--border-light)", color: "var(--text-main)",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
            }}
            title="Minimize to Side Panel"
          >
            <Minimize2 size={18} />
          </button>
        </div>
      </header>

      {/* ── MAIN CONTENT (68% LEFT YOUTUBE PLAYER & NOTES / 32% RIGHT SIDEBAR) ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── LEFT REGION (VIDEO PLAYER / NOTES / ASSESSMENT INTERFACE) ── */}
        <div style={{ flex: "1 1 68%", padding: 24, overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* 1. ASSESSMENT TEST INTERFACE (IF ACTIVE) */}
          {activeAssessment ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: "var(--bg-card)", border: "2px solid #ef4444", borderRadius: 24,
                padding: 28, boxShadow: "0 10px 40px rgba(239,68,68,0.15)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <span style={{ padding: "4px 10px", borderRadius: 8, background: "#ef444420", color: "#ef4444", fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 900 }}>
                    🧪 ASSESSMENT IN PROGRESS
                  </span>
                  <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 900, color: "var(--text-main)", margin: "8px 0 4px" }}>
                    {minorNode.label} — {activeAssessment}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveAssessment(null)}
                  style={{
                    padding: "8px 14px", borderRadius: 10, border: "1px solid var(--border-light)",
                    background: "var(--bg-alt)", color: "var(--text-main)", fontSize: 12, fontWeight: 700, cursor: "pointer"
                  }}
                >
                  Exit Test
                </button>
              </div>

              {/* Blackout Warning Bar */}
              <div style={{ padding: "12px 16px", borderRadius: 14, background: "rgba(239,68,68,0.08)", border: "1px solid #ef444440", color: "#ef4444", fontSize: 12.5, fontWeight: 700, marginBottom: 20 }}>
                🔒 Reference materials, suggested videos, and notes are blacked out on the right sidebar while you complete this assessment.
              </div>

              {/* Quiz Questions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-main)" }}>
                  Question {assessmentStep + 1} of {quizQuestions.length}: {quizQuestions[assessmentStep].q}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {quizQuestions[assessmentStep].opts.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => setUserAnswers({ ...userAnswers, [assessmentStep]: oIdx })}
                      style={{
                        padding: "14px 18px", borderRadius: 14, textAlign: "left",
                        background: userAnswers[assessmentStep] === oIdx ? "rgba(108,99,255,0.12)" : "var(--bg-alt)",
                        border: `1.5px solid ${userAnswers[assessmentStep] === oIdx ? "#6c63ff" : "var(--border-light)"}`,
                        color: userAnswers[assessmentStep] === oIdx ? "#6c63ff" : "var(--text-main)",
                        fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, cursor: "pointer"
                      }}
                    >
                      {String.fromCharCode(65 + oIdx)}. {opt}
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
                  <button
                    disabled={assessmentStep === 0}
                    onClick={() => setAssessmentStep(s => s - 1)}
                    style={{ padding: "10px 18px", borderRadius: 12, border: "1px solid var(--border-light)", background: "var(--bg-alt)", color: "var(--text-main)", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                  >
                    Previous Question
                  </button>
                  {assessmentStep < quizQuestions.length - 1 ? (
                    <button
                      onClick={() => setAssessmentStep(s => s + 1)}
                      style={{ padding: "10px 18px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer" }}
                    >
                      Next Question →
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        alert(`🎉 Assessment Submitted! You scored 90% on ${minorNode.label}!`);
                        onStudy(majorNode.id, minorNode.id);
                        setActiveAssessment(null);
                      }}
                      style={{ padding: "10px 22px", borderRadius: 12, border: "none", background: "#10b981", color: "#fff", fontSize: 13, fontWeight: 900, cursor: "pointer" }}
                    >
                      Submit Assessment ✅
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              {/* 2. MAXIMIZED YOUTUBE VIDEO PLAYER CONTAINER (Covers max screen height in 1st view) */}
              <div style={{
                background: "#0f0f0f", borderRadius: 24, overflow: "hidden",
                boxShadow: "0 20px 50px rgba(0,0,0,0.35)", position: "relative",
                flexShrink: 0
              }}>
                {/* Max Screen Height Video Iframe (calc(100vh - 190px)) */}
                <div style={{
                  position: "relative", width: "100%", height: "calc(100vh - 190px)",
                  minHeight: 560, background: "#000", display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube-nocookie.com/embed/${activeVideo.embedId}?autoplay=1&rel=0`}
                    title={activeVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ border: "none" }}
                  />
                </div>

                {/* Video Info Bar (YouTube Watch Layout) */}
                <div style={{ padding: "24px 28px", background: "var(--bg-card)", borderTop: "1.5px solid var(--border-light)" }}>
                  <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 900, color: "var(--text-main)", margin: "0 0 14px" }}>
                    {activeVideo.title}
                  </h2>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, #ef4444, #6c63ff)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 20 }}>
                        P
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, color: "var(--text-main)" }}>
                          {activeVideo.channel}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>22.9M subscribers • Verified AI Educator</div>
                      </div>
                      <button style={{ padding: "10px 22px", borderRadius: 22, border: "none", background: "var(--text-main)", color: "var(--bg-main)", fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 800, cursor: "pointer" }}>
                        Subscribe
                      </button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 22, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
                        <ThumbsUp size={18} /> 1.9M
                      </button>
                      <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 22, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
                        <Share2 size={18} /> Share
                      </button>
                      <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 22, background: "rgba(108,99,255,0.12)", border: "1.5px solid #6c63ff50", color: "#6c63ff", fontSize: 13.5, fontWeight: 800, cursor: "pointer" }}>
                        ✨ Ask AI Summary
                      </button>
                    </div>
                  </div>

                  {/* Scroll Down Indicator */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 18, paddingTop: 14, borderTop: "1px dashed var(--border-light)", color: "var(--text-muted)", fontSize: 12.5, fontWeight: 700, fontFamily: "'Fira Code', monospace" }}>
                    <span>📜 Scroll Down to Read Notes & Cheatsheet Documents</span>
                    <span>↓</span>
                  </div>
                </div>
              </div>

              {/* 3. FULL DOCUMENT & NOTES REGION (REVEALED ON SCROLL DOWN - MAX SCREEN COVERAGE) */}
              <div style={{
                minHeight: "calc(100vh - 180px)", background: "var(--bg-card)",
                border: "1.5px solid var(--border-light)", borderRadius: 24,
                padding: 32, boxShadow: "0 10px 36px rgba(0,0,0,0.08)",
                display: "flex", flexDirection: "column", gap: 24, marginTop: 12
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1.5px solid var(--border-light)", paddingBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(108,99,255,0.12)", border: "1.5px solid #6c63ff40", display: "flex", alignItems: "center", justifyContent: "center", color: "#6c63ff" }}>
                      <FileText size={24} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "#6c63ff", fontWeight: 800, letterSpacing: 1 }}>
                        DOCUMENT & CHEATSHEET VIEW
                      </div>
                      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 900, color: "var(--text-main)", margin: "2px 0 0" }}>
                        {activeNote.name}
                      </h3>
                    </div>
                  </div>
                  <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 14, background: "#00c9a715", border: "1.5px solid #00c9a740", color: "#00c9a7", fontSize: 13.5, fontWeight: 800, cursor: "pointer" }}>
                    <Download size={16} /> Download Full PDF ({activeNote.size})
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
                    📌 Executive Overview & Core Architectural Concepts
                  </h4>
                  <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
                    {activeNote.content} Master all underlying data structures, design patterns, and asymptotic complexities. Use this document as your primary study guide prior to attempting technical interviews and practice challenges.
                  </p>

                  <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "var(--text-main)", margin: "14px 0 0" }}>
                    💻 Production Implementation Blueprint
                  </h4>
                  <div style={{ padding: 20, borderRadius: 16, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", fontFamily: "'Fira Code', monospace", fontSize: 13, color: "var(--text-main)", lineHeight: 1.6 }}>
                    // PathEd Production Standard for {minorNode.label}<br />
                    class SkillNodeController &#123;<br />
                    &nbsp;&nbsp;constructor(config) &#123;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;this.nodeId = config.id;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;this.masteryLevel = config.fill;<br />
                    &nbsp;&nbsp;&#125;<br /><br />
                    &nbsp;&nbsp;async executeOptimizedPipeline(inputData) &#123;<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;const validated = await this.validateSchema(inputData);<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;return validated.transformToProductionFormat();<br />
                    &nbsp;&nbsp;&#125;<br />
                    &#125;
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 10 }}>
                    <div style={{ padding: 18, borderRadius: 16, background: "rgba(0,201,167,0.08)", border: "1.5px solid #00c9a740" }}>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, color: "#00c9a7", marginBottom: 6 }}>
                        ✅ Best Practices
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, color: "var(--text-main)", lineHeight: 1.6 }}>
                        <li>Maintain low coupling across module boundaries.</li>
                        <li>Enforce strict type-checking and null safety.</li>
                        <li>Audit asymptotic complexity for large datasets.</li>
                      </ul>
                    </div>

                    <div style={{ padding: 18, borderRadius: 16, background: "rgba(239,68,68,0.08)", border: "1.5px solid #ef444440" }}>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, color: "#ef4444", marginBottom: 6 }}>
                        ⚠️ Common Pitfalls
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, color: "var(--text-main)", lineHeight: 1.6 }}>
                        <li>Avoid synchronous blocking operations in main thread.</li>
                        <li>Do not mutate global state directly without locks.</li>
                        <li>Watch for unindexed query performance hits.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>

        {/* ── RIGHT REGION (32% YOUTUBE SUGGESTED SIDEBAR WITH BLACKOUT PROTECTION) ── */}
        <div style={{ flex: "0 0 32%", borderLeft: "1.5px solid var(--border-light)", padding: 20, overflowY: "auto", position: "relative", background: "var(--bg-card)" }}>

          {/* BLACKOUT OVERLAY WHEN TAKING ASSESSMENT */}
          {activeAssessment && (
            <div style={{
              position: "absolute", inset: 0, zIndex: 100,
              background: "rgba(15, 15, 20, 0.96)", backdropFilter: "blur(12px)",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              padding: 30, textAlign: "center"
            }}>
              <EyeOff size={48} color="#ef4444" style={{ marginBottom: 14 }} />
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 900, color: "#ef4444", marginBottom: 8 }}>
                BLACKOUT MODE ACTIVE
              </h3>
              <p style={{ fontSize: 13, color: "#aaa", lineHeight: 1.5, maxWidth: 260 }}>
                Suggested videos, notes, and memory cards are locked & blacked out to prevent cheating during the assessment.
              </p>
            </div>
          )}

          {/* YOUTUBE SUGGESTED VIDEOS */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, color: "var(--text-main)", marginBottom: 12 }}>
              📹 Suggested Videos
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {videos.map((v) => (
                <div
                  key={v.id}
                  onClick={() => setActiveVideo({ ...v, embedId: "dQw4w9WgXcQ" })}
                  style={{
                    display: "flex", gap: 12, padding: 8, borderRadius: 14,
                    background: activeVideo.id === v.id ? "rgba(108,99,255,0.12)" : "var(--bg-alt)",
                    border: `1.5px solid ${activeVideo.id === v.id ? "#6c63ff" : "var(--border-light)"}`,
                    cursor: "pointer"
                  }}
                >
                  <div style={{
                    width: 120, height: 68, borderRadius: 10, background: "linear-gradient(135deg, #ef444415, #6c63ff15)",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", flexShrink: 0
                  }}>
                    <Play size={22} fill="#ef4444" />
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 800, color: "var(--text-main)", lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {v.title}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{v.channel}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", fontFamily: "'Fira Code', monospace" }}>{v.views} • ⏱️ {v.dur}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* REFERENCE MATERIALS */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, color: "var(--text-main)", marginBottom: 12 }}>
              📄 Reference Materials
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { name: `${minorNode.label} Cheatsheet.pdf`, size: "1.4 MB" },
                { name: `Lecture Notes & GitHub Repo`, size: "GitHub" },
                { name: `Official API Documentation`, size: "Web Docs" }
              ].map((doc, i) => (
                <div
                  key={i}
                  onClick={() => setActiveNote({ name: doc.name, size: doc.size, content: `Study material for ${doc.name}` })}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 12px", borderRadius: 12, background: "var(--bg-alt)",
                    border: "1px solid var(--border-light)", cursor: "pointer"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FileText size={16} color="#6c63ff" />
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-main)" }}>{doc.name}</span>
                  </div>
                  <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "#00c9a7" }}>{doc.size}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ASSESSMENTS */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, color: "var(--text-main)", marginBottom: 12 }}>
              🧪 Assessments (Triggers Blackout Mode)
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {["Test 1", "Test 2", "Test 3"].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setActiveAssessment(t);
                    setAssessmentStep(0);
                  }}
                  style={{
                    padding: "10px", borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg, #ef4444, #f7971e)", color: "#fff",
                    fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 800, cursor: "pointer"
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* RECORD / MEMORY CARDS */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, color: "var(--text-main)" }}>
                🧠 Record / Memory Cards
              </div>
              <button
                onClick={() => setIsUploadOpen(true)}
                style={{
                  padding: "5px 12px", borderRadius: 10, border: "none",
                  background: "#ef4444", color: "#fff", fontFamily: "'Outfit', sans-serif",
                  fontSize: 11.5, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 4
                }}
              >
                + Add
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {uploadedMemories.map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: "10px 12px", borderRadius: 12, background: "var(--bg-alt)",
                    border: "1px solid var(--border-light)", fontSize: 12, fontWeight: 700,
                    color: "var(--text-main)", display: "flex", alignItems: "center", justifyContent: "space-between"
                  }}
                >
                  <span>{m.title}</span>
                  <span style={{ fontSize: 10, color: "#6c63ff", fontFamily: "'Fira Code', monospace" }}>{m.date}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* UPLOAD MEMORY CARD MODAL */}
      <UploadMemoryModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        minorLabel={minorNode.label}
        onSave={(newCard) => setUploadedMemories([newCard, ...uploadedMemories])}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   SIDE RESOURCE PANEL COMPONENT (DRAWER WITH MAXIMIZE BUTTON)
════════════════════════════════════════════════════════════ */
function ResourcePanel({ majorNode, minorNode, onStudy, onClose, isLocked }) {
  const [isMaximized, setIsMaximized] = useState(false);

  if (!minorNode || !majorNode) return null;

  return (
    <>
      {/* FULLSCREEN MAXIMIZED YOUTUBE RESOURCE VIEW */}
      {isMaximized && (
        <MaximizedResourceView
          majorNode={majorNode}
          minorNode={minorNode}
          onClose={() => setIsMaximized(false)}
          onStudy={onStudy}
        />
      )}

      {/* COMPACT SIDE DRAWER RESOURCE PANEL */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        style={{
          width: 440, background: "var(--bg-card)",
          border: "1.5px solid var(--border-light)", borderRadius: 28,
          padding: 28, boxShadow: "0 20px 60px rgba(0,0,0,0.16)",
          display: "flex", flexDirection: "column", gap: 24,
          maxHeight: "calc(100vh - 110px)", overflowY: "auto",
          position: "relative", zIndex: 90
        }}
      >
        {/* Header */}
        <div style={{ borderBottom: "1.5px solid var(--border-light)", paddingBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 34 }}>{majorNode.emoji}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* MAXIMIZE / FULL VIEW BUTTON */}
              <button
                onClick={() => setIsMaximized(true)}
                title="Maximize / Expand to Full Screen YouTube View"
                style={{
                  width: 36, height: 36, borderRadius: 12, background: "rgba(108,99,255,0.12)",
                  border: "1.5px solid #6c63ff40", cursor: "pointer", color: "#6c63ff",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                <Maximize2 size={18} />
              </button>
              <button
                onClick={onClose}
                style={{
                  width: 36, height: 36, borderRadius: 12, background: "var(--bg-alt)",
                  border: "1px solid var(--border-light)", cursor: "pointer", color: "var(--text-muted)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16
                }}
              >
                ✕
              </button>
            </div>
          </div>

          <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 23, fontWeight: 800, color: "var(--text-main)", margin: "0 0 6px" }}>
            {minorNode.label} <span style={{ fontSize: 14, color: "var(--text-muted)", fontWeight: 500 }}>(Minor Node)</span>
          </h3>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
            <span style={{
              padding: "5px 12px", borderRadius: 12,
              background: minorNode.fill >= 100 ? "rgba(0,201,167,0.12)" : "rgba(247,151,30,0.12)",
              color: minorNode.fill >= 100 ? "#00c9a7" : "#f7971e",
              fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 800
            }}>
              {minorNode.fill >= 100 ? "Completed ✅" : "In-progress"}
            </span>
            <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 700, color: "var(--text-main)" }}>
              Mastery: {minorNode.fill}%
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ width: "100%", height: 10, borderRadius: 5, background: "var(--bg-alt)", border: "1px solid var(--border-light)", marginTop: 12, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${minorNode.fill}%`, background: "linear-gradient(90deg, #6c63ff, #00c9a7)", borderRadius: 5, transition: "width 0.4s ease" }} />
          </div>

          {!isLocked && minorNode.fill < 100 && (
            <button
              onClick={() => onStudy(majorNode.id, minorNode.id)}
              style={{
                width: "100%", marginTop: 16, padding: "14px", borderRadius: 16, border: "none",
                background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff",
                fontFamily: "'Outfit', sans-serif", fontSize: 15.5, fontWeight: 800,
                cursor: "pointer", boxShadow: "0 6px 20px rgba(108,99,255,0.35)"
              }}
            >
              📚 Study & Practice (+20%)
            </button>
          )}
        </div>

        {isLocked ? (
          <div style={{
            padding: "24px", borderRadius: 20, background: "rgba(247,151,30,0.08)",
            border: "1.5px solid #f7971e40", textAlign: "center"
          }}>
            <Lock size={36} color="#f7971e" style={{ margin: "0 auto 12px" }} />
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "#f7971e", marginBottom: 8 }}>
              Resources Locked
            </div>
            <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.55, margin: 0 }}>
              Although you can inspect subtopics in the roadmap sunburst, learning resources are only unlocked for your current active level (<strong>{majorNode.label}</strong>).
            </p>
          </div>
        ) : (
          <>
            {/* SUGGESTED VIDEOS */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)" }}>
                  📹 Suggested Videos
                </label>
                <button
                  onClick={() => setIsMaximized(true)}
                  style={{ border: "none", background: "none", color: "#6c63ff", fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 800, cursor: "pointer" }}
                >
                  🗖 Expand View
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { title: `${minorNode.label} Masterclass`, dur: "18:45" },
                  { title: `Top Interview Questions`, dur: "24:10" },
                  { title: `Real Architecture Lab`, dur: "31:05" },
                  { title: `Hands-on Code Sprint`, dur: "15:20" }
                ].map((v, i) => (
                  <div
                    key={i}
                    onClick={() => setIsMaximized(true)}
                    style={{
                      background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                      borderRadius: 16, padding: 12, cursor: "pointer"
                    }}
                  >
                    <div style={{
                      height: 64, borderRadius: 12, background: "linear-gradient(135deg, rgba(239,68,68,0.15), rgba(108,99,255,0.15))",
                      display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", marginBottom: 8
                    }}>
                      <Play size={24} fill="#ef4444" />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-main)", lineHeight: 1.35 }}>
                      {v.title}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4, fontFamily: "'Fira Code', monospace" }}>
                      ⏱️ {v.dur}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* REFERENCE MATERIALS */}
            <div>
              <label style={{ display: "block", fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 12 }}>
                📄 Reference Materials
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { name: `${minorNode.label} Cheatsheet.pdf`, size: "1.4 MB" },
                  { name: `Lecture Notes & GitHub Repo`, size: "GitHub" },
                  { name: `Official API Documentation`, size: "Web Docs" }
                ].map((doc, i) => (
                  <div
                    key={i}
                    onClick={() => setIsMaximized(true)}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 16px", borderRadius: 14, background: "var(--bg-alt)",
                      border: "1.5px solid var(--border-light)", cursor: "pointer"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <FileText size={18} color="#6c63ff" />
                      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-main)" }}>{doc.name}</span>
                    </div>
                    <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 700, color: "#00c9a7" }}>
                      {doc.size}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ASSESSMENTS */}
            <div>
              <label style={{ display: "block", fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)", marginBottom: 12 }}>
                🧪 Assessments
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 10 }}>
                {["Test 1", "Test 2", "Test 3"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setIsMaximized(true)}
                    style={{
                      padding: "12px", borderRadius: 14, border: "none",
                      background: "linear-gradient(135deg, #ef4444, #f7971e)", color: "#fff",
                      fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, cursor: "pointer"
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>
                Total Score: <span style={{ color: "#00c9a7" }}>85%</span>
              </div>
            </div>

            {/* RECORD / MEMORY CARDS */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <label style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "var(--text-main)" }}>
                  🧠 Record / Memory Cards
                </label>
                <button
                  onClick={() => setIsMaximized(true)}
                  style={{
                    padding: "6px 14px", borderRadius: 10, border: "none",
                    background: "#ef4444", color: "#fff", fontFamily: "'Outfit', sans-serif",
                    fontSize: 12, fontWeight: 800, cursor: "pointer"
                  }}
                >
                  + Add
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {["Memory #1", "Memory #2", "Memory #3"].map((card, i) => (
                  <div
                    key={i}
                    onClick={() => setIsMaximized(true)}
                    style={{
                      padding: "14px 10px", borderRadius: 14, background: "var(--bg-alt)",
                      border: "1.5px solid var(--border-light)", fontSize: 12, fontWeight: 700,
                      color: "var(--text-muted)", textAlign: "center", cursor: "pointer"
                    }}
                  >
                    {card}
                  </div>
                ))}
              </div>
            </div>

            {/* COMMUNITY DISCUSSION */}
            <div style={{ borderTop: "1.5px solid var(--border-light)", paddingTop: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 18 }}>💬</span>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, color: "var(--text-main)" }}>
                  Community Tips
                </span>
              </div>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
                "Master core patterns for {minorNode.label} before attempting hard interview questions."
              </p>
            </div>
          </>
        )}
      </motion.div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN PLATFORM SKILL ROADMAP COMPONENT
════════════════════════════════════════════════════════════ */
export default function PlatformSkillRoadmap() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("roadmap");

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const targetCareer = useSelectedCareer();

  const [nodes, setNodes] = useState(() => getRoadmapMajorNodes(targetCareer));
  const [expandedMajorId, setExpandedMajorId] = useState(nodes[2]?.id || null);
  const [selectedMinor, setSelectedMinor] = useState<any>(null);
  const [selectedMajor, setSelectedMajor] = useState(nodes[2] || null);

  useEffect(() => {
    const nextNodes = getRoadmapMajorNodes(targetCareer);
    setNodes(nextNodes);
    setExpandedMajorId(nextNodes[2]?.id || null);
    setSelectedMajor(nextNodes[2] || null);
  }, [targetCareer]);

  // AI-fication Modal & Toast State
  const [isAiFicationOpen, setIsAiFicationOpen] = useState(false);
  const [aiToastMessage, setAiToastMessage] = useState("");

  // Car Animation State
  const [carNodeIndex, setCarNodeIndex] = useState(2);
  const [prevCarNodeIndex, setPrevCarNodeIndex] = useState(2);

  const changeCarLevel = (newIdx) => {
    setPrevCarNodeIndex(carNodeIndex);
    setCarNodeIndex(newIdx);
  };

  // Zoom & Pan Canvas State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, px: 0, py: 0 });
  const canvasRef = useRef<any>(null);

  /* ─── [TESTING_OVERRIDE: AUTO_CAMERA_TRACKING_AND_PANNING] ─── */
  const centerCameraOnNode = (targetIndex, currentZoom = zoom) => {
    if (!nodes || !nodes[targetIndex]) return;
    const targetNode = nodes[targetIndex];
    const vw = canvasRef.current?.getBoundingClientRect()?.width || 800;
    const vh = canvasRef.current?.getBoundingClientRect()?.height || 600;

    // Calculate pan coordinates to bring targetNode directly to screen center
    const newPanX = vw / 2 - targetNode.x * currentZoom;
    const newPanY = vh / 2 - targetNode.y * currentZoom;

    setPan({ x: newPanX, y: newPanY });
  };

  // Automatically track and center camera on target node whenever car drives or zoom changes!
  useEffect(() => {
    centerCameraOnNode(carNodeIndex, zoom);
  }, [carNodeIndex, zoom]);

  // Minor Node Study Action (+20%)
  const handleFillMinor = (majorId, minorId) => {
    setNodes(prev => prev.map(n => {
      if (n.id !== majorId) return n;
      const updatedMinor = n.minor.map(m => m.id === minorId ? { ...m, fill: Math.min(100, m.fill + 20) } : m);
      return { ...n, minor: updatedMinor };
    }));

    if (selectedMinor && selectedMinor.id === minorId) {
      setSelectedMinor(prev => ({ ...prev, fill: Math.min(100, prev.fill + 20) }));
    }
  };

  // Car Jump Handlers (DO NOT auto-trigger sunburst on car jump)
  const handleJumpForward = () => {
    const nextIdx = Math.min(nodes.length - 1, carNodeIndex + 1);
    setSelectedMajor(nodes[nextIdx]);
    changeCarLevel(nextIdx);
  };

  const handleJumpBackward = () => {
    const prevIdx = Math.max(0, carNodeIndex - 1);
    setSelectedMajor(nodes[prevIdx]);
    changeCarLevel(prevIdx);
  };

  // Canvas Drag Handlers
  const handleMouseDown = (e) => {
    if (e.target.closest("[data-node]")) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY, px: pan.x, py: pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: dragStart.px + (e.clientX - dragStart.x),
      y: dragStart.py + (e.clientY - dragStart.y)
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  /* ── HIGHWAY ASPHALT ROADWAY WITH DASHED CENTER LINE ── */
  const renderAsphaltRoadway = () => {
    if (nodes.length === 0) return null;

    let pathD = `M ${nodes[0].x} ${nodes[0].y}`;

    for (let i = 0; i < nodes.length - 1; i++) {
      const p1 = nodes[i];
      const p2 = nodes[i + 1];
      const cy1 = p1.y + (p2.y - p1.y) / 2;
      const cy2 = p1.y + (p2.y - p1.y) / 2;
      pathD += ` C ${p1.x} ${cy1}, ${p2.x} ${cy2}, ${p2.x} ${p2.y}`;
    }

    return (
      <>
        {/* Outer Dark Asphalt Road Casing */}
        <path
          d={pathD}
          fill="none"
          stroke="#2d2d3a"
          strokeWidth="60"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.18))" }}
        />

        {/* Outer White Road Edges */}
        <path
          d={pathD}
          fill="none"
          stroke="#3f3f54"
          strokeWidth="54"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Inner Dark Pavement */}
        <path
          d={pathD}
          fill="none"
          stroke="#232330"
          strokeWidth="46"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Center Dashed Highway Line */}
        <path
          d={pathD}
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="14 14"
        />
      </>
    );
  };

/* ════════════════════════════════════════════════════════════
   [PATHED OFFICIAL ARCHITECTURE & TESTING CLASSIFICATION]
   ------------------------------------------------------------
   TEMPORARY TESTING WIDGET:
   • [TEMPORARY_TESTING_WIDGET: FLOATING_JUMP_CONTROLLER]
     (Bottom-right Jump Fwd / Jump Back buttons)

   OFFICIAL CORE PRODUCT FEATURES:
   • [OFFICIAL_CORE_FEATURE: ROAD_CUBIC_BEZIER_CENTERLINE]
   • [OFFICIAL_CORE_FEATURE: CAR_POST_NODE_VS_PRE_NODE_POSITIONING]
   • [OFFICIAL_CORE_FEATURE: TOP_DOWN_2D_CAR_AND_BADGE_PILL]
   • [OFFICIAL_CORE_FEATURE: AUTO_CAMERA_TRACKING_5S_SYNC]
   • [OFFICIAL_CORE_FEATURE: SUNBURST_EXPLICIT_NODE_CLICK_TRIGGER]
   • [OFFICIAL_CORE_FEATURE: CAR_DISAPPEAR_ON_SUNBURST]
   • [OFFICIAL_CORE_FEATURE: YOUTUBE_MAXIMIZED_RESOURCE_PANEL]
════════════════════════════════════════════════════════════ */

/* ─── [TESTING_OVERRIDE: ROAD_CUBIC_BEZIER_CENTERLINE] ─── */
function getBezierPointAndAngle(p1, p2, t) {
  const x1 = p1.x, y1 = p1.y;
  const x2 = p2.x, y2 = p2.y;
  const cx1 = x1, cy1 = y1 + (y2 - y1) / 2;
  const cx2 = x2, cy2 = y1 + (y2 - y1) / 2;

  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  const t2 = t * t;
  const t3 = t2 * t;

  // Cubic Bezier position on curve
  const x = mt3 * x1 + 3 * mt2 * t * cx1 + 3 * mt * t2 * cx2 + t3 * x2;
  const y = mt3 * y1 + 3 * mt2 * t * cy1 + 3 * mt * t2 * cy2 + t3 * y2;

  // Cubic Bezier derivative tangent (dx/dt, dy/dt)
  const dx = 3 * mt2 * (cx1 - x1) + 6 * mt * t * (cx2 - cx1) + 3 * t2 * (x2 - cx2);
  const dy = 3 * mt2 * (cy1 - y1) + 6 * mt * t * (cy2 - cy1) + 3 * t2 * (y2 - cy2);

  const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

  return { x, y, angle };
}

/* ─── [TESTING_OVERRIDE: CAR_POST_NODE_VS_PRE_NODE_POSITIONING] ─── */
function getCarPositionAndAngle(carNodeIndex, nodes) {
  if (!nodes || nodes.length === 0) return { x: 600, y: 220, angle: 90 };

  const currentCarNode = nodes[carNodeIndex] || nodes[0];
  const isCompleted = currentCarNode.status === "done";

  // Level 1 Node (or any completed node at index 0): Always place POST-NODE 1 (t = 0.14)
  if (carNodeIndex === 0) {
    if (nodes.length > 1) {
      return getBezierPointAndAngle(nodes[0], nodes[1], 0.14);
    }
    return { x: nodes[0].x, y: nodes[0].y + 110, angle: 90 };
  }

  // If jumping back/moving to ANY completed node:
  // Car completely crosses the node and stops at POST-NODE position (t = 0.14) on the outgoing segment!
  if (isCompleted) {
    if (carNodeIndex < nodes.length - 1) {
      return getBezierPointAndAngle(nodes[carNodeIndex], nodes[carNodeIndex + 1], 0.14);
    } else {
      return { x: currentCarNode.x, y: currentCarNode.y + 110, angle: 90 };
    }
  }

  // Target uncompleted node: Place PRE-NODE on incoming segment (t = 0.86)
  return getBezierPointAndAngle(nodes[carNodeIndex - 1], nodes[carNodeIndex], 0.86);
}

/* ─── [OFFICIAL_CORE_FEATURE: ROAD_S_CURVE_SAMPLING_KEYFRAMES] ─── */
function getNodeContinuousParam(idx, nodes) {
  if (!nodes || nodes.length === 0) return 0;
  if (idx <= 0) return 0.14;
  const isDone = nodes[idx]?.status === "done";
  if (isDone) {
    return Math.min(nodes.length - 1.001, idx + 0.14);
  } else {
    return (idx - 1) + 0.86;
  }
}

function generateCarMotionKeyframes(prevIdx, currIdx, nodes) {
  if (!nodes || nodes.length < 2) {
    return { x: [600], y: [220], rotate: [90] };
  }

  const uStart = getNodeContinuousParam(prevIdx, nodes);
  const uEnd = getNodeContinuousParam(currIdx, nodes);

  if (prevIdx === currIdx || Math.abs(uStart - uEnd) < 0.001) {
    const s = Math.min(Math.floor(uEnd), nodes.length - 2);
    const t = Math.max(0, Math.min(1, uEnd - s));
    const pt = getBezierPointAndAngle(nodes[s], nodes[s + 1], t);
    return { x: [pt.x], y: [pt.y], rotate: [pt.angle] };
  }

  const numSteps = 50; // 50 precision sampling points along the S-curve
  const keyX = [];
  const keyY = [];
  const keyRotate = [];

  for (let step = 0; step <= numSteps; step++) {
    const alpha = step / numSteps;
    const u = uStart + alpha * (uEnd - uStart);

    let s = Math.floor(u);
    if (s >= nodes.length - 1) s = nodes.length - 2;
    if (s < 0) s = 0;

    let t = u - s;
    if (t < 0) t = 0;
    if (t > 1) t = 1;

    const p1 = nodes[s];
    const p2 = nodes[s + 1];
    if (p1 && p2) {
      const pt = getBezierPointAndAngle(p1, p2, t);
      keyX.push(pt.x);
      keyY.push(pt.y);
      keyRotate.push(pt.angle);
    }
  }

  return { x: keyX, y: keyY, rotate: keyRotate };
}

  /* ── RED DOTTED TRAIL LEFT BEHIND CAR ── */
  const renderRedDottedTrail = () => {
    if (nodes.length === 0) return null;

    const currentCarNode = nodes[carNodeIndex] || nodes[0];
    const isCompleted = currentCarNode.status === "done";

    let redD = `M ${nodes[0].x} ${nodes[0].y}`;

    if (isCompleted) {
      for (let i = 0; i < carNodeIndex && i < nodes.length - 1; i++) {
        const p1 = nodes[i];
        const p2 = nodes[i + 1];
        const cy1 = p1.y + (p2.y - p1.y) / 2;
        const cy2 = p1.y + (p2.y - p1.y) / 2;
        redD += ` C ${p1.x} ${cy1}, ${p2.x} ${cy2}, ${p2.x} ${p2.y}`;
      }
      if (carNodeIndex < nodes.length - 1) {
        const p1 = nodes[carNodeIndex];
        const p2 = nodes[carNodeIndex + 1];
        const endPt = getBezierPointAndAngle(p1, p2, 0.14);
        const endCy1 = p1.y + (endPt.y - p1.y) / 2;
        const endCy2 = p1.y + (endPt.y - p1.y) / 2;
        redD += ` C ${p1.x} ${endCy1}, ${endPt.x} ${endCy2}, ${endPt.x} ${endPt.y}`;
      }
    } else {
      for (let i = 0; i < carNodeIndex && i < nodes.length - 1; i++) {
        const p1 = nodes[i];
        const p2 = nodes[i + 1];
        
        if (i === carNodeIndex - 1) {
          const endPt = getBezierPointAndAngle(p1, p2, 0.86);
          const endCy1 = p1.y + (endPt.y - p1.y) / 2;
          const endCy2 = p1.y + (endPt.y - p1.y) / 2;
          redD += ` C ${p1.x} ${endCy1}, ${endPt.x} ${endCy2}, ${endPt.x} ${endPt.y}`;
        } else {
          const cy1 = p1.y + (p2.y - p1.y) / 2;
          const cy2 = p1.y + (p2.y - p1.y) / 2;
          redD += ` C ${p1.x} ${cy1}, ${p2.x} ${cy2}, ${p2.x} ${p2.y}`;
        }
      }
    }

    return (
      <path
        d={redD}
        fill="none"
        stroke="#ef4444"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="10 10"
        style={{ filter: "drop-shadow(0 0 10px rgba(239,68,68,0.7))" }}
      />
    );
  };

  // Compute car position keyframes (100% ON THE ASPHALT ROAD S-CURVE via 40-point Cubic Bezier sampling)
  const carKeyframes = generateCarMotionKeyframes(prevCarNodeIndex, carNodeIndex, nodes);

  // Check if Sunburst is active (if active, car disappears!)
  const isSunburstActive = Boolean(expandedMajorId);

  // Dynamic Canvas Height (Expands seamlessly when AI-fication injects nodes from 12 -> 15/16/17/18)
  const canvasHeight = Math.max(11500, 400 + nodes.length * 850);

  return (
    <><div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", position: "relative", overflow: "hidden" }}>

        {/* TOP STATUS BAR */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 16, padding: "0 6px"
        }}>
          <div>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 28, fontWeight: 900, color: "var(--text-main)", margin: "0 0 4px" }}>
              Skill Roadmap <span style={{ color: "#6c63ff" }}>Journey</span>
            </h1>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12, color: "#00c9a7", fontWeight: 700 }}>
              ASPHALT HIGHWAY ROADMAP · {targetCareer.toUpperCase()}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {nodes.length > 12 && (
              <span style={{ padding: "6px 14px", borderRadius: 16, background: "rgba(0, 201, 167, 0.15)", border: "1.5px solid #00c9a7", color: "#00c9a7", fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 900, boxShadow: "0 0 16px rgba(0, 201, 167, 0.3)" }}>
                ⚡ AI-FIED (+{nodes.length - 12} INJECTED NODES)
              </span>
            )}
            <span style={{ padding: "6px 14px", borderRadius: 16, background: "rgba(108,99,255,0.12)", border: "1px solid #6c63ff40", color: "#6c63ff", fontFamily: "'Fira Code', monospace", fontSize: 12, fontWeight: 800 }}>
              <Sparkles size={14} style={{ display: "inline", marginRight: 6 }} /> {nodes.length} MILESTONE LEVELS
            </span>
          </div>
        </div>

        {/* MAIN ROADMAP AREA */}
        <div style={{ display: "flex", flex: 1, border: "1.5px solid var(--border-light)", borderRadius: 24, overflow: "hidden", background: "var(--bg-card)", position: "relative" }}>

          {/* ── LEFT COMPACT SIDEBAR PANEL ── */}
          <div style={{
            width: 220, background: "var(--bg-card)", borderRight: "1.5px solid var(--border-light)",
            padding: 16, display: "flex", flexDirection: "column", justifyContent: "space-between",
            zIndex: 80, overflowY: "auto"
          }}>
            <div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 800, color: "var(--text-muted)", letterSpacing: 1.2, marginBottom: 14 }}>
                ROADMAP LEVELS
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {nodes.map(n => {
                  const isSelected = selectedMajor?.id === n.id;
                  const hasCar = carNodeIndex === n.levelNum - 1;
                  return (
                    <div
                      key={n.id}
                      onClick={() => {
                        setSelectedMajor(n);
                        changeCarLevel(n.levelNum - 1);
                        // Sunburst toggles on node click only
                        setExpandedMajorId(expandedMajorId === n.id ? null : n.id);
                      }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 12,
                        background: isSelected ? "rgba(108,99,255,0.12)" : "var(--bg-alt)",
                        border: `1.5px solid ${isSelected ? "#6c63ff" : "var(--border-light)"}`,
                        cursor: "pointer", transition: "all 0.2s", position: "relative"
                      }}
                    >
                      <div style={{
                        width: 26, height: 26, borderRadius: "50%",
                        background: n.color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: 12, fontWeight: 800, flexShrink: 0
                      }}>
                        {hasCar ? "🏎️" : n.levelNum}
                      </div>

                      <div style={{ overflow: "hidden" }}>
                        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, fontWeight: isSelected ? 800 : 600, color: isSelected ? "#6c63ff" : "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {n.label}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI-FICATION BUTTON AT BOTTOM LEFT */}
            <div style={{ paddingTop: 14, borderTop: "1.5px solid var(--border-light)" }}>
              <button
                onClick={() => setIsAiFicationOpen(true)}
                style={{
                  width: "100%", padding: "12px", borderRadius: 14, border: "none",
                  background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#ffffff",
                  fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 800,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: "0 6px 20px rgba(108,99,255,0.3)"
                }}
              >
                🤖 AI-fication
              </button>
            </div>
          </div>

          {/* ── HIGHWAY ROADMAP CANVAS ── */}
          <div
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              flex: 1, background: "var(--bg-main)", position: "relative",
              cursor: isDragging ? "grabbing" : "grab", overflow: "hidden"
            }}
          >
            {/* Canvas Zoom Controls */}
            <div style={{ position: "absolute", bottom: 20, left: 20, display: "flex", flexDirection: "column", gap: 6, zIndex: 70 }}>
              {[
                { label: "+", action: () => setZoom(z => Math.min(2.0, z + 0.15)) },
                { label: "-", action: () => setZoom(z => Math.max(0.12, z - 0.12)) },
                { label: "⟳", action: () => { setZoom(1); centerCameraOnNode(carNodeIndex, 1); } }
              ].map(ctrl => (
                <button
                  key={ctrl.label}
                  onClick={ctrl.action}
                  style={{
                    width: 36, height: 36, borderRadius: 12, background: "var(--bg-card)",
                    border: "1.5px solid var(--border-light)", color: "#6c63ff",
                    fontSize: 16, fontWeight: 800, cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
                  }}
                >
                  {ctrl.label}
                </button>
              ))}
            </div>

            {/* ─── [TEMPORARY_TESTING_WIDGET: FLOATING_JUMP_CONTROLLER (SAFE TO REMOVE FOR PRODUCTION)] ─── */}
            <div style={{
              position: "absolute", bottom: 24, right: 24,
              zIndex: 75
            }}>
              <div style={{
                background: "var(--bg-card)", border: "1.5px solid #ef444470",
                borderRadius: 20, padding: "12px 18px", boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
                display: "flex", alignItems: "center", gap: 14
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 900, color: "#ef4444", display: "flex", alignItems: "center", gap: 6 }}>
                    <span>🏎️ 5-Sec Car Road Test</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'Fira Code', monospace" }}>
                    Level {carNodeIndex + 1} of {nodes.length}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button
                    onClick={handleJumpBackward}
                    disabled={carNodeIndex === 0}
                    style={{
                      padding: "8px 14px", borderRadius: 12,
                      background: carNodeIndex === 0 ? "var(--bg-alt)" : "rgba(239,68,68,0.12)",
                      color: carNodeIndex === 0 ? "var(--text-muted)" : "#ef4444",
                      border: `1.5px solid ${carNodeIndex === 0 ? "var(--border-light)" : "#ef444460"}`,
                      fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 800,
                      cursor: carNodeIndex === 0 ? "not-allowed" : "pointer"
                    }}
                  >
                    ◀◀ Jump Back
                  </button>

                  <button
                    onClick={handleJumpForward}
                    disabled={carNodeIndex === nodes.length - 1}
                    style={{
                      padding: "8px 14px", borderRadius: 12, border: "none",
                      background: carNodeIndex === nodes.length - 1 ? "var(--bg-alt)" : "linear-gradient(135deg, #ef4444, #f7971e)",
                      color: "#ffffff",
                      fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 800,
                      cursor: carNodeIndex === nodes.length - 1 ? "not-allowed" : "pointer",
                      boxShadow: carNodeIndex === nodes.length - 1 ? "none" : "0 4px 14px rgba(239,68,68,0.35)"
                    }}
                  >
                    Jump Fwd ▶▶
                  </button>
                </div>
              </div>
            </div>

            {/* Canvas Transform Layer (5s Camera Tracking Sync) */}
            <div style={{
              position: "absolute", top: 0, left: 0, width: 1200, height: canvasHeight,
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "0 0", transition: isDragging ? "none" : "transform 5s ease-in-out"
            }}>
              {/* SVG Highway Road Surface & RED DOTTED TRAIL */}
              <svg style={{ position: "absolute", inset: 0, width: 1200, height: canvasHeight, pointerEvents: "none", overflow: "visible" }}>
                {renderAsphaltRoadway()}
                {renderRedDottedTrail()}

                {/* MATHEMATICALLY PERFECT 360° CIRCULAR SUNBURST CONNECTOR RAYS AND DASHED ORBIT CIRCLE */}
                {expandedMajorId && (() => {
                  const major = nodes.find(n => n.id === expandedMajorId);
                  if (!major) return null;
                  const orbits = getPerfectCirclePositions(major.minor.length, major.x, major.y, 220);
                  return (
                    <g>
                      <circle cx={major.x} cy={major.y} r={280} fill="rgba(108,99,255,0.07)" stroke="none" />
                      <circle cx={major.x} cy={major.y} r={220} fill="none" stroke={major.color} strokeWidth="3.5" strokeDasharray="10 10" opacity={0.85} />
                      {orbits.map((pos, i) => (
                        <line key={`ray-${i}`} x1={major.x} y1={major.y} x2={pos.x} y2={pos.y} stroke={major.color} strokeWidth="3" strokeDasharray="6 6" opacity={0.9} />
                      ))}
                    </g>
                  );
                })()}
              </svg>

              {/* 🏎️ REAL TOP-DOWN 2D SPORTS CAR (100% DEAD-CENTER ON S-CURVE ROAD LINE & 5s CAMERA TRACKING) */}
              {!isSunburstActive && (
                <motion.div
                  animate={{ x: carKeyframes.x, y: carKeyframes.y }}
                  transition={{ duration: 5, ease: "easeInOut" }}
                  style={{
                    position: "absolute", top: 0, left: 0,
                    width: 0, height: 0,
                    zIndex: 65, pointerEvents: "none"
                  }}
                >
                  {/* Badge Pill (Floating Centered Above Car Origin) */}
                  <div style={{
                    position: "absolute", bottom: 36, left: 0,
                    transform: "translateX(-50%)",
                    padding: "6px 14px", borderRadius: 16,
                    background: "linear-gradient(135deg, #00c9a7, #6c63ff)",
                    color: "#ffffff", fontFamily: "'Outfit', sans-serif",
                    fontSize: 12, fontWeight: 900, whiteSpace: "nowrap",
                    boxShadow: "0 6px 20px rgba(0,201,167,0.45)",
                    border: "1.5px solid rgba(255,255,255,0.4)",
                    filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.35))"
                  }}>
                    <span>🌱 Beginner Badge</span>
                    <span style={{ opacity: 0.95, fontSize: 10.5, fontFamily: "'Fira Code', monospace", marginLeft: 6 }}>• 120 🪙</span>
                  </div>

                  {/* Car Graphic (Rotates at exact (0,0) center point along S-curve keyframes) */}
                  <motion.div
                    animate={{ rotate: carKeyframes.rotate }}
                    transition={{ duration: 5, ease: "easeInOut" }}
                    style={{
                      position: "absolute", top: 0, left: 0,
                      transform: "translate(-50%, -50%)"
                    }}
                  >
                    <TopDownCarGraphic carColor="#ef4444" />
                  </motion.div>
                </motion.div>
              )}

              {/* 12 SLEEK CIRCULAR ROADMAP NODES (ENLARGED 92px) */}
              {nodes.map((n) => {
                const isSelected = selectedMajor?.id === n.id;
                const isExpanded = expandedMajorId === n.id;

                return (
                  <div
                    key={n.id}
                    data-node="major"
                    onClick={() => {
                      setSelectedMajor(n);
                      setExpandedMajorId(isExpanded ? null : n.id);
                      changeCarLevel(n.levelNum - 1);
                    }}
                    style={{
                      position: "absolute", left: n.x, top: n.y,
                      transform: "translate(-50%, -50%)", cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center",
                      zIndex: 30
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.12 }}
                      style={{
                        width: 92, height: 92, borderRadius: "50%",
                        background: "#ffffff",
                        border: `7px solid ${n.color}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: isSelected
                          ? `0 0 0 10px ${n.color}40, 0 18px 42px ${n.color}60`
                          : `0 10px 30px ${n.color}40`,
                        position: "relative"
                      }}
                    >
                      <div style={{
                        width: 56, height: 56, borderRadius: "50%",
                        background: n.color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#ffffff", fontSize: 28
                      }}>
                        {n.emoji}
                      </div>

                      {n.status === "done" && (
                        <div style={{ position: "absolute", top: -4, right: -4, width: 26, height: 26, borderRadius: "50%", background: "#10b981", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, border: "2.5px solid #fff" }}>
                          ✓
                        </div>
                      )}
                      {n.status === "locked" && (
                        <div style={{ position: "absolute", bottom: -2, right: -2, width: 24, height: 24, borderRadius: "50%", background: "#fff", color: "#888", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, border: "1.5px solid var(--border-light)" }}>
                          🔒
                        </div>
                      )}
                    </motion.div>

                    <div style={{
                      marginTop: 12, padding: "8px 18px", borderRadius: 16,
                      background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
                      fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800,
                      color: "var(--text-main)", textAlign: "center",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.12)", maxWidth: 200,
                      whiteSpace: "nowrap"
                    }}>
                      {n.levelNum}. {n.label}
                    </div>
                  </div>
                );
              })}

              {/* ☀️ MATHEMATICALLY PERFECT 360° CIRCULAR SUNBURST MINOR NODES & OUTWARD RADIAL LABELS (ENLARGED 60px) */}
              {expandedMajorId && (() => {
                const major = nodes.find(n => n.id === expandedMajorId);
                if (!major) return null;
                const orbits = getPerfectCirclePositions(major.minor.length, major.x, major.y, 220);

                return major.minor.map((m, i) => {
                  const pos = orbits[i];
                  const isSelectedMinor = selectedMinor?.id === m.id;

                  return (
                    <React.Fragment key={m.id}>
                      {/* Enlarge Subtopic Percentage Circle (60px) */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMajor(major);
                          setSelectedMinor(m);
                        }}
                        style={{
                          position: "absolute", left: pos.x, top: pos.y,
                          transform: "translate(-50%, -50%)", cursor: "pointer",
                          zIndex: 45
                        }}
                      >
                        <div style={{
                          width: 60, height: 60, borderRadius: "50%",
                          background: m.fill >= 100 ? major.color : "var(--bg-card)",
                          border: `3.5px solid ${isSelectedMinor ? "#ec4899" : major.color}`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontFamily: "'Fira Code', monospace", fontSize: 13.5, fontWeight: 900,
                          color: m.fill >= 100 ? "#ffffff" : major.color,
                          boxShadow: isSelectedMinor ? `0 0 0 8px ${major.color}40, 0 8px 24px rgba(0,0,0,0.2)` : "0 6px 18px rgba(0,0,0,0.16)"
                        }}>
                          {m.fill}%
                        </div>
                      </motion.div>

                      {/* Enlarge Subtopic Radial Outward Label Chip */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04 + 0.05 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMajor(major);
                          setSelectedMinor(m);
                        }}
                        style={{
                          position: "absolute", left: pos.labelX, top: pos.labelY,
                          transform: "translate(-50%, -50%)", cursor: "pointer",
                          zIndex: 46
                        }}
                      >
                        <div style={{
                          padding: "7px 16px", borderRadius: 14,
                          background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
                          fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 800,
                          color: "var(--text-main)", boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                          whiteSpace: "nowrap"
                        }}>
                          {m.label}
                        </div>
                      </motion.div>
                    </React.Fragment>
                  );
                });
              })()}

            </div>
          </div>

          {/* ── RIGHT RESOURCE PANEL (ENLARGED WITH MAXIMIZE FULL-SCREEN EXPANSION) ── */}
          <AnimatePresence>
            {selectedMinor && selectedMajor && (
              <ResourcePanel
                majorNode={selectedMajor}
                minorNode={selectedMinor}
                onStudy={handleFillMinor}
                onClose={() => setSelectedMinor(null)}
                isLocked={selectedMajor.status === "locked"}
              />
            )}
          </AnimatePresence>

        </div>

      </div>

      {/* 🤖 AI-FICATION CORPORATE ROADMAP RECALIBRATION MODAL */}
      <AiFicationModal
        isOpen={isAiFicationOpen}
        onClose={() => setIsAiFicationOpen(false)}
        targetCareer={targetCareer}
        onResetRoadmap={() => {
          const originalNodes = getRoadmapMajorNodes(targetCareer, []);
          setNodes(originalNodes);
          setSelectedMajor(originalNodes[2] || originalNodes[0]);
          changeCarLevel(2);
          setAiToastMessage("🔄 Roadmap reset to standard 12-level curriculum defaults!");
          setTimeout(() => setAiToastMessage(""), 4000);
        }}
        onSave={(data) => {
          setAiToastMessage(`✓ AI Preferences saved for ${data.company.name} (${data.role})`);
          setTimeout(() => setAiToastMessage(""), 3500);
        }}
        onModifyRoadmap={(data) => {
          // Additively inject new skills (expanding roadmap from 12 -> 15/16/17/18 nodes)
          const newNodes = getRoadmapMajorNodes(data.role, data.injectedSkills);
          setNodes(newNodes);
          setSelectedMajor(newNodes[2] || newNodes[0]);
          setAiToastMessage(`✨ Roadmap AI-fied! Dynamically expanded to ${newNodes.length} Levels (+${newNodes.length - 12} High-ROI Market Skills for ${data.company.name})!`);
          setTimeout(() => setAiToastMessage(""), 5000);
        }}
      />

      {/* Live AI Recalibration Success Notification Toast Banner */}
      <AnimatePresence>
        {aiToastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            style={{
              position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
              zIndex: 990, padding: "12px 24px", borderRadius: 16,
              background: "linear-gradient(135deg, #00c9a7, #6c63ff)", color: "#ffffff",
              fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 900,
              boxShadow: "0 10px 30px rgba(0, 201, 167, 0.4)",
              display: "flex", alignItems: "center", gap: 10,
              border: "1.5px solid rgba(255,255,255,0.4)"
            }}
          >
            <Sparkles size={18} />
            <span>{aiToastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence></>
  );
}
