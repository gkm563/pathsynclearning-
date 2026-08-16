"use client";

import { routes } from "@/lib/routes";
import { useRouter } from "next/navigation";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { 
  Sparkles, Search, Calendar, Video, BookOpen, User, CheckCircle2, 
  ArrowRight, ShieldCheck, HelpCircle, Star, Clock, Plus, ChevronRight, X, 
  UserCheck, ShieldAlert, ArrowLeft, ArrowUpRight, Check, Heart, ExternalLink
} from "lucide-react";
import { usePlan } from "@/hooks/useStudentData";
const COLS = {
  primary: "#6c63ff",
  success: "#00c9a7",
  warning: "#f59e0b",
  danger: "#ec4899",
  info: "#38bdf8",
  purple: "#8b5cf6"
};

/* ─── MENTORS DATASET (15 PROFILES WITH PORTRAITS) ─── */
const MENTORS_POOL = [
  // --- Category 1: AI & Machine Learning ---
  {
    id: "m1",
    name: "Dr. Arpan Mukherjee",
    avatar: "👨‍🏫",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=500",
    company: "IIT Kanpur",
    role: "ML Researcher & Professor",
    category: "AI/ML",
    exp: 12,
    rating: 4.9,
    reviews: 142,
    skills: ["Machine Learning", "Deep Learning", "Pytorch"],
    certifications: ["PhD in AI - Stanford"],
    roadmaps: ["AI Engineer", "Data Scientist"],
    students: "1,200+",
    upcomingSession: "ML Optimization Frameworks - Sunday @ 4 PM",
    availability: "Saturdays 10 AM - 2 PM",
    quote: "Research and industry applications must merge to create true systems.",
    beforePath: "Struggling with Theory",
    afterPath: "AI Research Lead",
    col: "#f59e0b"
  },
  {
    id: "m2",
    name: "Shreya Sen",
    avatar: "👩‍💻",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Google",
    role: "Senior AI Engineer",
    category: "AI/ML",
    exp: 8,
    rating: 4.8,
    reviews: 98,
    skills: ["TensorFlow", "Computer Vision", "Python"],
    certifications: ["Google Cloud Professional ML Engineer"],
    roadmaps: ["AI Engineer"],
    students: "840+",
    upcomingSession: "Preparing for Google STEP interviews - Wednesday @ 7 PM",
    availability: "Weekdays 6 PM - 8 PM",
    quote: "Don't just learn frameworks; understand optimization math.",
    beforePath: "Struggling with Math",
    afterPath: "Google STEP Intern",
    col: "#00c9a7"
  },
  {
    id: "m3",
    name: "Vikram Malhotra",
    avatar: "👨‍💻",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Microsoft",
    role: "Senior ML Research Engineer",
    category: "AI/ML",
    exp: 7,
    rating: 4.7,
    reviews: 75,
    skills: ["Large Language Models", "Transformers", "NLP"],
    certifications: ["Microsoft Azure AI Specialist"],
    roadmaps: ["Data Scientist"],
    students: "620+",
    upcomingSession: "Transformers & Attention Mechanics - Friday @ 6 PM",
    availability: "Sundays 3 PM - 7 PM",
    quote: "Language modeling is shifting paradigms; learn to deploy scale.",
    beforePath: "Lacking Scale Projects",
    afterPath: "Microsoft AI SDE",
    col: "#6c63ff"
  },
  {
    id: "m4",
    name: "Sarah Jenkins",
    avatar: "👩‍🔬",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Meta",
    role: "AI Research Scientist",
    category: "AI/ML",
    exp: 9,
    rating: 4.9,
    reviews: 112,
    skills: ["Reinforcement Learning", "NLP", "Pytorch"],
    certifications: ["PhD in CS - Berkeley"],
    roadmaps: ["AI Engineer"],
    students: "740+",
    upcomingSession: "Agentic AI & Meta LLama Tractions - Tuesday @ 8 PM",
    availability: "Weekends 2 PM - 5 PM",
    quote: "Building systems that reason requires deep paradigm changes.",
    beforePath: "Struggling with NLP",
    afterPath: "Meta SDE Intern",
    col: "#ec4899"
  },
  {
    id: "m5",
    name: "David Chen",
    avatar: "👨‍🔬",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400&h=500",
    company: "OpenAI",
    role: "Research Scientist",
    category: "AI/ML",
    exp: 6,
    rating: 4.9,
    reviews: 89,
    skills: ["GPT Architectures", "RLHF", "Python"],
    certifications: ["PhD - MIT"],
    roadmaps: ["AI Engineer", "NLP Architect"],
    students: "510+",
    upcomingSession: "Introduction to RLHF Mechanics - Monday @ 6 PM",
    availability: "Fridays 10 AM - 1 PM",
    quote: "Aligning models to human intent is the next frontier of software.",
    beforePath: "Stuck in Theory",
    afterPath: "OpenAI Fellow",
    col: "#38bdf8"
  },

  // --- Category 2: Core SDE / Systems ---
  {
    id: "m6",
    name: "Rohan Verma",
    avatar: "👨‍💻",
    image: "https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Uber",
    role: "Senior Staff Engineer",
    category: "SDE",
    exp: 10,
    rating: 4.8,
    reviews: 120,
    skills: ["Java", "Distributed Systems", "Go", "Kubernetes"],
    certifications: ["Oracle Certified Master Java Developer"],
    roadmaps: ["Software Engineer"],
    students: "1,100+",
    upcomingSession: "Microservices & Distributed Caching - Thursday @ 7 PM",
    availability: "Sundays 11 AM - 3 PM",
    quote: "Real engineers focus on reliability, fault tolerance, and simple code.",
    beforePath: "Struggling with Go",
    afterPath: "Uber Tech Intern",
    col: "#6c63ff"
  },
  {
    id: "m7",
    name: "Priya Sharma",
    avatar: "👩‍💼",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=500",
    company: "TechCorp",
    role: "Senior Software Engineer",
    category: "SDE",
    exp: 8,
    rating: 4.9,
    reviews: 215,
    skills: ["React", "System Design", "Node.js", "MongoDB"],
    certifications: ["AWS Certified Solution Architect"],
    roadmaps: ["Software Engineer"],
    students: "1,450+",
    upcomingSession: "Thinking like an Engineer: DSA Traverses - Saturday @ 3 PM",
    availability: "Weekends 10 AM - 12 PM",
    quote: "PathEd didn't just teach me code. It taught me how to think like an engineer.",
    beforePath: "Struggling with DSA",
    afterPath: "Backend SDE",
    col: "#f59e0b"
  },
  {
    id: "m8",
    name: "Marcus Aurelius",
    avatar: "👨‍💻",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Apple",
    role: "Core OS Developer",
    category: "SDE",
    exp: 15,
    rating: 4.9,
    reviews: 130,
    skills: ["C++", "Kernel Dev", "Assembly", "Operating Systems"],
    certifications: ["UNIX Internals Expert Cert"],
    roadmaps: ["Software Engineer"],
    students: "780+",
    upcomingSession: "Understanding Kernel Processes & Deadlocks - Sunday @ 2 PM",
    availability: "Mondays 3 PM - 5 PM",
    quote: "Optimize at the hardware layer. Everything else is abstraction.",
    beforePath: "Theoretical OS basics only",
    afterPath: "Core OS Developer",
    col: "#ec4899"
  },
  {
    id: "m9",
    name: "Kenji Sato",
    avatar: "👨‍💼",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Sony",
    role: "Embedded Lead Engineer",
    category: "SDE",
    exp: 11,
    rating: 4.7,
    reviews: 62,
    skills: ["C", "RTOS", "Firmware Development", "IoT"],
    certifications: ["RTOS Systems Architect"],
    roadmaps: ["Software Engineer"],
    students: "430+",
    upcomingSession: "Firmware Optimization & Battery Management - Friday @ 5 PM",
    availability: "Thursdays 4 PM - 7 PM",
    quote: "Code correctly the first time. Embedded systems don't have updates.",
    beforePath: "Struggling with RTOS",
    afterPath: "Sony Firmware Architect",
    col: "#00c9a7"
  },
  {
    id: "m10",
    name: "Clara Oswald",
    avatar: "👩‍💻",
    image: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Netflix",
    role: "Senior Backend Developer",
    category: "SDE",
    exp: 7,
    rating: 4.8,
    reviews: 94,
    skills: ["Node.js", "Redis", "Kafka", "Graph Databases"],
    certifications: ["Redisson Specialist Developer"],
    roadmaps: ["Software Engineer"],
    students: "810+",
    upcomingSession: "High-Throughput Streaming & Redis caching - Saturday @ 6 PM",
    availability: "Weekdays 8 AM - 10 AM",
    quote: "Scalability isn't just about load. It's about data latency.",
    beforePath: "Struggling with Caching",
    afterPath: "Netflix Staff Engineer",
    col: "#38bdf8"
  },

  // --- Category 3: Database & Cloud ---
  {
    id: "m11",
    name: "Anjali Gupta",
    avatar: "👩‍💼",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Amazon Web Services",
    role: "Lead Data Scientist",
    category: "Cloud",
    exp: 9,
    rating: 4.9,
    reviews: 110,
    skills: ["SQL", "DBMS", "AWS Cloud", "Redshift"],
    certifications: ["AWS Certified Data Analytics Specialist"],
    roadmaps: ["Data Scientist", "Cloud Architect"],
    students: "950+",
    upcomingSession: "Database Indexing & Big Data Pipelines - Saturday @ 11 AM",
    availability: "Weekends 11 AM - 3 PM",
    quote: "Data is only useful if it can be queried instantly at scale.",
    beforePath: "Database normalisation gaps",
    afterPath: "AWS Analytics Architect",
    col: "#38bdf8"
  },
  {
    id: "m12",
    name: "Nitin Das",
    avatar: "👨‍💻",
    image: "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Oracle",
    role: "Principal Database Architect",
    category: "Cloud",
    exp: 14,
    rating: 4.8,
    reviews: 87,
    skills: ["Oracle Database", "SQL PL/SQL", "High Availability"],
    certifications: ["Oracle Database Administration Certified Professional"],
    roadmaps: ["Database Administrator"],
    students: "530+",
    upcomingSession: "Understanding Transaction Isolation Levels - Tuesday @ 7 PM",
    availability: "Wednesdays 3 PM - 6 PM",
    quote: "Understand ACID compliance before scaling horizontally.",
    beforePath: "Struggling with ACID",
    afterPath: "Principal Oracle DBA",
    col: "#ec4899"
  },
  {
    id: "m13",
    name: "Elena Rostova",
    avatar: "👩‍💼",
    image: "https://images.unsplash.com/photo-1594744803329-e58b31de215f?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Yandex",
    role: "Principal Database Lead",
    category: "Cloud",
    exp: 10,
    rating: 4.8,
    reviews: 69,
    skills: ["PostgreSQL", "NoSQL Architectures", "Clickhouse"],
    certifications: ["Postgres Advanced Specialist"],
    roadmaps: ["Data Engineer"],
    students: "390+",
    upcomingSession: "Clickhouse Traverses for Realtime OLAP - Sunday @ 10 AM",
    availability: "Weekends 10 AM - 1 PM",
    quote: "Pick the correct database paradigm based on read-write distribution.",
    beforePath: "Unoptimized PostgreSQL structures",
    afterPath: "Yandex Database Architect",
    col: "#f59e0b"
  },
  {
    id: "m14",
    name: "Sandeep Nair",
    avatar: "👨‍💼",
    image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Google Cloud",
    role: "Solutions Architect",
    category: "Cloud",
    exp: 12,
    rating: 4.9,
    reviews: 142,
    skills: ["GCP Platform", "BigQuery", "Terraform", "Cloud Functions"],
    certifications: ["Google Cloud Certified Professional Cloud Architect"],
    roadmaps: ["Cloud Architect"],
    students: "1,150+",
    upcomingSession: "Terraform Infrastructure as Code Patterns - Friday @ 4 PM",
    availability: "Weekdays 5 PM - 7 PM",
    quote: "Automate everything. Manual deployments are bugs in waiting.",
    beforePath: "Manual configurations prone to error",
    afterPath: "GCP Solutions Architect",
    col: "#00c9a7"
  },
  {
    id: "m15",
    name: "Maya Lin",
    avatar: "👩‍💼",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Snowflake",
    role: "Principal Engineer",
    category: "Cloud",
    exp: 8,
    rating: 4.8,
    reviews: 79,
    skills: ["Data Warehousing", "Snowflake Architectures", "SQL"],
    certifications: ["SnowPro Core Certification"],
    roadmaps: ["Data Engineer"],
    students: "680+",
    upcomingSession: "Data Warehousing and Scaling Snowflake - Monday @ 7 PM",
    availability: "Tuesdays 9 AM - 12 PM",
    quote: "Seperate computing from storage. It is cheaper and faster.",
    beforePath: "High latency big-data query locks",
    afterPath: "Snowflake Principal Consultant",
    col: "#6c63ff"
  }
];

const getMentorBio = (m) => {
  if (m.id === "m7") {
    return "Priya is a Senior Software Engineer with 8+ years of experience. She specializes in building highly scalable React applications, microservices, and backend system designs. Her mentorship focuses on transitioning from academic theory to enterprise-grade system coding.";
  }
  return `${m.name} is a senior engineering practitioner at ${m.company} with ${m.exp} years of industry experience. Specializing in ${m.skills.join(", ")}, their curriculum simulates actual production environments. They help students master core roadmap requirements, write optimized code, and prepare for tier-1 recruitment rounds.`;
};

export default function PlatformMentorship() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("mentorship");
  const [mentTab, setMentTab] = useState("marketplace");

  const { plan: devPlan, setPlan } = usePlan();

  // Interactive booking/mentor list states
  const [activeMentors, setActiveMentors] = useState(["m7"]); // Priya Sharma preselected by default
  const [searchMode, setSearchMode] = useState(false); // Toggle Search screen
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMentor, setSelectedMentor] = useState<any>(null); // Detailed testimonial/bio popup modal
  const [bookingMentor, setBookingMentor] = useState<any>(null); // Slot confirmation popup
  const [bookingSlot, setBookingSlot] = useState<any>(null);
  const [isBooked, setIsBooked] = useState(false);
  const [followedMentors, setFollowedMentors] = useState<Record<string, any>>({});
  const [showSessions, setShowSessions] = useState<Record<string, any>>({});

  const handleTogglePlan = (plan) => {
    setPlan(plan);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const toggleFollow = (mentorId) => {
    setFollowedMentors(prev => ({
      ...prev,
      [mentorId]: !prev[mentorId]
    }));
  };

  const addMentor = (mentorId) => {
    if (!activeMentors.includes(mentorId)) {
      setActiveMentors(prev => [...prev, mentorId]);
    }
  };

  const removeMentor = (mentorId) => {
    setActiveMentors(prev => prev.filter(id => id !== mentorId));
  };

  // Horizontal slidable row categorization
  const aiMentors = MENTORS_POOL.filter(m => m.category === "AI/ML");
  const sdeMentors = MENTORS_POOL.filter(m => m.category === "SDE");
  const cloudMentors = MENTORS_POOL.filter(m => m.category === "Cloud");

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={handleTabChange}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 60, position: "relative" }}>
        
        {/* ── DEVELOPER TESTING MODE TOGGLE BANNER (MNC ENTERPRISE GRADED) ── */}
        <div style={{
          padding: "16px 24px", borderRadius: 18,
          background: devPlan === "premium" 
            ? "linear-gradient(135deg, rgba(0, 201, 167, 0.12), rgba(108, 99, 255, 0.12))" 
            : "linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(239, 68, 68, 0.08))",
          border: devPlan === "premium" ? "1.5px solid #00c9a7" : "1.5px solid #f59e0b",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>⚙️</span>
            <div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 900, color: devPlan === "premium" ? "#00c9a7" : "#f59e0b" }}>
                DEVELOPER TESTING TOGGLE
              </div>
              <p style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 13.5, color: "var(--text-muted)", fontWeight: 600 }}>
                Test plan variations instantly without database logins.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", background: "var(--bg-alt)", padding: 4, borderRadius: 14, border: "1px solid var(--border-light)", gap: 6 }}>
            <button
              onClick={() => handleTogglePlan("free")}
              style={{
                padding: "8px 16px", borderRadius: 10, border: "none",
                background: devPlan === "free" ? "#f59e0b" : "transparent",
                color: devPlan === "free" ? "#ffffff" : "var(--text-muted)",
                fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 800, cursor: "pointer"
              }}
            >
              ○ Free Plan
            </button>
            <button
              onClick={() => handleTogglePlan("premium")}
              style={{
                padding: "8px 16px", borderRadius: 10, border: "none",
                background: devPlan === "premium" ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "transparent",
                color: devPlan === "premium" ? "#ffffff" : "var(--text-muted)",
                fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 800, cursor: "pointer",
                boxShadow: devPlan === "premium" ? "0 4px 12px rgba(108,99,255,0.25)" : "none"
              }}
            >
              ● Premium Plan
            </button>
          </div>
        </div>

        {/* ── TOP HERO TITLE REGION ── */}
        <div style={{
          padding: "26px 30px", borderRadius: 24,
          background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16
        }}>
          <div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "#6c63ff", fontWeight: 900, letterSpacing: 1.5, marginBottom: 4 }}>
              COLLABORATION & COMMUNITIES
            </div>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
              Industry <span style={{ background: "linear-gradient(90deg, #6c63ff, #00c9a7, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Mentorship</span>
            </h1>
          </div>

          {/* Sub Navigation */}
          <div style={{
            display: "inline-flex", background: "var(--bg-alt)", padding: 5, borderRadius: 20,
            border: "1.5px solid var(--border-light)", gap: 8
          }}>
            <button
              onClick={() => { setMentTab("marketplace"); setSearchMode(false); }}
              style={{
                padding: "12px 24px", borderRadius: 16, border: "none",
                background: mentTab === "marketplace" ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "transparent",
                color: mentTab === "marketplace" ? "#ffffff" : "var(--text-muted)",
                fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
              }}
            >
              <User size={17} />
              <span>Mentor Space</span>
            </button>

            <button
              onClick={() => { setMentTab("dashboard"); setSearchMode(false); }}
              style={{
                padding: "12px 24px", borderRadius: 16, border: "none",
                background: mentTab === "dashboard" ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "transparent",
                color: mentTab === "dashboard" ? "#ffffff" : "var(--text-muted)",
                fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
              }}
            >
              <Calendar size={17} />
              <span>Instructor Portal</span>
            </button>
          </div>
        </div>

        {/* ── MENTOR SPACE MAIN PANEL ── */}
        {mentTab === "marketplace" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* 1. MY MENTOR DEFAULT VIEW (NOT SEARCH MODE) */}
            {!searchMode ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                
                {activeMentors.length === 0 ? (
                  /* Empty state when no mentors are added */
                  <div style={{
                    padding: "60px 40px", borderRadius: 24, background: "var(--bg-card)",
                    border: "1.5px dashed var(--border-light)", textAlign: "center",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 18
                  }}>
                    <div style={{ fontSize: 60 }}>🤝</div>
                    <div>
                      <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
                        Select Your Mentor
                      </h2>
                      <p style={{ margin: "6px 0 0", fontFamily: "'Outfit', sans-serif", fontSize: 15, color: "var(--text-muted)", maxWidth: 460 }}>
                        Connect with seasoned product software developers to review your portfolio, check syllabus gaps, and run mock technical interviews.
                      </p>
                    </div>

                    <button
                      onClick={() => setSearchMode(true)}
                      style={{
                        padding: "14px 28px", borderRadius: 16, border: "none",
                        background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#ffffff",
                        fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 900,
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                        boxShadow: "0 6px 20px rgba(108,99,255,0.25)"
                      }}
                    >
                      <Search size={16} />
                      <span>Search Mentors Marketplace</span>
                    </button>
                  </div>
                ) : (
                  /* Displaying added mentors list */
                  <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
                    
                    <div style={{ display: "flex", justify: "space-between", alignItems: "center" }}>
                      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
                        Your Active Mentors ({activeMentors.length})
                      </h3>
                      <button
                        onClick={() => setSearchMode(true)}
                        style={{
                          padding: "10px 20px", borderRadius: 12, border: "1.5px solid var(--border-light)",
                          background: "var(--bg-card)", color: "var(--text-main)",
                          fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800,
                          cursor: "pointer", display: "flex", alignItems: "center", gap: 8
                        }}
                      >
                        <Plus size={16} color="#6c63ff" />
                        <span>Find More Mentors</span>
                      </button>
                    </div>

                    {/* MENTOR CARDS CORRESPONDING TO PRECISE BIO REQUIREMENT (EXACT SCREENSHOT STYLE) */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                      {activeMentors.map(id => {
                        const m = MENTORS_POOL.find(item => item.id === id);
                        if (!m) return null;
                        const isFollowing = !!followedMentors[m.id];
                        
                        return (
                          <div 
                            key={m.id}
                            style={{
                              background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
                              borderRadius: 24, padding: 32, display: "flex", flexDirection: "column", gap: 24,
                              boxShadow: "0 8px 30px rgba(0,0,0,0.03)", position: "relative"
                            }}
                          >
                            {/* TOP-RIGHT: Prominent Red Remove Button */}
                            <button
                              onClick={() => {
                                if (window.confirm(`Remove ${m.name} from your mentors?`)) {
                                  removeMentor(m.id);
                                }
                              }}
                              title="Remove this mentor"
                              style={{
                                position: "absolute", top: 18, right: 18,
                                padding: "9px 18px", borderRadius: 12,
                                background: "#ef4444", border: "none",
                                color: "#ffffff", fontFamily: "'Outfit', sans-serif", fontSize: 13.5,
                                fontWeight: 900, cursor: "pointer", zIndex: 10,
                                display: "flex", alignItems: "center", gap: 7,
                                boxShadow: "0 4px 14px rgba(239, 68, 68, 0.35)",
                                transition: "all 0.2s"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#dc2626";
                                e.currentTarget.style.boxShadow = "0 6px 18px rgba(239, 68, 68, 0.5)";
                                e.currentTarget.style.transform = "scale(1.04)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "#ef4444";
                                e.currentTarget.style.boxShadow = "0 4px 14px rgba(239, 68, 68, 0.35)";
                                e.currentTarget.style.transform = "scale(1)";
                              }}
                            >
                              <span style={{ fontSize: 15 }}>🗑</span>
                              Remove Mentor
                            </button>
                            {/* Inner Layout: Left image, Right details (EXACT sync with PRIYA SHARMA visual mockup) */}
                            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr", gap: 32, alignItems: "center" }}>
                              
                              {/* Left: Professional Portrait Graphic Overlay */}
                              <div style={{
                                position: "relative", width: "100%", aspectRatio: "1.2", 
                                borderRadius: 20, overflow: "hidden", 
                                border: `2.5px solid var(--border-light)`
                              }}>
                                <img 
                                  src={m.image} 
                                  alt={m.name} 
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                                
                                {/* Bottom dark text bar container */}
                                <div style={{
                                  position: "absolute", bottom: 0, left: 0, right: 0,
                                  background: "linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.3) 70%, transparent)",
                                  padding: "20px 24px", color: "#ffffff"
                                }}>
                                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 900 }}>
                                    {m.name}
                                  </div>
                                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "#00c9a7", fontWeight: 800, marginTop: 4 }}>
                                    Hired at {m.company} · Experience: {m.exp} Years
                                  </div>
                                </div>
                              </div>

                              {/* Right: Testimonial OR Instructor Specialization based on hasCaseStudy */}
                              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 900, color: "var(--text-main)", margin: 0, lineHeight: 1.25 }}>
                                  {m.id === "m7" ? "PathEd Alumni Placement Case Study" : "Meet Your Instructor & Mentor"}
                                </h2>

                                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 850, color: "var(--text-main)", fontStyle: "italic", lineHeight: 1.35 }}>
                                  "{m.quote}"
                                </div>

                                {m.id === "m7" ? (
                                  <>
                                    <p style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 15.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
                                      "Before PathEd, I was lost in a sea of theoretical coursework. Once I started completing the real-world challenges on my personalized roadmap, my CRI score shot up. Within 3 months, a recruiter saw my profile and reached out directly. No resume screen, just proof of work."
                                    </p>

                                    {/* Testimonial comparison badges */}
                                    <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                                      <div style={{
                                        padding: "10px 18px", borderRadius: 12, background: "rgba(108,99,255,0.08)",
                                        border: "1px solid rgba(108,99,255,0.25)"
                                      }}>
                                        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "#6c63ff", fontWeight: 900, letterSpacing: 0.8 }}>BEFORE PATHED</div>
                                        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 800, color: "var(--text-main)", marginTop: 2 }}>{m.beforePath}</div>
                                      </div>

                                      <div style={{
                                        padding: "10px 18px", borderRadius: 12, background: "rgba(0,201,167,0.08)",
                                        border: "1px solid rgba(0,201,167,0.25)"
                                      }}>
                                        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "#00c9a7", fontWeight: 900, letterSpacing: 0.8 }}>AFTER PATHED</div>
                                        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 800, color: "var(--text-main)", marginTop: 2 }}>{m.afterPath}</div>
                                      </div>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <p style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 15.5, color: "var(--text-muted)", lineHeight: 1.6 }}>
                                      "As an active practitioner at <strong style={{ fontWeight: 800 }}>{m.company}</strong>, my instruction is designed to simulate actual engineering team environments. We will bypass theoretical slides to build and profile low-latency microservices, scale partition topologies, and trace compiler optimization flags."
                                    </p>

                                    {/* Professional specs badges */}
                                    <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                                      <div style={{
                                        padding: "10px 18px", borderRadius: 12, background: "rgba(108,99,255,0.08)",
                                        border: "1px solid rgba(108,99,255,0.25)"
                                      }}>
                                        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "#6c63ff", fontWeight: 900, letterSpacing: 0.8 }}>TARGET PIPELINE</div>
                                        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 800, color: "var(--text-main)", marginTop: 2 }}>{m.role.replace("Senior ", "")}</div>
                                      </div>

                                      <div style={{
                                        padding: "10px 18px", borderRadius: 12, background: "rgba(0,201,167,0.08)",
                                        border: "1px solid rgba(0,201,167,0.25)"
                                      }}>
                                        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "#00c9a7", fontWeight: 900, letterSpacing: 0.8 }}>CORE SPECIALTY</div>
                                        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 800, color: "var(--text-main)", marginTop: 2 }}>{m.skills[0]} Traversal</div>
                                      </div>
                                    </div>
                                  </>
                                )}

                                {/* Bio Box placed directly below the comparison/struggling region */}
                                <div style={{
                                  marginTop: 14, padding: "14px 18px", borderRadius: 16,
                                  background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                                  textAlign: "left"
                                }}>
                                  <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10.5, color: m.col || "#6c63ff", fontWeight: 900, letterSpacing: 0.8, marginBottom: 4 }}>
                                    MENTOR BIO & VISION
                                  </div>
                                  <p style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5 }}>
                                    {getMentorBio(m)}
                                  </p>
                                </div>
                              </div>

                            </div>

                            {/* Session Booking info (Free / Premium Actions) */}
                            <div style={{
                              display: "flex", justify: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16,
                              paddingTop: 24, borderTop: "1.5px solid var(--border-light)"
                            }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ padding: "6px 12px", background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", borderRadius: 8, fontFamily: "'Fira Code', monospace", fontSize: 13, color: "var(--text-muted)" }}>
                                  👥 {m.students} coached
                                </span>
                                <span style={{ padding: "6px 12px", background: "rgba(245, 158, 11, 0.12)", border: "1px solid #f59e0b", borderRadius: 8, fontFamily: "'Fira Code', monospace", fontSize: 13, color: "#f59e0b", fontWeight: 800 }}>
                                  ★ {m.rating} ({m.reviews} reviews)
                                </span>
                              </div>

                              <div style={{ display: "flex", gap: 12 }}>
                                <button
                                  onClick={() => setShowSessions(prev => ({ ...prev, [m.id]: !prev[m.id] }))}
                                  style={{
                                    padding: "12px 20px", borderRadius: 14, 
                                    background: showSessions[m.id] ? "rgba(108,99,255,0.12)" : "var(--bg-alt)",
                                    border: showSessions[m.id] ? "1.5px solid #6c63ff" : "1.5px solid var(--border-light)", 
                                    color: showSessions[m.id] ? "#6c63ff" : "var(--text-main)",
                                    fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, cursor: "pointer"
                                  }}
                                >
                                  {showSessions[m.id] ? "Hide Live Sessions" : "View Live Sessions"}
                                </button>

                                {devPlan === "premium" ? (
                                  <button
                                    onClick={() => setBookingMentor(m)}
                                    style={{
                                      padding: "12px 24px", borderRadius: 14, border: "none",
                                      background: `linear-gradient(135deg, ${m.col}, #00c9a7)`, color: "#ffffff",
                                      fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900,
                                      cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                                      boxShadow: `0 4px 14px ${m.col}35`
                                    }}
                                  >
                                    <Calendar size={16} />
                                    <span>Schedule 1-on-1 Session</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => router.push(routes.app.store)}
                                    style={{
                                      padding: "12px 24px", borderRadius: 14,
                                      background: "rgba(108, 99, 255, 0.08)", border: "1.5px dashed #6c63ff",
                                      color: "#6c63ff", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 950,
                                      cursor: "pointer", display: "flex", alignItems: "center", gap: 8
                                    }}
                                  >
                                    <ShieldAlert size={15} />
                                    <span>1-on-1 Session (Locked - Go to Store)</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Dropdown List of Live Sessions */}
                            {showSessions[m.id] && (
                              <div style={{ marginTop: 20, padding: 20, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", borderRadius: 18 }}>
                                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: m.col, fontWeight: 900, marginBottom: 12 }}>
                                  📢 AVAILABLE SCHEDULED LIVE CLASSES (CLICK TO JOIN STREAM):
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                  {[
                                    { topic: m.upcomingSession.split(" - ")[0], date: m.upcomingSession.split(" - ")[1] || "Scheduled Tomorrow @ 4 PM" }
                                  ].map((session, sIdx) => (
                                    <div 
                                      key={sIdx}
                                      onClick={() => router.push(`/live-class?teacher=${m.id}&topic=${encodeURIComponent(session.topic)}`)}
                                      style={{
                                        padding: "14px 18px", borderRadius: 14, background: "var(--bg-card)",
                                        border: "1px solid var(--border-light)", cursor: "pointer",
                                        display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.2s"
                                      }}
                                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = m.col; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; }}
                                    >
                                      <div>
                                        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 800, color: "var(--text-main)" }}>
                                          {session.topic}
                                        </div>
                                        <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "'Fira Code', monospace" }}>
                                          {session.date}
                                        </span>
                                      </div>
                                      <span style={{
                                        padding: "6px 12px", borderRadius: 10, background: "rgba(0, 201, 167, 0.15)",
                                        color: "#00c9a7", fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 900
                                      }}>
                                        Join Stream →
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>

                  </div>
                )}

              </div>
            ) : (
              /* 2. SEARCH / MARKETPLACE VIEW (ACTIVATED BY SEARCH BUTTON CLICK) */
              <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
                
                {/* Search Bar + Navigation back */}
                <div style={{
                  padding: 20, borderRadius: 20, background: "var(--bg-card)",
                  border: "1.5px solid var(--border-light)", display: "flex", alignItems: "center", gap: 14
                }}>
                  <button
                    onClick={() => setSearchMode(false)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8, background: "var(--bg-alt)",
                      border: "1px solid var(--border-light)", borderRadius: 12, padding: "10px 16px",
                      color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 14,
                      fontWeight: 800, cursor: "pointer"
                    }}
                  >
                    <ArrowLeft size={16} />
                    <span>My Mentors</span>
                  </button>

                  <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", borderRadius: 14, padding: "10px 16px" }}>
                    <Search size={18} color="var(--text-muted)" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Type domain or name (e.g. Machine Learning, React, AWS)..."
                      style={{
                        background: "transparent", border: "none", color: "var(--text-main)", outline: "none",
                        fontFamily: "'Outfit', sans-serif", fontSize: 14.5, width: "100%"
                      }}
                    />
                  </div>
                </div>

                {/* 3 SLIDABLE NETFLIX-STYLE SPECIFICATION ROWS */}
                <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
                  
                  {/* Row 1: AI & Machine Learning Experts */}
                  <SlidableMentorRow 
                    title="💡 Top Picks: AI & Machine Learning Experts" 
                    mentors={aiMentors} 
                    activeMentors={activeMentors}
                    onAddMentor={addMentor}
                    onViewTestimonial={setSelectedMentor}
                  />

                  {/* Row 2: Core Software Engineers (SDE) */}
                  <SlidableMentorRow 
                    title="⚙️ Core Software Engineers & Systems Experts" 
                    mentors={sdeMentors} 
                    activeMentors={activeMentors}
                    onAddMentor={addMentor}
                    onViewTestimonial={setSelectedMentor}
                  />

                  {/* Row 3: Database & Cloud Architects */}
                  <SlidableMentorRow 
                    title="☁️ Database Specialists & Cloud Solutions Architects" 
                    mentors={cloudMentors} 
                    activeMentors={activeMentors}
                    onAddMentor={addMentor}
                    onViewTestimonial={setSelectedMentor}
                  />

                </div>

              </div>
            )}

          </div>
        )}

        {/* ── MENTOR DASHBOARD TAB (INSTRUCTOR PORTAL) ── */}
        {mentTab === "dashboard" && (
          <div style={{
            padding: 28, borderRadius: 24, background: "var(--bg-card)",
            border: "1.5px solid var(--border-light)", display: "flex", flexDirection: "column", gap: 24
          }}>
            <div style={{ borderBottom: "1.5px solid var(--border-light)", paddingBottom: 16 }}>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 13, color: "#6c63ff", fontWeight: 900, letterSpacing: 1.2 }}>
                INSTRUCTOR PORTAL
              </div>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 900, color: "var(--text-main)", margin: "4px 0 0" }}>
                Mentor Schedule & Performance Dashboard
              </h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ padding: 20, borderRadius: 18, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)" }}>
                  <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 900, color: "var(--text-main)", marginBottom: 12 }}>
                    📅 Configured Available Booking Slots (Weekly Recurring)
                  </h4>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { day: "Saturday", time: "10:00 AM - 12:00 PM", status: "Active", count: 3 },
                      { day: "Saturday", time: "02:00 PM - 04:00 PM", status: "Active", count: 2 },
                      { day: "Sunday", time: "11:00 AM - 01:00 PM", status: "Full", count: 0 }
                    ].map((slot, i) => (
                      <div key={i} style={{ display: "flex", justify: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                        <div>
                          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 900, color: "var(--text-main)" }}>
                            {slot.day} • {slot.time}
                          </div>
                          <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            {slot.count > 0 ? `${slot.count} slots remaining` : "Fully booked"}
                          </span>
                        </div>

                        <span style={{
                          padding: "4px 10px", borderRadius: 8,
                          background: slot.status === "Active" ? "rgba(0, 201, 167, 0.15)" : "rgba(239, 68, 68, 0.15)",
                          color: slot.status === "Active" ? "#00c9a7" : "#ec4899",
                          fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 900
                        }}>
                          {slot.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ padding: 20, borderRadius: 18, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)" }}>
                  <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 900, color: "var(--text-main)", marginBottom: 12 }}>
                    📢 Scheduled Live Stream Classes (Many-to-One)
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { topic: "ML Systems Design & Hyper-parameter Triage", date: "Sunday, Oct 24 @ 4:00 PM", students: 184 },
                      { topic: "Deep Learning Neural Weight Topologies", date: "Wednesday, Oct 27 @ 6:00 PM", students: 310 }
                    ].map((cls, i) => (
                      <div key={i} style={{ padding: 14, borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                        <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 900, color: "var(--text-main)" }}>
                          {cls.topic}
                        </div>
                        <div style={{ display: "flex", justify: "space-between", alignItems: "center", marginTop: 6, fontSize: 12.5, color: "var(--text-muted)" }}>
                          <span>{cls.date}</span>
                          <span style={{ color: "#6c63ff", fontWeight: 800 }}>👥 {cls.students} registered</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ padding: 20, borderRadius: 18, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", display: "flex", flexDirection: "column", gap: 12 }}>
                  <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
                    📈 Performance Statistics
                  </h4>
                  {[
                    { label: "AVERAGE RATING", val: "4.9 / 5.0", sub: "Based on 142 student reviews", col: "#f59e0b" },
                    { label: "TOTAL CLASS HOURS", val: "148 Hours", sub: "Deep teaching logs synced", col: "#6c63ff" },
                    { label: "REVENUE EARNED", val: "14,500 Coins", sub: "Redeemable in PathEd store", col: "#00c9a7" }
                  ].map((stat, i) => (
                    <div key={i} style={{ padding: 14, borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                      <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "var(--text-muted)" }}>{stat.label}</div>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 900, color: stat.col, marginTop: 4 }}>{stat.val}</div>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{stat.sub}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── MENTOR DETAILED BIO MODAL ── */}
        <AnimatePresence>
          {selectedMentor && (
            <div
              onClick={e => { if (e.target === e.currentTarget) setSelectedMentor(null); }}
              style={{
                position: "fixed", inset: 0, zIndex: 1200,
                background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", justify: "center", padding: 24
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 24 }}
                style={{
                  background: "var(--bg-card)", borderRadius: 28, maxWidth: 640, width: "100%",
                  border: "1.5px solid var(--border-light)", boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
                  overflow: "hidden", display: "flex", flexDirection: "column"
                }}
              >
                <div style={{ position: "relative", height: 260, overflow: "hidden" }}>
                  <img src={selectedMentor.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)" }} />
                  <button onClick={() => setSelectedMentor(null)} style={{ position: "absolute", right: 16, top: 16, width: 36, height: 36, borderRadius: 12, background: "rgba(0,0,0,0.5)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justify: "center" }}>
                    <X size={18} />
                  </button>
                  <div style={{ position: "absolute", bottom: 20, left: 24, right: 24 }}>
                    <span style={{ padding: "4px 10px", borderRadius: 8, background: selectedMentor.col, color: "#fff", fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 900 }}>
                      {selectedMentor.category} SPECIALIST
                    </span>
                    <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 26, fontWeight: 900, color: "#fff", margin: "8px 0 0" }}>
                      {selectedMentor.name}
                    </h3>
                  </div>
                </div>

                <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "var(--text-muted)" }}>CURRENT POSITION</div>
                    <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, color: "var(--text-main)" }}>
                      {selectedMentor.role} @ {selectedMentor.company}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "var(--text-muted)" }}>BIOGRAPHY & VISION</div>
                    <p style={{ margin: "4px 0 0", fontFamily: "'Outfit', sans-serif", fontSize: 14.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
                      "I believe in a roadmap-focused approach. Theoretical models can only teach you so much. To crack placement bars, you must implement systems, Traverses, stack indices, and understand resource management configurations."
                    </p>
                  </div>

                  <div>
                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>CORE EXPERT ISE</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {selectedMentor.skills.map((s, i) => (
                        <span key={i} style={{ padding: "4px 10px", borderRadius: 8, background: "var(--bg-alt)", border: "1px solid var(--border-light)", fontSize: 12, color: "var(--text-main)" }}>{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ── PREMIUM 1-ON-1 SLOT BOOKING MODAL ── */}
        <AnimatePresence>
          {bookingMentor && (
            <div
              onClick={e => { if (e.target === e.currentTarget) setBookingMentor(null); }}
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
                  background: "var(--bg-card)", borderRadius: 28, maxWidth: 540, width: "100%",
                  border: "1.5px solid var(--border-light)", boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
                  display: "flex", flexDirection: "column", overflow: "hidden"
                }}
              >
                <div style={{
                  padding: "24px 32px 20px", borderBottom: "1.5px solid var(--border-light)",
                  background: "linear-gradient(135deg, rgba(108,99,255,0.08), rgba(0,201,167,0.08))",
                  display: "flex", alignItems: "center", justifyContent: "space-between"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, overflow: "hidden" }}>
                      <img src={bookingMentor.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18.5, fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
                        Book 1-on-1 Mentorship
                      </h3>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13, color: "var(--text-muted)" }}>
                        with {bookingMentor.name}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setBookingMentor(null);
                      setIsBooked(false);
                      setBookingSlot(null);
                    }}
                    style={{
                      width: 36, height: 36, borderRadius: 12, border: "1.5px solid var(--border-light)",
                      background: "var(--bg-card)", color: "var(--text-main)", cursor: "pointer",
                      display: "flex", alignItems: "center", justify: "center"
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
                  {!isBooked ? (
                    <>
                      <div>
                        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "#6c63ff", fontWeight: 900, marginBottom: 8 }}>
                          SELECT AN AVAILABLE 1-ON-1 SLOT:
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          {[
                            "Saturday 10:00 AM",
                            "Saturday 11:30 AM",
                            "Sunday 3:00 PM",
                            "Sunday 4:30 PM"
                          ].map((slot) => (
                            <button
                              key={slot}
                              onClick={() => setBookingSlot(slot)}
                              style={{
                                padding: "12px 14px", borderRadius: 14,
                                border: bookingSlot === slot ? "1.5px solid #6c63ff" : "1.5px solid var(--border-light)",
                                background: bookingSlot === slot ? "rgba(108,99,255,0.08)" : "var(--bg-alt)",
                                color: bookingSlot === slot ? "#6c63ff" : "var(--text-main)",
                                fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 700,
                                cursor: "pointer", textAlign: "center", transition: "all 0.2s"
                              }}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "#00c9a7", fontWeight: 900, marginBottom: 8 }}>
                          SESSION AGENDA / OBJECTIVE:
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {["Resume Review & Placement Pitch", "Technical Mock Interview", "Roadmap & Skill Syllabus Check"].map((obj) => (
                            <div key={obj} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, color: "var(--text-main)", fontWeight: 600 }}>
                              <input type="radio" name="agenda" defaultChecked={obj.startsWith("Resume")} style={{ cursor: "pointer" }} />
                              <span>{obj}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          if (!bookingSlot) {
                            alert("Please select a slot first!");
                            return;
                          }
                          setIsBooked(true);
                        }}
                        style={{
                          width: "100%", padding: "14px", borderRadius: 16, border: "none",
                          background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#ffffff",
                          fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 900, cursor: "pointer",
                          display: "flex", alignItems: "center", justify: "center", gap: 8
                        }}
                      >
                        <span>Confirm Slot Booking</span>
                        <ArrowRight size={16} />
                      </button>
                    </>
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <div style={{
                        width: 64, height: 64, borderRadius: "50%", background: "rgba(0, 201, 167, 0.15)",
                        color: "#00c9a7", display: "flex", alignItems: "center", justify: "center",
                        fontSize: 28, margin: "0 auto 16px"
                      }}>
                        ✓
                      </div>

                      <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 900, color: "var(--text-main)", margin: "0 0 8px" }}>
                        1-on-1 Session Confirmed!
                      </h4>
                      <p style={{ margin: 0, fontSize: 14.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
                        Your session with <strong style={{ fontWeight: 800 }}>{bookingMentor.name}</strong> is scheduled for <strong style={{ fontWeight: 800 }}>{bookingSlot}</strong>. A calendar invite, notes link, and video room token have been dispatched to your profile.
                      </p>

                      <button
                        onClick={() => {
                          setBookingMentor(null);
                          setIsBooked(false);
                          setBookingSlot(null);
                        }}
                        style={{
                          marginTop: 20, width: "100%", padding: "12px", borderRadius: 14,
                          background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)",
                          fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, cursor: "pointer"
                        }}
                      >
                        Back to Mentor Space
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}

/* ─── HORIZONTAL SLIDABLE NETFLIX-STYLE ROW COMPONENT ─── */
function SlidableMentorRow({ title, mentors, activeMentors, onAddMentor, onViewTestimonial }) {
  const scrollRef = React.useRef<any>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>
      <div style={{ display: "flex", justify: "space-between", alignItems: "center" }}>
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 19, fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
          {title}
        </h3>
        
        {/* Navigation Arrows */}
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={scrollLeft}
            style={{
              width: 32, height: 32, borderRadius: 10, border: "1.5px solid var(--border-light)",
              background: "var(--bg-card)", color: "var(--text-main)", cursor: "pointer",
              display: "flex", alignItems: "center", justify: "center"
            }}
          >
            ‹
          </button>
          <button
            onClick={scrollRight}
            style={{
              width: 32, height: 32, borderRadius: 10, border: "1.5px solid var(--border-light)",
              background: "var(--bg-card)", color: "var(--text-main)", cursor: "pointer",
              display: "flex", alignItems: "center", justify: "center"
            }}
          >
            ›
          </button>
        </div>
      </div>

      {/* Slidable container */}
      <div 
        ref={scrollRef}
        style={{
          display: "flex", gap: 20, overflowX: "auto", padding: "4px 0",
          scrollbarWidth: "none", msOverflowStyle: "none"
        }}
        className="hide-scrollbar"
      >
        {mentors.map((m) => {
          const isAdded = activeMentors.includes(m.id);
          return (
            <motion.div
              key={m.id}
              whileHover={{ y: -6, boxShadow: `0 10px 24px ${m.col}18` }}
              style={{
                width: 310, flexShrink: 0, background: "var(--bg-card)",
                border: "1.5px solid var(--border-light)", borderTop: `5px solid ${m.col}`,
                borderRadius: 22, overflow: "hidden", display: "flex", flexDirection: "column",
                boxShadow: "0 6px 18px rgba(0,0,0,0.02)"
              }}
            >
              {/* Portrait Cover */}
              <div style={{ position: "relative", height: 210, overflow: "hidden" }}>
                <img src={m.image} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }} />
                
                {/* Rating Badge */}
                <div style={{
                  position: "absolute", top: 12, right: 12, padding: "4px 10px", borderRadius: 8,
                  background: "rgba(0,0,0,0.7)", color: "#fff", display: "flex", alignItems: "center", gap: 4,
                  fontSize: 12, fontFamily: "'Outfit', sans-serif", fontWeight: 800
                }}>
                  <Star size={11} fill="#f59e0b" color="#f59e0b" />
                  <span>{m.rating}</span>
                </div>

                <div style={{ position: "absolute", bottom: 12, left: 16, right: 16, color: "#fff" }}>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18.5, fontWeight: 900 }}>
                    {m.name}
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.85, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: 2 }}>
                    {m.role} @ {m.company}
                  </div>
                </div>
              </div>

              {/* Card Details */}
              <div style={{ padding: 18, flex: 1, display: "flex", flexDirection: "column", justify: "space-between", gap: 14 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {m.skills.slice(0, 3).map((s, idx) => (
                      <span key={idx} style={{ padding: "4px 8px", borderRadius: 8, background: `${m.col}10`, border: `1px solid ${m.col}20`, fontSize: 11.5, color: m.col, fontWeight: 700 }}>
                        {s}
                      </span>
                    ))}
                  </div>
                  <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 650, marginTop: 2 }}>
                    💼 {m.exp} yrs exp • {m.students} students
                  </span>
                </div>

                {/* Add / Added Button and View details */}
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => onViewTestimonial(m)}
                    style={{
                      flex: 1, padding: "10px 12px", borderRadius: 12, border: "1.5px solid var(--border-light)",
                      background: "var(--bg-alt)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif",
                      fontSize: 13, fontWeight: 800, cursor: "pointer"
                    }}
                  >
                    Bio
                  </button>

                  <button
                    onClick={() => onAddMentor(m.id)}
                    disabled={isAdded}
                    style={{
                      flex: 2, padding: "8px 10px", borderRadius: 10, border: "none",
                      background: isAdded ? "rgba(0, 201, 167, 0.15)" : "linear-gradient(135deg, #6c63ff, #00c9a7)",
                      color: isAdded ? "#00c9a7" : "#ffffff", fontFamily: "'Outfit', sans-serif",
                      fontSize: 12, fontWeight: 900, cursor: isAdded ? "default" : "pointer",
                      display: "flex", alignItems: "center", justify: "center", gap: 4
                    }}
                  >
                    {isAdded ? <Check size={12} /> : <Plus size={12} />}
                    <span>{isAdded ? "Added" : "Add Mentor"}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
