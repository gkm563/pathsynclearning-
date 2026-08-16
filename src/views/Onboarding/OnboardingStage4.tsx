"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sun, Moon, Sparkles, Rocket, Compass, Zap, Target, BookOpen, 
  CheckCircle2, Plus, Search, Info, ShieldAlert, ArrowLeft, ArrowRight
} from "lucide-react";
import { useSelectedCareer } from "@/hooks/useStudentData";
import { markOnboardingComplete } from "@/lib/auth-routing";

/* ─── DYNAMIC AI CAREER SKILLS & SCHEDULE GENERATOR ─── */
function getCareerSkillsAndSchedule(targetCareer) {
  const career = (targetCareer || "").toLowerCase();

  let skills = [];
  let crashSchedule = [];
  let ugSchedule = [];

  if (career.includes("ai") || career.includes("machine learning") || career.includes("data science") || career.includes("ml")) {
    skills = [
      "Python 3.12+", "TensorFlow & PyTorch", "Linear Algebra & Statistics", "Data Preprocessing (Pandas)", 
      "Deep Learning & CNNs", "MLOps & Model Deployment", "NLP & LLMs (LangChain)", "SQL & Vector DBs (Pinecone)", 
      "System Design for AI", "Distributed GPU Training", "Docker & Cloud AI Services", "AI Ethics & Alignment"
    ];
    crashSchedule = [
      { day: "Mon", tasks: ["Python for Data Science", "Numpy & Pandas Sprint"] },
      { day: "Tue", tasks: ["Math & Stats Foundations", "Supervised Learning Models"] },
      { day: "Wed", tasks: ["Deep Learning & PyTorch", "Neural Nets Architecture"] },
      { day: "Thu", tasks: ["LLMs & Vector DBs", "Building AI Microservice"] },
      { day: "Fri", tasks: ["MLOps Pipeline", "Model Evaluation & CRI Test"] }
    ];
    ugSchedule = [
      { day: "Sem 1", tasks: ["Python Foundations", "Discrete Math & Linear Algebra", "SQL Basics"] },
      { day: "Sem 2", tasks: ["Data Structures in Python", "Classical Machine Learning", "Pandas Project"] },
      { day: "Sem 3", tasks: ["Deep Learning & PyTorch", "Computer Vision & NLP", "Model API Deployment"] },
      { day: "Sem 4", tasks: ["MLOps & LLM Fine-Tuning", "AI Capstone Project", "CRI Goal ≥80"] }
    ];
  } else if (career.includes("devops") || career.includes("cloud") || career.includes("infra") || career.includes("site reliability")) {
    skills = [
      "Linux Admin & Bash Scripting", "Docker Containerization", "Kubernetes Orchestration", "AWS / Azure Cloud Services", 
      "CI/CD Pipelines (GitHub Actions)", "Terraform & Infrastructure as Code", "Networking & DNS Protocols", "Golang & Python Automation", 
      "Prometheus & Grafana Observability", "Site Reliability & Chaos Testing", "System Design for High Scale", "Zero-Trust Cloud Security & IAM"
    ];
    crashSchedule = [
      { day: "Mon", tasks: ["Linux Admin & Shell", "Dockerizing Applications"] },
      { day: "Tue", tasks: ["Kubernetes Cluster Setup", "Helm & Container Config"] },
      { day: "Wed", tasks: ["AWS Infrastructure", "Terraform Provisioning"] },
      { day: "Thu", tasks: ["CI/CD Pipeline Build", "Monitoring & Alerts"] },
      { day: "Fri", tasks: ["Chaos Engineering", "Infra Audit & CRI Check"] }
    ];
    ugSchedule = [
      { day: "Sem 1", tasks: ["Linux Fundamentals", "Computer Networks", "Git & GitHub"] },
      { day: "Sem 2", tasks: ["OS Internals", "Docker Containers", "Python Automation"] },
      { day: "Sem 3", tasks: ["AWS Cloud Arch", "Kubernetes Orchestration", "CI/CD Deployment"] },
      { day: "Sem 4", tasks: ["Terraform & CloudSec", "DevOps Capstone", "CRI Goal ≥80"] }
    ];
  } else if (career.includes("security") || career.includes("cyber") || career.includes("ethical") || career.includes("pen")) {
    skills = [
      "Network Security & Wireshark", "Penetration Testing (Metasploit)", "Secure Coding Standards", "OWASP Top 10 Exploits", 
      "Python & Bash Security Automation", "Linux Hardening & OS Internals", "Cryptography & PKI Protocols", "Threat Intelligence & Forensics", 
      "SIEM Log Analysis (Splunk/ELK)", "Cloud Security & IAM", "Reverse Engineering", "Zero-Trust Architecture"
    ];
    crashSchedule = [
      { day: "Mon", tasks: ["Network Scanner (Nmap)", "Wireshark Packet Analysis"] },
      { day: "Tue", tasks: ["OWASP Web Exploits", "SQLi & XSS Labs"] },
      { day: "Wed", tasks: ["Linux Hardening", "Privilege Escalation"] },
      { day: "Thu", tasks: ["Penetration Test Report", "Defensive Rules Build"] },
      { day: "Fri", tasks: ["Capture The Flag (CTF)", "Security Audit & CRI Test"] }
    ];
    ugSchedule = [
      { day: "Sem 1", tasks: ["Computer Networks", "Linux CLI", "Python Scripting"] },
      { day: "Sem 2", tasks: ["Cryptography Math", "Web App Security", "Ethical Hacking Lab"] },
      { day: "Sem 3", tasks: ["Network Defense", "SIEM Monitoring", "Penetration Testing"] },
      { day: "Sem 4", tasks: ["Cloud Security & Audit", "Cyber Capstone", "CRI Goal ≥80"] }
    ];
  } else if (career.includes("data") || career.includes("analyst") || career.includes("bi")) {
    skills = [
      "SQL & Query Optimization", "Python & Advanced R", "Probability & Inferential Stats", "Tableau & Power BI Dashboards", 
      "Data Wrangling (Pandas/Polars)", "Machine Learning Algorithms", "Big Data Frameworks (Spark)", "Data Warehousing (Snowflake)", 
      "Feature Engineering", "A/B Testing & Experimentation", "Business Intelligence Storytelling", "Git & Model Monitoring"
    ];
    crashSchedule = [
      { day: "Mon", tasks: ["Advanced SQL Queries", "Window Functions Sprint"] },
      { day: "Tue", tasks: ["Python Pandas & Seaborn", "Exploratory Data Analysis"] },
      { day: "Wed", tasks: ["Power BI Dashboard", "Data Storytelling"] },
      { day: "Thu", tasks: ["A/B Testing Math", "Predictive Analytics"] },
      { day: "Fri", tasks: ["End-to-End BI Audit", "Portfolio Report & CRI Test"] }
    ];
    ugSchedule = [
      { day: "Sem 1", tasks: ["SQL & Relational DBs", "Excel & Math Stats", "Python Basics"] },
      { day: "Sem 2", tasks: ["Data Cleaning", "Tableau Visualizations", "Analytics Project"] },
      { day: "Sem 3", tasks: ["Applied ML for Data", "Big Data Analytics", "Business Metrics"] },
      { day: "Sem 4", tasks: ["Data Science Capstone", "Industry Internship", "CRI Goal ≥80"] }
    ];
  } else {
    // Default Full-Stack / SDE
    skills = [
      "Data Structures & Algorithms", "System Design & Scalability", "Object-Oriented Programming", "React & Next.js 14+", 
      "Node.js & Express / NestJS", "TypeScript", "PostgreSQL & Database Design", "MongoDB & NoSQL", 
      "Cloud Computing (AWS/GCP)", "Docker & Microservices", "Web Security (OWASP)", "Git & Automated CI/CD"
    ];
    crashSchedule = [
      { day: "Mon", tasks: ["React & Next.js Architecture", "Component State Sprint"] },
      { day: "Tue", tasks: ["Node.js API Development", "PostgreSQL Database Schema"] },
      { day: "Wed", tasks: ["DSA Core Patterns", "System Design Scalability"] },
      { day: "Thu", tasks: ["Full-Stack App Integration", "Deployment on Cloud"] },
      { day: "Fri", tasks: ["Code Review Sprint", "CRI Assessment"] }
    ];
    ugSchedule = [
      { day: "Sem 1", tasks: ["DSA Foundations", "Web Basics (HTML/CSS/JS)", "DBMS Intro"] },
      { day: "Sem 2", tasks: ["OOP Concepts", "React & Modern JS", "First Full-Stack App"] },
      { day: "Sem 3", tasks: ["System Design & Cloud", "Node.js Microservices", "Internship Prep"] },
      { day: "Sem 4", tasks: ["Advanced Architecture", "SDE Capstone Project", "CRI Goal ≥80"] }
    ];
  }

  return { skills, crashSchedule, ugSchedule };
}

const ADDITIONAL_SKILLS = [
  "Public Speaking", "Finance Basics", "Cloud Architecture", "Blockchain",
  "Mobile Dev", "UI/UX Design", "Agile / Scrum", "Technical Writing",
  "Open Source Contribution", "Competitive Programming", "Leadership",
  "Entrepreneurship", "Digital Marketing", "Product Management"
];

/* ─── PREVIEW MODAL POPUP ─── */
function PreviewModal({ open, onClose, mode, targetCareer, crashData, ugData }) {
  if (!open) return null;
  const data = mode === "crash" ? crashData : ugData;
  const title = mode === "crash" 
    ? `⚡ First Week Preview — ${targetCareer}` 
    : `🗺️ Semester Roadmap Preview — ${targetCareer}`;

  return (
    <div 
      onClick={onClose} 
      style={{ 
        position: "fixed", inset: 0, background: "rgba(10, 10, 24, 0.75)", 
        backdropFilter: "blur(12px)", zIndex: 1000, 
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20 
      }}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()} 
        style={{ 
          background: "var(--bg-card)", borderRadius: 24, padding: 36, 
          maxWidth: 580, width: "100%", border: "1.5px solid var(--border-light)", 
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)" 
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
              {title}
            </h3>
            <div style={{ fontSize: 12, color: "#6c63ff", fontFamily: "'Fira Code', monospace", marginTop: 4 }}>
              CUSTOM AI SCHEDULE TAILORED FOR YOUR CAREER PATH
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              width: 36, height: 36, borderRadius: 12, background: "var(--bg-alt)", 
              border: "1px solid var(--border-light)", cursor: "pointer", fontSize: 16, 
              color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center" 
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {data.map((row, i) => (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ 
                minWidth: 76, padding: "8px 14px", borderRadius: 12, 
                background: "rgba(108,99,255,0.12)", border: "1px solid #6c63ff40", 
                fontFamily: "'Fira Code', monospace", fontSize: 12.5, fontWeight: 800, 
                color: "#6c63ff", textAlign: "center", flexShrink: 0 
              }}>
                {row.day}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {row.tasks.map((t, j) => (
                  <span key={j} style={{ 
                    padding: "7px 14px", borderRadius: 12, background: "var(--bg-alt)", 
                    border: "1px solid var(--border-light)", fontSize: 13.5, fontWeight: 600, 
                    color: "var(--text-main)" 
                  }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24, fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "var(--text-muted)", letterSpacing: 0.5 }}>
          ✦ PathEd Gemini AI schedule dynamically calibrated for {targetCareer}
        </div>
      </motion.div>
    </div>
  );
}

/* ─── SKILL ORDER SELECTOR ─── */
function SkillOrderBox({ skills, order, onToggle, accentColor = "#6c63ff" }) {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {skills.map(skill => {
        const idx = order.indexOf(skill);
        const selected = idx !== -1;
        return (
          <div 
            key={skill} 
            onClick={() => onToggle(skill)} 
            style={{ 
              display: "inline-flex", alignItems: "center", gap: 10, padding: "11px 18px", borderRadius: 14, 
              border: `1.5px solid ${selected ? accentColor : "var(--border-light)"}`, 
              background: selected ? `${accentColor}15` : "var(--bg-alt)", 
              cursor: "pointer", transition: "all 0.2s", 
              fontFamily: "'Outfit', sans-serif", fontSize: 15, 
              color: selected ? accentColor : "var(--text-main)", 
              fontWeight: selected ? 700 : 500, userSelect: "none" 
            }}
          >
            {selected && (
              <span style={{ 
                width: 22, height: 22, borderRadius: 8, 
                background: accentColor, display: "flex", alignItems: "center", 
                justifyContent: "center", fontFamily: "'Fira Code', monospace", 
                fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0 
              }}>
                {idx + 1}
              </span>
            )}
            {skill}
          </div>
        );
      })}
    </div>
  );
}

/* ─── KNOWN SKILLS CHECKLIST ─── */
function KnownSkillsChecklist({ skills, checked, onToggle, accentColor = "#00c9a7" }) {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      {skills.map(skill => {
        const isChecked = checked.includes(skill);
        return (
          <div 
            key={skill} 
            onClick={() => onToggle(skill)} 
            style={{ 
              display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 16px", borderRadius: 14, 
              border: `1.5px solid ${isChecked ? accentColor : "var(--border-light)"}`, 
              background: isChecked ? `${accentColor}15` : "var(--bg-alt)", 
              cursor: "pointer", transition: "all 0.2s", 
              fontSize: 14.5, color: isChecked ? accentColor : "var(--text-main)", 
              fontWeight: isChecked ? 700 : 500, userSelect: "none" 
            }}
          >
            <span style={{ fontSize: 16 }}>{isChecked ? "✅" : "○"}</span>
            {skill}
          </div>
        );
      })}
    </div>
  );
}

/* ─── SEARCHABLE ADDITIONAL SKILLS SELECTOR ─── */
function AdditionalSkillsSelector({ added, onAdd, onRemove }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<any>(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = ADDITIONAL_SKILLS.filter(
    s => s.toLowerCase().includes(search.toLowerCase()) && !added.includes(s)
  );

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <div 
        onClick={() => setOpen(true)}
        style={{ 
          display: "flex", alignItems: "center", gap: 12, 
          padding: "14px 18px", borderRadius: 16, 
          background: "var(--bg-alt)", border: "1.5px solid var(--border-light)" 
        }}
      >
        <Search size={20} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Search & add extra skills (e.g. Leadership, UI/UX, Blockchain)..." 
          value={search} 
          onChange={e => { setSearch(e.target.value); setOpen(true); }}
          style={{ 
            flex: 1, border: "none", background: "transparent", outline: "none", 
            fontSize: 15, color: "var(--text-main)" 
          }}
        />
      </div>

      {open && filtered.length > 0 && (
        <div style={{ 
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, 
          background: "var(--bg-card)", border: "1.5px solid var(--border-light)", 
          borderRadius: 18, boxShadow: "0 12px 36px rgba(0,0,0,0.15)", 
          zIndex: 50, maxHeight: 220, overflowY: "auto" 
        }}>
          {filtered.map(s => (
            <div 
              key={s} 
              onClick={() => { onAdd(s); setSearch(""); setOpen(false); }}
              style={{ 
                padding: "12px 18px", fontSize: 14.5, color: "var(--text-main)", 
                cursor: "pointer", borderBottom: "1px solid var(--border-light)" 
              }}
            >
              + {s}
            </div>
          ))}
        </div>
      )}

      {added.length > 0 && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
          {added.map(s => (
            <span 
              key={s} 
              style={{ 
                display: "inline-flex", alignItems: "center", gap: 8, 
                padding: "8px 14px", borderRadius: 12, 
                background: "rgba(108,99,255,0.12)", border: "1px solid #6c63ff40", 
                color: "#6c63ff", fontSize: 13.5, fontWeight: 700 
              }}
            >
              {s}
              <span 
                onClick={() => onRemove(s)} 
                style={{ cursor: "pointer", fontSize: 13, fontWeight: 900, marginLeft: 2 }}
              >
                ✕
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── TOGGLE SWITCH ─── */
function ToggleSwitch({ on, onChange, labelOn, labelOff }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }} onClick={onChange}>
      <div style={{ 
        width: 54, height: 28, borderRadius: 14, 
        background: on ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "var(--bg-alt)", 
        border: "1.5px solid var(--border-light)", position: "relative", 
        transition: "all 0.3s ease", flexShrink: 0
      }}>
        <div style={{ 
          width: 22, height: 22, borderRadius: "50%", background: "#fff", 
          position: "absolute", top: 1.5, left: on ? 28 : 2, 
          transition: "left 0.3s ease", boxShadow: "0 2px 6px rgba(0,0,0,0.2)" 
        }} />
      </div>
      <span style={{ fontSize: 15.5, fontWeight: on ? 700 : 500, color: on ? "#6c63ff" : "var(--text-muted)", lineHeight: 1.4 }}>
        {on ? labelOn : labelOff}
      </span>
    </div>
  );
}

/* ─── STEP-BY-STEP LAUNCH ANIMATION OVERLAY (Matches Reference Image 1) ─── */
function LaunchOverlay({ targetCareer, onFinish }) {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    { icon: "🔍", text: `Analysing your profile & career DNA...` },
    { icon: "🗺️", text: `Mapping required skill nodes for ${targetCareer}...` },
    { icon: "⚡", text: `Calibrating study pace engine & timeline...` },
    { icon: "✅", text: `Roadmap ready — launching dashboard!` }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep(prev => {
        if (prev >= steps.length - 1) {
          clearInterval(timer);
          setTimeout(() => {
            onFinish();
          }, 900);
          return prev;
        }
        return prev + 1;
      });
    }, 700);

    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(240, 244, 255, 0.97)",
      backdropFilter: "blur(16px)",
      zIndex: 1000,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: 24
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", maxWidth: 520, width: "100%"
        }}
      >
        {/* Top Glowing Badge */}
        <div style={{
          width: 96, height: 96, borderRadius: "50%",
          background: "linear-gradient(135deg, #6c63ff, #00c9a7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 44, boxShadow: "0 14px 40px rgba(108,99,255,0.4)",
          marginBottom: 24
        }}>
          🗺️
        </div>

        <h2 style={{
          fontFamily: "'Outfit', sans-serif", fontSize: 34, fontWeight: 900,
          color: "var(--text-main)", marginBottom: 28, textAlign: "center",
          letterSpacing: "-0.5px"
        }}>
          Generating Your Roadmap
        </h2>

        {/* Step-by-Step Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%" }}>
          {steps.map((stg, i) => {
            const isDone = i < activeStep;
            const isCurrent = i === activeStep;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: i <= activeStep ? 1 : 0.35, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "16px 22px", borderRadius: 18,
                  background: i <= activeStep ? "linear-gradient(90deg, rgba(108,99,255,0.08), rgba(0,201,167,0.06))" : "#ffffff",
                  border: `1.5px solid ${i <= activeStep ? "#6c63ff40" : "var(--border-light)"}`,
                  boxShadow: isCurrent ? "0 6px 20px rgba(108,99,255,0.15)" : "none"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20 }}>{stg.icon}</span>
                  <span style={{
                    fontFamily: "'Outfit', sans-serif", fontSize: 16,
                    fontWeight: isCurrent || isDone ? 700 : 500,
                    color: i <= activeStep ? "#6c63ff" : "var(--text-muted)"
                  }}>
                    {stg.text}
                  </span>
                </div>

                <div>
                  {isDone && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ fontSize: 20, color: "#00c9a7", fontWeight: 800 }}>
                      ✅
                    </motion.span>
                  )}
                  {isCurrent && (
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%",
                      border: "3px solid #6c63ff", borderTopColor: "transparent",
                      animation: "spin 0.8s linear infinite"
                    }} />
                  )}
                  {i > activeStep && (
                    <span style={{ fontSize: 14, color: "var(--text-muted)", opacity: 0.4 }}>
                      ○
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT — ONBOARDING STAGE 4
════════════════════════════════════════════════════════════ */
export default function OnboardingStage4() {
  const router = useRouter();

  const selectedCareer = useSelectedCareer();

  // Dynamically generated skills & schedules tailored to selected career path
  const careerData = getCareerSkillsAndSchedule(selectedCareer);

  // Dark Mode State Sync
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    const nextTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  // View state: "selection" | "config"
  const [view, setView] = useState("selection");
  const [selectedMode, setSelectedMode] = useState(""); // "crash" | "ug"
  const [hoveredMode, setHoveredMode] = useState("");
  const [previewMode, setPreviewMode] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  // Config State
  const [crashDuration, setCrashDuration] = useState("6 months");
  const [crashFrequency, setCrashFrequency] = useState("Daily");
  const [crashSkillLevel, setCrashSkillLevel] = useState("Intermediate");
  const [crashOrder, setCrashOrder] = useState<any[]>([]);
  const [crashKnown, setCrashKnown] = useState<any[]>([]);
  const [crashAdded, setCrashAdded] = useState<any[]>([]);
  const [crashHolistic, setCrashHolistic] = useState(false);
  const [crashPriority, setCrashPriority] = useState(false);

  const [ugDuration, setUgDuration] = useState("4 Years");
  const [ugFrequency, setUgFrequency] = useState("Weekly (Balanced)");
  const [ugSkillLevel, setUgSkillLevel] = useState("Beginner");
  const [ugOrder, setUgOrder] = useState<any[]>([]);
  const [ugKnown, setUgKnown] = useState<any[]>([]);
  const [ugAdded, setUgAdded] = useState<any[]>([]);
  const [ugHolistic, setUgHolistic] = useState(true);
  const [ugPriority, setUgPriority] = useState(false);

  // Launching state
  const [isLaunching, setIsLaunching] = useState(false);

  const stages = [
    { num: 1, title: "Academic Foundation & DNA", status: "done" },
    { num: 2, title: "Career Ambition & Target Roles", status: "done" },
    { num: 3, title: "Public Identity Review", status: "done" },
    { num: 4, title: "Roadmap Setup", status: "active" }
  ];

  function toggleOrderSkill(skill, order, setOrder) {
    setOrder(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  }

  function toggleKnown(skill, known, setKnown) {
    setKnown(prev => prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]);
  }

  function goToConfig(m) {
    setSelectedMode(m);
    setView("config");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBackToSelection() {
    setView("selection");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleGenerateUG() {
    setIsLaunching(true);
  }

  const showCrash = selectedMode === "crash";
  const showUG = selectedMode === "ug";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", color: "var(--text-main)", fontFamily: "'Inter', sans-serif", paddingBottom: 140 }}>

      {isLaunching && (
        <LaunchOverlay 
          targetCareer={selectedCareer} 
          onFinish={async () => {
            try {
              await markOnboardingComplete({
                mode: selectedMode,
                career: selectedCareer,
                finishedAt: new Date().toISOString(),
              });
            } catch {
              // still enter dashboard
            }
            router.push("/dashboard");
          }} 
        />
      )}

      {/* TOP STICKY BAR */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "var(--bg-card)", borderBottom: "1.5px solid var(--border-light)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #6c63ff, #00c9a7)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 20, boxShadow: "0 4px 14px rgba(108,99,255,0.3)" }}>
            P
          </div>
          <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, color: "var(--text-main)" }}>
            Path<span style={{ color: "#6c63ff" }}>Ed</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 20, background: "rgba(0,201,167,0.12)", border: "1px solid #00c9a740", color: "#00c9a7", fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 800 }}>
            <Sparkles size={16} /> STAGE 4 OF 4 ONBOARDING
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            style={{
              width: 44, height: 44, borderRadius: 14, background: "var(--bg-alt)",
              border: "1.5px solid var(--border-light)", display: "flex", alignItems: "center",
              justifyContent: "center", color: "var(--text-main)", cursor: "pointer"
            }}
            title="Toggle Light / Dark Mode"
          >
            {isDarkMode ? <Sun size={20} color="#f7971e" /> : <Moon size={20} color="#6c63ff" />}
          </motion.button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main style={{ maxWidth: 940, margin: "36px auto 0", padding: "0 24px" }}>

        {/* 4-STAGE TRACKER BAR */}
        <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 28, padding: "32px 40px", marginBottom: 36, boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
            <div style={{ position: "absolute", left: 42, right: 42, top: 31, height: 3, background: "var(--border-light)", zIndex: 0 }} />
            <div style={{ position: "absolute", left: 42, top: 31, height: 3, background: "linear-gradient(90deg, #6c63ff, #00c9a7)", zIndex: 1, width: "100%" }} />
            {stages.map(stg => (
              <div key={stg.num} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 11, position: "relative", zIndex: 2 }}>
                <div style={{
                  width: 62, height: 62, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 800,
                  background: stg.status === "done" ? "linear-gradient(135deg, #00c9a7, #6c63ff)" : "linear-gradient(135deg, #6c63ff, #00c9a7)",
                  color: "#fff",
                  boxShadow: stg.status === "active" ? "0 0 0 6px rgba(108,99,255,0.18), 0 6px 18px rgba(108,99,255,0.35)" : "none"
                }}>
                  {stg.status === "done" ? "✓" : stg.num}
                </div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 700, color: stg.status === "active" ? "#6c63ff" : "#00c9a7", textAlign: "center", maxWidth: 130, lineHeight: 1.35 }}>
                  {stg.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* HERO TITLE HEADER */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          {view === "selection" ? (
            <>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 20, background: "rgba(108,99,255,0.12)", border: "1px solid #6c63ff40", color: "#6c63ff", fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 800, marginBottom: 14 }}>
                <Compass size={18} /> FINAL STEP — ROADMAP SETUP FOR: {selectedCareer.toUpperCase()}
              </div>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 48, fontWeight: 800, margin: "0 0 14px", lineHeight: 1.15, color: "var(--text-main)" }}>
                Choose Your <span style={{ background: "linear-gradient(135deg, #6c63ff, #00c9a7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Learning Mode</span>
              </h1>
              <p style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: 640, margin: "0 auto", lineHeight: 1.6 }}>
                Configure your personalized <strong>{selectedCareer}</strong> learning roadmap. Select a learning pace that fits your schedule.
              </p>
            </>
          ) : (
            <>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 20, background: showCrash ? "rgba(247,151,30,0.12)" : "rgba(0,201,167,0.12)", border: `1px solid ${showCrash ? "#f7971e40" : "#00c9a740"}`, color: showCrash ? "#f7971e" : "#00c9a7", fontFamily: "'Fira Code', monospace", fontSize: 13, fontWeight: 800, marginBottom: 14 }}>
                {showCrash ? <Zap size={18} /> : <Compass size={18} />} {showCrash ? "CRASH COURSE MODE" : "UG JOURNEY MODE"} — TARGET: {selectedCareer.toUpperCase()}
              </div>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 46, fontWeight: 800, margin: "0 0 14px", lineHeight: 1.15, color: "var(--text-main)" }}>
                {showCrash ? "High-Intensity Path ⚡" : "4-Year Blueprint 🗺️"}
              </h1>
              <p style={{ fontSize: 18, color: "var(--text-muted)", maxWidth: 640, margin: "0 auto", lineHeight: 1.6 }}>
                Configure your {showCrash ? `accelerated learning path for ${selectedCareer}` : `long-term academic and career alignment for ${selectedCareer}`}.
              </p>
            </>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════
           VIEW A: MODE SELECTION (SHOWS 2 CARDS)
        ══════════════════════════════════════════════════════ */}
        {view === "selection" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 32, padding: 40, boxShadow: "0 10px 36px rgba(0,0,0,0.04)", marginBottom: 36 }}>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 28 }}>

                {/* ── CARD 1: CRASH COURSE MODE ── */}
                <div
                  onMouseEnter={() => setHoveredMode("crash")}
                  onMouseLeave={() => setHoveredMode("")}
                  onClick={() => goToConfig("crash")}
                  style={{
                    background: selectedMode === "crash" ? "rgba(247,151,30,0.08)" : "var(--bg-alt)",
                    border: `2.5px solid ${hoveredMode === "crash" || selectedMode === "crash" ? "#f7971e" : "var(--border-light)"}`,
                    borderRadius: 26, padding: 32, cursor: "pointer", transition: "all 0.3s ease",
                    position: "relative", boxShadow: hoveredMode === "crash" ? "0 14px 36px rgba(247,151,30,0.18)" : "none"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 20, background: "linear-gradient(135deg, #f7971e, #e040fb)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "#fff", boxShadow: "0 6px 20px rgba(247,151,30,0.35)" }}>
                      ⚡
                    </div>
                    <span style={{ padding: "6px 14px", borderRadius: 14, background: "rgba(247,151,30,0.12)", border: "1px solid #f7971e40", color: "#f7971e", fontFamily: "'Fira Code', monospace", fontSize: 12.5, fontWeight: 800 }}>
                      FAST PACE
                    </span>
                  </div>

                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 800, color: "var(--text-main)", margin: "0 0 10px" }}>
                    Crash Course Mode
                  </h3>

                  <p style={{ fontSize: 15.5, color: "var(--text-muted)", lineHeight: 1.65, margin: "0 0 24px" }}>
                    Accelerated learning for rapid skill acquisition. Ideal for interview preparation or mastering {selectedCareer} in weeks.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                    {[
                      { icon: "⏱️", label: "Daily Commitment", val: "4–6 hours/day" },
                      { icon: "🎯", label: "Focus Area", val: "Project-heavy & Practical" },
                      { icon: "🏁", label: "Target Outcome", val: "Immediate Job Readiness" }
                    ].map(item => (
                      <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderRadius: 14, background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                        <span style={{ fontSize: 14, color: "var(--text-muted)" }}>{item.icon} {item.label}</span>
                        <strong style={{ fontSize: 14.5, color: "var(--text-main)" }}>{item.val}</strong>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setPreviewMode("crash"); setPreviewOpen(true); }}
                    style={{
                      width: "100%", padding: "12px", borderRadius: 14, border: "1.5px solid #f7971e40",
                      background: "rgba(247,151,30,0.08)", color: "#f7971e", fontFamily: "'Fira Code', monospace",
                      fontSize: 13.5, fontWeight: 800, cursor: "pointer"
                    }}
                  >
                    👁️ PREVIEW FIRST WEEK
                  </button>
                </div>

                {/* ── CARD 2: UG JOURNEY MODE ── */}
                <div
                  onMouseEnter={() => setHoveredMode("ug")}
                  onMouseLeave={() => setHoveredMode("")}
                  onClick={() => goToConfig("ug")}
                  style={{
                    background: selectedMode === "ug" ? "rgba(0,201,167,0.08)" : "var(--bg-alt)",
                    border: `2.5px solid ${hoveredMode === "ug" || selectedMode === "ug" ? "#00c9a7" : "var(--border-light)"}`,
                    borderRadius: 26, padding: 32, cursor: "pointer", transition: "all 0.3s ease",
                    position: "relative", boxShadow: hoveredMode === "ug" ? "0 14px 36px rgba(0,201,167,0.18)" : "none"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 20, background: "linear-gradient(135deg, #00c9a7, #6c63ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "#fff", boxShadow: "0 6px 20px rgba(0,201,167,0.35)" }}>
                      🗺️
                    </div>
                    <span style={{ padding: "6px 14px", borderRadius: 14, background: "rgba(0,201,167,0.12)", border: "1px solid #00c9a740", color: "#00c9a7", fontFamily: "'Fira Code', monospace", fontSize: 12.5, fontWeight: 800 }}>
                      RECOMMENDED
                    </span>
                  </div>

                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 800, color: "var(--text-main)", margin: "0 0 10px" }}>
                    UG Journey Mode
                  </h3>

                  <p style={{ fontSize: 15.5, color: "var(--text-muted)", lineHeight: 1.65, margin: "0 0 24px" }}>
                    The complete 4-year blueprint. Synchronizes your university semesters with industry requirements for {selectedCareer}.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                    {[
                      { icon: "⏱️", label: "Daily Commitment", val: "1–2 hours/day" },
                      { icon: "🎯", label: "Focus Area", val: "Balanced Theory & Projects" },
                      { icon: "🏁", label: "Target Outcome", val: "Long-Term Mastery & Degree" }
                    ].map(item => (
                      <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderRadius: 14, background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                        <span style={{ fontSize: 14, color: "var(--text-muted)" }}>{item.icon} {item.label}</span>
                        <strong style={{ fontSize: 14.5, color: "var(--text-main)" }}>{item.val}</strong>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setPreviewMode("ug"); setPreviewOpen(true); }}
                    style={{
                      width: "100%", padding: "12px", borderRadius: 14, border: "1.5px solid #00c9a740",
                      background: "rgba(0,201,167,0.08)", color: "#00c9a7", fontFamily: "'Fira Code', monospace",
                      fontSize: 13.5, fontWeight: 800, cursor: "pointer"
                    }}
                  >
                    👁️ PREVIEW SEMESTER MAP
                  </button>
                </div>

              </div>

            </div>

            {/* SELECTION BOTTOM NAV */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                onClick={() => router.push("/onboarding/stage3")}
                style={{
                  padding: "16px 32px", borderRadius: 18, border: "1.5px solid var(--border-light)",
                  background: "var(--bg-card)", color: "var(--text-main)",
                  fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, cursor: "pointer"
                }}
              >
                ← Back to Stage 3
              </button>
              <div style={{ fontSize: 14, color: "var(--text-muted)", fontFamily: "'Fira Code', monospace" }}>
                Select a learning card above to continue
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════
           VIEW B: CONFIGURATION (CRASH COURSE vs UG JOURNEY)
        ══════════════════════════════════════════════════════ */}
        {view === "config" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            
            {/* ── CRASH COURSE CONFIG ── */}
            {showCrash && (
              <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 32, padding: 40, boxShadow: "0 10px 36px rgba(0,0,0,0.04)", marginBottom: 36 }}>
                
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(247,151,30,0.12)", border: "1.5px solid #f7971e40", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                    ⚡
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
                      Customize Your Crash Course for {selectedCareer}
                    </h3>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12.5, fontWeight: 800, color: "#f7971e" }}>
                      HIGH-INTENSITY ACCELERATED CONFIGURATION
                    </div>
                  </div>
                </div>

                {/* Core Configuration Dropdowns */}
                <div style={{ marginBottom: 32 }}>
                  <label style={{ display: "block", fontFamily: "'Outfit', sans-serif", fontSize: 19, fontWeight: 800, color: "var(--text-main)", marginBottom: 14 }}>
                    Core Configuration Parameters
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
                    <div>
                      <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>
                        ROADMAP DURATION
                      </div>
                      <select 
                        value={crashDuration} 
                        onChange={e => setCrashDuration(e.target.value)}
                        style={{ width: "100%", padding: "14px 16px", borderRadius: 14, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", fontSize: 15.5, fontWeight: 600, outline: "none" }}
                      >
                        {["3 months", "6 months", "9 months", "1 Year"].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>

                    <div>
                      <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>
                        STUDY FREQUENCY
                      </div>
                      <select 
                        value={crashFrequency} 
                        onChange={e => setCrashFrequency(e.target.value)}
                        style={{ width: "100%", padding: "14px 16px", borderRadius: 14, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", fontSize: 15.5, fontWeight: 600, outline: "none" }}
                      >
                        {["Daily", "3 days/week", "5 days/week"].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>

                    <div>
                      <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>
                        CURRENT SKILL LEVEL
                      </div>
                      <select 
                        value={crashSkillLevel} 
                        onChange={e => setCrashSkillLevel(e.target.value)}
                        style={{ width: "100%", padding: "14px 16px", borderRadius: 14, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", fontSize: 15.5, fontWeight: 600, outline: "none" }}
                      >
                        {["Beginner", "Intermediate", "Advanced"].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Priorities Toggle & Skill Order Selector (DYNAMIC GEMINI SKILLS) */}
                <div style={{ marginBottom: 32 }}>
                  <ToggleSwitch 
                    on={crashPriority} 
                    onChange={() => setCrashPriority(!crashPriority)} 
                    labelOn="Set custom skill priority sequence in your roadmap? Yes ✓" 
                    labelOff="Set custom skill priority sequence in your roadmap? (click to enable)" 
                  />
                  {crashPriority && (
                    <div style={{ marginTop: 16 }}>
                      <p style={{ fontSize: 14.5, color: "var(--text-muted)", marginBottom: 12 }}>
                        Click skills in the order you want to learn them for <strong>{selectedCareer}</strong>. Numbers dictate priority.
                      </p>
                      <SkillOrderBox skills={careerData.skills} order={crashOrder} onToggle={s => toggleOrderSkill(s, crashOrder, setCrashOrder)} accentColor="#f7971e" />
                    </div>
                  )}
                </div>

                {/* Already Known Skills Checklist (DYNAMIC GEMINI SKILLS) */}
                <div style={{ marginBottom: 32 }}>
                  <label style={{ display: "block", fontFamily: "'Outfit', sans-serif", fontSize: 19, fontWeight: 800, color: "var(--text-main)", marginBottom: 4 }}>
                    Already Known Skills (Optional)
                  </label>
                  <p style={{ fontSize: 14.5, color: "var(--text-muted)", margin: "0 0 14px" }}>
                    Mark skills required for <strong>{selectedCareer}</strong> that you have already mastered — PathEd will bypass these nodes.
                  </p>
                  <KnownSkillsChecklist skills={careerData.skills} checked={crashKnown} onToggle={s => toggleKnown(s, crashKnown, setCrashKnown)} accentColor="#f7971e" />
                </div>

                {/* Additional Skills Searchable Input */}
                <div style={{ marginBottom: 32 }}>
                  <label style={{ display: "block", fontFamily: "'Outfit', sans-serif", fontSize: 19, fontWeight: 800, color: "var(--text-main)", marginBottom: 4 }}>
                    Additional Skills (Explore & Enhance)
                  </label>
                  <p style={{ fontSize: 14.5, color: "var(--text-muted)", margin: "0 0 14px" }}>
                    Add extra skills outside your core path to be woven into your milestone targets.
                  </p>
                  <AdditionalSkillsSelector added={crashAdded} onAdd={s => setCrashAdded([...crashAdded, s])} onRemove={s => setCrashAdded(crashAdded.filter(x => x !== s))} />
                </div>

                {/* Holistic Mode Toggle */}
                <div style={{ marginBottom: 32 }}>
                  <ToggleSwitch 
                    on={crashHolistic} 
                    onChange={() => setCrashHolistic(!crashHolistic)} 
                    labelOn="Holistic roadmap active — includes soft skills & interview prep ✓" 
                    labelOff="Make this roadmap holistic (soft skills + internship prep)?" 
                  />
                </div>

                {/* DEVELOPMENT PHASE NOTICE FOR CRASH COURSE */}
                <div style={{ 
                  padding: "20px 24px", borderRadius: 20, 
                  background: "rgba(247,151,30,0.1)", border: "1.5px solid #f7971e40", 
                  display: "flex", alignItems: "center", gap: 16 
                }}>
                  <ShieldAlert size={32} color="#f7971e" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800, color: "#f7971e" }}>
                      🚧 Development Phase Notice
                    </div>
                    <div style={{ fontSize: 14.5, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.5 }}>
                      The Crash Course engine is currently in development mode. Please switch to the <strong>UG Journey Mode</strong> to generate your active roadmap.
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ── UG JOURNEY CONFIG ── */}
            {showUG && (
              <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 32, padding: 40, boxShadow: "0 10px 36px rgba(0,0,0,0.04)", marginBottom: 36 }}>
                
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(0,201,167,0.12)", border: "1.5px solid #00c9a740", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
                    🗺️
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
                      Customize Your UG Journey for {selectedCareer}
                    </h3>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 12.5, fontWeight: 800, color: "#00c9a7" }}>
                      4-YEAR ACADEMIC MASTERY ENGINE — DEMANDED SKILLS GENERATED BY GEMINI AI
                    </div>
                  </div>
                </div>

                {/* Core Configuration Dropdowns */}
                <div style={{ marginBottom: 32 }}>
                  <label style={{ display: "block", fontFamily: "'Outfit', sans-serif", fontSize: 19, fontWeight: 800, color: "var(--text-main)", marginBottom: 14 }}>
                    Long-Term Configuration Parameters
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 18 }}>
                    <div>
                      <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>
                        ROADMAP DURATION
                      </div>
                      <select 
                        value={ugDuration} 
                        onChange={e => setUgDuration(e.target.value)}
                        style={{ width: "100%", padding: "14px 16px", borderRadius: 14, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", fontSize: 15.5, fontWeight: 600, outline: "none" }}
                      >
                        {["1 Year", "2 Years", "3 Years", "4 Years"].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>

                    <div>
                      <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>
                        STUDY FREQUENCY
                      </div>
                      <select 
                        value={ugFrequency} 
                        onChange={e => setUgFrequency(e.target.value)}
                        style={{ width: "100%", padding: "14px 16px", borderRadius: 14, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", fontSize: 15.5, fontWeight: 600, outline: "none" }}
                      >
                        {["Daily (Lite)", "Weekly (Balanced)", "Monthly (Overview)"].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>

                    <div>
                      <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>
                        CURRENT SKILL LEVEL
                      </div>
                      <select 
                        value={ugSkillLevel} 
                        onChange={e => setUgSkillLevel(e.target.value)}
                        style={{ width: "100%", padding: "14px 16px", borderRadius: 14, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", fontSize: 15.5, fontWeight: 600, outline: "none" }}
                      >
                        {["Beginner", "Intermediate", "Advanced"].map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Priorities Toggle & Skill Order Selector (DYNAMIC DEMANDED SKILLS GENERATED BY AI) */}
                <div style={{ marginBottom: 32 }}>
                  <ToggleSwitch 
                    on={ugPriority} 
                    onChange={() => setUgPriority(!ugPriority)} 
                    labelOn="Set custom skill priority sequence in your roadmap? Yes ✓" 
                    labelOff="Set custom skill priority sequence in your roadmap? (click to enable)" 
                  />
                  {ugPriority && (
                    <div style={{ marginTop: 16 }}>
                      <p style={{ fontSize: 14.5, color: "var(--text-muted)", marginBottom: 12 }}>
                        Click the demanded skills below for <strong>{selectedCareer}</strong> in the order you want to learn them across your semesters. Sequence numbers dictate priority.
                      </p>
                      <SkillOrderBox skills={careerData.skills} order={ugOrder} onToggle={s => toggleOrderSkill(s, ugOrder, setUgOrder)} accentColor="#00c9a7" />
                    </div>
                  )}
                </div>

                {/* Already Known Skills Checklist (DYNAMIC DEMANDED SKILLS GENERATED BY AI) */}
                <div style={{ marginBottom: 32 }}>
                  <label style={{ display: "block", fontFamily: "'Outfit', sans-serif", fontSize: 19, fontWeight: 800, color: "var(--text-main)", marginBottom: 4 }}>
                    Already Known Skills (Optional)
                  </label>
                  <p style={{ fontSize: 14.5, color: "var(--text-muted)", margin: "0 0 14px" }}>
                    Skills marked here for <strong>{selectedCareer}</strong> will be set as "Mastered" — the AI will focus on advanced semester nodes.
                  </p>
                  <KnownSkillsChecklist skills={careerData.skills} checked={ugKnown} onToggle={s => toggleKnown(s, ugKnown, setUgKnown)} accentColor="#00c9a7" />
                </div>

                {/* Additional Skills Searchable Input */}
                <div style={{ marginBottom: 32 }}>
                  <label style={{ display: "block", fontFamily: "'Outfit', sans-serif", fontSize: 19, fontWeight: 800, color: "var(--text-main)", marginBottom: 4 }}>
                    Additional Skills (Explore & Enhance)
                  </label>
                  <p style={{ fontSize: 14.5, color: "var(--text-muted)", margin: "0 0 14px" }}>
                    Add extra skills outside your core curriculum — PathEd AI weaves them into your 4-year timeline smoothly.
                  </p>
                  <AdditionalSkillsSelector added={ugAdded} onAdd={s => setUgAdded([...ugAdded, s])} onRemove={s => setUgAdded(ugAdded.filter(x => x !== s))} />
                </div>

                {/* Holistic Mode Toggle */}
                <div>
                  <ToggleSwitch 
                    on={ugHolistic} 
                    onChange={() => setUgHolistic(!ugHolistic)} 
                    labelOn="Holistic roadmap active — soft skills, internship milestones & networking included ✓" 
                    labelOff="Make this roadmap holistic (soft skills + internship prep)?" 
                  />
                </div>

              </div>
            )}

            {/* CONFIG NAVIGATION BUTTONS */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
              <button
                onClick={goBackToSelection}
                style={{
                  padding: "16px 32px", borderRadius: 18, border: "1.5px solid var(--border-light)",
                  background: "var(--bg-card)", color: "var(--text-main)",
                  fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 700, cursor: "pointer"
                }}
              >
                ← Change Mode
              </button>

              {/* CRITICAL: ONLY SHOW GENERATE ROADMAP BUTTON FOR UG JOURNEY MODE! */}
              {showUG && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGenerateUG}
                  disabled={isLaunching}
                  style={{
                    padding: "18px 40px", borderRadius: 20, border: "none",
                    background: "linear-gradient(135deg, #00c9a7, #6c63ff)", color: "#ffffff",
                    fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 800,
                    cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 12,
                    boxShadow: "0 10px 30px rgba(0,201,167,0.35)"
                  }}
                >
                  <Rocket size={22} /> {isLaunching ? "Synthesizing 4-Year Roadmap..." : "🗺️ Generate My Roadmap →"}
                </motion.button>
              )}
            </div>

          </motion.div>
        )}

      </main>

      {/* CLEAN BOTTOM BAR */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 90,
        background: "var(--bg-card)", borderTop: "1.5px solid var(--border-light)",
        padding: "16px 40px", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 -8px 28px rgba(0,0,0,0.05)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "'Fira Code', monospace", fontSize: 13.5, fontWeight: 800, color: "#6c63ff" }}>
          <Sparkles size={18} /> ROADMAP CALIBRATION ENGINE READY
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 13.5, fontWeight: 800, color: "#00c9a7" }}>
            STAGE 4 OF 4
          </span>
          <div style={{ width: 150, height: 8, borderRadius: 4, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: "100%", background: "linear-gradient(90deg, #6c63ff, #00c9a7)", borderRadius: 4 }} />
          </div>
        </div>
      </div>

      {/* PREVIEW POPUP MODAL (DYNAMIC TAILORED FOR CHOSEN CAREER) */}
      <PreviewModal 
        open={previewOpen} 
        onClose={() => setPreviewOpen(false)} 
        mode={previewMode}
        targetCareer={selectedCareer}
        crashData={careerData.crashSchedule}
        ugData={careerData.ugSchedule}
      />

    </div>
  );
}
