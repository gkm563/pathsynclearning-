"use client";

import { routes } from "@/lib/routes";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { 
  Search, MessageSquare, Briefcase, FileText, CheckCircle2, 
  Send, Lock, Sparkles, SlidersHorizontal
} from "lucide-react";
import { usePlan } from "@/hooks/useStudentData";

/* ─── COLOR TOKENS ─── */
const COLS = {
  primary: "#6c63ff",
  success: "#00c9a7",
  warning: "#f59e0b",
  danger: "#ec4899",
  info: "#38bdf8"
};

/* ─── MOCK ALUMNI DATABASE ─── */
const ALUMNI_POOL = [
  {
    id: "a1",
    name: "Aman Verma",
    avatar: "👨‍💻",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Google",
    role: "Software Engineer III",
    college: "IIT Delhi",
    branch: "Computer Science",
    year: "2022",
    city: "Bangalore",
    country: "India",
    skills: ["Go", "Python", "Kubernetes", "Distributed Systems"],
    availableFor: ["Referral", "Mentorship"],
    achievements: "Built Google Cloud Storage components. 2x Hackathon Judge.",
    col: COLS.primary
  },
  {
    id: "a2",
    name: "Pooja Hegde",
    avatar: "👩‍💻",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Microsoft",
    role: "Senior Cloud Solutions Architect",
    college: "IIT Kanpur",
    branch: "Information Technology",
    year: "2021",
    city: "Hyderabad",
    country: "India",
    skills: ["Azure", "Terraform", "C#", "Docker"],
    availableFor: ["Referral", "Career Guidance"],
    achievements: "Leads Azure Cloud migration squads. Microsoft MVP Mentor.",
    col: COLS.success
  },
  {
    id: "a3",
    name: "Ritesh Agrawal",
    avatar: "👨‍💼",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400&h=500",
    company: "TechCorp",
    role: "Lead Backend Developer",
    college: "BITS Pilani",
    branch: "Electronics & Communication",
    year: "2023",
    city: "Pune",
    country: "India",
    skills: ["Node.js", "MongoDB", "Redis", "React"],
    availableFor: ["Mentorship", "Career Guidance"],
    achievements: "Scaled internal gRPC messaging grids by 400% latency cuts.",
    col: COLS.info
  },
  {
    id: "a4",
    name: "Sneha Nair",
    avatar: "👩‍🔬",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Meta",
    role: "AI Research Scientist",
    college: "IIT Bombay",
    branch: "Computer Science",
    year: "2020",
    city: "Menlo Park",
    country: "USA",
    skills: ["PyTorch", "NLP", "Transformers", "Computer Vision"],
    availableFor: ["Referral", "Mentorship"],
    achievements: "Co-authored LLaMA structural compression weights papers.",
    col: COLS.danger
  },
  {
    id: "a5",
    name: "Kunal Dev",
    avatar: "👨‍💻",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Netflix",
    role: "Tech Lead - Streaming",
    college: "IIT Roorkee",
    branch: "Computer Science",
    year: "2018",
    city: "Los Gatos",
    country: "USA",
    skills: ["Node.js", "C++", "WebRTC", "Cassandra"],
    availableFor: ["Referral", "Career Guidance"],
    achievements: "Re-architected edge routing pipelines for 4K live streams.",
    col: COLS.primary
  },
  {
    id: "a6",
    name: "Anjali Sharma",
    avatar: "👩‍🎨",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Apple",
    role: "Frontend Architect",
    college: "BITS Pilani",
    branch: "Information Technology",
    year: "2019",
    city: "Cupertino",
    country: "USA",
    skills: ["React", "Swift", "WebGL", "TypeScript"],
    availableFor: ["Mentorship", "Referral"],
    achievements: "Shipped core interactive web elements for Apple Vision Pro site.",
    col: COLS.success
  },
  {
    id: "a7",
    name: "Rohan Das",
    avatar: "👨‍💻",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Uber",
    role: "Staff Engineer",
    college: "IIT Delhi",
    branch: "Computer Science",
    year: "2017",
    city: "San Francisco",
    country: "USA",
    skills: ["Go", "Redis", "Kafka", "Docker"],
    availableFor: ["Referral", "Mentorship"],
    achievements: "Designed real-time routing engines matching 10M rides daily.",
    col: COLS.info
  },
  {
    id: "a8",
    name: "Shreya Ghoshal",
    avatar: "👩‍🔬",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Nvidia",
    role: "Senior Deep Learning Dev",
    college: "IIT Bombay",
    branch: "Information Technology",
    year: "2021",
    city: "Santa Clara",
    country: "USA",
    skills: ["CUDA", "PyTorch", "C++", "GPU Kernels"],
    availableFor: ["Referral", "Career Guidance"],
    achievements: "Optimized TensorRT inference throughput bounds by 2.4x.",
    col: COLS.danger
  },
  {
    id: "a9",
    name: "Vikram Aditya",
    avatar: "👨‍✈️",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400&h=500",
    company: "CrowdStrike",
    role: "Security Researcher",
    college: "IIT Kanpur",
    branch: "Computer Science",
    year: "2022",
    city: "Austin",
    country: "USA",
    skills: ["Rust", "Kernel Dev", "Assembly", "C"],
    availableFor: ["Mentorship", "Career Guidance"],
    achievements: "Patched critical zero-day virtualization bugs inside hypervisors.",
    col: COLS.warning
  },
  {
    id: "a10",
    name: "Neha Kakkar",
    avatar: "👩‍💻",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=500",
    company: "Adobe",
    role: "Senior Product Engineer",
    college: "BITS Pilani",
    branch: "Computer Science",
    year: "2020",
    city: "Noida",
    country: "India",
    skills: ["WebAssembly", "WebGL", "React", "Rust"],
    availableFor: ["Referral", "Mentorship"],
    achievements: "Ported key Creative Cloud drawing canvases to run natively in browser.",
    col: COLS.info
  }
];

export default function PlatformAlumniNetwork() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("alumni-network");

  const { plan: devPlan, setPlan } = usePlan();

  const handleTogglePlan = (plan) => {
    setPlan(plan);
  };

  // State: Alumni Pool (for searching/filtering)
  const alumni = ALUMNI_POOL;

  // Alumni Portal View Tab: "directory" | "connections"
  const [alumniSubTab, setAlumniSubTab] = useState("connections");
  const [connectedIds, setConnectedIds] = useState(["a3", "a6"]); // prefilled with Ritesh & Anjali

  const handleConnect = (alumnusId) => {
    if (connectedIds.includes(alumnusId)) return;
    setConnectedIds(prev => [...prev, alumnusId]);
    alert("Connection request accepted! Alumnus successfully added to your connections network.");
  };

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCollege, setFilterCollege] = useState("all");
  const [filterCompany, setFilterCompany] = useState("all");
  const [filterAvailable, setFilterAvailable] = useState("all");

  // Premium feature: Active Conversation state
  const [activeChatAlumnus, setActiveChatAlumnus] = useState<any>(null);
  
  // Real-time chat history records for individual seniors
  const [chatHistories, setChatHistories] = useState({
    a1: [
      { sender: "alumnus", text: "Hey Rahul! Let me know if you need referrals for Google. Happy to help.", time: "Yesterday" }
    ],
    a2: [
      { sender: "alumnus", text: "Hey! Azure Solutions team is expanding. Let's sync on your credentials next week.", time: "3 days ago" }
    ],
    a3: [
      { sender: "alumnus", text: "Hey Rahul! Saw your PathEd Roadmap progression. You did really well on the Distributed Systems challenge. Let me know if you need referrals or resumes checked.", time: "Yesterday, 3:10 PM" }
    ],
    a6: [
      { sender: "alumnus", text: "Hi Rahul! Your React and WebGL milestones are impressive. Glad to connect with you.", time: "2 days ago" }
    ]
  });

  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<any>(null);

  // Referral Stepper states and 1-month lock cooldown dictionary
  const [referralAlumnus, setReferralAlumnus] = useState<any>(null);
  const [referralStep, setReferralStep] = useState(1); // Steps: 1, 2, 3, 4
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [referralPitch, setReferralPitch] = useState("");
  const [referralCooldowns, setReferralCooldowns] = useState<Record<string, any>>({});

  const chatMessages = activeChatAlumnus ? (chatHistories[activeChatAlumnus.id] || []) : [];

  // Auto scroll chat console
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistories, activeChatAlumnus]);

  // Filtering Logic
  const filteredAlumni = alumni.filter(al => {
    if (alumniSubTab === "connections" && !connectedIds.includes(al.id)) return false;
    if (filterCollege !== "all" && al.college !== filterCollege) return false;
    if (filterCompany !== "all" && al.company !== filterCompany) return false;
    if (filterAvailable !== "all" && !al.availableFor.includes(filterAvailable)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        al.name.toLowerCase().includes(q) ||
        al.role.toLowerCase().includes(q) ||
        al.skills.some(s => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChatAlumnus) return;
    
    const newMsg = { sender: "student", text: chatInput, time: "Just now" };
    setChatHistories(prev => ({
      ...prev,
      [activeChatAlumnus.id]: [...(prev[activeChatAlumnus.id] || []), newMsg]
    }));
    setChatInput("");

    // Simulate response delay
    setTimeout(() => {
      const reply = { sender: "alumnus", text: `Got it Rahul! Let me review this detail. I'll get back to you shortly.`, time: "Just now" };
      setChatHistories(prev => ({
        ...prev,
        [activeChatAlumnus.id]: [...(prev[activeChatAlumnus.id] || []), reply]
      }));
    }, 1500);
  };

  const handleDispatchReferral = () => {
    if (!referralAlumnus) return;

    setReferralStep(4);
    setTimeout(() => {
      // Set lock cooldown (current timestamp)
      setReferralCooldowns(prev => ({
        ...prev,
        [referralAlumnus.id]: Date.now()
      }));

      // Append SDE referral transaction receipt in chat history
      const referralMsg = {
        sender: "system",
        text: `🚀 Referral Request Submitted: SDE Resume and CRI Verification (785/1000) successfully completed. Dispatched to engineering teams at ${referralAlumnus.company}.`,
        time: "Just now"
      };

      setChatHistories(prev => ({
        ...prev,
        [referralAlumnus.id]: [...(prev[referralAlumnus.id] || []), referralMsg]
      }));

      alert(`Referral application successfully submitted! Referral pipeline created at ${referralAlumnus.company}. Button locked for 30 days.`);
      
      setReferralAlumnus(null);
      setReferralStep(1);
      setResumeUploaded(false);
      setReferralPitch("");
    }, 1200);
  };

  const handleResetCooldowns = () => {
    setReferralCooldowns({});
    alert("All SDE referral cooldown locks successfully cleared for testing!");
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 60, position: "relative" }}>
        
        {/* Toggle Plan Banner */}
        <div style={{
          background: "linear-gradient(135deg, #1e1b4b, #030712)",
          borderRadius: 20, padding: "20px 24px",
          border: "1px solid rgba(108,99,255,0.3)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 14
        }}>
          <div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#6c63ff", fontWeight: 800 }}>DEVELOPER TESTING PORTAL</div>
            <h4 style={{ margin: "2px 0 0", fontFamily: "'Outfit', sans-serif", fontSize: 16.5, fontWeight: 900, color: "#ffffff" }}>
              Toggle Alumni Network VIP Access
            </h4>
          </div>
          <div style={{ display: "flex", gap: 8, background: "rgba(255,255,255,0.06)", padding: 6, borderRadius: 14 }}>
            <button
              onClick={() => handleTogglePlan("free")}
              style={{
                padding: "8px 16px", borderRadius: 10, border: "none",
                background: devPlan === "free" ? "#6c63ff" : "transparent",
                color: "#ffffff", fontFamily: "'Outfit', sans-serif", fontSize: 13,
                fontWeight: 800, cursor: "pointer", transition: "all 0.2s"
              }}
            >
              ○ Free Plan
            </button>
            <button
              onClick={() => handleTogglePlan("premium")}
              style={{
                padding: "8px 16px", borderRadius: 10, border: "none",
                background: devPlan === "premium" ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "transparent",
                color: "#ffffff", fontFamily: "'Outfit', sans-serif", fontSize: 13,
                fontWeight: 800, cursor: "pointer", transition: "all 0.2s"
              }}
            >
              ● Premium Plan
            </button>
            <button
              onClick={handleResetCooldowns}
              style={{
                padding: "8px 16px", borderRadius: 10, border: "1px dashed rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.08)",
                color: "#00c9a7", fontFamily: "'Outfit', sans-serif", fontSize: 13,
                fontWeight: 800, cursor: "pointer", transition: "all 0.2s", marginLeft: 6
              }}
            >
              🔄 Reset Cooldowns
            </button>
          </div>
        </div>

        {/* Hero Title */}
        <div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
            Alumni <span style={{ background: "linear-gradient(90deg, #6c63ff, #00c9a7, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Connections & Referrals</span>
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.5 }}>
            Reach back to seniors placed across tier-1 global MNCs. Request referrals, review resumes, and align roadmap pipelines.
          </p>
        </div>

        {/* Sub navigation for Alumni Directory vs Connections */}
        <div style={{ display: "flex", gap: 12, borderBottom: "1.5px solid var(--border-light)", paddingBottom: 6, marginTop: 4 }}>
          <button
            onClick={() => setAlumniSubTab("connections")}
            style={{
              padding: "10px 20px", borderRadius: 12, border: "none",
              background: alumniSubTab === "connections" ? "rgba(108,99,255,0.08)" : "transparent",
              color: alumniSubTab === "connections" ? "#6c63ff" : "var(--text-muted)",
              fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 905,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
            }}
          >
            🤝 My Connections ({connectedIds.length})
          </button>
          <button
            onClick={() => setAlumniSubTab("directory")}
            style={{
              padding: "10px 20px", borderRadius: 12, border: "none",
              background: alumniSubTab === "directory" ? "rgba(108,99,255,0.08)" : "transparent",
              color: alumniSubTab === "directory" ? "#6c63ff" : "var(--text-muted)",
              fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 905,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
            }}
          >
            🔍 Search Directory ({alumni.length})
          </button>
        </div>

        {/* AI Matches Highlights / Recommendations */}
        <div style={{
          background: "linear-gradient(135deg, rgba(108,99,255,0.06), rgba(0,201,167,0.06))",
          borderRadius: 22, border: "1.5px solid rgba(108,99,255,0.2)",
          padding: 24, display: "flex", flexDirection: "column", gap: 14
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ padding: 6, borderRadius: 10, background: "rgba(108,99,255,0.12)", color: "#6c63ff", display: "flex", alignItems: "center" }}>
              <Sparkles size={18} />
            </div>
            <h3 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 900, color: "var(--text-main)" }}>
              AI Smart Placement Recommendations
            </h3>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.5, maxWidth: 840, fontStyle: "italic" }}>
            “Based on your current Software Engineer roadmap track and SDE Core specialty milestones, these alumni followed a similar pipeline and have open referral slots inside their respective squads.”
          </p>
          
          {/* Slidable/Flex recommended row */}
          <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 6 }} className="hide-scrollbar">
            {ALUMNI_POOL.slice(0, 2).map(al => (
              <div 
                key={al.id} 
                style={{ 
                  flexShrink: 0, width: 280, padding: 14, borderRadius: 16, 
                  background: "var(--bg-card)", border: "1px solid var(--border-light)",
                  display: "flex", gap: 12, alignItems: "center" 
                }}
              >
                <img src={al.image} style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--text-main)" }}>{al.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)", fontWeight: 700 }}>{al.role} @ {al.company}</div>
                  <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                    <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 6, background: "rgba(0,201,167,0.08)", color: "#00c9a7", fontWeight: 800 }}>
                      98% Path Match
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!activeChatAlumnus ? (
          <>
            {/* Filters Bar */}
            <div style={{
              padding: 20, borderRadius: 20, background: "var(--bg-card)",
              border: "1.5px solid var(--border-light)", display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center"
            }}>
              <div style={{ flex: 1, position: "relative" }}>
                <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search alumni names, job titles, SDE skills..."
                  style={{
                    width: "100%", padding: "9px 14px 9px 38px", borderRadius: 10,
                    background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                    color: "var(--text-main)", outline: "none", fontFamily: "'Outfit', sans-serif", fontSize: 13.5
                  }}
                />
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                <SlidersHorizontal size={14} color="var(--text-muted)" />
                
                <select
                  value={filterCollege}
                  onChange={e => setFilterCollege(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: 8, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 700, outline: "none" }}
                >
                  <option value="all">🎓 All Colleges</option>
                  <option value="IIT Delhi">IIT Delhi</option>
                  <option value="IIT Kanpur">IIT Kanpur</option>
                  <option value="IIT Bombay">IIT Bombay</option>
                  <option value="BITS Pilani">BITS Pilani</option>
                </select>

                <select
                  value={filterCompany}
                  onChange={e => setFilterCompany(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: 8, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 700, outline: "none" }}
                >
                  <option value="all">🏢 All Companies</option>
                  <option value="Google">Google</option>
                  <option value="Microsoft">Microsoft</option>
                  <option value="Meta">Meta</option>
                  <option value="TechCorp">TechCorp</option>
                </select>

                <select
                  value={filterAvailable}
                  onChange={e => setFilterAvailable(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: 8, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 700, outline: "none" }}
                >
                  <option value="all">🛡️ Availability Type</option>
                  <option value="Referral">Referral Referral</option>
                  <option value="Mentorship">Guidance Mentorship</option>
                  <option value="Career Guidance">Career Syncs</option>
                </select>
              </div>
            </div>

            {/* Alumni Profiles List Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
              {filteredAlumni.map(al => (
                <motion.div
                  key={al.id}
                  whileHover={{ y: -6 }}
                  style={{
                    background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
                    borderRadius: 24, overflow: "hidden", display: "flex", flexDirection: "column",
                    boxShadow: "0 4px 18px rgba(0,0,0,0.015)"
                  }}
                >
                  {/* Photo cover area */}
                  <div style={{ position: "relative", height: 210, overflow: "hidden" }}>
                    <img src={al.image} alt={al.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }} />
                    
                    <div style={{ position: "absolute", bottom: 14, left: 16, right: 16, color: "#ffffff" }}>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 19, fontWeight: 900 }}>
                        {al.name}
                      </div>
                      <span style={{ fontSize: 12.5, opacity: 0.85 }}>
                        {al.role} @ <strong style={{ fontWeight: 800 }}>{al.company}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Details & Specs */}
                  <div style={{ padding: 18, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {al.skills.slice(0, 3).map((s, sIdx) => (
                          <span key={sIdx} style={{ padding: "4px 8px", borderRadius: 8, background: "var(--bg-alt)", border: "1px solid var(--border-light)", fontSize: 11, color: "var(--text-main)", fontWeight: 700 }}>
                            {s}
                          </span>
                        ))}
                      </div>

                      <div style={{ fontSize: 12.5, color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: 4 }}>
                        <span>🎓 {al.college} • {al.branch}</span>
                        <span>🕒 Passing Year: <strong style={{ fontWeight: 800 }}>{al.year}</strong></span>
                        <span style={{ fontStyle: "italic", fontSize: 12, marginTop: 4, color: "var(--text-muted)" }}>
                          “{al.achievements}”
                        </span>
                      </div>
                    </div>

                    {/* Available badges */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {al.availableFor.map((av, avIdx) => (
                        <span 
                          key={avIdx}
                          style={{
                            padding: "3px 6px", borderRadius: 6, fontSize: 10.5, fontFamily: "'Fira Code', monospace", fontWeight: 800,
                            background: av === "Referral" ? "rgba(0,201,167,0.08)" : "rgba(108,99,255,0.08)",
                            color: av === "Referral" ? "#00c9a7" : "#6c63ff"
                          }}
                        >
                          {av.toUpperCase()}
                        </span>
                      ))}
                    </div>

                    {/* Profile Actions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid var(--border-light)", paddingTop: 14 }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => handleConnect(al.id)}
                          style={{
                            flex: 1, padding: "10px", borderRadius: 10,
                            border: connectedIds.includes(al.id) ? "1.5px solid rgba(0,201,167,0.3)" : "1.5px solid var(--border-light)",
                            background: connectedIds.includes(al.id) ? "rgba(0,201,167,0.06)" : "var(--bg-alt)",
                            color: connectedIds.includes(al.id) ? "#00c9a7" : "var(--text-main)",
                            fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 900,
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s"
                          }}
                        >
                          {connectedIds.includes(al.id) ? "🤝 Connected" : "⚡ Connect"}
                        </button>

                        <button
                          onClick={() => {
                            setActiveChatAlumnus(al);
                          }}
                          style={{
                            flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid var(--border-light)",
                            background: "var(--bg-alt)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif",
                            fontSize: 13, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                          }}
                        >
                          <MessageSquare size={13} />
                          <span>Message</span>
                        </button>
                      </div>

                      <button
                        disabled={!al.availableFor.includes("Referral") || (referralCooldowns[al.id] && Date.now() - referralCooldowns[al.id] < 30 * 24 * 60 * 60 * 1000)}
                        onClick={() => {
                          setReferralAlumnus(al);
                          setReferralStep(1);
                          setResumeUploaded(false);
                          setReferralPitch("");
                        }}
                        style={{
                          width: "100%", padding: "10px", borderRadius: 10, border: "none",
                          background: (!al.availableFor.includes("Referral") || (referralCooldowns[al.id] && Date.now() - referralCooldowns[al.id] < 30 * 24 * 60 * 60 * 1000))
                            ? "var(--border-light)"
                            : "linear-gradient(135deg, #6c63ff, #00c9a7)",
                          color: (!al.availableFor.includes("Referral") || (referralCooldowns[al.id] && Date.now() - referralCooldowns[al.id] < 30 * 24 * 60 * 60 * 1000))
                            ? "var(--text-muted)"
                            : "#ffffff",
                          fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 900,
                          cursor: (!al.availableFor.includes("Referral") || (referralCooldowns[al.id] && Date.now() - referralCooldowns[al.id] < 30 * 24 * 60 * 60 * 1000)) ? "default" : "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                        }}
                      >
                        <Briefcase size={13} />
                        <span>
                          {referralCooldowns[al.id] && Date.now() - referralCooldowns[al.id] < 30 * 24 * 60 * 60 * 1000
                            ? "⏳ Referral Dispatched (Locked 30d)"
                            : "Request Placement Referral"
                          }
                        </span>
                      </button>
                    </div>
                  </div>

                </motion.div>
              ))}
            </div>
          </>
        ) : (
          /* WORKSPACE VIEW: FEATURED PROFILE + CHAT SIDE-BY-SIDE */
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 24 }}>
              
              {/* Left Column: Selected Alumnus profile card (MNC grade) */}
              <div style={{
                background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
                borderRadius: 24, overflow: "hidden", display: "flex", flexDirection: "column"
              }}>
                <div style={{ position: "relative", height: 260, overflow: "hidden" }}>
                  <img src={activeChatAlumnus.image} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }} />
                  
                  <div style={{ position: "absolute", bottom: 16, left: 20, right: 20, color: "#ffffff" }}>
                    <h3 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 900 }}>
                      {activeChatAlumnus.name}
                    </h3>
                    <span style={{ fontSize: 13.5, opacity: 0.9 }}>
                      {activeChatAlumnus.role} @ <strong style={{ fontWeight: 800 }}>{activeChatAlumnus.company}</strong>
                    </span>
                  </div>
                </div>

                <div style={{ padding: 22, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {activeChatAlumnus.skills.map((s, idx) => (
                        <span key={idx} style={{ padding: "4px 8px", borderRadius: 8, background: "var(--bg-alt)", border: "1px solid var(--border-light)", fontSize: 11.5, color: "var(--text-main)", fontWeight: 700 }}>
                          {s}
                        </span>
                      ))}
                    </div>

                    <div style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: 6 }}>
                      <span>🎓 College: {activeChatAlumnus.college}</span>
                      <span>🕒 Branch & Year: {activeChatAlumnus.branch} ({activeChatAlumnus.year})</span>
                      <span style={{ fontStyle: "italic", marginTop: 4, display: "block" }}>
                        “{activeChatAlumnus.achievements}”
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid var(--border-light)", paddingTop: 16 }}>
                    <button
                      onClick={() => handleConnect(activeChatAlumnus.id)}
                      style={{
                        width: "100%", padding: "11px", borderRadius: 10,
                        border: connectedIds.includes(activeChatAlumnus.id) ? "1.5px solid rgba(0,201,167,0.3)" : "1.5px solid var(--border-light)",
                        background: connectedIds.includes(activeChatAlumnus.id) ? "rgba(0,201,167,0.06)" : "var(--bg-alt)",
                        color: connectedIds.includes(activeChatAlumnus.id) ? "#00c9a7" : "var(--text-main)",
                        fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 900,
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                      }}
                    >
                      {connectedIds.includes(activeChatAlumnus.id) ? "🤝 Connected" : "⚡ Connect"}
                    </button>

                    <button
                      disabled={!activeChatAlumnus.availableFor.includes("Referral") || (referralCooldowns[activeChatAlumnus.id] && Date.now() - referralCooldowns[activeChatAlumnus.id] < 30 * 24 * 60 * 60 * 1000)}
                      onClick={() => {
                        setReferralAlumnus(activeChatAlumnus);
                        setReferralStep(1);
                        setResumeUploaded(false);
                        setReferralPitch("");
                      }}
                      style={{
                        width: "100%", padding: "11px", borderRadius: 10, border: "none",
                        background: (!activeChatAlumnus.availableFor.includes("Referral") || (referralCooldowns[activeChatAlumnus.id] && Date.now() - referralCooldowns[activeChatAlumnus.id] < 30 * 24 * 60 * 60 * 1000))
                          ? "var(--border-light)"
                          : "linear-gradient(135deg, #6c63ff, #00c9a7)",
                        color: (!activeChatAlumnus.availableFor.includes("Referral") || (referralCooldowns[activeChatAlumnus.id] && Date.now() - referralCooldowns[activeChatAlumnus.id] < 30 * 24 * 60 * 60 * 1000))
                          ? "var(--text-muted)"
                          : "#ffffff",
                        fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 900,
                        cursor: (!activeChatAlumnus.availableFor.includes("Referral") || (referralCooldowns[activeChatAlumnus.id] && Date.now() - referralCooldowns[activeChatAlumnus.id] < 30 * 24 * 60 * 60 * 1000)) ? "default" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                      }}
                    >
                      <Briefcase size={14} />
                      <span>
                        {referralCooldowns[activeChatAlumnus.id] && Date.now() - referralCooldowns[activeChatAlumnus.id] < 30 * 24 * 60 * 60 * 1000
                          ? "⏳ Referral Dispatched (Locked 30d)"
                          : "Request Placement Referral"
                        }
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Chat Workspace */}
              <div style={{
                background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
                borderRadius: 24, padding: 24, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid var(--border-light)", paddingBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#00c9a7", boxShadow: "0 0 8px #00c9a7" }} />
                    <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15.5, fontWeight: 800, color: "var(--text-main)" }}>
                      Live Conversation Terminal
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => setActiveChatAlumnus(null)}
                    style={{
                      padding: "6px 14px", borderRadius: 10, border: "1.5px solid var(--border-light)",
                      background: "var(--bg-alt)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif",
                      fontSize: 12.5, fontWeight: 800, cursor: "pointer"
                    }}
                  >
                    ← Close Chat Workspace
                  </button>
                </div>

                {devPlan === "free" ? (
                  /* FREE SHIELD */
                  <div style={{
                    padding: "80px 20px", borderRadius: 16, border: "1.5px dashed rgba(108,99,255,0.35)",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center",
                    backdropFilter: "blur(6px)", background: "rgba(15,23,42,0.03)", height: "100%", justifyContent: "center"
                  }}>
                    <Lock size={26} color="#6c63ff" />
                    <div>
                      <h5 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900, color: "var(--text-main)" }}>
                        VIP Messaging Locked
                      </h5>
                      <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "var(--text-muted)", maxWidth: 380, textAlign: "center" }}>
                        Upgrade to PathED Premium to unlock private messaging channels, share resumes directly, and sync call schedules.
                      </p>
                    </div>
                    <button
                      onClick={() => router.push(routes.app.store)}
                      style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#ffffff", fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 900, cursor: "pointer" }}
                    >
                      Unlock Premium
                    </button>
                  </div>
                ) : (
                  /* PREMIUM CHAT CONSOLE */
                  <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between", minHeight: 340 }}>
                    <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, paddingRight: 8, maxHeight: 310 }}>
                      {chatMessages.map((msg, idx) => {
                        const isSystem = msg.sender === "system";
                        return (
                          <div 
                            key={idx} 
                            style={{ 
                              alignSelf: isSystem ? "center" : (msg.sender === "student" ? "flex-end" : "flex-start"),
                              maxWidth: isSystem ? "95%" : "70%", display: "flex", flexDirection: "column", gap: 3
                            }}
                          >
                            {!isSystem && (
                              <span style={{ fontSize: 10.5, color: "var(--text-muted)", alignSelf: msg.sender === "student" ? "flex-end" : "flex-start" }}>
                                {msg.sender === "student" ? "You" : activeChatAlumnus.name} • {msg.time}
                              </span>
                            )}
                            <div style={{
                              padding: "10px 14px", borderRadius: 14,
                              background: isSystem ? "rgba(108,99,255,0.06)" : (msg.sender === "student" ? "#6c63ff" : "var(--bg-alt)"),
                              color: isSystem ? "#6c63ff" : (msg.sender === "student" ? "#ffffff" : "var(--text-main)"),
                              border: isSystem ? "1px solid rgba(108,99,255,0.2)" : (msg.sender === "student" ? "none" : "1px solid var(--border-light)"),
                              fontSize: 13.5, lineHeight: 1.45,
                              fontStyle: isSystem ? "italic" : "normal",
                              fontWeight: isSystem ? 700 : "normal"
                            }}>
                              {msg.text}
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSendChat} style={{ display: "flex", gap: 10, marginTop: 14, borderTop: "1px solid var(--border-light)", paddingTop: 12 }}>
                      <input
                        type="text"
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        placeholder={`Message ${activeChatAlumnus.name}...`}
                        style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: "var(--bg-alt)", border: "1px solid var(--border-light)", color: "var(--text-main)", outline: "none", fontSize: 13.5 }}
                      />
                      <button 
                        type="submit"
                        style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "#6c63ff", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >
                        <Send size={15} />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Row: Connected Alumni Switch List */}
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Sparkles size={16} color="#6c63ff" />
                <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
                  Switch Chat Workspace Partner
                </h4>
              </div>
              
              <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 6 }} className="hide-scrollbar">
                {alumni.filter(al => al.id !== activeChatAlumnus.id && (alumniSubTab === "directory" || connectedIds.includes(al.id))).map(al => (
                  <motion.div
                    key={al.id}
                    whileHover={{ y: -3 }}
                    onClick={() => {
                      setActiveChatAlumnus(al);
                    }}
                    style={{
                      flexShrink: 0, width: 250, padding: 12, borderRadius: 16,
                      background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
                      cursor: "pointer", display: "flex", gap: 12, alignItems: "center", transition: "all 0.2s"
                    }}
                  >
                    <img src={al.image} style={{ width: 38, height: 38, borderRadius: "50%", objectFit: "cover" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {al.name}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {al.role} @ {al.company}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stepper modal for referrals */}
        <AnimatePresence>
          {referralAlumnus && (
            <div 
              onClick={e => { if (e.target === e.currentTarget) setReferralAlumnus(null); }}
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
                  background: "var(--bg-card)", borderRadius: 24, maxWidth: 540, width: "100%",
                  border: "1.5px solid var(--border-light)", boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
                  overflow: "hidden", display: "flex", flexDirection: "column", position: "relative"
                }}
              >
                <div style={{ padding: "20px 24px", borderBottom: "1.5px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 900, color: "var(--text-main)" }}>
                    Request Referral - {referralAlumnus.company}
                  </h4>
                  <button onClick={() => setReferralAlumnus(null)} style={{ position: "absolute", right: 20, top: 20, width: 32, height: 32, borderRadius: 10, border: "none", background: "var(--bg-alt)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-main)" }}>
                    ×
                  </button>
                </div>

                {devPlan === "free" ? (
                  /* FREE SHIELD */
                  <div style={{ padding: 32, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(108,99,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#6c63ff" }}>
                      <Lock size={24} />
                    </div>
                    <div>
                      <h5 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900, color: "var(--text-main)" }}>
                        Referral Pipelines Locked
                      </h5>
                      <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "var(--text-muted)", maxWidth: 360 }}>
                        Submit resumes directly to seniors at meta, Google, and Amazon. Upgrade to PathEd Premium to start validation.
                      </p>
                    </div>
                    <button 
                      onClick={() => { setReferralAlumnus(null); router.push(routes.app.store); }}
                      style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#ffffff", fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 800, cursor: "pointer" }}
                    >
                      Unlock Placement VIP Store
                    </button>
                  </div>
                ) : (
                  /* PREMIUM CODE: STEPPER */
                  <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
                    
                    {/* Steps Breadcrumbs indicator */}
                    <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
                      {[1, 2, 3].map(st => (
                        <div 
                          key={st} 
                          style={{ 
                            flex: 1, height: 6, borderRadius: 3,
                            background: referralStep >= st ? "linear-gradient(90deg, #6c63ff, #00c9a7)" : "var(--border-light)"
                          }} 
                        />
                      ))}
                    </div>

                    {/* Step 1: Resume Verify */}
                    {referralStep === 1 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#6c63ff", fontWeight: 900 }}>STEP 1 OF 3: RESUME SUBMISSION</div>
                        <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.45 }}>
                          Upload your latest resume. PathEd parses your projects and compiles them to match {referralAlumnus.company}'s active tech stack requirements.
                        </p>
                        
                        <div style={{
                          padding: "24px 16px", borderRadius: 14, border: "1.5px dashed var(--border-light)",
                          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                          background: resumeUploaded ? "rgba(0,201,167,0.06)" : "var(--bg-alt)", textAlign: "center"
                        }}>
                          <FileText size={24} color={resumeUploaded ? "#00c9a7" : "#6c63ff"} />
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-main)" }}>
                              {resumeUploaded ? "Resume_Rahul_Kushwaha.pdf" : "Select SDE Resume Document"}
                            </span>
                            <span style={{ display: "block", fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                              PDF, DOCX formats accepted (Max 4MB)
                            </span>
                          </div>
                          {!resumeUploaded ? (
                            <button 
                              type="button"
                              onClick={() => setResumeUploaded(true)}
                              style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "var(--text-main)", color: "var(--bg-main)", fontSize: 12, fontWeight: 800, cursor: "pointer" }}
                            >
                              Upload File
                            </button>
                          ) : (
                            <span style={{ fontSize: 12, color: "#00c9a7", fontWeight: 800 }}>✓ Upload Verification Success</span>
                          )}
                        </div>

                        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                          <button 
                            disabled={!resumeUploaded}
                            onClick={() => setReferralStep(2)}
                            style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: resumeUploaded ? "#6c63ff" : "var(--border-light)", color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900, cursor: resumeUploaded ? "pointer" : "default" }}
                          >
                            Continue to Step 2
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 2: CRI-Score Verification */}
                    {referralStep === 2 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#6c63ff", fontWeight: 900 }}>STEP 2 OF 3: CRI SCORE CHECK</div>
                        <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.45 }}>
                          Companies require referral candidates to exceed a baseline SDE competence score. Your profile CRI values:
                        </p>

                        <div style={{ padding: 18, borderRadius: 16, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <span style={{ fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)" }}>YOUR ACTIVE CRI SCORE</span>
                            <span style={{ display: "block", fontSize: 26, fontWeight: 900, color: "#00c9a7", marginTop: 2 }}>785 / 1000</span>
                          </div>
                          <div>
                            <span style={{ fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)" }}>MINIMUM SDE BAR</span>
                            <span style={{ display: "block", fontSize: 18, fontWeight: 800, color: "var(--text-main)", marginTop: 2 }}>700 +</span>
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: 8, padding: 12, borderRadius: 10, background: "rgba(0,201,167,0.06)", border: "1px solid rgba(0,201,167,0.2)", alignItems: "center" }}>
                          <CheckCircle2 size={16} color="#00c9a7" />
                          <span style={{ fontSize: 12, color: "#00c9a7", fontWeight: 800 }}>Validation Complete: Your profile meets referral bars!</span>
                        </div>

                        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                          <button 
                            onClick={() => setReferralStep(1)}
                            style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid var(--border-light)", background: "var(--bg-alt)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, cursor: "pointer" }}
                          >
                            Back
                          </button>
                          <button 
                            onClick={() => setReferralStep(3)}
                            style={{ flex: 1.5, padding: "12px", borderRadius: 12, border: "none", background: "#6c63ff", color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900, cursor: "pointer" }}
                          >
                            Continue to Step 3
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Pitch & Submit */}
                    {referralStep === 3 && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "#6c63ff", fontWeight: 900 }}>STEP 3 OF 3: CORES SPECIALTY PITCH</div>
                        <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.45 }}>
                          Summarize your specialties and why you are a fit for {referralAlumnus.company}'s engineering teams. Aman will forward this pitch alongside your resume.
                        </p>

                        <textarea
                          required
                          value={referralPitch}
                          onChange={e => setReferralPitch(e.target.value)}
                          placeholder="Describe your background, open source contributions, or roadmap challenges you excelled at..."
                          style={{
                            width: "100%", height: 110, borderRadius: 10, background: "var(--bg-alt)",
                            border: "1.5px solid var(--border-light)", color: "var(--text-main)",
                            fontFamily: "'Outfit', sans-serif", fontSize: 13.5, padding: 12, outline: "none", resize: "none"
                          }}
                        />

                        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                          <button 
                            onClick={() => setReferralStep(2)}
                            style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid var(--border-light)", background: "var(--bg-alt)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, cursor: "pointer" }}
                          >
                            Back
                          </button>
                          <button 
                            disabled={!referralPitch.trim()}
                            onClick={handleDispatchReferral}
                            style={{ flex: 1.5, padding: "12px", borderRadius: 12, border: "none", background: referralPitch.trim() ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "var(--border-light)", color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900, cursor: referralPitch.trim() ? "pointer" : "default" }}
                          >
                            Submit Application
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>



      </div>
    </DashboardLayout>
  );
}
