import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { 
  Sparkles, Search, Calendar, Video, BookOpen, User, CheckCircle2, 
  ArrowRight, ShieldCheck, HelpCircle, Star, Clock, Plus, ChevronRight, X, 
  UserCheck, ShieldAlert, ArrowLeft, ArrowUpRight, Check, Heart, ExternalLink,
  Mic, MicOff, VideoOff, MessageSquare, Send, FolderOpen, Award,
  Users, Trash, Edit2, Play, SlidersHorizontal, Lock, CheckCircle, Radio, PhoneOff
} from "lucide-react";

// Inline SVG Github Icon to avoid dependency exports mismatch
const Github = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

/* ─── COLOR PALETTE ─── */
const COLS = {
  primary: "#6c63ff",
  success: "#00c9a7",
  warning: "#f59e0b",
  danger: "#ec4899",
  info: "#38bdf8",
  purple: "#8b5cf6"
};

/* ─── PUBLIC SQUADS DATABASE ─── */
const PUBLIC_SQUADS = [
  {
    id: "s1",
    name: "Hyperion AI",
    hackathon: "Google AI Global Hackathon 2026",
    domain: "Artificial Intelligence",
    timeLeft: "2 Days Left",
    countdown: 172800, // in seconds
    teamSize: 4,
    maxSize: 5,
    leader: { name: "Anish Sen", college: "IIT Kharagpur", avatar: "👨‍💻" },
    members: [
      { name: "Anish Sen", role: "AI Lead", avatar: "🤖", github: "anish-ai" },
      { name: "Rohit Das", role: "Backend Dev", avatar: "💻", github: "rohit-coder" },
      { name: "Kriti Sharma", role: "UI/UX Designer", avatar: "🎨", github: "kriti-design" },
      { name: "Rahul (Guest)", role: "Presentation Lead", avatar: "📊", github: "rahul-pres" }
    ],
    openPositions: ["React Frontend Developer"],
    tags: ["TensorFlow", "React", "Python"],
    desc: "Building a localized multi-modal agent workspace designed to streamline rural educational content curation using LLMs."
  },
  {
    id: "s2",
    name: "Byte Busters",
    hackathon: "Smart India Hackathon 2026",
    domain: "IoT & Smart Cities",
    timeLeft: "15 Days Left",
    countdown: 1296000,
    teamSize: 3,
    maxSize: 6,
    leader: { name: "Pooja Hegde", college: "BITS Pilani", avatar: "👩‍💻" },
    members: [
      { name: "Pooja Hegde", role: "IoT Hardware Lead", avatar: "⚙️", github: "pooja-bits" },
      { name: "Vikram Malhotra", role: "Embedded C Dev", avatar: "🔌", github: "vikram-embed" },
      { name: "Suresh Rao", role: "Data Analyst", avatar: "📈", github: "suresh-data" }
    ],
    openPositions: ["Backend Developer (Node/Express)", "Mobile App Developer"],
    tags: ["Arduino", "NodeJS", "Express"],
    desc: "Developing smart garbage monitoring grid systems equipped with level alerts and gas indicators for municipal authorities."
  },
  {
    id: "s3",
    name: "Decentralized Wizards",
    hackathon: "Solana Speedrun Hackathon 2026",
    domain: "Web3 & Blockchain",
    timeLeft: "6 Days Left",
    countdown: 518400,
    teamSize: 4,
    maxSize: 5,
    leader: { name: "Abhinav Anand", college: "IIT Delhi", avatar: "🧙‍♂️" },
    members: [
      { name: "Abhinav Anand", role: "Solana Architect", avatar: "⛓️", github: "abhinav-web3" },
      { name: "Rajat Verma", role: "Smart Contract QA", avatar: "🧪", github: "rajat-contract" },
      { name: "Neha Roy", role: "Frontend Developer", avatar: "👩‍🎨", github: "neha-front" },
      { name: "Viktor Petrov", role: "Tokenomics Planner", avatar: "💰", github: "viktor-token" }
    ],
    openPositions: ["Rust Smart Contract Engineer"],
    tags: ["Rust", "Solana", "Web3JS"],
    desc: "Creating zero-slippage yield aggregators optimized for micro-loans across decentralized farming unions."
  },
  {
    id: "s4",
    name: "Bio-Synth Labs",
    hackathon: "MIT Global Bio-Innovate Challenge",
    domain: "Bio-Tech Research",
    timeLeft: "22 Days Left",
    countdown: 1900800,
    teamSize: 3,
    maxSize: 4,
    leader: { name: "Dr. Sandeep Sen", college: "IIT Bombay", avatar: "🔬" },
    members: [
      { name: "Dr. Sandeep Sen", role: "Bioinformatics Analyst", avatar: "🧫", github: "sandeep-bio" },
      { name: "Amit Soni", role: "Systems Biologist", avatar: "🧬", github: "amit-system" },
      { name: "Sunita Reddy", role: "UI Designer", avatar: "👩‍🎨", github: "sunita-reddy" }
    ],
    openPositions: ["Research & Presentation lead"],
    tags: ["R-Lang", "Python", "BioPython"],
    desc: "Correlating enzyme structures utilizing machine learning prediction to discover eco-friendly bio-degradable plastic variants."
  }
];

export default function PlatformHackSquad() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("hack-attack");

  // Premium Toggle (Developer Mode Plan State)
  const [devPlan, setDevPlan] = useState(() => {
    try {
      return localStorage.getItem("dev_mode_plan") || "free";
    } catch (e) {
      return "free";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("dev_mode_plan", devPlan);
    } catch (e) {}
    try {
      window.dispatchEvent(new Event("storage"));
    } catch (e) {}
  }, [devPlan]);

  const handleTogglePlan = (plan) => {
    setDevPlan(plan);
  };

  // State definitions
  const [squadsList, setSquadsList] = useState(PUBLIC_SQUADS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDomain, setFilterDomain] = useState("all");
  const [selectedPublicSquad, setSelectedPublicSquad] = useState(null);

  // Free Plan Join Application
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applySquad, setApplySquad] = useState(null);
  const [applyRole, setApplyRole] = useState("");
  const [applyPitch, setApplyPitch] = useState("");

  // Premium active squad workspace mock state list
  const [premiumSquads, setPremiumSquads] = useState([
    {
      id: "sq1",
      name: "Zenith Devs",
      hackathon: "Microsoft Imagine Cup 2026",
      status: "Active Team Workspace",
      targetTime: Date.now() + 86385 * 1000,
      leader: "Rahul Kushwaha (You)",
      members: [
        { id: "u1", name: "Rahul Kushwaha (You)", role: "Frontend Architect & Presentation", avatar: "👨‍💻", availability: "20h/week", github: "rahul-kushwaha", rating: 4.9, score: 92 },
        { id: "u2", name: "Sneha Nair", role: "AI Research Scientist", avatar: "👩‍🔬", availability: "15h/week", github: "sneha-nair", rating: 4.8, score: 88 },
        { id: "u3", name: "Priya Sharma", role: "Backend Engineer", avatar: "👩‍💻", availability: "18h/week", github: "priya-sharma", rating: 4.7, score: 85 },
        { id: "u4", name: "Amit Patel", role: "UI/UX Designer", avatar: "🎨", availability: "10h/week", github: "amit-design", rating: 4.5, score: 80 }
      ],
      pendingInvites: [],
      gitLog: [
        { author: "Priya Sharma", msg: "Refactored node authentication and router error boundaries.", time: "5 minutes ago" },
        { author: "Sneha Nair", msg: "Merged pull request #12: core AI inference backend pipeline.", time: "1 hour ago" },
        { author: "Rahul Kushwaha", msg: "Updated core dashboard layout, icons and custom scroll bars.", time: "3 hours ago" },
        { author: "Amit Patel", msg: "Pushed prototype figma slides export and assets.", time: "5 hours ago" }
      ],
      announcements: [
        { id: "an1", author: "Rahul Kushwaha", title: "🎯 Mock Pitch at 4 PM Today", text: "Please gather in the video room. Bring your slides draft.", date: "Today, 11:30 AM" },
        { id: "an2", author: "Sneha Nair", title: "🧪 AI Inference Accuracy Benchmark", text: "Successfully hit 94.2% precision on datasets. Core weights pushed to repo.", date: "Yesterday" }
      ],
      achievements: [
        { title: "First Commit", desc: "Successfully linked GitHub repo with Hack Workspace.", unlocked: true },
        { title: "Milestone 1 Met", desc: "Core API endpoints live and fully checked.", unlocked: true },
        { title: "High Fidelity Design", desc: "Figma layouts compiled and verified.", unlocked: true },
        { title: "Prototype Ready", desc: "Completed SDE product flow pipeline.", unlocked: false }
      ],
      files: [
        { name: "Imagine_Cup_PitchDeck_v2.pdf", size: "4.8 MB", author: "Rahul K." },
        { name: "System_Architecture_Imagine.png", size: "1.2 MB", author: "Priya S." },
        { name: "API_Endpoints_Definition.md", size: "32 KB", author: "Priya S." }
      ],
      tasks: [
        { id: "t1", title: "Figma Slides Polish", desc: "Add core visual highlights and slide structure.", column: "todo", assignee: "Amit Patel" },
        { id: "t2", title: "API Swagger Docs", desc: "Write endpoints definition file for developers.", column: "progress", assignee: "Priya Sharma" },
        { id: "t3", title: "AI Model Deploy", desc: "Containerize weight scripts using Docker.", column: "review", assignee: "Sneha Nair" },
        { id: "t4", title: "Dashboard Responsive Shell", desc: "Make grid components look clean on tablets.", column: "done", assignee: "Rahul Kushwaha" }
      ],
      voiceCallActive: false,
      voiceMuted: false,
      videoActive: false
    }
  ]);

  // Premium Create Squad Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSquadName, setNewSquadName] = useState("");
  const [newHackathonName, setNewHackathonName] = useState("");
  const [newSquadDesc, setNewSquadDesc] = useState("");
  const [newRequiredSkills, setNewRequiredSkills] = useState("");
  const [newTeamSize, setNewTeamSize] = useState("4");
  
  // Date, Time and Duration input states
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("12:00");
  const [eventDuration, setEventDuration] = useState("24");
  
  // Add Member list input states
  const [memberInputId, setMemberInputId] = useState("");
  const [memberIdsList, setMemberIdsList] = useState([]);

  // Delete squad confirm states
  const [squadToDelete, setSquadToDelete] = useState(null);

  // Active general tick timer to trigger countdown updates
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [speakingStates, setSpeakingStates] = useState({});
  // Simulated voice channel speaking indications
  useEffect(() => {
    const timer = setInterval(() => {
      setSpeakingStates(prev => {
        const next = {};
        premiumSquads.forEach(sq => {
          sq.members.forEach(m => {
            if (m.id !== "u1") {
              next[m.id] = Math.random() > 0.6;
            } else {
              next[m.id] = false;
            }
          });
        });
        return next;
      });
    }, 2800);
    return () => clearInterval(timer);
  }, [premiumSquads]);

  // Simulated invite acceptance flow timer
  useEffect(() => {
    const hasPending = premiumSquads.some(sq => sq.pendingInvites && sq.pendingInvites.length > 0);
    if (!hasPending) return;

    const timer = setTimeout(() => {
      // Find first squad with a pending invite
      const targetSquad = premiumSquads.find(sq => sq.pendingInvites && sq.pendingInvites.length > 0);
      if (!targetSquad) return;

      const acceptedId = targetSquad.pendingInvites[0];
      const newMember = {
        id: `u_${Date.now()}`,
        name: `Invited Member (${acceptedId})`,
        role: "Tactical Research Specialist",
        avatar: Math.random() > 0.5 ? "👩‍💻" : "👨‍💻",
        availability: "15h/week",
        github: acceptedId.toLowerCase().replace(/[^a-z0-9]/g, ""),
        rating: 4.8,
        score: 65
      };

      setPremiumSquads(prev => prev.map(sq => {
        if (sq.id === targetSquad.id) {
          const updatedInvites = sq.pendingInvites.filter(id => id !== acceptedId);
          const updatedMembers = [...sq.members, newMember];
          const newAnn = {
            id: `an_${Date.now()}`,
            author: "System Bot",
            title: `🎉 User ${acceptedId} Connected!`,
            text: `Unique ID ${acceptedId} accepted request. Added to roster.`,
            date: "Just now"
          };
          const newCommit = {
            author: newMember.name,
            msg: `Linked environment workspace branch for ${acceptedId}.`,
            time: "Just now"
          };
          return {
            ...sq,
            members: updatedMembers,
            pendingInvites: updatedInvites,
            announcements: [newAnn, ...sq.announcements],
            gitLog: [newCommit, ...sq.gitLog]
          };
        }
        return sq;
      }));

      alert(`🔔 Acceptance: User ID "${acceptedId}" has accepted your Hack Squad invitation and joined the team!`);
    }, 5000);

    return () => clearTimeout(timer);
  }, [premiumSquads]);
  const formatSecondsToHMS = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Add Task to Board handler
  const [taskInput, setTaskInput] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("Rahul Kushwaha");
  
  const handleAddTaskForSquad = (squadId, title, assignee) => {
    if (!title.trim()) return;
    const newTask = {
      id: `t_${Date.now()}`,
      title: title.trim(),
      desc: "Custom project task added by squad member.",
      column: "todo",
      assignee
    };
    setPremiumSquads(prev => prev.map(sq => {
      if (sq.id === squadId) {
        return {
          ...sq,
          tasks: [...sq.tasks, newTask]
        };
      }
      return sq;
    }));
  };

  // Move Task Column
  const handleMoveTaskForSquad = (squadId, taskId, newCol) => {
    setPremiumSquads(prev => prev.map(sq => {
      if (sq.id === squadId) {
        return {
          ...sq,
          tasks: sq.tasks.map(t => t.id === taskId ? { ...t, column: newCol } : t)
        };
      }
      return sq;
    }));
  };

  // Dispatch public join request handler
  const handleApplySubmit = (e) => {
    e.preventDefault();
    alert(`Application submitted to ${applySquad.name}! ${applySquad.leader.name} has been notified via their placement dashboard.`);
    setShowApplyModal(false);
    setApplySquad(null);
    setApplyPitch("");
  };

  // Premium creation dispatch handler
  const handleCreateSquad = (e) => {
    e.preventDefault();
    if (!newSquadName || !newHackathonName) return;

    // Calculate countdown from target event date and duration
    let targetTime = Date.now() + 86400 * 1000 * 3; // 72 hours default
    if (eventDate) {
      const dtStr = `${eventDate}T${eventTime || "12:00"}`;
      const dt = new Date(dtStr);
      if (!isNaN(dt.getTime())) {
        targetTime = dt.getTime() + (parseFloat(eventDuration || "24") * 3600 * 1000);
      }
    }

    const newSquad = {
      id: `sq_${Date.now()}`,
      name: newSquadName,
      hackathon: newHackathonName,
      status: "Active Team Workspace",
      targetTime: targetTime,
      leader: "Rahul Kushwaha (You)",
      members: [
        { id: "u1", name: "Rahul Kushwaha (You)", role: "Frontend Architect & Presentation", avatar: "👨‍💻", availability: "20h/week", github: "rahul-kushwaha", rating: 4.9, score: 92 }
      ],
      pendingInvites: [...memberIdsList],
      gitLog: [
        { author: "Rahul Kushwaha", msg: "Initialized squad project workspace repository.", time: "Just now" }
      ],
      announcements: [
        { id: `an_${Date.now()}`, author: "Rahul Kushwaha", title: "🚀 Workspace Launched!", text: `Welcome to the private workspace for ${newSquadName}. Let's build!`, date: "Just now" }
      ],
      achievements: [
        { title: "First Commit", desc: "Successfully linked GitHub repo with Hack Workspace.", unlocked: true },
        { title: "Milestone 1 Met", desc: "Core API endpoints live and fully checked.", unlocked: false }
      ],
      files: [],
      tasks: [
        { id: `t_${Date.now()}_1`, title: "Project Brainstorming", desc: "Align on tech stack and feature checklists.", column: "todo", assignee: "Rahul Kushwaha" }
      ],
      voiceCallActive: false,
      voiceMuted: false,
      videoActive: false
    };

    setPremiumSquads(prev => [newSquad, ...prev]);
    setShowCreateModal(false);
    alert(`Tactical Hack Squad "${newSquadName}" deployed successfully! Invitation requests have been dispatched to: ${memberIdsList.join(", ") || "none"}.`);
    
    setNewSquadName("");
    setNewHackathonName("");
    setNewSquadDesc("");
    setMemberIdsList([]);
    setMemberInputId("");
  };

  const handleAddMemberId = () => {
    if (!memberInputId.trim()) return;
    const cleanId = memberInputId.trim().toUpperCase();
    if (memberIdsList.includes(cleanId)) {
      alert("This User ID has already been added to the invite queue.");
      return;
    }
    setMemberIdsList(prev => [...prev, cleanId]);
    setMemberInputId("");
  };

  const handleRemoveMemberId = (uid) => {
    setMemberIdsList(prev => prev.filter(id => id !== uid));
  };

  const confirmDeleteSquad = () => {
    if (!squadToDelete) return;
    setPremiumSquads(prev => prev.filter(sq => sq.id !== squadToDelete.id));
    alert(`Squad "${squadToDelete.name}" has been deleted.`);
    setSquadToDelete(null);
  };

  const handleOpenCreateModal = () => {
    setNewSquadName("");
    setNewHackathonName("");
    setNewSquadDesc("");
    setNewRequiredSkills("");
    setEventDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    setEventTime("12:00");
    setEventDuration("24");
    setMemberInputId("");
    setMemberIdsList([]);
    setShowCreateModal(true);
  };

  // Filter public listing
  const filteredSquads = squadsList.filter(sq => {
    if (filterDomain !== "all" && sq.domain !== filterDomain) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        sq.name.toLowerCase().includes(q) ||
        sq.hackathon.toLowerCase().includes(q) ||
        sq.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={(tab) => {
      setActiveTab(tab);
      if (tab === "dashboard") navigate("/dashboard");
      if (tab === "roadmap") navigate("/roadmap");
      if (tab === "challenges") navigate("/challenges");
      if (tab === "memory-lane") navigate("/memory-lane");
      if (tab === "progress") navigate("/progress");
      if (tab === "mentorship") navigate("/mentorship");
      if (tab === "project-collab") navigate("/project-collab");
      if (tab === "alumni-network") navigate("/alumni-network");
      if (tab === "technews") navigate("/technews");
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 60 }}>
        
        {/* DEV MODE PLAN BANNER */}
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
              Toggle Hack Squad Portal Plan
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
          </div>
        </div>

        {/* HERO HEADER TITLE */}
        <div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
            Hack <span style={{ background: "linear-gradient(90deg, #6c63ff, #00c9a7, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Squad Spaces</span>
          </h2>
          <p style={{ margin: "4px 0 0", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.5 }}>
            Form tactical teams, synchronize GitHub workflows, coordinate sprint plans, and construct prototypes in unified spaces.
          </p>
        </div>

        {devPlan === "free" ? (
          /* =========================================================================
             FREE VERSION: BROWSE PUBLIC HACK SQUADS & JOIN PIPELINES
             ========================================================================= */
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            
            {/* Header search controls */}
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
                  placeholder="Search squads by hackathon name, tech stack tags..."
                  style={{
                    width: "100%", padding: "9px 14px 9px 38px", borderRadius: 10,
                    background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                    color: "var(--text-main)", outline: "none", fontFamily: "'Outfit', sans-serif", fontSize: 13.5
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <SlidersHorizontal size={14} color="var(--text-muted)" />
                <select
                  value={filterDomain}
                  onChange={e => setFilterDomain(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: 8, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 12.5, fontWeight: 700, outline: "none" }}
                >
                  <option value="all">🌐 All Domains</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="IoT & Smart Cities">IoT & Smart Cities</option>
                  <option value="Web3 & Blockchain">Web3 & Blockchain</option>
                  <option value="Bio-Tech Research">Bio-Tech Research</option>
                </select>

                <button
                  disabled
                  style={{
                    padding: "8px 16px", borderRadius: 10, border: "none",
                    background: "var(--border-light)", color: "var(--text-muted)",
                    fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 900,
                    display: "flex", alignItems: "center", gap: 6, cursor: "default"
                  }}
                >
                  <Lock size={12} />
                  <span>Create Squad</span>
                </button>
              </div>
            </div>

            {/* Public Squads Grid List */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
              {filteredSquads.map(sq => (
                <motion.div
                  key={sq.id}
                  whileHover={{ y: -6 }}
                  style={{
                    background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
                    borderRadius: 24, padding: 22, display: "flex", flexDirection: "column",
                    justifyContent: "space-between", gap: 18, boxShadow: "0 4px 18px rgba(0,0,0,0.015)"
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontFamily: "'Fira Code', monospace", fontWeight: 800, color: "#6c63ff", background: "rgba(108,99,255,0.08)", padding: "4px 8px", borderRadius: 6 }}>
                        {sq.domain.toUpperCase()}
                      </span>
                      <span style={{ fontSize: 13, fontFamily: "'Fira Code', monospace", fontWeight: 800, color: "#ec4899", display: "flex", alignItems: "center", gap: 4 }}>
                        <Clock size={11} /> {sq.timeLeft}
                      </span>
                    </div>

                    <h3 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 900, color: "var(--text-main)" }}>
                      {sq.name}
                    </h3>
                    
                    <span style={{ fontSize: 14.5, color: "var(--text-muted)" }}>
                      🏆 Hackathon: <strong>{sq.hackathon}</strong>
                    </span>

                    <p style={{ margin: "4px 0", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.45 }}>
                      {sq.desc}
                    </p>

                    {/* Team Members Roster preview */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "6px 0" }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-main)" }}>Current Members ({sq.teamSize}/{sq.maxSize}):</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {sq.members.map((m, idx) => (
                          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 8px", borderRadius: 8, background: "var(--bg-alt)", border: "1px solid var(--border-light)", fontSize: 13.5, color: "var(--text-main)", fontWeight: 700 }}>
                            <span>{m.avatar}</span>
                            <span>{m.name} ({m.role})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Open positions warnings */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#00c9a7" }}>Seeking Positions:</div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {sq.openPositions.map((pos, idx) => (
                          <span key={idx} style={{ fontSize: 13, fontWeight: 800, background: "rgba(0,201,167,0.06)", border: "1px dashed rgba(0,201,167,0.3)", color: "#00c9a7", padding: "3px 6px", borderRadius: 6 }}>
                            🚀 {pos}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Core Card Buttons */}
                  <div style={{ display: "flex", gap: 8, borderTop: "1px solid var(--border-light)", paddingTop: 14 }}>
                    <button
                      onClick={() => setSelectedPublicSquad(sq)}
                      style={{
                        flex: 1, padding: "10px", borderRadius: 10, border: "1.5px solid var(--border-light)",
                        background: "var(--bg-alt)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif",
                        fontSize: 15, fontWeight: 800, cursor: "pointer", transition: "all 0.2s"
                      }}
                    >
                      Inspect Team
                    </button>
                    <button
                      onClick={() => {
                        setApplySquad(sq);
                        setApplyRole(sq.openPositions[0] || "General Collaborator");
                        setApplyPitch("");
                        setShowApplyModal(true);
                      }}
                      style={{
                        flex: 1.4, padding: "10px", borderRadius: 10, border: "none",
                        background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#ffffff",
                        fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 900, cursor: "pointer"
                      }}
                    >
                      Apply to Join Squad
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Premium upsell box */}
            <div style={{
              background: "linear-gradient(135deg, rgba(108,99,255,0.06), rgba(0,201,167,0.06))",
              borderRadius: 24, border: "1.5px solid rgba(108,99,255,0.2)", padding: 24,
              display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 16, marginTop: 12
            }}>
              <div>
                <h4 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 17.5, fontWeight: 900, color: "var(--text-main)" }}>
                  Want to Launch Your Own Custom Tactical Hack Squad?
                </h4>
                <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "var(--text-muted)" }}>
                  Upgrade to PathEd Premium to unlock unlimited squad creation, private voice channels, task planners, and GitHub synchronization.
                </p>
              </div>
              <button
                onClick={() => navigate("/store")}
                style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#ffffff", fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 900, cursor: "pointer" }}
              >
                Go Premium Store
              </button>
            </div>

          </div>
        ) : (
          /* =========================================================================
             PREMIUM VERSION: PRIVATE WORKSPACE SQUAD DASHBOARD LIST
             ========================================================================= */
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            
            {/* FULL ROW: Create Squad Button */}
            <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
              <button
                onClick={handleOpenCreateModal}
                style={{
                  padding: "12px 24px", borderRadius: 12, border: "none",
                  background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#ffffff",
                  fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 900, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  boxShadow: "0 4px 15px rgba(108,99,255,0.25)", transition: "all 0.2s"
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
              >
                <Plus size={16} />
                <span>Create Squad</span>
              </button>
            </div>

            {premiumSquads.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center", background: "var(--bg-card)", border: "1.5px dashed var(--border-light)", borderRadius: 24 }}>
                <span style={{ fontSize: 44 }}>⚔️</span>
                <h4 style={{ margin: "14px 0 6px", fontFamily: "'Outfit', sans-serif", fontSize: 18, color: "var(--text-main)", fontWeight: 900 }}>No Active Tactical Squads</h4>
                <p style={{ margin: 0, fontSize: 14, color: "var(--text-muted)" }}>Click the "Create Squad" button above to deploy your workspace.</p>
              </div>
            ) : (
              premiumSquads.map(sq => {
                const countdownTime = Math.max(0, Math.floor((sq.targetTime - Date.now()) / 1000));
                
                return (
                  <div key={sq.id} style={{ display: "flex", flexDirection: "column", gap: 24, borderBottom: "2px solid var(--border-light)", paddingBottom: 32, marginBottom: 16 }}>
                    
                    {/* Squad Header Banner Card */}
                    <div style={{
                      background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
                      borderRadius: 24, padding: "22px 26px", display: "flex", flexWrap: "wrap",
                      justifyContent: "space-between", alignItems: "center", gap: 16
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(0,201,167,0.1)", color: "#00c9a7", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Users size={22} />
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 900, color: "var(--text-main)" }}>
                            Squad Workspace: {sq.name}
                          </h3>
                          <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                            🏆 Competing in: <strong style={{ fontWeight: 800 }}>{sq.hackathon}</strong>
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        {/* Live Countdown Timer */}
                        <div style={{
                          background: "rgba(236,72,153,0.06)", border: "1px solid rgba(236,72,153,0.25)",
                          padding: "8px 14px", borderRadius: 10, display: "flex", alignItems: "center", gap: 8
                        }}>
                          <Radio size={14} className="pulse-icon" color="#ec4899" />
                          <span style={{ fontSize: 13, fontFamily: "'Fira Code', monospace", fontWeight: 900, color: "#ec4899" }}>
                            SUBMISSION IN {formatSecondsToHMS(countdownTime)}
                          </span>
                        </div>

                        {/* Red Delete button */}
                        <button
                          onClick={() => setSquadToDelete(sq)}
                          style={{
                            padding: "10px 16px", borderRadius: 10, border: "none",
                            background: "#ef4444", color: "#ffffff",
                            fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 900,
                            display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#dc2626"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "#ef4444"; }}
                        >
                          <Trash size={15} />
                          <span>Delete Squad</span>
                        </button>
                      </div>
                    </div>

                    {/* Split Screen Workspace Area */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr", gap: 24 }}>
                      
                      {/* LEFT Workspace Column: Voice Sync + Team Roster */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        
                        {/* Voice Sync Workspace Panel */}
                        <div style={{
                          background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
                          borderRadius: 24, padding: 22, display: "flex", flexDirection: "column", gap: 14
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-light)", paddingBottom: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <Radio size={14} color={sq.voiceCallActive ? "#00c9a7" : "var(--text-muted)"} />
                              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16.5, fontWeight: 900, color: "var(--text-main)" }}>
                                Private Voice Channel
                              </span>
                            </div>
                            <span style={{ fontSize: 13.5, fontWeight: 800, color: sq.voiceCallActive ? "#00c9a7" : "var(--text-muted)", background: sq.voiceCallActive ? "rgba(0,201,167,0.08)" : "rgba(0,0,0,0.05)", padding: "2px 6px", borderRadius: 4 }}>
                              {sq.voiceCallActive ? "CONNECTED" : "OFFLINE"}
                            </span>
                          </div>

                          {!sq.voiceCallActive ? (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 18px", background: "var(--bg-alt)", borderRadius: 16, border: "1.5px dashed var(--border-light)", gap: 12 }}>
                              <span style={{ fontSize: 28 }}>📞</span>
                              <div style={{ textAlign: "center" }}>
                                <h5 style={{ margin: 0, fontSize: 14.5, color: "var(--text-main)", fontWeight: 800 }}>Voice Room Offline</h5>
                                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>Sprint voice sync room is currently disconnected.</p>
                              </div>
                              <button
                                onClick={() => {
                                  setPremiumSquads(prev => prev.map(item => item.id === sq.id ? { ...item, voiceCallActive: true } : item));
                                }}
                                style={{
                                  padding: "8px 18px", borderRadius: 8, border: "none",
                                  background: "#00c9a7", color: "#fff", fontWeight: 800, fontSize: 13,
                                  cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 12px rgba(0,201,167,0.2)"
                                }}
                              >
                                <Radio size={12} color="#fff" />
                                <span>Start Voice Call</span>
                              </button>
                            </div>
                          ) : (
                            <>
                              {/* Audio Indicators Grid */}
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                                {sq.members.map(m => (
                                  <div 
                                    key={m.id} 
                                    style={{
                                      padding: 10, borderRadius: 12, background: "var(--bg-alt)",
                                      border: speakingStates[m.id] ? "1.5px solid #00c9a7" : "1.5px solid var(--border-light)",
                                      display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s"
                                    }}
                                  >
                                    <span style={{ fontSize: 14 }}>{m.avatar}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <span style={{ display: "block", fontSize: 14, fontWeight: 800, color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {m.name.replace(" (You)", "")}
                                      </span>
                                      <span style={{ fontSize: 11.5, color: speakingStates[m.id] ? "#00c9a7" : "var(--text-muted)", fontWeight: 700 }}>
                                        {speakingStates[m.id] ? "🎙️ Speaking..." : "Muted"}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Controller buttons */}
                              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                                <button
                                  onClick={() => {
                                    setPremiumSquads(prev => prev.map(item => item.id === sq.id ? { ...item, voiceMuted: !item.voiceMuted } : item));
                                  }}
                                  style={{
                                    flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-light)",
                                    background: sq.voiceMuted ? "rgba(239,68,68,0.08)" : "var(--bg-alt)",
                                    color: sq.voiceMuted ? "#ec4899" : "var(--text-main)",
                                    fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 800,
                                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                                  }}
                                >
                                  {sq.voiceMuted ? <MicOff size={13} /> : <Mic size={13} />}
                                  <span>{sq.voiceMuted ? "Unmute" : "Mute"}</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setPremiumSquads(prev => prev.map(item => item.id === sq.id ? { ...item, videoActive: !item.videoActive } : item));
                                  }}
                                  style={{
                                    flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border-light)",
                                    background: sq.videoActive ? "rgba(0,201,167,0.08)" : "var(--bg-alt)",
                                    color: sq.videoActive ? "#00c9a7" : "var(--text-main)",
                                    fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 800,
                                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                                  }}
                                >
                                  {sq.videoActive ? <Video size={13} /> : <VideoOff size={13} />}
                                  <span>{sq.videoActive ? "Video" : "Camera"}</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setPremiumSquads(prev => prev.map(item => item.id === sq.id ? { ...item, voiceCallActive: false } : item));
                                  }}
                                  style={{
                                    flex: 1.2, padding: "8px 12px", borderRadius: 8, border: "none",
                                    background: "#ef4444", color: "#ffffff",
                                    fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 900,
                                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                                    transition: "all 0.2s"
                                  }}
                                  onMouseEnter={e => { e.currentTarget.style.background = "#dc2626"; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = "#ef4444"; }}
                                >
                                  <PhoneOff size={13} />
                                  <span>End Call</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Team Roster List with past projects & GitHub references */}
                        <div style={{
                          background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
                          borderRadius: 24, padding: 22, display: "flex", flexDirection: "column", gap: 14
                        }}>
                          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16.5, fontWeight: 900, color: "var(--text-main)" }}>
                            Squad Teammates ({sq.members.length + (sq.pendingInvites ? sq.pendingInvites.length : 0)})
                          </span>

                          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {sq.members.map(m => (
                              <div key={m.id} style={{ display: "flex", gap: 10, paddingBottom: 10, borderBottom: "1px solid var(--border-light)" }}>
                                <div style={{ fontSize: 26 }}>{m.avatar}</div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: 14.5, fontWeight: 800, color: "var(--text-main)" }}>{m.name}</span>
                                    <span style={{ fontSize: 12.5, fontWeight: 800, color: "#6c63ff" }}>Rating: {m.rating}★</span>
                                  </div>
                                  <span style={{ display: "block", fontSize: 13, color: "var(--text-muted)", fontWeight: 700 }}>
                                    Role: {m.role}
                                  </span>
                                  <span style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                                    🛠️ Git: <code>{m.github}</code> • Contribution: {m.score}XP
                                  </span>
                                </div>
                              </div>
                            ))}

                            {/* Pending invites listed inside the teammates roster */}
                            {sq.pendingInvites && sq.pendingInvites.map(uid => (
                              <div key={uid} style={{ display: "flex", gap: 10, paddingBottom: 10, borderBottom: "1px solid var(--border-light)", opacity: 0.8 }}>
                                <div style={{ fontSize: 26 }}>⏳</div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: 14.5, fontWeight: 800, color: "var(--text-muted)" }}>Invite: {uid}</span>
                                    <span style={{ fontSize: 11, fontWeight: 800, color: "#f59e0b", background: "rgba(245,158,11,0.08)", padding: "2px 6px", borderRadius: 4 }}>PENDING...</span>
                                  </div>
                                  <span style={{ display: "block", fontSize: 13, color: "var(--text-muted)" }}>
                                    Waiting for requested user to accept the join request
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Shared Files Repository */}
                        <div style={{
                          background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
                          borderRadius: 24, padding: 22, display: "flex", flexDirection: "column", gap: 14
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16.5, fontWeight: 900, color: "var(--text-main)" }}>
                              Shared Team Files
                            </span>
                            <button style={{ border: "none", background: "transparent", color: "#6c63ff", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
                              + Upload
                            </button>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {sq.files && sq.files.length > 0 ? (
                              sq.files.map((file, idx) => (
                                <div 
                                  key={idx} 
                                  style={{
                                    padding: 10, borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                                    display: "flex", justifyContent: "space-between", alignItems: "center"
                                  }}
                                >
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
                                    <FolderOpen size={14} color="#6c63ff" />
                                    <div style={{ minWidth: 0 }}>
                                      <span style={{ display: "block", fontSize: 13.5, fontWeight: 800, color: "var(--text-main)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {file.name}
                                      </span>
                                      <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{file.size} • by {file.author}</span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <span style={{ fontSize: 12.5, color: "var(--text-muted)", fontStyle: "italic" }}>No shared files yet.</span>
                            )}
                          </div>
                        </div>

                      </div>

                      {/* RIGHT Workspace Column: Tasks Board + Git Log + Announcements */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                        
                        {/* Sprint Kanban Board */}
                        <div style={{
                          background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
                          borderRadius: 24, padding: 22, display: "flex", flexDirection: "column", gap: 14
                        }}>
                          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 900, color: "var(--text-main)" }}>
                            Sprint Task Planner
                          </span>

                          {/* Add task simple inline form using form-data to decouple squad state */}
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              const fd = new FormData(e.target);
                              const title = fd.get("taskTitle");
                              const assignee = fd.get("taskAssignee");
                              if (!title || !title.trim()) return;
                              handleAddTaskForSquad(sq.id, title, assignee);
                              e.target.reset();
                            }} 
                            style={{ display: "flex", gap: 8 }}
                          >
                            <input
                              name="taskTitle"
                              type="text"
                              required
                              placeholder="Add squad sprint task..."
                              style={{
                                flex: 1, padding: "8px 12px", borderRadius: 8, background: "var(--bg-alt)",
                                border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", fontSize: 13.5
                              }}
                            />
                            <select
                              name="taskAssignee"
                              defaultValue={sq.members[0]?.name || "Rahul Kushwaha"}
                              style={{ padding: "8px 10px", borderRadius: 8, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", fontSize: 12.5, fontWeight: 700 }}
                            >
                              {sq.members.map(m => (
                                <option key={m.id} value={m.name}>{m.name.replace(" (You)", "")}</option>
                              ))}
                            </select>
                            <button type="submit" style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#6c63ff", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}>
                              <Plus size={14} />
                            </button>
                          </form>

                          {/* Kanban Columns Grid */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }}>
                            {/* Column 1: To Do */}
                            <div style={{ padding: 10, borderRadius: 14, background: "var(--bg-alt)", minHeight: 180, display: "flex", flexDirection: "column", gap: 8 }}>
                              <div style={{ fontSize: 13, fontWeight: 900, color: "var(--text-muted)", textAlign: "center" }}>TO DO</div>
                              {sq.tasks.filter(t => t.column === "todo").map(t => (
                                <div key={t.id} style={{ padding: 8, borderRadius: 8, background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                                  <span style={{ display: "block", fontSize: 13.5, fontWeight: 800, color: "var(--text-main)" }}>{t.title}</span>
                                  <span style={{ display: "block", fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>👤 {t.assignee}</span>
                                  <button onClick={() => handleMoveTaskForSquad(sq.id, t.id, "progress")} style={{ width: "100%", padding: "2px", border: "none", background: "#6c63ff15", color: "#6c63ff", borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: 800, marginTop: 6 }}>
                                    Start →
                                  </button>
                                </div>
                              ))}
                            </div>

                            {/* Column 2: In Progress */}
                            <div style={{ padding: 10, borderRadius: 14, background: "var(--bg-alt)", minHeight: 180, display: "flex", flexDirection: "column", gap: 8 }}>
                              <div style={{ fontSize: 13, fontWeight: 900, color: "#f59e0b", textAlign: "center" }}>PROGRESS</div>
                              {sq.tasks.filter(t => t.column === "progress").map(t => (
                                <div key={t.id} style={{ padding: 8, borderRadius: 8, background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                                  <span style={{ display: "block", fontSize: 13.5, fontWeight: 800, color: "var(--text-main)" }}>{t.title}</span>
                                  <span style={{ display: "block", fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>👤 {t.assignee}</span>
                                  <button onClick={() => handleMoveTaskForSquad(sq.id, t.id, "review")} style={{ width: "100%", padding: "2px", border: "none", background: "#f59e0b15", color: "#f59e0b", borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: 800, marginTop: 6 }}>
                                    Review →
                                  </button>
                                </div>
                              ))}
                            </div>

                            {/* Column 3: In Review */}
                            <div style={{ padding: 10, borderRadius: 14, background: "var(--bg-alt)", minHeight: 180, display: "flex", flexDirection: "column", gap: 8 }}>
                              <div style={{ fontSize: 13, fontWeight: 900, color: "#6c63ff", textAlign: "center" }}>REVIEW</div>
                              {sq.tasks.filter(t => t.column === "review").map(t => (
                                <div key={t.id} style={{ padding: 8, borderRadius: 8, background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
                                  <span style={{ display: "block", fontSize: 13.5, fontWeight: 800, color: "var(--text-main)" }}>{t.title}</span>
                                  <span style={{ display: "block", fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>👤 {t.assignee}</span>
                                  <button onClick={() => handleMoveTaskForSquad(sq.id, t.id, "done")} style={{ width: "100%", padding: "2px", border: "none", background: "#6c63ff15", color: "#6c63ff", borderRadius: 4, cursor: "pointer", fontSize: 11, fontWeight: 800, marginTop: 6 }}>
                                    Approve →
                                  </button>
                                </div>
                              ))}
                            </div>

                            {/* Column 4: Done */}
                            <div style={{ padding: 10, borderRadius: 14, background: "var(--bg-alt)", minHeight: 180, display: "flex", flexDirection: "column", gap: 8 }}>
                              <div style={{ fontSize: 13, fontWeight: 900, color: "#00c9a7", textAlign: "center" }}>DONE</div>
                              {sq.tasks.filter(t => t.column === "done").map(t => (
                                <div key={t.id} style={{ padding: 8, borderRadius: 8, background: "var(--bg-card)", border: "1px solid var(--border-light)", opacity: 0.85 }}>
                                  <span style={{ display: "block", fontSize: 13.5, fontWeight: 800, color: "var(--text-main)", textDecoration: "line-through" }}>{t.title}</span>
                                  <span style={{ display: "block", fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>👤 {t.assignee}</span>
                                  <span style={{ display: "block", fontSize: 10.5, color: "#00c9a7", fontWeight: 800, textAlign: "center", marginTop: 6 }}>✓ Verified</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* GitHub Sync Logs */}
                        <div style={{
                          background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
                          borderRadius: 24, padding: 22, display: "flex", flexDirection: "column", gap: 14
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Github size={16} color="var(--text-main)" />
                            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16.5, fontWeight: 900, color: "var(--text-main)" }}>
                              GitHub Repository Commit Feed
                            </span>
                          </div>

                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {sq.gitLog && sq.gitLog.length > 0 ? (
                              sq.gitLog.map((log, idx) => (
                                <div key={idx} style={{ display: "flex", gap: 10, paddingBottom: 8, borderBottom: "1px solid var(--border-light)" }}>
                                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6c63ff", marginTop: 5 }} />
                                  <div style={{ flex: 1 }}>
                                    <span style={{ fontSize: 13.5, color: "var(--text-main)", fontWeight: 800 }}>{log.author}</span>
                                    <span style={{ fontSize: 14, color: "var(--text-muted)", display: "block", marginTop: 2 }}>
                                      <code>{log.msg}</code>
                                    </span>
                                    <span style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginTop: 2 }}>
                                      🕒 {log.time}
                                    </span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <span style={{ fontSize: 12.5, color: "var(--text-muted)", fontStyle: "italic" }}>No GitHub commits synced yet.</span>
                            )}
                          </div>
                        </div>

                        {/* Team Announcements */}
                        <div style={{
                          background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
                          borderRadius: 24, padding: 22, display: "flex", flexDirection: "column", gap: 14
                        }}>
                          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16.5, fontWeight: 900, color: "var(--text-main)" }}>
                            Team Announcements
                          </span>

                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {sq.announcements && sq.announcements.length > 0 ? (
                              sq.announcements.map(an => (
                                <div key={an.id} style={{ padding: 12, borderRadius: 12, background: "var(--bg-alt)", border: "1px solid var(--border-light)" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontSize: 14, fontWeight: 900, color: "#6c63ff" }}>{an.title}</span>
                                    <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{an.date}</span>
                                  </div>
                                  <p style={{ margin: "4px 0 0", fontSize: 14.5, color: "var(--text-muted)", lineHeight: 1.45 }}>
                                    {an.text}
                                  </p>
                                  <span style={{ display: "block", fontSize: 11.5, color: "var(--text-muted)", marginTop: 4, textAlign: "right" }}>
                                    Posted by {an.author}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span style={{ fontSize: 12.5, color: "var(--text-muted)", fontStyle: "italic" }}>No team announcements.</span>
                            )}
                          </div>
                        </div>

                      </div>

                    </div>

                  </div>
                );
              })
            )}

          </div>
        )}

        {/* =========================================================================
           GLOBAL MODAL: DETAILED PUBLIC SQUAD INSPEC PANEL
           ========================================================================= */}
        <AnimatePresence>
          {selectedPublicSquad && (
            <div 
              onClick={e => { if (e.target === e.currentTarget) setSelectedPublicSquad(null); }}
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
                  background: "var(--bg-card)", borderRadius: 24, maxWidth: 640, width: "100%",
                  border: "1.5px solid var(--border-light)", boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
                  overflow: "hidden", display: "flex", flexDirection: "column", position: "relative"
                }}
              >
                <div style={{ padding: "20px 24px", borderBottom: "1.5px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900, color: "var(--text-main)" }}>
                    Squad Profile - {selectedPublicSquad.name}
                  </h4>
                  <button onClick={() => setSelectedPublicSquad(null)} style={{ position: "absolute", right: 20, top: 20, width: 32, height: 32, borderRadius: 10, border: "none", background: "var(--bg-alt)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-main)" }}>
                    ×
                  </button>
                </div>

                <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
                  
                  {/* General info */}
                  <div>
                    <span style={{ fontSize: 11, fontFamily: "'Fira Code', monospace", color: "#6c63ff", fontWeight: 800 }}>TARGET COMPETITION</span>
                    <h5 style={{ margin: "2px 0 0", fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 900, color: "var(--text-main)" }}>
                      {selectedPublicSquad.hackathon}
                    </h5>
                    <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.5, marginTop: 8 }}>
                      {selectedPublicSquad.desc}
                    </p>
                  </div>

                  {/* Teammates listings */}
                  <div>
                    <span style={{ fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", fontWeight: 800 }}>SQUAD ROSTER & PROFILES</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                      {selectedPublicSquad.members.map((m, idx) => (
                        <div key={idx} style={{ display: "flex", gap: 10, padding: 12, borderRadius: 12, background: "var(--bg-alt)", border: "1px solid var(--border-light)" }}>
                          <span style={{ fontSize: 22 }}>{m.avatar}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-main)" }}>{m.name}</span>
                              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Github: <code>{m.github}</code></span>
                            </div>
                            <span style={{ fontSize: 11, color: "#6c63ff", fontWeight: 700 }}>Role: {m.role}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Close actions */}
                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <button 
                      onClick={() => setSelectedPublicSquad(null)}
                      style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid var(--border-light)", background: "var(--bg-alt)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, cursor: "pointer" }}
                    >
                      Close Profile
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedPublicSquad(null);
                        setApplySquad(selectedPublicSquad);
                        setApplyRole(selectedPublicSquad.openPositions[0] || "General Collaborator");
                        setApplyPitch("");
                        setShowApplyModal(true);
                      }}
                      style={{ flex: 1.5, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900, cursor: "pointer" }}
                    >
                      Request Squad Admission
                    </button>
                  </div>

                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* =========================================================================
           GLOBAL MODAL: JOIN SQUAD APPLICATION DIALOG
           ========================================================================= */}
        <AnimatePresence>
          {showApplyModal && applySquad && (
            <div 
              onClick={e => { if (e.target === e.currentTarget) setShowApplyModal(false); }}
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
                    Apply to Join: {applySquad.name}
                  </h4>
                  <button onClick={() => setShowApplyModal(false)} style={{ position: "absolute", right: 20, top: 20, width: 32, height: 32, borderRadius: 10, border: "none", background: "var(--bg-alt)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-main)" }}>
                    ×
                  </button>
                </div>

                <form onSubmit={handleApplySubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                  
                  <div>
                    <label style={{ display: "block", fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", marginBottom: 6 }}>TARGET POSITION</label>
                    <select
                      value={applyRole}
                      onChange={e => setApplyRole(e.target.value)}
                      style={{ width: "100%", padding: "10px", borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", fontFamily: "'Outfit', sans-serif", fontSize: 13.5 }}
                    >
                      {applySquad.openPositions.map((pos, idx) => (
                        <option key={idx} value={pos}>{pos}</option>
                      ))}
                      <option value="General Collaborator">General Collaborator</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", marginBottom: 6 }}>SPECIALTY PITCH & EXPERIENCE</label>
                    <textarea
                      required
                      value={applyPitch}
                      onChange={e => setApplyPitch(e.target.value)}
                      placeholder={`Explain what React/AI project experience you have, how much time you can dedicate, and why they should select you...`}
                      style={{
                        width: "100%", height: 110, borderRadius: 10, background: "var(--bg-alt)",
                        border: "1.5px solid var(--border-light)", color: "var(--text-main)",
                        fontFamily: "'Outfit', sans-serif", fontSize: 13.5, padding: 12, outline: "none", resize: "none"
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <button 
                      type="button"
                      onClick={() => setShowApplyModal(false)}
                      style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid var(--border-light)", background: "var(--bg-alt)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={!applyPitch.trim()}
                      style={{ flex: 1.5, padding: "12px", borderRadius: 12, border: "none", background: applyPitch.trim() ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "var(--border-light)", color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900, cursor: applyPitch.trim() ? "pointer" : "default" }}
                    >
                      Submit Application
                    </button>
                  </div>

                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* =========================================================================
           GLOBAL MODAL: PREMIUM SQUAD CREATOR
           ========================================================================= */}
        <AnimatePresence>
          {showCreateModal && (
            <div 
              onClick={e => { if (e.target === e.currentTarget) setShowCreateModal(false); }}
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
                  background: "var(--bg-card)", borderRadius: 24, maxWidth: 780, width: "100%",
                  border: "1.5px solid var(--border-light)", boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
                  overflow: "hidden", display: "flex", flexDirection: "column", position: "relative"
                }}
              >
                <div style={{ padding: "20px 24px", borderBottom: "1.5px solid var(--border-light)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 20, fontWeight: 900, color: "var(--text-main)" }}>
                    🚀 Launch New Hack Squad Workspace
                  </h4>
                  <button onClick={() => setShowCreateModal(false)} style={{ position: "absolute", right: 20, top: 20, width: 32, height: 32, borderRadius: 10, border: "none", background: "var(--bg-alt)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-main)", fontSize: 20 }}>
                    ×
                  </button>
                </div>

                <form onSubmit={handleCreateSquad} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", marginBottom: 6 }}>SQUAD NAME</label>
                      <input
                        type="text"
                        required
                        value={newSquadName}
                        onChange={e => setNewSquadName(e.target.value)}
                        placeholder="e.g. Hyperion AI"
                        style={{ width: "100%", padding: "10px", borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", fontFamily: "'Outfit', sans-serif", fontSize: 13.5 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", marginBottom: 6 }}>TARGET HACKATHON</label>
                      <input
                        type="text"
                        required
                        value={newHackathonName}
                        onChange={e => setNewHackathonName(e.target.value)}
                        placeholder="e.g. Google AI Hackathon"
                        style={{ width: "100%", padding: "10px", borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", fontFamily: "'Outfit', sans-serif", fontSize: 13.5 }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", marginBottom: 6 }}>SQUAD DESCRIPTION & GOALS</label>
                    <textarea
                      required
                      value={newSquadDesc}
                      onChange={e => setNewSquadDesc(e.target.value)}
                      placeholder="Summarize the project you want to build and the goals of this hack squad..."
                      style={{
                        width: "100%", height: 80, borderRadius: 10, background: "var(--bg-alt)",
                        border: "1.5px solid var(--border-light)", color: "var(--text-main)",
                        fontFamily: "'Outfit', sans-serif", fontSize: 13.5, padding: 12, outline: "none", resize: "none"
                      }}
                    />
                  </div>

                  {/* Date, Time and Duration input fields */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", marginBottom: 6 }}>EVENT DATE</label>
                      <input
                        type="date"
                        required
                        value={eventDate}
                        onChange={e => setEventDate(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", fontFamily: "'Outfit', sans-serif", fontSize: 13.5 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", marginBottom: 6 }}>EVENT TIME</label>
                      <input
                        type="time"
                        required
                        value={eventTime}
                        onChange={e => setEventTime(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", fontFamily: "'Outfit', sans-serif", fontSize: 13.5 }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", marginBottom: 6 }}>DURATION OF EVENT (HOURS)</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={eventDuration}
                        onChange={e => setEventDuration(e.target.value)}
                        placeholder="e.g. 24"
                        style={{ width: "100%", padding: "10px", borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", fontFamily: "'Outfit', sans-serif", fontSize: 13.5 }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", marginBottom: 6 }}>INVITE / SEEKING SKILLS (COMMA SEPARATED)</label>
                      <input
                        type="text"
                        value={newRequiredSkills}
                        onChange={e => setNewRequiredSkills(e.target.value)}
                        placeholder="e.g. React, Docker, Python"
                        style={{ width: "100%", padding: "10px", borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", fontFamily: "'Outfit', sans-serif", fontSize: 13.5 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", marginBottom: 6 }}>TEAM BAR SIZE</label>
                      <select
                        value={newTeamSize}
                        onChange={e => setNewTeamSize(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", fontFamily: "'Outfit', sans-serif", fontSize: 13.5 }}
                      >
                        <option value="3">3 members</option>
                        <option value="4">4 members</option>
                        <option value="5">5 members</option>
                        <option value="6">6 members</option>
                      </select>
                    </div>
                  </div>

                  {/* Add member IDs list box based on selected Team Size */}
                  <div style={{ border: "1.5px solid var(--border-light)", borderRadius: 16, padding: 18, background: "var(--bg-alt)" }}>
                    <h5 style={{ margin: "0 0 10px 0", fontSize: 14, fontFamily: "'Outfit', sans-serif", fontWeight: 900, color: "var(--text-main)" }}>
                      👥 Add Member (Squad Size Limit: {newTeamSize})
                    </h5>
                    <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                      <input
                        type="text"
                        value={memberInputId}
                        onChange={e => setMemberInputId(e.target.value)}
                        placeholder="Enter Unique User ID (e.g. USER-7729)"
                        style={{ flex: 1, padding: "10px 14px", borderRadius: 10, background: "var(--bg-card)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", fontSize: 13.5 }}
                      />
                      <button
                        type="button"
                        onClick={handleAddMemberId}
                        style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff", fontWeight: 900, fontSize: 13.5, cursor: "pointer" }}
                      >
                        Add Member
                      </button>
                    </div>

                    {memberIdsList.length > 0 ? (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {memberIdsList.map((uid, idx) => (
                          <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", borderRadius: 20, background: "rgba(108,99,255,0.08)", border: "1px solid rgba(108,99,255,0.2)", fontSize: 12.5, fontWeight: 700, color: "#6c63ff" }}>
                            <span>👤 {uid}</span>
                            <button type="button" onClick={() => handleRemoveMemberId(uid)} style={{ border: "none", background: "transparent", color: "var(--text-muted)", cursor: "pointer", fontSize: 14, fontWeight: 900 }}>×</button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: 12.5, color: "var(--text-muted)", fontStyle: "italic" }}>No custom members queued yet. Enter ID above.</span>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8, padding: 12, borderRadius: 10, background: "rgba(108,99,255,0.06)", border: "1px solid rgba(108,99,255,0.25)", alignItems: "center" }}>
                    <Github size={16} color="#6c63ff" />
                    <span style={{ fontSize: 12.5, color: "#6c63ff", fontWeight: 700 }}>Auto Sync: Automatically spins up a private GitHub repo & links to Sprint Board.</span>
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <button 
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid var(--border-light)", background: "var(--bg-alt)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      style={{ flex: 1.5, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900, cursor: "pointer" }}
                    >
                      Deploy Squad Workspace
                    </button>
                  </div>

                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* =========================================================================
           GLOBAL MODAL: DELETE WARNING MODAL
           ========================================================================= */}
        <AnimatePresence>
          {squadToDelete && (
            <div 
              onClick={e => { if (e.target === e.currentTarget) setSquadToDelete(null); }}
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
                  background: "var(--bg-card)", borderRadius: 24, maxWidth: 480, width: "100%",
                  border: "1.5px solid #ef444430", boxShadow: "0 30px 80px rgba(239,68,68,0.2)",
                  overflow: "hidden", display: "flex", flexDirection: "column", position: "relative"
                }}
              >
                <div style={{ padding: "20px 24px", borderBottom: "1.5px solid var(--border-light)", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 24 }}>⚠️</span>
                  <h4 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900, color: "#ef4444" }}>
                    Warning: Delete Hack Squad
                  </h4>
                </div>

                <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                  <p style={{ margin: 0, fontSize: 14.5, color: "var(--text-main)", lineHeight: 1.5 }}>
                    Are you sure you want to delete the squad <strong>{squadToDelete.name}</strong>?
                  </p>
                  <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.5 }}>
                    This will permanently destroy the team workspace, terminate the private voice channel, delete all sprint tasks, and sever links to your GitHub repository. This action cannot be undone.
                  </p>

                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <button 
                      type="button"
                      onClick={() => setSquadToDelete(null)}
                      style={{ flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid var(--border-light)", background: "var(--bg-alt)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button"
                      onClick={confirmDeleteSquad}
                      style={{ flex: 1.2, padding: "12px", borderRadius: 12, border: "none", background: "#ef4444", color: "#fff", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900, cursor: "pointer" }}
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </DashboardLayout>
  );
}
