import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import { 
  Plus, Search, MessageSquare, FileText, CheckCircle2, 
  Send, Users, Code, KanbanSquare, SlidersHorizontal, Lock
} from "lucide-react";

// Inline SVG Github Icon to avoid dependency exports mismatch
const Github = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

/* ─── COLOR TOKENS ─── */
const COLS = {
  primary: "#6c63ff",
  success: "#00c9a7",
  warning: "#f59e0b",
  danger: "#ec4899",
  info: "#38bdf8"
};

/* ─── COLLABORATORS/TEAMMATES POOL ─── */
const COLLABORATORS_POOL = [
  { name: "Anjali Sharma", role: "React Developer", avatar: "👩‍💻", col: COLS.primary, spec: "React + Firebase", college: "IIT Delhi" },
  { name: "Rohan Das", role: "Backend Developer", avatar: "👨‍💻", col: COLS.success, spec: "Node.js + Redis", college: "IIT Kanpur" },
  { name: "Sneha Iyer", role: "UI Designer", avatar: "👩‍🎨", col: COLS.danger, spec: "Figma + UI/UX Design", college: "BITS Pilani" }
];

export default function PlatformProjectCollab() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("project-collab");
  
  // Developer Mode Toggle (stored in localStorage)
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

  // Sub Tab: "my-space" | "marketplace"
  const [collabSubTab, setCollabSubTab] = useState("my-space");

  // Filter criteria for search
  const [filterType, setFilterType] = useState("all"); // "all", "participate", "recruit", "collaborators"
  const [searchQuery, setSearchQuery] = useState("");

  // Create Project Modal Form States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjName, setNewProjName] = useState("");
  const [newProjTech, setNewProjTech] = useState("");
  const [newProjProgress, setNewProjProgress] = useState(10);
  const [newProjSelectionType, setNewProjSelectionType] = useState("collaborators");
  const [newProjSlots, setNewProjSlots] = useState("");
  const [newProjDifficulty, setNewProjDifficulty] = useState("Medium");
  const [newProjInvitedMember, setNewProjInvitedMember] = useState("");
  const [newProjDescription, setNewProjDescription] = useState("");

  // Projects data
  const [myProjects, setMyProjects] = useState([
    {
      id: "p1",
      name: "PathED Frontend Refactor",
      type: "original", // Original Project
      owner: "You",
      progress: 68,
      status: "In Progress",
      tech: ["React.js", "Vanilla CSS", "Framer Motion"],
      slots: "1 UI Designer needed",
      timeline: "Ending in 2 weeks",
      members: ["Rahul Kushwaha", "Sneha Iyer"],
      chat: [
        { user: "Sneha Iyer", text: "I finished the Glassmorphism card templates. Can you hook up the state?", time: "2:10 PM" },
        { user: "Rahul Kushwaha (You)", text: "Awesome! I am writing the replacement logic right now.", time: "2:15 PM" }
      ],
      tasks: [
        { id: "t1", title: "Build responsive layout grid", status: "completed" },
        { id: "t2", title: "Refactor Dashboard widgets", status: "progress" },
        { id: "t3", title: "Integrate Github deployment hook", status: "todo" }
      ],
      notes: "Sprint 3 Goals:\n- Finalize pixel-perfect card layouts\n- Eliminate layout shift on mobile widths\n- Complete dev testing triggers",
      gitCommits: [
        { msg: "Merge pull request #14 from sneha/glassmorphic-cards", date: "Today, 1:12 PM" },
        { msg: "fix flex justifyContent layout wrapping", date: "Yesterday, 4:40 PM" }
      ]
    },
    {
      id: "p2",
      name: "Distributed ML Train Pipeline",
      type: "participating", // Participating Project
      owner: "IIT KGP ML Team",
      progress: 42,
      status: "Active",
      tech: ["PyTorch", "gRPC", "Docker"],
      slots: "1 Backend SDE open",
      timeline: "Ending in 1 month",
      members: ["Dr. Amit Sen", "Anjali Sharma", "Rahul Kushwaha"],
      chat: [
        { user: "Dr. Amit Sen", text: "We need to optimize the epoch synchronization. Training overhead is high.", time: "Yesterday" }
      ],
      tasks: [
        { id: "t4", title: "Setup Docker clusters", status: "completed" },
        { id: "t5", title: "Implement gRPC transport layers", status: "progress" }
      ],
      notes: "ML Pipeline Spec:\n- Standardize on PyTorch Lightning backend\n- Target <= 50ms gRPC latency overhead",
      gitCommits: [
        { msg: "feat: add gRPC compression flags", date: "3 days ago" }
      ]
    }
  ]);

  // Workspace sub-tabs: "chat" | "tasks" | "github" | "notes"
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(null);
  const [workspaceTab, setWorkspaceTab] = useState("chat");
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const chatEndRef = useRef(null);

  // Auto scroll chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [myProjects, activeWorkspaceId, workspaceTab]);

  const handleSendChat = (projectId) => {
    if (!messageInput.trim()) return;
    setMyProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          chat: [...p.chat, { user: "Rahul Kushwaha (You)", text: messageInput, time: "4:05 PM" }]
        };
      }
      return p;
    }));
    setMessageInput("");
  };

  const handleTaskStatusChange = (projectId, taskId, nextStatus) => {
    setMyProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          tasks: p.tasks.map(t => t.id === taskId ? { ...t, status: nextStatus } : t)
        };
      }
      return p;
    }));
  };

  const handleUpdateNotes = (projectId, notesText) => {
    setMyProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, notes: notesText };
      }
      return p;
    }));
  };

  // Browse Market Projects List
  const [browseProjects, setBrowseProjects] = useState([
    {
      id: "bp1",
      name: "Quant trading Backtest Engine",
      owner: "Finance Research Club",
      desc: "An event-driven backtesting platform for high-frequency volatility models using C++ and Python.",
      type: "participate",
      tech: ["C++", "Pandas", "Statsmodels"],
      teamSize: 4,
      slots: "Looking for 1 C++ Developer",
      difficulty: "Hard",
      col: COLS.primary,
      image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "bp2",
      name: "Glassmorphic Component Library",
      owner: "PathED Design Lab",
      desc: "Open source CSS UI library containing highly customizable components built for React and Tailwind.",
      type: "collaborators",
      tech: ["React.js", "Tailwind CSS", "Storybook"],
      teamSize: 5,
      slots: "Need 2 CSS experts",
      difficulty: "Medium",
      col: COLS.success,
      image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "bp3",
      name: "Autonomous Drone Mapping",
      owner: "Robotics Research Group",
      desc: "Simulating collision-avoidance trajectory grids using ROS and LiDAR data clusters in Gazebo.",
      type: "recruit",
      tech: ["ROS", "C++", "Gazebo"],
      teamSize: 6,
      slots: "Recruiting a Robotics QA Tester",
      difficulty: "Expert",
      col: COLS.warning,
      image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=400&q=80"
    },
    {
      id: "bp4",
      name: "AI Copresenter Avatar",
      owner: "Generative Systems Corp",
      desc: "Generating real-time speech-to-video speaker syncing models using audio-driven NeRF arrays.",
      type: "collaborators",
      tech: ["Python", "NeRF", "TensorFlow"],
      teamSize: 3,
      slots: "Looking for 1 ML Intern",
      difficulty: "Hard",
      col: COLS.danger,
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80"
    }
  ]);

  // Filtering logic
  const filteredBrowseProjects = browseProjects.filter(p => {
    if (filterType !== "all" && p.type !== filterType) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.tech.some(t => t.toLowerCase().includes(q));
    }
    return true;
  });

  const handleApplyJoin = (proj) => {
    alert(`Application submitted to join ${proj.name} as a collaborator! The project owner (${proj.owner}) will review your CRI Score and portfolio.`);
  };

  const handleCreateProject = () => {
    setIsCreateModalOpen(true);
  };

  const handlePostProject = (e) => {
    e.preventDefault();
    if (!newProjName.trim()) {
      alert("Please enter a project name.");
      return;
    }
    
    const projectId = "p_" + Date.now();
    const parsedTech = newProjTech.split(",").map(t => t.trim()).filter(Boolean);
    
    const invitedMembersList = ["Rahul Kushwaha"];
    if (newProjInvitedMember.trim()) {
      invitedMembersList.push(newProjInvitedMember.trim());
    }

    const createdProject = {
      id: projectId,
      name: newProjName,
      type: "original",
      owner: "You",
      progress: parseInt(newProjProgress) || 0,
      status: "In Progress",
      tech: parsedTech.length > 0 ? parsedTech : ["React.js"],
      slots: newProjSlots || "Open Position",
      timeline: "Ending in 4 weeks",
      members: invitedMembersList,
      chat: [
        { user: "System", text: `Project initialized. ${newProjInvitedMember.trim() ? `Squad invite request sent to "${newProjInvitedMember.trim()}".` : "Welcome to your collaborative workspace."}`, time: "Just now" }
      ],
      tasks: [
        { id: "t1", title: "Initialize repository structure", status: "todo" },
        { id: "t2", title: "Setup component folder blueprints", status: "todo" }
      ],
      notes: newProjDescription || "Start typing sprint documentation or architecture specs here...",
      gitCommits: []
    };

    const marketTypeMap = {
      collaborators: "collaborators",
      recruit: "recruit",
      participate: "participate"
    };
    
    const createdMarketProject = {
      id: "bp_" + Date.now(),
      name: newProjName,
      owner: "You",
      desc: newProjDescription || "No description provided.",
      type: marketTypeMap[newProjSelectionType] || "collaborators",
      tech: parsedTech.length > 0 ? parsedTech : ["React.js"],
      teamSize: invitedMembersList.length,
      slots: newProjSlots || "Open Position",
      difficulty: newProjDifficulty,
      col: COLS.primary,
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80"
    };

    // Update States
    setMyProjects(prev => [createdProject, ...prev]);
    setBrowseProjects(prev => [createdMarketProject, ...prev]);
    
    // Reset Fields
    setNewProjName("");
    setNewProjTech("");
    setNewProjProgress(10);
    setNewProjSelectionType("collaborators");
    setNewProjSlots("");
    setNewProjDifficulty("Medium");
    setNewProjInvitedMember("");
    setNewProjDescription("");
    setIsCreateModalOpen(false);

    alert(`Project successfully posted! ${newProjInvitedMember.trim() ? `Squad invitation request dispatched to "${newProjInvitedMember.trim()}".` : ""}`);
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={(tab) => {
      setActiveTab(tab);
      if (tab === "dashboard") navigate("/dashboard");
      if (tab === "roadmap") navigate("/roadmap");
      if (tab === "challenges") navigate("/challenges");
      if (tab === "memory-lane") navigate("/memory-lane");
      if (tab === "progress") navigate("/progress");
      if (tab === "mentorship") navigate("/mentorship");
      if (tab === "technews") navigate("/technews");
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 60, position: "relative" }}>
        
        {/* ── DEVELOPER TESTING MODE TOGGLE BANNER ── */}
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
                Toggle Plan state to lock/unlock workspaces instantly.
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
          boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16
        }}>
          <div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11.5, color: "#6c63ff", fontWeight: 900, letterSpacing: 1.5, marginBottom: 4 }}>
              COLLABORATION & COMMUNITIES
            </div>
            <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
              Project <span style={{ background: "linear-gradient(90deg, #6c63ff, #00c9a7, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Collaboration</span>
            </h1>
          </div>

          {/* Sub Navigation */}
          <div style={{
            display: "inline-flex", background: "var(--bg-alt)", padding: 5, borderRadius: 20,
            border: "1.5px solid var(--border-light)", gap: 8
          }}>
            <button
              onClick={() => setCollabSubTab("my-space")}
              style={{
                padding: "10px 22px", borderRadius: 15, border: "none",
                background: collabSubTab === "my-space" ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "transparent",
                color: collabSubTab === "my-space" ? "#ffffff" : "var(--text-muted)",
                fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900,
                cursor: "pointer", transition: "all 0.2s"
              }}
            >
              My Space
            </button>
            <button
              onClick={() => setCollabSubTab("marketplace")}
              style={{
                padding: "10px 22px", borderRadius: 15, border: "none",
                background: collabSubTab === "marketplace" ? "linear-gradient(135deg, #6c63ff, #00c9a7)" : "transparent",
                color: collabSubTab === "marketplace" ? "#ffffff" : "var(--text-muted)",
                fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900,
                cursor: "pointer", transition: "all 0.2s"
              }}
            >
              Browse Projects
            </button>
          </div>
        </div>

        {/* ── TAB CONTENT ── */}
        {collabSubTab === "my-space" ? (
          /* DEFAULT VIEW: MY CURRENT PROJECTS */
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 22, fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
                  Active Collaborations
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: 13.5, color: "var(--text-muted)" }}>
                  Monitor roadmap milestones, push code commits, and check sprint backlogs.
                </p>
              </div>

              {devPlan === "premium" ? (
                <button
                  onClick={handleCreateProject}
                  style={{
                    padding: "12px 20px", borderRadius: 14, border: "none",
                    background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#ffffff",
                    fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                    boxShadow: "0 6px 18px rgba(108,99,255,0.2)"
                  }}
                >
                  <Plus size={16} />
                  <span>Create Project</span>
                </button>
              ) : (
                <button
                  onClick={() => navigate("/store")}
                  style={{
                    padding: "12px 20px", borderRadius: 14, border: "1.5px dashed #6c63ff",
                    background: "rgba(108, 99, 255, 0.08)", color: "#6c63ff",
                    fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900,
                    cursor: "pointer", display: "flex", alignItems: "center", gap: 8
                  }}
                >
                  <Lock size={14} />
                  <span>Create Project (Premium)</span>
                </button>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {myProjects
                .filter(proj => activeWorkspaceId === null || activeWorkspaceId === proj.id)
                .map(proj => {
                  const isWorkspaceActive = activeWorkspaceId === proj.id;
                  
                  return (
                    <div 
                      key={proj.id}
                      style={{
                        background: "var(--bg-card)", border: "1.5px solid var(--border-light)",
                        borderRadius: 24, padding: 28, display: "flex", flexDirection: "column", gap: 24,
                        boxShadow: "0 6px 20px rgba(0,0,0,0.015)"
                      }}
                    >
                      {/* Back Navigation Bar when Workspace is open */}
                      {isWorkspaceActive && (
                        <div style={{ display: "flex", justifyContent: "flex-start", borderBottom: "1px solid var(--border-light)", paddingBottom: 14 }}>
                          <button
                            onClick={() => setActiveWorkspaceId(null)}
                            style={{
                              display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
                              borderRadius: 12, border: "1.5px solid var(--border-light)",
                              background: "var(--bg-alt)", color: "var(--text-main)",
                              fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 900,
                              cursor: "pointer", transition: "all 0.2s"
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = "var(--border-light)";
                              e.currentTarget.style.transform = "translateX(-3px)";
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = "var(--bg-alt)";
                              e.currentTarget.style.transform = "none";
                            }}
                          >
                            <span>←</span> Go Back to All Projects
                          </button>
                        </div>
                      )}
                    {/* Top Row: Info & Roles */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                      <div>
                        {/* Project Ownership Badge */}
                        <span style={{
                          padding: "4px 8px", borderRadius: 8, fontSize: 10.5, fontFamily: "'Fira Code', monospace", fontWeight: 900,
                          background: proj.type === "original" ? "rgba(108,99,255,0.12)" : "rgba(0,201,167,0.12)",
                          color: proj.type === "original" ? "#6c63ff" : "#00c9a7",
                          border: proj.type === "original" ? "1px solid #6c63ff30" : "1px solid #00c9a730",
                          marginRight: 8
                        }}>
                          {proj.type === "original" ? "⭐ OWNER (ORIGINAL)" : "🤝 PARTICIPATING"}
                        </span>
                        
                        <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 21, fontWeight: 900, color: "var(--text-main)", margin: "8px 0 2px" }}>
                          {proj.name}
                        </h4>
                        <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                          Admin: <strong style={{ fontWeight: 800 }}>{proj.owner}</strong> • Timeline: {proj.timeline}
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: 8 }}>
                        {proj.tech.map((t, idx) => (
                          <span key={idx} style={{ padding: "4px 8px", borderRadius: 8, background: "var(--bg-alt)", border: "1px solid var(--border-light)", fontSize: 12, color: "var(--text-main)", fontWeight: 700 }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Middle Row: Progress and Open Slots */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, background: "var(--bg-alt)", padding: 18, borderRadius: 16, border: "1px solid var(--border-light)" }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>
                          <span>Sprint Progress</span>
                          <span>{proj.progress}%</span>
                        </div>
                        <div style={{ height: 8, width: "100%", background: "var(--border-light)", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${proj.progress}%`, background: "linear-gradient(90deg, #6c63ff, #00c9a7)", borderRadius: 4 }} />
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                          <div style={{ fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)", fontWeight: 800 }}>OPEN SQUAD POSITIONS</div>
                          <span style={{ fontSize: 14, fontWeight: 800, color: "#ef4444" }}>{proj.slots}</span>
                        </div>
                        
                        <div style={{ display: "flex", gap: -8, overflow: "hidden" }}>
                          {proj.members.map((mem, memIdx) => (
                            <div 
                              key={memIdx}
                              title={mem}
                              style={{
                                width: 32, height: 32, borderRadius: "50%", background: "#6c63ff", color: "#fff",
                                border: "2px solid var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 12, fontWeight: 900, marginRight: -8, cursor: "pointer"
                              }}
                            >
                              {mem[0]}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Workspace Activation Row */}
                    <div>
                      <button
                        onClick={() => setActiveWorkspaceId(isWorkspaceActive ? null : proj.id)}
                        style={{
                          width: "100%", padding: "14px 20px", borderRadius: 16,
                          background: isWorkspaceActive ? "var(--bg-alt)" : "linear-gradient(135deg, rgba(108,99,255,0.06), rgba(0,201,167,0.06))",
                          border: isWorkspaceActive ? "1.5px solid var(--border-light)" : "1.5px solid #6c63ff60",
                          color: "#6c63ff", fontFamily: "'Outfit', sans-serif", fontSize: 14.5, fontWeight: 900,
                          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                          transition: "all 0.2s"
                        }}
                      >
                        <KanbanSquare size={16} />
                        <span>{isWorkspaceActive ? "Close Private Workspace" : "Open Private Workspace"}</span>
                      </button>
                    </div>

                    {/* ── PRIVATE WORKSPACE CONTAINER (PREMIUM ONLY) ── */}
                    {isWorkspaceActive && (
                      <div style={{ borderTop: "1.5px solid var(--border-light)", paddingTop: 20, position: "relative" }}>
                        
                        {devPlan === "free" ? (
                          /* FREE STATE LOCK OVERLAY */
                          <div style={{
                            padding: "40px 20px", borderRadius: 18, background: "rgba(15,23,42,0.05)",
                            border: "1.5px dashed rgba(108,99,255,0.3)", backdropFilter: "blur(4px)",
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center"
                          }}>
                            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(108,99,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Lock size={26} color="#6c63ff" />
                            </div>
                            <div>
                              <h5 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
                                Workspace Locked on Free Plan
                              </h5>
                              <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "var(--text-muted)", maxWidth: 420 }}>
                                Upgrade to PathED Premium to unlock private workspaces, interactive chat, sprint boards, notes pads, and Github deployment histories.
                              </p>
                            </div>
                            <button
                              onClick={() => navigate("/store")}
                              style={{
                                padding: "10px 20px", borderRadius: 12, border: "none",
                                background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#ffffff",
                                fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 800, cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(108,99,255,0.2)"
                              }}
                            >
                              Upgrade Premium
                            </button>
                          </div>
                        ) : (
                          /* UNLOCKED WORKSPACE COMPONENT (PREMIUM) */
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 2.6fr", gap: 20, minHeight: 400 }}>
                            
                            {/* Workspace Subtabs */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 6, borderRight: "1.5px solid var(--border-light)", paddingRight: 18 }}>
                              <button
                                onClick={() => setWorkspaceTab("chat")}
                                style={{
                                  width: "100%", padding: "12px 14px", borderRadius: 12, border: "none",
                                  background: workspaceTab === "chat" ? "rgba(108,99,255,0.12)" : "transparent",
                                  color: workspaceTab === "chat" ? "#6c63ff" : "var(--text-muted)",
                                  fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 900,
                                  cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "left"
                                }}
                              >
                                <MessageSquare size={16} /> Team Chat
                              </button>

                              <button
                                onClick={() => setWorkspaceTab("tasks")}
                                style={{
                                  width: "100%", padding: "12px 14px", borderRadius: 12, border: "none",
                                  background: workspaceTab === "tasks" ? "rgba(108,99,255,0.12)" : "transparent",
                                  color: workspaceTab === "tasks" ? "#6c63ff" : "var(--text-muted)",
                                  fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 900,
                                  cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "left"
                                }}
                              >
                                <KanbanSquare size={16} /> Sprint Board
                              </button>

                              <button
                                onClick={() => setWorkspaceTab("github")}
                                style={{
                                  width: "100%", padding: "12px 14px", borderRadius: 12, border: "none",
                                  background: workspaceTab === "github" ? "rgba(108,99,255,0.12)" : "transparent",
                                  color: workspaceTab === "github" ? "#6c63ff" : "var(--text-muted)",
                                  fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 900,
                                  cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "left"
                                }}
                              >
                                <Github size={16} /> Git History
                              </button>

                              <button
                                onClick={() => setWorkspaceTab("notes")}
                                style={{
                                  width: "100%", padding: "12px 14px", borderRadius: 12, border: "none",
                                  background: workspaceTab === "notes" ? "rgba(108,99,255,0.12)" : "transparent",
                                  color: workspaceTab === "notes" ? "#6c63ff" : "var(--text-muted)",
                                  fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 900,
                                  cursor: "pointer", display: "flex", alignItems: "center", gap: 10, textAlign: "left"
                                }}
                              >
                                <FileText size={16} /> Shared Notes
                              </button>

                              <button
                                onClick={() => setIsMembersOpen(!isMembersOpen)}
                                style={{
                                  width: "100%", padding: "12px 14px", borderRadius: 12, border: "none",
                                  background: isMembersOpen ? "rgba(108,99,255,0.06)" : "transparent",
                                  color: isMembersOpen ? "var(--text-main)" : "var(--text-muted)",
                                  fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 900,
                                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, textAlign: "left"
                                }}
                              >
                                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                  <Users size={16} /> Team Members
                                </span>
                                <span style={{ fontSize: 11 }}>{isMembersOpen ? "▲" : "▼"}</span>
                              </button>

                              {isMembersOpen && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 24, marginTop: 4, marginBottom: 8 }}>
                                  {proj.members.map((member, idx) => {
                                    const isLive = idx % 2 === 0;
                                    return (
                                      <div 
                                        key={idx} 
                                        style={{ 
                                          display: "flex", alignItems: "center", gap: 8, 
                                          fontSize: 13, color: "var(--text-main)", fontWeight: 800,
                                          padding: "4px 0"
                                        }}
                                      >
                                        <span 
                                          style={{ 
                                            width: 8, height: 8, borderRadius: "50%", 
                                            background: isLive ? "#00c9a7" : "#ef4444",
                                            boxShadow: isLive ? "0 0 8px #00c9a780" : "none"
                                          }} 
                                        />
                                        <span>{member}</span>
                                        {member === "Rahul Kushwaha" && <span style={{ fontSize: 10, color: "var(--text-muted)", marginLeft: "auto" }}>(You)</span>}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Live Room link */}
                              <div style={{ marginTop: "auto", paddingTop: 14 }}>
                                <button
                                  onClick={() => alert("Launching secure peer-to-peer Jitsi voice link...")}
                                  style={{
                                    width: "100%", padding: "12px 14px", borderRadius: 12, border: "none",
                                    background: "rgba(0,201,167,0.12)", color: "#00c9a7",
                                    fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 900,
                                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                                  }}
                                >
                                  <Users size={14} /> Join Voice Room
                                </button>
                              </div>
                            </div>

                            {/* Workspace Subtab Content area */}
                            <div style={{ paddingLeft: 10, display: "flex", flexDirection: "column" }}>
                              
                              {/* 1. CHAT SUBTAB */}
                              {workspaceTab === "chat" && (
                                <div style={{ display: "flex", flexDirection: "column", height: 320, justifyContent: "space-between" }}>
                                  <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, paddingRight: 10 }}>
                                    {proj.chat.map((msg, mIdx) => (
                                      <div key={mIdx} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                                        <span style={{ fontSize: 11, fontFamily: "'Fira Code', monospace", color: "var(--text-muted)" }}>
                                          {msg.user} • {msg.time}
                                        </span>
                                        <div style={{
                                          padding: "8px 12px", borderRadius: 12, background: "var(--bg-alt)",
                                          border: "1px solid var(--border-light)", fontSize: 13.5, maxWidth: "80%", alignSelf: "flex-start"
                                        }}>
                                          {msg.text}
                                        </div>
                                      </div>
                                    ))}
                                    <div ref={chatEndRef} />
                                  </div>

                                  <div style={{ display: "flex", gap: 8, borderTop: "1px solid var(--border-light)", paddingTop: 12 }}>
                                    <input
                                      type="text"
                                      value={messageInput}
                                      onChange={e => setMessageInput(e.target.value)}
                                      placeholder="Type message to collaborators..."
                                      style={{
                                        flex: 1, padding: "8px 12px", borderRadius: 10,
                                        background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                                        color: "var(--text-main)", outline: "none", fontSize: 13.5
                                      }}
                                    />
                                    <button
                                      onClick={() => handleSendChat(proj.id)}
                                      style={{
                                        width: 38, height: 38, borderRadius: 10, border: "none",
                                        background: "linear-gradient(135deg, #6c63ff, #00c9a7)", color: "#fff",
                                        display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer"
                                      }}
                                    >
                                      <Send size={14} />
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* 2. TASKS BOARD SUBTAB */}
                              {workspaceTab === "tasks" && (
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                                  
                                  {/* In Progress Column */}
                                  <div style={{ background: "var(--bg-alt)", padding: 14, borderRadius: 14, border: "1px solid var(--border-light)" }}>
                                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10.5, color: "#6c63ff", fontWeight: 900, marginBottom: 10 }}>
                                      ⚡ SPRINT WORK backlog
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                      {proj.tasks.filter(t => t.status !== "completed").map(t => (
                                        <div key={t.id} style={{ padding: 10, background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                          <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--text-main)" }}>{t.title}</span>
                                          <button
                                            onClick={() => handleTaskStatusChange(proj.id, t.id, "completed")}
                                            style={{
                                              padding: "3px 6px", borderRadius: 6, border: "none", background: "rgba(0,201,167,0.12)", color: "#00c9a7",
                                              fontSize: 10, fontWeight: 900, cursor: "pointer"
                                            }}
                                          >
                                            Done
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Completed Column */}
                                  <div style={{ background: "var(--bg-alt)", padding: 14, borderRadius: 14, border: "1px solid var(--border-light)" }}>
                                    <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10.5, color: "#00c9a7", fontWeight: 900, marginBottom: 10 }}>
                                      ✓ DONE LIST
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                      {proj.tasks.filter(t => t.status === "completed").map(t => (
                                        <div key={t.id} style={{ padding: 10, background: "var(--bg-card)", border: "1px solid var(--border-light)", borderRadius: 10, display: "flex", alignItems: "center", gap: 6, opacity: 0.7 }}>
                                          <CheckCircle2 size={13} color="#00c9a7" />
                                          <span style={{ fontSize: 12.5, textDecoration: "line-through", color: "var(--text-muted)" }}>{t.title}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                </div>
                              )}

                              {/* 3. GITHUB SUBTAB */}
                              {workspaceTab === "github" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                  <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, color: "var(--text-muted)" }}>
                                    CONNECTED REPO: github.com/rahulkushwaha/{proj.name.toLowerCase().replace(/ /g, "-")}
                                  </span>
                                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {proj.gitCommits.map((com, cIdx) => (
                                      <div key={cIdx} style={{ padding: 12, background: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                          <Code size={14} color="#6c63ff" />
                                          <span style={{ fontSize: 13, fontFamily: "'Fira Code', monospace", color: "var(--text-main)", fontWeight: 700 }}>
                                            {com.msg}
                                          </span>
                                        </div>
                                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{com.date}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 4. SHARED NOTES SUBTAB */}
                              {workspaceTab === "notes" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "'Fira Code', monospace" }}>
                                    COLLABORATIVE SPRINT PAD (AUTO-SAVE)
                                  </span>
                                  <textarea
                                    value={proj.notes}
                                    onChange={e => handleUpdateNotes(proj.id, e.target.value)}
                                    style={{
                                      width: "100%", height: 160, borderRadius: 12, background: "var(--bg-alt)",
                                      border: "1.5px solid var(--border-light)", color: "var(--text-main)",
                                      fontFamily: "'Fira Code', monospace", fontSize: 13, padding: 14, outline: "none", resize: "none"
                                    }}
                                  />
                                </div>
                              )}

                            </div>

                          </div>
                        )}

                      </div>
                    )}

                  </div>
                );
              })}
            </div>

          </div>
        ) : (
          /* BROWSE SQUAD / COLLABORATORS SEARCH VIEW (NETFLIX STYLE COMPACT ROW) */
          <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
            
            {/* Search and Filters Bar */}
            <div style={{
              padding: 22, borderRadius: 20, background: "var(--bg-card)",
              border: "1.5px solid var(--border-light)", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center"
            }}>
              {/* Search text input */}
              <div style={{ flex: 1, position: "relative" }}>
                <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search project terms, technology frameworks..."
                  style={{
                    width: "100%", padding: "10px 14px 10px 38px", borderRadius: 12,
                    background: "var(--bg-alt)", border: "1.5px solid var(--border-light)",
                    color: "var(--text-main)", outline: "none", fontFamily: "'Outfit', sans-serif", fontSize: 13.5
                  }}
                />
              </div>

              {/* Advanced filter select */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <SlidersHorizontal size={15} color="var(--text-muted)" />
                <span style={{ fontSize: 13.5, color: "var(--text-muted)" }}>Target Filter:</span>
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  style={{
                    padding: "9px 14px", borderRadius: 10, background: "var(--bg-alt)",
                    border: "1.5px solid var(--border-light)", color: "var(--text-main)",
                    fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, outline: "none"
                  }}
                >
                  <option value="all">🔍 Show All Opportunities</option>
                  <option value="participate">🤝 To Participate (Open Teams)</option>
                  <option value="recruit">💼 To Recruit (Hire Teammates)</option>
                  <option value="collaborators">👥 Look for Collaborators</option>
                </select>
              </div>
            </div>

            {/* Slidable Row 1: High-Impact Open Source Initiatives */}
            <NetflixProjectRow 
              title="High-Impact Open Source Initiatives" 
              projects={filteredBrowseProjects} 
              onApply={handleApplyJoin}
            />

            {/* Slidable Row 2: Active Student Startup Hackathons */}
            <NetflixProjectRow 
              title="Active Student Startup Hackathons" 
              projects={filteredBrowseProjects.slice().reverse()} 
              onApply={handleApplyJoin}
            />

            {/* Slidable Row 3: Available Teammates Seeking Collaborators */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 19, fontWeight: 900, color: "var(--text-main)", margin: 0 }}>
                Teammates Seeking Collaborators
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 18 }}>
                {COLLABORATORS_POOL.map((c, i) => (
                  <div key={i} style={{ padding: 20, background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderTop: `4px solid ${c.col}`, borderRadius: 20, display: "flex", gap: 14, alignItems: "center" }}>
                    <span style={{ fontSize: 32 }}>{c.avatar}</span>
                    <div>
                      <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15.5, fontWeight: 800, color: "var(--text-main)" }}>
                        {c.name}
                      </div>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {c.role} ({c.college})
                      </span>
                      <div style={{ marginTop: 6 }}>
                        <span style={{ padding: "3px 6px", borderRadius: 6, background: "var(--bg-alt)", border: "1px solid var(--border-light)", fontSize: 11, color: c.col, fontWeight: 700 }}>
                          {c.spec}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Create Project detailed modal form (premium LinkedIn Post style layout) */}
        <AnimatePresence>
          {isCreateModalOpen && (
            <div 
              onClick={e => { if (e.target === e.currentTarget) setIsCreateModalOpen(false); }}
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
                  background: "var(--bg-card)", borderRadius: 24, maxWidth: 850, width: "100%",
                  border: "1.5px solid var(--border-light)", boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
                  overflow: "hidden", display: "flex", flexDirection: "column", position: "relative"
                }}
              >
                {/* Modal Header */}
                <div style={{
                  padding: "20px 24px", borderBottom: "1.5px solid var(--border-light)",
                  display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%", background: "#6c63ff",
                      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 900
                    }}>
                      RK
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: 16.5, fontWeight: 800, color: "var(--text-main)" }}>
                        Rahul Kushwaha (You)
                      </h4>
                      <span style={{ fontSize: 11.5, color: "var(--text-muted)", fontFamily: "'Fira Code', monospace" }}>
                        🌐 Post project to PathEd Squads
                      </span>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    style={{ position: "absolute", right: 20, top: 22, width: 32, height: 32, borderRadius: 10, background: "var(--bg-alt)", border: "1px solid var(--border-light)", color: "var(--text-main)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: "bold" }}
                  >
                    ×
                  </button>
                </div>

                {/* Form fields */}
                <form 
                  onSubmit={handlePostProject}
                  style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20, overflowY: "auto", maxHeight: "80vh" }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", fontFamily: "'Fira Code', monospace" }}>PROJECT NAME</label>
                      <input 
                        type="text" 
                        required
                        value={newProjName}
                        onChange={e => setNewProjName(e.target.value)}
                        placeholder="e.g. Real-Time Analytics Pipeline"
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", marginTop: 4, fontFamily: "'Outfit', sans-serif", fontSize: 13.5 }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", fontFamily: "'Fira Code', monospace" }}>TECH STACK (COMMA-SEPARATED)</label>
                      <input 
                        type="text" 
                        required
                        value={newProjTech}
                        onChange={e => setNewProjTech(e.target.value)}
                        placeholder="e.g. React.js, Tailwind, WebSockets"
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", marginTop: 4, fontFamily: "'Outfit', sans-serif", fontSize: 13.5 }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", fontFamily: "'Fira Code', monospace" }}>COLLABORATION CATEGORY</label>
                      <select 
                        value={newProjSelectionType}
                        onChange={e => setNewProjSelectionType(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", marginTop: 4, fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 750 }}
                      >
                        <option value="collaborators">🤝 Search Collaborators / Team Squads</option>
                        <option value="recruit">💼 Recruiting / Job & SDE Internships</option>
                        <option value="participate">🔥 Open Participation / Hackathons</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", fontFamily: "'Fira Code', monospace" }}>PROJECT DIFFICULTY</label>
                      <select 
                        value={newProjDifficulty}
                        onChange={e => setNewProjDifficulty(e.target.value)}
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", marginTop: 4, fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 750 }}
                      >
                        <option value="Easy">🟢 Easy</option>
                        <option value="Medium">🟡 Medium</option>
                        <option value="Hard">🔴 Hard</option>
                        <option value="Expert">🔥 Expert</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", fontFamily: "'Fira Code', monospace" }}>INITIAL PROGRESS ({newProjProgress}%)</label>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
                        <input 
                          type="range" 
                          min="0" 
                          max="100"
                          value={newProjProgress}
                          onChange={e => setNewProjProgress(e.target.value)}
                          style={{ flex: 1, accentColor: "#6c63ff", cursor: "pointer" }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", fontFamily: "'Fira Code', monospace" }}>TARGET OPEN SLOTS</label>
                      <input 
                        type="text" 
                        required
                        value={newProjSlots}
                        onChange={e => setNewProjSlots(e.target.value)}
                        placeholder="e.g. Need 2 Frontend Developers"
                        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", marginTop: 4, fontFamily: "'Outfit', sans-serif", fontSize: 13.5 }}
                      />
                    </div>
                  </div>

                  {/* Teammate Assignment Field */}
                  <div style={{ padding: 14, borderRadius: 12, background: "rgba(108,99,255,0.06)", border: "1px solid rgba(108,99,255,0.2)" }}>
                    <label style={{ fontSize: 12, fontWeight: 800, color: "#6c63ff", fontFamily: "'Fira Code', monospace" }}>ALLOCATE / INVITE TEAMMATE</label>
                    <input 
                      type="text" 
                      value={newProjInvitedMember}
                      onChange={e => setNewProjInvitedMember(e.target.value)}
                      placeholder="Type a Member name (e.g. Anjali Sharma, Rohan Das)"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, background: "var(--bg-card)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", marginTop: 6, fontFamily: "'Outfit', sans-serif", fontSize: 13.5 }}
                    />
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 6, lineHeight: 1.4, fontStyle: "italic" }}>
                      💡 Entering a name automatically sends an invitation payload to their dashboard inbox. They will join the project upon acceptance.
                    </div>
                  </div>

                  {/* Project Description (Large Textbox at the very bottom) */}
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 800, color: "var(--text-muted)", fontFamily: "'Fira Code', monospace" }}>DETAILED PROJECT DESCRIPTION & SQUAD GOALS</label>
                    <textarea 
                      required
                      value={newProjDescription}
                      onChange={e => setNewProjDescription(e.target.value)}
                      placeholder="Describe the system functionalities, target features, and what skills you are looking for..."
                      style={{ width: "100%", height: 100, borderRadius: 12, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", outline: "none", marginTop: 6, fontFamily: "'Outfit', sans-serif", fontSize: 13.5, padding: 12, resize: "none" }}
                    />
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: 12, marginTop: 8, borderTop: "1.5px solid var(--border-light)", paddingTop: 18 }}>
                    <button 
                      type="button" 
                      onClick={() => setIsCreateModalOpen(false)}
                      style={{ flex: 1, padding: "12px", borderRadius: 12, background: "var(--bg-alt)", border: "1.5px solid var(--border-light)", color: "var(--text-main)", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      style={{ flex: 1.5, padding: "12px", borderRadius: 12, background: "linear-gradient(135deg, #6c63ff, #00c9a7)", border: "none", color: "#ffffff", fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 900, cursor: "pointer", boxShadow: "0 8px 20px rgba(108,99,255,0.25)" }}
                    >
                      Post Project
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

/* ─── NETFLIX-STYLE SLIDABLE ROW COMPONENT FOR PROJECTS ─── */
function NetflixProjectRow({ title, projects, onApply }) {
  const scrollRef = React.useRef(null);

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
              display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >
            ‹
          </button>
          <button
            onClick={scrollRight}
            style={{
              width: 32, height: 32, borderRadius: 10, border: "1.5px solid var(--border-light)",
              background: "var(--bg-card)", color: "var(--text-main)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center"
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
        {projects.map((p) => (
          <motion.div
            key={p.id}
            whileHover={{ y: -6, boxShadow: `0 10px 24px ${p.col}18` }}
            style={{
              width: 310, flexShrink: 0, background: "var(--bg-card)",
              border: "1.5px solid var(--border-light)", borderTop: `5px solid ${p.col}`,
              borderRadius: 22, overflow: "hidden", display: "flex", flexDirection: "column",
              boxShadow: "0 6px 18px rgba(0,0,0,0.02)"
            }}
          >
            {/* Cover Portrait */}
            <div style={{ position: "relative", height: 160, overflow: "hidden" }}>
              <img src={p.image} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)" }} />
              
              <div style={{ position: "absolute", bottom: 12, left: 16, right: 16, color: "#fff" }}>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 17, fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.name}
                </div>
                <span style={{ fontSize: 11.5, opacity: 0.8, fontFamily: "'Fira Code', monospace" }}>
                  Owner: {p.owner}
                </span>
              </div>
            </div>

            {/* Description & technology info */}
            <div style={{ padding: 18, flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.45, height: 56, overflow: "hidden" }}>
                  {p.desc}
                </p>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 4 }}>
                  {p.tech.slice(0, 3).map((t, idx) => (
                    <span key={idx} style={{ padding: "3px 6px", borderRadius: 6, background: "var(--bg-alt)", border: "1px solid var(--border-light)", fontSize: 10.5, color: "var(--text-muted)" }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Position details and join action */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid var(--border-light)", paddingTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 700 }}>
                    {p.slots}
                  </span>
                  <span style={{ padding: "3px 6px", borderRadius: 6, background: "var(--bg-alt)", fontSize: 11, color: "var(--text-main)", fontWeight: 800 }}>
                    {p.difficulty}
                  </span>
                </div>

                <button
                  onClick={() => onApply(p)}
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 12, border: "none",
                    background: `linear-gradient(135deg, ${p.col}, #00c9a7)`, color: "#ffffff",
                    fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 900,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
                  }}
                >
                  Apply to Join
                </button>
              </div>
            </div>

          </motion.div>
        ))}
      </div>
    </div>
  );
}
