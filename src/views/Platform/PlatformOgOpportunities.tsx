"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { 
  Sparkles, Search, Calendar, BookOpen, CheckCircle2, 
  ArrowRight, ShieldCheck, HelpCircle, Star, Clock, Plus, ChevronRight, X, 
  ArrowUpRight, Check, Heart, ExternalLink, Award, Lock, ShieldAlert
} from "lucide-react";
import { OPPORTUNITIES_DATABASE } from "./PlatformEvents";

// Mock OG Search Opportunities Data
const OG_SEARCH_DATABASE = [
  // ==================== HACKATHONS ====================
  {
    id: "og_h1",
    category: "hackathons",
    title: "PathEd Elite Code Challenge 2026",
    organizer: "PathEd Labs",
    mode: "Online",
    deadline: "2026-08-30",
    prizePool: "₹1,50,000 + SDE Interview Bypass",
    difficulty: "Advanced",
    eligibility: "UG Engineering Students",
    tech: "DSA, Algorithms, performance optimization",
    seatsLeft: 45,
    parthed_og: true,
    tier: "free",
    desc: "Our flagship monthly algorithms challenge. Solve 5 advanced optimization problems in C++ or Java within 3 hours. Top performers bypass screening at Stripe and Google.",
    externalLink: "https://pathed.org/challenge",
    coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "og_h2",
    category: "hackathons",
    title: "Vanguard Web3 Global Hackathon",
    organizer: "Solana Foundation x PathEd",
    mode: "Online",
    deadline: "2026-09-10",
    prizePool: "$50,000 in Grants + Developer Badges",
    difficulty: "Intermediate",
    eligibility: "Open to All Developers",
    tech: "Rust, Solana Web3, React",
    seatsLeft: 80,
    parthed_og: true,
    tier: "free",
    desc: "Build decentralized finance or social protocol prototypes using Solana edge clusters. Includes 1-on-1 architecture reviews with PathEd mentors.",
    externalLink: "https://solana.com",
    coverImage: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "og_h3",
    category: "hackathons",
    title: "OpenAI Agentic Swarm Hackathon",
    organizer: "OpenAI x PathEd Premium",
    mode: "Online + Finals San Francisco",
    deadline: "2026-09-25",
    prizePool: "$100,000 + API Credits + SDE Referrals",
    difficulty: "Advanced",
    eligibility: "Premium Registered Members",
    tech: "GPT Agents, Python, LangChain",
    seatsLeft: 12,
    parthed_og: true,
    tier: "premium",
    desc: "Premium Exclusive. Prototype multi-agent swarms designed to coordinate code generation and automatic debugging workflows. Direct recruiting track at OpenAI.",
    externalLink: "https://openai.com",
    coverImage: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "og_h4",
    category: "hackathons",
    title: "Adobe Creative AI Sprint 2026",
    organizer: "Adobe India x PathEd",
    mode: "Hybrid",
    deadline: "2026-08-28",
    prizePool: "₹10,00,000 + Creative Cloud Passes",
    difficulty: "Intermediate",
    eligibility: "All Premium Students",
    tech: "Generative AI, WebGL, PyTorch",
    seatsLeft: 18,
    parthed_og: true,
    tier: "premium",
    desc: "Premium Exclusive. Build canvas-based collaborative generative image editing pipelines using Adobe Firefly models. Winners get direct SDE-1 interviews.",
    externalLink: "https://adobe.com",
    coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400"
  },

  // ==================== BOOTCAMPS ====================
  {
    id: "og_b1",
    category: "bootcamps",
    title: "PathEd Full-Stack SDE Bootcamp",
    organizer: "PathEd Academy",
    mode: "Online (Cohort-based)",
    deadline: "2026-08-20",
    prizePool: "Verified Capstone Portfolio Badge",
    difficulty: "Intermediate",
    eligibility: "Open to All Registered Users",
    tech: "React, Node.js, MongoDB",
    seatsLeft: 150,
    parthed_og: true,
    tier: "free",
    desc: "Accelerated 8-week bootcamp focusing on full-stack application development. Deploy 3 web apps to cloud environments under peer sprint reviews.",
    externalLink: "https://pathed.org/bootcamp",
    coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "og_b2",
    category: "bootcamps",
    title: "Docker & Kubernetes DevOps Cohort",
    organizer: "DevOps India x PathEd",
    mode: "Online (Saturdays)",
    deadline: "2026-08-22",
    prizePool: "Docker Certification Voucher",
    difficulty: "All Levels",
    eligibility: "Undergrad CS Students",
    tech: "Docker, Kubernetes, GitHub Actions",
    seatsLeft: 200,
    parthed_og: true,
    tier: "free",
    desc: "Master container orchestrations, CI/CD pipeline automation, and horizontal scaling strategies on AWS cloud infrastructure.",
    externalLink: "https://docker.com",
    coverImage: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "og_b3",
    category: "bootcamps",
    title: "System Design & Distributed Ledgers",
    organizer: "Stripe Eng x PathEd Premium",
    mode: "Online (Closed Cohort)",
    deadline: "2026-09-05",
    prizePool: "Stripe Engineering Mentorship Pass",
    difficulty: "Advanced",
    eligibility: "Premium Registered Members",
    tech: "System Design, Redis, Kafka",
    seatsLeft: 10,
    parthed_og: true,
    tier: "premium",
    desc: "Premium Exclusive. 6-week cohort on building high-concurrency payment integrations, cache invalidations, and distributed lock patterns.",
    externalLink: "https://stripe.com",
    coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "og_b4",
    category: "bootcamps",
    title: "Generative AI & LLM Fine-Tuning",
    organizer: "Google Labs x PathEd Premium",
    mode: "Hybrid",
    deadline: "2026-09-12",
    prizePool: "GCP AI Specialist Exam Voucher",
    difficulty: "Advanced",
    eligibility: "Premium Registered Members",
    tech: "LLMs, LoRA, PyTorch, Vertex AI",
    seatsLeft: 14,
    parthed_og: true,
    tier: "premium",
    desc: "Premium Exclusive. Hands-on intensive cohort on fine-tuning llama-based models for custom databases. Covers tokenizations and deployment.",
    externalLink: "https://google.com",
    coverImage: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=400"
  },

  // ==================== WORKSHOPS/WEBINARS ====================
  {
    id: "og_w1",
    category: "workshops",
    title: "React 19 Server Actions Masterclass",
    organizer: "Vercel x PathEd",
    mode: "Online Webinar",
    deadline: "2026-08-15",
    prizePool: "React Core Sync Certification",
    difficulty: "Intermediate",
    eligibility: "Frontend Web Developers",
    tech: "Next.js 15, React Actions",
    seatsLeft: 300,
    parthed_og: true,
    tier: "free",
    desc: "Deep dive into RSCs, optimistic updates, database triggers from forms, and server-side state hydration without client hooks.",
    externalLink: "https://vercel.com",
    coverImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "og_w2",
    category: "workshops",
    title: "SQL Performance & Query Optimization",
    organizer: "Oracle Dev x PathEd",
    mode: "Online Webinar",
    deadline: "2026-08-18",
    prizePool: "PathEd Query Optimizer Badge",
    difficulty: "All Levels",
    eligibility: "Database Enthusiasts",
    tech: "SQL, DBMS Indexing, PostgreSQL",
    seatsLeft: 400,
    parthed_og: true,
    tier: "free",
    desc: "A 4-hour live webinar demonstrating transaction isolation levels, indexing mechanics, query plans, and connection pool tuning.",
    externalLink: "https://oracle.com",
    coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "og_w3",
    category: "workshops",
    title: "Rust Concurrency & Memory Safety",
    organizer: "Rust India x PathEd Premium",
    mode: "Online Interactive Live Lab",
    deadline: "2026-09-02",
    prizePool: "Elite Rust Developer Credential",
    difficulty: "Advanced",
    eligibility: "Premium Registered Members",
    tech: "Rust, Concurrency, Cargo",
    seatsLeft: 25,
    parthed_og: true,
    tier: "premium",
    desc: "Premium Exclusive. Live workshop covering thread spawning, message passing channels, Arc/Mutex usage, and safe memory management without garbage collection.",
    externalLink: "https://rust-lang.org",
    coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "og_w4",
    category: "workshops",
    title: "System Security & Penetration Testing",
    organizer: "Shield Labs x PathEd Premium",
    mode: "Online Live Lab",
    deadline: "2026-09-18",
    prizePool: "Ethical Hacker Entry Pass",
    difficulty: "Advanced",
    eligibility: "Premium Registered Members",
    tech: "Linux, Web Security, OWASP",
    seatsLeft: 20,
    parthed_og: true,
    tier: "premium",
    desc: "Premium Exclusive. Live lab simulating common exploits like SQL injection, CSRF, and SSRF. Learn to harden APIs against unauthorized access.",
    externalLink: "https://owasp.org",
    coverImage: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&q=80&w=400"
  }
];

export default function PlatformOgOpportunities() {
  const router = useRouter();

  // Tab: 'my-opportunities' or 'search'
  const [activeSubTab, setActiveSubTab] = useState("my-opportunities");

  // Plan level: 'free' or 'premium'
  const [devPlan, setDevPlan] = useState("free");

  // Search Filter State
  const [searchQuery, setSearchQuery] = useState("");

  // Details Modal State
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);

  // Application forms
  const [applyingOpportunity, setApplyingOpportunity] = useState<any>(null);
  const [applyFullName, setApplyFullName] = useState("Rahul Kushwaha");
  const [applyEmail, setApplyEmail] = useState("rahul.kushwaha.sde@gmail.com");
  const [applyGithub, setApplyGithub] = useState("");
  const [applyPitch, setApplyPitch] = useState("");

  // Applied IDs (DB-backed)
  const [appliedOgIds, setAppliedOgIds] = useState<string[]>([]);
  const [appliedEventIds, setAppliedEventIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { apiGet } = await import("@/lib/api");
        const data = await apiGet<{ eventIds: string[]; ogIds: string[] }>(
          "/api/me/applications",
        );
        if (cancelled) return;
        setAppliedEventIds(data.eventIds || []);
        setAppliedOgIds(data.ogIds || []);
      } catch {
        const savedOg = localStorage.getItem("pathed_applied_og_opportunities");
        const savedEvents = localStorage.getItem("pathed_applied_events");
        if (!cancelled) {
          setAppliedOgIds(savedOg ? JSON.parse(savedOg) : []);
          setAppliedEventIds(savedEvents ? JSON.parse(savedEvents) : []);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("pathed_applied_og_opportunities", JSON.stringify(appliedOgIds));
  }, [appliedOgIds]);

  useEffect(() => {
    localStorage.setItem("dev_mode_plan", devPlan);
    // Alert sidebar/header immediately
    window.dispatchEvent(new Event("storage"));
  }, [devPlan]);

  // Synchronize applied states periodically
  useEffect(() => {
    const handleStorageChange = () => {
      setDevPlan(localStorage.getItem("dev_mode_plan") || "free");
      const savedEvents = localStorage.getItem("pathed_applied_events");
      setAppliedEventIds(savedEvents ? JSON.parse(savedEvents) : []);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleApplyClick = (item) => {
    setApplyingOpportunity(item);
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyGithub.trim()) {
      alert("Please provide your GitHub URL to sync contribution scores.");
      return;
    }

    const { apiSend } = await import("@/lib/api");
    if (applyingOpportunity.id.startsWith("og_")) {
      if (!appliedOgIds.includes(applyingOpportunity.id)) {
        setAppliedOgIds(prev => [...prev, applyingOpportunity.id]);
        try {
          await apiSend("/api/me/applications", "POST", {
            eventId: applyingOpportunity.id,
            kind: "og",
          });
        } catch {
          // keep local
        }
      }
    } else {
      if (!appliedEventIds.includes(applyingOpportunity.id)) {
        const nextIds = [...appliedEventIds, applyingOpportunity.id];
        setAppliedEventIds(nextIds);
        localStorage.setItem("pathed_applied_events", JSON.stringify(nextIds));
        window.dispatchEvent(new Event("storage"));
        try {
          await apiSend("/api/me/applications", "POST", {
            eventId: applyingOpportunity.id,
            kind: "event",
          });
        } catch {
          // keep local
        }
      }
    }

    alert(`🎉 Application successfully submitted to "${applyingOpportunity.title}"!\n\nYour spot has been queued as a "Secured Spot" in your opportunity dashboard.`);
    setApplyingOpportunity(null);
    setApplyGithub("");
    setApplyPitch("");
  };

  const getFilteredSearchOpportunities = (catId) => {
    return OG_SEARCH_DATABASE.filter(item => {
      if (item.category !== catId) return false;
      
      // Filter by Premium Toggle status
      if (item.tier === "premium" && devPlan !== "premium") return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.organizer.toLowerCase().includes(q) ||
          item.tech.toLowerCase().includes(q)
        );
      }
      return true;
    });
  };

  // Get applied opportunities to show in My Opportunities tab
  const getAppliedOpportunities = () => {
    // 1. Applied from OG Search Database on this page
    const localApplied = OG_SEARCH_DATABASE.filter(opp => appliedOgIds.includes(opp.id));

    // 2. Applied from Events page database that are tagged PathEd OG
    const eventsApplied = OPPORTUNITIES_DATABASE.filter(opp => 
      opp.parthed_og && appliedEventIds.includes(opp.id)
    );

    return [...localApplied, ...eventsApplied];
  };

  const getAppliedByCategory = (catId) => {
    return getAppliedOpportunities().filter(opp => opp.category === catId);
  };

  const categories = [
    { id: "hackathons", label: "Hackathons & Competitions", icon: "🏆", desc: "Showcase skills in time-limited programming challenges." },
    { id: "bootcamps", label: "Bootcamps & Cohorts", icon: "🔥", desc: "Accelerated developmental cohorts and technology schools." },
    { id: "workshops", label: "Workshops & Webinars", icon: "🧠", desc: "Interactive technical training sessions and API designs." }
  ];

  return (
    <DashboardLayout activeTab="hack-attack">
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "10px 10px 40px" }}>
        
        {/* =========================================================================
           DEVELOPER TESTING MODE BANNER
           ========================================================================= */}
        <div style={{ 
          background: devPlan === "premium" 
            ? "linear-gradient(135deg, rgba(0, 201, 167, 0.08) 0%, rgba(108, 99, 255, 0.08) 100%)" 
            : "rgba(245, 158, 11, 0.08)",
          border: devPlan === "premium" ? "1.5px solid #00c9a7" : "1.5px solid #f59e0b",
          borderRadius: 24, padding: "16px 28px", display: "flex", flexWrap: "wrap",
          justifyContent: "space-between", alignItems: "center", gap: 16, marginBottom: 28,
          boxShadow: "0 10px 30px rgba(0,0,0,0.03)"
        }}>
          <div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 900, color: devPlan === "premium" ? "#00c9a7" : "#f59e0b" }}>
              DEVELOPER TESTING MODE
            </div>
            <h4 style={{ margin: "2px 0 0", fontFamily: "'Outfit', sans-serif", fontSize: 15.5, fontWeight: 800, color: "var(--text-main)" }}>
              {devPlan === "premium" ? "✨ Premium Plan Activated: All summits and exclusive tracks unlocked." : "⚡ Free Plan Active: Locked exclusive summits are previewed."}
            </h4>
          </div>
          <div style={{ display: "flex", background: "var(--bg-alt)", border: "1px solid var(--border-light)", padding: 4, borderRadius: 12, gap: 4 }}>
            <button
              onClick={() => setDevPlan("free")}
              style={{
                padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 800, transition: "all 0.2s",
                background: devPlan === "free" ? "#f59e0b" : "transparent",
                color: devPlan === "free" ? "#ffffff" : "var(--text-muted)"
              }}
            >
              Free Plan
            </button>
            <button
              onClick={() => setDevPlan("premium")}
              style={{
                padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 800, transition: "all 0.2s",
                background: devPlan === "premium" ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "transparent",
                color: devPlan === "premium" ? "#ffffff" : "var(--text-muted)",
                boxShadow: devPlan === "premium" ? "0 4px 12px rgba(108,99,255,0.25)" : "none"
              }}
            >
              Premium Plan
            </button>
          </div>
        </div>

        {/* =========================================================================
           PAGE HEADER HERO SECTION
           ========================================================================= */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20, marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 34, fontWeight: 900, color: "var(--text-main)", margin: 0, letterSpacing: "-0.5px", display: "flex", alignItems: "center", gap: 10 }}>
              <Award size={34} color="#6c63ff" />
              OG Opportunities
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 16, color: "var(--text-muted)", fontWeight: 500 }}>
              Exclusive recruitment tracks and coding challenges validated directly by PathEd.
            </p>
          </div>

          {/* Sub-tab Capsule Toggles (My Opportunities & Search) */}
          <div style={{ display: "flex", background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", padding: 4, borderRadius: 14, gap: 4 }}>
            <button
              onClick={() => setActiveSubTab("my-opportunities")}
              style={{
                padding: "10px 22px", borderRadius: 10, border: "none", cursor: "pointer",
                fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, transition: "all 0.25s ease",
                background: activeSubTab === "my-opportunities" ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "transparent",
                color: activeSubTab === "my-opportunities" ? "#ffffff" : "var(--text-muted)",
                boxShadow: activeSubTab === "my-opportunities" ? "0 4px 12px rgba(108,99,255,0.15)" : "none"
              }}
            >
              My Opportunities ({getAppliedOpportunities().length})
            </button>
            <button
              onClick={() => setActiveSubTab("search")}
              style={{
                padding: "10px 22px", borderRadius: 10, border: "none", cursor: "pointer",
                fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, transition: "all 0.25s ease",
                background: activeSubTab === "search" ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "transparent",
                color: activeSubTab === "search" ? "#ffffff" : "var(--text-muted)",
                boxShadow: activeSubTab === "search" ? "0 4px 12px rgba(108,99,255,0.15)" : "none"
              }}
            >
              Search Discovery
            </button>
          </div>
        </div>

        {/* =========================================================================
           SEARCH AND FILTER INPUT BAR (Search tab only)
           ========================================================================= */}
        {activeSubTab === "search" && (
          <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search OG opportunities by title, technology or organizer..."
                style={{
                  width: "100%", padding: "12px 16px 12px 42px", borderRadius: 14,
                  background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
                  color: "var(--text-main)", outline: "none", fontSize: 15,
                  fontFamily: "'Outfit', sans-serif", transition: "all 0.2s"
                }}
              />
            </div>
          </div>
        )}

        {/* =========================================================================
           TABS RENDERING
           ========================================================================= */}
        {activeSubTab === "my-opportunities" ? (
          /* =========================================================================
             MY OPPORTUNITIES TAB (Categories lists)
             ========================================================================= */
          <div style={{ display: "flex", flexDirection: "column", gap: 32, marginTop: 10 }}>
            {categories.map(cat => {
              const items = getAppliedByCategory(cat.id);
              return (
                <div key={cat.id} style={{
                  background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
                  borderRadius: 24, padding: 26, boxShadow: "0 8px 24px rgba(0,0,0,0.02)"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                    <span style={{ fontSize: 24 }}>{cat.icon}</span>
                    <div>
                      <h3 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 900, color: "var(--text-main)" }}>
                        Applied {cat.label}
                      </h3>
                      <span style={{ fontSize: 13.5, color: "var(--text-muted)" }}>Active PathEd OG applications synced for recruiter review</span>
                    </div>
                  </div>

                  {items.length === 0 ? (
                    <div style={{ padding: "40px 20px", textAlign: "center", background: "var(--bg-alt)", border: "1.5px dashed var(--border-light)", borderRadius: 18 }}>
                      <span style={{ fontSize: 28 }}>🛡️</span>
                      <p style={{ margin: "8px 0 0", fontSize: 15, color: "var(--text-muted)", fontStyle: "italic", fontWeight: 500 }}>
                        No active applications in this category yet. Visit 'Search Discovery' to apply.
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
                      {items.map(opp => (
                        <OpportunityCard 
                          key={opp.id} 
                          opp={opp} 
                          isApplied={true}
                          handleApplyClick={handleApplyClick} 
                          setSelectedOpportunity={setSelectedOpportunity} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* =========================================================================
             SEARCH TAB (Netflix Horizontal scrolling rows)
             ========================================================================= */
          <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
            {categories.map(cat => {
              const items = getFilteredSearchOpportunities(cat.id);

              return (
                <div key={cat.id} style={{ display: "flex", flexDirection: "column" }}>
                  
                  {/* Category Title & Desc */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12, paddingRight: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 24 }}>{cat.icon}</span>
                      <div>
                        <h3 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 21, fontWeight: 900, color: "var(--text-main)" }}>
                          {cat.label}
                        </h3>
                        <p style={{ margin: "2px 0 0", fontSize: 14.5, color: "var(--text-muted)" }}>{cat.desc}</p>
                      </div>
                    </div>
                    <span style={{ fontSize: 13.5, fontFamily: "'Fira Code', monospace", fontWeight: 800, color: "var(--text-muted)" }}>
                      {items.length} OPTIONS
                    </span>
                  </div>

                  {/* Horizontal Scroll wrapper */}
                  <div style={{
                    display: "flex", overflowX: "auto", gap: 18,
                    padding: "10px 4px 20px", scrollbarWidth: "thin", scrollBehavior: "smooth"
                  }} className="netflix-row-scroll">
                    
                    {items.length === 0 ? (
                      <div style={{ minWidth: 330, padding: 30, textAlign: "center", background: "var(--bg-card)", border: "1.5px dashed var(--border-light)", borderRadius: 20 }}>
                        <span style={{ fontSize: 24 }}>🧭</span>
                        <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--text-muted)" }}>No matching opportunities found in this group.</p>
                      </div>
                    ) : (
                      items.map(opp => {
                        const isApplied = opp.id.startsWith("og_") 
                          ? appliedOgIds.includes(opp.id) 
                          : appliedEventIds.includes(opp.id);

                        return (
                          <OpportunityCard 
                            key={opp.id} 
                            opp={opp} 
                            isApplied={isApplied}
                            handleApplyClick={handleApplyClick} 
                            setSelectedOpportunity={setSelectedOpportunity} 
                          />
                        );
                      })
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* =========================================================================
           GLOBAL MODAL: DETAILED INFORMATION POPUP
           ========================================================================= */}
        <AnimatePresence>
          {selectedOpportunity && (
            <div 
              onClick={e => { if (e.target === e.currentTarget) setSelectedOpportunity(null); }}
              style={{
                position: "fixed", inset: 0, zIndex: 1200,
                background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", justifyContent: "center", padding: 24
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 24 }}
                style={{
                  background: "var(--bg-card)", borderRadius: 24, maxWidth: 660, width: "100%",
                  border: "1.5px solid var(--border-light)", boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
                  overflow: "hidden", display: "flex", flexDirection: "column", position: "relative"
                }}
              >
                <div style={{ padding: "20px 24px", borderBottom: "1.5px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 900, color: "var(--text-main)" }}>
                    Opportunity Profile & Prerequisites
                  </h4>
                  <button 
                    onClick={() => setSelectedOpportunity(null)}
                    style={{ background: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 50, width: 32, height: 32, cursor: "pointer", color: "var(--text-main)", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div style={{ padding: 24, overflowY: "auto", maxHeight: "70vh" }}>
                  <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                    <img 
                      src={selectedOpportunity.coverImage} 
                      alt={selectedOpportunity.title} 
                      style={{ width: 140, height: 90, borderRadius: 12, objectFit: "cover", border: "1px solid var(--border-light)" }} 
                    />
                    <div>
                      <span style={{ fontSize: 11, fontFamily: "'Fira Code', monospace", fontWeight: 800, background: "rgba(108,99,255,0.1)", color: "#6c63ff", padding: "3px 8px", borderRadius: 6 }}>
                        {selectedOpportunity.organizer.toUpperCase()}
                      </span>
                      <h3 style={{ margin: "6px 0 2px 0", fontFamily: "'Outfit', sans-serif", fontSize: 21, fontWeight: 800, color: "var(--text-main)", lineHeight: 1.35 }}>
                        {selectedOpportunity.title}
                      </h3>
                      <div style={{ fontSize: 14, color: "var(--text-muted)" }}>
                        Mode: <strong style={{ color: "var(--text-main)" }}>{selectedOpportunity.mode}</strong>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 20 }}>
                    {selectedOpportunity.desc}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10, background: "var(--bg-alt)", padding: 20, borderRadius: 16, border: "1px solid var(--border-light)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14.5 }}>
                      <span style={{ color: "var(--text-muted)" }}>Category:</span>
                      <strong style={{ color: "var(--text-main)", textTransform: "capitalize" }}>{selectedOpportunity.category}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14.5 }}>
                      <span style={{ color: "var(--text-muted)" }}>Difficulty:</span>
                      <strong style={{ color: "var(--text-main)" }}>{selectedOpportunity.difficulty}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14.5 }}>
                      <span style={{ color: "var(--text-muted)" }}>Eligibility:</span>
                      <strong style={{ color: "var(--text-main)" }}>{selectedOpportunity.eligibility}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14.5 }}>
                      <span style={{ color: "var(--text-muted)" }}>Prizes / Perks:</span>
                      <strong style={{ color: "#00c9a7" }}>{selectedOpportunity.prizePool}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14.5 }}>
                      <span style={{ color: "var(--text-muted)" }}>Deadline:</span>
                      <strong style={{ color: "#ec4899" }}>{selectedOpportunity.deadline}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14.5 }}>
                      <span style={{ color: "var(--text-muted)" }}>Prerequisites:</span>
                      <code style={{ color: "#6c63ff", fontWeight: 800, fontSize: 13 }}>{selectedOpportunity.tech}</code>
                    </div>
                  </div>
                </div>

                <div style={{ padding: "16px 24px", borderTop: "1.5px solid var(--border-light)", background: "var(--bg-alt)", display: "flex", gap: 12, justifyContent: "flex-end" }}>
                  <button 
                    onClick={() => setSelectedOpportunity(null)}
                    style={{ padding: "10px 20px", borderRadius: 10, border: "1.5px solid var(--border-light)", background: "var(--bg-card)", color: "var(--text-muted)", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 800 }}
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => {
                      const isApplied = selectedOpportunity.id.startsWith("og_") 
                        ? appliedOgIds.includes(selectedOpportunity.id) 
                        : appliedEventIds.includes(selectedOpportunity.id);

                      if (isApplied) {
                        alert("You are already enrolled in this opportunity.");
                      } else {
                        setSelectedOpportunity(null);
                        handleApplyClick(selectedOpportunity);
                      }
                    }}
                    style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff", cursor: "pointer", fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 900 }}
                  >
                    {selectedOpportunity.id.startsWith("og_")
                      ? appliedOgIds.includes(selectedOpportunity.id) ? "Enrolled" : "Apply Spot"
                      : appliedEventIds.includes(selectedOpportunity.id) ? "Enrolled" : "Apply Spot"
                    }
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* =========================================================================
           GLOBAL FORM MODAL: PATHED OG APPLICATION WORKFLOW
           ========================================================================= */}
        <AnimatePresence>
          {applyingOpportunity && (
            <div 
              onClick={e => { if (e.target === e.currentTarget) setApplyingOpportunity(null); }}
              style={{
                position: "fixed", inset: 0, zIndex: 1300,
                background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", justifyContent: "center", padding: 24
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 24 }}
                style={{
                  background: "var(--bg-card)", borderRadius: 24, maxWidth: 600, width: "100%",
                  border: "1.5px solid rgba(108,99,255,0.3)", boxShadow: "0 30px 80px rgba(108,99,255,0.15)",
                  overflow: "hidden", display: "flex", flexDirection: "column", position: "relative"
                }}
              >
                <div style={{ padding: "20px 24px", borderBottom: "1.5px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 900, color: "var(--text-main)" }}>
                    🎪 PathEd OG Application Form
                  </h4>
                  <button onClick={() => setApplyingOpportunity(null)} style={{ position: "absolute", right: 20, top: 20, width: 32, height: 32, borderRadius: 10, border: "none", background: "var(--bg-alt)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-main)", fontSize: 20 }}>
                    ×
                  </button>
                </div>

                <form onSubmit={handleApplySubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                  
                  <div style={{ display: "flex", gap: 10, padding: 12, borderRadius: 12, background: "rgba(108,99,255,0.06)", border: "1px solid rgba(108,99,255,0.2)" }}>
                    <Sparkles size={18} color="#6c63ff" style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ fontSize: 13.5, color: "#6c63ff", fontWeight: 700, lineHeight: 1.4 }}>
                      Apply natively to <strong>{applyingOpportunity.title}</strong>. This application will be reviewed directly by the organizers.
                    </span>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", marginBottom: 6 }}>STUDENT FULL NAME</label>
                    <input
                      type="text"
                      required
                      value={applyFullName}
                      onChange={e => setApplyFullName(e.target.value)}
                      style={{ width: "100%", padding: "11px", borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", fontFamily: "'Outfit', sans-serif", fontSize: 14 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", marginBottom: 6 }}>EMAIL ADDRESS</label>
                    <input
                      type="email"
                      required
                      value={applyEmail}
                      onChange={e => setApplyEmail(e.target.value)}
                      style={{ width: "100%", padding: "11px", borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", fontFamily: "'Outfit', sans-serif", fontSize: 14 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", marginBottom: 6 }}>GITHUB PROFILE LINK</label>
                    <input
                      type="url"
                      required
                      value={applyGithub}
                      onChange={e => setApplyGithub(e.target.value)}
                      placeholder="https://github.com/your-username"
                      style={{ width: "100%", padding: "11px", borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", fontFamily: "'Outfit', sans-serif", fontSize: 14 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", marginBottom: 6 }}>STATEMENT OF PURPOSE / EXPERIENCES</label>
                    <textarea
                      required
                      value={applyPitch}
                      onChange={e => setApplyPitch(e.target.value)}
                      placeholder="Why should you be selected for this exclusive PathEd opportunity? Highlight your skills..."
                      style={{
                        width: "100%", height: 110, borderRadius: 10, background: "var(--bg-alt)",
                        border: "1.5px solid var(--border-light)", color: "var(--text-main)",
                        fontFamily: "'Outfit', sans-serif", fontSize: 14, padding: 11, outline: "none", resize: "none"
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                    <button 
                      type="button"
                      onClick={() => setApplyingOpportunity(null)}
                      style={{ flex: 1, padding: "11px 20px", borderRadius: 12, border: "1.5px solid var(--border-light)", background: "var(--bg-alt)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 800, cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      style={{ flex: 1.5, padding: "11px 20px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 900, cursor: "pointer" }}
                    >
                      Submit Quest Application
                    </button>
                  </div>

                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}

// Sub-component: Opportunity Card (matching text & card sizes of Event Page exactly)
function OpportunityCard({ opp, isApplied, handleApplyClick, setSelectedOpportunity }) {
  return (
    <div 
      style={{
        minWidth: 330, width: 330, borderRadius: 20, background: "var(--bg-card)",
        border: opp.parthed_og 
          ? "1.5px solid transparent" // Glowing borders
          : "1.5px solid var(--border-light)",
        boxShadow: "0 4px 15px rgba(0,0,0,0.02)",
        overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "space-between",
        transition: "all 0.3s ease", position: "relative",
        backgroundImage: opp.parthed_og 
          ? "linear-gradient(var(--bg-card), var(--bg-card)), linear-gradient(135deg, #6c63ff, #00c9a7)" 
          : "none",
        backgroundOrigin: "border-box",
        backgroundClip: "content-box, border-box"
      }}
      className="opportunity-card-hover"
    >
      {/* Cover Image */}
      <div style={{ width: "100%", height: 135, overflow: "hidden", position: "relative", background: "var(--bg-alt)" }}>
        <img 
          src={opp.coverImage} 
          alt={opp.title} 
          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
        />
        {/* Tier tag (free/premium) */}
        {opp.tier && (
          <div style={{ 
            position: "absolute", top: 12, right: 12, 
            background: opp.tier === "premium" ? "linear-gradient(135deg, #ef4444, #9c27b0)" : "rgba(0, 201, 167, 0.95)",
            color: "#ffffff", padding: "4px 10px", borderRadius: 8, fontSize: 10, fontWeight: 900,
            fontFamily: "'Fira Code', monospace", letterSpacing: 0.5, boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
          }}>
            {opp.tier.toUpperCase()}
          </div>
        )}
      </div>
      
      {/* Card Content */}
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ padding: "4px 10px", borderRadius: 10, background: "var(--bg-alt)", border: "1px solid var(--border-light)", fontSize: 12.5, fontWeight: 800, color: "var(--text-muted)" }}>
            {opp.organizer}
          </span>
          
          <span style={{
            padding: "4px 8px", borderRadius: 8, background: "rgba(108,99,255,0.12)",
            border: "1px solid rgba(108,99,255,0.3)", color: "#6c63ff",
            fontSize: 12, fontFamily: "'Outfit', sans-serif", fontWeight: 900,
            display: "flex", alignItems: "center", gap: 3
          }}>
            <Sparkles size={10} /> PathEd OG
          </span>
        </div>

        <h4 style={{ margin: "0 0 8px 0", fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900, color: "var(--text-main)", lineHeight: 1.4, height: 50, overflow: "hidden" }}>
          {opp.title}
        </h4>
        
        <p style={{ margin: "0 0 14px 0", fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5, height: 60, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
          {opp.desc}
        </p>

        {/* Opportunity highlights table */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, borderTop: "1px solid var(--border-light)", paddingTop: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: "var(--text-muted)" }}>Prizes/Compensation:</span>
            <strong style={{ color: "var(--text-main)", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }} title={opp.prizePool}>{opp.prizePool}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: "var(--text-muted)" }}>Deadline:</span>
            <strong style={{ color: "#ec4899", fontWeight: 700 }}>{opp.deadline}</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: "var(--text-muted)" }}>Prerequisites:</span>
            <code style={{ fontSize: 12, color: "#6c63ff", fontWeight: 800 }}>{opp.tech.split(",")[0]}</code>
          </div>
        </div>
      </div>

      {/* Card Buttons */}
      <div style={{ padding: "0 20px 20px", display: "flex", gap: 8 }}>
        <button
          onClick={() => setSelectedOpportunity(opp)}
          style={{
            flex: 1, padding: "9px", borderRadius: 10, border: "1.5px solid var(--border-light)",
            background: "var(--bg-alt)", color: "var(--text-main)", 
            fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 800, cursor: "pointer"
          }}
        >
          Details
        </button>

        <button
          onClick={() => {
            if (!isApplied) handleApplyClick(opp);
          }}
          disabled={isApplied}
          style={{
            flex: 1.5, padding: "9px", borderRadius: 10,
            background: isApplied
              ? "var(--bg-alt)"
              : "linear-gradient(135deg, #6c63ff, #00c9a7)",
            color: isApplied 
              ? "#00c9a7" 
              : "#ffffff",
            border: isApplied ? "1.5px solid #00c9a7" : "none",
            fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 900, cursor: isApplied ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 4
          }}
        >
          {isApplied ? (
            <>
              <CheckCircle2 size={13} color="#00c9a7" />
              <span>Quest Enrolled</span>
            </>
          ) : (
            <>
              <span>Apply Spot</span>
              <ArrowUpRight size={13} />
            </>
          )}
        </button>
      </div>

    </div>
  );
}
