import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "../../components/dashboard/DashboardLayout";
import QuoteBanner from "../../components/dashboard/QuoteBanner";
import AddWidgetModal, { ALL_AVAILABLE_WIDGETS } from "../../components/dashboard/AddWidgetModal";
import LockedFeatureModal from "../../components/dashboard/LockedFeatureModal";
import { 
  Sparkles, Plus, Lock, CheckCircle2, ChevronRight, 
  Flame, Award, Coins, Zap, Shield, HelpCircle, Eye, ArrowUpRight 
} from "lucide-react";

export default function PlatformDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeWidgets, setActiveWidgets] = useState([]); // Default empty workspace
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [lockedModalFeature, setLockedModalFeature] = useState(null);
  const [hoveredCardId, setHoveredCardId] = useState(null);

  // Student metrics
  const user = {
    name: "Rahul Kushwaha",
    degree: "B.Tech · Computer Science",
    institute: "IIT Kanpur",
    cri: 62,
    xp: 1340,
    coins: 2480,
    streak: 7,
    level: 2,
    goal: {
      role: "Software Engineer",
      tag: "SDE · UG Journey",
      why: "Interest in problem-solving, scalable systems & real-world impact",
      skills: ["DSA", "Programming", "DBMS", "OS", "Web Development"],
      timeline: "4 Years · Full UG",
      outcome: "Industry-ready with strong fundamentals and portfolio projects"
    }
  };

  const roadmapNodes = [
    { label: "Programming\nBasics", done: true },
    { label: "Data\nStructures", done: true },
    { label: "Algorithms", done: true },
    { label: "DBMS", done: false, active: true },
    { label: "OS\nConcepts", done: false },
    { label: "Networking", done: false },
    { label: "System\nDesign", done: false },
    { label: "Portfolio", done: false },
  ];

  const communityCards = [
    { id: "mentorship", label: "Industry Mentorship", desc: "1-on-1 sessions with senior engineers", req: "1,500 Coins or PASS", icon: "🤝", accent: "#6c63ff" },
    { id: "project-collab", label: "Project Collab", desc: "Build production apps with peers", req: "Intermediate Level + 1 Project", icon: "🚀", accent: "#f7971e" },
    { id: "alumni-network", label: "Alumni Network", desc: "Direct referral access to placed seniors", req: "2,000 XP or Store Pass", icon: "🌐", accent: "#00c9a7" },
    { id: "events", label: "Events & Summits", desc: "Live workshops, webinars & hackathons", req: "500 XP + Verified Email", icon: "🎪", accent: "#e040fb" },
    { id: "hack-squad", label: "Hack Squad", desc: "Lead or join institutional coding squads", req: "Top 20% CRI Score", icon: "⚔️", accent: "#ef4444" }
  ];

  const techNews = [
    { title: "DeepMind Releases AlphaCode 3 with Advanced Reasoning", category: "AI & ML", time: "2h ago", col: "#6c63ff" },
    { title: "React 19 Official Release Candidate Announced", category: "Web Dev", time: "4h ago", col: "#00c9a7" },
    { title: "Quantum Computing Milestone: 1000-Qubit Processor Live", category: "Hardware", time: "6h ago", col: "#f7971e" }
  ];

  const handleAddWidget = (widget) => {
    if (!activeWidgets.some(w => w.id === widget.id)) {
      setActiveWidgets([...activeWidgets, widget]);
    }
  };

  const handleRemoveWidget = (widgetId) => {
    setActiveWidgets(activeWidgets.filter(w => w.id !== widgetId));
  };

  // Separate special colored cards from standard cards
  const specialActiveCards = activeWidgets.filter(w => w.specialColor);
  const standardActiveCards = activeWidgets.filter(w => !w.specialColor);

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      
      {/* 1. TOP METRICS & USER CAREER GOAL BANNER */}
      <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 24, padding: "24px 28px", marginBottom: 28, boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid var(--border-light)" }}>
          
          {/* User Profile Info */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #6c63ff, #00c9a7)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, color: "#fff", flexShrink: 0, boxShadow: "0 6px 20px rgba(108,99,255,0.3)" }}>
              🎓
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
                  Welcome back, {user.name}!
                </h1>
                <span style={{ padding: "4px 10px", borderRadius: 20, background: "rgba(108,99,255,0.12)", border: "1px solid #6c63ff40", color: "#6c63ff", fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 700 }}>
                  LEVEL {user.level}
                </span>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "4px 0 0" }}>{user.degree} · {user.institute}</p>
            </div>
          </div>

          {/* XP, Points & Coins Metrics (Moved out of top bar / sidebar as requested) */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(108,99,255,0.1)", border: "1px solid #6c63ff40", padding: "10px 16px", borderRadius: 16 }}>
              <Zap size={18} color="#6c63ff" />
              <div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "var(--text-muted)", fontWeight: 700 }}>TOTAL XP</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, color: "#6c63ff" }}>{user.xp} XP</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(247,151,30,0.1)", border: "1px solid #f7971e40", padding: "10px 16px", borderRadius: 16 }}>
              <Coins size={18} color="#f7971e" />
              <div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "var(--text-muted)", fontWeight: 700 }}>COINS</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, color: "#f7971e" }}>{user.coins}</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(239,68,68,0.1)", border: "1px solid #ef444440", padding: "10px 16px", borderRadius: 16 }}>
              <Flame size={18} color="#ef4444" />
              <div>
                <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "var(--text-muted)", fontWeight: 700 }}>STREAK</div>
                <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, color: "#ef4444" }}>{user.streak} Days</div>
              </div>
            </div>
          </div>
        </div>

        {/* Target Career Goal Details */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 700, color: "#00c9a7", letterSpacing: 1, marginBottom: 4 }}>
              TARGET CAREER GOAL
            </div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "var(--text-main)" }}>
              {user.goal.role} <span style={{ color: "var(--text-muted)", fontSize: 14, fontWeight: 500 }}>({user.goal.tag})</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {user.goal.skills.map((sk, idx) => (
              <span key={idx} style={{ padding: "5px 12px", borderRadius: 12, background: "var(--bg-alt)", border: "1px solid var(--border-light)", fontSize: 12, fontWeight: 600, color: "var(--text-main)" }}>
                {sk}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. EXPERIENCE-BASED AI DAILY MOTIVATIONAL QUOTE BANNER */}
      <QuoteBanner userLevel={user.level} userStreak={user.streak} />

      {/* 3. CRI SCORE GAUGE & ACTIVITY HEATMAP */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginBottom: 28 }}>
        
        {/* CRI Score Gauge Card */}
        <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 20, padding: 24, textAlign: "center", position: "relative" }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 700, color: "#6c63ff", letterSpacing: 1, marginBottom: 12 }}>
            CAREER READINESS INDEX
          </div>
          
          <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto 12px" }}>
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="54" fill="none" stroke="var(--border-light)" strokeWidth="10" />
              <circle cx="70" cy="70" r="54" fill="none" stroke="#6c63ff" strokeWidth="10" strokeDasharray="339" strokeDashoffset={339 - (339 * user.cri) / 100} strokeLinecap="round" transform="rotate(-90 70 70)" style={{ transition: "stroke-dashoffset 1.5s ease" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 32, fontWeight: 800, color: "#6c63ff", lineHeight: 1 }}>{user.cri}%</span>
              <span style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, color: "var(--text-muted)" }}>GLOBAL SCORE</span>
            </div>
          </div>

          <div style={{ fontSize: 13, color: "var(--text-muted)" }}>
            Top 15% percentile among B.Tech candidates nationwide.
          </div>
        </div>

        {/* Career Journey Activity Heatmap */}
        <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 20, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 700, color: "#00c9a7", letterSpacing: 1 }}>
              CONSISTENCY HEATMAP
            </div>
            <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Last 14 Weeks</span>
          </div>

          {/* Heatmap Cell Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(14, 1fr)", gap: 6, marginBottom: 16 }}>
            {Array.from({ length: 98 }).map((_, idx) => {
              const activeLevels = ["var(--bg-alt)", "rgba(108,99,255,0.3)", "rgba(108,99,255,0.6)", "#6c63ff", "#00c9a7"];
              const randomCol = activeLevels[idx % 5];
              return (
                <div
                  key={idx}
                  style={{ width: "100%", aspectRatio: "1", borderRadius: 4, background: randomCol, transition: "transform 0.2s" }}
                  title={`Day ${idx + 1}: Activity recorded`}
                />
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11, color: "var(--text-muted)", fontFamily: "'Fira Code', monospace" }}>
            <span>Less Active</span>
            <div style={{ display: "flex", gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--bg-alt)" }} />
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(108,99,255,0.4)" }} />
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "#6c63ff" }} />
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "#00c9a7" }} />
            </div>
            <span>More Active</span>
          </div>
        </div>
      </div>

      {/* 4. VISUAL SKILL NODE ROADMAP TIMELINE */}
      <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 20, padding: 24, marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 700, color: "#6c63ff", letterSpacing: 1 }}>
            4-YEAR SKILL NODE TIMELINE
          </div>
          <span style={{ fontSize: 12, color: "#00c9a7", fontWeight: 700 }}>Stage 4 of 8 Active</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", overflowX: "auto", paddingBottom: 10, gap: 12 }}>
          {roadmapNodes.map((node, idx) => (
            <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 70 }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: node.active ? 10 : 13,
                background: node.done ? "linear-gradient(135deg, #00c9a7, #6c63ff)" : node.active ? "linear-gradient(135deg, #6c63ff, #f7971e)" : "var(--bg-alt)",
                color: node.done || node.active ? "#ffffff" : "var(--text-muted)",
                border: !node.done && !node.active ? "1.5px solid var(--border-light)" : "none",
                boxShadow: node.done ? "0 4px 14px rgba(0,201,167,0.3)" : node.active ? "0 0 0 4px rgba(108,99,255,0.25)" : "none"
              }}>
                {node.done ? "✓" : node.active ? "NOW" : idx + 1}
              </div>
              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, color: node.done ? "#00c9a7" : node.active ? "#6c63ff" : "var(--text-muted)", textAlign: "center", whiteSpace: "pre-line", fontWeight: node.active ? 700 : 500 }}>
                {node.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. WORKSPACE MODULE (SPECIAL CARDS ROW + STANDARD CARDS GRID + HOVER DESCRIPTIONS) */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
              Custom Workspace
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>Add, configure, or hover over feature widgets below.</p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 14,
              background: "linear-gradient(135deg, #6c63ff, #00c9a7)", border: "none", color: "#ffffff",
              fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 800, cursor: "pointer",
              boxShadow: "0 6px 20px rgba(108,99,255,0.3)"
            }}
          >
            <Plus size={16} /> Add Feature Widget
          </button>
        </div>

        {/* Dedicated Row for Special Colored Cards */}
        {specialActiveCards.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700, color: "#b45309", letterSpacing: 1, marginBottom: 10 }}>
              SPECIAL FEATURE CARDS
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {specialActiveCards.map(card => (
                <div
                  key={card.id}
                  onMouseEnter={() => setHoveredCardId(card.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                  style={{
                    background: card.bg, border: `2px solid ${card.border}`, borderRadius: 20, padding: 20,
                    position: "relative", overflow: "hidden", transition: "all 0.3s ease",
                    transform: hoveredCardId === card.id ? "translateY(-4px)" : "none",
                    boxShadow: hoveredCardId === card.id ? `0 12px 30px ${card.accent}30` : "none"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>{card.icon}</span>
                    <button onClick={() => handleRemoveWidget(card.id)} style={{ background: "none", border: "none", cursor: "pointer", color: card.accent, fontSize: 12, fontWeight: 700 }}>✕</button>
                  </div>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>{card.label}</h3>
                  <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4, margin: 0 }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Standard Workspace Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {standardActiveCards.map(card => (
            <div
              key={card.id}
              onMouseEnter={() => setHoveredCardId(card.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              style={{
                background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 20, padding: 20,
                position: "relative", overflow: "hidden", transition: "all 0.3s ease",
                transform: hoveredCardId === card.id ? "translateY(-4px)" : "none",
                boxShadow: hoveredCardId === card.id ? "0 12px 30px rgba(108,99,255,0.15)" : "none"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 28 }}>{card.icon}</span>
                <button onClick={() => handleRemoveWidget(card.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 12 }}>✕</button>
              </div>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 18, fontWeight: 800, color: "var(--text-main)", marginBottom: 6 }}>{card.label}</h3>
              
              {/* Rich Description on Hover */}
              <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4, margin: 0 }}>
                {card.desc}
              </p>
            </div>
          ))}

          {/* Default Empty State + Card */}
          <div
            onClick={() => setIsAddModalOpen(true)}
            style={{
              background: "var(--bg-alt)", border: "2px dashed var(--border-light)", borderRadius: 20, padding: 30,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              cursor: "pointer", minHeight: 180, transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#6c63ff"; e.currentTarget.style.background = "rgba(108,99,255,0.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.background = "var(--bg-alt)"; }}
          >
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(108,99,255,0.12)", border: "1px solid #6c63ff40", display: "flex", alignItems: "center", justifyContent: "center", color: "#6c63ff", marginBottom: 12 }}>
              <Plus size={22} />
            </div>
            <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: 15, fontWeight: 800, color: "var(--text-main)" }}>Add Feature Widget</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Click to browse available modules</div>
          </div>
        </div>
      </div>

      {/* 6. COLLABORATION & COMMUNITIES SECTION (LOCKED STORE POPUP FLOW) */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 24, fontWeight: 800, color: "var(--text-main)", margin: 0 }}>
            Collaboration & Communities
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>Connect with industry mentors, peer squads, and alumni.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          {communityCards.map(item => (
            <div
              key={item.id}
              onClick={() => setLockedModalFeature(item)}
              style={{
                background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 18, padding: 20,
                cursor: "pointer", transition: "all 0.3s ease", position: "relative"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = item.accent; e.currentTarget.style.transform = "translateY(-3px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-light)"; e.currentTarget.style.transform = "none"; }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 28 }}>{item.icon}</span>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(239,68,68,0.15)", border: "1px solid #ef4444", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444" }}>
                  <Lock size={13} />
                </div>
              </div>

              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 16, fontWeight: 800, color: "var(--text-main)", marginBottom: 4 }}>{item.label}</h3>
              <p style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4, margin: "0 0 12px" }}>{item.desc}</p>

              <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 9, fontWeight: 700, color: item.accent, display: "flex", alignItems: "center", gap: 4 }}>
                UNLOCK REQUIREMENT <ChevronRight size={10} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. LIVE TECH NEWS FEED */}
      <div style={{ background: "var(--bg-card)", border: "1.5px solid var(--border-light)", borderRadius: 20, padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontFamily: "'Fira Code', monospace", fontSize: 11, fontWeight: 700, color: "#6c63ff", letterSpacing: 1 }}>
            LIVE TECH & ENGINEERING HEADLINES
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>Updated hourly</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {techNews.map((news, idx) => (
            <div key={idx} style={{ background: "var(--bg-alt)", border: "1px solid var(--border-light)", borderRadius: 14, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ padding: "2px 8px", borderRadius: 6, background: `${news.col}20`, color: news.col, fontFamily: "'Fira Code', monospace", fontSize: 10, fontWeight: 700 }}>
                  {news.category}
                </span>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{news.time}</span>
              </div>
              <h4 style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700, color: "var(--text-main)", margin: 0, lineHeight: 1.4 }}>
                {news.title}
              </h4>
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

    </DashboardLayout>
  );
}
